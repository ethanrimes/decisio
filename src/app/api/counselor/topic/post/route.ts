import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getCreateTopicResponse } from '@/lib/openai/queries/createTopic'
import { createNewTile } from '@/app/api/counselor/tile/post/route'
import { parseUserInput } from '@/lib/openai/queries/parseUserInput'
import { generateBotResponse } from '@/lib/openai/queries/generateBotResponse'

export async function POST(request: Request) {
    try {
      console.log('Topic POST: Starting request');
      
      const [user, body] = await Promise.all([
        getCurrentUser(),
        request.json()
      ]);
      console.log('Topic POST: User authentication status:', !!user);
      console.log('Topic POST: Request body:', {
        fullName: body.fullName
      });

      if (!user || !user.id) {
        console.log('Topic POST: Unauthorized - no user');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { summary, iconName, categories } = await getCreateTopicResponse(body.fullName);

      if (!summary || !iconName) {
        console.log('Topic POST: Missing summary or icon');
        return new NextResponse(JSON.stringify({ error: 'Failed to generate summary or icon' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('Topic POST: Creating topic');
      const topic = await prisma.topic.create({
        data: {
          fullName: body.fullName,
          shortName: summary,
          icon: iconName,
          userId: user.id,
        }
      });
      console.log('Topic POST: Topic created:', topic.id);

      // Parallelize welcome message creation and tile creation
      console.log('Topic POST: Creating welcome message and tiles in parallel');
      const [welcomeMessage, createdTiles] = await Promise.all([
        // Create welcome message
        prisma.message.create({
          data: {
            content: "Hello! I'm your AI decision coach. I'll help you analyze your options and make better decisions. Feel free to share your thoughts or ask questions about your decision-making process.",
            role: 'a',
            topicId: topic.id,
          }
        }),

        // Create tiles for each category
        Promise.all(
          categories?.map(async (category) => {
            try {
              console.log('Topic POST: Creating tile for category:', category);
              return await createNewTile(category, user.id, topic.id, []);
            } catch (tileError) {
              console.error('Topic POST: Error creating tile:', {
                category,
                error: tileError
              });
              return null;
            }
          }) || []
        )
      ]);

      console.log('Topic POST: Welcome message created');
      console.log('Topic POST: Created tiles count:', createdTiles.filter(Boolean).length);

      // Filter out any null tiles and parse user input
      const validTiles = createdTiles.filter(Boolean);
      console.log('Topic POST: Parsing user input');
      const { patchedTiles, newTiles } = await parseUserInput(body.fullName, topic, validTiles);
      console.log('Topic POST: Parse results:', {
        patchedTilesCount: patchedTiles.length,
        newTilesCount: newTiles.length
      });

      // Update existing tiles with the generated bullets
      console.log('Topic POST: Updating tiles with content');
      await Promise.all(
        patchedTiles.map(async ({ tile, newContent }) => {
          return Promise.all(
            newContent.map(content => 
              prisma.tileContent.create({
                data: {
                  content: content.content,
                  tileId: tile.id,
                },
              })
            )
          );
        })
      );

      // Fetch updated tiles
      console.log('Topic POST: Fetching updated tiles');
      const updatedTiles = await prisma.tile.findMany({
        where: { topicId: topic.id },
        include: { contents: true }
      });

      // Generate and create bot response
      console.log('Topic POST: Generating and creating bot response');
      // Generate bot response first
      const botQuestion = await generateBotResponse(updatedTiles, topic);

        // Then, create the bot message using the generated botQuestion
        await prisma.message.create({
            data: {
                content: botQuestion, // Now botQuestion is properly initialized
                role: 'a',
                topicId: topic.id,
            }
        });

      console.log('Topic POST: Request completed successfully');
      return new NextResponse(JSON.stringify(topic), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Topic POST: Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        type: typeof error
      });

      return new NextResponse(JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}