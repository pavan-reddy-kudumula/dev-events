"use server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";
import {unstable_cache, revalidateTag} from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { IEventClient } from "@/types/event";
import { v2 as cloudinary } from "cloudinary";

type EventMutationResult =
    | { success: true; message: string; eventId: string; slug: string }
    | { success: false; error: string };

type EventMutationData = {
    title?: string;
    description?: string;
    overview?: string;
    venue?: string;
    location?: string;
    date?: string;
    time?: string;
    mode?: string;
    audience?: string;
    organizer?: string;
    tags?: string[];
    agenda?: string[];
    image?: string;
};

const parseList = (value: string | undefined): string[] => {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item).trim()).filter(Boolean);
        }
    } catch {
        return value
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
};

const uploadImage = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "DevEvent" },
            (error, results) => {
                if (error) return reject(error);

                resolve(results);
            }
        ).end(buffer);
    });

    return (uploadResult as { secure_url: string }).secure_url;
};

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

const getCachedMyEvents = (email: string) =>
    unstable_cache(
        async (): Promise<IEventClient[]> => {
            await connectDB();
            const events = await Event.find({ creatorEmail: email }).sort({ createdAt: -1 }).lean();
            return events.map((event) => ({
                ...event,
                _id: event._id.toString(),
                createdAt: event.createdAt.toISOString(),
                updatedAt: event.updatedAt.toISOString(),
            }));
        },
        ["my-events-cache", email],
        { tags: ["events-list", `my-events:${email}`] }
    )();

export const getMyEvents = async (): Promise<IEventClient[]> => {
    try {
        const session = await getServerSession(authOptions);
        if(!session?.user?.email) return [];
        return getCachedMyEvents(session.user.email);
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

export const createEventAction = async (formData: FormData): Promise<EventMutationResult> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return {
                success: false,
                error: "You must be signed in to create an event",
            };
        }

        const image = formData.get("image");
        if (!(image instanceof File) || image.size === 0) {
            return {
                success: false,
                error: "Image file is required",
            };
        }

        await connectDB();

        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();
        const overview = String(formData.get("overview") ?? "").trim();
        const venue = String(formData.get("venue") ?? "").trim();
        const location = String(formData.get("location") ?? "").trim();
        const date = String(formData.get("date") ?? "").trim();
        const time = String(formData.get("time") ?? "").trim();
        const mode = String(formData.get("mode") ?? "").trim();
        const audience = String(formData.get("audience") ?? "").trim();
        const organizer = String(formData.get("organizer") ?? "").trim();
        const tags = parseList(String(formData.get("tags") ?? "[]"));
        const agenda = parseList(String(formData.get("agenda") ?? "[]"));

        if (!title || !description || !overview || !venue || !location || !date || !time || !mode || !audience || !organizer) {
            return {
                success: false,
                error: "All event fields are required",
            };
        }

        const imageUrl = await uploadImage(image);

        const createdEvent = await Event.create({
            title,
            description,
            overview,
            venue,
            location,
            date,
            time,
            mode,
            audience,
            organizer,
            tags,
            agenda,
            image: imageUrl,
            creatorEmail: session.user.email,
        });

        revalidateTag("events-list", "max");
        revalidateTag(`my-events:${session.user.email}`, "max");

        return {
            success: true,
            message: "Event created successfully",
            eventId: createdEvent._id.toString(),
            slug: createdEvent.slug,
        };
    } catch (error) {
        console.error("Error creating event:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create event",
        };
    }
};

export const updateEventAction = async (slug: string, formData: FormData): Promise<EventMutationResult> => {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return {
                success: false,
                error: "You must be signed in to update an event",
            };
        }

        await connectDB();

        const event = await Event.findOne({ slug: slug.trim().toLowerCase() });
        if (!event) {
            return {
                success: false,
                error: "Event not found",
            };
        }

        if (event.creatorEmail !== session.user.email) {
            return {
                success: false,
                error: "You can only update your own events",
            };
        }

        const description = String(formData.get("description") ?? "").trim();
        const overview = String(formData.get("overview") ?? "").trim();
        const venue = String(formData.get("venue") ?? "").trim();
        const location = String(formData.get("location") ?? "").trim();
        const date = String(formData.get("date") ?? "").trim();
        const time = String(formData.get("time") ?? "").trim();
        const mode = String(formData.get("mode") ?? "").trim();
        const audience = String(formData.get("audience") ?? "").trim();
        const organizer = String(formData.get("organizer") ?? "").trim();
        const tags = parseList(String(formData.get("tags") ?? "[]"));
        const agenda = parseList(String(formData.get("agenda") ?? "[]"));
        const image = formData.get("image");

        const updatedEventData: Partial<EventMutationData> & Record<string, unknown> = {
            description,
            overview,
            venue,
            location,
            date,
            time,
            mode,
            audience,
            organizer,
            tags,
            agenda,
            updatedAt: new Date(),
        };

        if (image instanceof File && image.size > 0) {
            updatedEventData.image = await uploadImage(image);
        }

        const updatedEvent = await Event.findByIdAndUpdate(event._id, updatedEventData, { new: true });

        revalidateTag("events-list", "max");
        revalidateTag(`my-events:${session.user.email}`, "max");

        return {
            success: true,
            message: "Event updated successfully",
            eventId: updatedEvent?._id.toString() || event._id.toString(),
            slug: updatedEvent?.slug || event.slug,
        };
    } catch (error) {
        console.error("Error updating event:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update event",
        };
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

        // Collect booking owners so their cached my-bookings lists can be refreshed.
        const bookingUsers = await Booking.find({ eventId })
            .select("email")
            .lean() as Array<{ email?: string }>;
        const bookingUserEmails = [...new Set(bookingUsers.map((b) => b.email).filter(Boolean))] as string[];

        // Delete all bookings for this event first
        await Booking.deleteMany({ eventId });

        // Delete the event
        await Event.findByIdAndDelete(eventId);

        // Revalidate caches
        revalidateTag("events-list", "max");
        revalidateTag(`my-events:${session.user.email}`, "max");
        bookingUserEmails.forEach((email) => revalidateTag(`my-bookings:${email}`, "max"));
        
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