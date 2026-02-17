import mongoose, { Document, Schema } from "mongoose";

export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  location: string;
  price: number; // per month or whatever
  availability: {
    startDate: Date;
    endDate: Date;
  }[];
  images: string[]; // URLs or paths
  owner: mongoose.Types.ObjectId; // reference to User
  status: 'pending' | 'approved' | 'rejected' | 'available' | 'assigned' | 'booked';
  assignedTo?: mongoose.Types.ObjectId; // user who rented it
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    availability: [{
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    }],
    images: [{
      type: String
    }],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'available', 'assigned', 'booked'],
      default: 'pending'
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IProperty>('Property', PropertySchema);