"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteEvent } from "@/lib/actions/event.actions";
import ConfirmModal from "./ConfirmModal";

interface Props {
    slug: string;
    eventId: string;
}

export default function EventCardActions({ slug, eventId }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        
        try {
            const result = await deleteEvent(eventId);
            
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || "Failed to delete event");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occurred while deleting the event");
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <div className="absolute top-2 right-2 flex gap-2">
                <Link 
                    href={`/edit-event/${slug}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    Edit
                </Link>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowConfirm(true);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                    disabled={isDeleting}
                >
                    Delete
                </button>
            </div>

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