import { vi, describe, it, expect } from "vitest";
vi.mock("../../store/useStore", () => ({
  useStore: () => ({ isAdmin: false }),
}));
import { render, screen } from "../../test-utils";
import PreviewPage from "../PreviewPage";

describe("PreviewPage - non-admin", () => {
  it("renders as non-admin (no submit button)", () => {
    const onBack = vi.fn();
    const onCopy = vi.fn();
    render(
      <PreviewPage
        content="### Role:\nTest\n### Action:\nAct"
        onBack={onBack}
        onCopy={onCopy}
        isOpen={true}
      />
    );
    expect(screen.queryByText(/submit/i)).not.toBeInTheDocument();
  });
});