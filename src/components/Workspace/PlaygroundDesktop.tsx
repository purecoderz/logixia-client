import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { CodeEditor } from "../CodeEditor/CodeEditor";
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

export function PlaygroundLayout() {
    const { pathname } = useLocation();

    const [nodes, setNodes] = useLocalStorage<FsNode[]>("playground:nodes", []);
    const [activeFileId, setActiveFileId] = useLocalStorage<string | null>("playground:active", null);
    const [openTabIds, setOpenTabIds] = useLocalStorage<string[]>("playground:tabs", []);

    const [notice, setNotice] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

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
        <div className="flex flex-col h-screen bg-[#161b22] text-[#c9d1d9]">
            <TopBar title={pathname} onBack={() => window.history.back()} onExport={onExportProject} />

            <div className="flex-1 min-h-0 p-2">
                <PanelGroup direction="horizontal" autoSaveId="playground-h">
                    <Panel defaultSize={20} minSize={5} maxSize={40}>
                        <div className="h-full bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden">
                            <Explorer
                                nodes={nodes}
                                activeFileId={activeFileId}
                                onOpenFile={openFile}
                                onCreate={onCreateNode}
                                onRename={onRenameNode}
                                onDelete={onDeleteNode}
                            />
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 transition-colors hover:bg-[#58a6ff]/40" />

                    <Panel defaultSize={80}>
                        <PanelGroup direction="vertical" autoSaveId="playground-v">
                            <Panel defaultSize={75} minSize={20}>
                                <div className="flex flex-col h-full bg-[#1c2128] text-[#c9d1d9]  rounded-md overflow-hidden">
                                    <Tabs
                                        tabs={tabs}
                                        activeId={activeFileId}
                                        onSelect={setActiveFileId}
                                        onClose={closeTab}
                                    />
                                    <div className="flex flex-col h-full bg-[#1c2128] overflow-hidden">
                                        {activeFile && language ? (
                                            <CodeEditor
                                                key={activeFile.id + language}
                                                value={activeFile.content ?? ""}
                                                onChange={(newText) =>
                                                    setNodes(FileManagement.updateContent(nodes, activeFile.id, newText))
                                                }
                                                language={language}
                                            />
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-sm text-[#8b949e]">
                                                Open a file to start editing
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Panel>

                            <PanelResizeHandle className="h-1 transition-colors hover:bg-[#58a6ff]/40" />

                            <Panel defaultSize={25} minSize={10}>
                                <div className="h-full bg-[#0d1117] border border-[#30363d] rounded-md overflow-hidden">
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
                    </Panel>
                </PanelGroup>
            </div>

            <StatusBar
                runtime={runtime}
                language={language}
                filePath={activeFile ? getPath(nodes, activeFile) : null}
            />

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