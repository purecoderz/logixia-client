// components/CodeWorkspace/CodeWorkspace.tsx
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
    PanelGroup,
    Panel,
    PanelResizeHandle,
    type ImperativePanelHandle,
} from "react-resizable-panels";
import { Folder, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, PanelRight } from "lucide-react";

import { CodeEditor } from "../CodeEditor/CodeEditor";
import { AlertModal } from "../ui/AlertModal";
import { NameModal } from "../ui/NameModal";

import { TerminalView, type TerminalLine } from "../SmartTerminal/TerminalView";
import { useTerminal } from "../../utils/Terminals/useTerminal";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useWorkspace } from "../../hooks/useWorkspace";
import { FileManagement, type FsNode } from "./utils/File";
import { Explorer } from "./components/Explorer";
import { Tabs } from "./components/Tabs";
import { exportProject, getPath } from "./utils/exportProject";
import { TopBar } from "./components/TopBar";
import { StatusBar } from "./components/StatusBar";
import { Drawer } from "./components/ui/Drawer";
import { LiveEditor } from "../CodeEditor/LiveEditor";

export interface WorkspaceContext {
    nodes: FsNode[];
    getFiles: () => Record<string, string>; // path -> content, for every file
}

type Slot = ReactNode | ((ctx: WorkspaceContext) => ReactNode);
type PaneName = "editor" | "aside";

interface CodeWorkspaceProps {
    storageKey: string;                    // where files, tabs and panel sizes are saved
    title: string;                         // top bar title, also the export name
    onBack?: () => void;
    starterFiles?: Record<string, string>; // created on first visit
    toolbar?: Slot;                        // a strip under the top bar
    aside?: Slot;                          // extra panel (task, chat...). A drawer on mobile
    asideTitle?: string;                   // gives the aside a framed header with an expand button
    asideFooter?: Slot;                    // pinned to the bottom of the aside (Submit...). In the strip on mobile
    asideLabel?: string;                   // label of the mobile button that opens the aside
    embedded?: boolean;
    layout?: "stacked" | "split";
    readOnly?: boolean;
    live?: boolean
    liveFiles?: Record<string, string>;
    sendFiles?: (name: string, text: string, line?: number) => void
    liveActivePath?: string | null;
    sendDelete?: (path: string) => void;
    sendRename?: (from: string, to: string) => void;
    sendActive?: (path: string) => void;
    currentLine?: number | null,
    onTerminalLines?: (lines: TerminalLine[]) => void;
}

function IconButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className="flex size-7 items-center justify-center rounded text-[#8b949e] transition-colors hover:bg-[#30363d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
        >
            {children}
        </button>
    );
}

function ExpandButton({ open, onClick }: { open: boolean; onClick: () => void }) {
    const Icon = open ? Minimize2 : Maximize2;
    return (
        <IconButton label={open ? "Exit full screen (Esc)" : "Expand"} onClick={onClick}>
            <Icon className="size-4" aria-hidden />
        </IconButton>
    );
}

function PaneHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
    return (
        <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#21262d] bg-[#161b22] pl-3 pr-1">
            <span className="text-xs text-[#8b949e]">{title}</span>
            <ExpandButton open={open} onClick={onToggle} />
        </div>
    );
}

// Turns its content into a full-screen overlay when expanded.
// The element stays mounted, so editor state survives.
function Pane({
    name,
    expanded,
    children,
}: {
    name: PaneName;
    expanded: PaneName | null;
    children: ReactNode;
}) {
    const open = expanded === name;
    return (
        <div className={open ? "fixed inset-0 z-50 flex flex-col bg-[#161b22] p-2" : "h-full"}>
            <div className="h-full min-h-0 flex-1">{children}</div>
        </div>
    );
}

export function CodeWorkspace({
    storageKey,
    title,
    onBack = () => window.history.back(),
    starterFiles,
    toolbar: toolbarProp,
    aside: asideProp,
    asideTitle,
    asideFooter: asideFooterProp,
    asideLabel = asideTitle ?? "Panel",
    layout = "stacked",
    embedded = false,
    readOnly = false,
    live = false,
    liveFiles,
    sendFiles,
    liveActivePath,
    sendDelete,
    sendRename,
    sendActive,
    onTerminalLines,
    currentLine
}: CodeWorkspaceProps) {
    const isMobile = useMediaQuery("(max-width: 767px)");

    const {
        nodes, setNodes, activeFileId, setActiveFileId, setOpenTabIds, activeFile, language, tabs,
        onCreateNode, onRenameNode, onDeleteNode, openFile, closeTab, updateContent, setLiveNodes,
    } = useWorkspace(storageKey);

    const terminal = useTerminal(nodes, setNodes);
    const runtime = terminal.isRunning ? "running" : terminal.ready ? "ready" : "loading";

    const [notice, setNotice] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [filesOpen, setFilesOpen] = useState(false);
    const [asideOpen, setAsideOpen] = useState(false);
    const [expanded, setExpanded] = useState<PaneName | null>(null);
    const [filesHidden, setFilesHidden] = useState(false);
    const explorerRef = useRef<ImperativePanelHandle>(null);

    const ctx: WorkspaceContext = {
        nodes,
        getFiles: () =>
            Object.fromEntries(
                nodes.filter((n) => n.type === "file").map((n) => [getPath(nodes, n), n.content ?? ""])
            ),
    };
    const resolve = (slot: Slot | undefined) => (typeof slot === "function" ? slot(ctx) : slot);
    const toolbar = resolve(toolbarProp);
    const aside = resolve(asideProp);
    const asideFooter = resolve(asideFooterProp);

    const isSplit = layout === "split" && !!aside;
    const framed = !!asideTitle || !!asideFooter;

    const currentPath = activeFile ? getPath(nodes, activeFile) : null;
    const [pendingOpen, setPendingOpen] = useState<string | null>(null);
    const [following, setFollowing] = useState(true);


    const waiting = terminal.prompt !== null ? terminal.prompt + terminal.input : null;

    // Writer: share my terminal output with the room
    useEffect(() => {
        if (!live || readOnly) return;
        const lines: TerminalLine[] = waiting
            ? [...terminal.lines, { kind: "stdout", text: waiting }]
            : terminal.lines;
        onTerminalLines?.(lines);
    }, [live, readOnly, terminal.lines, waiting]);

    // Server files -> workspace nodes
    useEffect(() => {
        if (live && liveFiles) setLiveNodes(liveFiles);
    }, [live, liveFiles]);

    // Nothing open yet: open the file the instructor is on, or the first one
    useEffect(() => {
        if (!live || activeFile) return;
        const target =
            (liveActivePath ? FileManagement.findFileByPath(nodes, liveActivePath) : undefined) ??
            nodes.find((n) => n.type === "file");
        if (target) openFile(target.id);
    }, [live, nodes, activeFile, liveActivePath]);

    // Writer: tell everyone which file I'm on, however I got there
    useEffect(() => {
        if (!live || readOnly || !currentPath) return;
        sendActive?.(currentPath);
    }, [live, readOnly, currentPath]);

    // Viewer: follow the instructor while following is on
    useEffect(() => {
        if (!live || !readOnly || !following || !liveActivePath) return;
        const target = FileManagement.findFileByPath(nodes, liveActivePath);
        if (target && target.id !== activeFileId) openFile(target.id);
    }, [live, readOnly, following, liveActivePath, nodes]);


    useEffect(() => {
        if (!live || !readOnly || !liveActivePath) return;
        if (currentPath === liveActivePath) setFollowing(true);
    }, [live, readOnly, liveActivePath, currentPath]);

    // A file I just created: open it as soon as it existsnwho
    useEffect(() => {
        if (!pendingOpen) return;
        const target = FileManagement.findFileByPath(nodes, pendingOpen);
        if (target) {
            openFile(target.id);
            setPendingOpen(null);
        }
    }, [pendingOpen, nodes]);



    // A student picked a file themselves: still following only if it's the instructor's file
    const pickFile = (id: string) => {
        if (!live || !readOnly) return;
        const node = nodes.find((n) => n.id === id);
        setFollowing(!!node && getPath(nodes, node) === liveActivePath);
    };

    const handleCreate = (parentId: string | null, type: "file" | "folder", name: string) => {
        if (readOnly) return;
        onCreateNode(parentId, type, name);
        if (type !== "file") return; // empty folders aren't synced

        const parent = nodes.find((n) => n.id === parentId);
        const path = parent ? `${getPath(nodes, parent)}/${name}` : name;
        sendFiles?.(path, ""); // the server now knows the file exists
        setPendingOpen(path);  // and I switch to it
    };

    const handleRename = (id: string, name: string) => {
        if (readOnly) return;
        const node = nodes.find((n) => n.id === id);
        if (node) {
            const from = getPath(nodes, node);
            const folder = from.slice(0, from.lastIndexOf("/") + 1); // "" at the root
            sendRename?.(from, folder + name);
        }
        onRenameNode(id, name);
    };

    const handleDelete = (id: string) => {
        if (readOnly) return;
        const node = nodes.find((n) => n.id === id);
        if (node) sendDelete?.(getPath(nodes, node)); // read the path before it disappears
        onDeleteNode(id);
    };

    // First visit: create the starter files
    useEffect(() => {
        if (nodes.length || !starterFiles) return;

        let next: FsNode[] = [];
        let firstId: string | null = null;

        for (const [name, content] of Object.entries(starterFiles)) {
            next = FileManagement.createFile(next, null, name);
            const created = next.find((n) => n.name === name);
            if (!created) continue;
            if (content) next = FileManagement.updateContent(next, created.id, content);
            firstId ??= created.id;
        }

        setNodes(next);
        if (firstId) {
            setOpenTabIds([firstId]);
            setActiveFileId(firstId);
        }
    }, []);

    // Esc leaves full screen
    useEffect(() => {
        if (!expanded) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [expanded]);

    const toggleExpand = (name: PaneName) => setExpanded((cur) => (cur === name ? null : name));

    const toggleFiles = () => {
        const p = explorerRef.current;
        if (!p) return;
        p.isCollapsed() ? p.expand() : p.collapse();
    };

    const onExportProject = () => {
        if (nodes.length === 0) {
            setNotice("Nothing to export yet. Create a file first.");
            return;
        }
        setExporting(true);
    };

    const renderExplorer = (afterOpen?: () => void) => (
        <Explorer
            readOnly={readOnly}
            nodes={nodes}
            activeFileId={activeFileId}
            onOpenFile={(id) => {
                pickFile(id);
                openFile(id);
                afterOpen?.();
            }}
            onCreate={handleCreate}
            onRename={handleRename}
            onDelete={handleDelete}
        />
    );

    const Editor = live ? LiveEditor : CodeEditor;

    const editorPane = (
        <Pane name="editor" expanded={expanded}>
            <div className="flex h-full flex-col overflow-hidden rounded-md bg-[#1c2128] text-[#c9d1d9]">
                <div className="flex items-center">
                    <div className="min-w-0 flex-1">
                        <Tabs
                            tabs={tabs}
                            activeId={activeFileId}
                            onSelect={(id) => {
                                pickFile(id);
                                setActiveFileId(id);
                            }}
                            onClose={closeTab}
                        />

                    </div>
                    {readOnly && (
                        <span className="shrink-0  px-2 py-0.5 text-[12px] text-green-600">
                            View only
                        </span>
                    )}
                    {!isMobile && (
                        <div className="flex shrink-0 items-center gap-0.5 px-1.5">
                            {expanded !== "editor" && (
                                <IconButton label={filesHidden ? "Show files" : "Hide files"} onClick={toggleFiles}>
                                    {filesHidden ? (
                                        <PanelLeftOpen className="size-4" aria-hidden />
                                    ) : (
                                        <PanelLeftClose className="size-4" aria-hidden />
                                    )}
                                </IconButton>
                            )}
                            <ExpandButton open={expanded === "editor"} onClick={() => toggleExpand("editor")} />
                        </div>
                    )}
                </div>

                {live && readOnly && !following && liveActivePath && (
                    <div className="flex items-center justify-between gap-2 border-b border-[#30363d] bg-[#161b22] px-3 py-1.5 text-xs">
                        <span className="min-w-0 truncate text-[#8b949e]">
                            Instructor is in {liveActivePath}
                        </span>
                        <button
                            type="button"
                            onClick={() => setFollowing(true)}
                            className="shrink-0 rounded bg-[#1f6feb] px-2.5 py-1 font-medium text-white hover:bg-[#388bfd]"
                        >
                            Follow
                        </button>
                    </div>
                )}

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1c2128]">
                    {activeFile && language ? (
                        <Editor
                            isMobile={isMobile}
                            key={activeFile.id + language}
                            value={activeFile.content ?? ""}
                            onChange={(text: string, line?: number) => {
                                updateContent(activeFile.id, text);
                                if (readOnly) return;
                                sendFiles?.(getPath(nodes, activeFile), text, line);
                            }}
                            language={language}
                            readOnly={readOnly}
                            followLine={currentLine}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#8b949e]">
                            Open a file to start editing
                        </div>
                    )}
                </div>
            </div>
        </Pane>
    );

    const terminalPane = (
        <div className="h-full overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
            <TerminalView
                lines={terminal.lines}
                input={terminal.input}
                onInputChange={terminal.setInput}
                onSubmit={terminal.submit}
                onNavigate={terminal.navigate}
                isRunning={terminal.isRunning}
                onStop={terminal.stop}
                prompts={terminal.prompt}
                onRun={() => terminal.runFile(activeFile ? getPath(nodes, activeFile) : null)}
                onComplete={terminal.complete}
                onClear={terminal.clear}
            />
        </div>
    );

    // The aside on desktop: framed (header, expand, footer) when a title or footer is given
    const asidePane = aside ? (
        framed ? (
            <Pane name="aside" expanded={expanded}>
                <div className="flex h-full flex-col overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
                    {asideTitle && (
                        <PaneHeader
                            title={asideTitle}
                            open={expanded === "aside"}
                            onToggle={() => toggleExpand("aside")}
                        />
                    )}
                    <div className="min-h-0 flex-1 overflow-y-auto">{aside}</div>
                    {asideFooter && (
                        <div className="shrink-0 border-t border-[#21262d] bg-[#161b22] px-4 py-3">
                            {asideFooter}
                        </div>
                    )}
                </div>
            </Pane>
        ) : (
            <div className="h-full overflow-y-auto">{aside}</div>
        )
    ) : null;

    // Editor over terminal (stacked layout and mobile)
    const editorAndTerminal = (
        <PanelGroup direction="vertical" autoSaveId={`${storageKey}-v`}>
            <Panel defaultSize={isMobile ? 62 : 75} minSize={20}>{editorPane}</Panel>
            <PanelResizeHandle className="h-1 transition-colors hover:bg-[#58a6ff]/40" />
            <Panel defaultSize={isMobile ? 38 : 25} minSize={10}>{terminalPane}</Panel>
        </PanelGroup>
    );

    // Editor takes the left space | aside over terminal on the right
    const splitLayout = (
        <PanelGroup direction="horizontal" autoSaveId={`${storageKey}-split`}>
            <Panel id="editor" order={1} defaultSize={52} minSize={25}>
                {editorPane}
            </Panel>

            <PanelResizeHandle className="w-1 transition-colors hover:bg-[#58a6ff]/40" />

            <Panel id="right" order={2} defaultSize={48} minSize={20}>
                <PanelGroup direction="vertical" autoSaveId={`${storageKey}-right`}>
                    <Panel defaultSize={55} minSize={15}>{asidePane}</Panel>
                    <PanelResizeHandle className="h-1 transition-colors hover:bg-[#58a6ff]/40" />
                    <Panel defaultSize={45} minSize={10}>{terminalPane}</Panel>
                </PanelGroup>
            </Panel>
        </PanelGroup>
    );

    const mobileButton =
        "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] hover:bg-[#30363d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]";

    return (
        <div className={`flex ${embedded ? "h-full" : "h-dvh"} flex-col bg-[#161b22] text-[#c9d1d9]`}>
            {!embedded && <TopBar title={title} onBack={onBack} onExport={onExportProject} />}

            {(toolbar || isMobile) && (
                <div className="flex shrink-0 items-center gap-1 border-b border-[#21262d] px-2 py-1">
                    {isMobile && (
                        <>
                            <button type="button" onClick={() => setFilesOpen(true)} className={mobileButton}>
                                <Folder size={16} aria-hidden /> Files
                            </button>
                            {aside && (
                                <button type="button" onClick={() => setAsideOpen(true)} className={mobileButton}>
                                    <PanelRight size={16} aria-hidden /> {asideLabel}
                                </button>
                            )}
                        </>
                    )}
                    {toolbar && <div className="ml-auto flex items-center gap-2">{toolbar}</div>}
                    {isMobile && asideFooter && <div className="ml-auto min-w-0 flex-1">{asideFooter}</div>}
                </div>
            )}

            <div className="min-h-0 flex-1 p-2">
                {isMobile ? (
                    editorAndTerminal
                ) : (
                    <PanelGroup direction="horizontal" autoSaveId={`${storageKey}-h`}>
                        <Panel
                            ref={explorerRef}
                            id="explorer"
                            order={1}
                            defaultSize={16}
                            minSize={10}
                            maxSize={30}
                            collapsible
                            collapsedSize={0}
                            onCollapse={() => setFilesHidden(true)}
                            onExpand={() => setFilesHidden(false)}
                        >
                            <div className="h-full overflow-hidden rounded-md border border-[#30363d] bg-[#161b22]">
                                {renderExplorer()}
                            </div>
                        </Panel>
                        <PanelResizeHandle className="w-1 transition-colors hover:bg-[#58a6ff]/40" />

                        <Panel id="main" order={2} defaultSize={isSplit ? 84 : aside ? 56 : 84}>
                            {isSplit ? splitLayout : editorAndTerminal}
                        </Panel>

                        {aside && !isSplit && (
                            <>
                                <PanelResizeHandle className="w-1 transition-colors hover:bg-[#58a6ff]/40" />
                                <Panel id="aside" order={3} defaultSize={28} minSize={18} maxSize={40}>
                                    {asidePane}
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                )}
            </div>

            <StatusBar
                runtime={runtime}
                language={language}
                filePath={activeFile ? getPath(nodes, activeFile) : null}
            />

            {isMobile && (
                <>
                    <Drawer open={filesOpen} onClose={() => setFilesOpen(false)}>
                        {renderExplorer(() => setFilesOpen(false))}
                    </Drawer>
                    {aside && (
                        <Drawer side="right" open={asideOpen} onClose={() => setAsideOpen(false)}>
                            <div className="h-full overflow-y-auto">{aside}</div>
                        </Drawer>
                    )}
                </>
            )}

            {exporting && (
                <NameModal
                    title="Export project as .zip"
                    confirmLabel="Export"
                    initialValue={title}
                    validate={(name) =>
                        /[\\/:*?"<>|]/.test(name) ? 'Name can\'t contain \\ / : * ? " < > |' : null
                    }
                    onSubmit={(name) => exportProject(nodes, name.replace(/\.zip$/i, ""))}
                    onClose={() => setExporting(false)}
                />
            )}

            <AlertModal
                isOpen={!!notice}
                title="Nothing to export"
                message={notice ?? ""}
                onClose={() => setNotice(null)}
            />
        </div>
    );
}