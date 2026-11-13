import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TaskTable } from "../src/features/tasks/components/TaskTable";
import TaskTestPage from "../src/features/tasks/pages/TaskTestPage";
import { TaskService } from "../src/features/tasks/services/taskService";
import { emptyTask } from "../src/features/tasks/taskForm";

vi.mock("../src/features/tasks/services/taskService",()=>({TaskService:{get:vi.fn(),test:vi.fn()}}));
vi.mock("../src/features/auth/context/AuthContext",()=>({useAuth:()=>({profile:{id:"teacher-1"}})}));
vi.mock("../src/features/courses/hooks/useCourseOutline",()=>({useCourseOutline:()=>({isPending:false,isError:false,data:{modules:[{lessons:[{id:3}]}]}})}));
vi.mock("../src/features/workspace/Workspace",()=>({CodeWorkspace:({aside,asideFooter}:{aside:ReactNode;asideFooter:(ctx:{getFiles:()=>Record<string,string>})=>ReactNode})=><div>{aside}{asideFooter({getFiles:()=>({"main.py":"print(5)"})})}</div>}));
afterEach(()=>{cleanup();vi.resetAllMocks();});
function Path(){const {pathname}=useLocation();return <output>{pathname}</output>;}
it("opens Test task from the table action menu",async()=>{
 render(<MemoryRouter><TaskTable onDelete={vi.fn()} courseId="1" rows={[{id:12,title:"Addition",type:"code",lessonId:3,lessonNumber:"1.1",lessonTitle:"Functions"}]}/><Path/></MemoryRouter>);
 await userEvent.click(screen.getByRole("button",{name:"Actions for Addition"}));
 expect(screen.getByRole("menuitem",{name:"Edit task"})).toBeTruthy();
 await userEvent.click(screen.getByRole("menuitem",{name:"Test task"}));
 expect(screen.getByRole("status").textContent).toBe("/instructor/courses/1/tasks/12/test");
});
function setup(){render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={["/instructor/tasks?course=1","/instructor/courses/1/tasks/12/test"]} initialIndex={1}><Routes><Route path="/instructor/tasks" element={<output>Tasks list</output>}/><Route path="/instructor/courses/:courseId/tasks/:taskId/test" element={<TaskTestPage/>}/></Routes></MemoryRouter></QueryClientProvider>);}
it("tests code files on explicit click and displays failed checks",async()=>{
 vi.mocked(TaskService.get).mockResolvedValue({...emptyTask(),id:12,lesson_id:3,title:"Addition",instructions:"Print five."});
 vi.mocked(TaskService.test).mockResolvedValue({passed:false,checks:[{name:"Output test 1",passed:false,message:"Expected 5"}]});
 setup();
 const button=await screen.findByRole("button",{name:"Test solution"});
 expect(TaskService.test).not.toHaveBeenCalled();
 await userEvent.click(button);
 expect(await screen.findByText("Some checks failed.")).toBeTruthy();
 expect(TaskService.test).toHaveBeenCalledExactlyOnceWith("12",{files:{"main.py":"print(5)"}});
});
it("shows instant quiz feedback and returns to the previous page when clicking Done",async()=>{
 vi.mocked(TaskService.get).mockResolvedValue({id:12,lesson_id:3,title:"Python",type:"quiz",instructions:"Choose one.",questions:[{id:"q1",prompt:"Function keyword?",choices:[{id:"a",text:"def"},{id:"b",text:"class"}],correct_choice_id:"a",explanation:"Use def."}]});
 setup();
 const doneBtn=await screen.findByRole("button",{name:"Done"});
 expect(screen.queryByRole("button",{name:"Test answers"})).toBeNull();
 await userEvent.click(screen.getByRole("radio",{name:"def"}));
 expect(screen.getByText("Use def.")).toBeTruthy();
 await userEvent.click(doneBtn);
 expect(await screen.findByText("Tasks list")).toBeTruthy();
 expect(TaskService.test).not.toHaveBeenCalled();
});

it("navigates across multiple quiz questions using the student quiz layout and finishes with Done",async()=>{
 vi.mocked(TaskService.get).mockResolvedValue({
  id:12,
  lesson_id:3,
  title:"Multi-step Quiz",
  type:"quiz",
  instructions:"Answer every question.",
  questions:[
   {id:"q1",prompt:"First question?",choices:[{id:"a",text:"Option A"},{id:"b",text:"Option B"}],correct_choice_id:"a",explanation:"Explanation 1"},
   {id:"q2",prompt:"Second question?",choices:[{id:"c",text:"Option C"},{id:"d",text:"Option D"}],correct_choice_id:"d",explanation:"Explanation 2"},
  ],
 });
 setup();
 expect(await screen.findByText("Question 1 of 2")).toBeTruthy();
 expect(screen.getByText("First question?")).toBeTruthy();
 await userEvent.click(screen.getByRole("radio",{name:"Option A"}));
 expect(screen.getByText("Explanation 1")).toBeTruthy();
 await userEvent.click(screen.getByRole("button",{name:"Next"}));
 expect(screen.getByText("Question 2 of 2")).toBeTruthy();
 expect(screen.getByText("Second question?")).toBeTruthy();
 await userEvent.click(screen.getByRole("radio",{name:"Option D"}));
 expect(screen.getByText("Explanation 2")).toBeTruthy();
 await userEvent.click(screen.getByRole("button",{name:"Done"}));
 expect(await screen.findByText("Tasks list")).toBeTruthy();
});
