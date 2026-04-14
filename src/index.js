import { fetchAffiliateEvents } from './fetchAffiliateEvents.js'
import { fetchPlayerEvents } from './fetchPlayerEvents.js'
import { formatEventMessage } from './formatEventMessage.js'
import { sendToDiscord } from './sendToDiscord.js'
import { isEventSent, markEventSent } from './sentEvents.js'

function sentKey(ev) {
    return ev.source === 'player' ? `player-${ev.playerId}-${ev.id}` : ev.id
}

export async function handler(event = {}) {
    const seedMode = event.seed === true
    const subscribedAffiliates = (process.env.SUBSCRIBED_AFFILIATES || '').split(',').filter(Boolean)
    const subscribedPlayers = (process.env.SUBSCRIBED_PLAYERS || '').split(',').filter(Boolean)

    const [affiliateEvents, playerEvents] = await Promise.all([
        Promise.all(subscribedAffiliates.map(a => fetchAffiliateEvents(a))).then(r => r.flat()),
        Promise.all(subscribedPlayers.map(p => fetchPlayerEvents(p))).then(r => r.flat())
    ])

    // Skip player events for events already covered by affiliate subscriptions
    const affiliateEventIds = new Set(affiliateEvents.map(e => e.id))
    const uniquePlayerEvents = playerEvents.filter(e => !affiliateEventIds.has(e.id))
    const events = [...affiliateEvents, ...uniquePlayerEvents]

    // Filter to only unsent events
    const newEvents = []
    for (const ev of events) {
        const key = sentKey(ev)
        if (await isEventSent(key)) continue
        // Player events may have already been posted via an affiliate subscription
        if (ev.source === 'player' && await isEventSent(ev.id)) continue
        newEvents.push(ev)
    }

    console.log(`${events.length} total events, ${newEvents.length} new, seed mode: ${seedMode}`)

    if (seedMode) {
        for (const ev of newEvents) {
            await markEventSent(sentKey(ev))
        }
        console.log(`Seeded ${newEvents.length} events into DynamoDB`)
        return { seeded: newEvents.length }
    }

    // Discord rate limits: 5 per 2s (400ms) and 30 per 60s (2000ms)
    const delay = newEvents.length > 30 ? 2000 : 400

    for (const ev of newEvents) {
        const success = await sendToDiscord(formatEventMessage(ev))
        if (success) {
            await markEventSent(sentKey(ev))
        }
        await new Promise(r => setTimeout(r, delay))
    }

    return { sent: newEvents.length }
}
