const express = require('express');
const router = express.Router();
const Joi = require('joi');

const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "geofences";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const query = db.getCollection(dbName,collection).find(filter).skip(skip).limit(limit);

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

// get
router.get('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const query = db.getCollection(dbName,collection).aggregate([
        {
            $match: {_id: db.getPrimaryKey(_id)},
        },
        { 
            $lookup: {
                from: 'regions',
                localField: 'region_id',
                foreignField: '_id',
                as: 'region',
            }
        },
        { $unwind: { path: "$region", preserveNullAndEmptyArrays: true } },
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
router.get('/:dbName/:username/short_name/:short_name', (req,res,next)=>{
    const dbName = req.params.dbName;
    const short_name = req.params.short_name;
    const query = db.getCollection(dbName,collection).find({short_name: short_name});
    
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

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const userInput = req.body;

    Joi.validate(userInput,schema[collection](),(err,result)=>{
        if(err){
            next(_ERROR_.UNPROCESSABLE_ENTITY(err));
        } else {
            userInput.region_id = db.getPrimaryKey(userInput.region_id);
            userInput.cluster_id = db.getPrimaryKey(userInput.cluster_id);
            db.getCollection(dbName,collection).findOneAndUpdate({ short_name: userInput.short_name },{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else res.json({ok:1});
            });
        }
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username;
    const userInput = req.body;

    (userInput.region_id && userInput.region_id .length > 0) ? userInput.region_id = db.getPrimaryKey(userInput.region_id) : null;
    (userInput.cluster_id && userInput.cluster_id .length > 0) ? userInput.cluster_id = db.getPrimaryKey(userInput.cluster_id) : null;
    db.getCollection(dbName,collection).findOneAndUpdate({_id: db.getPrimaryKey(_id)},{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username; // not included yet in filter
    const filter = {_id: db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

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
});

module.exports = router;