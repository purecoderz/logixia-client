import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ListPageSkeleton } from "../../../components/ui/ListPageSkeleton";
import { ErrorState } from "../../../components/ui/ErrorState";
import { AssignmentService } from "../services/assignmentService";
import QuizRenderer from "../components/QuizeRender";

export function QuizGroundPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: task,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => AssignmentService.getTask(id ?? "0"),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (task && task.type === "code") {
      navigate(`/tasks/${id}`, { replace: true });
    }
  }, [task, id, navigate]);

  if (error) {
    return (
      <div className="py-8">
        <ErrorState
          what="this quiz"
          error={error}
          onRetry={() => void refetch()}
          homeTo="/tasks"
          homeLabel="Back to tasks"
        />
      </div>
    );
  }

  if (isPending || !task || task.type === "code") {
    return <ListPageSkeleton label="Loading quiz" />;
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <QuizRenderer
        quiz={task}
        onBack={() => navigate("/tasks")}
        onSubmitAnswers={(answers) =>
          AssignmentService.submitQuiz(id ?? "0", answers)
        }
      />
    </div>
  );
}

export default QuizGroundPage;
