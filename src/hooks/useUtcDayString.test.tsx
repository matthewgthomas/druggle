import React from "react";
import { render, screen, act } from "@testing-library/react";
import { useUtcDayString } from "./useUtcDayString";

function UtcDayProbe() {
  const dayString = useUtcDayString();
  return <div data-testid="utc-day-string">{dayString}</div>;
}

describe("useUtcDayString", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns a UTC day string in yyyy-MM-dd format", () => {
    jest.setSystemTime(new Date("2026-02-07T12:34:56.000Z"));

    render(<UtcDayProbe />);

    expect(screen.getByTestId("utc-day-string")).toHaveTextContent(
      "2026-02-07"
    );
    expect(screen.getByTestId("utc-day-string").textContent).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it("updates automatically at UTC midnight", () => {
    jest.setSystemTime(new Date("2026-02-07T23:59:59.000Z"));

    render(<UtcDayProbe />);
    expect(screen.getByTestId("utc-day-string")).toHaveTextContent(
      "2026-02-07"
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("utc-day-string")).toHaveTextContent(
      "2026-02-08"
    );
  });
});
