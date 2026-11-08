import { Link } from "react-router-dom";

interface CourseCardProps {
  title: string;
  meta: string;
  price: string;
  filename: string;
  code: string;
  to: string;
}

export function CourseCard({
  title,
  meta,
  price,
  filename,
  code,
  to,
}: CourseCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="bg-input">
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#f85149]" />
          <span className="h-2 w-2 rounded-full bg-[#d29922]" />
          <span className="h-2 w-2 rounded-full bg-[#3fb950]" />
          <span className="ml-1.5 text-[11px] text-muted">{filename}</span>
        </div>
        <pre className="overflow-x-auto px-3 py-2.5 text-xs leading-relaxed text-body">
          {code}
        </pre>
      </div>

      <div className="border-t border-line p-3.5">
        <p className="text-[15px] font-medium text-foreground">{title}</p>
        <p className="mt-0.5 mb-3 text-xs text-muted">{meta}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-foreground">{price}</span>
          <Link
            to={to}
            className="rounded-lg bg-[#238636] px-3 py-1.5 text-xs font-medium text-white"
          >
            Buy
          </Link>
        </div>
      </div>
    </div>
  );
}
