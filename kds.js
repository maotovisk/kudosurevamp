var OAuthHandler = require("./util/oauthHandler");
var express = require('express');
var cookieParser = require('cookie-parser')


async function startService() {
    const expressServer = await startWebServer();
    await OAuthHandler.init(expressServer);
    await startServerViews(expressServer);

    async function startWebServer() {
        return new Promise((resolve, reject) => {
            const port = 7788
            const app = express()

            const server = app.listen(port, () => {
                app.use(cookieParser());
                console.log(`Listening on http://localhost:${port}`)
                resolve({
                    app,
                    server
                })
            })
        })
    }

    async function startServerViews(webServer) {
        webServer.app.get('/index', (req, res) => {
            if (req.cookies.access_token) {
                res.send("Logado com token!\nUsuario: " + req.cookies.userOsu)
            } else {
                res.send("Clique <a href='/login'> aqui</a> para logar!");
            }
        })

        webServer.app.get('/login', (req, res) => {
            if (req.cookies.access_token) {
                res.redirect(301, '/oauth');
            } else {
                res.redirect(301, '/oauth');
            }
        })
    }
}



startService();