import ClientOAuth2 from 'client-oauth2';
import crypto from 'crypto';
import getUserInfoByBearer from "./osuApiHandler.js";
import fs from 'fs';

const OAuthCredentials = JSON.parse(fs.readFileSync('./.private/oauthosu.json', 'utf-8'));


export default async function(expressServer) {
    await startOauth();
    async function startOauth() {
        //const OAuthCredentials = await loadCredentials();
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
                scopes: ["identify", "public"],
            });
            return osuAuthClient;
        }

        function generateOAuthRequestURI(OAuthClient) {
            const consentUrl = OAuthClient.code.getUri();
            let state = crypto.randomBytes(64).toString('hex');
            return {url: consentUrl + state, state};
        }

        async function startOAuthCallBack(webServer, OAuthClient) {
            webServer.app.get('/oauth/callback', (req, res) => {
                OAuthClient.code.getToken(req.originalUrl).then(function (user) {
                    getUserInfoByBearer(user.accessToken).then((json_users) => {
                        if (json_users.includes('{"avatar_url":')) {
                            let parsed = JSON.parse(json_users);
                            let userCredentials = {
                                isAuthenticated: true,
                                accessToken: user.accessToken,
                                username: parsed.username,
                                userId: parsed.user_id,
                                kudosu: parsed.kudosu,
                                avatarUrl: parsed.avatar_url,
                                refreshToken: user.refreshToken
                            };
                            res.cookie('credentials', userCredentials);
                            req.session.login = true;
                            req.session.token = user.accessToken;
                            res.redirect(301, '/index');
                        } else {
                            res.send("Internal server error! JSON: " + json_users);
                        }
                    })

                })
            })
            webServer.app.get('/authenticate', (req, res) => {
                let redirectURI = generateOAuthRequestURI(OAuthClient);
                req.session._state = redirectURI.state;
                res.redirect(307, redirectURI.url);
            })

            webServer.app.get("/user", (req, res) => {
                res.send(`{user: "nicks", badges: [{name: "QAH BEAST", img_url: "gay"}]}`)
            })
        }
    }
}
