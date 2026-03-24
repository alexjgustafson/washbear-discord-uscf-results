export function formatEventMessage(event) {
    const eventLink = `[${event.name}](https://ratings.uschess.org/event/${event.id})`
    if (event.affiliate) {
        const affiliateLink = `[${event.affiliate.name}](https://ratings.uschess.org/affiliate/${event.affiliate.id})`
        return `${event.endDate} Event Result: ${eventLink} from affiliate ${affiliateLink}`
    }
    return `${event.endDate} Event Result: ${eventLink}`
}
