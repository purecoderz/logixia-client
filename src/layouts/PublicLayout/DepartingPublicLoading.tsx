import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { AppLoading } from "@/components/ui/AppLoading";
import { NAVIGATION_DURATION } from "../navigation/NavigationMotion";

/** Brief branded handoff when leaving the public landing page. */
export function DepartingPublicLoading() {
  const { state } = useLocation();
  const [visible, setVisible] = useState(() => state?.fromPublic === true);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(
      () => setVisible(false),
      NAVIGATION_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [visible]);

  return visible ? <AppLoading message="Opening your workspace…" /> : null;
}
