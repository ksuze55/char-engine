import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export function chunkText(text: string, chunkSize = 1000) {
  const chunks: string[] = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}

export function createMockEmbedding(text: string) {
  const vector = Array.from({ length: 32 }, (_, index) => {
    const charCode = text.charCodeAt(index % text.length) || 0;
    return charCode / 255;
  });

  return vector;
}

export async function createEmbedding(text: string) {
  if (process.env.USE_MOCK_EMBEDDINGS === "true") {
    return createMockEmbedding(text);
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return response.data[0].embedding;
}