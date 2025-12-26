import EventCard from "@/components/EventCard"
import { IEvent } from "@/database";
import { getAllEvents } from "@/lib/actions/event.actions";

const page = async () => {
  const events = await getAllEvents();

  return (
    <section>
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events && events.length > 0 && events.map((event: IEvent) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page