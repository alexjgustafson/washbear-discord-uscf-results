import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)
const TABLE_NAME = process.env.SENT_EVENTS_TABLE

export async function isEventSent(eventId) {
    const result = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { eventId }
    }))
    return !!result.Item
}

export async function markEventSent(eventId) {
    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { eventId, sentAt: new Date().toISOString() }
    }))
}
