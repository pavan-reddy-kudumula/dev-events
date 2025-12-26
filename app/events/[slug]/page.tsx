import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug, getEventBySlug } from "@/lib/actions/event.actions";
import { getBookingCountByEventId } from "@/lib/actions/booking.actions";
import { IEvent } from "@/database";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsItem = ({icon, alt, label}: { icon: string, alt: string, label: string}) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({agendaItems}: {agendaItems: string[]}) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({tags}: {tags: string[]}) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div key={tag} className="pill">{tag}</div>
        ))}
    </div>
);

const EventDetailsPage = async ({params}: {params: Promise<{slug: string}>}) => {
    const {slug} =  await params;
    const event = await getEventBySlug(slug);
    console.log(event);

    if (!event) return notFound();

    // const bookings = await getBookingCountByEventId(event._id);
    const bookings = 0;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{event.description}</p>
            </div>

            <div className="details">
                {/* Left Side - Event Content */}
                <div className="content">
                    <Image src={event.image} alt={event.title} width={800} height={800} 
                    className="banner"/>

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{event.overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailsItem icon="/icons/calendar.svg" alt="calendar" label={event.date} />   
                        <EventDetailsItem icon="/icons/clock.svg" alt="clock" label={event.time} />   
                        <EventDetailsItem icon="/icons/pin.svg" alt="pin" label={event.location} />   
                        <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={event.mode} />   
                        <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={event.audience} />   
                    </section>

                    <EventAgenda agendaItems={event.agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{event.organizer}</p>
                    </section>

                    <EventTags tags={event.tags} />
                </div>
                {/* Right Side - Booking Form */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot!
                            </p>
                        ) : (
                            <p className="text-sm">
                                Be the first to book your spot!
                            </p>
                        )}
                    </div>

                    <BookEvent eventId={event._id} />
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                {!similarEvents || similarEvents.length === 0 ? ( 
                    <p>No similar events found.</p>
                ) : (
                <div className="events">
                        {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                            <EventCard key={similarEvent.slug} {...similarEvent} />
                        ))}
                </div>
                )}
            </div>
        </section>
    )
}

export default EventDetailsPage;