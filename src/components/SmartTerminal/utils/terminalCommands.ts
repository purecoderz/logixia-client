import { FileManagement, type FsNode } from "@/features/workspace/utils/File";
import type { TerminalLine } from "../TerminalView";


export type CommandResult = {
  lines?: TerminalLine[];
  clear?: boolean;
  run?: { path: string };
};

type Command = (args: string[], nodes: FsNode[]) => CommandResult;

const out = (text: string): TerminalLine => ({ kind: "stdout", text });
const err = (text: string): TerminalLine => ({ kind: "stderr", text });

export const commands: Record<string, Command> = {
  help: () => ({
    lines: [out("Commands: help, clear, ls [path], cat <file>, python <file>")],
  }),

  clear: () => ({ clear: true }),

  ls: ([path], nodes) => {
    let parentId: string | null = null;
    if (path) {
      const folder = FileManagement.findByPath(nodes, path);
      if (!folder)
        return { lines: [err(`ls: ${path}: No such file or directory`)] };
      if (folder.type === "file") return { lines: [out(folder.name)] };
      parentId = folder.id;
    }
    const children = nodes.filter((n) => n.parentId === parentId);
    if (children.length === 0) return { lines: [] };
    return {
      lines: [
        out(
          children
            .map((n) => (n.type === "folder" ? n.name + "/" : n.name))
            .join("  "),
        ),
      ],
    };
  },

  cat: ([path], nodes) => {
    if (!path) return { lines: [err("cat: missing file name")] };
    const file = FileManagement.findByPath(nodes, path);
    if (!file)
      return { lines: [err(`cat: ${path}: No such file or directory`)] };
    if (file.type === "folder")
      return { lines: [err(`cat: ${path}: Is a directory`)] };
    return { lines: (file.content ?? "").split("\n").map(out) };
  },

  python: ([path], nodes) => {
    if (!path) return { lines: [err("python: missing file name")] };
    const file = FileManagement.findByPath(nodes, path);
    if (!file)
      return {
        lines: [err(`python: can't open file '${path}': No such file`)],
      };
    if (file.type === "folder")
      return { lines: [err(`python: '${path}' is a directory`)] };
    return { run: { path } };
  },
};