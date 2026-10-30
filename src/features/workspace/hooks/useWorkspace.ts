// pages/PLaygroundLayout/hooks/useWorkspace.ts
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { FileManagement, type FsNode } from "../utils/File";
import { getLanguage } from "../utils/language";


export function useWorkspace(prefix: string) {
  const [nodes, setNodes] = useLocalStorage<FsNode[]>(`${prefix}:nodes`, []);
  const [activeFileId, setActiveFileId] = useLocalStorage<string | null>(`${prefix}:active`, null);
  const [openTabIds, setOpenTabIds] = useLocalStorage<string[]>(`${prefix}:tabs`, []);

  const activeFile = nodes.find((n) => n.id === activeFileId);
  const language = activeFile ? getLanguage(activeFile.name) : null;

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

  const updateContent = (id: string, text: string) => {
    setNodes(FileManagement.updateContent(nodes, id, text));
  };

    // Live rooms: make our nodes match the files the server sent
  const setLiveNodes = (files: Record<string, string>) =>
  setNodes((current) => FileManagement.syncFromPaths(current, files));

  return {
    nodes, setNodes, setLiveNodes, activeFileId, setActiveFileId, setOpenTabIds,
    activeFile, language, tabs,
    onCreateNode, onRenameNode, onDeleteNode, openFile, closeTab, updateContent,
  };
}