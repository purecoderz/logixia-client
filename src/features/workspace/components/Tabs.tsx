// components/Tabs.tsx
import { File, X } from "lucide-react";
import type { FsNode } from "../utils/File";

type TabsProps = {
  tabs: FsNode[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
};

export function Tabs({ tabs, activeId, onSelect, onClose }: TabsProps) {
  return (
    <div className="h-9 shrink-0 flex overflow-x-auto bg-surface border-b border-line">
      {tabs.map((t) => (
        <div
          key={t.id}
          onClick={() => onSelect(t.id)}
          onAuxClick={() => onClose(t.id)}
          className={`group flex items-center gap-1.5 px-3 text-sm cursor-pointer border-r border-line whitespace-nowrap ${
            activeId === t.id
              ? "bg-input text-body border-t-2 border-t-accent"
              : "text-muted hover:bg-hover/40"
          }`}
        >
          <File size={14} />
          <span>{t.name}</span>
          <button
            aria-label="Close tab"
            onClick={(e) => {
              e.stopPropagation();
              onClose(t.id);
            }}
            className="p-0.5 rounded hover:bg-hover"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
