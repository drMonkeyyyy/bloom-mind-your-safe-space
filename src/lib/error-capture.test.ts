import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consumeLastCapturedError } from "./error-capture";

describe("error-capture", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return undefined if no error is captured", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("should capture unhandled rejection and error events", () => {
    const mockError = new Error("Test Error");
    
    // Simulate error event dispatching
    const event = new MessageEvent("error", {
      data: { error: mockError }
    });
    
    // Let's trigger a mock window error event listener if attached
    // Since addEventListener is set on globalThis
    const errorEvent = new ErrorEvent("error", { error: mockError });
    globalThis.dispatchEvent(errorEvent);
    
    expect(consumeLastCapturedError()).toBe(mockError);
  });

  it("should expire captured error after TTL", () => {
    const mockError = new Error("TTL Error");
    const errorEvent = new ErrorEvent("error", { error: mockError });
    
    globalThis.dispatchEvent(errorEvent);
    
    // Fast-forward time past 5 seconds (TTL_MS = 5000)
    vi.advanceTimersByTime(5001);
    
    expect(consumeLastCapturedError()).toBeUndefined();
  });
});
