import assert from 'node:assert/strict'
import { simulateCampaign } from './campaignSimulation.ts'
import { suggestSectionName } from './suggestSection.ts'

const home = simulateCampaign({ objective: 'views', placement: 'home', tier: 'free', budget: 10, days: 2 })
const search = simulateCampaign({ objective: 'views', placement: 'search', tier: 'free', budget: 10, days: 2 })
assert.equal(home.simulated, true)
assert.ok(home.impressions > search.impressions)
assert.ok(home.reach < home.impressions)
assert.equal(home.assumptions.length, 4)

const elite = simulateCampaign({ objective: 'messages', placement: 'home', tier: 'elite', budget: 10, days: 2 })
assert.ok(elite.impressions > home.impressions)
assert.ok(elite.leads >= 0)

const hint = suggestSectionName('تويوتا كامري', ['عقارات', 'سيارات', 'وظائف'])
assert.equal(hint, 'سيارات')
assert.equal(suggestSectionName('شيء عام', ['سيارات']), null)

console.log('campaign simulation checks passed')
