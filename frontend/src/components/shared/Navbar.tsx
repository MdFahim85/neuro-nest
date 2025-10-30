"use client";
import Link from "next/link";
import { ModeToggle } from "../ModeToggle";
import { useAuth } from "@/context/auth-client";
import { Button } from "../ui/button";
import { logoutUser } from "@/lib/api";
import toast from "react-hot-toast";
import UserAvatar from "./UserAvatar";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const data = await logoutUser();
    if (data.success) {
      window.location.assign("/feed");
    } else {
      toast.error(data.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full my-2 ">
      <div className="flex justify-between items-center ">
        <h1 className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
          <Link href="/">Neuro-Nest</Link>
        </h1>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex gap-8 text-neutral-600 dark:text-neutral-400">
          <li>
            <Link
              href="/courses"
              className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            >
              Courses
            </Link>
          </li>
          <li>
            <Link
              href="/communities"
              className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            >
              Communities
            </Link>
          </li>
          <li>
            <Link
              href="/about-us"
              className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            >
              About Neuro-Nest
            </Link>
          </li>
        </ul>
        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <UserAvatar user={user} />
              <Button variant="link" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="link">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="link">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <ModeToggle />
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <ul className="space-y-3">
              <li>
                <Link
                  href="/courses"
                  className="block py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                  onClick={closeMenu}
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/communities"
                  className="block py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                  onClick={closeMenu}
                >
                  Communities
                </Link>
              </li>
              <li>
                <Link
                  href="/about-us"
                  className="block py-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                  onClick={closeMenu}
                >
                  About Neuro-Nest
                </Link>
              </li>
            </ul>

            {/* Mobile Auth Section */}
            <div className="py-4 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <span className="text-sm text-gray-6  00 dark:text-gray-400">
                      {user.displayname}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 flex gap-4">
                  <Button variant="outline" onClick={closeMenu}>
                    <Link href="/login" className="w-full">
                      Login
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={closeMenu}
                  >
                    <Link href="/register" className="w-full">
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
