import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/config/db';
import { User } from '@/models/User';
import { LoginSchema } from '@/validators/auth.validator';
import { signToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/utils/api';
import { rateLimiter } from '@/lib/rateLimit';
import { ValidationError, UnauthorizedError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    rateLimiter(ip, { max: 30 }); // rate limit for login

    await connectToDatabase();
    const body = await req.json();

    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.issues);
    }

    const { email, password } = result.data;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Sign token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return successResponse(
      { user: userPayload, token },
      'Logged in successfully'
    );
  } catch (error) {
    return errorResponse(error);
  }
}
