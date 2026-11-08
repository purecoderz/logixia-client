import { DepartingPublicHeader } from "../../../layouts/PublicLayout/DepartingPublicHeader";
import { CodeWorkspace } from "../Workspace";

export function PlaygroundPage() {
  return (
    <>
      <CodeWorkspace storageKey="playground" title="Playground" />
      <DepartingPublicHeader />
    </>
  );
}
