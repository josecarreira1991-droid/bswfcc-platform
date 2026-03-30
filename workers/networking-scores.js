/**
 * Networking Scores Worker — BSWFCC
 *
 * Recalculates match scores between all business profiles daily.
 * Inserts new networking_suggestions for high-scoring pairs.
 * Runs at 2 AM via PM2 cron.
 *
 * Env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

require("dotenv").config({ path: __dirname + "/.env" });
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("[networking-scores] Missing env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const MIN_SCORE_THRESHOLD = 30; // Minimum score to create a suggestion
const MAX_SUGGESTIONS_PER_MEMBER = 10;

function calculateMatchScore(profileA, profileB) {
  let score = 0;
  const reasons = [];

  const aOffers = profileA.services_offered || [];
  const aNeeds = profileA.services_needed || [];
  const bOffers = profileB.services_offered || [];
  const bNeeds = profileB.services_needed || [];
  const aIndustries = profileA.target_industries || [];
  const bIndustries = profileB.target_industries || [];
  const aLangs = profileA.languages || [];
  const bLangs = profileB.languages || [];
  const aTags = profileA.tags || [];
  const bTags = profileB.tags || [];

  // A offers what B needs
  const aOffersForB = aOffers.filter((s) => bNeeds.includes(s));
  if (aOffersForB.length > 0) {
    score += 30;
    reasons.push(`Oferece: ${aOffersForB.join(", ")}`);
  }

  // B offers what A needs
  const bOffersForA = bOffers.filter((s) => aNeeds.includes(s));
  if (bOffersForA.length > 0) {
    score += 30;
    reasons.push(`Precisa de: ${bOffersForA.join(", ")}`);
  }

  // Industry overlap
  const industryMatch = aIndustries.filter((i) => bIndustries.includes(i));
  if (industryMatch.length > 0) {
    score += 20;
    reasons.push(`Indústrias: ${industryMatch.join(", ")}`);
  }

  // Language overlap
  const langMatch = aLangs.filter((l) => bLangs.includes(l));
  if (langMatch.length > 0) score += 10;

  // Tag overlap
  const tagMatch = aTags.filter((t) => bTags.includes(t));
  if (tagMatch.length > 0) {
    score += 10;
    reasons.push(`Tags: ${tagMatch.join(", ")}`);
  }

  return { score: Math.min(score, 100), reasons };
}

async function run() {
  console.log(`[networking-scores] Starting at ${new Date().toISOString()}`);

  // Fetch all visible business profiles
  const { data: profiles, error: profileErr } = await supabase
    .from("business_profiles")
    .select("*, members!inner(id, full_name, company, status)")
    .eq("is_visible", true)
    .eq("members.status", "ativo");

  if (profileErr || !profiles) {
    console.error("[networking-scores] Error fetching profiles:", profileErr?.message);
    return;
  }

  console.log(`[networking-scores] Found ${profiles.length} active profiles`);

  if (profiles.length < 2) {
    console.log("[networking-scores] Not enough profiles to calculate scores");
    return;
  }

  // Fetch existing suggestions to avoid duplicates
  const { data: existingSuggestions } = await supabase
    .from("networking_suggestions")
    .select("member_id, suggested_member_id");

  const existingPairs = new Set(
    (existingSuggestions || []).map((s) => `${s.member_id}:${s.suggested_member_id}`)
  );

  const newSuggestions = [];

  // Calculate scores for all pairs
  for (let i = 0; i < profiles.length; i++) {
    const pA = profiles[i];
    const memberA = pA.members;
    let suggestionsForA = 0;

    for (let j = 0; j < profiles.length; j++) {
      if (i === j) continue;
      if (suggestionsForA >= MAX_SUGGESTIONS_PER_MEMBER) break;

      const pB = profiles[j];
      const memberB = pB.members;
      const pairKey = `${memberA.id}:${memberB.id}`;

      // Skip if suggestion already exists
      if (existingPairs.has(pairKey)) continue;

      const { score, reasons } = calculateMatchScore(pA, pB);

      if (score >= MIN_SCORE_THRESHOLD) {
        newSuggestions.push({
          member_id: memberA.id,
          suggested_member_id: memberB.id,
          score,
          reasons,
          status: "pending",
        });
        existingPairs.add(pairKey);
        suggestionsForA++;
      }
    }
  }

  if (newSuggestions.length === 0) {
    console.log("[networking-scores] No new suggestions to insert");
    return;
  }

  // Batch insert (max 100 at a time)
  let inserted = 0;
  for (let i = 0; i < newSuggestions.length; i += 100) {
    const batch = newSuggestions.slice(i, i + 100);
    const { error } = await supabase.from("networking_suggestions").insert(batch);
    if (error) {
      console.error("[networking-scores] Insert error:", error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`[networking-scores] Done: ${inserted} new suggestions created from ${profiles.length} profiles`);
}

run().catch((err) => {
  console.error("[networking-scores] Fatal:", err);
  process.exit(1);
});
