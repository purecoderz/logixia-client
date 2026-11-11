import { InlineFileName } from "./InlineFileName";
// components/Explorer.tsx
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  FilePlus,
  FolderPlus,
  ChevronsDownUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { FsNode } from "../utils/File";
import { getPath } from "../utils/exportProject";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type ExplorerProps = {
  nodes: FsNode[];
  activeFileId: string | null;
  onOpenFile: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCreate: (
    parentId: string | null,
    type: "file" | "folder",
    name: string,
  ) => void;
  onDelete: (id: string) => void;
  touchActions?: boolean;
  readOnly?: boolean; // viewers can browse and open files, but not create, rename or delete
  expandedPaths?: string[];
  onFolderToggle?: (path: string, expanded: boolean) => void;
};

export function Explorer({
  nodes,
  activeFileId,
  onOpenFile,
  onCreate,
  onRename,
  onDelete,
  readOnly = false,
  touchActions = false,
  expandedPaths,
  onFolderToggle,
}: ExplorerProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState<{
    type: "file" | "folder";
    parentId: string | null;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deletingTarget = nodes.find((n) => n.id === deletingId);

  const toggle = (node: FsNode) => {
    const willExpand = !expanded.includes(node.id);
    setExpanded((current) => willExpand
      ? current.includes(node.id) ? current : [...current, node.id]
      : current.filter((id) => id !== node.id));
    onFolderToggle?.(getPath(nodes, node), willExpand);
  };

  useEffect(() => {
    if (!expandedPaths) return;
    const wanted = new Set(expandedPaths);
    setExpanded(nodes
      .filter((node) => node.type === "folder" && wanted.has(getPath(nodes, node)))
      .map((node) => node.id));
  }, [expandedPaths, nodes]);

  const getParentId = () => {
    const sel = nodes.find((n) => n.id === selectedId);
    return !sel ? null : sel.type === "folder" ? sel.id : sel.parentId;
  };

  const startCreating = (type: "file" | "folder") => {
    const parentId = getParentId();
    setRenamingId(null);
    if (parentId) {
      setExpanded((current) =>
        current.includes(parentId) ? current : [...current, parentId],
      );
      const parent = nodes.find((node) => node.id === parentId);
      if (parent && !expanded.includes(parentId)) {
        onFolderToggle?.(getPath(nodes, parent), true);
      }
    }
    setCreating({ type, parentId });
  };

  const renderLevel = (parentId: string | null, depth: number) => {
    return (
      <>
        {creating && !readOnly && creating.parentId === parentId && (
          <div
            key={`create-${parentId}-${creating.type}`}
            style={{ paddingLeft: 8 + depth * 12 }}
            className={`flex items-center gap-1.5 pr-2 ${touchActions ? "h-10" : "h-6"}`}
          >
            <span className="w-3.5 shrink-0" />
            {creating.type === "folder" ? (
              <Folder size={15} className="shrink-0 text-accent" />
            ) : (
              <File size={15} className="shrink-0 text-muted" />
            )}
            <InlineFileName
              action="create"
              name=""
              type={creating.type}
              validate={(name) =>
                nodes.some(
                  (node) => node.parentId === parentId && node.name === name,
                )
                  ? "That name already exists here"
                  : null
              }
              onSave={(name) => {
                onCreate(parentId, creating.type, name);
                setCreating(null);
              }}
              onCancel={() => setCreating(null)}
            />
          </div>
        )}
        {nodes
          .filter((n) => n.parentId === parentId)
          .map((n) => (
            <div key={n.id}>
              <div
                data-live-explorer-path={getPath(nodes, n)}
                tabIndex={0}
                onClick={() => {
                  setSelectedId(n.id);
                  if (n.type === "folder") toggle(n);
                  else onOpenFile(n.id);
                }}
                onDoubleClick={() => {
                  if (!readOnly) {
                    setCreating(null);
                    setRenamingId(n.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Delete" && !readOnly) setDeletingId(n.id);
                  if (e.key === "F2" && !readOnly) {
                    e.preventDefault();
                    setCreating(null);
                    setRenamingId(n.id);
                  }
                }}
                style={{ paddingLeft: 8 + depth * 12 }}
                className={`group flex items-center gap-1.5 pr-2 cursor-pointer outline-none ${touchActions ? "h-10" : "h-6"} ${
                  selectedId === n.id
                    ? "bg-accent/15 text-foreground"
                    : "hover:bg-hover/40"
                }`}
              >
                {n.type === "folder" ? (
                  expanded.includes(n.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )
                ) : (
                  <span className="w-3.5" />
                )}
                {n.type === "folder" ? (
                  <Folder size={15} className="text-accent" />
                ) : (
                  <File size={15} className="text-muted" />
                )}
                {renamingId === n.id && !readOnly ? (
                  <InlineFileName
                    name={n.name}
                    type={n.type}
                    validate={(name) =>
                      nodes.some(
                        (other) =>
                          other.parentId === n.parentId &&
                          other.id !== n.id &&
                          other.name === name,
                      )
                        ? "That name already exists here"
                        : null
                    }
                    onSave={(name) => {
                      onRename(n.id, name);
                      setRenamingId(null);
                    }}
                    onCancel={() => setRenamingId(null)}
                  />
                ) : (
                  <span className="flex-1 truncate">{n.name}</span>
                )}

                {!readOnly && touchActions && renamingId !== n.id && (
                  <button
                    type="button"
                    aria-label={`Rename ${n.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setCreating(null);
                      setRenamingId(n.id);
                    }}
                    className="flex size-8 shrink-0 items-center justify-center rounded text-muted hover:bg-hover"
                  >
                    <Pencil size={15} />
                  </button>
                )}
                {!readOnly && renamingId !== n.id && (
                  <button
                    title="Delete"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(n.id);
                    }}
                    className={`${touchActions ? "flex size-8 shrink-0 items-center justify-center" : "hidden group-hover:block p-0.5"} rounded text-muted hover:text-danger hover:bg-hover`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {n.type === "folder" &&
                expanded.includes(n.id) &&
                renderLevel(n.id, depth + 1)}
            </div>
          ))}
      </>
    );
  };

  useEffect(() => {
    if (activeFileId) setSelectedId(activeFileId);
  }, [activeFileId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b border-line">
        <span className="text-[11px] font-semibold tracking-wider text-muted">
          EXPLORER
        </span>
        <div className="flex items-center gap-0.5 text-muted">
          {!readOnly && (
            <>
              <button
                title="New File"
                onClick={() => startCreating("file")}
                className="p-1 rounded hover:bg-hover/70"
              >
                <FilePlus size={15} />
              </button>
              <button
                title="New Folder"
                onClick={() => startCreating("folder")}
                className="p-1 rounded hover:bg-hover/70"
              >
                <FolderPlus size={15} />
              </button>
            </>
          )}
          <button
            title="Collapse All"
            onClick={() => setExpanded([])}
            className="p-1 rounded hover:bg-hover/70"
          >
            <ChevronsDownUp size={15} />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1 text-sm">
        {renderLevel(null, 0)}
      </div>

      <ConfirmModal
        isOpen={!!deletingTarget}
        title={`Delete ${deletingTarget?.type ?? ""}`}
        message={`Delete "${deletingTarget?.name ?? ""}"${
          deletingTarget?.type === "folder" ? " and everything inside it" : ""
        }?`}
        confirmText="Delete"
        variant="danger"
        onConfirm={() => {
          onDelete(deletingTarget!.id);
          setSelectedId(null);
          setDeletingId(null);
        }}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
