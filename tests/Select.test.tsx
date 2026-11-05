import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../src/components/ui/Select";

beforeAll(() => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.getAnimations = () => [];
});
afterEach(cleanup);

const options = [
  { value: "python", label: "Python Evening", description: "Fundamentals" },
  { value: "frontend", label: "Frontend Weekend", description: "JavaScript" },
  { value: "unavailable", label: "Unavailable", disabled: true },
];
function Example({ searchable = false, disabled = false }: { searchable?: boolean; disabled?: boolean }) {
  const [value, setValue] = useState("python");
  return <><label htmlFor="test-select">Cohort</label><Select id="test-select" name="cohort" value={value} onChange={setValue} options={options} searchable={searchable} disabled={disabled} /><output>{value}</output><button>Next control</button></>;
}

describe("Select", () => {
  it("supports keyboard selection and closes the simple dropdown", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByLabelText("Cohort");
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("frontend"));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("searches descriptions and selects a result without changing to free text", async () => {
    const user = userEvent.setup();
    render(<Example searchable />);
    await user.click(screen.getByLabelText("Cohort"));
    const search = await screen.findByRole("combobox");
    await user.type(search, "JavaScript");
    expect(screen.queryByRole("option", { name: /Python Evening/ })).toBeNull();
    await user.keyboard("{ArrowDown}{Enter}");
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("frontend"));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(screen.getByLabelText("Cohort"));
  });

  it("shows empty results and Escape preserves selection", async () => {
    const user = userEvent.setup();
    render(<Example searchable />);
    await user.click(screen.getByLabelText("Cohort"));
    await user.type(await screen.findByRole("combobox"), "nothing-matches");
    expect(screen.getByText("No options found.")).toBeTruthy();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByRole("status").textContent).toBe("python");
  });

  it("skips disabled options and supports pointer selection", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByLabelText("Cohort"));
    await user.click(screen.getByRole("option", { name: "Unavailable" }));
    expect(screen.getByRole("status", { hidden: true }).textContent).toBe("python");
    await user.click(screen.getByRole("option", { name: /Frontend Weekend/ }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("frontend"));
  });

  it("clears the search on close and allows tabbing out", async () => {
    const user = userEvent.setup();
    render(<Example searchable />);
    const trigger = screen.getByLabelText("Cohort");
    await user.click(trigger);
    await user.type(await screen.findByRole("combobox"), "nothing-matches");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(trigger);
    await user.click(trigger);
    expect(await screen.findByRole("option", { name: /Python Evening/ })).toBeTruthy();
    await user.keyboard("{Tab}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next control" }));
  });

  it("never opens a disabled dropdown", async () => {
    const user = userEvent.setup();
    render(<Example disabled />);
    await user.click(screen.getByLabelText("Cohort"));
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });
});
