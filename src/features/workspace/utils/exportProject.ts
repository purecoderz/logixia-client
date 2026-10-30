import JSZip from "jszip";
import type { FsNode } from "./File";

export function getPath(nodes: FsNode[], node: FsNode): string {
    const parts = [node.name];
    let current = node;
    while (current.parentId) {
        const parent = nodes.find((n) => n.id === current.parentId);
        if (!parent) break;
        parts.unshift(parent.name);
        current = parent;
    }
    return parts.join("/");
}

export async function exportProject(nodes: FsNode[], projectName: string) {
    const zip = new JSZip();

    for (const node of nodes) {
        const path = getPath(nodes, node);
        if (node.type === "folder") zip.folder(path);
        else zip.file(path, node.content ?? "");
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}.zip`;
    a.click();

    URL.revokeObjectURL(url);
}

export function collectFiles(nodes: FsNode[]) {
    return nodes
        .filter((n) => n.type === "file")
        .map((n) => ({ path: getPath(nodes, n), content: n.content ?? "" }));
}
