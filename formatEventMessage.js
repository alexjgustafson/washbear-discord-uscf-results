export function formatEventMessage(event){
    // EXAMPLE ITEM DATA AS OF Mar 23, 2026
    // {
    //     id: '202509140232',
    //     name: 'TRASH PANDA THROWDOWN #1',
    //     startDate: '2025-09-14',
    //     endDate: '2025-09-14',
    //     sectionCount: 1,
    //     playerCount: 6,
    //     stateCode: 'KY',
    //     city: 'LOUISVILLE',
    //     affiliate: { id: 'A9630067', name: 'WASHBEAR CHESS CLUB', status: 'Active' }
    //   }
    return `${event.endDate} Event Result: [${event.name}](https://ratings.uschess.org/event/${event.id}) from affiliate [${event.affiliate.name}](https://ratings.uschess.org/affiliate/${event.affiliate.id})`
}