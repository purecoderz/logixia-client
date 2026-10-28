import { Link } from "react-router-dom";
import { ArrowRight, Play, Terminal } from "lucide-react";

export function Hero() {
  return (
    <section className="grid items-start gap-8 pb-10 md:grid-cols-2 md:items-center md:pb-12">
      <div>
        <span className="inline-block rounded-full border border-[#30363d] px-3 py-1 text-xs text-[#8b949e]">
          Built for Nigerian beginners
        </span>

        <h1 className="mt-4 text-3xl font-medium leading-tight text-white md:text-4xl xl:text-5xl">
          Learn to code with a group,{" "}
          <span className="text-[#58a6ff]">or on your own</span>
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-[#8b949e] md:text-base">
          Join a live cohort with an instructor, or pick a ready-made course
          and learn at your own pace. Write and run real code right here on
          the platform, no setup needed.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#cohort"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#238636] px-5 py-2.5 text-sm font-medium text-white sm:w-auto"
          >
            Join a cohort <ArrowRight size={16} />
          </a>
          <Link
            to="/courses"
            className="w-full rounded-lg border border-[#30363d] px-5 py-2.5 text-center text-sm sm:w-auto"
          >
            Browse courses
          </Link>
        </div>

        <Link
          to="/playground"
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#58a6ff] hover:underline"
        >
          <Terminal size={16} />
          Or try the free playground and write code now
        </Link>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#8b949e]">
          <span><b className="text-white">12 weeks</b> live cohort</span>
          <span><b className="text-white">72+</b> lessons</span>
          <span><b className="text-white">₦15,000</b> to start</span>
        </div>
      </div>

      {/* Editor teaser */}
      <div className="hidden overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] md:block">
        <div className="flex items-center justify-between border-b border-[#30363d] px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f85149]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d29922]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3fb950]" />
            <span className="ml-2 text-[11px] text-[#8b949e]">welcome.py</span>
          </div>
          <Link
            to="/playground"
            className="inline-flex items-center gap-1 rounded-md bg-[#238636] px-2.5 py-1 text-[11px] font-medium text-white"
          >
            <Play size={11} /> Run it yourself
          </Link>
        </div>

        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-[#c9d1d9] md:text-sm">
{`def start_learning(name):
    print(f"Welcome, {name}!")
    return "Let's build something"

start_learning("you")`}
        </pre>

        <div className="border-t border-[#30363d] bg-[#0d1117] px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-[#8b949e]">Output</p>
          <p className="mt-1 text-sm text-[#3fb950]">Welcome, you!</p>
        </div>
      </div>
    </section>
  );
}