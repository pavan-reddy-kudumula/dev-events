"use server";

import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import { revalidatePath } from "next/cache";

export const createBooking = async (eventId: string, email: string) => {
    try {
        await connectDB();
        
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

        revalidatePath(`/events`);
        
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
