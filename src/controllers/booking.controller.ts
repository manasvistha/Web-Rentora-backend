import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { CreateBookingDto } from "../dtos/booking.dto";

export class BookingController {
  private bookingService = new BookingService();

  async createBooking(req: Request, res: Response) {
    try {
      const data: CreateBookingDto = req.body;
      const userId = (req as any).user.id;
      const booking = await this.bookingService.createBooking(data, userId);
      res.status(201).json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getBookingsByProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const ownerId = (req as any).user.id;
      const bookings = await this.bookingService.getBookingsByProperty(propertyId, ownerId);
      res.json(bookings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const bookings = await this.bookingService.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateBookingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = (req as any).user.id;
      if ((req as any).user.role !== 'admin') return res.status(403).json({ error: "Admin required" });
      const booking = await this.bookingService.updateBookingStatus(id, status, adminId);
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}