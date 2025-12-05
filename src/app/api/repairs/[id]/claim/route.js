import { NextResponse } from "next/server";
import connectDB from "@/lib/mongo";
import Repair from "@/models/repair";
import Message from "@/models/message";
import User from "@/models/user";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request, { params }) {
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

    console.log("POST /api/repairs/[id]/claim - User context:", { userId, userRole });

    if (!userId) {
      console.error("POST /api/repairs/[id]/claim - No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole !== "technician" && userRole !== "admin") {
      console.error("POST /api/repairs/[id]/claim - Access denied for role:", userRole);
      return NextResponse.json({ error: "Forbidden - Technician access required" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Repair ID required" }, { status: 400 });
    }

    const repair = await Repair.findById(id);

    if (!repair) {
      return NextResponse.json({ error: "Repair not found" }, { status: 404 });
    }

    if (repair.technicianId) {
      return NextResponse.json({ error: "Repair already claimed" }, { status: 400 });
    }

    repair.technicianId = userId;
    repair.status = "Assigned";
    repair.updatedAt = new Date();

    await repair.save();

    const technician = await User.findById(userId).select("username").lean();
    const technicianName = technician?.username || "A technician";

    try {
      const autoMessage = new Message({
        senderId: userId,
        receiverId: repair.userId,
        repairId: id,
        content: `${technicianName} has accepted your repair request for "${repair.title}". I will review the details and get back to you shortly!`,
        read: false,
        createdAt: new Date()
      });
      await autoMessage.save();
      console.log("Auto-message sent to customer after job claim");
    } catch (msgErr) {
      console.error("Failed to send auto-message:", msgErr);
    }

    const updatedRepair = await Repair.findById(id)
      .populate("userId", "username email")
      .populate("technicianId", "username email phone")
      .lean();

    return NextResponse.json(updatedRepair, { status: 200 });
  } catch (err) {
    console.error("Claim repair error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
