"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function ProfileMenu() {
  const { data: session, status } = useSession();
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsClicked(false);
      }
    }

    if (isClicked) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isClicked]);

  const showMenu = isHovered || isClicked;

  return (
    <div 
      ref={menuRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        aria-label="User menu"
        onClick={() => setIsClicked(!isClicked)}
        className={`h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/20 bg-white flex items-center justify-center text-sm font-semibold transition-all ${
          isClicked ? 'ring-2 ring-white/60 shadow-lg' : ''
        }`}
      >
        {status === "loading" ? (
          <span className="animate-pulse h-full w-full bg-white" />
        ) : user?.image ? (
          <Image
            src={user.image}
            alt={user.name || user.email || "User"}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-black">{initial}</span>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black/5">
          <div className={`p-3 ${isClicked ? 'border-b border-gray-200' : ''}`}>
            {user ? (
              <>
                <p className="text-sm font-medium text-gray-900 truncate no-underline">{user.name || "Unnamed User"}</p>
                <p className="text-xs text-gray-600 truncate no-underline">{user.email}</p>
              </>
            ) : (
              <p className="text-sm text-gray-700 no-underline">Not signed in</p>
            )}
          </div>

          {isClicked && (
            <div className="p-2">
              {user ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-800"
                >
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm text-gray-800"
                >
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}