import User from '../model/user.js';
import Item from '../model/item.js';
import ItemType from '../model/itemtypes.js';
import Role from '../model/roles.js';
import express from 'express';
import session from 'express-session';

const apiRouter = express.Router();

async function startRouters() {
    
    apiRouter.route('/').get((req,res) => {
        res.send('{"error": "please specify the endpoint"}');
    });

    // GET USER ENDPOINT
    apiRouter.route('/user/:osu_id').get( (req, res) => {
        User.findOne({"osu_id": req.params.osu_id}, (err, user) => {
            if (err || user == undefined) 
                res.send(`{"error": "user not found"}`);
            else {
                let userResponse = {
                    "username": user.name,
                    "id": user.osu_id,
                    "items": user.items,
                    "kudosu": user.kudosu
                }
                res.json(userResponse);  
            }          
        });
    });

    // CREATE USER ENDPOINT
    apiRouter.route('/user').post((req, res) => {
        req.accepts('application/json');
        if (req.session.login || req.session.admin) {
            let userJson = req.json
            User.create({
                name : userJson.userName,
                osu_id: userJson.id,
                token: req.session.token,
                kudosu: {
                    total: userJson.kudosuTotal,
                    available: userJson.kudosuAvailable
                },
                items: [],
                roles: {
                    role_id: userJson.roles.role_id,
                    admin: userJson.roles.admin
                }
            });
        } else {
            res.json({"error": "not authenticated"})
        }
    });

    //CREATE ITEM ENDPOINT 
    apiRouter.route('/item').post( (req, res) => {
        if (req.session.login || req.session.admin) {
            let jsonItem = req.body;
            console.log(req);
            Item.create({
                title: jsonItem.title,
                image_url: jsonItem.image_url,
                price: jsonItem.price,
                userRole: jsonItem.userRole
            })
            res.json({"message": "OK"});
        } else {
            res.json({"error": "not authenticated"})
        }
    });
}

async function startApiServices(webServer) {
    await startRouters();
    webServer.app.use('/api', apiRouter);
}

export default startApiServices;