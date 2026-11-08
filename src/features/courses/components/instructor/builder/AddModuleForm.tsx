import { useAddModule } from "../../../hooks/useAddModule";
import { AddItemForm } from "./AddItemForm";

interface AddModuleFormProps {
  courseId: string;
  moduleCount: number;
  onAdded: (moduleId: number) => void;
}

export function AddModuleForm({
  courseId,
  moduleCount,
  onAdded,
}: AddModuleFormProps) {
  const add = useAddModule(courseId);
  return (
    <AddItemForm
      noun="module"
      numberLabel={`Module ${moduleCount + 1}`}
      existingCount={moduleCount}
      inputId="new-module-title"
      placeholder="For example: Getting started"
      save={(title) => add.mutateAsync(title)}
      onAdded={onAdded}
      focusWhenEmpty
    />
  );
}
