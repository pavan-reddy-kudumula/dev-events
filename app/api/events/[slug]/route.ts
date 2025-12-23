import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event, { IEvent } from "@/database/event.model";

type RouteParams = {
    params: Promise<{ slug: string }>;
};

export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const { slug } = await params;
        await connectDB();

        if(!slug || typeof slug !== "string" || slug.trim() === "") {
            return NextResponse.json(
                { message: "Invalid or missing slug parameter" },
                { status: 400 }
            );
        }

        const sanitizedSlug = slug.trim().toLowerCase();

        const event: IEvent | null = await Event.findOne({ slug: sanitizedSlug }).lean();

        if(!event) {
            return NextResponse.json(
                { message: `Event with slug "${sanitizedSlug}" not found` },
                { status: 404 }
            );
        }
        
        return NextResponse.json({ message: "Event fetched successfully", event }, { status: 200 });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { message: "Failed to fetch event data", error: (e as Error).message },
            { status: 500 }
        );
    }
}