import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import { CourseMiniCart } from "@/components/learning/CourseMiniCart";
import { useCourseCartStore } from "@/store/courseCartStore";

describe("CourseMiniCart", () => {
  afterEach(() => {
    useCourseCartStore.getState().clear();
  });

  it("prikazuje stavke i link na plaćanje", () => {
    useCourseCartStore.getState().addPaidCourse({
      courseId: "a",
      slug: "a",
      title: "Program A",
      price: 120,
    });

    render(
      <MemoryRouter>
        <CourseMiniCart open onOpenChange={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText(/Program A/i)).toBeTruthy();
    const pay = screen.getByRole("link", { name: /Nastavi na plaćanje/i });
    expect(pay.getAttribute("href")).toBe("/dashboard/billing");
  });
});
