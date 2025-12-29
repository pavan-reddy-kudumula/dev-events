"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import { useSession, signIn } from "next-auth/react";

interface BookEventProps {
    eventId: string;
}

const BookEvent = ({ eventId }: BookEventProps) => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { status, data } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await createBooking(eventId);
            
            if (result.success) {
                setSubmitted(true);
            } else {
                setError(result.error || "Failed to book event");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error("Booking error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
    <div id="book-event">
        {submitted ? (
            <p>Thank you for booking your spot!</p>
        ) : (
            <div>
                {error && <p className="error-message text-red-500 text-sm mb-2">{error}</p>}
                {status === "unauthenticated" ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm">Please sign in to book your spot.</p>
                        <button
                            type="button"
                            className="bg-primary hover:bg-primary/90 w-full cursor-pointer items-center justify-center rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black"
                            onClick={() => signIn()}
                        >
                            Sign in to Book
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {data?.user?.email && (
                            <p className="text-sm mb-2">Booking as {data.user.email}</p>
                        )}
                        <button 
                            type="submit" 
                            className="button-submit"
                            disabled={loading}
                        >
                            {loading ? "Booking..." : "Book Now"}
                        </button>
                    </form>
                )}
            </div>
        )}
    </div>
    )
}

export default BookEvent