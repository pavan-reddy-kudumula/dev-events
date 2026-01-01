"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getEventBySlugForEdit } from "@/lib/actions/event.actions";

type FormFields = {
    title: string;
    description: string;
    overview: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    organizer: string;
};

const EditEventPage = () => {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [fields, setFields] = useState<FormFields>({
        title: "",
        description: "",
        overview: "",
        venue: "",
        location: "",
        date: "",
        time: "",
        mode: "online",
        audience: "",
        organizer: "",
    });

    const [tagsInput, setTagsInput] = useState("");
    const [agendaInput, setAgendaInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [currentImage, setCurrentImage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<
        | { state: "idle"; message?: string }
        | { state: "submitting"; message?: string }
        | { state: "success"; message: string }
        | { state: "error"; message: string }
    >({ state: "idle" });

    const parsedTags = useMemo(() => parseList(tagsInput), [tagsInput]);
    const parsedAgenda = useMemo(() => parseList(agendaInput), [agendaInput]);

    // Load event data
    useEffect(() => {
        const loadEvent = async () => {
            try {
                const event = await getEventBySlugForEdit(slug);
                
                if (!event) {
                    setStatus({ state: "error", message: "Event not found or you don't have permission to edit it." });
                    setIsLoading(false);
                    return;
                }

                setFields({
                    title: event.title,
                    description: event.description,
                    overview: event.overview,
                    venue: event.venue,
                    location: event.location,
                    date: event.date,
                    time: event.time,
                    mode: event.mode,
                    audience: event.audience,
                    organizer: event.organizer,
                });

                setTagsInput(event.tags.join(", "));
                setAgendaInput(event.agenda.join("\n"));
                setCurrentImage(event.image);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load event:", error);
                setStatus({ state: "error", message: "Failed to load event details." });
                setIsLoading(false);
            }
        };

        loadEvent();
    }, [slug]);

    const onFieldChange = (key: keyof FormFields, value: string) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!imageFile && !currentImage) {
            setStatus({ state: "error", message: "Please add an event image." });
            return;
        }

        setStatus({ state: "submitting", message: "Updating event..." });

        const formData = new FormData();
        formData.append("description", fields.description);
        formData.append("overview", fields.overview);
        formData.append("venue", fields.venue);
        formData.append("location", fields.location);
        formData.append("date", fields.date);
        formData.append("time", fields.time);
        formData.append("mode", fields.mode);
        formData.append("audience", fields.audience);
        formData.append("organizer", fields.organizer);
        formData.append("tags", JSON.stringify(parsedTags));
        formData.append("agenda", JSON.stringify(parsedAgenda));
        
        if (imageFile) {
            formData.append("image", imageFile);
        }

        try {
            const response = await fetch(`/api/events/${slug}`, {
                method: "PUT",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.message || "Failed to update event");
            }

            setStatus({ state: "success", message: "Event updated successfully. Redirecting..." });
            
            setTimeout(() => {
                router.push(`/events/${slug}`);
            }, 1500);
        } catch (error) {
            setStatus({
                state: "error",
                message: error instanceof Error ? error.message : "Something went wrong.",
            });
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-10">
                <p>Loading event details...</p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-4xl px-6 py-10">
            <h1 className="text-3xl font-semibold">Edit Event</h1>
            <p className="mt-2 text-sm text-gray-600">
                Update your event details. Agenda and tags accept comma or newline separated
                values.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-6">
                <div className="grid gap-2">
                    <label className="font-medium">Title</label>
                    <input
                        className="rounded border px-3 py-2 cursor-not-allowed"
                        name="title"
                        required
                        value={fields.title}
                        disabled
                        placeholder="Type the event title"
                    />
                    <p className="text-xs text-gray-500">Title cannot be changed as it's used as the event identifier.</p>
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Description</label>
                    <textarea
                        className="rounded border px-3 py-2"
                        name="description"
                        required
                        rows={4}
                        value={fields.description}
                        onChange={(e) => onFieldChange("description", e.target.value)}
                        placeholder="A concise description for listings"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Overview</label>
                    <textarea
                        className="rounded border px-3 py-2"
                        name="overview"
                        required
                        rows={3}
                        value={fields.overview}
                        onChange={(e) => onFieldChange("overview", e.target.value)}
                        placeholder="Longer overview shown on the detail page"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Venue</label>
                    <input
                        className="rounded border px-3 py-2"
                        name="venue"
                        required
                        value={fields.venue}
                        onChange={(e) => onFieldChange("venue", e.target.value)}
                        placeholder="Hall A, Main Campus"
                    />
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Location</label>
                    <input
                        className="rounded border px-3 py-2"
                        name="location"
                        required
                        value={fields.location}
                        onChange={(e) => onFieldChange("location", e.target.value)}
                        placeholder="San Francisco, CA or Zoom link"
                    />
                </div>

                <div className="grid gap-2 sm:grid-cols-2 sm:items-center sm:gap-4">
                    <div className="grid gap-2">
                        <label className="font-medium">Date</label>
                        <input
                            className="rounded border px-3 py-2"
                            type="date"
                            name="date"
                            required
                            value={fields.date}
                            onChange={(e) => onFieldChange("date", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium">Time</label>
                        <input
                            className="rounded border px-3 py-2"
                            type="time"
                            name="time"
                            required
                            value={fields.time}
                            onChange={(e) => onFieldChange("time", e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-2 md:grid-cols-3 md:items-center md:gap-4">
                    <div className="grid gap-2 text-white">
                        <label className="font-medium">Mode</label>
                        <select
                            className="rounded border px-3 py-2  bg-black"
                            name="mode"
                            required
                            value={fields.mode}
                            onChange={(e) => onFieldChange("mode", e.target.value)}
                        >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium">Audience</label>
                        <input
                            className="rounded border px-3 py-2"
                            name="audience"
                            required
                            value={fields.audience}
                            onChange={(e) => onFieldChange("audience", e.target.value)}
                            placeholder="Developers, Designers, Students"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium">Organizer</label>
                        <input
                            className="rounded border px-3 py-2"
                            name="organizer"
                            required
                            value={fields.organizer}
                            onChange={(e) => onFieldChange("organizer", e.target.value)}
                            placeholder="DevEvents Team"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Tags (comma or newline)</label>
                    <textarea
                        className="rounded border px-3 py-2"
                        name="tags"
                        rows={2}
                        required
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="frontend, web, ai"
                    />
                    <p className="text-xs text-gray-500">Parsed: {parsedTags.join(", ") || "none"}</p>
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Agenda (comma or newline)</label>
                    <textarea
                        className="rounded border px-3 py-2"
                        name="agenda"
                        rows={3}
                        required
                        value={agendaInput}
                        onChange={(e) => setAgendaInput(e.target.value)}
                        placeholder={`Welcome\nTalk 1\nPanel\nQ&A`}
                    />
                    <p className="text-xs text-gray-500">Parsed: {parsedAgenda.join(" | ") || "none"}</p>
                </div>

                <div className="grid gap-2">
                    <label className="font-medium">Image</label>
                    {currentImage && !imageFile && (
                        <div className="mb-2">
                            <p className="text-xs text-gray-600 mb-2">Current image:</p>
                            <img src={currentImage} alt="Current event" className="max-w-xs rounded" />
                        </div>
                    )}
                    <input
                        className="rounded border px-3 py-2"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {imageFile ? (
                        <p className="text-xs text-gray-600">Selected: {imageFile.name}</p>
                    ) : (
                        <p className="text-xs text-gray-500">Upload a new banner image (optional).</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full mx-auto rounded bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 border border-white"
                    disabled={status.state === "submitting"}
                >
                    {status.state === "submitting" ? "Updating..." : "Update Event"}
                </button>

                {status.state === "success" && (
                    <p className="text-green-600">{status.message}</p>
                )}

                {status.state === "error" && (
                    <p className="text-red-600">{status.message}</p>
                )}
            </form>
        </main>
    );
};

function parseList(value: string): string[] {
    // Trim and remove empty entries to match schema validators.
    return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export default EditEventPage;
