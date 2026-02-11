import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authorize } from "../middlewears/authorized.middlewears";

const router = Router();
const bookingController = new BookingController();

router.post("/", authorize, bookingController.createBooking.bind(bookingController));
router.get("/my", authorize, bookingController.getMyBookings.bind(bookingController));
router.get("/property/:propertyId", authorize, bookingController.getBookingsByProperty.bind(bookingController));

// Admin route
router.put("/:id/status", authorize, bookingController.updateBookingStatus.bind(bookingController));

export default router;