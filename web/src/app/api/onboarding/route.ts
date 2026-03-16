import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// Initialize Prisma client
const prisma = new PrismaClient();

const formSchema = z.object({
  business: z.string().min(1),
  industry: z.string().min(1),
  useCase: z.string().min(1),
});

// Handle POST request to /api/onboarding
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const validatedData = formSchema.parse(body);

    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user with onboarding data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        business: validatedData.business,
        industry: validatedData.industry,
        useCase: validatedData.useCase,
        // Mark onboarding as completed
        onboardingCompleted: true,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved successfully',
      redirectTo: '/dashboard',
    }, { status: 200 });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    
    // Generic error handling
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}