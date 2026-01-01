import EventCard from "@/components/EventCard"
import { IEventClient } from "@/types/event";
import { getMyEvents } from "@/lib/actions/event.actions";

const page = async () => {
  const events = await getMyEvents();

  return (
    
    <section>
      <div className="mt-3 space-y-7">
        <h3>My Events</h3>

        <ul className="events list-none">
          {events.length > 0 ? events.map((event: IEventClient) => (
            <li key={event._id}>
              <EventCard {...event} isEditable={true} />
            </li>
          )) : <p>You have not created any events yet.</p>}
        </ul>
      </div>
    </section>
  )
}

export default page