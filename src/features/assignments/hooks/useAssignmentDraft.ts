import { useCallback, useEffect, useState } from "react";
import {
  AssignmentService,
  type AssignmentTask,
} from "../services/assignmentService";

export function useAssignment(assignmentId: string) {
  const [task, setTask] = useState<AssignmentTask | null>(null);
  const [initialFiles, setInitialFiles] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<unknown>(null);
  const [generation, setGeneration] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);

    async function load() {
      try {
        const assignment = await AssignmentService.getTask(assignmentId);
        if (cancelled) return;
        
        setInitialFiles(assignment.starter_files);
        setTask(assignment);
      } catch (error) {
        if (!cancelled) setLoadError(error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [assignmentId, attempt]);

  const reset = useCallback(() => {
    if (!task) return;
    setInitialFiles({ ...task.starter_files });
    setGeneration((value) => value + 1);
  }, [task]);

  return {
    task,
    initialFiles,
    loadError,
    generation,
    reset,
    retryLoad: () => setAttempt((value) => value + 1),
  };
}