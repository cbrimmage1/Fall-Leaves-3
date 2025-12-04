import express from 'express'
import ViteExpress from 'vite-express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToServer, getDb } from './connect.js'

dotenv.config({ path: './config.env' })

const app = express()
const port = 3000

app.use(express.static('public'))
app.use(express.json())
app.use(cors())

// Connect to Mongo before starting the server
connectToServer()
	.then(() => {
		ViteExpress.listen(app, port, () =>
			console.log(`Server is listening on localhost:${port}`)
		)
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err)
		process.exit(1)
	})

// get messages from server
app.get('/messages', async (req, res) => {
	try {
		const db = getDb()
		const messages = await db.collection('messages').find().toArray()
		res.json({ data: messages })
	} catch (err) {
		console.error('Failed to fetch messages', err)
		res.status(500).json({ error: 'Failed to fetch messages' })
	}
})

// receive messages + send back to client
