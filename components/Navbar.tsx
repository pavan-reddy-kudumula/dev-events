"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import ProfileMenu from "./ProfileMenu";

const Navbar = () => {
  const { status, data: session } = useSession();
  const isAuthenticated = status === "authenticated" && !!session;

  return (
    <header>
        <nav className="flex items-center justify-between p-4">
            <Link href="/" className="logo flex items-center gap-2">
                <Image src="/icons/logo.png" alt="logo" width={24} height={24}/>
                <p>DevEvent</p>
            </Link>

            <div className="flex items-center gap-6">
              <ul className="flex items-center gap-4 list-none">
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/events">Events</Link>
                  </li>
                  {isAuthenticated && (
                    <>
                      <li>
                        <Link href="/create-event">Create Event</Link>
                      </li>
                      <li>
                        <Link href="/my-events">My Events</Link>
                      </li>
                      <li>
                        <Link href="/my-bookings">My Bookings</Link>
                      </li>
                    </>
                  )}
              </ul>

              <ProfileMenu />
            </div>
        </nav>
    </header>
  )
}

export default Navbar