import {
  Eye,
  FileCode2,
  FolderOpen,
  Hand,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  Pencil,
  Radio,
  Terminal,
  Users,
} from "lucide-react";
import { useState } from "react";
import { CodeTokens, Reveal, SectionHeading, type CodeLineTokens } from "../shared";

const baseCode: CodeLineTokens[] = [
  [["kw", "def "], ["fn", "average"], ["txt", "("], ["var", "scores"], ["txt", "):"]],
  [["txt", "    total = "], ["fn", "sum"], ["txt", "(scores)"]],
  [["kw", "    return "], ["txt", "total / "], ["fn", "len"], ["txt", "(scores)"]],
  [],
  [["txt", "grades = ["], ["num", "72"], ["txt", ", "], ["num", "88"], ["txt", ", "], ["num", "95"], ["txt", "]"]],
  [["fn", "print"], ["txt", "("], ["fn", "average"], ["txt", "(grades))"]],
];

const studentLines: CodeLineTokens[] = [
  [["kw", "    if not "], ["txt", "scores:"], ["com", "  # empty list?"]],
  [["kw", "        return "], ["num", "0"]],
];

const participants = [
  { name: "Tunde A.", initials: "TA", hand: true },
  { name: "Amara N.", initials: "AN" },
  { name: "Chidi E.", initials: "CE" },
  { name: "Zainab B.", initials: "ZB" },
];

const features = [
  {
    icon: Radio,
    title: "Real-time code sync",
    text: "Every keystroke the instructor types shows up in your editor as it happens. See how a solution is built, not just the final answer.",
  },
  {
    icon: Lock,
    title: "Instructor-controlled editing",
    text: "Students watch by default. The instructor can hand the editor to any student to solve, fix or extend the code live.",
  },
  {
    icon: Hand,
    title: "Ask without interrupting",
    text: "Use the class chat or raise your hand. A built-in terminal shows the output for everyone.",
  },
];

export function HomeLiveClassroom() {
  const [editor, setEditor] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const tundeEditing = editor === "Tunde A.";

  const code: CodeLineTokens[] = tundeEditing
    ? [...baseCode.slice(0, 1), ...studentLines, ...baseCode.slice(1)]
    : baseCode;

  return (
    <section id="classroom" className="relative overflow-hidden border-y border-line bg-surface/40">
      <div aria-hidden="true" className="home-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <SectionHeading
          align="center"
          eyebrow="Live cohort classroom"
          title={
            <>
              Don't just watch code. <span className="home-text-gradient">Be part of it.</span>
            </>
          }
          description="Live sessions happen in a shared coding space, not a video call. Follow the instructor's code as they write it, ask questions, and take over the editor when you're invited."
        />

        <Reveal className="mt-14">
          <div className="home-window-shadow overflow-hidden rounded-xl border border-line bg-surface">
            {/* Session bar */}
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-muted/60 px-4 py-2.5">
              <span className="inline-flex items-center gap-2 rounded-md bg-danger/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-danger">
                <span className="home-live-dot size-1.5 rounded-full bg-danger" />
                Live
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                <span className="font-semibold">Cohort 07</span>
                <span className="text-muted"> · Python Foundations · Functions in practice</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className={`grid size-8 place-items-center rounded-md border border-line ${
                    muted ? "text-muted hover:bg-hover" : "bg-success/15 text-success"
                  }`}
                >
                  {muted ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
                <span className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-body sm:inline-flex">
                  <Users size={14} /> 24
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr_280px]">
              {/* File explorer */}
              <aside className="hidden border-r border-line bg-surface p-3 lg:block" aria-label="Files">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Explorer
                </p>
                <ul className="mt-2 space-y-0.5 font-mono text-xs">
                  <li className="flex items-center gap-2 px-2 py-1.5 text-body">
                    <FolderOpen size={14} className="text-warning" /> session-07
                  </li>
                  {["main.py", "helpers.py", "test_main.py"].map((f, i) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 rounded-md py-1.5 pl-6 pr-2 ${
                        i === 0 ? "bg-accent/10 text-foreground" : "text-muted"
                      }`}
                    >
                      <FileCode2 size={13} className={i === 0 ? "text-accent" : ""} /> {f}
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Editor + terminal */}
              <div className="flex min-w-0 flex-col bg-input">
                <div className="flex items-center justify-between border-b border-line px-3">
                  <span className="border-b-2 border-accent px-2 py-2 font-mono text-xs text-foreground">
                    main.py
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
                    {tundeEditing ? (
                      <>
                        <Pencil size={12} className="home-peer-text" /> Tunde is editing
                      </>
                    ) : (
                      <>
                        <Eye size={12} /> Students: view only
                      </>
                    )}
                  </span>
                </div>
                <pre className="relative flex-1 overflow-x-auto py-4 font-mono text-[13px] leading-7">
                  {code.map((line, i) => {
                    const isStudent = tundeEditing && (i === 1 || i === 2);
                    const instructorLine = tundeEditing ? 4 : 2;
                    return (
                      <div
                        key={`${tundeEditing}-${i}`}
                        className={`flex ${isStudent ? "home-line-in home-peer-border border-l-2 bg-hover/60" : "border-l-2 border-transparent"}`}
                      >
                        <span className="w-10 shrink-0 select-none pr-3 text-right text-muted/60">
                          {i + 1}
                        </span>
                        <span className="relative whitespace-pre">
                          <CodeTokens line={line} />
                          {line.length === 0 && "\u00a0"}
                          {i === instructorLine && !tundeEditing && (
                            <>
                              <span className="home-caret ml-0.5" />
                              <span className="ml-1.5 whitespace-nowrap rounded-sm bg-accent px-1.5 py-px align-middle font-sans text-[10px] font-semibold leading-4 text-on-accent">
                                Ms. Okafor
                              </span>
                            </>
                          )}
                          {i === 2 && tundeEditing && (
                            <>
                              <span className="home-caret home-caret-peer ml-0.5" />
                              <span className="home-peer-bg ml-1.5 whitespace-nowrap rounded-sm px-1.5 py-px align-middle font-sans text-[10px] font-semibold leading-4 text-on-accent">
                                Tunde
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </pre>
                <div className="border-t border-line bg-canvas/60 px-4 py-3 font-mono text-xs">
                  <p className="flex items-center gap-2 text-muted">
                    <Terminal size={13} /> Terminal
                  </p>
                  <p className="mt-2 text-body">
                    <span className="text-success">$</span> python main.py
                  </p>
                  <p className="mt-1 text-foreground">85.0</p>
                  {tundeEditing && (
                    <p className="home-line-in mt-1 text-success">
                      ✓ average([]) now returns 0
                    </p>
                  )}
                </div>
              </div>

              {/* Participants + chat */}
              <aside className="flex flex-col border-t border-line bg-surface lg:border-l lg:border-t-0">
                <div className="border-b border-line p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Participants
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-full bg-accent text-[11px] font-bold text-on-accent">
                      MO
                    </span>
                    <span className="flex-1 text-sm text-foreground">Ms. Okafor</span>
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                      Instructor
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {participants.map((p) => {
                      const canEdit = editor === p.name;
                      return (
                        <li key={p.name} className="flex items-center gap-2.5 py-1">
                          <span
                            className={`grid size-7 place-items-center rounded-full text-[11px] font-bold ${
                              canEdit ? "home-peer-bg text-on-accent" : "bg-surface-muted text-body"
                            }`}
                          >
                            {p.initials}
                          </span>
                          <span className="flex flex-1 items-center gap-1.5 text-sm text-body">
                            {p.name}
                            {p.hand && !canEdit && (
                              <Hand size={13} className="text-warning" aria-label="Hand raised" />
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditor(canEdit ? null : p.name)}
                            aria-pressed={canEdit}
                            aria-label={`${canEdit ? "Remove" : "Give"} edit access for ${p.name}`}
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                              canEdit
                                ? "home-peer-border home-peer-text"
                                : "border-line text-muted hover:border-line-strong hover:text-foreground"
                            }`}
                          >
                            {canEdit ? <Pencil size={11} /> : <Lock size={11} />}
                            {canEdit ? "Editing" : "View"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-2 text-xs text-muted">+ 19 more watching</p>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    <MessageSquare size={12} /> Class chat
                  </p>
                  <ul className="mt-3 space-y-3 text-[13px]">
                    <li>
                      <span className="font-semibold text-foreground">Amara</span>
                      <p className="text-body">Why len(scores) and not just 3?</p>
                    </li>
                    <li>
                      <span className="font-semibold text-accent">Ms. Okafor</span>
                      <p className="text-body">So it works for a list of any size.</p>
                    </li>
                    {tundeEditing ? (
                      <>
                        <li className="home-line-in rounded-md bg-hover px-2 py-1.5 text-xs text-muted">
                          Tunde can now edit main.py
                        </li>
                        <li className="home-line-in">
                          <span className="home-peer-text font-semibold">Tunde</span>
                          <p className="text-body">Added a check so an empty list doesn't crash.</p>
                        </li>
                      </>
                    ) : (
                      <li>
                        <span className="font-semibold text-foreground">Tunde</span>
                        <p className="text-body">What happens if the list is empty?</p>
                      </li>
                    )}
                  </ul>
                </div>
              </aside>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Try it: press <span className="font-medium text-foreground">View</span> next to Tunde to give him the editor.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="h-full rounded-xl border border-line bg-surface p-6">
                <f.icon size={20} className="text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-muted">
          Every cohort gets its own classroom. Two groups can study the same course while
          their sessions, tasks and progress stay completely separate.
        </p>
        <p className="mt-6 text-center font-mono text-sm text-accent">
          Learn together. Code together. Solve problems together.
        </p>
      </div>
    </section>
  );
}
