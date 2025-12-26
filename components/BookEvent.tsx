"use client";

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";

interface BookEventProps {
    eventId: string;
}

const BookEvent = ({ eventId }: BookEventProps) => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await createBooking(eventId, email);
            
            if (result.success) {
                setSubmitted(true);
                setEmail("");
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
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message text-red-500 text-sm mb-2">{error}</p>}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                    />
                </div>

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
    )
}

export default BookEvent