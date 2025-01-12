import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getCreateTopicResponse } from '@/lib/openai/queries/createTopic'

export async function POST(request: Request) {
    try {
      // 1. Debug request
      console.log('Request method:', request.method);
      console.log('Request headers:', Object.fromEntries(request.headers));
  
      // 2. Check user authentication
      const user = await getCurrentUser();
      console.log('Current user:', user);
  
      if (!user || !user.id) {
        console.log('User authentication failed');
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 3. Debug request body
      let body;
      try {
        body = await request.json();
        console.log('Raw request body:', body);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return new NextResponse(JSON.stringify({ 
          error: 'Invalid request body',
          details: parseError.message 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 4. Get OpenAI response
      console.log('About to call getCreateTopicResponse with:', body.fullName);
      const { summary, iconName, categories } = await getCreateTopicResponse(body.fullName);
      console.log('OpenAI Response:', { summary, iconName, categories });

      if (!summary || !iconName) {
        console.log('Failed validation - missing data:', { summary, iconName });
        return new NextResponse(JSON.stringify({ error: 'Failed to generate summary or icon' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 5. Check database user
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
  
      if (!dbUser) {
        console.error('User not found in database:', user.id);
        return new NextResponse(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 6. Prepare data
      const data = {
        fullName: body.fullName,
        shortName: summary,
        icon: iconName,
        userId: dbUser.id,
      };
      console.log('Prepared data for creation:', data);
  
      // 7. Create topic with try-catch
      let topic;
      try {
        topic = await prisma.topic.create({ data });
        console.log('Topic created successfully:', topic);
      } catch (dbError) {
        console.error('Database error creating topic:', dbError);
        return new NextResponse(JSON.stringify({ 
          error: 'Database error',
          details: dbError.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      // 8. Create tiles for each category
      for (const category of categories) {
        try {
          await prisma.tile.create({
            data: {
              content: [],
              sectionName: category,
              userId: dbUser.id,
              topicId: topic.id,
            }
          });
          console.log('Tile created successfully for category:', category);
        } catch (tileError) {
          console.error('Error creating tile for category:', category, tileError);
          // Continue even if tile creation fails
        }
      }
  
      // 9. Create welcome message
      await prisma.message.create({
        data: {
          content: "Hello! I'm your AI decision coach. I'll help you analyze your options and make better decisions. Feel free to share your thoughts or ask questions about your decision-making process.",
          role: 'a',
          topicId: topic.id,
        }
      })
  
      // 10. Return success response
      return new NextResponse(JSON.stringify(topic), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
  
    } catch (error) {
      // 11. Global error handler
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