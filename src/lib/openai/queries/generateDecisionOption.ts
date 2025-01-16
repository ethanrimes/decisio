import { getChatResponse } from '../index';
import { DecisionOption } from '@/types';

export async function generateDecisionOptions(
  topic: string,
  previousRecommendations: DecisionOption[],
  userInformation: string[],
  topicId: string
): Promise<DecisionOption[]> {
  // Process previous recommendations to extract names
  const previousRecommendationNames = previousRecommendations
    .map(rec => rec.name)
    .filter(name => name) // Filter out undefined/null names
    .join(', ');

  // Process user information - now just joining the string array
  const userInformationContent = userInformation
    .filter(content => content && content.trim() !== '') // Filter out empty strings
    .join(', ');

  const previousRecommendationsString = previousRecommendationNames 
    ? `Previous recommendations include: ${previousRecommendationNames}.` 
    : 'No previous recommendations.';

  const userInformationString = userInformationContent
    ? `User information: ${userInformationContent}.`
    : 'No user information available.';

  const prompt = `
    Given the goal the user is trying to achieve "${topic}", generate a unique recommendation that is different from the following recommendations: 
    ${previousRecommendationsString}

Use the following user information to tailor the recommendation: 
${userInformationString}

The decision option should be formatted as follows:

Decision Option:
- Name: [Insert Name]
- Description: [Insert Description]

Fit Reasons:
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]
4. [Reason 4]

Metrics:
- [Metric Name]: [Metric Value]

Implementation Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Timeline:
- [Time Period]: [Milestone/Goal]

Please ensure the recommendation is unique and tailored to the user's specific needs and preferences.
`;

    // console.log('Prompt:', prompt);

  try {
    const response = await getChatResponse(prompt, 1500, 'gpt-4o');
    console.log('Response:', response);
    const parsedOptions = parseResponse(response, topicId);
    return parsedOptions;
  } catch (error) {
    console.error('Error generating decision options:', error);
    return [];
  }
}

function parseResponse(response: string, topicId: string): DecisionOption[] {
    const options: DecisionOption[] = [];
    // Remove "Response: " prefix if it exists before splitting
    const cleanResponse = response.replace(/^Response:\s*/, '');
    const sections = cleanResponse.split("Decision Option:").slice(1);

    for (const section of sections) {
        try {
            // Name and Description with better regex
            const nameMatch = section.match(/- Name:\s*([^\n]+)/);
            const descriptionMatch = section.match(/- Description:\s*([^\n]+)/);
            
            // Fit Reasons - adjust to match exact format
            const fitReasonsMatch = section.match(/Fit Reasons:\n([\s\S]*?)(?=\nMetrics:)/);
            const fitReasons = fitReasonsMatch 
                ? fitReasonsMatch[1]
                    .split('\n')
                    .map(reason => reason.replace(/^\d+\.\s*/, '').trim())
                    .filter(Boolean)
                : [];

            // Metrics - adjust to match bullet point format
            const metricsMatch = section.match(/Metrics:\n([\s\S]*?)(?=\nImplementation Steps:)/);
            const metrics = metricsMatch
                ? metricsMatch[1]
                    .split('\n')
                    .map(metric => metric.replace(/^-\s*/, '').trim())
                    .filter(Boolean)
                : [];

            // Implementation Steps
            const stepsMatch = section.match(/Implementation Steps:\n([\s\S]*?)(?=\nTimeline:)/);
            const implementationSteps = stepsMatch
                ? stepsMatch[1]
                    .split('\n')
                    .map(step => step.replace(/^\d+\.\s*/, '').trim())
                    .filter(Boolean)
                : [];

            // Timeline
            const timelineMatch = section.match(/Timeline:\n([\s\S]*?)(?=$|\n\n)/);
            const timeline = timelineMatch
                ? timelineMatch[1]
                    .split('\n')
                    .map(item => item.replace(/^-\s*/, '').trim())
                    .filter(Boolean)
                : [];

            const option: DecisionOption = {
                id: "",
                name: nameMatch ? nameMatch[1].trim() : "Untitled Option",
                description: descriptionMatch ? descriptionMatch[1].trim() : "",
                fitReasons,
                metrics,
                implementationSteps,
                timeline,
                topicId
            };

            options.push(option);
        } catch (error) {
            console.error("Error parsing section:", error);
        }
    }

    return options;
}