import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event, { IEvent } from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

export async function PUT(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        await connectDB();

        if (!slug || typeof slug !== "string" || slug.trim() === "") {
            return NextResponse.json(
                { message: "Invalid or missing slug parameter" },
                { status: 400 }
            );
        }

        const sanitizedSlug = slug.trim().toLowerCase();
        const event: IEvent | null = await Event.findOne({ slug: sanitizedSlug });

        if (!event) {
            return NextResponse.json(
                { message: `Event with slug "${sanitizedSlug}" not found` },
                { status: 404 }
            );
        }

        // Check if the user is the creator
        if (event.creatorEmail !== session.user.email) {
            return NextResponse.json(
                { message: "You can only update your own events" },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const updatedEventData = Object.fromEntries(formData.entries());
        const file = formData.get("image") as File | null;

        let tags = JSON.parse((formData.get("tags") as string) || "[]");
        let agenda = JSON.parse((formData.get("agenda") as string) || "[]");

        // Handle image upload if a new image is provided
        if (file && file.size > 0) {
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

            updatedEventData.image = (uploadResult as { secure_url: string }).secure_url;
        }

        // Update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            event._id,
            {
                ...updatedEventData,
                tags: tags,
                agenda: agenda,
                updatedAt: new Date(),
            },
            { new: true }
        );

        revalidateTag("events-list", "max");

        return NextResponse.json(
            {
                message: "Event updated successfully",
                event: updatedEvent
            },
            { status: 200 }
        );
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            {
                message: "Event update failed",
                error: e instanceof Error ? e.message : String(e)
            },
            { status: 500 }
        );
    }
}