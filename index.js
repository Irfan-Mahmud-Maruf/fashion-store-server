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
	"project_id": process.env.PROJECT_ID,
	"private_key_id": process.env.PRIVATE_KEY_ID,
	"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCy60qyspZeOcen\nhYXHnzPQt4vNr47jfep93/MhVngv69S2E4OiEHj9Me207kkFyVXygaJUu82HS/Gb\nKOPmUd4AXuKlrFlfM463VjIeLIrcQxTbLc+72Bh4tUGtk35G79uaLoO3xvpQzyzw\ndCxF6ZFwriuNs/XAegZPplgM729mh1UP/W6Lw36xaeY5meZbdy5dhso/8gcE+Ytx\nVUZriLna4dnYMJn0qpgW9gZ8PIfUYCR1Men+1hyOuRBGRiykiLWCRX+8v6+LEnNB\n13pnApPOGRXc2pa3poL9Eofd8665WPeu4I0ZdZg83aci1Ntd+KSIPztuAQ2Pbis0\nhket4ntfAgMBAAECggEABSm0bmVfKgKfHJD88doAysVX/f6bwmDJOgpcDWzLWVjx\nqGms4wUvPSqchtKhdM638aBgBDzKiu7uXryx5tz2e+Flop9htfnam5KbwDKU2YEk\n5u0XNcgpJcKOYA3hO9I5ygl6uLMtfWbmNDjzsYjEwVo3k4Zdmn/9NzRSe0Y3yQOS\n0NpJt6+jtnjirFO/3l6eaekbBatqHTBemqTQzibxeZDzkW8pjN63XrFOHgN0726F\nZR6zfFbhICDqyPeB91VZeiXR0+GSh9RO3InAbyarNV5uCPeQjxcNvKY5wOS0CqhF\nH5AQ5PqWLE080KqC+xdqzMxECxD541LQNva/qQG64QKBgQD2/Zx3X6BnCUGrbadK\nTUQ6IJc9DubVHKUSmlhgWtWYN/ikDtvKfJ4BgMVSaIeuWVVNR1HfGWrIgRVsr7mW\n/D2+aFfPA3GpJyqSs+buK0iofIVp0fvsQJg94EI/aUA8ZxIgWu6+PImdLTHW2+jp\ngEaIUsLvQ9TOe1gnbZ5qHkbpCQKBgQC5cgf4kXqy46086hjLpnD2aNwqEyBXdUd3\nT22FoTDNo6pcpJEq0YydICySSd9hnigpVozEcP38Hv/MLOwux6y+7wPuw0mFfCiR\nHUTspdJGg0lWzbzZch5w23SQqw6YvISFbwMI2jUUANxHYAlZG9VvwoK4UUC7WCOd\nMsKc42LjJwKBgQC2kXJlvra3Ut1K1SvyPTjwaoTAalJwNtNB8/rdhmcaNE1DH4SR\noRm+bKvupTudwYTPMaev7H7FJL1scFwT4fHV3BUD/Ty31y6d8AMEC9SSTjDjroaz\n9G9UVX9Clg8YVuvMJMsSrXbfSrfrZPQ+HUaFn/9dktsroXrg8iNFt4mc2QKBgDPQ\n8Pk7bRVfGKDUqGj+8MFpO1tmTLsjQfzMbMXR7FkJSijossdMFgYxX0Lg8VHNZ1tl\nm5+oEs/HuaHLS5Mmp9YR4v9sAbcSoiMqEoAtNTwOowdmJUZ85JSUPVXO9h0nT8AY\n7LgkgIA+XU50Pyhu5ox7xRrLWVL/pbPe4xIDVzYxAoGAalvONL4P+dMPfaHN7ppf\nvfKnc4nDE+UxMVHmC4rNe3J2sTu0MThLEQczn49OpPrtpMy1jfK5uMRVXN0poXcP\noC56nPnZpvUmH3H6+jjXIEt0C11IAefgRY65xCZYMMPsGZvOpZ/KHvNH7yPqjf/M\nvkzK6RBFLK/TFT34HTrU148=\n-----END PRIVATE KEY-----\n",
	"client_email": process.env.CLIENT_EMAIL,
	"client_id": process.env.CLIENT_ID,
	"auth_uri": process.env.AUTH_URI,
	"token_uri": process.env.TOKEN_URI,
	"auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
	"client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
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


// Routes
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




