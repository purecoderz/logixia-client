import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AllTasksPage from "../src/features/tasks/pages/AllTasksPage";
import { TaskService } from "../src/features/tasks/services/taskService";
import { ApiError } from "../src/lib/apiError";
vi.mock("../src/features/tasks/services/taskService",()=>({TaskService:{remove:vi.fn()}}));
vi.mock("../src/features/courses/hooks/useInstructorCourses",()=>({useInstructorCourses:()=>({isPending:false,isError:false,data:[{id:"1",title:"Python",status:"published"}]})}));
vi.mock("../src/features/courses/hooks/useCourseOutline",()=>({useCourseOutline:()=>({isPending:false,isError:false,data:{modules:[{id:2,title:"Functions",lessons:[{id:3,title:"Addition",tasks:[{id:12,title:"Add numbers",type:"code"}]}]}]}})}));
beforeAll(()=>{
 HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 HTMLDialogElement.prototype.close=function(){this.open=false;};
});
afterEach(()=>{cleanup();vi.resetAllMocks();});
function setup(){const client=new QueryClient();client.setQueryData(["instructor-task","12"],{id:12});render(<QueryClientProvider client={client}><MemoryRouter><AllTasksPage/></MemoryRouter></QueryClientProvider>);return client;}
async function open(){await userEvent.click(screen.getByRole("button",{name:"Actions for Add numbers"}));await userEvent.click(screen.getByRole("menuitem",{name:"Delete task"}));return screen.getByRole("dialog");}
it("requires confirmation, permits cancel, and clears cached task after delete",async()=>{
 vi.mocked(TaskService.remove).mockResolvedValue();const client=setup();const refresh=vi.spyOn(client,"invalidateQueries");
 const first=await open();expect(TaskService.remove).not.toHaveBeenCalled();
 await userEvent.click(within(first).getByRole("button",{name:"Cancel"}));expect(TaskService.remove).not.toHaveBeenCalled();
 const second=await open();await userEvent.click(within(second).getByRole("button",{name:"Delete task"}));
 expect(await screen.findByText("“Add numbers” was deleted.")).toBeTruthy();
 expect(TaskService.remove).toHaveBeenCalledExactlyOnceWith("12");expect(client.getQueryData(["instructor-task","12"])).toBeUndefined();
 expect(refresh).toHaveBeenCalledWith({queryKey:["courses"]});
});
it("keeps the task and cached data when the backend rejects deletion",async()=>{
 vi.mocked(TaskService.remove).mockRejectedValue(new ApiError("This task has submissions and cannot be deleted.",409));const client=setup();
 const dialog=await open();await userEvent.click(within(dialog).getByRole("button",{name:"Delete task"}));
 expect(await screen.findByText("This task has submissions and cannot be deleted.")).toBeTruthy();
 expect(screen.getByRole("link",{name:"Add numbers"})).toBeTruthy();expect(client.getQueryData(["instructor-task","12"])).toEqual({id:12});
});
