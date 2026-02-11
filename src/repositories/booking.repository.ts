import Booking, { IBooking } from "../models/booking.model";
import { CreateBookingDto } from "../dtos/booking.dto";

export class BookingRepository {
  async create(data: CreateBookingDto & { user: string }): Promise<IBooking> {
    const booking = new Booking({
      property: data.propertyId,
      user: data.user,
      message: data.message
    });
    return await booking.save();
  }

  async findByProperty(propertyId: string): Promise<IBooking[]> {
    return await Booking.find({ property: propertyId }).populate('user', 'name email').sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<IBooking[]> {
    return await Booking.find({ user: userId }).populate('property', 'title location price').sort({ createdAt: -1 });
  }

  async updateStatus(bookingId: string, status: 'pending' | 'approved' | 'rejected'): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
  }

  async findById(id: string): Promise<IBooking | null> {
    return await Booking.findById(id).populate('user', 'name email').populate('property', 'title location price');
  }
}