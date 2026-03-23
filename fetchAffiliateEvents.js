export async function fetchAffiliateEvents(affiliateId){
    const USCF_AFFILIATE_EVENTS_ENDPOINT = `https://ratings-api.uschess.org/api/v1/affiliates/${affiliateId}/events`
    const response = await fetch(USCF_AFFILIATE_EVENTS_ENDPOINT)
    const result = await response.json()
    return result.items ?? []
}