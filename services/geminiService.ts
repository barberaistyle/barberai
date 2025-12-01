import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  // API key must be obtained exclusively from process.env.API_KEY.
  // Assume it is pre-configured and valid.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper: Resize image to prevent payload too large errors
// and convert to JPEG for efficiency
const resizeImage = (base64Str: string, maxWidth = 1024): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with 0.8 quality
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      // If resizing fails, return original
      resolve(base64Str);
    }
  });
}

export const generateNewHairstyle = async (
  base64Image: string,
  styleName: string,
  styleDescription: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    
    // 1. Resize and Optimize Image
    const optimizedBase64 = await resizeImage(base64Image);
    const cleanBase64 = optimizedBase64.replace(/^data:image\/[a-z]+;base64,/i, "");

    console.log(`Generating: ${styleName}`);

    // Using gemini-2.5-flash-image for image editing capabilities
    const model = 'gemini-2.5-flash-image';

    const prompt = `
      Instructions: Replace the person's hair with a ${styleName}.
      Style details: ${styleDescription}.
      
      Strict Constraints:
      1. RETAIN the person's exact face, identity, skin tone, and expression.
      2. RETAIN the original background and lighting.
      3. The result must be photorealistic and seamlessly blended.
      4. Do not add accessories (glasses, hats) unless the style implies it.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        // Safety settings to allow face editing
        safetySettings: [
           { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
           { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
           { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
           { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No image generated. The AI might have been blocked by safety filters.");
    }

    const parts = candidates[0].content.parts;
    let resultImageBase64 = null;

    // Look for image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        resultImageBase64 = part.inlineData.data;
        break;
      }
    }

    if (!resultImageBase64) {
        const textPart = parts.find(p => p.text);
        if (textPart) {
             console.warn("Model response text:", textPart.text);
             throw new Error(`AI processing note: ${textPart.text.substring(0, 100)}...`);
        }
        throw new Error("The AI returned a response but it contained no image.");
    }

    return `data:image/png;base64,${resultImageBase64}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Helpful messages for common errors
    if (error.message?.includes("400")) {
      throw new Error("Image processing failed. The photo might be too large or the format is unsupported.");
    }
    
    throw new Error(error.message || "Unknown error occurred during generation.");
  }
};