import { openaiClient } from "./client";

export async function getChatResponse(prompt: string, maxTokens: number, model: string, systemQuery?: string) {
  const messages: { role: string; content: string; name?: string }[] = [];
  
  if (systemQuery) {
    messages.push({ role: "system", content: systemQuery });
  }
  
  messages.push({ role: "user", content: prompt });

  const response = await openaiClient.chat.completions.create({
    model: model,
    messages: messages as any, // Cast to any to bypass type checking for now
    max_tokens: maxTokens,
  });
  
  return response.choices[0].message.content;
}