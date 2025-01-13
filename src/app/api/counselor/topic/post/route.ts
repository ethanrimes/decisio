import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getCreateTopicResponse } from '@/lib/openai/queries/createTopic'
import { createNewTile } from '@/app/api/counselor/tile/post/route'
import { parseUserInput } from '@/lib/openai/queries/parseUserInput'
import { generateBotResponse } from '@/lib/openai/queries/generateBotResponse'

export async function POST(request: Request) {
    try {
      const user = await getCurrentUser();
      if (!user || !user.id) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = await request.json();
      const { summary, iconName, categories } = await getCreateTopicResponse(body.fullName);

      if (!summary || !iconName) {
        return new NextResponse(JSON.stringify({ error: 'Failed to generate summary or icon' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (!dbUser) {
        return new NextResponse(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Create topic
      const topic = await prisma.topic.create({
        data: {
          fullName: body.fullName,
          shortName: summary,
          icon: iconName,
          userId: dbUser.id,
        }
      });

      // Create tiles for each category and store them
      const createdTiles = [];
      for (const category of categories) {
        try {
          const tile = await createNewTile(category, dbUser.id, topic.id, []);
          createdTiles.push(tile);
        } catch (tileError) {
          console.error('Error creating tile for category:', category, tileError);
        }
      }

      // Parse the topic name to generate initial bullets for each category
      const { patchedTiles, newTiles } = await parseUserInput(body.fullName, topic, createdTiles);

      // Update existing tiles with the generated bullets
      for (const { tile, newContent } of patchedTiles) {
        for (const content of newContent) {
          await prisma.tileContent.create({
            data: {
              content: content.content,
              tileId: tile.id,
            }
          });
        }
      }

      // Create welcome message
      await prisma.message.create({
        data: {
          content: "Hello! I'm your AI decision coach. I'll help you analyze your options and make better decisions. Feel free to share your thoughts or ask questions about your decision-making process.",
          role: 'a',
          topicId: topic.id,
        }
      });

      // Generate and create first bot question based on the populated tiles
      const updatedTiles = await prisma.tile.findMany({
        where: { topicId: topic.id },
        include: { contents: true }
      });

      const botQuestion = await generateBotResponse(updatedTiles, topic);
      
      // Post the bot question to the database
      await prisma.message.create({
        data: {
          content: botQuestion,
          role: 'a',
          topicId: topic.id,
        }
      });

      return new NextResponse(JSON.stringify(topic), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Unhandled error:', error);
      return new NextResponse(JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
}