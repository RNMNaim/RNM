import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: "arib-api",
  location: "us-central1",
  googleAuthOptions: {
    credentials: JSON.parse(process.env.SERVICE_ACCOUNT as any),
  },
});
const model = "gemini-1.0-pro-vision-001";

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generation_config: {
    max_output_tokens: 2048,
    temperature: 0.4,
    top_p: 1,
    top_k: 32,
  },
  safety_settings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ] as any,
});

export async function generateTextFromMultiData(
  base64Images: string[],
  text: string[]
) {
  const req = {
    contents: [
      {
        role: "user",
        parts: [
          ...base64Images.map((base64) => ({
            inline_data: { mime_type: "image/png", data: base64 },
          })),
          ...text.map((text) => ({ text: text })),
        ],
      },
    ],
  };

  const streamingResp = await generativeModel.generateContent(req);

  return streamingResp.response?.candidates[0]?.content?.parts[0].text?.trim()??"";
}
