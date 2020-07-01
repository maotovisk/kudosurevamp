import OAuthHandler from './util/oauthHandler.js';
import startApiServices from './api/api.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import expressLayouts from 'express-ejs-layouts';
import fs from 'fs';
import mongoose from 'mongoose';

const config = JSON.parse(fs.readFileSync('./config.json','utf-8'));


// MongooSE events
mongoose.connection.once('open', () => {
    console.log('Connected to kdsrevamp');
})

mongoose.connection.on('error', console.error.bind(console, 'Database error:'));


async function startService() {
    const expressServer = await startWebServer();
    await OAuthHandler(expressServer);
    await startServerViews(expressServer);
    await startApiServices(expressServer);
    await startDatabase(config.MONGO_STRING);


    async function startWebServer() {
        return new Promise((resolve, reject) => {
            const port = 7788;
            const app = express();

            const server = app.listen(port, () => {
                app.use(cookieParser());
                app.set('view engine', 'ejs')
                app.use(expressLayouts);
                app.use(session({ secret: 'net0gay',
                  resave: false,
                  saveUninitialized: false,
                  cookie: {
                    expires: 600000
                }}));
                app.use(express.json());
                app.use(bodyParser.urlencoded({ extended: true }));
                app.use((req, res, next) => {
                    if (req.cookies.credentials && !req.session.login) {
                        res.clearCookie('credentials');        
                    }
                    next();
                });

                console.log(`Webserver started at http://localhost:${port}`)
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