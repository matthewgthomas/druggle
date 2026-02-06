import React from "react";
import { render, screen } from "@testing-library/react";
import { Share } from "./Share";
import { SettingsData } from "../hooks/useSettings";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("react-copy-to-clipboard", () => ({
  __esModule: true,
  default: ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div data-testid="copy-wrapper" data-text={text}>
      {children}
    </div>
  ),
}));

describe("Share", () => {
  const settingsData: SettingsData = {
    distanceUnit: "km",
    theme: "light",
  };

  it("does not add removed difficulty emojis to the share title", () => {
    render(
      <Share
        guesses={[{ direction: "N", distance: 0, name: "France" }]}
        dayString="2022-01-22"
        settingsData={settingsData}
      />
    );

    const text =
      screen.getByTestId("copy-wrapper").getAttribute("data-text") ?? "";

    expect(text).toContain("#Worldle #1 1/6");
    expect(text).not.toContain("🙈");
    expect(text).not.toContain("🌀");
  });
});

