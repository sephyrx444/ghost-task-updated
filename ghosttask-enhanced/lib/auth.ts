import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';

export function getUserIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  return payload?.userId || null;
}
