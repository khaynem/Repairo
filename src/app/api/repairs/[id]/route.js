import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Repair from "@/models/repair";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid repair ID" }, { status: 400 });
    }

    const repair = await Repair.findById(id)
      .populate("userId", "username email")
      .populate("technicianId", "username email phone")
      .lean();

    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    return NextResponse.json(repair, { status: 200 });
  } catch (err) {
    console.error("Repair GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid repair ID" }, { status: 400 });
    }

    let userId = request.headers.get("X-User-Id");
    let userRole = request.headers.get("X-User-Role");
    
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.sub || decoded.userId || decoded.id;
          userRole = decoded.role || "customer";
        } catch (err) {
          console.error("Token verification failed:", err.message);
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, description, title, rating, review } = body;

    const repair = await Repair.findById(id);
    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    const isOwner = repair.userId.toString() === userId;
    const isTechnician = repair.technicianId?.toString() === userId;
    
    if (!isOwner && !isTechnician && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) repair.status = status;
    if (description) repair.description = description;
    if (title) repair.title = title;
    
    if (rating !== undefined && isOwner) {
      if (repair.status !== "Completed") {
        return NextResponse.json({ error: "Can only rate completed repairs" }, { status: 400 });
      }
      if (repair.rating) {
        return NextResponse.json({ error: "You have already rated this repair" }, { status: 400 });
      }
      repair.rating = rating;
      if (review) repair.review = review;
    }
    
    repair.updatedAt = new Date();

    await repair.save();

    const updatedRepair = await Repair.findById(id)
      .populate("userId", "username email")
      .populate("technicianId", "username email phone")
      .lean();

    return NextResponse.json(updatedRepair, { status: 200 });
  } catch (err) {
    console.error("Repair PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid repair ID" }, { status: 400 });
    }

    let userId = request.headers.get("X-User-Id");
    let userRole = request.headers.get("X-User-Role");
    
    if (!userId) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.sub || decoded.userId || decoded.id;
          userRole = decoded.role || "customer";
        } catch (err) {
          console.error("Token verification failed:", err.message);
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const repair = await Repair.findById(id);
    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    if (repair.userId.toString() !== userId && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Repair.findByIdAndDelete(id);

    return NextResponse.json({ message: "Repair deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Repair DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
