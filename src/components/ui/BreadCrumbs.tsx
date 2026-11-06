import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  /** Leave out on the last one: it's the page you're on. */
  to?: string;
}

const ItemsContext = createContext<Crumb[]>([]);
const SetterContext = createContext<((items: Crumb[]) => void) | null>(null);

const sameCrumbs = (a: Crumb[], b: Crumb[]) =>
  a.length === b.length && a.every((c, i) => c.label === b[i].label && c.to === b[i].to);

/** Wrap the topbar and the page area in this, once, in the layout. */
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Crumb[]>([]);
  const set = useCallback(
    (next: Crumb[]) => setItems((prev) => (sameCrumbs(prev, next) ? prev : next)),
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
            <Link to={c.to} className="max-w-48 truncate hover:text-body hover:underline">
              {c.label}
            </Link>
          ) : (
            <span aria-current="page" className="max-w-64 truncate text-foreground">
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
        <Link to={parent.to} className="inline-flex min-h-11 items-center gap-1.5 text-sm text-body hover:text-foreground md:hidden">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 4L6 8l4 4" />
          </svg>
          <span className="max-w-40 truncate">{parent.label}</span>
        </Link>
      )}
    </nav>
  );
}