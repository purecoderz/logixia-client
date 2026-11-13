import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft } from "lucide-react";
import {
  Link,
  useInRouterContext,
  useLocation,
  useNavigate,
} from "react-router-dom";

export interface Crumb {
  label: string;
  /** Leave out on the last one: it's the page you're on. */
  to?: string;
}

const ItemsContext = createContext<Crumb[]>([]);
const SetterContext = createContext<((items: Crumb[]) => void) | null>(null);

const sameCrumbs = (a: Crumb[], b: Crumb[]) =>
  a.length === b.length &&
  a.every((c, i) => c.label === b[i].label && c.to === b[i].to);

/** Wrap the topbar and the page area in this, once, in the layout. */
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Crumb[]>([]);
  const set = useCallback(
    (next: Crumb[]) =>
      setItems((prev) => (sameCrumbs(prev, next) ? prev : next)),
    [],
  );
  return (
    <SetterContext.Provider value={set}>
      <ItemsContext.Provider value={items}>{children}</ItemsContext.Provider>
    </SetterContext.Provider>
  );
}

/**
 * Pages put their breadcrumb here. With the provider in the layout it shows in the top bar and
 * nothing is drawn in the page. Without one, it falls back to a trail at the top of the page.
 */
export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  const set = useContext(SetterContext);

  useEffect(() => {
    set?.(items);
  });
  useEffect(() => () => set?.([]), [set]); // leaving the page clears it

  if (set) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <Trail items={items} />
    </nav>
  );
}

function Trail({ items }: { items: Crumb[] }) {
  return (
    <ol className="flex min-w-0 items-center gap-2 text-sm text-muted">
      {items.map((c, i) => (
        <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-2">
          {i > 0 && <span aria-hidden="true">/</span>}
          {c.to ? (
            <Link
              to={c.to}
              className="max-w-48 truncate hover:text-body hover:underline"
            >
              {c.label}
            </Link>
          ) : (
            <span
              aria-current="page"
              className="max-w-64 truncate text-foreground"
            >
              {c.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Put this in the top bar. It draws nothing when the page has no breadcrumb. */
export function TopbarBreadcrumbs() {
  const items = useContext(ItemsContext);
  if (items.length === 0) return null;

  // On a phone there's no room for the whole trail: show a way back to the parent
  const parent = [...items].reverse().find((c) => c.to);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <div className="hidden md:block">
        <Trail items={items} />
      </div>
      {parent?.to && (
        <Link
          to={parent.to}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-body hover:text-foreground md:hidden"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 4L6 8l4 4" />
          </svg>
          <span className="max-w-40 truncate">{parent.label}</span>
        </Link>
      )}
    </nav>
  );
}

const backButtonClass =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-input px-2.5 text-xs font-medium text-body transition-colors hover:bg-hover hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent";

function RouterBackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const items = useContext(ItemsContext);
  const parent = [...items].reverse().find((c) => c.to);

  const handleBack = () => {
    const idx =
      typeof window !== "undefined" &&
      window.history.state &&
      typeof window.history.state.idx === "number"
        ? window.history.state.idx
        : 0;
    if (idx > 0) {
      navigate(-1);
      return;
    }
    if (parent?.to) {
      navigate(parent.to);
      return;
    }
    if (pathname.startsWith("/instructor") && pathname !== "/instructor") {
      navigate("/instructor");
      return;
    }
    if (pathname !== "/" && pathname !== "/instructor") {
      navigate("/");
      return;
    }
    navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
      className={backButtonClass}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <span className="hidden sm:inline">Back</span>
    </button>
  );
}

/** Global back button for topbars. Uses router history/breadcrumbs when inside a router. */
export function TopbarBackButton() {
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return (
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="Go back"
        title="Go back"
        className={backButtonClass}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Back</span>
      </button>
    );
  }
  return <RouterBackButton />;
}
