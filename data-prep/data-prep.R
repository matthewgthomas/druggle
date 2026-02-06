library(tidyverse)
library(rio)
library(jsonlite)

countries <- read_csv("data-prep/countries.csv")

# Load the Organised Crime Index dataset
# Source: https://ocindex.net/downloads
oc_index <- import("https://ocindex.net/assets/downloads/global_oc_index.xlsx", sheet = "2025_dataset")

# Which countries are listed in oc_index but not in countries, and vice versa?
sort(dplyr::setdiff(oc_index$Country, countries$name))
sort(dplyr::setdiff(countries$name, oc_index$Country))

oc_index <- 
  oc_index |> 
  as_tibble() |>

  # Manually match country names
  mutate(Country = case_match(
    Country,
    "Cabo Verde" ~ "Cape Verde",
    "Congo, Dem. Rep." ~ "Democratic Republic of the Congo",
    "Congo, Rep." ~ "Congo",
    "eSwatini" ~ "Eswatini",
    "Korea, DPR" ~ "North Korea",
    "Korea, Rep." ~ "South Korea",
    "Micronesia (Federated States of)" ~ "Micronesia",
    "North Macedonia" ~ "Macedonia",
    "Sao Tome and Principe" ~ "São Tomé and Príncipe",
    "St. Kitts and Nevis" ~ "Saint Kitts and Nevis",
    "St. Lucia" ~ "Saint Lucia",
    "St. Vincent and the Grenadines" ~ "Saint Vincent and the Grenadines",
    .default = Country
  )) |> 

  left_join(countries, by = join_by("Country" == "name")) |> 
  
  mutate(code = replace_na(code, "NA")) |> 
  
  select(-Continent, -Region) |> 
  rename(name = Country) |> 
  relocate(code)

markets <- c("Human trafficking","Human smuggling","Extortion and protection racketeering",
             "Arms trafficking","Trade in counterfeit goods","Illicit trade in excisable goods",
             "Flora crimes","Fauna crimes","Non-renewable resource crimes",
             "Heroin trade","Cocaine trade","Cannabis trade","Synthetic drug trade",
             "Cyber-dependent crimes","Financial crimes")

actors <- c("Mafia-style groups","Criminal networks","State-embedded actors",
            "Foreign actors","Private sector actors")

resilience <- c("Political leadership and governance",
                "Government transparency and accountability",
                "International cooperation","National policies and laws",
                "Judicial system and detention","Law enforcement",
                "Territorial integrity","Anti-money laundering",
                "Economic regulatory capacity","Victim and witness support",
                "Prevention","Non-state actors")

# Drop the overall and domain averages
X <- oc_index %>% select(code, name, latitude, longitude, all_of(c(markets, actors, resilience)))
indicator_columns <- c(markets, actors, resilience)

# Save
write_csv(X, "data-prep/oc_index.csv")

# Save indicator values for chart rendering in the web app
indicator_meta <- tibble(label = indicator_columns) |>
  mutate(
    id = label |>
      str_to_lower() |>
      str_replace_all("[^a-z0-9]+", "_") |>
      str_replace_all("^_+|_+$", ""),
    pillar = case_when(
      label %in% markets ~ "markets",
      label %in% actors ~ "actors",
      TRUE ~ "resilience"
    )
  ) |>
  select(id, label, pillar)

country_values <- X |>
  select(code, all_of(indicator_columns))

oc_indicators <- list(
  version = "GOCI_2025_indicators",
  indicators = pmap(indicator_meta, \(id, label, pillar) {
    list(id = id, label = label, pillar = pillar)
  }),
  countries = country_values |>
    (\(table) split(table, table$code))() |>
    map(\(row) unname(as.numeric(row[1, indicator_columns, drop = TRUE])))
)

write_json(
  oc_indicators,
  "src/data/oc_indicators.json",
  auto_unbox = TRUE
)

# scale 1–10 -> 0–1
X01 <- X %>%
  mutate(across(-(code:longitude), ~ (.x - 1) / 9))

# L1 distance in [0,1]
L1_dist <- function(mat) as.matrix(dist(mat, method = "manhattan")) / ncol(mat)

# Calculate distances for each pillar and average them
D_markets <- L1_dist(as.matrix(X01[markets]))
D_actors  <- L1_dist(as.matrix(X01[actors]))
D_resil   <- L1_dist(as.matrix(X01[resilience]))

D_balanced <- (D_markets + D_actors + D_resil) / 3
S_balanced <- 1 - D_balanced

# Prepare output for JavaScript
countries <- X$code
n <- length(countries)

index <- setNames(seq_len(n) - 1, countries)           # 0-based
index_lower <- setNames(seq_len(n) - 1, tolower(countries))

# flatten row-major for JS
data_row_major <- as.vector(t(round(S_balanced, 6)))

out <- list(
  version = "GOCI_2025_pillar_balanced_L1_similarity",
  n = n,
  countries = countries,
  index = index,
  index_lower = index_lower,
  data_row_major = data_row_major
)

write_json(out, "src/data/country_similarity.json", auto_unbox = TRUE)
