import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { homeLinks } from "../config";
import { Reveal, buttonStyles } from "../shared";

export function HomePlaygroundCta() {
  return (
    <section aria-labelledby="playground-cta" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 sm:px-14 sm:py-20">
          <div aria-hidden="true" className="home-glow pointer-events-none absolute inset-0" />
          <div aria-hidden="true" className="home-grid pointer-events-none absolute inset-0" />
          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="font-mono text-sm text-accent">{">>> ready when you are"}</p>
              <h2
                id="playground-cta"
                className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
              >
                Write your first line of code today.
              </h2>
              <p className="mt-4 max-w-lg text-lg text-body">
                Open the playground, write some code and run it. It's the quickest way to
                see what learning with Logixia feels like.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={homeLinks.playground} state={{ fromPublic: true }} className={buttonStyles.primary}>
                  <Play size={16} /> Open the playground
                </Link>
                <Link to={homeLinks.getStarted} state={{ fromPublic: true }} className={buttonStyles.secondary}>
                  Create your account <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <pre className="min-w-0 overflow-x-auto rounded-xl border border-line bg-input p-5 font-mono text-[13px] leading-7">
              <span className="hl-com"># playground.py</span>
              {"\n"}
              <span className="hl-txt">skills = [</span>
              <span className="hl-str">"learn"</span>
              <span className="hl-txt">, </span>
              <span className="hl-str">"code"</span>
              <span className="hl-txt">, </span>
              <span className="hl-str">"practice"</span>
              <span className="hl-txt">]</span>
              {"\n"}
              <span className="hl-kw">for </span>
              <span className="hl-txt">s </span>
              <span className="hl-kw">in </span>
              <span className="hl-txt">skills:</span>
              {"\n"}
              <span className="hl-fn">    print</span>
              <span className="hl-txt">(s.</span>
              <span className="hl-fn">upper</span>
              <span className="hl-txt">())</span>
              <span className="home-caret ml-0.5" />
            </pre>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
