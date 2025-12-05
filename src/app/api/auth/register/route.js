import bcrypt from "bcryptjs";
import connectDB from "../../../../lib/mongo";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import User from "../../../../models/user";
import { v2 as cloudinary } from "cloudinary";

const { JWT_SECRET = "", JWT_EXPIRES_IN = "7d" } = process.env;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();
    const { 
      email, 
      username, 
      password, 
      confirmPassword, 
      role,
      phone,
      skills
    } = await request.json();

    if (!email || !username || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if(email.length < 5 || password.length < 8 || username.length < 3) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if(email.length > 100 || username.length > 50 || password.length > 100) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    if(password !== confirmPassword) {
        return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const userRole = role === 'technician' ? 'technician' : 'user';

    const hashedPassword = await bcrypt.hash(password, 12);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    let avatarUrl = null;
    try {
      const result = await cloudinary.search
        .expression('resource_type:image')
        .max_results(100)
        .execute();

      if (result && result.resources && result.resources.length > 0) {
        const randomIndex = Math.floor(Math.random() * result.resources.length);
        const randomImage = result.resources[randomIndex];

        avatarUrl = cloudinary.url(randomImage.public_id, {
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'auto' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          secure: true,
        });
        
        console.log(`Assigned avatar: ${randomImage.public_id}`);
      } else {
        const randomColors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
        const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=200&background=${randomColor}&color=fff`;
      }
    } catch (error) {
      console.error('Error fetching avatar from Cloudinary:', error);
      const randomColors = ['3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6', 'ec4899'];
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=200&background=${randomColor}&color=fff`;
    }

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: userRole,
      avatarUrl,
      ...(userRole === 'technician' && {
        phone,
        skills: Array.isArray(skills) ? skills : []
      })
    });

    await newUser.save();

    const payload = {
      sub: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const safeUser = {
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    };

    const response = NextResponse.json({ token, user: safeUser, message: 'User created successfully' }, { status: 201 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
