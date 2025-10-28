"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-client";
import Link from "next/link";

function Hero() {
  const { user } = useAuth();
  return (
    <div className="bg-white/5 backdrop-blur-sm p-20 rounded-md">
      <div className="text-center">
        <h1 className="text-4xl  text-white">
          Welcome to{" "}
          <span className="font-bold text-emerald-200">NeuroNest</span>
        </h1>
        <p className="mt-4 text-gray-200">
          Learn, connect and grow with a community of innovators.
        </p>
        {!user && (
          <div className="mt-4">
            <Button variant={"default"}>
              <Link href={"/login"}>Get Started</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Hero;
