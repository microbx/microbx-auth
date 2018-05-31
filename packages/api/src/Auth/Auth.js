import auth0 from 'auth0-js'
import history from '../history'
import auth0 from './auth-variables'

export default class Auth {
    auth0 = new auth0.WebAuth({
        domain: auth0.domain,
        clientID: auth0.clientId,
        redirectUri: 'http://localhost:3000/callback',
        audience: auth0.apiUrl,
        responseType: 'token id_token',
        scope:
            'openid profile email read:messages write:messages'
    })

    userProfile

    constructor() {
        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.handleAuthentication = this.handleAuthentication.bind(
            this
        )
        this.isAuthenticated = this.isAuthenticated.bind(
            this
        )
        this.getAccessToken = this.getAccessToken.bind(this)
        this.getProfile = this.getProfile.bind(this)
    }

    login() {
        this.auth0.authorize()
    }

    handleAuthentication() {
        this.auth0.parseHash((err, authResult) => {
            if (
                authResult &&
                authResult.accessToken &&
                authResult.idToken
            ) {
                this.setSession(authResult)
                history.replace('/home')
            } else if (err) {
                history.replace('/home')
                console.log(err)
                alert(
                    `Error: ${
                        err.error
                    }. Check the console for further details.`
                )
            }
        })
    }

    setSession(authResult) {
        let expiresAt = JSON.stringify(
            authResult.expiresIn * 1000 +
                new Date().getTime()
        )

        localStorage.setItem(
            'access_token',
            authResult.accessToken
        )

        localStorage.setItem('id_token', authResult.idToken)
        localStorage.setItem('expires_at', expiresAt)

        history.replace('/home')
    }

    getAccessToken() {
        const accessToken = localStorage.getItem(
            'access_token'
        )
        if (!accessToken) {
            throw new Error('No access token found')
        }
        return accessToken
    }

    getProfile(cb) {
        let accessToken = this.getAccessToken()
        this.auth0.client.userInfo(
            accessToken,
            (err, profile) => {
                if (profile) {
                    this.userProfile = profile
                }
                cb(err, profile)
            }
        )
    }

    logout() {
        localStorage.removeItem('access_token')
        localStorage.removeItem('id_token')
        localStorage.removeItem('expires_at')

        this.userProfile = null

        history.replace('/home')
    }

    isAuthenticated() {
        let expiresAt = JSON.parse(
            localStorage.getItem('expires_at')
        )

        return new Date().getTime() < expiresAt
    }
}
