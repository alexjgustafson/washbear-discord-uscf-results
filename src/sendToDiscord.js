export async function sendToDiscord(message){
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
    if (!DISCORD_WEBHOOK_URL) {
        console.error('DISCORD_WEBHOOK_URL environment variable is not set.')
        return false
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 
            'Content-Disposition': 'form-data',
            'Content-Type': 'application/json',
            'name': 'payload_json'
        }, 
        body: JSON.stringify({
            "content": message
        }) 
    })

    if (response.ok) {
        console.log('Message sent successfully.')
        return true
    }

    console.error('Problem posting message to Discord.')
    const err = await response.json()
    console.error(err)
    return false
}
