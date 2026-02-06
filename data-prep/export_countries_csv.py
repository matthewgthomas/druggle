#!/usr/bin/env python3
"""
Export `countries` from `src/domain/countries.ts` into `data-prep/countries.csv`.

Run from anywhere:
  python3 data-prep/export_countries_csv.py
"""

from pathlib import Path
import csv
import re


def extract_countries_array(ts_text: str) -> str:
    marker = "export const countries: Country[] = ["
    start = ts_text.find(marker)
    if start == -1:
        raise RuntimeError("Could not find `countries` array marker.")

    i = start + len(marker)
    level = 1
    in_string = False
    escape = False

    while i < len(ts_text):
        ch = ts_text[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            i += 1
            continue

        if ch == '"':
            in_string = True
        elif ch == "[":
            level += 1
        elif ch == "]":
            level -= 1
            if level == 0:
                return ts_text[start + len(marker) : i]
        i += 1

    raise RuntimeError("Could not find end of `countries` array.")


def parse_country_rows(array_text: str):
    rows = []

    # Split by top-level object blocks to support both one-line and multiline objects.
    object_blocks = []
    level = 0
    in_string = False
    escape = False
    start = None
    for i, ch in enumerate(array_text):
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue

        if ch == '"':
            in_string = True
        elif ch == "{":
            if level == 0:
                start = i
            level += 1
        elif ch == "}":
            level -= 1
            if level == 0 and start is not None:
                object_blocks.append(array_text[start : i + 1])
                start = None

    if not object_blocks:
        raise RuntimeError("No country objects found in countries array.")

    for block in object_blocks:
        code_match = re.search(r'code:\s*"([^"]+)"', block)
        lat_match = re.search(r"latitude:\s*([-0-9.]+)", block)
        lon_match = re.search(r"longitude:\s*([-0-9.]+)", block)
        name_match = re.search(r'name:\s*"((?:[^"\\]|\\.)*)"', block, re.S)

        if not (code_match and lat_match and lon_match and name_match):
            snippet = block.strip().replace("\n", "\\n")
            raise RuntimeError(f"Failed to parse country object: {snippet[:200]}")

        rows.append(
            {
                "code": code_match.group(1),
                "latitude": lat_match.group(1),
                "longitude": lon_match.group(1),
                "name": name_match.group(1).replace('\\"', '"').replace("\\\\", "\\"),
            }
        )

    return rows


def main():
    repo_root = Path(__file__).resolve().parents[1]
    countries_ts = repo_root / "src" / "domain" / "countries.ts"
    countries_csv = repo_root / "data-prep" / "countries.csv"

    ts_text = countries_ts.read_text(encoding="utf-8")
    array_text = extract_countries_array(ts_text)
    rows = parse_country_rows(array_text)

    with countries_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["code", "latitude", "longitude", "name"]
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {countries_csv}")


if __name__ == "__main__":
    main()
