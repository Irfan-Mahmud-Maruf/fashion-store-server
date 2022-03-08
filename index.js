const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId
const dotenv = require('dotenv')
const chalk = require('chalk')


// Initialization
dotenv.config();
const app = express() 
const port = process.env.PORT || 5000

const credentialsOptions = {
	"type": "service_account",
  "project_id": "fashion-store-a93df",
  "private_key_id": "655304ac574aa324afa838189d48a57598f11c8c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDGiElCJMjzaufO\nI4ukQmkVhjw+GNNkz+Tv6VhyEZFr2laBkN3ydDK6MujFGT/DtYpOkloDAFb3M/Xg\n68gzGPW31p+5NTzpE9Ce9Ve3hK99BJOLja0np2AxN97b6sszmgOs5/YpwR+JoGTH\nTaCUWkV+a3gACoeiGb7Fnu8Wqgh+4rCJ1GV0d5dJgIWNzCiFh4ym6pOnaGC9X+8A\nddZXgTvOmUPB2yzPyCCbT/PspHgGWw2/KF10mFUp5A59gBMwByh0q14TrgFbxRWU\nTSsZ5jDXprJhJA+Z0bCdASnYvMtlSV0xYtZrJDUu+CjRdXGfWh/U9ia9ttcL8oIa\n1adl1N4VAgMBAAECggEABo0Hsc2J7fJInNYybOSeGA46XagvDYQIn1v5RaZLwJ3P\nPe48TJxF8jvsz1gicQBEBIyyuKehtv15bwcIr5ryvLKxyYg2rtAvEZex4cXYjo0A\nm1m87XKJ64XW7jXEp7q8xU9QIZeURVPMD4GBu3NxGJdOOd4fFJu53kZ8yCgrKJie\natJZdab4SGVV0bY8ecGPaQqrCRyg0qGSq1CBJYnGdq+Ewek/XzgXIYaohD65/J5s\nnC4u0vov6oK6lnS52+GqzJMK6eWbC26F3SzE/ymmk6VKlosWmiLea2fOwpegC99A\niGikn/FcbJ4stdHdFF3l8kTw7i/Fn0iqwZeDGJD6oQKBgQDsH+N/oa3ffD9To+iP\nzOnABzKLKU7LNJsvYgjaPkz5/g6jU5CyYUnv+gWQKMSWyTaGe0mPtrLbFjlaxRcA\nLYlObj9WQKD+FhHbf8GaPDovEjauhnxb7T94LT3oBe+yq5hlKeQCRtXeKPwMSxYc\nLWuDoCrJSOgGWz54C6AK2F9sEQKBgQDXPlhUc2F9ohc0CfbAjrSCRKyZp4OaPSKW\n6LCGqLEXFWHpAcsvQ2gSA7/v/918GaOGTkDSseEb/9Ichnm6kObGhdG4wLMMvQVK\nGPf7p2+LeRjbzTKqHiljFKQpkSwU0a/5T/u3mgnA6wqTBoL6gDMdsh1SE5e7MoiW\nqn6DJoRlxQKBgQC2LZRU8OU5vJ8PZTMVX8ApjGQOwnwshBYHZNf3qoGxj7azhNHr\nDu0A3iJUq1+iBvSupYiH/SnZpzfxNIceeAOsI5tybMLJxzVX6SXyXe12S9MsrE5e\njpmdmypcTdg2PfaCduOYbhasJWryASy56ME++OCKFFoQLW3xKOb99xsIQQKBgFRD\nG+Ezqh68rci5fde0BgZZTBh685IWDMx3G2Qb9ffLbyEAisJd6QfkX+dciyBiCRoy\n2D2jVTTY2TBBlLXss+tTx95D0dRSyxdO3wWtboVzSsABfKwMUrdvBTUgl9kunW1E\nWo5txxO279TO38ehGGGvsLrI4MVv6vjQleZR1dLhAoGAA63GvdU6LNJ4QIyZUR73\ncdEgtuUKtvQ9/epz+/3NkyvyNOUxfZDek7i6reanmG5OIHWe7QsXmNIFCMSiOmwc\nBat86NA4BupGkmffzxsB72wT1RMjjlyWSUfScDSEgH99hv41Yy7jcbOfULG+K4gR\nRA3k660wiOnynBQgqSKhRko=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-jhe1u@fashion-store-a93df.iam.gserviceaccount.com",
  "client_id": "108974080347415844514",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jhe1u%40fashion-store-a93df.iam.gserviceaccount.com"
}
admin.initializeApp({	
	credential: admin.credential.cert(credentialsOptions)
});


// Middlewere 
app.use(cors())
app.use(express.json())


// MongoDB
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.m6gj0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
/**
 * Database		
 */
const database = async ({ db, table, method, data }) => {
	
	try {		
        await client.connect()
        // console.info('Connected successfully')

        const collection = client.db(db).collection(table)

        if (method === 'insertOne') {
			// Record Insert: Single
            const result = await collection.insertOne(data)
            // console.info('Inserted successfully')

            return result
        } else if (method === 'find') {
			// Record Find
			const queryLength = await Object.keys(data).length
			
			if (data.find) {
				if ( data.limit && !data.skip) {
					// Record with only limit()
					const result = await collection.find(data.find).limit(data.limit).toArray()
					
					return result
				}  else if (data.skip && !data.limit) {
					// Record with only skip()
					const result = await collection.find(data.find).skip(data.skip).toArray()
					
					return result
				} else if (data.skip && data.limit) { 
					// Record with skip() and limit().
					const result = await collection.find(data.find).skip(data.skip).limit(data.limit).toArray()
					
					return result
				} else {
					// Records
					const result = await collection.find(data.find).toArray()
					
					return result
				}
			} else {
				console.error('Somethig wrong')
				
				return
			}
			
            // console.info('Data retrived successfully.')
			
        } else if (method === 'updateOne') {
			/**
			 *Record Update
			 */
            const result = await collection.updateOne(data.current, data.replace)
            // console.info('Record updated successfully.')

            return result
        } else if (method === 'deleteMany') {
			// Record Remove
            const result = await collection.deleteMany(data)
            // console.info('Record removed successfully.')
			
            return result
        } else {
            console.warn('Provide a valid method')
        }        
    } catch {
        'Error: ', console.error
    } finally {
        client.close() 
        // console.info('Connection closed successfully')
    }
}


/**
 * Middleware: Request logger.
 */
let serialNo = 0  // Request serial.

const logger = (req, res, next) => {
	serialNo++  // Increasing serial number.
	
	console.log(chalk.green('[HIT]') + '  ' + chalk.yellowBright(new Date(Date.now()).toLocaleString()) + '  '  + chalk.yellowBright(req.ip) + '  '  + chalk.yellowBright(req.method) + '  '  + chalk.yellowBright(req.originalUrl) + '  '  + chalk.yellowBright(req.protocole))
	
	// Saving log in database.
	const options = {
		db: 'fashionstore',
		table: 'looger',
		method: 'insertOne',
		data: {
			serial: serialNo,
			date: new Date(),
			ip: req.ip,
			method: req.method,
			protocle: req.protocole,
			uri: req.originalUrl
		}
	}
	
	database(options).then(next()).catch(error=> {
		throw new Error('This is an error')
	})
}

app.use(logger)


// Middleware: Authorize 
const authorize = async (req, res, next) => {
	if (req?.headers?.authorization?.startsWith("Bearer ")) {
		const token = req.headers.authorization.split("Bearer ")[1]
		
		try {
			const decodedUser = await admin.auth().verifyIdToken(token)
			console.log('user', decodedUser)
			req.aguid = decodedUser.uid  // Authorized user id.
			next()
		} catch {
			res.status(500).json({
				status: 500,
				messge: 'Internal Server Error'
			})
		}
	} else {
		res.status(401).json({
			status: 401,
			messge: 'User not authorized.'
		})
	}
}

// Middleware: Error 
const errorMiddleware = (err, req, res, next) => {
	console.Log(err.message)
	
	res.status(500).json({
		status: 500,
		message: "There is a in server side."
	})
}

app.use(errorMiddleware)



/**
 *Route: /
 */
app.get('/', async (req, res) => {	
	res.send('Fashion Store server running.')
})


// Get Products
app.get('/products', async (req, res) => {
	let query;
	const {id, limit, skip} = req.query

	if (id) query = await { _id: ObjectId(id) }
	if (!id) query = await {}

	const options = await {
		db: 'fashionstore',
		table: 'products',
		method: 'find',
		data: {
			find: query,
			limit: parseInt(limit),
			skip: parseInt(skip)
		}
	}
	const data = await database(options)
	res.send(data)
})
/**
 * Insert Products
 */ 
app.put('/products', authorize ,async (req, res) => {
	const data = req.body
	
	const options = {
		db: 'fashionstore',
		table: 'products',
		method: 'insertOne',
		data: data
	}	
	const result = await database(options)
	res.send(result)
})


// Get Reviews
app.get('/reviews', async (req, res) => {
	const {limit, skip, ...filter} = req.query

	const options = {
		db: 'fashionstore',
		table: 'reviews',
		method: 'find',
		data: {
			find: {...filter},
			limit: parseInt(req.query.limit),
			skip: parseInt(req.query.skip)
		}
	}	
	const data = await database(options)
	res.send(data)
})
/**
 * Insert Reviews
 */ 
app.put('/reviews', authorize, async (req, res) => {
	const data = req.body
	console.log(data)
	
	const options = {
		db: 'fashionstore',
		table: 'reviews',
		method: 'insertOne',
		data: data
	}	
	const result = await database(options)
	res.send(result)
})



// Get Orders
app.get('/orders', authorize, async (req, res) => {
	const {limit, skip, ...filter} = req.query

	const options = {
		db: 'fashionstore',
		table: 'orders',
		method: 'find',
		data: {
			find: {...filter},
			limit: parseInt(limit),
			skip: parseInt(skip)
		}
	}

	const data = await database(options)
	res.status(200).send(data)
})
// Post Orders
app.post('/orders', authorize, async (req, res) => {
	const {limit, skip, ...filter} = req.query

	const options = {
		db: 'fashionstore',
		table: 'orders',
		method: 'find',
		data: {
			find: {...filter},
			limit: parseInt(limit),
			skip: parseInt(skip)
		}
	}

	const data = await database(options)
	res.status(200).send(data)
})

/**
 * Insert Orders
 */ 
app.put('/orders', authorize , async (req, res) => {
	const data = req.body
	
	const options = {
		db: 'fashionstore',
		table: 'orders',
		method: 'insertOne',
		data: data
	}	
	const result = await database(options)
	res.send(result)
})



// Get Payments
app.get('/payments', authorize, async (req, res) => {
	const {limit, skip, ...filter} = req.query
	
	const options = {
		db: 'fashionstore',
		table: 'payments',
		method: 'find',
		data: {
			find: {...filter},
			limit: parseInt(limit),
			skip: parseInt(skip)
		}
	}
	const data = await database(options)
	res.status(200).send(data)
})

/**
 * Insert Payments
 */ 
app.put('/payments', authorize, async (req, res) => {
	const data = req.body
	
	const options = {
		db: 'fashionstore',
		table: 'payments',
		method: 'insertOne',
		data: data
	}	
	const result = await database(options)
	res.send(result)
})


// Get Users
app.get('/users', authorize, async (req, res) => {
	const {limit, skip, ...filter} = req.query

	const options = {
		db: 'fashionstore',
		table: 'users',
		method: 'find',
		data: {
			find: {...filter},
			limit: parseInt(limit),
			skip: parseInt(skip)
		}
	}
	
	const data = await database(options)
	res.status(200).send(data)
})

/**
 * Insert Users
 */ 
app.put('/users', authorize , async (req, res) => {
	const data = req.body
	
	const options = {
		db: 'fashionstore',
		table: 'users',
		method: 'insertOne',
		data: data
	}	
	const result = await database(options)
	res.send(result)
})


// Server 
app.listen(port, () => {
	console.log(chalk.cyanBright(`API server started at ${port}`))
	console.log(chalk.cyanBright(`http://localhost:${port}`))
})




