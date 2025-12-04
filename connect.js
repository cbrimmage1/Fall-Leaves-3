// const { MongoClient, ServerApiVersion } = require('mongodb')
import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config({ path: './config.env' })

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGO_URI, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
})

let database

export async function connectToServer() {
	if (!database) {
		await client.connect()
		database = client.db('whispers')
	}
	return database
}

export function getDb() {
	if (!database)
		throw new Error(
			'Database not initialized. Call connectToServer() first.'
		)
	return database
}