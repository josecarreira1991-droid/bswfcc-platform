/**
 * Market Data Sync Worker — BSWFCC
 *
 * Pulls data from public APIs and updates the market_data table.
 * Runs every 6 hours via PM2 cron.
 *
 * Sources:
 * - Census Bureau (population, demographics)
 * - BLS (employment, wages)
 * - FRED (economic indicators)
 * - Enterprise Florida (trade data — manual/cached)
 *
 * Env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

require("dotenv").config({ path: __dirname + "/.env" });
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("[market-sync] Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ─── Data Sources ───

const CENSUS_API_KEY = process.env.CENSUS_API_KEY || "";
const FRED_API_KEY = process.env.FRED_API_KEY || "";

async function fetchCensusData() {
  if (!CENSUS_API_KEY) {
    console.log("[market-sync] No CENSUS_API_KEY — skipping Census data");
    return [];
  }

  const places = [
    { fips: "county:071&in=state:12", indicator: "populacao_lee_county" },
    { fips: "place:10275&in=state:12", indicator: "populacao_cape_coral" },
    { fips: "place:24125&in=state:12", indicator: "populacao_fort_myers" },
  ];

  const results = await Promise.all(
    places.map(async (place) => {
      try {
        const url = `https://api.census.gov/data/2023/pep/population?get=POP_2023,NAME&for=${place.fips}&key=${CENSUS_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data[1]) return null;
        return {
          indicator: place.indicator,
          value: parseInt(data[1][0]).toLocaleString("en-US"),
          category: "demografia",
          source: `US Census Bureau ${new Date().getFullYear()}`,
        };
      } catch (err) {
        console.error(`[market-sync] Census error (${place.indicator}):`, err.message);
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

async function fetchFREDData() {
  if (!FRED_API_KEY) {
    console.log("[market-sync] No FRED_API_KEY — skipping FRED data");
    return [];
  }

  const series = [
    { id: "FLFLA12071LAUCN", indicator: "desemprego_lee_county", category: "emprego", format: "percent" },
    { id: "FLUR", indicator: "desemprego_florida", category: "emprego", format: "percent" },
    { id: "FLRGSP", indicator: "pib_florida", category: "economia", format: "billions" },
    { id: "MEHOINUSFLA672N", indicator: "renda_mediana_fl", category: "economia", format: "currency" },
  ];

  const results = await Promise.all(
    series.map(async (s) => {
      try {
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${s.id}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const obs = data.observations?.[0];
        if (!obs || obs.value === ".") return null;

        const numValue = parseFloat(obs.value);
        let displayValue;
        if (s.format === "percent") displayValue = `${numValue}%`;
        else if (s.format === "billions") displayValue = `$${(numValue / 1000000).toFixed(1)}M`;
        else if (s.format === "currency") displayValue = `$${numValue.toLocaleString("en-US")}`;
        else displayValue = String(numValue);

        return {
          indicator: s.indicator,
          value: displayValue,
          category: s.category,
          source: `FRED / Federal Reserve ${obs.date}`,
        };
      } catch (err) {
        console.error(`[market-sync] FRED error (${s.id}):`, err.message);
        return null;
      }
    })
  );

  return results.filter(Boolean);
}

async function fetchExchangeRate() {
  const updates = [];
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res.ok) {
      const data = await res.json();
      const brl = data.rates?.BRL;
      if (brl) {
        updates.push({
          indicator: "cambio_usd_brl",
          value: `R$ ${brl.toFixed(2)}`,
          category: "economia",
          source: `ExchangeRate API ${new Date().toISOString().split("T")[0]}`,
        });
      }
    }
  } catch (err) {
    console.error("[market-sync] Exchange rate error:", err.message);
  }
  return updates;
}

// ─── Main ───

async function run() {
  console.log(`[market-sync] Starting at ${new Date().toISOString()}`);

  const [census, fred, exchange] = await Promise.all([
    fetchCensusData(),
    fetchFREDData(),
    fetchExchangeRate(),
  ]);

  const allUpdates = [...census, ...fred, ...exchange];

  if (allUpdates.length === 0) {
    console.log("[market-sync] No data to update");
    return;
  }

  const now = new Date().toISOString();
  const rows = allUpdates.map((item) => ({ ...item, updated_at: now }));

  const { error, count } = await supabase
    .from("market_data")
    .upsert(rows, { onConflict: "indicator", ignoreDuplicates: false });

  if (error) {
    console.error("[market-sync] Upsert error:", error.message);
  }

  console.log(`[market-sync] Done: ${error ? "error" : "success"}, ${allUpdates.length} indicators processed`);
}

run().catch((err) => {
  console.error("[market-sync] Fatal:", err);
  process.exit(1);
});
