var OAuthHandler = require("./util/oauthHandler");

async function startService() {
    await OAuthHandler.init();
}

startService();