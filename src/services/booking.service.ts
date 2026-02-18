import { BookingRepository } from "../repositories/booking.repository";
import { PropertyService } from "./property.service";
import { NotificationService } from "./notification.service";
import { CreateBookingDto } from "../dtos/booking.dto";
import Property from "../models/property.model";
import Booking from "../models/booking.model";

export class BookingService {
  private bookingRepository = new BookingRepository();
  private propertyService = new PropertyService();
  private notificationService = new NotificationService();

  private toId(value: any): string {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value._id) return value._id.toString();
    return value.toString();
  }

  async createBooking(data: CreateBookingDto, userId: string) {
    const property = await Property.findById(data.propertyId);
    if (!property) throw new Error("Property not found");

    if (property.owner.toString() === userId) {
      throw new Error("You cannot book your own property");
    }

    if (property.status === 'booked' || property.status === 'assigned') {
      throw new Error("Property is already booked");
    }

    const existing = await Booking.findOne({ property: data.propertyId, user: userId });
    if (existing) {
      throw new Error("You have already booked this property");
    }

    const reservedProperty = await Property.findOneAndUpdate(
      {
        _id: data.propertyId,
        status: { $in: ['available', 'approved'] },
        $or: [
          { assignedTo: { $exists: false } },
          { assignedTo: null }
        ]
      },
      {
        $set: {
          assignedTo: userId,
          status: 'booked'
        }
      },
      { new: true }
    );

    if (!reservedProperty) {
      throw new Error("Property is already booked by another user");
    }

    const booking = await this.bookingRepository.create({
      ...data,
      user: userId,
    });

    await Booking.findByIdAndUpdate(booking._id, { status: 'approved' }, { new: true });

    await Booking.updateMany(
      {
        property: data.propertyId,
        user: { $ne: userId },
        status: { $in: ['pending', 'approved'] }
      },
      { $set: { status: 'rejected' } }
    );

    const propertyOwnerId = property.owner.toString();
    if (propertyOwnerId) {
      await this.notificationService.createNotification(
        propertyOwnerId,
        `Your property "${property.title}" has been booked.`,
        'general',
        data.propertyId
      );
    }

    await this.notificationService.createNotification(
      userId,
      `You successfully booked "${property.title}".`,
      'general',
      data.propertyId
    );

    return await this.bookingRepository.findById(booking._id.toString());
  }

  async getBookingsByProperty(propertyId: string, ownerId: string) {
    const property = await this.propertyService.getPropertyById(propertyId);
    if (!property || property.owner.toString() !== ownerId) throw new Error("Unauthorized");

    return await this.bookingRepository.findByProperty(propertyId);
  }

  async getBookingsByUser(userId: string) {
    return await this.bookingRepository.findByUser(userId);
  }

  async updateBookingStatus(bookingId: string, status: 'approved' | 'rejected', adminId: string) {
    const currentBooking = await this.bookingRepository.findById(bookingId);
    if (!currentBooking) throw new Error("Booking not found");

    const bookingPropertyId = this.toId(currentBooking.property);
    const bookingUserId = this.toId(currentBooking.user);

    if (status === 'approved') {
      const property = await this.propertyService.getPropertyById(bookingPropertyId);
      if (!property) throw new Error("Property not found");

      if (property.assignedTo && property.assignedTo.toString() !== bookingUserId) {
        throw new Error("Property is already assigned/booked by another user");
      }
    }

    const booking = await this.bookingRepository.updateStatus(bookingId, status);
    if (booking) {
      await this.notificationService.createNotification(
        booking.user.toString(),
        `Your booking request has been ${status}.`,
        'status_update',
        booking.property.toString()
      );

      if (status === 'approved') {
        // Assign property
        await this.propertyService.assignProperty(bookingPropertyId, bookingUserId, adminId);
        await this.bookingRepository.rejectAllOthersForProperty(bookingPropertyId, bookingUserId);
      }
    }
    return booking;
  }
}