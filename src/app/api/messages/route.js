import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Message from "@/models/message";
import Repair from "@/models/repair";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();

    // Try to get user info from headers first (set by middleware)
    let userId = request.headers.get("X-User-Id");
    
    // If not in headers, try to decode from token directly
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.sub || decoded.userId || decoded.id;
        } catch (err) {
          console.error("Token verification failed:", err.message);
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repairId = searchParams.get("repairId");

    if (repairId) {
      const repair = await Repair.findById(repairId);
      if (!repair) {
        return NextResponse.json({ error: "Repair not found" }, { status: 404 });
      }

      if (String(repair.userId) !== userId && String(repair.technicianId) !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const messages = await Message.find({ repairId })
        .populate("senderId", "username email role")
        .populate("receiverId", "username email role")
        .sort({ createdAt: 1 })
        .lean();

      await Message.updateMany(
        { repairId, receiverId: userId, read: false },
        { $set: { read: true } }
      );

      return NextResponse.json(messages, { status: 200 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$repairId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", userObjectId] }, { $eq: ["$read", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "repairs",
          localField: "_id",
          foreignField: "_id",
          as: "repair"
        }
      },
      {
        $unwind: "$repair"
      },
      {
        $lookup: {
          from: "users",
          localField: "repair.userId",
          foreignField: "_id",
          as: "customer"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "repair.technicianId",
          foreignField: "_id",
          as: "technician"
        }
      },
      {
        $project: {
          repairId: "$_id",
          repair: {
            _id: "$repair._id",
            title: "$repair.title",
            status: "$repair.status"
          },
          customer: { $arrayElemAt: ["$customer", 0] },
          technician: { $arrayElemAt: ["$technician", 0] },
          lastMessage: "$lastMessage.content",
          lastMessageTime: "$lastMessage.createdAt",
          unreadCount: 1,
          currentUserId: userObjectId
        }
      },
      {
        $addFields: {
          otherParty: {
            $cond: {
              if: { $eq: ["$customer._id", userObjectId] },
              then: "$technician",
              else: "$customer"
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    return NextResponse.json(conversations, { status: 200 });
  } catch (err) {
    console.error("Messages GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    let userId = request.headers.get("X-User-Id");
    
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.sub || decoded.userId || decoded.id;
        } catch (err) {
          console.error("Token verification failed:", err.message);
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repairId, content } = await request.json();

    if (!repairId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const repair = await Repair.findById(repairId);
    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    if (String(repair.userId) !== userId && String(repair.technicianId) !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let receiverId;
    if (String(repair.userId) === userId) {
      receiverId = repair.technicianId;
    } else {
      receiverId = repair.userId;
    }

    if (!receiverId) {
      return NextResponse.json({ error: "No recipient found for this repair" }, { status: 400 });
    }

    const newMessage = new Message({
      senderId: userId,
      receiverId,
      repairId,
      content,
      read: false,
      createdAt: new Date()
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "username email role")
      .populate("receiverId", "username email role")
      .lean();

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (err) {
    console.error("Messages POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
