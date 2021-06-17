const express = require('express');
const router = express.Router();
const Joi = require('joi');

const defaultFilter = require("../utils/defaultFilter");
const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "sessions";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};
    
    filter.username = username;

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
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
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

// get count
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
        db.getCollection(dbName,collection).find(_filter).count({}, function(err, numOfDocs){
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            
            res.json(numOfDocs);
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
    
});

// get anonymously
router.get('/:dbName/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all
    var aggregate = [
        {
        $match: filter
        },
        {
        $lookup: {
            from: "users",
            localField: "username",
            foreignField: "_id",
            as: "userDetails",
            
        }
        },
        { $unwind: "$userDetails" },
        {
        $lookup: {
            from: "geofences",
            let: {
            username: "$username"
            },
            pipeline: [
            {
                $addFields: {
                _dispatcher: {$ifNull: ['$dispatcher', []] }
                }
            },
            {
                $match: {
                $expr: {
                    $cond: [
                    {
                        $in: [
                            "$$username", 
                            "$_dispatcher"
                        ]
                    },
                    "$short_name",
                    null
                    ]
                }
                }
            }
            ],
            as: "dispatcherDetails",
        }
        },
        { $unwind: { path: "$dispatcherDetails", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "notifications",
                // localField: "username",
                // foreignField: "username",
                let: {
                    username: "$username"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$$username", 
                                            "$username"
                                        ]
                                    },
                                    "true",
                                    null
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$read"
                        }
                    }
                ],
                as: "notificationExists",
            }
        },
    ];
    db.getCollection(dbName,collection).aggregate(aggregate).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

// get
router.get('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

    filter.username = username;

    var aggregate = [
        { $match: filter },
        {
            $lookup: {
                from: "users",
                localField: "username",
                foreignField: "_id",
                as: "userDetails",
            }
        },
    ];
    db.getCollection(dbName,collection).aggregate(aggregate).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
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
            db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
                if(err){
                    var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Session Token") : _ERROR_.INTERNAL_SERVER(err);
                    next(error);
                } else {
                    var query = db.getCollection(dbName,"users").find({_id:username});
                    query.toArray((err,docs)=>{
                        if(err) next(_ERROR_.INTERNAL_SERVER(err));
                        else {
                            var doc = docs[0];
                            
                            query.close();

                            if(doc){
                                res.json({ok:1});
                            } else {
                                var userData = {_id:username,role:"user"};
                                db.getCollection(dbName,"users").insertOne(userData,(err,result)=>{
                                    if(err){
                                        var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Username") : _ERROR_.INTERNAL_SERVER(err);
                                        next(error);
                                    } 
                                    else res.json({ok:1});
                                });
                            }
                        }
                    });
                }
            });
        }
    });
});

// delete
router.delete('/:dbName/:username/temporary/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;

    db.getCollection(dbName,"temp_sessions").findOneAndUpdate({ _id },{ $set: { last_active_timestamp: new Date().getTime() } },{upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

    filter.username = username;
    db.getCollection(dbName,collection).findOneAndDelete(filter,(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            db.getCollection(dbName,"sessions_active").deleteOne({_id},(err1,docs1)=>{
                if(err1) next(_ERROR_.INTERNAL_SERVER(err1));
                else {
                    var doc = docs.value;
                    if(doc){
                        doc.device_info = doc.device_info || {};
                        doc.device_info.metadata = doc.device_info.metadata || {};
                        var metadata = doc.device_info.metadata;
                        // Username | Name | Date | IP Address | Activity | Duration
                        var data = {
                            username: doc.username,
                            login_date: doc.timestamp,
                            logout_date: new Date().toISOString(),
                            location: `${metadata.city||""}, ${metadata.region||""}, ${metadata.country||""}`,
                            ip: metadata.ip,
                        };
                        db.getCollection(dbName,"user_login_activity").updateOne({_id: doc._id},{$set: data},{upsert: true},(err,result)=>{
                            if(err) next(_ERROR_.INTERNAL_SERVER(err));
                            else res.json({ok:1});
                        });
                    } else {
                        res.json({ok:1});
                    }
                }
            });
        }
    });
});

module.exports = router;