// fileManagement.ts

import { getPath } from "./exportProject";

export type FsNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
  content?: string;
};

export const FileManagement = {
  createFile(nodes: FsNode[], parentId: string | null, name: string): FsNode[] {
    return [
      ...nodes,
      { id: crypto.randomUUID(), name, type: "file", parentId, content: "" },
    ];
  },

  createFolder(
    nodes: FsNode[],
    parentId: string | null,
    name: string,
  ): FsNode[] {
    return [
      ...nodes,
      { id: crypto.randomUUID(), name, type: "folder", parentId },
    ];
  },

  rename(nodes: FsNode[], id: string, name: string): FsNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, name } : n));
  },

  updateContent(nodes: FsNode[], id: string, content: string): FsNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, content } : n));
  },

  findFileByPath(nodes: FsNode[], path: string): FsNode | undefined {
    const clean = path.replace(/^\/+|\/+$/g, "");
    return nodes.find((n) => n.type === "file" && getPath(nodes, n) === clean);
  },

  findByPath(nodes: FsNode[], path: string): FsNode | undefined {
    const clean = path.replace(/^\/+|\/+$/g, "");
    return nodes.find((n) => getPath(nodes, n) === clean);
  },

  delete(nodes: FsNode[], id: string): FsNode[] {
    const removed = new Set([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const n of nodes) {
        if (n.parentId && removed.has(n.parentId) && !removed.has(n.id)) {
          removed.add(n.id);
          grew = true;
        }
      }
    }
    return nodes.filter((n) => !removed.has(n.id));
  },

  removeByPath(nodes: FsNode[], path: string): FsNode[] {
    const target = this.findByPath(nodes, path);
    return target ? this.delete(nodes, target.id) : nodes;
  },

  upsertByPath(nodes: FsNode[], path: string, content: string): FsNode[] {
    const parts = path.split("/");
    let next = nodes;
    let parentId: string | null = null;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const existing = next.find(
        (n) => n.parentId === parentId && n.name === name,
      );

      if (existing) {
        if (isFile)
          next = next.map((n) =>
            n.id === existing.id ? { ...n, content } : n,
          );
        parentId = existing.id;
      } else {
        const node: FsNode = {
          id: crypto.randomUUID(),
          name,
          type: isFile ? "file" : "folder",
          parentId,
          ...(isFile ? { content } : {}),
        };
        next = [...next, node];
        parentId = node.id;
      }
    }
    return next;
  },

  // Live rooms: make nodes match the server's files (keys are paths like "new/main.py")
  syncFromPaths(nodes: FsNode[], files: Record<string, string>): FsNode[] {
    let next = nodes;

    for (const [path, content] of Object.entries(files)) {
      next = FileManagement.upsertByPath(next, path, content);
    }

    const onServer = new Set(Object.keys(files));
    for (const n of next) {
      if (n.type === "file" && !onServer.has(getPath(next, n))) {
        next = FileManagement.delete(next, n.id);
      }
    }
    return next;
  },
};
