import OAuthHandler from './util/oauthHandler.js';
import startApiServices from './api/api.js';
import express from 'express';
import https from 'https';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';
import fs from 'fs';
import mongoose from 'mongoose';
import { hostname } from 'os';

const config = JSON.parse(fs.readFileSync('./config.json','utf-8'));


// MongooSE events
mongoose.connection.once('open', () => {
    console.log('Connected to kdsrevamp');
})

mongoose.connection.on('error', console.error.bind(console, 'Database error:'));


async function startService() {
    startWebServer().then(async (expressServer) => {
        await OAuthHandler(expressServer);
        await startServerViews(expressServer);
        await startApiServices(expressServer);
        await startDatabase(config.MONGO_STRING);
    });

    async function startWebServer() {
        return new Promise((resolve, reject) => {
            let credentials = null;
            if (process.env.SSL) {
                var privateKey = fs.readFileSync(process.env.KEY).toString();
                var certificate = fs.readFileSync(process.env.CRT).toString();
                credentials = {key: privateKey, cert: certificate};
            }
            const port = (process.env.PORT) ? process.env.PORT : 7788;
            const app = express();
            const httpServer = process.env.SSL ? https.createServer(credentials, app) : app;


            const server = httpServer.listen(port, () => {
                app.use(cookieParser());
                app.set('view engine', 'ejs')
                app.use(expressLayouts);
                app.use(session({ secret: 'net0gay',
                  resave: false,
                  saveUninitialized: false,
                  cookie: {
                    expires: 28800000
                }}));
                app.use(bodyParser.urlencoded({ extended: true }));
                app.use(bodyParser.json());
                app.use((req, res, next) => {
                    if (req.cookies.credentials && !req.session.login) {
                        res.clearCookie('credentials');        
                    }
                    next();
                });

                console.log(`Webserver started at http://${process.env.HOSTNAME}:${port}`)
                resolve({
                    app,
                    server
                })
            })
        })
    }

    async function startDatabase(mongoString) {
        return new Promise((resolve, reject) => {
            mongoose.connect(mongoString,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
                resolve(mongoose.connection);
            }).catch((e)=> {
                console.error(mongoString);
                console.log(e)
            });
        });
    }

    async function startServerViews(webServer) {
        let port = (process.env.PORT) ? process.env.PORT : 7788;
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
        webServer.app.get('/store', (req, res) => {
            if (req.cookies.credentials && req.session.login) {
                    res.render("pages/store.ejs", {user: req.cookies.credentials, server: {hostname: process.env.HOSTNAME, port: port}});
                } else {
                    res.render("pages/indexNotLoggedIn.ejs");
                }
        });

        webServer.app.get('/admin', (req, res) => {
            if (req.cookies.credentials && req.session.login && req.session.admin) {
                    res.render("pages/admin.ejs", {user: req.cookies.credentials, server: {hostname: process.env.HOSTNAME, port: port}});
                } else {
                    res.render("pages/indexNotLoggedIn.ejs");
                }
        });

        webServer.app.get('/login', (req, res) => {
                res.redirect(301, '/authenticate');
        });
    }
}



startService();