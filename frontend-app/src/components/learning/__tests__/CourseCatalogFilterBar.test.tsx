import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CourseCatalogFilterBar } from "@/components/learning/CourseCatalogFilterBar";

describe("CourseCatalogFilterBar", () => {
  it("ažurira pretragu i šalje promjenu oblasti", () => {
    const onArea = vi.fn();
    const onSearch = vi.fn();

    render(
      <CourseCatalogFilterBar
        selectedArea="all"
        onAreaChange={onArea}
        searchQuery=""
        onSearchChange={onSearch}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "ISO" } });
    expect(onSearch).toHaveBeenLastCalledWith("ISO");

    fireEvent.click(screen.getByRole("tab", { name: /ISO\/IEC 17024/i }));
    expect(onArea).toHaveBeenCalledWith("iso-17024");
  });
});
