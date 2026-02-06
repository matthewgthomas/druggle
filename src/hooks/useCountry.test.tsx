import React from "react";
import { render, screen } from "@testing-library/react";
import { ocCountryCodes } from "../domain/ocIndicators";
import { useCountry } from "./useCountry";

interface CountryProbeProps {
  dayString: string;
}

function CountryProbe({ dayString }: CountryProbeProps) {
  const country = useCountry(dayString);
  return <div data-testid="country-code">{country.code}</div>;
}

describe("useCountry", () => {
  it("always selects a country with OC data", () => {
    render(<CountryProbe dayString="2026-02-06" />);

    const code = screen.getByTestId("country-code").textContent ?? "";
    expect(ocCountryCodes.has(code)).toBe(true);
  });

  it("is deterministic for a given day string", () => {
    const { rerender } = render(<CountryProbe dayString="2026-02-06" />);
    const firstCode = screen.getByTestId("country-code").textContent;

    rerender(<CountryProbe dayString="2026-02-06" />);
    const secondCode = screen.getByTestId("country-code").textContent;

    expect(secondCode).toBe(firstCode);
  });

  it("uses forced country when the forced code has OC data", () => {
    render(<CountryProbe dayString="2022-02-02" />);

    expect(screen.getByTestId("country-code")).toHaveTextContent("TD");
  });
});

