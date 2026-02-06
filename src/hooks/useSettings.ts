import { useCallback, useState } from "react";

export interface SettingsData {
  distanceUnit: "km" | "miles";
  theme: "light" | "dark";
}

const defaultSettingsData: SettingsData = {
  distanceUnit: "km",
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light",
};

function loadSettings(): SettingsData {
  const storedSettings = localStorage.getItem("settings");
  const settingsData = storedSettings != null ? JSON.parse(storedSettings) : {};
  return {
    ...defaultSettingsData,
    ...settingsData,
  };
}

export function useSettings(): [
  SettingsData,
  (newSettings: Partial<SettingsData>) => void
] {
  const [settingsData, setSettingsData] = useState<SettingsData>(
    loadSettings()
  );

  const updateSettingsData = useCallback(
    (newSettings: Partial<SettingsData>) => {
      const updatedSettings = {
        ...settingsData,
        ...newSettings,
      };

      setSettingsData(updatedSettings);
      localStorage.setItem("settings", JSON.stringify(updatedSettings));
    },
    [settingsData]
  );

  return [settingsData, updateSettingsData];
}
