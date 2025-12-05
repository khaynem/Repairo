import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Repair from "@/models/repair";
import User from "@/models/user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();

    let userRole = request.headers.get("X-User-Role");
    
    if (!userRole) {
      const authHeader = request.headers.get("authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
      
      if (token) {
        try {
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userRole = decoded.role || "customer";
        } catch (err) {
          console.error("Token verification failed:", err.message);
        }
      }
    }
    
    console.log("GET /api/repairs/available - Role:", userRole);
    
    if (userRole !== "technician" && userRole !== "admin") {
      console.error("GET /api/repairs/available - Access denied for role:", userRole);
      return NextResponse.json({ error: "Forbidden - Technician access required" }, { status: 403 });
    }

    const availableRepairs = await Repair.find({
      $or: [
        { technicianId: { $exists: false } },
        { technicianId: null }
      ],
      status: { $in: ["Pending", "pending"] }
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log("GET /api/repairs/available - Found repairs:", availableRepairs.length);
    
    // Log first repair to check if preferredDate is included
    if (availableRepairs.length > 0) {
      console.log("GET /api/repairs/available - Sample repair:", {
        id: availableRepairs[0]._id,
        title: availableRepairs[0].title,
        preferredDate: availableRepairs[0].preferredDate,
        createdAt: availableRepairs[0].createdAt
      });
    }

    return NextResponse.json(availableRepairs, { status: 200 });
  } catch (err) {
    console.error("Available repairs GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
