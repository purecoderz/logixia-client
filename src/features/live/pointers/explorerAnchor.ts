export interface ExplorerAnchor {
  kind: "explorer";
  path: string;
  rowX: number;
  rowY: number;
}

const rows = (surface: HTMLElement) =>
  Array.from(surface.querySelectorAll<HTMLElement>("[data-live-explorer-path]"));

const rowForPath = (surface: HTMLElement, path: string) =>
  rows(surface).find((row) => row.dataset.liveExplorerPath === path) ?? null;

export function captureExplorerAnchor(
  surface: HTMLElement,
  target: EventTarget | null,
  x: number,
  y: number,
): ExplorerAnchor | undefined {
  const row = target instanceof Element
    ? target.closest<HTMLElement>("[data-live-explorer-path]")
    : null;
  if (!row || !surface.contains(row)) return;

  const bounds = row.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  return {
    kind: "explorer",
    path: row.dataset.liveExplorerPath ?? "",
    rowX: Math.min(1, Math.max(0, (x - bounds.left) / bounds.width)),
    rowY: Math.min(1, Math.max(0, (y - bounds.top) / bounds.height)),
  };
}

export function resolveExplorerAnchor(
  surface: HTMLElement,
  anchor: ExplorerAnchor,
): { x: number; y: number } | null {
  const row = rowForPath(surface, anchor.path);
  if (!row) return null;

  const rowBounds = row.getBoundingClientRect();
  const surfaceBounds = surface.getBoundingClientRect();
  if (!surfaceBounds.width || !surfaceBounds.height) return null;

  const x = rowBounds.left + rowBounds.width * anchor.rowX;
  const y = rowBounds.top + rowBounds.height * anchor.rowY;
  if (
    x < surfaceBounds.left || x > surfaceBounds.right ||
    y < surfaceBounds.top || y > surfaceBounds.bottom
  ) return null;

  return {
    x: (x - surfaceBounds.left) / surfaceBounds.width,
    y: (y - surfaceBounds.top) / surfaceBounds.height,
  };
}

export function followExplorerAnchor(surface: HTMLElement, anchor: ExplorerAnchor) {
  rowForPath(surface, anchor.path)?.scrollIntoView({ block: "nearest" });
}
