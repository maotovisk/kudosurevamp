var OAuthHandler = require("./util/oauthHandler");
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


async function startService() {
    const expressServer = await startWebServer();
    await OAuthHandler.init(expressServer);
    await startServerViews(expressServer);

    async function startWebServer() {
        return new Promise((resolve, reject) => {
            const port = 7788;
            const app = express();

            const server = app.listen(port, () => {
                app.use(cookieParser());
                app.use(session({  secret: 'net0gay',
                  resave: false,
                  saveUninitialized: false,
                  cookie: {
                    expires: 600000
                }}));
                app.use(bodyParser.urlencoded({ extended: true }));
                app.use((req, res, next) => {
                    if (req.cookies.credentials && !req.session.login) {
                        res.clearCookie('credentials');        
                    }
                    next();
                });

                console.log(`Listening on http://localhost:${port}`)
                resolve({
                    app,
                    server
                })
            })
        })
    }

    async function startServerViews(webServer) {
        var sessionChecker = (req, res, next) => {
            if (req.cookies.credentials && req.session.login) {
                res.redirect('/debug');
            } else {
                next();
            }    
        };

        webServer.app.use(express.static('public'));

        webServer.app.get('/', sessionChecker, (req, res) => {
            res.redirect('/index');
        });

        webServer.app.get('/index', (req, res) => {
            if (req.cookies.credentials && req.session.login) {
                res.send("Logado com token!\nUsuario: " + req.cookies.credentials.username + "\nClique <a href='/debug'> aqui</a> para mais detalhes!")
            } else {
                res.send("Clique <a href='/login'> aqui</a> para logar!");
            }
        })

        webServer.app.get('/login', (req, res) => {
                res.redirect(301, '/oauth');
        })

        webServer.app.get('/debug', (req, res) => {
            res.send(`
            Session Details: isLoggedIn: ${req.session.login}\n
            Cookie Detail: ${JSON.stringify(req.cookies.credentials)}`)

        })


    }
}



startService();