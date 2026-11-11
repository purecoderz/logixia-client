import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";

import { SystemStatePage } from "../components/SystemStatePage";

interface ComingSoonPageProps {
  title: string;
  description?: string;
  backTo?: string;
}

export function ComingSoonPage({
  title,
  description = "We’re still putting the finishing touches on this feature. It will be available in a future update.",
  backTo = "/",
}: ComingSoonPageProps) {
  return (
    <SystemStatePage
      eyebrow="Coming soon"
      title={title}
      description={description}
      icon={<Construction size={30} aria-hidden="true" />}
      actions={
        <Link
          to={backTo}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Go back
        </Link>
      }
    />
  );
}
