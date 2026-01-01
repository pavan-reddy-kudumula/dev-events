import Image from "next/image";
import Link from "next/link";
import EventCardActions from "./EventCardActions";

interface Props {
    _id: string;
    title: string;
    image: string;
    slug: string;
    location: string;
    date: string;
    time: string;
    isEditable?: boolean;
}

const EventCard = ({_id, title, image, slug, location, date, time, isEditable = false}: Props) => {
    return (
        <div className="relative">
            <Link href={`/events/${slug}`} id="event-card">
            {image && image.trim() !== "" ? (
                    <Image src={image} alt={title} width={410} height={300} className="poster"/>
            ) : null}

            <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="location" width={14} height={14}/>
                <p>{location}</p>
            </div>

            <p className="title">{title}</p>

            <div className="datetime">
                <div>
                    <Image src="/icons/calendar.svg" alt="date" width={14} height={14}/>
                    <p>{date}</p>               
                </div>
                <div>
                    <Image src="/icons/clock.svg" alt="time" width={14} height={14}/>
                    <p>{time}</p>               
                </div>
            </div>
        </Link>
        {isEditable && (
            <EventCardActions slug={slug} eventId={_id} />
        )}
        </div>
  )
}

export default EventCard