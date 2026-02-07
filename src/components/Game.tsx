import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCountryName } from "../domain/countries";
import { useGuesses } from "../hooks/useGuesses";
import { CountryInput } from "./CountryInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useCountry } from "../hooks/useCountry";
import { CountryOcChart } from "./CountryOcChart";
import { useUtcDayString } from "../hooks/useUtcDayString";
import { buildOcTipData, OcTipData } from "../domain/ocTip";
import { GuessTip } from "./GuessTip";
import { findCountryWithOcDataByName } from "../domain/playableCountries";

const MAX_TRY_COUNT = 6;

interface GameProps {
  settingsData: SettingsData;
}

export function Game({ settingsData }: GameProps) {
  const { t, i18n } = useTranslation();
  const dayString = useUtcDayString();

  const country = useCountry(dayString);

  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, addGuess] = useGuesses(dayString);
  const [tipData, setTipData] = useState<OcTipData | null>(null);
  const [isTipVisible, setIsTipVisible] = useState(false);

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const guessedCountry = findCountryWithOcDataByName(
        i18n.resolvedLanguage,
        currentGuess
      );

      if (guessedCountry == null) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(guessedCountry, country),
      };

      addGuess(newGuess);
      setCurrentGuess("");

      if (newGuess.distance === 0) {
        setTipData(null);
        setIsTipVisible(false);
        toast.success(t("welldone"), { delay: 2000 });
        return;
      }

      setTipData(buildOcTipData(guessedCountry.code, country.code));
      setIsTipVisible(true);
    },
    [addGuess, country, currentGuess, i18n.resolvedLanguage, t]
  );

  useEffect(() => {
    if (
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      toast.info(getCountryName(i18n.resolvedLanguage, country).toUpperCase(), {
        autoClose: false,
        delay: 2000,
      });
    }
  }, [country, guesses, i18n.resolvedLanguage]);

  useEffect(() => {
    setTipData(null);
    setIsTipVisible(false);
  }, [dayString]);

  return (
    <div className="flex-grow flex flex-col mx-2">
      <div className="my-1">
        <CountryOcChart countryCode={country.code} />
      </div>
      <Guesses
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
      />
      {isTipVisible && tipData != null ? (
        <GuessTip tipData={tipData} onClose={() => setIsTipVisible(false)} />
      ) : null}
      <div className="my-2">
        {gameEnded ? (
          <>
            <Share
              guesses={guesses}
              dayString={dayString}
              settingsData={settingsData}
            />
            <a
              className="underline w-full text-center block mt-4"
              href={`https://www.google.com/maps?q=${getCountryName(
                i18n.resolvedLanguage,
                country
              )}&hl=${i18n.resolvedLanguage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("showOnGoogleMaps")}
            </a>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <CountryInput
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
              <button
                className="border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                type="submit"
              >
                🌍 {t("guess")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
