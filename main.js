import {loadEnvFile} from 'node:process'
import {fetchAffiliateEvents} from './fetchAffiliateEvents.js'
import {formatEventMessage} from './formatEventMessage.js'
import {sendToDiscord} from './sendToDiscord.js'
import {readFile, writeFile} from 'node:fs/promises'

loadEnvFile('.env')

const SENT_EVENTS_FILE = 'sentEvents.json'

async function loadSentEvents() {
    try {
        return JSON.parse(await readFile(SENT_EVENTS_FILE, 'utf-8'))
    } catch {
        return []
    }
}

async function saveSentEvents(sentIds) {
    await writeFile(SENT_EVENTS_FILE, JSON.stringify(sentIds, null, 2))
}

(async function(){
    const subscribedAffiliates = [
        'A6033006', // Chess Education Foundation
        'A9630067', // Washbear Chess Club
    ]

    const events = (await Promise.all(
        subscribedAffiliates.map(a => fetchAffiliateEvents(a))
    )).flat()

    const sentIds = await loadSentEvents()
    const newEvents = events.filter(e => !sentIds.includes(e.id))

    console.log(`${events.length} total events, ${newEvents.length} new`)

    // Discord rate limits: 5 per 2s (400ms) and 30 per 60s (2000ms)
    const delay = newEvents.length > 30 ? 2000 : 400

    for (const event of newEvents) {
        const success = await sendToDiscord(formatEventMessage(event))
        if (success) {
            sentIds.push(event.id)
            await saveSentEvents(sentIds)
        }
        await new Promise(r => setTimeout(r, delay))
    }

})()