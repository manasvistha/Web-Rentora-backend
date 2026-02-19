import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId; // tenant/requester
  owner: mongoose.Types.ObjectId; // property owner
  status: 'pending' | 'approved' | 'rejected';
  message?: string; // optional message from user
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema<IBooking>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    message: String
  },
  {
    timestamps: true
  }
);

// Index for property bookings
BookingSchema.index({ property: 1, status: 1 });
BookingSchema.index({ property: 1, user: 1 }, { unique: true });
BookingSchema.index({ owner: 1, createdAt: -1 });
BookingSchema.index(
  { property: 1 },
  { unique: true, partialFilterExpression: { status: 'approved' } }
);

export default mongoose.model<IBooking>('Booking', BookingSchema);