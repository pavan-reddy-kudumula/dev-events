import ExploreBtn from "@/components/ExploreBtn"
import EventCard from "@/components/EventCard"
import { IEventClient } from "@/types/event";
import { getAllEvents } from "@/lib/actions/event.actions";

const page = async () => {
  const events = await getAllEvents();

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetsups, and Conferences, All in One Place</p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events.length > 0 ? events.map((event: IEventClient) => (
            <li key={event._id}>
              <EventCard {...event} />
            </li>
          )) : <p>No events available.</p>}
        </ul>
      </div>
    </section>
  )
}

export default page