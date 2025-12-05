import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import User from "@/models/user";
import bcrypt from 'bcryptjs';
import { handleCors, corsHeaders } from "@/lib/cors";

const { JWT_SECRET = "" } = process.env;

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request) {
  return handleCors(request);
}

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }
    
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.sub || payload.userId || payload.id;
    const userEmail = payload.email;
    
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (userEmail) {
      user = await User.findOne({ email: userEmail });
    }
    
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const safeUser = {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role || "user",
      phone: user.phone,
      skills: user.skills,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };
    
    return NextResponse.json({ user: safeUser }, { 
      status: 200,
      headers: corsHeaders(request.headers.get('origin'))
    });
  } catch (err) {
    console.error('Profile error:', err);
    return NextResponse.json({ error: err.message }, { 
      status: 500,
      headers: corsHeaders(request.headers.get('origin'))
    });
  }
}

export async function PUT(request) {
  try {
    console.log('=== PUT /api/auth/profile START ===');
    await connectDB();
    console.log('Database connected');
    
    const auth = request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }
    
    console.log('Token received, length:', token.length);
    
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
      console.log('Token verified. Payload:', JSON.stringify(payload, null, 2));
    } catch (e) {
      console.error("Token verification error:", e.message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = payload.sub || payload.userId || payload.id;
    const userEmail = payload.email;
    
    console.log('Looking for user. userId:', userId, 'email:', userEmail);
    
    let user;
    if (userId) {
      user = await User.findById(userId);
      console.log('User found by ID:', !!user);
    } else if (userEmail) {
      user = await User.findOne({ email: userEmail });
      console.log('User found by email:', !!user);
    }
    
    if (!user) {
      console.error("User not found. Payload:", { userId, userEmail });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    console.log('User found:', user._id, user.email);

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { 
      username, 
      email, 
      phone, 
      skills,
      currentPassword,
      newPassword 
    } = body;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      user.password = await bcrypt.hash(newPassword, 12);
    }

    if (username && username !== user.username) {
      if (username.length < 3 || username.length > 50) {
        return NextResponse.json({ error: 'Username must be 3-50 characters' }, { status: 400 });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      if (email.length < 5 || email.length > 100) {
        return NextResponse.json({ error: 'Email must be 5-100 characters' }, { status: 400 });
      }
      
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      
      user.email = email;
    }

    if (phone !== undefined) user.phone = phone;

    if (user.role === 'technician') {
      if (skills !== undefined) user.skills = Array.isArray(skills) ? skills : [];
    }

    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    const safeUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phone: user.phone,
      skills: user.skills,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    console.log('=== PUT /api/auth/profile SUCCESS ===');
    return NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Profile updated successfully'
    }, {
      headers: corsHeaders(request.headers.get('origin'))
    });
  } catch (err) {
    console.error('PUT /api/auth/profile error:', err);
    console.error('Error stack:', err.stack);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { 
      status: 500,
      headers: corsHeaders(request.headers.get('origin'))
    });
  }
}
