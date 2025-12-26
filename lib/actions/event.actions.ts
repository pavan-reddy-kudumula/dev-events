"use server";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import {unstable_cache} from "next/cache";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        const similarEvents = await Event.find({
            _id: { $ne: event?._id },
            tags: { $in: event?.tags }
        }).lean();  
        return similarEvents;
    } catch {
        return [];
    }
}

export const getEventBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug }).lean();
        return {
            ...event,
            _id: event._id.toString(),
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    } catch {
        return null;
    }
};

export const getAllEvents = unstable_cache(
    async () => {
        try {
            await connectDB();
            const events = await Event.find().sort({createdAt: -1}).lean();
            return events;
        } catch(error) {
            console.error("Database Error:", error);
            return [];
        }
    },
    ["all-events-cache"],
    {tags: ["events-list"]}
);