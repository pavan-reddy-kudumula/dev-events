"use client";

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

export default function ProfileMenu() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="relative group">
      <button
        aria-label="User menu"
        className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-white/20 bg-gray-200 flex items-center justify-center text-sm font-semibold"
      >
        {status === "loading" ? (
          <span className="animate-pulse h-full w-full bg-gray-300" />
        ) : user?.image ? (
          <Image
            src={user.image}
            alt={user.name || user.email || "User"}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      <div className="absolute right-0 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black/5 hidden group-hover:block group-focus-within:block">
        <div className="p-3 border-b border-gray-200">
          {user ? (
            <>
              <p className="text-sm font-medium text-gray-900 truncate">{user.name || "Unnamed User"}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
            </>
          ) : (
            <p className="text-sm text-gray-700">Not signed in</p>
          )}
        </div>

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
      </div>
    </div>
  );
}
