import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { emptyTask } from "../src/features/tasks/taskForm";
import { parseTaskJson } from "../src/features/tasks/taskJson";
import { QuizEditorForm } from "../src/features/tasks/components/editor/QuizEditorForm";
import { TaskEditorForm } from "../src/features/tasks/components/editor/TaskEditorForm";
import { TaskJsonTools } from "../src/features/tasks/components/editor/TaskJsonTools";
import { validateQuiz, type QuizTaskInput } from "../src/features/tasks/quizForm";

vi.mock("../src/features/tasks/components/editor/TaskCodeInput",()=>({TaskCodeInput:({id,label,value,onChange}:{id:string;label:string;value:string;onChange:(value:string)=>void})=><textarea id={id} aria-label={label} value={value} onChange={(event)=>onChange(event.target.value)}/>}));
beforeAll(()=>{globalThis.ResizeObserver=class {observe(){}unobserve(){}disconnect(){}};Element.prototype.getAnimations=()=>[];});
afterEach(()=>{cleanup();vi.clearAllMocks();});
const quiz=():QuizTaskInput=>({title:"Python basics",type:"quiz",instructions:"Choose one answer.",questions:[{id:"q1",prompt:"Which defines a function?",choices:[{id:"a",text:"def"},{id:"b",text:"class"}],correct_choice_id:"a",explanation:"Use def."},{id:"q2",prompt:"Which returns a value?",choices:[{id:"a",text:"return"},{id:"b",text:"pass"}],correct_choice_id:"a",explanation:""}]});
const code=()=>({...emptyTask(),title:"Addition",instructions:"Write add(a, b)."});

it("round-trips both JSON task types and preserves code and whitespace",()=>{
 const task=code();task.starter_files["helpers.py"]="print('hello')\n";task.tests.output_tests=[{input:"  Ada\n",expected_output:"Hello, Ada!\n",comparison:"exact"}];
 expect(parseTaskJson(JSON.stringify(task),"code")).toEqual(task);
 expect(parseTaskJson(JSON.stringify(quiz()),"quiz")).toEqual(quiz());
});
it("rejects malformed nested fields, unknown fields and the wrong task type",()=>{
 expect(()=>parseTaskJson("{broken","code")).toThrow(/Invalid JSON/);
 expect(()=>parseTaskJson(JSON.stringify(quiz()),"code")).toThrow(/matching task editor/);
 expect(()=>parseTaskJson(JSON.stringify({...code(),xp:100}),"code")).toThrow(/Unknown field xp/);
 expect(()=>parseTaskJson(JSON.stringify({...code(),starter_files:[]}),"code")).toThrow(/starter_files/);
 expect(()=>parseTaskJson(JSON.stringify({...code(),tests:{check_syntax:"true"}}),"code")).toThrow(/must be true or false/);
});
it("rejects duplicate IDs and missing correct choices",()=>{
 const task=quiz();task.questions[1].id="q1";task.questions[0].correct_choice_id="missing";
 expect(validateQuiz(task).length).toBe(2);
 expect(()=>parseTaskJson(JSON.stringify(task),"quiz")).toThrow(/correct answer/);
});
it("preserves the selected answer through choice and question reordering",async()=>{
 const user=userEvent.setup();const save=vi.fn().mockResolvedValue(undefined);
 render(<QuizEditorForm initial={quiz()} editing onSave={save} onCancel={()=>{}}/>);
 await user.click(screen.getByRole("button",{name:/Questions \(2\)/}));
 await user.click(screen.getByRole("radio",{name:"Choice 2 is correct for question 1"}));
 await user.click(screen.getByRole("button",{name:"Move choice 2 up in question 1"}));
 await user.click(screen.getByRole("button",{name:"Move question 1 down"}));
 await user.click(screen.getByRole("button",{name:"Save changes"}));
 expect(await screen.findByText("Quiz saved.")).toBeTruthy();
 const result=save.mock.calls[0][0] as QuizTaskInput;
 expect(result.questions[1].id).toBe("q1");expect(result.questions[1].correct_choice_id).toBe("b");expect(result.questions[1].choices[0].id).toBe("b");
 expect(result).not.toHaveProperty("xp");expect(result).not.toHaveProperty("language");
});
it("confirms replacement before applying pasted quiz JSON",async()=>{
 const user=userEvent.setup();const apply=vi.fn();
 render(<TaskJsonTools value={quiz()} hasDraft disabled={false} onImport={apply}/>);
 await user.click(screen.getByRole("button",{name:"Import JSON"}));
 fireEvent.change(screen.getByLabelText("Task JSON"),{target:{value:JSON.stringify({...quiz(),title:"Imported quiz"})}});
 await user.click(screen.getByRole("button",{name:"Load into form"}));
 expect(apply).not.toHaveBeenCalled();
 await user.click(screen.getByRole("button",{name:"Replace form content"}));
 expect(apply.mock.calls[0][0].title).toBe("Imported quiz");
});
it("loads code JSON into the actual editor without saving automatically",async()=>{
 const user=userEvent.setup();const save=vi.fn();
 render(<TaskEditorForm initial={emptyTask()} editing={false} onSave={save} onCancel={()=>{}}/>);
 await user.click(screen.getByRole("button",{name:"Import JSON"}));
 fireEvent.change(screen.getByLabelText("Task JSON"),{target:{value:JSON.stringify(code())}});
 await user.click(screen.getByRole("button",{name:"Load into form"}));
 await waitFor(()=>expect(screen.queryByRole("dialog")).toBeNull());
 expect((screen.getByLabelText("Task title") as HTMLInputElement).value).toBe("Addition");
 expect(save).not.toHaveBeenCalled();
});
it("reads an uploaded JSON file and copies the current payload",async()=>{
 const user=userEvent.setup();const apply=vi.fn();
 render(<TaskJsonTools value={quiz()} hasDraft={false} disabled={false} onImport={apply}/>);
 await user.click(screen.getByRole("button",{name:"Copy JSON"}));
 expect(await screen.findByText("Task JSON copied.")).toBeTruthy();
 await user.click(screen.getByRole("button",{name:"Import JSON"}));
 const file=new File([JSON.stringify(quiz())],"quiz.json",{type:"application/json"});Object.defineProperty(file,"text",{value:async()=>JSON.stringify(quiz())});
 await user.upload(screen.getByLabelText("Task JSON file"),file);
 await waitFor(()=>expect((screen.getByLabelText("Task JSON") as HTMLTextAreaElement).value).toContain("Python basics"));
 await user.click(screen.getByRole("button",{name:"Load into form"}));
 expect(apply).toHaveBeenCalledWith(quiz());
});
