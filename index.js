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
		console.log(messages)
		res.json({ data: messages })
	} catch (err) {
		console.error('Failed to fetch messages', err)
		res.status(500).json({ error: 'Failed to fetch messages' })
	}
})


// receive messages + send back to client
app.post('/messages', async (req, res) => {
	try {
		const db = getDb()
		const { message, position } = req.body; // object destructuring (saving 2 keys)

		const result = await db.collection('messages').insertOne({
			text: message,
			position: {
				x: position.x,
				y: position.y,
				z: position.z
			},
			createdAt: new Date()
		});

		res.status(201).json({
			id: result.insertedId,
			message: 'Created successfully'
		});

	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});
