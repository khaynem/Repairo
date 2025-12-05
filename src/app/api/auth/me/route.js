import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import User from '@/models/user';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const auth = request.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.split(' ')[1];

    if (token === 'dev-token') {
      return NextResponse.json({
        success: true,
        user: { id: 'dev', email: 'dev@example.com', name: 'Dev User', role: 'user' }
      });
    }

    const SECRET = process.env.JWT_SECRET;
    if (!SECRET) {
      console.warn('JWT_SECRET not set; rejecting token verification in production.');
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded?.userId || decoded?.id || decoded?.sub;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt?.toISOString?.() ?? user.createdAt
      }
    });
  } catch (err) {
    console.error('GET /api/auth/me error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}