export function formatEventMessage(event){
    return `${event.endDate} Event Result: [${event.name}](https://ratings.uschess.org/event/${event.id}) from affiliate [${event.affiliate.name}](https://ratings.uschess.org/affiliate/${event.affiliate.id})`
}
