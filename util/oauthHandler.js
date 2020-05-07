var ClientOAuth2 = require('client-oauth2');
var crypto = require('crypto');
var express = require('express');

const OAuthCredentials = require("../.private/oauthosu.json");

async function init() {
    await startOauth();
    async function startOauth() {
        const webServer = await startWebServer();
        const OAuthClient = await createOsuOAuthClient();
        requestUserConsent(OAuthClient);
        const AuthorizationToken = await waitForOsuCallback(webServer, OAuthClient);
       

        async function startWebServer() {
            return new Promise((resolve, reject) => {
                const port = 7788
                const app = express()
    
                const server = app.listen(port, () => {
                    console.log(`Listening on http://localhost:${port}`)
                    resolve({
                        app,
                        server
                    })
                })
            })
        }
        async function createOsuOAuthClient() {
            var osuAuthClient = new ClientOAuth2({
                clientId: OAuthCredentials.OAUTH_CLIENT_ID,
                clientSecret: OAuthCredentials.OAUTH_CLIENT_SECRET,
                accessTokenUri: OAuthCredentials.OAUTH_TOKEN_ACCESS,
                authorizationUri: OAuthCredentials.OAUTH_AUTHORIZE_URI,
                redirectUri: OAuthCredentials.OAUTH_REDIRECT_URI,
                scopes: ["identify", "users.read"],
            });
            return osuAuthClient;
        }

        function requestUserConsent(OAuthClient) {
            const consentUrl = OAuthClient.code.getUri();

            console.log(`Authenticate: ${consentUrl + crypto.randomBytes(20).toString('hex')}`)
        }

        async function waitForOsuCallback(webServer, OAuthClient) {
            return new Promise((resolve, reject) => {
                console.log('Waiting for authentication...')

                webServer.app.get('/oauth/callback', (req, res) => {
                    console.log("Requesting persistent authorization code...");
                    OAuthClient.code.getToken(req.originalUrl).then(function (user) {
                    const requestResponse = JSON.stringify(req.query);
                    console.log(`Response: ${requestResponse}`)
                    res.send('Authorized! Bearer: ' + user.accessToken);
                        resolve(user.accessToken)
                    })
                })
            })
        }
        
        async function tokenValidation(OAuthClient, temporaryAuthorizationToken, webServer) {
            ///TODOOOOO


        }


        async function stopWebServer(webServer) {
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }

    }
}

module.exports = { init }