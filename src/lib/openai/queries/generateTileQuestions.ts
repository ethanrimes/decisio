import { getChatResponse } from "@/lib/openai";
import { Topic, TileContent } from "@/types";
import { GenerateTileQuestionsResponse } from "@/types";


export async function generateTileQuestions(
  topic: Topic,
  sectionName: string,
  tileContents: TileContent[]
): Promise<GenerateTileQuestionsResponse> {
  // Format the current knowledge from tile contents
  const currentKnowledge = tileContents
    .map(content => `• ${content.content}`)
    .join('\n');

  const prompt = `
You are analyzing information about the topic "${topic.shortName}" specifically focusing on the category "${sectionName}".

Current knowledge in this category:
${currentKnowledge || "No information gathered yet."}

Please provide a structured response in the following format:
UNDERSTANDING_LEVEL: [0-4]
QUESTION: [Your question]
SAMPLE_ANSWERS: [comma-separated list of brief answers]

Guidelines:
- Understanding Level:
  0: No information available
  1: Very limited understanding
  2: Moderate understanding
  3: Good understanding
  4: Deep/sufficient understanding for recommendations
- The user is attempting to make a decision about ${sectionName}. Question should help gather missing critical information to help give the user an informed recommendation. The question should be specific to the user. For example, ""What coding frameworks are you familiar with?"" is a valid question but ""What frameworks are exist/are popular?"" is not.
- The question should be a full sentence that begins with a capital letter and ends with a period.
- Sample answers should be brief nouns/phrases that users might select
- If understanding level is 4, leave question and sample answers blank

Evaluate the current knowledge and provide your response in the exact format specified above.`;

  const response = await getChatResponse(prompt, 1000, "gpt-4");

  // Parse the response
  if (!response) {
    throw new Error("No response from OpenAI");
  }

  const understandingMatch = response.match(/UNDERSTANDING_LEVEL: (\d)/);
  const questionMatch = response.match(/QUESTION: (.+)/);
  const sampleAnswersMatch = response.match(/SAMPLE_ANSWERS: (.+)/);

  const understanding = understandingMatch ? parseInt(understandingMatch[1]) : 0;
  const question = questionMatch ? questionMatch[1].trim() : "";
  const sampleAnswers = sampleAnswersMatch 
    ? sampleAnswersMatch[1].split(",").map(a => a.trim())
    : [];

  return {
    understanding,
    question: understanding === 3 ? "" : question,
    sampleAnswers: understanding === 3 ? [] : sampleAnswers
  };
}
