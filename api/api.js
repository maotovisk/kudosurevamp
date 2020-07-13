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
                        "kudosu": user.kudosu,
                        "currency": user.currency
                    }
                    res.json(userResponse);  
                });
            }
        });
    });

    // CREATE USER ENDPOINT
    /*apiRouter.route('/user').post((req, res) => {
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
    });*/

    //CREATE ITEM ENDPOINT 
    apiRouter.route('/item').post( (req, res) => {
        if (req.session.login && req.session.admin) {
            let jsonItem = req.body;
            console.log(req.body)
            if (req.body.title == undefined || req.body.image_url == undefined || req.body.price == undefined)
                return res.json({"error": "error parsing body"})
            Item.create({
                title: jsonItem.title,
                image_url: jsonItem.image_url,
                price: jsonItem.price,
                is_consumable: jsonItem.is_consumable,
                user_role: jsonItem.user_role
            }).then((document) => {
                res.json({"message": "OK"});

            }).catch((err) => {
                res.json({"error": "something went wrong"})
            })
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
                    let canBuy = (((user.kudosu.total + user.currency.bonus - user.currency.spent) >= item.price) && !hasItem/* && user.access.role_id >= item.role*/) ? true : false;
                    let isConsummable = item.is_consumable == undefined ? false: item.is_consumable;

                    let canUnlock = ((user.kudosu.total + user.currency.bonus >= item.price) && !hasItem/* && user.access.role_id >= item.role*/) ? true : false;
                    if (canUnlock && isConsummable == false) {
                        let response = await User.updateOne({"_id": user.id}, { $push: {"items": {"item_id": item._id}}});
                        res.json(response.nModified);
                    } else if (canBuy && isConsummable == true) {
                        let spentCurrency = isConsummable ? user.currency.spent + item.price : user.currency.spent;
                        let response = await User.updateOne({"_id": user.id}, { "currency": {"spent": spentCurrency, "bonus": user.currency.bonus },  $push: {"items": {"item_id": item._id}}});
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