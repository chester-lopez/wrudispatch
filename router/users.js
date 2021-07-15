const express = require('express');
const router = express.Router();
const Joi = require('joi');

const defaultFilter = require("../utils/defaultFilter");
const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "users";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};
    
    const query = (limit != 0) ? db.getCollection(dbName,collection).find(filter).skip(skip).limit(limit) : 
                                 db.getCollection(dbName,collection).find(filter);
    query.toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            if(docs.length < auth.LIMIT){
                console.log(`CLOSE {${collection}} @`,docs.length);
                query.close();
            }
            res.json(docs);
        }
    });
});

// get count
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    db.getCollection(dbName,collection).find(filter).count({}, function(err, numOfDocs){
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        
        res.json(numOfDocs);
    });
});

// get
router.get('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all
    
    const query = db.getCollection(dbName,collection).find(filter);
    query.toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            if(docs.length < auth.LIMIT){
                console.log(`CLOSE {${collection}} @`,docs.length);
                query.close();
            }
            res.json(docs);
        }
    });
});

// download from other db
router.put('/:dbName/:username/download/:client', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const client = req.params.client;
    const filter = {_id:username}; // NEVER LEAVE EMPTY! Will affect all
    const query = db.getCollectionOtherDB(client,collection).find(filter);
    query.toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            var doc = docs[0];

            query.close();

            if(doc){
                db.getCollection(dbName,collection).findOneAndUpdate(filter,{$set: {
                    name: doc.name,
                    email: doc.email,
                    phoneNumber: doc.phoneNumber
                }},{returnOriginal: false},(err,docs)=>{
                    if(err) next(_ERROR_.INTERNAL_SERVER(err));
                    else res.json({ok:1});
                });
            } else {
                res.json({ok:1});
            }
        }
    });
});

// get in charge details
router.get('/:dbName/:username/:_id/incharge', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all
    
    defaultFilter.check(filter).then(() => {
        const query = db.getCollection(dbName,collection).aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: "regions",
                    pipeline: [
                        {
                            $addFields: {
                                esc1_lq: {$ifNull: ['$person_in_charge.escalation1.lq', []] },
                                esc1_oc: {$ifNull: ['$person_in_charge.escalation1.oc', []] },
                                esc1_ot: {$ifNull: ['$person_in_charge.escalation1.ot', []] },
                                esc2_lq: {$ifNull: ['$person_in_charge.escalation2.lq', []] },
                                esc2_oc: {$ifNull: ['$person_in_charge.escalation2.oc', []] },
                                esc2_ot: {$ifNull: ['$person_in_charge.escalation2.ot', []] },
                                esc3_lq: {$ifNull: ['$person_in_charge.escalation3.lq', []] },
                                esc3_oc: {$ifNull: ['$person_in_charge.escalation3.oc', []] },
                                esc3_ot: {$ifNull: ['$person_in_charge.escalation3.ot', []] },
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        {
                                            $or: [
                                                { $in: [  _id,  "$esc1_lq" ] },
                                                { $in: [  _id,  "$esc1_oc" ] },
                                                { $in: [  _id,  "$esc1_ot" ] },
                                                { $in: [  _id,  "$esc2_lq" ] },
                                                { $in: [  _id,  "$esc2_oc" ] },
                                                { $in: [  _id,  "$esc2_ot" ] },
                                                { $in: [  _id,  "$esc3_lq" ] },
                                                { $in: [  _id,  "$esc3_oc" ] },
                                                { $in: [  _id,  "$esc3_ot" ] },
                                            ]
                                        },
                                        true,
                                        null
                                    ]
                                }
                            }
                        }
                    ],
                    as: "myRegions",
                }
            },
            {
                $lookup: {
                    from: "clusters",
                    pipeline: [
                        {
                            $addFields: {
                                esc1_lq: {$ifNull: ['$person_in_charge.escalation1.lq', []] },
                                esc1_oc: {$ifNull: ['$person_in_charge.escalation1.oc', []] },
                                esc1_ot: {$ifNull: ['$person_in_charge.escalation1.ot', []] },
                                esc2_lq: {$ifNull: ['$person_in_charge.escalation2.lq', []] },
                                esc2_oc: {$ifNull: ['$person_in_charge.escalation2.oc', []] },
                                esc2_ot: {$ifNull: ['$person_in_charge.escalation2.ot', []] },
                                esc3_lq: {$ifNull: ['$person_in_charge.escalation3.lq', []] },
                                esc3_oc: {$ifNull: ['$person_in_charge.escalation3.oc', []] },
                                esc3_ot: {$ifNull: ['$person_in_charge.escalation3.ot', []] },
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        {
                                            $or: [
                                                { $in: [  _id,  "$esc1_lq" ] },
                                                { $in: [  _id,  "$esc1_oc" ] },
                                                { $in: [  _id,  "$esc1_ot" ] },
                                                { $in: [  _id,  "$esc2_lq" ] },
                                                { $in: [  _id,  "$esc2_oc" ] },
                                                { $in: [  _id,  "$esc2_ot" ] },
                                                { $in: [  _id,  "$esc3_lq" ] },
                                                { $in: [  _id,  "$esc3_oc" ] },
                                                { $in: [  _id,  "$esc3_ot" ] },
                                            ]
                                        },
                                        true,
                                        null
                                    ]
                                }
                            }
                        }
                    ],
                    as: "myClusters",
                }
            },
            {
                $lookup: {
                    from: "geofences",
                    pipeline: [
                        {
                            $addFields: {
                                esc1_lq: {$ifNull: ['$person_in_charge.escalation1.lq', []] },
                                esc1_oc: {$ifNull: ['$person_in_charge.escalation1.oc', []] },
                                esc1_ot: {$ifNull: ['$person_in_charge.escalation1.ot', []] },
                                esc2_lq: {$ifNull: ['$person_in_charge.escalation2.lq', []] },
                                esc2_oc: {$ifNull: ['$person_in_charge.escalation2.oc', []] },
                                esc2_ot: {$ifNull: ['$person_in_charge.escalation2.ot', []] },
                                esc3_lq: {$ifNull: ['$person_in_charge.escalation3.lq', []] },
                                esc3_oc: {$ifNull: ['$person_in_charge.escalation3.oc', []] },
                                esc3_ot: {$ifNull: ['$person_in_charge.escalation3.ot', []] },
                            }
                        },
                        {
                            $match: {
                                $expr: {
                                    $cond: [
                                        {
                                            $or: [
                                                { $in: [  _id,  "$esc1_lq" ] },
                                                { $in: [  _id,  "$esc1_oc" ] },
                                                { $in: [  _id,  "$esc1_ot" ] },
                                                { $in: [  _id,  "$esc2_lq" ] },
                                                { $in: [  _id,  "$esc2_oc" ] },
                                                { $in: [  _id,  "$esc2_ot" ] },
                                                { $in: [  _id,  "$esc3_lq" ] },
                                                { $in: [  _id,  "$esc3_oc" ] },
                                                { $in: [  _id,  "$esc3_ot" ] },
                                            ]
                                        },
                                        true,
                                        null
                                    ]
                                }
                            }
                        }
                    ],
                    as: "myGeofences",
                }
            },
        ]);
    
        query.toArray((err,docs)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else {
                if(docs.length < auth.LIMIT){
                    console.log(`CLOSE {${collection}} @`,docs.length);
                    query.close();
                }
                res.json(docs);
            }
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const userInput = req.body;
    const username = req.params.username;
    
    Joi.validate(userInput,schema[collection](),(err,result)=>{
        if(err){
            next(_ERROR_.UNPROCESSABLE_ENTITY(err));
        } else {
            userInput.created_by = username;
            userInput.created_on = new Date().toISOString();
            db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
                if(err){
                    var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Username") : _ERROR_.INTERNAL_SERVER(err);
                    next(error);
                } 
                else res.json({ok:1});
            });
        }
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const userInput = req.body;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

    defaultFilter.check(filter).then(() => {
        db.getCollection(dbName,collection).findOneAndUpdate(filter,{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else res.json({ok:1});
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

    defaultFilter.check(filter).then(() => {
        db.getCollection(dbName,collection).findOneAndDelete(filter,(err,docs)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else {
                db.getCollectionOtherDB(`${dbName}-logging`,"user_action").insertOne({
                    action:"delete",
                    timestamp: new Date().toISOString(),
                    unique_filter: `_id: ${_id}`,
                    data: JSON.stringify(docs.value),
                    collection,
                    username
                }).then(() => {
                    res.json({ok:1});
                }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
            }
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

module.exports = router;