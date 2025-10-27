import Link from "next/link";
import { ModeToggle } from "../ModeToggle";

function Navbar() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-10">
        <h1 className="text-lg text-emerald-600 dark:text-emerald-300">
          {" "}
          <Link href="/"> Neuro-Nest </Link>
        </h1>
        <ul className="flex gap-8 text-gray-400">
          <Link href="/courses"> Courses </Link>
          <Link href="/communities"> Communities </Link>
          <Link href="/about-us"> About Neuro-Nest </Link>
        </ul>
        <div></div>
      </div>

      <div>
        <ModeToggle />
      </div>
    </div>
  );
}

export default Navbar;
