import { useMemo } from "react";
import seedrandom from "seedrandom";
import { Country } from "../domain/countries";
import { countriesWithOcData } from "../domain/playableCountries";

const forcedCountries: Record<string, string> = {
  "2022-02-02": "TD",
  "2022-02-03": "PY",
};

export function useCountry(dayString: string): Country {
  return useMemo(() => {
    const forcedCountryCode = forcedCountries[dayString];
    const forcedCountry =
      forcedCountryCode != null
        ? countriesWithOcData.find(
            (country) => country.code === forcedCountryCode
          )
        : undefined;

    return (
      forcedCountry ??
      countriesWithOcData[
        Math.floor(seedrandom.alea(dayString)() * countriesWithOcData.length)
      ]
    );
  }, [dayString]);
}
