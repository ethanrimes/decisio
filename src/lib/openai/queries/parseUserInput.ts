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
    You are parsing user input and organizing it into structured categories.

    ### Input:
    1. **Topic:** "${topic}"
    2. **Existing Buckets:** 
    ${formattedBuckets}
    3. **User Input:** "${userResponse}"

    ### Instructions:
    1. Parse the user input into concise bullet points.
    2. Assign each bullet to the most relevant existing bucket if possible.
    3. If a bullet does not fit into any existing bucket, create a new bucket.
    4. Avoid redundant information by not duplicating existing bullets or the topic name.
    5. Prefer assigning bullets to existing buckets over creating new ones.
    
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