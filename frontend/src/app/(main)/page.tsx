import Navbar from "@/components/shared/Navbar";
import Hero from "./features/Hero";

export default function Home() {
  return (
    <div className="bg-radial from-emerald-400 from-20% to-black">
      <div className="mx-20 min-h-screen flex flex-col">
        <div className="border-b border-b-emerald-600 dark:border-b-emerald-300 py-2">
          <Navbar />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Hero />
        </div>
      </div>
    </div>
  );
}
