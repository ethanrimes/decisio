import { Tile, Topic } from "@/types";
import { getChatResponse } from "@/lib/openai";

export async function generateBotResponse(tiles: Tile[], selectedTopic: Topic): Promise<string> {
  // Debugging: Log the tiles and selectedTopic
  console.log("Generating bot response for topic:", selectedTopic);
  console.log("Tiles received:", tiles);

  // Check if tiles is an array
  if (!Array.isArray(tiles)) {
    console.error("Tiles is not an array");
    throw new Error("Invalid tiles data");
  }

  // Collapse all TileContent into a single string
  const collapsedContent = tiles.map(tile => {
    // Debugging: Log each tile
    console.log("Processing tile:", tile);

    // Always include the section name
    let sectionContent = `Section: ${tile.sectionName}`;

    // If contents exist and is an array, add the bullet points
    if (tile.contents && Array.isArray(tile.contents) && tile.contents.length > 0) {
      sectionContent += '\n' + tile.contents
        .map(content => `- ${content.content}`)
        .join('\n');
    }

    return sectionContent;
  }).join("\n\n");

  // Construct the query
  const query = `
    You are an AI assistant helping a user with the topic: "${selectedTopic.fullName}".
    Here is the current information we have:
    ${collapsedContent}

    Based on this information, what additional details would help you make more informed recommendations?
    Please ask a question that will prompt the user to provide valuable information.
  `;

  // Use getChatResponse to generate the question
  const generatedQuestion = await getChatResponse(query, 4000, "gpt-4o");

  if (generatedQuestion === null) {
    throw new Error('Failed to generate a valid question');
  }

  return generatedQuestion;
}
