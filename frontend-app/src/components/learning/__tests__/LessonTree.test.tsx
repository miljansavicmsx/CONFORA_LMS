import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LessonTree } from "@/components/learning/LessonTree";
import { useCoursePlayerStore } from "@/store/coursePlayerStore";

describe("LessonTree", () => {
  it("delegira na CourseTOC i poziva odabir lekcije", () => {
    useCoursePlayerStore.setState({
      currentCourseId: "c",
      currentModuleId: "m",
      currentLessonId: "l1",
      lessonProgress: {},
    });

    const onSelect = vi.fn();
    const modules = [
      {
        id: "m",
        title: "Modul",
        order: 0,
        lessons: [{ id: "l1", title: "L1", contentType: "text" as const, durationMinutes: 5 }],
      },
    ];

    render(
      <LessonTree modules={modules} currentLessonId="l1" onSelectLesson={onSelect} immersive={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /L1/i }));
    expect(onSelect).toHaveBeenCalledWith("m", "l1");
  });
});
