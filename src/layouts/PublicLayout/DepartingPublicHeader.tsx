import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";

/** Shared entry motion for pages that leave the public navigation shell. */
export function DepartingPublicHeader() {
  const { state } = useLocation();
  const [visible, setVisible] = useState(() => state?.fromPublic === true);
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 800);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      inert
      aria-hidden="true"
      className="playground-departing-header fixed inset-x-0 top-0 z-[100] bg-canvas text-body"
    >
      <PublicHeader />
    </div>
  );
}
