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
      
      const user = await getCurrentUser();
      console.log('Topic POST: User authentication status:', !!user);

      if (!user || !user.id) {
        console.log('Topic POST: Unauthorized - no user');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json();
      console.log('Topic POST: Request body:', {
        fullName: body.fullName
      });

      console.log('Topic POST: Calling getCreateTopicResponse');
      const { summary, iconName, categories } = await getCreateTopicResponse(body.fullName);
      console.log('Topic POST: OpenAI response:', {
        summary,
        iconName,
        categoriesCount: categories?.length
      });

      if (!summary || !iconName) {
        console.log('Topic POST: Missing summary or icon');
        return new NextResponse(JSON.stringify({ error: 'Failed to generate summary or icon' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('Topic POST: Finding user in database');
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!dbUser) {
        console.log('Topic POST: User not found in database');
        return new NextResponse(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log('Topic POST: Creating topic');
      const topic = await prisma.topic.create({
        data: {
          fullName: body.fullName,
          shortName: summary,
          icon: iconName,
          userId: dbUser.id,
        }
      });
      console.log('Topic POST: Topic created:', topic.id);

      // Create tiles for each category and store them
      const createdTiles = [];
      if (categories && categories.length > 0) {
        console.log('Topic POST: Creating tiles for categories');
        for (const category of categories) {
          try {
            console.log('Topic POST: Creating tile for category:', category);
            const tile = await createNewTile(category, dbUser.id, topic.id, []);
            createdTiles.push(tile);
          } catch (tileError) {
            console.error('Topic POST: Error creating tile:', {
              category,
              error: tileError
            });
          }
        }
      }

      console.log('Topic POST: Parsing user input');
      const { patchedTiles, newTiles } = await parseUserInput(body.fullName, topic, createdTiles);
      console.log('Topic POST: Parse results:', {
        patchedTilesCount: patchedTiles.length,
        newTilesCount: newTiles.length
      });

      // Update existing tiles with the generated bullets
      console.log('Topic POST: Updating tiles with content');
      for (const { tile, newContent } of patchedTiles) {
        for (const content of newContent) {
          await prisma.tileContent.create({
            data: {
              content: content.content,
              tileId: tile.id,
            },
          });
        }
      }

      console.log('Topic POST: Creating welcome message');
      const welcomeMessage = await prisma.message.create({
        data: {
          content: "Hello! I'm your AI decision coach. I'll help you analyze your options and make better decisions. Feel free to share your thoughts or ask questions about your decision-making process.",
          role: 'a',
          topicId: topic.id,
        }
      });

      console.log('Topic POST: Fetching updated tiles');
      const updatedTiles = await prisma.tile.findMany({
        where: { topicId: topic.id },
        include: { contents: true }
      });

      console.log('Topic POST: Generating bot response');
      const botQuestion = await generateBotResponse(updatedTiles, topic);
      console.log('Topic POST: Bot response generated:', !!botQuestion);

      console.log('Topic POST: Creating bot message');
      const botMessage = await prisma.message.create({
        data: {
          content: botQuestion,
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

      // Ensure we're returning a valid object
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