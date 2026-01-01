"use server";

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { IEventClient } from "@/types/event";

export const createBooking = async (eventId: string) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return {
                success: false,
                error: "You must be signed in to book this event",
            };
        }

        await connectDB();
        
        const email = session.user.email;
        // Prevent event organizers from booking their own events
        const event = await Event.findById(eventId)
            .select("creatorEmail")
            .lean();

        if (!event) {
            return {
                success: false,
                error: "Event not found or deleted",
            };
        }

        if (event.creatorEmail === email) {
            return {
                success: false,
                error: "You cannot book your own event",
            };
        }

        // Check if booking already exists
        const existingBooking = await Booking.findOne({ eventId, email });
        
        if (existingBooking) {
            return { 
                success: false, 
                error: "You have already booked this event with this email" 
            };
        }

        // Create new booking
        const booking = await Booking.create({
            eventId,
            email,
        });

        revalidateTag("events", "max");
        
        return { 
            success: true, 
            booking: JSON.parse(JSON.stringify(booking)) 
        };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to create booking" 
        };
    }
};

export const getBookingCountByEventId = async (eventId: string) => {
    try {
        await connectDB();
        const count = await Booking.countDocuments({ eventId });
        return count;
    } catch (error) {
        console.error("Error getting booking count:", error);
        return 0;
    }
};

export const getMyBookings = async (): Promise<IEventClient[]> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return [];
        }
        await connectDB();
        const email = session.user.email;
        const bookings = await Booking.find({ email }).populate({ path: 'eventId', options: { lean: true } }).lean();
        const events = bookings
            .filter(booking => booking.eventId !== null && booking.eventId !== undefined)
            .map(booking => {
                const event = booking.eventId;

                return {
                    ...event,
                    _id: event._id.toString(),
                    createdAt: event.createdAt.toISOString(),
                    updatedAt: event.updatedAt.toISOString(),
                };
            });

        return events;
    } catch (error) {
        console.error("Error getting my bookings:", error);
        return [];
    }   
};