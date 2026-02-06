import React from "react";
import { render, screen } from "@testing-library/react";
import { Settings } from "./Settings";
import { SettingsData } from "../../hooks/useSettings";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("./Panel", () => ({
  Panel: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("Settings panel", () => {
  const settingsData: SettingsData = {
    distanceUnit: "km",
    theme: "light",
  };

  it("does not render difficulty modifier controls", () => {
    render(
      <Settings
        isOpen
        close={jest.fn()}
        settingsData={settingsData}
        updateSettings={jest.fn()}
      />
    );

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.getByLabelText("settings.distanceUnit")).toBeInTheDocument();
    expect(screen.getByLabelText("settings.theme")).toBeInTheDocument();
  });
});

