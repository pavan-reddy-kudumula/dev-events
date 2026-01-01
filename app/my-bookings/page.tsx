import EventCard from "@/components/EventCard"
import { IEventClient } from "@/types/event";
import { getMyBookings } from "@/lib/actions/booking.actions";

const page = async () => {
  const BookedEvents = await getMyBookings();

  return (
    <section>
      <div className="mt-3 space-y-7">
        <h3>My Bookings</h3>

        <ul className="events list-none">
          {BookedEvents.length > 0 ? BookedEvents.map((event: IEventClient) => (
            <li key={event._id}>
              <EventCard {...event} />
            </li>
          )) : <p>You have not booked any events yet.</p>}
        </ul>
      </div>
    </section>
  )
}

export default page