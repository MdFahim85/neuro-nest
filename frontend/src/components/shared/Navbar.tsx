"use client";
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";
import { useAuth } from "@/context/auth-client";
import { Button } from "../ui/button";
import { logoutUser } from "@/lib/api";
import toast from "react-hot-toast";
import UserAvatar from "./UserAvatar";

function Navbar() {
  const { user } = useAuth();
  const handleLogout = async () => {
    const data = await logoutUser();
    if (data.success) {
      toast.success(data.message);
      window.location.assign("/feed");
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-10">
        <h1 className="text-lg text-emerald-600 dark:text-emerald-300">
          <Link href="/"> Neuro-Nest </Link>
        </h1>
        <ul className="flex gap-8 text-gray-400">
          <Link href="/courses"> Courses </Link>
          <Link href="/communities"> Communities </Link>
          <Link href="/about-us"> About Neuro-Nest </Link>
        </ul>
      </div>
      <div className="flex">
        {user ? (
          <div className="flex">
            <UserAvatar user={user} />
            <Button
              variant="link"
              className="text-white"
              onClick={() => handleLogout()}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div>
            <Button variant="link" className="text-white">
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="link" className="text-white">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
        <ModeToggle />
      </div>
    </div>
  );
}

export default Navbar;
