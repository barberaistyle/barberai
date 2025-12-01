import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  
  // Debug log (masked) to verify key presence in production
  if (apiKey) {
    console.log("API Key present:", apiKey.substring(0, 4) + "...");
  } else {
    console.error("API Key is MISSING in environment variables");
  }

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your Netlify Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateNewHairstyle = async (
  base64Image: string,
  styleName: string,
  styleDescription: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // 1. Detect the actual MIME type from the base64 header
    // Example header: data:image/png;base64,
    const mimeMatch = base64Image.match(/^data:(image\/[a-z]+);base64,/i);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    // 2. Clean the base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/i, "");

    console.log(`Generating with model: gemini-2.5-flash-image, Mime: ${mimeType}`);

    // Using gemini-2.5-flash-image for image editing capabilities
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
              mimeType: mimeType,
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
             console.error("Model refusal:", textPart.text);
             throw new Error(`Model Refusal: ${textPart.text.substring(0, 100)}...`);
        }
        throw new Error("No image data found in response.");
    }

    return `data:image/png;base64,${resultImageBase64}`;

  } catch (error: any) {
    console.error("Gemini API Error Full:", error);
    // Return a more user-friendly error message if possible
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API Key. Please check your settings.");
    }
    throw new Error(error.message || "Unknown error occurred during generation.");
  }
};