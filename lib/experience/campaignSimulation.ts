export type CampaignObjective = 'messages' | 'views'
export type CampaignPlacement = 'home' | 'search'
export type CampaignTier = 'free' | 'featured' | 'gold' | 'pro' | 'elite'

export type CampaignInput = {
  objective: CampaignObjective
  placement: CampaignPlacement
  tier: CampaignTier
  /** Unitless budget. Not a currency and not a package price. */
  budget: number
  days: number
}

export type CampaignEstimate = {
  simulated: true
  impressions: number
  reach: number
  interactions: number
  leads: number
  assumptions: string[]
}

const BASE_IMPRESSIONS_PER_UNIT_DAY = 40
const PLACEMENT_WEIGHT: Record<CampaignPlacement, number> = { home: 1, search: 0.72 }
const TIER_WEIGHT: Record<CampaignTier, number> = {
  free: 1,
  featured: 1.25,
  gold: 1.5,
  pro: 1.8,
  elite: 2.1,
}
const REACH_OF_IMPRESSIONS = 0.62
const INTERACTION_RATE: Record<CampaignObjective, number> = { views: 0.04, messages: 0.09 }
const LEAD_OF_INTERACTIONS: Record<CampaignObjective, number> = { views: 0.12, messages: 0.4 }

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** Illustrative delivery only. None of these weights come from campaign history. */
export function simulateCampaign(input: CampaignInput): CampaignEstimate {
  const budget = clamp(input.budget, 0, 100000)
  const days = clamp(Math.round(input.days), 1, 90)
  const impressions = Math.round(
    budget * days * BASE_IMPRESSIONS_PER_UNIT_DAY * PLACEMENT_WEIGHT[input.placement] * TIER_WEIGHT[input.tier],
  )
  const reach = Math.round(impressions * REACH_OF_IMPRESSIONS)
  const interactions = Math.round(reach * INTERACTION_RATE[input.objective])
  const leads = Math.round(interactions * LEAD_OF_INTERACTIONS[input.objective])
  return {
    simulated: true,
    impressions,
    reach,
    interactions,
    leads,
    assumptions: [
      'Base rate is 40 impressions per budget unit per day, before placement and tier.',
      'Search placement is weighted 0.72 against home. Tiers use fixed multipliers from 1 to 2.1.',
      'Reach is 62% of impressions. Interactions and leads use fixed rates by objective.',
      'Budget units are not a currency, and no tier has a price.',
    ],
  }
}
