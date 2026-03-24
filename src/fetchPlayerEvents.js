export async function fetchPlayerEvents(playerId) {
    const USCF_PLAYER_SECTIONS_ENDPOINT = `https://ratings-api.uschess.org/api/v1/members/${playerId}/sections`
    const response = await fetch(USCF_PLAYER_SECTIONS_ENDPOINT)
    const result = await response.json()
    const items = result.items ?? []

    // Deduplicate by event ID since a player could have multiple sections in the same event
    const seen = new Set()
    const events = []
    for (const item of items) {
        const eventId = item.event?.id
        if (!eventId || seen.has(eventId)) continue
        seen.add(eventId)
        events.push({
            id: eventId,
            name: item.event.name,
            startDate: item.event.startDate,
            endDate: item.endDate ?? item.event.endDate,
            stateCode: item.event.stateCode,
            source: 'player',
            playerId
        })
    }
    return events
}
