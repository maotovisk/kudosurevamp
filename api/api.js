import User from '../model/user.js';
import Item from '../model/item.js';
import ItemType from '../model/itemtypes.js';
import Role from '../model/roles.js';
import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose'; 

const apiRouter = express.Router();

async function startRouters() {
    
    //DEFAULT RESPONSE
    apiRouter.route('/').get((req,res) => {
        res.json({"error": "please specify the endpoint"});
    });

    // GET USER ENDPOINT
    apiRouter.route('/user/:osu_id').get(async (req, res) => {
        await User.findOne({"osu_id": req.params.osu_id}, async (err, user) => {
            if (err || user == undefined) 
                res.json({"error": "json not found"});
            else {
                let itemsUser = user.items.map((item) => (`${item.item_id}`));
                await Item.find().where('_id').in(itemsUser).exec(async (error, items) => {
                    if (error)
                        console.log(error);
                    let itemList = items.map((item)=> ({
                        "title": item.title,
                        "image_url": item.image_url
                    }));
                    let userResponse = {
                        "username": user.name,
                        "id": user.osu_id,
                        "items": itemList,
                        "kudosu": user.kudosu
                    }
                    res.json(userResponse);  
                });
            }
        });
    });

    // CREATE USER ENDPOINT
    apiRouter.route('/user').post((req, res) => {
        req.accepts('application/json');
        if (req.session.login && req.session.admin) {
            let userJson = req.json;
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
        if (req.session.login && req.session.admin) {
            let jsonItem = req.body;
            Item.create({
                title: jsonItem.title,
                image_url: jsonItem.image_url,
                price: jsonItem.price,
                is_consumable: jsonItem.is_consumable,
                user_role: jsonItem.user_role
            })
            res.json({"message": "OK"});
        } else {
            res.json({"error": "not authenticated"})
        }
    });

    // BUY ITEM BY ID
    apiRouter.route('/item/buy/:item_id').post(async (req, res) => {
        if (req.session.login && req.session.token) {
            User.findOne({"token": req.session.token}, async (err, user)=> {
                if (err) 
                    return res.json({"error": "user not found"});
                Item.findById(req.params.item_id, async (error, item) => {
                    if (error) 
                        return res.json({"error": "item not found"});
                    let hasItem = !(user.items.find((i)=> {item.item_id = i}) == undefined);
                    console.log(hasItem)
                    let canBuy = ((user.kudosu.available >= item.price) && !hasItem/* && user.access.role_id >= item.role*/) ? true : false;
                    let canUnlock = ((user.kudosu.total >= item.price) && !hasItem/* && user.access.role_id >= item.role*/) ? true : false;
                    if (canUnlock || canBuy) {
                        let isConsummable = item.is_consumable;
                        let remainingKudosu = (user.kudosu.available - item.price);
                        let response = await User.updateOne({"_id": user.id}, { "kudosu": {"available": (isConsummable ? (remainingKudosu) : user.kudosu.available), "total": user.kudosu.total},  $push: {"items": {"item_id": item._id}}});
                        res.json(response.nModified);
                    } else {
                        res.json({"error": "coudn't complete the action"})
                    }

                })
            })
        } else {
            res.json({"error": "not authenticated"})
        }
    });

    // GET ITEM 
    apiRouter.route('/item/:item_id').get(async (req, res) => {
        Item.findById(req.params.item_id, async (err, item) => {
            if (err || item === undefined) 
                res.json({"error": "item not found"});
            else {
                res.json(item); 
            }          
        });
    });

    // GET ALL ITEMS
    apiRouter.route('/item').get(async (req, res) => {
        await Item.find({ }, async (err, items) => {
            if (err || items == undefined) 
                res.json({"error": "there are no items"});
            else {
                res.json(items); 
            }          
        });
    });



}

async function startApiServices(webServer) {
    await startRouters();
    webServer.app.use('/api', apiRouter);
}

export default startApiServices;