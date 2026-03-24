import { fetchAffiliateEvents } from './fetchAffiliateEvents.js'
import { fetchPlayerEvents } from './fetchPlayerEvents.js'
import { formatEventMessage } from './formatEventMessage.js'
import { sendToDiscord } from './sendToDiscord.js'
import { isEventSent, markEventSent } from './sentEvents.js'

export async function handler(event = {}) {
    const seedMode = event.seed === true
    const subscribedAffiliates = (process.env.SUBSCRIBED_AFFILIATES || '').split(',').filter(Boolean)
    const subscribedPlayers = (process.env.SUBSCRIBED_PLAYERS || '').split(',').filter(Boolean)

    const [affiliateEvents, playerEvents] = await Promise.all([
        Promise.all(subscribedAffiliates.map(a => fetchAffiliateEvents(a))).then(r => r.flat()),
        Promise.all(subscribedPlayers.map(p => fetchPlayerEvents(p))).then(r => r.flat())
    ])

    // Deduplicate: affiliate events take priority, player events only add new IDs
    const seenIds = new Set(affiliateEvents.map(e => e.id))
    const uniquePlayerEvents = playerEvents.filter(e => !seenIds.has(e.id))
    const events = [...affiliateEvents, ...uniquePlayerEvents]

    // Filter to only unsent events
    const newEvents = []
    for (const ev of events) {
        if (!(await isEventSent(ev.id))) {
            newEvents.push(ev)
        }
    }

    console.log(`${events.length} total events, ${newEvents.length} new, seed mode: ${seedMode}`)

    if (seedMode) {
        // Seed mode: mark all current events as sent without notifying Discord
        for (const ev of newEvents) {
            await markEventSent(ev.id)
        }
        console.log(`Seeded ${newEvents.length} events into DynamoDB`)
        return { seeded: newEvents.length }
    }

    // Discord rate limits: 5 per 2s (400ms) and 30 per 60s (2000ms)
    const delay = newEvents.length > 30 ? 2000 : 400

    for (const ev of newEvents) {
        const success = await sendToDiscord(formatEventMessage(ev))
        if (success) {
            await markEventSent(ev.id)
        }
        await new Promise(r => setTimeout(r, delay))
    }

    return { sent: newEvents.length }
}
