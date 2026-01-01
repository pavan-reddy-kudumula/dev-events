"use server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import {unstable_cache, revalidateTag} from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { IEventClient } from "@/types/event";

export const getSimilarEventsBySlug = async (slug: string): Promise<IEventClient[]> => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        const similarEvents = await Event.find({
            _id: { $ne: event?._id },
            tags: { $in: event?.tags }
        }).lean();  
        return similarEvents.map(event => ({
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        }));
    } catch(error) {
        console.error("getSimilarEventsBySlug failed:", error);
        return [];
    }
}

export const getEventBySlug = async (slug: string): Promise<IEventClient | null> => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug }).lean();
        return {
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    } catch(error) {
        console.error("getEventBySlug failed:", error);
        return null;
    }
};

export const getAllEvents = unstable_cache(
    async (): Promise<IEventClient[]> => {
        try {
            await connectDB();
            const events = await Event.find().sort({createdAt: -1}).lean();
            return events.map(event => ({
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
            }));
        } catch(error) {
            console.error("getAllEvents Error:", error);
            return [];
        }
    },
    ["all-events-cache"],
    {tags: ["events-list"]}
);

export const getMyEvents = async (): Promise<IEventClient[]> => {
    try {
        const session = await getServerSession(authOptions);
        if(!session?.user?.email) return [];
        await connectDB();
        const events = await Event.find({ creatorEmail: session.user.email }).sort({ createdAt: -1 }).lean();
        return events.map(event => ({
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        }));
    } catch(error) {
        console.error("getEventsByCreatorEmail failed:", error);
        return [];
    }
};

export const getEventBySlugForEdit = async (slug: string): Promise<IEventClient | null> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return null;
        
        await connectDB();
        const event = await Event.findOne({ slug }).lean();
        
        if (!event) return null;
        
        // Check if user is the creator
        if (event.creatorEmail !== session.user.email) return null;
                
        return {
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    } catch(error) {
        console.error("getEventBySlugForEdit failed:", error);
        return null;
    }
};

export const deleteEvent = async (eventId: string) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return {
                success: false,
                error: "You must be signed in to delete an event",
            };
        }

        await connectDB();
        
        // Find the event and verify ownership
        const event = await Event.findById(eventId);
        
        if (!event) {
            return {
                success: false,
                error: "Event not found",
            };
        }

        // Check if user is the creator
        if (event.creatorEmail !== session.user.email) {
            return {
                success: false,
                error: "You can only delete your own events",
            };
        }

        // Delete all bookings for this event first
        await Booking.deleteMany({ eventId });

        // Delete the event
        await Event.findByIdAndDelete(eventId);

        // Revalidate caches
        revalidateTag("events-list", "max");
        
        return {
            success: true,
            message: "Event and all associated bookings deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting event:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete event",
        };
    }
};