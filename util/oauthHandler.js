var ClientOAuth2 = require('client-oauth2');
var crypto = require('crypto');
var osuApi = require("./osuApiHandler")

const OAuthCredentials = require("../.private/oauthosu.json");

async function init(expressServer) {
    await startOauth();
    async function startOauth() {
        const webServer = expressServer;
        const OAuthClient = await createOsuOAuthClient();
        await startOAuthCallBack(webServer, OAuthClient);

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

        function generateOAuthRequestURI(OAuthClient) {
            const consentUrl = OAuthClient.code.getUri();
            let state = crypto.randomBytes(64).toString('hex');
            return consentUrl + state;
        }


        async function startOAuthCallBack(webServer, OAuthClient) {
            webServer.app.get('/oauth/callback', (req, res) => {
                OAuthClient.code.getToken(req.originalUrl).then(function (user) {
                    osuApi.getUserInfoByBearer(user.accessToken).then((json_users) => {
                        if (json_users.includes('{"avatar_url":')) {
                            let parsed = JSON.parse(json_users);
                            console.log(parsed.username);
                            res.cookie('access_token', user.accessToken).cookie("userOsu", parsed.username);
                            res.redirect(301, '/index');
                        } else {
                            res.send("Internal server error! JSON: " + json_users);
                        }
                    })

                })
            })
            webServer.app.get('/oauth', (req, res) => {
                let redirectURI = generateOAuthRequestURI(OAuthClient);
                res.redirect(301, redirectURI);
            })
        }
    }
}

module.exports = { init }