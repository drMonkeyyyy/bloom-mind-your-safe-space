import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AffirmationWidget } from "./AffirmationWidget";
import "@testing-library/jest-dom";

describe("AffirmationWidget", () => {
  it("renders quote section and cloud emoji", () => {
    render(<AffirmationWidget />);
    
    // Check that header is rendered
    expect(screen.getByText("KATA HARI INI")).toBeInTheDocument();
    
    // Check that cloud emoji is rendered
    expect(screen.getByText("☁️")).toBeInTheDocument();
    
    // Check that some quote is rendered in quotes
    const quoteEl = screen.getByText(/"/);
    expect(quoteEl).toBeInTheDocument();
    expect(quoteEl.textContent).not.toBe('""');
  });
});
