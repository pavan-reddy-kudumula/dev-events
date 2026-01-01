"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/lib/actions/event.actions";
import ConfirmModal from "./ConfirmModal";

export default function DeleteEvent({ eventId }: { eventId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteEvent(eventId);
            
            if (result.success) {
                router.push("/my-events");
            } else {
                alert(result.error || "Failed to delete event");
                setIsDeleting(false);
                setShowConfirm(false);
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occurred while deleting the event");
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={isDeleting}
            >
                Delete Event
            </button>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this event? This action cannot be undone. All bookings for this event will also be deleted."
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </>
    );
}
