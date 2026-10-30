// pages/Playground/PlaygroundMobile.tsx
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Menu } from "lucide-react";

import { CodeEditorMobile } from "../CodeEditor/CodeEditorMobile";
import { AlertModal } from "../ui/AlertModal";
import { NameModal } from "../ui/NameModal";

import { useLocalStorage } from "../../hooks/useLocalStorage";

import { TopBar } from "./components/TopBar";
import { Explorer } from "./components/Explorer";
import { Tabs } from "./components/Tabs";
import { FileManagement, type FsNode } from "./utils/File";
import { exportProject, getPath } from "./utils/exportProject";
import { getLanguage } from "./utils/language";
import { TerminalView } from "../SmartTerminal/TerminalView";
import { useTerminal } from "../SmartTerminal/hooks/useTerminal";
import { StatusBar } from "./components/StatusBar";
import { Drawer } from "./components/ui/Drawer";

export function PlaygroundMobile() {
    const { pathname } = useLocation();

    const [nodes, setNodes] = useLocalStorage<FsNode[]>("playground:nodes", []);
    const [activeFileId, setActiveFileId] = useLocalStorage<string | null>("playground:active", null);
    const [openTabIds, setOpenTabIds] = useLocalStorage<string[]>("playground:tabs", []);

    const [notice, setNotice] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const activeFile = nodes.find((n) => n.id === activeFileId);
    const language = activeFile ? getLanguage(activeFile.name) : null;

    const terminal = useTerminal(nodes, setNodes);

    const runtime = terminal.isRunning ? "running" : terminal.ready ? "ready" : "loading";

    const tabs = openTabIds
        .map((id) => nodes.find((n) => n.id === id))
        .filter((n): n is FsNode => !!n);

    const onCreateNode = (parentId: string | null, type: "file" | "folder", name: string) => {
        setNodes(
            type === "file"
                ? FileManagement.createFile(nodes, parentId, name)
                : FileManagement.createFolder(nodes, parentId, name)
        );
    };

    const onRenameNode = (id: string, name: string) => {
        setNodes(FileManagement.rename(nodes, id, name));
    };

    const onDeleteNode = (id: string) => {
        const next = FileManagement.delete(nodes, id);
        const stillExists = (tabId: string) => next.some((n) => n.id === tabId);
        const nextTabs = openTabIds.filter(stillExists);

        setNodes(next);
        setOpenTabIds(nextTabs);

        if (activeFileId && !stillExists(activeFileId)) {
            setActiveFileId(nextTabs[nextTabs.length - 1] ?? null);
        }
    };

    const openFile = (id: string) => {
        setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setActiveFileId(id);
    };

    const closeTab = (id: string) => {
        const index = openTabIds.indexOf(id);
        const next = openTabIds.filter((x) => x !== id);
        setOpenTabIds(next);
        if (id === activeFileId) {
            setActiveFileId(next[index] ?? next[index - 1] ?? null);
        }
    };

    const onExportProject = () => {
        if (nodes.length === 0) {
            setNotice("Nothing to export yet. Create a file first.");
            return;
        }
        setExporting(true);
    };

    return (
        <div className="flex h-dvh flex-col bg-[#161b22] text-[#c9d1d9]">
            <TopBar title={pathname} onBack={() => window.history.back()} onExport={onExportProject} />

            <div className="min-h-0 flex-1 p-2">
                <PanelGroup direction="vertical" autoSaveId="playground-mobile-v">
                    <Panel defaultSize={65} minSize={20}>
                        <div className="flex h-full flex-col overflow-hidden rounded-md bg-[#1c2128] text-[#c9d1d9]">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => setDrawerOpen(true)}
                                    aria-label="Open files"
                                    className="px-3 text-[#8b949e] hover:text-white"
                                >
                                    <Menu size={18} />
                                </button>
                                <div className="min-w-0 flex-1">
                                    <Tabs
                                        tabs={tabs}
                                        activeId={activeFileId}
                                        onSelect={setActiveFileId}
                                        onClose={closeTab}
                                    />
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-hidden">
                                {activeFile && language ? (
                                    <CodeEditorMobile
                                        key={activeFile.id + language}
                                        value={activeFile.content ?? ""}
                                        onChange={(newText) =>
                                            setNodes(FileManagement.updateContent(nodes, activeFile.id, newText))
                                        }
                                        language={language}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-[#8b949e]">
                                        Tap the menu to open a file
                                    </div>
                                )}
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="h-1 transition-colors hover:bg-[#58a6ff]/40" />

                    <Panel defaultSize={35} minSize={10}>
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
                                onRun={() =>
                                    terminal.runFile(activeFile ? getPath(nodes, activeFile) : null)
                                }
                                onComplete={terminal.complete}
                                onClear={terminal.clear}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>

            <StatusBar
                runtime={runtime}
                language={language}
                filePath={activeFile ? getPath(nodes, activeFile) : null}
            />

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Explorer
                    nodes={nodes}
                    activeFileId={activeFileId}
                    onOpenFile={(id) => {
                        openFile(id);
                        setDrawerOpen(false);
                    }}
                    onCreate={onCreateNode}
                    onRename={onRenameNode}
                    onDelete={onDeleteNode}
                />
            </Drawer>

            {exporting && (
                <NameModal
                    title="Export project as .zip"
                    confirmLabel="Export"
                    initialValue="Untitled Project"
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