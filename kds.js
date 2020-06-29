import OAuthHandler from './util/oauthHandler.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';


async function startService() {
    const expressServer = await startWebServer();
    await OAuthHandler(expressServer);
    await startServerViews(expressServer);
    async function startWebServer() {
        return new Promise((resolve, reject) => {
            const port = 7788;
            const app = express();

            const server = app.listen(port, () => {
                app.use(cookieParser());
                app.set('view engine', 'ejs')
                app.use(expressLayouts);
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
                next();
            } else {
                res.redirect('/debug');
            }    
        };

        webServer.app.use(express.static('public'));

        webServer.app.get('/', (req, res) => {
            res.redirect(301, '/index');
        });

        webServer.app.get('/index', (req, res) => {
            if (req.cookies.credentials && req.session.login) {
                res.render("pages/index.ejs", {user: req.cookies.credentials});
                } else {
                res.render("pages/indexNotLoggedIn.ejs");
            }
        })

        webServer.app.get('/login', (req, res) => {
                res.redirect(301, '/authenticate');
        })
    }
}



startService();