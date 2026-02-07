import {
  countries,
  Country,
  getCountryName,
  sanitizeCountryName,
} from "./countries";
import { ocCountryCodes } from "./ocIndicators";

export const countriesWithOcData = countries.filter((country) =>
  ocCountryCodes.has(country.code)
);

export function getCountryNamesWithOcData(language: string): string[] {
  return countriesWithOcData.map((country) =>
    getCountryName(language, country).toUpperCase()
  );
}

export function findCountryWithOcDataByName(
  language: string,
  guessedName: string
): Country | undefined {
  const sanitizedGuessedName = sanitizeCountryName(guessedName);

  return countriesWithOcData.find(
    (country) =>
      sanitizeCountryName(getCountryName(language, country)) ===
      sanitizedGuessedName
  );
}
