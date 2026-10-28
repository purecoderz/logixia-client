// components/Explorer.tsx
import { ChevronRight, ChevronDown, Folder, File, FilePlus, FolderPlus, ChevronsDownUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { FsNode } from "../utils/File";
import { NameModal } from "../../ui/NameModal";
import { ConfirmModal } from "../../ui/ConfirmModal";

type ExplorerProps = {
    nodes: FsNode[];
    activeFileId: string | null;
    onOpenFile: (id: string) => void;
    onRename: (id: string, name: string) => void;
    onCreate: (parentId: string | null, type: "file" | "folder", name: string) => void;
    onDelete: (id: string) => void;
    readOnly?: boolean; // viewers can browse and open files, but not create, rename or delete
};

export function Explorer({
    nodes,
    activeFileId,
    onOpenFile,
    onCreate,
    onRename,
    onDelete,
    readOnly = false,
}: ExplorerProps) {
    const [expanded, setExpanded] = useState<string[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [creating, setCreating] = useState<"file" | "folder" | null>(null);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const renamingTarget = nodes.find((n) => n.id === renamingId);
    const deletingTarget = nodes.find((n) => n.id === deletingId);

    const toggle = (id: string) => {
        setExpanded(expanded.includes(id) ? expanded.filter((x) => x !== id) : [...expanded, id]);
    };

    const getParentId = () => {
        const sel = nodes.find((n) => n.id === selectedId);
        return !sel ? null : sel.type === "folder" ? sel.id : sel.parentId;
    };

    const handleModalSubmit = (name: string) => {
        const parentId = getParentId();
        if (parentId && !expanded.includes(parentId)) setExpanded([...expanded, parentId]);
        onCreate(parentId, creating!, name);
    };

    const renderLevel = (parentId: string | null, depth: number) => {
        return nodes
            .filter((n) => n.parentId === parentId)
            .map((n) => (
                <div key={n.id}>
                    <div
                        tabIndex={0}
                        onClick={() => {
                            setSelectedId(n.id);
                            if (n.type === "folder") toggle(n.id);
                            else onOpenFile(n.id);
                        }}
                        onDoubleClick={() => {
                            if (!readOnly) setRenamingId(n.id);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Delete" && !readOnly) setDeletingId(n.id);
                        }}
                        style={{ paddingLeft: 8 + depth * 12 }}
                        className={`group flex items-center gap-1.5 h-6 pr-2 cursor-pointer outline-none ${
                            selectedId === n.id ? "bg-[#30363d]/70" : "hover:bg-[#30363d]/40"
                        }`}
                    >
                        {n.type === "folder" ? (
                            expanded.includes(n.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        ) : (
                            <span className="w-3.5" />
                        )}
                        {n.type === "folder" ? (
                            <Folder size={15} className="text-[#58a6ff]" />
                        ) : (
                            <File size={15} className="text-[#8b949e]" />
                        )}
                        <span className="flex-1 truncate">{n.name}</span>

                        {!readOnly && (
                            <button
                                title="Delete"
                                aria-label="Delete"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingId(n.id);
                                }}
                                className="hidden group-hover:block p-0.5 rounded text-[#8b949e] hover:text-red-400 hover:bg-[#30363d]"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>

                    {n.type === "folder" && expanded.includes(n.id) && renderLevel(n.id, depth + 1)}
                </div>
            ));
    };

    useEffect(() => {
        if (activeFileId) setSelectedId(activeFileId);
    }, [activeFileId]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b border-[#30363d]">
                <span className="text-[11px] font-semibold tracking-wider text-[#8b949e]">EXPLORER</span>
                <div className="flex items-center gap-0.5 text-[#8b949e]">
                    {!readOnly && (
                        <>
                            <button title="New File" onClick={() => setCreating("file")} className="p-1 rounded hover:bg-[#30363d]/70">
                                <FilePlus size={15} />
                            </button>
                            <button title="New Folder" onClick={() => setCreating("folder")} className="p-1 rounded hover:bg-[#30363d]/70">
                                <FolderPlus size={15} />
                            </button>
                        </>
                    )}
                    <button title="Collapse All" onClick={() => setExpanded([])} className="p-1 rounded hover:bg-[#30363d]/70">
                        <ChevronsDownUp size={15} />
                    </button>
                </div>
            </div>

            {/* Tree */}
            <div className="flex-1 min-h-0 overflow-y-auto py-1 text-sm">{renderLevel(null, 0)}</div>

            {creating && (
                <NameModal
                    title={creating === "file" ? "New file" : "New folder"}
                    validate={(name) =>
                        nodes.some((n) => n.parentId === getParentId() && n.name === name)
                            ? "That name already exists here"
                            : null
                    }
                    onSubmit={handleModalSubmit}
                    onClose={() => setCreating(null)}
                />
            )}

            {renamingTarget && (
                <NameModal
                    title={`Rename ${renamingTarget.type}`}
                    confirmLabel="Rename"
                    initialValue={renamingTarget.name}
                    validate={(name) =>
                        nodes.some(
                            (n) =>
                                n.parentId === renamingTarget.parentId &&
                                n.id !== renamingTarget.id &&
                                n.name === name
                        )
                            ? "That name already exists here"
                            : null
                    }
                    onSubmit={(name) => onRename(renamingTarget.id, name)}
                    onClose={() => setRenamingId(null)}
                />
            )}

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