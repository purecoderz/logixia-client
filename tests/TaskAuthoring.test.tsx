import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskEditorForm } from "../src/features/tasks/components/editor/TaskEditorForm";
import { emptyTask, validateTask, validPythonPath, wordsFrom } from "../src/features/tasks/taskForm";

vi.mock("../src/features/tasks/components/editor/TaskCodeInput",()=>({TaskCodeInput:({id,label,value,onChange}:{id:string;label:string;value:string;onChange:(v:string)=>void})=><textarea id={id} aria-label={label} value={value} onChange={(event)=>onChange(event.target.value)}/>}));
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
 task.tests.output_tests=[{input:"",expected_output:"",comparison:"contains"}];task.tests.custom_test="def something_else():\n    pass";
 expect(validateTask(task).map((error)=>error.section)).toEqual(["output","custom"]);
 task.tests.output_tests[0].comparison="exact";task.tests.custom_test="def test_student(student):\n    assert student.add(2,3) == 5";
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
 await user.type(screen.getByLabelText("Expected output"),"5");
 await user.click(screen.getByRole("button",{name:"Custom test"}));
 fireEvent.change(screen.getByLabelText("Custom test code"),{target:{value:"def test_student(student):\n    assert student.add(2, 3) == 5"}});
 await user.click(screen.getByRole("button",{name:"Details"}));
 expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("Addition");
 await user.click(screen.getByRole("button",{name:"Create task"}));
 expect(await screen.findByText("Task saved.")).toBeTruthy();
 const payload=save.mock.calls[0][0];
 expect(payload).not.toHaveProperty("language");expect(payload).not.toHaveProperty("xp");expect(payload.tests.required_words).toEqual(["def","return"]);
 expect(payload.tests.require_main_guard).toBe(true);expect(payload.tests.output_tests[0].expected_output).toBe("5");
 expect(payload.tests.custom_test).toContain("test_student(student)");expect(payload.starter_files).toHaveProperty("main.py");
});
it("returns to the section with the first validation error",async()=>{
 render(<TaskEditorForm initial={emptyTask()} editing={false} onSave={vi.fn()} onCancel={()=>{}}/>);
 await userEvent.click(screen.getByRole("button",{name:"Output tests"}));
 await userEvent.click(screen.getByRole("button",{name:"Create task"}));
 expect(await screen.findByLabelText("Task title")).toBeTruthy();
 expect(screen.getByRole("button",{name:"Details Has errors"}).getAttribute("aria-current")).toBe("page");
});
