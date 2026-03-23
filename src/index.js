import { fetchAffiliateEvents } from './fetchAffiliateEvents.js'
import { formatEventMessage } from './formatEventMessage.js'
import { sendToDiscord } from './sendToDiscord.js'
import { isEventSent, markEventSent } from './sentEvents.js'

export async function handler() {
    const subscribedAffiliates = (process.env.SUBSCRIBED_AFFILIATES || '').split(',').filter(Boolean)

    const events = (await Promise.all(
        subscribedAffiliates.map(a => fetchAffiliateEvents(a))
    )).flat()

    // Filter to only unsent events
    const newEvents = []
    for (const event of events) {
        if (!(await isEventSent(event.id))) {
            newEvents.push(event)
        }
    }

    console.log(`${events.length} total events, ${newEvents.length} new`)

    // Discord rate limits: 5 per 2s (400ms) and 30 per 60s (2000ms)
    const delay = newEvents.length > 30 ? 2000 : 400

    for (const event of newEvents) {
        const success = await sendToDiscord(formatEventMessage(event))
        if (success) {
            await markEventSent(event.id)
        }
        await new Promise(r => setTimeout(r, delay))
    }

    return { sent: newEvents.length }
}
