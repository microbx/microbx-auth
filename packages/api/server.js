const express = require('express')
const app = express()
const jwt = require('express-jwt')
const jwtAuthz = require('express-jwt-authz')
const jwks = require('jwks-rsa')
const cors = require('cors')
const morgan = require('morgan')

require('dotenv').config()

app.use(cors())

app.use(
    morgan(
        'API Request (port 3001): :method :url :status :response-time ms - :res[content-length]'
    )
)

var checkJwt = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:
            'https://cbdowell.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://api.microbz.com',
    issuer: 'https://cbdowell.auth0.com/',
    algorithms: ['RS256']
})

const checkScopes = jwtAuthz(['read:messages'])

app.get('/api/public', function(req, res) {
    res.json({
        message:
            "Hello from a public endpoint! You don't need to be authenticated to see this."
    })
})

app.get('/api/private', checkJwt, checkScopes, function(
    req,
    res
) {
    const { user } = req
    console.log('user: ', user)
    res.json({
        message:
            'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
    })
})

app.listen(3001)

console.log(
    'Server listening on http://localhost:3001. The React app will be built and served at http://localhost:3000.'
)
