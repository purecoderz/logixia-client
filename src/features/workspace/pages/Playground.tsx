import { DepartingPublicLoading } from "../../../layouts/PublicLayout/DepartingPublicLoading";
import { CodeWorkspace } from "../Workspace";

const DEFAULT_PLAYGROUND_FILES: Record<string, string> = {
  "main.py": `# Welcome to Logixia Playground!
# Write Python code here and click Run to execute it in your browser.

def greet(name: str) -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet("World"))
`,
};

export function PlaygroundPage() {
  return (
    <>
      <CodeWorkspace
        storageKey="playground"
        title="Playground"
        starterFiles={DEFAULT_PLAYGROUND_FILES}
      />
      <DepartingPublicLoading />
    </>
  );
}
