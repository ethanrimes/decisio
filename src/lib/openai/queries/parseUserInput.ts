import { Tile, TileContent, NewTile } from "@/types";
import { getChatResponse } from "@/lib/openai";

async function getUserInputResponse(userResponse: string, topic: string, existingBuckets: Tile[]): Promise<string> {
  // Internal function to format buckets into the required format for the prompt
  function formatBuckets(buckets: Tile[]): string {
    return buckets.map((bucket) => `- ${bucket.sectionName}\n  - ${bucket.contents.map(content => content.content).join("\n  - ")}`).join("\n");
  }

  // Extract and format the existing buckets
  const formattedBuckets = formatBuckets(existingBuckets);

  const prompt = `
    You are summarising user input and organizing it into categories.

    ### Input:
    1. **Topic:** "${topic}"
    2. **Existing Buckets:** 
    ${formattedBuckets}
    3. **User Input:** "${userResponse}"

    ### Instructions:
    1.	Use Only Provided Information:
	  - All bullet points must be directly derived only from the user input.
	  - Do not speculate, infer, or add information not explicitly stated in the user input. For example, avoid creating bullets like “Consider whether increasing gum chewing will affect your daily habits or routines” unless the input explicitly mentions daily habits.
	2.	Parse into Bullet Points:
	  - Create concise, full-sentence bullet points directly relevant to the user's input.
	  - Avoid empty bullets or those that rephrase the topic itself. For example, for the topic “How can I become a ballerina?” avoid creating bullets like “Learn how to become a ballerina.”
	3.	Avoid Redundancy:
	  - Strictly do not include bullets that already exist verbatim or with slight rephrasing in the existing buckets.
	4.	Organize into Buckets:
	  - Assign each bullet to the most relevant existing bucket.
	  - If a bullet does not fit into an existing bucket, place it in a new bucket under the section “New Buckets.”
	  - Strictly do not create new buckets that duplicate existing ones or combine them.
    5. All bullets must be a full sentence and:
      - Start with a capital letter.
      - End with a period.
      - Be clear, relevant, and avoid redundancy.
    6. All generated bullets MUST contain information supplied by the user. Do not include output information that is not contained in the user input.

    ### Examples of Allowed and Disallowed Outputs:
    Allowed:
      - If the input states, “I enjoy solving complex problems, working in teams, and learning new technologies” you can generate: “I enjoy learning new technologies.”
    Disallowed:
      - Speculating or adding unrelated information: “I enjoy music and reading."
      - Answers to the topic question or analysis: "Evaluate the potential health risks of chewing more gum." or "Chewing gum may help improve focus."
    
    ### Output Format:
    **Section 1:** Existing Buckets
    - {Existing Bucket 1}
      - Full sentence bullet 1.
      - Full sentence bullet 2.
    - {Existing Bucket 2}
      - Full sentence bullet 3.
      - Full sentence bullet 4.
    ---END---
    
    **Section 2:** New Buckets
    - {New Bucket Name 1}
      - Full sentence bullet 5.
      - Full sentence bullet 6.
    - {New Bucket Name 2}
      - Full sentence bullet 7.
      - Full sentence bullet 8.
    ---END---
  `;

  // Call the OpenAI API using the `getChatResponse` function
  const response = await getChatResponse(prompt, 4000, "gpt-4o");

  console.log("response: ", response);
  if (!response) {
    throw new Error('Failed to get chat response');
  }

  return response;
}

export async function parseUserInputResponse(response: string, existingBuckets: Tile[]): Promise<{ patchedTiles: { tile: Tile; newContent: TileContent[] }[], newTiles: NewTile[] }> {
  const sections = response.split('---END---').map((section) => section.trim());
  const patchedTiles: { tile: Tile; newContent: TileContent[] }[] = [];
  const newTiles: NewTile[] = [];

  if (sections.length >= 2) {
    const [existingSection, newSection] = sections;

    // Parse existing buckets by index
    const existingBucketLines = existingSection.split("\n").filter(line => line.trim());
    let currentBucketIndex = -1;
    let currentNewContent: TileContent[] = [];

    for (const line of existingBucketLines) {
      if (line.startsWith("- ")) {
        // Store the previous bucket's new content if any
        if (currentBucketIndex !== -1 && currentNewContent.length > 0) {
          patchedTiles.push({
            tile: existingBuckets[currentBucketIndex],
            newContent: currentNewContent
          });
        }

        // Get the new bucket index
        const bucketMatch = line.match(/- (.+)/);
        if (bucketMatch) {
          const bucketName = bucketMatch[1].trim().toLowerCase(); // Normalize the bucket name
          currentBucketIndex = existingBuckets.findIndex(bucket => bucket.sectionName.trim().toLowerCase() === bucketName);
          console.log(`Matching bucket name: ${bucketName}, Index found: ${currentBucketIndex}`);
          if (currentBucketIndex === -1) {
            console.error(`No matching bucket found for name: ${bucketName}`);
          }
          currentNewContent = [];
        }
      } else if (line.startsWith("  - ")) {
        if (currentBucketIndex !== -1) {
          currentNewContent.push({ id: "", content: line.replace("  - ", "").trim(), createdAt: new Date(), modifiedAt: new Date(), tileId: existingBuckets[currentBucketIndex].id });
        } else {
          console.error(`Attempting to add content to an undefined bucket: ${line}`);
        }
      }
    }

    // Push the last bucket's new content if applicable
    if (currentBucketIndex !== -1 && currentNewContent.length > 0) {
      patchedTiles.push({
        tile: existingBuckets[currentBucketIndex],
        newContent: currentNewContent
      });
    }

    // Parse new buckets and bullets
    const newBucketLines = newSection.split("\n").filter(line => line.trim());
    let currentNewBucketName = "";
    let currentNewBucketContent: string[] = [];

    for (const line of newBucketLines) {
      if (line.startsWith("- ")) {
        // Store the previous new bucket's contents if any
        if (currentNewBucketName && currentNewBucketContent.length > 0) {
          newTiles.push({
            sectionName: currentNewBucketName,
            topicId: existingBuckets[0].topicId, // Assume topicId is shared across tiles
            contents: currentNewBucketContent,
          });
        }

        // Get the new bucket name
        currentNewBucketName = line.replace("- ", "").trim();
        currentNewBucketContent = [];
      } else if (line.startsWith("  - ")) {
        currentNewBucketContent.push(line.replace("  - ", "").trim());
      }
    }

    // Push the last new bucket if applicable
    if (currentNewBucketName && currentNewBucketContent.length > 0) {
      newTiles.push({
        sectionName: currentNewBucketName,
        topicId: existingBuckets[0].topicId,
        contents: currentNewBucketContent,
      });
    }
  }

  return { patchedTiles, newTiles };
}

export async function parseUserInput(userResponse: string, topic: string, tiles: Tile[]): Promise<{ patchedTiles: { tile: Tile; newContent: TileContent[] }[], newTiles: NewTile[] }> {
//   const sectionNames = tiles.map(tile => tile.sectionName);
  const response = await getUserInputResponse(userResponse, topic, tiles);
  return parseUserInputResponse(response, tiles);
}