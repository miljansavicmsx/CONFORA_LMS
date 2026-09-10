import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router";

import {
  LandmarkDevAudit,
  auditPageLandmarks,
} from "@/components/accessibility/LandmarkDevAudit";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("landmark-dev-audit residual (MD01)", () => {
  it("exports LandmarkDevAudit named export required by App.tsx", () => {
    expect(typeof LandmarkDevAudit).toBe("function");
  });

  it("detects missing main#main-content landmark", () => {
    document.body.innerHTML = `<div id="root"><p>no main</p></div>`;
    const issues = auditPageLandmarks(document);
    expect(issues.some((i) => i.code === "main-content-count")).toBe(true);
  });

  it("passes when exactly one main#main-content exists", () => {
    document.body.innerHTML = `<main id="main-content"><h1>ok</h1></main>`;
    const issues = auditPageLandmarks(document);
    expect(issues.some((i) => i.code === "main-content-count")).toBe(false);
    expect(issues.some((i) => i.code === "duplicate-main")).toBe(false);
  });

  it("flags unlabeled nav landmarks", () => {
    document.body.innerHTML = `
      <main id="main-content"></main>
      <nav><a href="/">Home</a></nav>
    `;
    const issues = auditPageLandmarks(document);
    expect(issues.some((i) => i.code === "nav-missing-label")).toBe(true);
  });

  it("accepts labeled nav landmarks", () => {
    document.body.innerHTML = `
      <main id="main-content"></main>
      <nav aria-label="Primary"><a href="/">Home</a></nav>
    `;
    const issues = auditPageLandmarks(document);
    expect(issues.some((i) => i.code === "nav-missing-label")).toBe(false);
  });

  it("renders null DOM and warns in DEV when landmarks are missing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        createElement(MemoryRouter, null, createElement(LandmarkDevAudit)),
      );
    });

    expect(host.firstChild).toBeNull();

    await act(async () => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    expect(warn).toHaveBeenCalled();
    const joined = warn.mock.calls.map((c) => String(c[0])).join("\n");
    expect(joined).toContain("[CONFORA a11y landmarks]");

    await act(async () => {
      root.unmount();
    });
  });
});
