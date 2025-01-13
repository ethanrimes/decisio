import { Tile } from "@/types";
import { getChatResponse } from "@/lib/openai";

async function getUserInputResponse(userResponse: string, topic: string, existingBuckets: Tile[]) {
  // Internal function to format buckets into the required format for the prompt
  function formatBuckets(buckets: Tile[]): string {
    return buckets.map((bucket) => `- ${bucket.sectionName}\n  - ${bucket.content.join("\n  - ")}`).join("\n");
  }

  // Extract and format the existing buckets
  const formattedBuckets = formatBuckets(existingBuckets);

  const prompt = `
    You are parsing user input and organizing it into structured categories.

    ### Input:
    1. **Topic:** "${topic}"
    2. **Existing Buckets:** 
    ${formattedBuckets}
    3. **User Input:** "${userResponse}"

    ### Instructions:
    1. Split the user input into concise bullet points.
    2. Attribute each bullet to the most relevant existing bucket if possible.
    3. If a bullet does not fit into any existing bucket, create a new bucket.
    4. Ensure there is no redundant information.
    
    ### Output Format:
    **Section 1:** Existing Buckets
    - {Existing Bucket 1}
      - Bullet 1
      - Bullet 2
    - {Existing Bucket 2}
      - Bullet 3
      - Bullet 4
    ---END---
    
    **Section 2:** New Buckets
    - {New Bucket Name 1}
      - Bullet 5
      - Bullet 6
    - {New Bucket Name 2}
      - Bullet 7
      - Bullet 8
    ---END---
  `;

  // Call the OpenAI API using the `getChatResponse` function
  const response = await getChatResponse(prompt, 4000, "gpt-4o");

  return response;
}



export function parseUserInput(response: string, existingBuckets: Tile[]): { patchedTiles: { tile: Tile; newContent: string[] }[], newTiles: Tile[] } {
  
  
    const sections = response.split('---END---').map((section) => section.trim());
  const patchedTiles: { tile: Tile; newContent: string[] }[] = [];
  const newTiles: Tile[] = [];

  if (sections.length >= 2) {
    const [existingSection, newSection] = sections;

    // Parse existing buckets by index
    const existingBucketLines = existingSection.split("\n").filter(line => line.trim());
    let currentBucketIndex = -1;
    let currentNewContent: string[] = [];

    for (const line of existingBucketLines) {
      if (line.startsWith("- Bucket ")) {
        // Store the previous bucket's new content if any
        if (currentBucketIndex !== -1 && currentNewContent.length > 0) {
          patchedTiles.push({
            tile: existingBuckets[currentBucketIndex],
            newContent: currentNewContent
          });
        }

        // Get the new bucket index
        const bucketMatch = line.match(/- Bucket (\d+):/);
        if (bucketMatch) {
          currentBucketIndex = parseInt(bucketMatch[1], 10);
          currentNewContent = [];
        }
      } else if (line.startsWith("  - ")) {
        currentNewContent.push(line.replace("  - ", "").trim());
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
            id: "", // Will be generated in the database
            sectionName: currentNewBucketName,
            content: currentNewBucketContent,
            understanding: 0,
            topicId: existingBuckets[0].topicId, // Assume topicId is shared across tiles
            createdAt: new Date(),
            updatedAt: new Date(),
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
        id: "",
        sectionName: currentNewBucketName,
        content: currentNewBucketContent,
        understanding: 0,
        topicId: existingBuckets[0].topicId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return { patchedTiles, newTiles };
}