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
function setup(){render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><MemoryRouter initialEntries={["/instructor/courses/1/tasks/12/test"]}><Routes><Route path="/instructor/courses/:courseId/tasks/:taskId/test" element={<TaskTestPage/>}/></Routes></MemoryRouter></QueryClientProvider>);}
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
it("collects quiz choice IDs and sends an instructor-only dry run",async()=>{
 vi.mocked(TaskService.get).mockResolvedValue({id:12,lesson_id:3,title:"Python",type:"quiz",instructions:"Choose one.",questions:[{id:"q1",prompt:"Function keyword?",choices:[{id:"a",text:"def"},{id:"b",text:"class"}],correct_choice_id:"a",explanation:"Use def."}]});
 vi.mocked(TaskService.test).mockResolvedValue({passed:true,checks:[{name:"Question 1",passed:true}]});
 setup();
 const button=await screen.findByRole("button",{name:"Test answers"});
 expect((button as HTMLButtonElement).disabled).toBe(true);
 await userEvent.click(screen.getByRole("radio",{name:"def"}));
 await userEvent.click(button);
 expect(await screen.findByText("All checks passed.")).toBeTruthy();
 expect(TaskService.test).toHaveBeenCalledExactlyOnceWith("12",{answers:[{question_id:"q1",choice_id:"a"}]});
});
