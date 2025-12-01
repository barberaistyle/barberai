import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to strip the data:image/...;base64, prefix
const stripBase64Prefix = (base64Str: string): string => {
  return base64Str.replace(/^data:image\/[a-z]+;base64,/, "");
};

export const generateNewHairstyle = async (
  base64Image: string,
  styleName: string,
  styleDescription: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const cleanBase64 = stripBase64Prefix(base64Image);

    // Using gemini-2.5-flash-image for image editing capabilities
    // It supports text + image prompts to modify the image.
    const model = 'gemini-2.5-flash-image';

    const prompt = `
      Edit this image. Change the person's hairstyle to a ${styleName}.
      Description of style: ${styleDescription}.
      IMPORTANT:
      - Keep the person's face, facial features, skin tone, and expression EXACTLY the same.
      - Keep the background, clothing, and lighting EXACTLY the same.
      - ONLY modify the hair.
      - The result should look photorealistic.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity, or we could detect
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    // Parse response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini.");
    }

    const firstCandidate = candidates[0];
    const parts = firstCandidate.content.parts;
    
    // Find the image part
    let resultImageBase64 = null;

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        resultImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!resultImageBase64) {
        // Fallback: sometimes models might return text if they refuse to generate image
        // Check for text refusal
        const textPart = parts.find(p => p.text);
        if (textPart) {
             throw new Error(`Model returned text instead of image: ${textPart.text}`);
        }
        throw new Error("No image data found in response.");
    }

    return `data:image/png;base64,${resultImageBase64}`;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
