import { countries } from "./countries";
import {
  countriesWithOcData,
  findCountryWithOcDataByName,
} from "./playableCountries";

describe("playableCountries", () => {
  it("excludes countries that are missing OC data", () => {
    expect(countries.some((country) => country.code === "AQ")).toBe(true);
    expect(countriesWithOcData.some((country) => country.code === "AQ")).toBe(
      false
    );
  });

  it("finds only countries that have OC data", () => {
    expect(findCountryWithOcDataByName("en", "Canada")?.code).toBe("CA");
    expect(findCountryWithOcDataByName("en", "Antarctica")).toBeUndefined();
  });
});
