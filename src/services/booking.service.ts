import { BookingRepository } from "../repositories/booking.repository";
import { PropertyService } from "./property.service";
import { NotificationService } from "./notification.service";
import { CreateBookingDto } from "../dtos/booking.dto";

export class BookingService {
  private bookingRepository = new BookingRepository();
  private propertyService = new PropertyService();
  private notificationService = new NotificationService();

  async createBooking(data: CreateBookingDto, userId: string) {
    const booking = await this.bookingRepository.create({ ...data, user: userId });

    // Notify property owner
    const property = await this.propertyService.getPropertyById(data.propertyId);
    if (property) {
      await this.notificationService.createNotification(
        property.owner.toString(),
        `New booking interest for your property "${property.title}".`,
        'general',
        data.propertyId
      );
    }

    return booking;
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
        await this.propertyService.assignProperty(booking.property.toString(), booking.user.toString(), adminId);
      }
    }
    return booking;
  }
}