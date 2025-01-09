import { openaiClient } from "./client";

export async function getChatResponse(prompt: string, maxTokens: number) {
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content;
}