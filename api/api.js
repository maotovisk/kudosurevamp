import User from '../model/user.js';
import Item from '../model/item.js';
import ItemType from '../model/itemtypes.js';
import Role from '../model/roles.js';
import express from 'express';
import session from 'express-session';

async function startApiServices(webServer) {
    
    webServer.app.get('/api', (req,res) => {
        res.send('{"error": "please specify the endpoint"}');
    });

    // GET USER ENDPOINT
    webServer.app.get('/api/user/:osu_id', (req, res) => {
        User.findOne({"osu_id": req.params.osu_id}, (err, user) => {
            if (err || user == undefined) 
                res.send(`{"error": "user not found"}`);
            else {
                let userResponse = {
                    "username": user.name,
                    "id": user.osu_id,
                    "items": user.items
                }
                res.json(userResponse);  
            }          
        });
    });

    // CREATE USER ENDPOINT
    webServer.app.post('/api/user', (req, res) => {
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
    webServer.app.post('/api/item', (req, res) => {
        req.accepts('application/json');
        if (req.session.login || req.session.admin) {
            let jsonItem = req.body;
            console.log(jsonItem);
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

export default startApiServices;