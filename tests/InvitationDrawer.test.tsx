import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvitationDrawer } from "../src/features/cohorts/components/instructor/InvitationDrawer";

beforeAll(() => {
  globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  Element.prototype.getAnimations = () => [];
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

it("opens, focuses email, creates and copies a link, then preserves it on reopening", async () => {
  const user = userEvent.setup();
  const onCreate = vi.fn().mockResolvedValue({url:"https://logixia.com/invitations/accept?token=test",expiresAt:"2099-01-01T12:00:00Z"});
  render(<InvitationDrawer onCreate={onCreate} />);
  expect(screen.queryByRole("dialog")).toBeNull();
  const trigger=screen.getByRole("button",{name:"Invite student"});
  await user.click(trigger);
  const email=await screen.findByLabelText("Student email");
  await waitFor(() => expect(document.activeElement).toBe(email));
  await user.type(email,"ada@example.com");
  await user.click(screen.getByRole("button",{name:"Create invitation"}));
  expect(onCreate).toHaveBeenCalledExactlyOnceWith({email:"ada@example.com",access:"owing"});
  const link=await screen.findByLabelText("Invitation link");
  expect((link as HTMLInputElement).value).toBe("https://logixia.com/invitations/accept?token=test");
  await user.click(screen.getByRole("button",{name:"Copy invitation link"}));
  expect(await screen.findByText("Invitation link copied.")).toBeTruthy();
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
  await user.click(trigger);
  expect((await screen.findByLabelText("Invitation link") as HTMLInputElement).value).toBe("https://logixia.com/invitations/accept?token=test");
});
