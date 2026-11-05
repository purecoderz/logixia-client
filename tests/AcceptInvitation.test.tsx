import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../src/features/auth/context/AuthContext";
import { InvitationService } from "../src/features/cohorts/Services/invitationService";
import { AuthForm } from "../src/features/auth/components/AuthForm";
import AcceptInvitationPage from "../src/features/cohorts/Pages/AcceptInvitationPage";

vi.mock("../src/features/cohorts/Services/invitationService", () => ({ InvitationService: { preview: vi.fn(), accept: vi.fn() } }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const preview = {cohort_id:1,cohort_name:"Python Evening",course_title:"Python Fundamentals",email:"ada@example.com",access:"waived" as const,expires_at:"2099-01-01T00:00:00Z"};
function LoginDestination() { const location=useLocation(); return <p>Return: {location.state?.from?.pathname ?? location.pathname}{location.state?.from?.search ?? location.search}</p>; }
function setup({email="ada@example.com",guest=false,token=true,expired=false}={}) {
  vi.mocked(InvitationService.preview).mockResolvedValue(expired ? {...preview,expires_at:"2020-01-01T00:00:00Z"} : preview);
  vi.mocked(InvitationService.accept).mockResolvedValue({cohort_id:1,membership_id:12});
  const client = new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
  render(<QueryClientProvider client={client}><AuthContext value={{profile:guest ? null : {id:"user-1",username:"ada",email},isLoading:false,login:vi.fn(),logout:vi.fn()}}><MemoryRouter initialEntries={[`/invitations/accept${token ? "?token=test-token" : ""}`]}><Routes><Route path="/invitations/accept" element={<AcceptInvitationPage/>}/><Route path="/auth/login" element={<LoginDestination/>}/></Routes></MemoryRouter></AuthContext></QueryClientProvider>);
  return client;
}

describe("Invitation acceptance", () => {
 it("login returns to the invitation with its token", async () => {
  render(<AuthContext value={{profile:{id:"user-1",username:"ada",email:"ada@example.com"},isLoading:false,login:vi.fn(),logout:vi.fn()}}><MemoryRouter initialEntries={[{pathname:"/auth/login",state:{from:{pathname:"/invitations/accept",search:"?token=original-token"}}}]}><Routes><Route path="/auth/login" element={<AuthForm isLogin onToggleAuth={()=>{}}/>}/><Route path="/invitations/accept" element={<LoginDestination/>}/></Routes></MemoryRouter></AuthContext>);
  // LoginDestination reads the current URL to check that Navigate retained the token.
  expect(await screen.findByText("Return: /invitations/accept?token=original-token")).toBeTruthy();
 });
 it("does not preview or accept when token is missing", () => {
  setup({token:false});
  expect(screen.getByText(/missing its invitation token/)).toBeTruthy();
  expect(InvitationService.preview).not.toHaveBeenCalled();
  expect(InvitationService.accept).not.toHaveBeenCalled();
 });
 it("returns a signed-out student to the complete invitation URL", async () => {
  setup({guest:true});
  await userEvent.click(screen.getByRole("link",{name:"Sign in"}));
  expect(screen.getByText("Return: /invitations/accept?token=test-token")).toBeTruthy();
  expect(InvitationService.preview).not.toHaveBeenCalled();
 });
 it("requires an explicit click to accept and shows success", async () => {
  setup();
  const button=await screen.findByRole("button",{name:"Accept invitation"});
  expect(InvitationService.accept).not.toHaveBeenCalled();
  await userEvent.click(button);
  expect(await screen.findByText(/You’ve joined Python Evening/)).toBeTruthy();
  expect(InvitationService.accept).toHaveBeenCalledExactlyOnceWith("test-token");
 });
 it("keeps success after a double click and cohort query refresh", async () => {
  const client = setup();
  const button = await screen.findByRole("button", { name: "Accept invitation" });
  await userEvent.dblClick(button);
  expect(await screen.findByText(/You’ve joined Python Evening/)).toBeTruthy();
  await act(async () => { await client.invalidateQueries({ queryKey: ["cohorts"] }); });
  expect(screen.getByText(/You’ve joined Python Evening/)).toBeTruthy();
  expect(InvitationService.accept).toHaveBeenCalledExactlyOnceWith("test-token");
  expect(InvitationService.preview).toHaveBeenCalledTimes(1);
 });
 it("blocks a different email", async () => {
  setup({email:"other@example.com"});
  const button=await screen.findByRole("button",{name:"Accept invitation"});
  expect((button as HTMLButtonElement).disabled).toBe(true);
  expect(InvitationService.accept).not.toHaveBeenCalled();
 });
 it("blocks an expired invitation", async () => {
  setup({expired:true});
  const button=await screen.findByRole("button",{name:"Accept invitation"});
  expect((button as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText(/This invitation has expired/)).toBeTruthy();
  expect(InvitationService.accept).not.toHaveBeenCalled();
 });
});
