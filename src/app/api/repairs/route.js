import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Repair from "@/models/repair";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();

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

    console.log("GET /api/repairs - User context:", { userId, userRole });

    let query = {};

    if (userRole === "technician" && userId) {
      query.technicianId = userId;
      console.log("GET /api/repairs - Filtering by technicianId:", userId);
    } else if ((userRole === "customer" || userRole === "user") && userId) {
      query.userId = userId;
      console.log("GET /api/repairs - Filtering by userId:", userId);
    }

    const items = await Repair.find(query)
      .populate("userId", "username email")
      .populate("technicianId", "username email phone")
      .limit(50)
      .sort({ createdAt: -1 })
      .lean();

    console.log("GET /api/repairs - Found items:", items.length, "Query:", JSON.stringify(query));

    const response = NextResponse.json(items, { status: 200 });
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (err) {
    console.error("Repairs GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

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
    
    console.log("POST /api/repairs - User context:", {
      userId,
      userRole,
      hasAuth: !!request.headers.get("authorization"),
    });
    
    if (!userId) {
      console.error("POST /api/repairs - No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status = "Pending" } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRepair = new Repair({
      title,
      description,
      status,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newRepair.save();

    return NextResponse.json(newRepair, { status: 201 });
  } catch (err) {
    console.error("Repairs POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
