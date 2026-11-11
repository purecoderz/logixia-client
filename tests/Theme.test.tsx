import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeBoundary, ThemeProvider, InstructorThemeProvider, useTheme } from "../src/features/theme/ThemeProvider";
import { MemoryRouter, Routes, Route, Link } from "react-router-dom";
import { ThemeToggle } from "../src/features/theme/ThemeToggle";
import { InstructorTopbar } from "../src/layouts/InstructorLayout/InstructorTopbar";

let mediaChange: ((event?: unknown) => void) | undefined;
let media: {matches:boolean; addEventListener:ReturnType<typeof vi.fn>; removeEventListener:ReturnType<typeof vi.fn>};
beforeEach(()=>{
 localStorage.clear();
 media={matches:true,addEventListener:vi.fn((_type, listener)=>{mediaChange=listener;}),removeEventListener:vi.fn()};
 vi.stubGlobal("matchMedia",vi.fn(()=>media));
});
afterEach(()=>{cleanup();localStorage.clear();vi.unstubAllGlobals();});
function Preference(){const {preference,theme,setPreference}=useTheme();return <><output>{preference}:{theme}</output><button onClick={()=>setPreference("system")}>Use system</button></>;}

it("defaults to dark and toggles to a persistent light theme from the navbar",async()=>{
 render(
   <InstructorThemeProvider>
     <InstructorTopbar
       onMenu={() => {}}
       assistantOpen={false}
       onAssistant={() => {}}
     />
   </InstructorThemeProvider>,
 );
 expect(document.body.dataset.appTheme).toBe("dark");
 await userEvent.click(screen.getByRole("button",{name:"Switch to light theme"}));
 expect(document.body.dataset.appTheme).toBe("light");
 expect(localStorage.getItem("appTheme")).toBe("light");
 expect(screen.getByRole("button",{name:"Switch to dark theme"})).toBeTruthy();
});
it("restores a saved theme and removes instructor colors when leaving the layout",()=>{
 localStorage.setItem("appTheme","light");
 const {unmount}=render(<InstructorThemeProvider><Preference/></InstructorThemeProvider>);
 expect(document.body.dataset.appTheme).toBe("light");
 unmount();
 expect(document.body.hasAttribute("data-app-theme")).toBe(false);
});
it("follows device changes only in system mode",async()=>{
 render(<InstructorThemeProvider><Preference/></InstructorThemeProvider>);
 await userEvent.click(screen.getByRole("button",{name:"Use system"}));
 expect(screen.getByRole("status").textContent).toBe("system:dark");
 act(()=>{media.matches=false;mediaChange?.();});
 await waitFor(()=>expect(document.body.dataset.appTheme).toBe("light"));
 expect(localStorage.getItem("appTheme")).toBe("system");
});
it("syncs theme changes across tabs",()=>{
 render(<InstructorThemeProvider><Preference/></InstructorThemeProvider>);
 act(()=>{localStorage.setItem("appTheme","light");window.dispatchEvent(new StorageEvent("storage",{key:"appTheme"}));});
 expect(document.body.dataset.appTheme).toBe("light");
});

it("preserves the previous instructor preference during migration",()=>{
 localStorage.setItem("instructorTheme","light");
 render(<ThemeProvider><Preference/></ThemeProvider>);
 expect(document.body.dataset.appTheme).toBe("light");
});

it.each(["/playground", "/tasks/12", "/live/room"])("shares the saved theme with a standalone workspace at %s",async(path)=>{
 localStorage.setItem("appTheme","light");
 function Student(){return <ThemeProvider><ThemeToggle/><Link to={path}>Open coding workspace</Link></ThemeProvider>;}
 function Workspace(){const {theme}=useTheme();return <><output>{theme}</output><Link to="/">Back to student</Link></>;}
 render(<MemoryRouter><Routes><Route path="/" element={<Student/>}/><Route path={path} element={<ThemeBoundary><Workspace/></ThemeBoundary>}/></Routes></MemoryRouter>);
 expect(document.body.dataset.appTheme).toBe("light");
 await userEvent.click(screen.getByRole("link",{name:"Open coding workspace"}));
 expect(document.body.dataset.appTheme).toBe("light");
 expect(screen.getByRole("status").textContent).toBe("light");
 await userEvent.click(screen.getByRole("link",{name:"Back to student"}));
 expect(document.body.dataset.appTheme).toBe("light");
});

it("reuses its parent theme and preserves child state when toggled", async () => {
 const { useState } = await import("react");
 function Draft() {
   const [value, setValue] = useState("print('hello')");
   return <><input aria-label="Code draft" value={value} onChange={event => setValue(event.target.value)} /><ThemeToggle /><Preference /></>;
 }
 render(<ThemeProvider><ThemeBoundary><Draft /></ThemeBoundary></ThemeProvider>);
 const input = screen.getByRole("textbox", { name: "Code draft" }) as HTMLInputElement;
 await userEvent.type(input, " # edited");
 await userEvent.click(screen.getByRole("button", { name: "Switch to light theme" }));
 expect(input.value).toBe("print('hello') # edited");
 expect(screen.getByRole("status").textContent).toBe("light:light");
 expect(document.body.dataset.appTheme).toBe("light");
});
