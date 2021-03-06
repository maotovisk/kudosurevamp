import ClientOAuth2 from 'client-oauth2';
import crypto from 'crypto';
import User from '../model/user.js';
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
            webServer.app.get('/oauth/callback', async (req, res) => {
                OAuthClient.code.getToken(req.originalUrl).then(async (user) => {
                    getUserInfoByBearer(user.accessToken).then(async (json_users) => {
                        let parsed = JSON.parse(json_users);
                        if (json_users.includes('{"avatar_url":')) {
                            await User.findOne({"osu_id": parsed.id}, async (err, userDB)=> {
                                if (userDB == undefined)
                                    userDB = await User.create({
                                        name: parsed.username,
                                        osu_id: parsed.id,
                                        token: user.accessToken,
                                        session_id: req.session.id,
                                        kudosu:parsed.kudosu,
                                        qah_checks: 0, //for now
                                        items: [],
                                        currency: {
                                            spent: 0,
                                            bonus: 0
                                        },
                                        access: {
                                            role_id: 0,
                                            admin: (parsed.id == 3914271 || parsed.id == 2857314 || parsed.id == 2652951 || parsed.id == 9155377|| parsed.is_admin)
                                        }
                                    });
                                else {
                                    userDB.osu_id = parsed.id
                                    userDB.name = parsed.username, 
                                    userDB.session_id = req.session.id,
                                    userDB.kudosu = parsed.kudosu,
                                    userDB.qah_checks = 1, //for now
                                    userDB.token = user.accessToken
                                    userDB.save();
                                }
                                let userCredentials = {
                                    isAuthenticated: true,
                                    accessToken: user.accessToken,
                                    username: parsed.username,
                                    userId: parsed.id,
                                    kudosu: userDB.kudosu,
                                    currency: userDB.currency,
                                    avatarUrl: parsed.avatar_url,
                                    refreshToken: user.refreshToken,
                                    isAdmin: userDB.access.admin
                                };
                                res.cookie('credentials', userCredentials, {"maxAge": 28800000});
                                req.session.cookie.maxAge = 28800000;
                                req.session.login = true;
                                req.session.admin = userCredentials.isAdmin;
                                req.session.token = user.accessToken;
                                res.redirect(301, '/index');
                            });
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
