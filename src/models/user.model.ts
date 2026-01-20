import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the interface for the Document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  username?: string; // Optional in TypeScript
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// 2. Define the Schema
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
    // Fix: Make username optional with sparse index
    username: { 
      type: String, 
      unique: true, 
      sparse: true, // Only enforces uniqueness if the field exists
      trim: true,
      lowercase: true,
      default: null 
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        const response = ret as any;
        delete response._id;
        delete response.__v;
        delete response.password;
        return response;
      },
    },
  }
);

// 3. Password Hashing (Pre-save hook)
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// 4. Helper method for Login
UserSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const UserModel = mongoose.model<IUser>("User", UserSchema);