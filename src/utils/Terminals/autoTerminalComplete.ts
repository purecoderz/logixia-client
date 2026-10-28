import { FileManagement, type FsNode } from "../../components/Workspace/utils/File";
import { commands } from "./terminalCommands";


// =================================================================
//                   AUTO COMPLETION FOR TERMINALS Text
// =================================================================

const commonPrefix = (words: string[]) =>
  words.reduce((a, b) => {
    let i = 0;
    while (i < a.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  });

export function completeInput(input: string, nodes: FsNode[]) {
  const parts = input.split(" ");
  const last = parts[parts.length - 1];
  const before = parts.slice(0, -1).join(" ");
  const head = before ? before + " " : "";
  const isCommand = parts.length === 1;

  // split "src/ma" into dir "src/" and partial "ma"
  const slash = isCommand ? -1 : last.lastIndexOf("/");
  const dir = slash >= 0 ? last.slice(0, slash + 1) : "";
  const partial = last.slice(slash + 1);

  let candidates: string[];
  if (isCommand) {
    candidates = Object.keys(commands).filter((c) => c.startsWith(partial));
  } else {
    let parentId: string | null = null;
    if (dir) {
      const folder = FileManagement.findByPath(nodes, dir);
      if (!folder || folder.type !== "folder") return { input, options: [] };
      parentId = folder.id;
    }
    candidates = nodes
      .filter((n) => n.parentId === parentId && n.name.startsWith(partial))
      .map((n) => n.name + (n.type === "folder" ? "/" : ""));
  }

  if (candidates.length === 0) return { input, options: [] };

  if (candidates.length === 1) {
    const done = candidates[0] + (isCommand ? " " : "");
    return { input: head + dir + done, options: [] };
  }

  const prefix = commonPrefix(candidates);
  if (prefix.length > partial.length) {
    return { input: head + dir + prefix, options: [] };
  }
  return { input, options: candidates };
}