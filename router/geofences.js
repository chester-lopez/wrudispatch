const express = require('express');
const router = express.Router();
const Joi = require('joi');

const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "geofences";

// get all
router.get('/:clientId/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const clientId = req.params.clientId;
    const filter = JSON.parse(req.params.filter);
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const query = db.getCollectionOtherDB(null,collection,clientId).find(filter).skip(skip).limit(limit);

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
router.get('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = req.params._id;
    const query = db.getCollectionOtherDB(null,collection,clientId).aggregate([
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
router.get('/:clientId/:username/all/:filter/count', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    db.getCollectionOtherDB(null,collection,clientId).find(filter).count({}, function(err, numOfDocs){
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        
        res.json(numOfDocs);
    });
});

// get
router.get('/:clientId/:username/short_name/:short_name', (req,res,next)=>{
    const clientId = req.params.clientId;
    const short_name = req.params.short_name;
    const query = db.getCollectionOtherDB(null,collection,clientId).find({short_name: short_name});
    
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
router.post('/:clientId/:username', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const userInput = req.body;

    Joi.validate(userInput,schema[collection](),(err,result)=>{
        if(err){
            next(_ERROR_.UNPROCESSABLE_ENTITY(err));
        } else {
            userInput.region_id = db.getPrimaryKey(userInput.region_id);
            userInput.cluster_id = db.getPrimaryKey(userInput.cluster_id);
            db.getCollectionOtherDB(null,collection,clientId).findOneAndUpdate({ short_name: userInput.short_name },{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else res.json({ok:1});
            });
        }
    });
});

// put
router.put('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = req.params._id;
    const username = req.params.username;
    const userInput = req.body;

    (userInput.trippage_target != null) ? userInput.trippage_target = Number(userInput.trippage_target) : null;
    (userInput.region_id && userInput.region_id .length > 0) ? userInput.region_id = db.getPrimaryKey(userInput.region_id) : null;
    (userInput.cluster_id && userInput.cluster_id .length > 0) ? userInput.cluster_id = db.getPrimaryKey(userInput.cluster_id) : null;
    db.getCollectionOtherDB(null,collection,clientId).findOneAndUpdate({_id: db.getPrimaryKey(_id)},{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = req.params._id;
    const username = req.params.username; // not included yet in filter
    const filter = {_id: db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

    db.getCollectionOtherDB(null,collection,clientId).findOneAndDelete(filter,(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            db.getCollectionOtherDB(null,"user_action",`${clientId}-logging`).insertOne({
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