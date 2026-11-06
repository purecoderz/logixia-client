import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/context/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { useCourseOutline } from "@/features/courses/hooks/useCourseOutline";
import { CodeWorkspace } from "@/features/workspace/Workspace";
import { Markdown } from "@/components/ui/Markdown";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { FormError } from "@/components/ui/FormError";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError, friendlyMessage } from "@/lib/apiError";
import { TaskService } from "../services/taskService";
import { TASKS_PATH, taskEditorPath } from "../paths";
import type { TaskDocument } from "../taskForm";
import type { TaskTestResult, TaskTestSubmission } from "../taskTest";
import { TaskTestResults } from "../components/TaskTestResults";

export default function TaskTestPage() {
  const {courseId,taskId}=useParams();
  const outline=useCourseOutline(courseId);
  const task=useQuery({queryKey:["instructor-task",taskId],queryFn:()=>TaskService.get(taskId!),enabled:Boolean(taskId)});
  const failed=outline.isError ? outline : task.isError ? task : null;
  if(failed) return <div className="min-h-screen bg-canvas p-6"><ErrorState what="this task" error={failed.error} onRetry={()=>void failed.refetch()} /></div>;
  if(outline.isPending || task.isPending) return <div className="flex min-h-screen items-center justify-center bg-canvas text-body" role="status"><Spinner/> Loading task…</div>;
  if(!courseId || !taskId || !task.data || !outline.data?.modules.some((module)=>module.lessons.some((lesson)=>lesson.id===task.data.lesson_id))) return <ErrorState what="this task" error={new ApiError("Task not found in this course",404)} homeTo={TASKS_PATH}/>;
  const content=<TestTask key={taskId} courseId={courseId} task={task.data}/>;
  // Code workspaces remain dark; only the standalone MCQ test uses the saved app theme.
  return task.data.type==="quiz" ? <ThemeProvider>{content}</ThemeProvider> : content;
}

function TestTask({courseId,task}:{courseId:string;task:TaskDocument}) {
  const navigate=useNavigate();
  const {profile}=useAuth();
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [result,setResult]=useState<TaskTestResult|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const running=useRef(false);
  const back=`${TASKS_PATH}?course=${encodeURIComponent(courseId)}`;
  async function test(submission:TaskTestSubmission) {
    if(running.current)return;
    running.current=true;setBusy(true);setError(null);setResult(null);
    try{setResult(await TaskService.test(String(task.id),submission));}catch(err){setError(friendlyMessage(err,"Couldn’t test the task. Please try again."));}finally{running.current=false;setBusy(false);}
  }
  const explanation=<p className="text-xs leading-relaxed text-muted">Instructor test mode. Uses saved task settings. No student submission, enrolment, score or task content is changed.</p>;
  if(task.type==="code") return <CodeWorkspace
    title={`Test · ${task.title}`} layout="split" storageKey={`instructor-task-test:${profile?.id}:${task.id}`} starterFiles={task.starter_files} onBack={()=>navigate(back)} asideTitle="Test task"
    aside={<div className="space-y-4 p-4"><h1 className="text-lg font-semibold text-foreground">{task.title}</h1>{explanation}<Markdown allowImages>{task.instructions}</Markdown><p className="text-xs text-muted">Use main.py as the entry point. Run code in the terminal, then test your solution against the task’s saved checks.</p><ButtonLink variant="ghost" to={taskEditorPath(courseId,task.id)}>Edit task</ButtonLink>{error && <FormError message={error}/>} {result && <TaskTestResults result={result}/>}</div>}
    asideFooter={({getFiles})=><div className="flex items-center justify-between gap-3"><p className="text-xs text-muted">Tests run on the backend.</p><Button disabled={busy} aria-busy={busy} onClick={()=>void test({files:getFiles()})}>{busy ? <><Spinner tone="dark"/> Testing…</> : "Test solution"}</Button></div>}
  />;
  const complete=task.questions.length>0 && task.questions.every((q)=>answers[q.id]);
  return <main className="min-h-screen bg-canvas px-4 py-8 text-body"><div className="mx-auto max-w-3xl space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><ButtonLink variant="ghost" to={back}>Back to tasks</ButtonLink><ThemeToggle/></header>
    <section className="space-y-4 rounded-xl border border-line bg-surface p-5"><h1 className="text-2xl font-semibold text-foreground">Test · {task.title}</h1>{explanation}<Markdown>{task.instructions}</Markdown><ButtonLink variant="ghost" to={taskEditorPath(courseId,task.id)}>Edit quiz</ButtonLink></section>
    <form onSubmit={(event)=>{event.preventDefault();if(complete)void test({answers:task.questions.map((q)=>({question_id:q.id,choice_id:answers[q.id]}))});}} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4"><legend className="sr-only">Quiz attempt</legend>{task.questions.map((q,index)=><fieldset key={q.id} className="space-y-3 rounded-xl border border-line bg-surface p-5"><legend className="text-sm font-semibold text-foreground">Question {index+1}</legend><Markdown>{q.prompt}</Markdown>{q.choices.map((choice)=><label key={choice.id} className="flex items-start gap-3 rounded-lg border border-line p-3 text-sm"><input type="radio" name={q.id} checked={answers[q.id]===choice.id} onChange={()=>{setAnswers((old)=>({...old,[q.id]:choice.id}));setResult(null);setError(null);}} className="mt-1 accent-accent"/>{choice.text}</label>)}</fieldset>)}</fieldset>
      {!complete && <p className="text-xs text-muted">Select an answer for every question before testing.</p>}
      {error && <FormError message={error}/>} {result && <TaskTestResults result={result}/>}
      <Button type="submit" disabled={!complete || busy} aria-busy={busy}>{busy ? <><Spinner tone="dark"/> Testing…</> : "Test answers"}</Button>
    </form>
  </div></main>;
}
