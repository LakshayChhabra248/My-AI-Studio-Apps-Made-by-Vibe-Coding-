import { GoogleGenAI, Type } from "@google/genai";
import { AspectRatio, AdSize, AdCopy, GeneratedAd } from '../types';
import { STANDARD_AD_SIZES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A high-quality, photorealistic product shot for a banner ad. The product is described as: "${prompt}". The image should be clean, professional, and eye-catching with a simple background.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check the console for details.");
    }
};

export const generateAllAdCopies = async (productDescription: string, productUrl: string, tone: string): Promise<GeneratedAd[]> => {
    const adSizesString = STANDARD_AD_SIZES.map(s => `${s.name} (${s.width}x${s.height})`).join(', ');
    const prompt = `
        Based on the following product description and URL, generate compelling ad copy (a short, punchy headline and a clear call-to-action) for a set of standard banner ad sizes.

        Product Description: "${productDescription}"
        Product URL: "${productUrl}"

        The tone of the ad copy must be **${tone}**.

        Generate copy for these sizes: ${adSizesString}.
        The headline should be very concise and grab attention. The CTA should be a short phrase like "Shop Now", "Learn More", or "Get Offer", fitting the requested tone.
        Return the result as a JSON array.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            headline: {
                                type: Type.STRING,
                                description: "A short, punchy headline for the ad.",
                            },
                            cta: {
                                type: Type.STRING,
                                description: "A clear and concise call-to-action.",
                            },
                            sizeName: {
                                type: Type.STRING,
                                description: `The name of the ad size, must be one of: ${STANDARD_AD_SIZES.map(s => s.name).join(', ')}`,
                            },
                        },
                        required: ["headline", "cta", "sizeName"],
                    },
                },
            },
        });

        const adCopies: AdCopy[] = JSON.parse(response.text);

        // Map the generated copies back to the original AdSize objects
        const generatedAds: GeneratedAd[] = adCopies.map(copy => {
            const sizeInfo = STANDARD_AD_SIZES.find(s => s.name === copy.sizeName);
            if (!sizeInfo) {
                // Fallback if the model returns a weird name
                console.warn(`Could not find size for name: ${copy.sizeName}`);
                return null;
            }
            return {
                ...copy,
                size: sizeInfo,
            };
        }).filter((ad): ad is GeneratedAd => ad !== null);
        
        return generatedAds;

    } catch (error) {
        console.error("Error generating ad copy:", error);
        throw new Error("Failed to generate ad copy. Please check your prompt and API key.");
    }
};