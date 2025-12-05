import mongoose from "mongoose";

const repairSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending' 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true
    },
    technicianId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: {
      type: String,
      default: ""
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true,
    collection: "repairs" 
  }
);

repairSchema.index({ userId: 1, createdAt: -1 });
repairSchema.index({ technicianId: 1, status: 1 });
repairSchema.index({ status: 1, createdAt: -1 });

const Repair = mongoose.models.Repair || mongoose.model("Repair", repairSchema);

export default Repair;
