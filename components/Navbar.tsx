import Link from "next/link"
import Image from "next/image"
import ProfileMenu from "./ProfileMenu";

const Navbar = () => {
  return (
    <header>
        <nav className="flex items-center justify-between p-4">
            <Link href="/" className="logo flex items-center gap-2">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>
                <p>DevEvent</p>
            </Link>

            <div className="flex items-center gap-6">
              <ul className="flex items-center gap-4">
                  <Link href="/">Home</Link>
                  <Link href="/events">Events</Link>
                  <Link href="/create-event">Create Event</Link>
              </ul>
              <ProfileMenu />
            </div>
        </nav>
    </header>
  )
}

export default Navbar