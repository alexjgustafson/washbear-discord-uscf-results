async function fetchPlayerName(playerId) {
    const response = await fetch(`https://ratings-api.uschess.org/api/v1/members/${playerId}`)
    const result = await response.json()
    return `${result.firstName} ${result.lastName}`
}

export async function fetchPlayerEvents(playerId) {
    const [name, sectionsResponse] = await Promise.all([
        fetchPlayerName(playerId),
        fetch(`https://ratings-api.uschess.org/api/v1/members/${playerId}/sections`)
    ])
    const result = await sectionsResponse.json()
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
            playerId,
            playerName: name
        })
    }
    return events
}
