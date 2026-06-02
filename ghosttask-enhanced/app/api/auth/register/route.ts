import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/config/db';
import { User } from '@/models/User';
import { RegisterSchema } from '@/validators/auth.validator';
import { signToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/utils/api';
import { rateLimiter } from '@/lib/rateLimit';
import { ValidationError, ConflictError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    rateLimiter(ip, { max: 20 }); // strict rate limit for registration

    await connectToDatabase();
    const body = await req.json();

    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.issues);
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
    });

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
      'Registration completed successfully',
      undefined,
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
