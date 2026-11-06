import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { InstructorSidebar } from "../src/layouts/InstructorLayout/Sidebar/InstructorSidebar";

vi.mock("../src/features/auth/context/AuthContext", () => ({ useAuth: () => ({profile:{username:"ada"},logout:vi.fn(),updateProfile:vi.fn()}) }));
beforeAll(() => { globalThis.ResizeObserver = class {observe() {} unobserve() {} disconnect() {}}; });
afterEach(cleanup);

it("keeps collapsed navigation accessible and opens grouped links", async () => {
  render(<MemoryRouter><InstructorSidebar collapsed /></MemoryRouter>);
  expect(screen.getByRole("link",{name:"Overview"})).toBeTruthy();
  expect(screen.getByRole("button",{name:"Log out"})).toBeTruthy();
  expect(screen.queryByText("Instructor Portal")).toBeNull();
  await userEvent.click(screen.getByRole("button",{name:"Cohorts"}));
  expect(await screen.findByRole("link",{name:"Manage Students"})).toBeTruthy();
  expect(screen.getByRole("link",{name:"Create Cohort"})).toBeTruthy();
});

it("restores text labels when expanded", () => {
  render(<MemoryRouter><InstructorSidebar /></MemoryRouter>);
  expect(screen.getByText("Instructor Portal")).toBeTruthy();
  expect(screen.getByText("Logixia Academy")).toBeTruthy();
});
