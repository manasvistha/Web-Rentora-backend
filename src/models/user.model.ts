import mongoose, { Document, Schema } from "mongoose";
import { NextFunction } from "express";
import bcrypt from "bcryptjs";

// 1. Define the interface for the Document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  username?: string; // Optional in TypeScript
  password: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  isBanned?: boolean;
  isSuspended?: boolean;
  flags?: Array<{ reason: string; date: Date; adminId?: string }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}


const UserSchema: Schema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },

    username: { 
      type: String, 
      unique: true, 
      sparse: true, 
      trim: true,
      lowercase: true
    },
    profilePicture: {
      type: String
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isBanned: {
      type: Boolean,
      default: false,    
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    flags: [
      {
        reason: { type: String, required: true },
        date: { type: Date, default: Date.now },
        adminId: { type: Schema.Types.ObjectId, ref: 'User' }
      }
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        const response = ret as any;
        response.id = ret._id.toString();
        delete response._id;
        delete response.__v;
        delete response.password;
        return response;
      },
    },
  }
);

// UserSchema.pre<IUser>("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error: any) {
//     next(error);
//   }
// });

UserSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);