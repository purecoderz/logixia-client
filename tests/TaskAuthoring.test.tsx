import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, Link } from "react-router-dom";
import { BreadcrumbProvider, PageBreadcrumbs } from "../src/components/ui/BreadCrumbs";
import { InstructorTopbar } from "../src/layouts/InstructorLayout/InstructorTopbar";
import { InstructorThemeProvider } from "../src/features/theme/ThemeProvider";
import { TaskEditorForm } from "../src/features/tasks/components/editor/TaskEditorForm";
import { emptyTask, validateTask, validPythonPath, wordsFrom } from "../src/features/tasks/taskForm";

vi.mock("../src/features/tasks/components/editor/TaskCodeInput",()=>({TaskCodeInput:({id,label,value,onChange}:{id:string;label:string;value:string;onChange:(v:string)=>void})=><textarea id={id} aria-label={label} value={value} onChange={(event)=>onChange(event.target.value)}/>}));
beforeAll(()=>{
 HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 HTMLDialogElement.prototype.close=function(){this.open=false;};
});
afterEach(cleanup);

it("validates file paths and conflicting word requirements",()=>{
 expect(validPythonPath("utils/helpers.py")).toBe(true);
 expect(validPythonPath("../main.py")).toBe(false);
 expect(validPythonPath("/main.py")).toBe(false);
 expect(wordsFrom("for, def for\nreturn")).toEqual(["for","def","return"]);
 const task=emptyTask();task.title="Addition";task.instructions="Write add.";task.tests.required_words=["sum"];task.tests.forbidden_words=["sum"];
 expect(validateTask(task).some((error)=>error.field==="forbidden-words")).toBe(true);
});
it("rejects empty contains checks and a wrong custom entry function",()=>{
 const task=emptyTask();task.title="Addition";task.instructions="Write add.";
 task.tests.output_tests=[{name:"Addition output",input:"",expected:"",match:"contains"}];task.tests.custom_test="def something_else():\n    pass";
 expect(validateTask(task).map((error)=>error.section)).toEqual(["output","custom"]);
 task.tests.output_tests[0].match="exact";task.tests.custom_test="def test_student(student):\n    assert student.add(2,3) == 5";
 expect(validateTask(task)).toEqual([]);
});
it("retains data across sections and saves all authored checks without XP",async()=>{
 const user=userEvent.setup();const save=vi.fn().mockResolvedValue(undefined);
 render(<TaskEditorForm initial={emptyTask()} editing={false} onSave={save} onCancel={()=>{}}/>);
 await user.type(screen.getByLabelText("Task title"),"Addition");
 fireEvent.change(screen.getByLabelText("Student instructions"),{target:{value:"Write add(a, b)."}});
 await user.click(screen.getByRole("button",{name:"Code rules"}));
 await user.type(screen.getByLabelText("Required words"),"def, return");
 await user.type(screen.getByLabelText("Forbidden words"),"eval, exec");
 await user.click(screen.getByRole("button",{name:"Output tests"}));
 await user.click(screen.getByRole("button",{name:"Add output test"}));
 await user.type(screen.getByLabelText("Test name"),"Adds two numbers");
 await user.type(screen.getByLabelText("Expected output"),"5");
 await user.click(screen.getByRole("button",{name:"Custom test"}));
 fireEvent.change(screen.getByLabelText("Custom test code"),{target:{value:"def test_student(student):\n    assert student.add(2, 3) == 5"}});
 await user.click(screen.getByRole("button",{name:"Details"}));
 expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("Addition");
 await user.click(screen.getByRole("button",{name:"Create task"}));
 expect(await screen.findByText("Task saved.")).toBeTruthy();
 const payload=save.mock.calls[0][0];
 expect(payload).not.toHaveProperty("language");expect(payload).not.toHaveProperty("xp");expect(payload.tests.required_words).toEqual(["def","return"]);
 expect(payload.tests.require_main_guard).toBe(true);expect(payload.tests.output_tests[0].expected).toBe("5");
 expect(payload.tests.custom_test).toContain("test_student(student)");expect(payload.starter_files).toHaveProperty("main.py");
});
it("returns to the section with the first validation error",async()=>{
 render(<TaskEditorForm initial={emptyTask()} editing={false} onSave={vi.fn()} onCancel={()=>{}}/>);
 await userEvent.click(screen.getByRole("button",{name:"Output tests"}));
 await userEvent.click(screen.getByRole("button",{name:"Create task"}));
 expect(await screen.findByLabelText("Task title")).toBeTruthy();
 expect(screen.getByRole("button",{name:"Details Has errors"}).getAttribute("aria-current")).toBe("page");
});

it("resets the editor when clicking New task after saving or after confirming unsaved edits",async()=>{
 const user=userEvent.setup();
 const save=vi.fn().mockResolvedValue(undefined);
 const onNew=vi.fn();
 const savedTask={...emptyTask(),title:"Saved task",instructions:"Saved instructions"};
 render(<TaskEditorForm initial={savedTask} editing onSave={save} onCancel={()=>{}} onNew={onNew}/>);
 expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("Saved task");
 await user.click(screen.getByRole("button",{name:"New task"}));
 expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("");
 expect(onNew).toHaveBeenCalledTimes(1);

 await user.type(screen.getByLabelText("Task title"),"Draft task");
 await user.click(screen.getByRole("button",{name:"New task"}));
 expect(screen.getByRole("dialog",{name:"Start a new task?"})).toBeTruthy();
 await user.click(screen.getByRole("button",{name:"Start new task"}));
 expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("");
 expect(onNew).toHaveBeenCalledTimes(2);
});

it("renders a global back button on the topbar that navigates back",async()=>{
 const user=userEvent.setup();
 render(
  <InstructorThemeProvider>
   <MemoryRouter initialEntries={["/instructor/courses/1/builder"]}>
    <BreadcrumbProvider>
     <InstructorTopbar onMenu={()=>{}} assistantOpen={false} onAssistant={()=>{}}/>
     <Routes>
      <Route path="/instructor/courses/1/builder" element={<><output>Course builder</output><Link to="/instructor/courses/1/tasks/5">Edit task</Link></>}/>
      <Route path="/instructor/courses/1/tasks/5" element={<><PageBreadcrumbs items={[{label:"Builder",to:"/instructor/courses/1/builder"},{label:"Edit code task"}]}/><output>Task editor</output></>}/>
     </Routes>
    </BreadcrumbProvider>
   </MemoryRouter>
  </InstructorThemeProvider>
 );
 expect(screen.getByText("Course builder")).toBeTruthy();
 await user.click(screen.getByRole("link",{name:"Edit task"}));
 expect(screen.getByText("Task editor")).toBeTruthy();
 await user.click(screen.getByRole("button",{name:"Go back"}));
 expect(screen.getByText("Course builder")).toBeTruthy();
});
