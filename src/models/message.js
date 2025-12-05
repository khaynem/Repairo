import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    receiverId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    repairId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Repair",
      required: true
    },
    content: { 
      type: String, 
      required: true,
      maxlength: 2000
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { 
    timestamps: true,
    collection: "messages" 
  }
);

messageSchema.index({ repairId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
