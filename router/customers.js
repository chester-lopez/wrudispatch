const express = require('express');
const router = express.Router();
const Joi = require('joi');

const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "customers";

// get all keyword (pagination)
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);

    const term = filter.term;
    const regex = new RegExp('.*'+term+'.*',"i");
    
    const query = db.getCollection(dbName,collection).find({
        $or: [
            {  name: regex },
            {  number: regex },
        ]
    }).skip(skip).limit(limit);

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

// count keyword (pagination)
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);
    const term = filter.term;

    const regex = new RegExp('.*'+term+'.*',"i");

    db.getCollection(dbName,collection).find({
        $or: [
            {  name: regex },
            {  number: regex },
        ]
    }).count({}, function(err, numOfDocs){
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        
        res.json(numOfDocs);
    });
});

// get all keyword (with LIMIT)
router.get('/:dbName/:username/keyword/:term', (req,res,next)=>{
    const dbName = req.params.dbName;
    const term = req.params.term;

    const regex = new RegExp('.*'+term+'.*',"i");

    db.getCollection(dbName,collection).find({
        $or: [
            {  name: regex },
            {  number: regex },
        ]
    }).limit(300).toArray((err,docs)=>{
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

// get all from array
router.get('/:dbName/:username/array/:arr', (req,res,next)=>{
    const dbName = req.params.dbName;
    const arr = JSON.parse(req.params.arr);

    const finalArr = [];
    (arr||[]).forEach(val => {
        try {
            const converted = db.getPrimaryKey(val);
            finalArr.push(converted);
        } catch(error) {}
    });

    db.getCollection(dbName,collection).aggregate([
        {
            $match: {
                _id: {
                    $in: finalArr
                }
            }
        },
        {
            $project: {
                _id: 1,
                number: 1,
                name: 1,
            }
        }
    ]).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            res.json(docs);
        }
    });
});

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const userInput = req.body;

    userInput.created_by = username;
    userInput.created_on = new Date().toISOString();

    (userInput.region_id) ? userInput.region_id = db.getPrimaryKey(userInput.region_id) : null;
    (userInput.cluster_id) ? userInput.cluster_id = db.getPrimaryKey(userInput.cluster_id) : null;
    (userInput.dc_id) ? userInput.dc_id = db.getPrimaryKey(userInput.dc_id) : null;

    db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username;
    const userInput = req.body;

    (userInput.region_id) ? userInput.region_id = db.getPrimaryKey(userInput.region_id) : null;
    (userInput.cluster_id) ? userInput.cluster_id = db.getPrimaryKey(userInput.cluster_id) : null;
    (userInput.dc_id) ? userInput.dc_id = db.getPrimaryKey(userInput.dc_id) : null;

    db.getCollection(dbName,collection).findOneAndUpdate({ _id },{$set: userInput},{returnOriginal: false},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username; // not included yet in filter
    const filter = { _id: db.getPrimaryKey(_id) }; // NEVER LEAVE EMPTY! Will affect all

    db.getCollection(dbName,collection).findOneAndDelete(filter,(err,cDocs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            db.getCollectionOtherDB(`${dbName}-logging`,"user_action").insertOne({
                action:"delete",
                timestamp: new Date().toISOString(),
                unique_filter: `_id: ${_id}`,
                remarks: `Deleted geofence: ${gDocs.deletedCount}`,
                data: JSON.stringify(cDocs.value),
                collection,
                username
            }).then(() => {
                res.json({ok:1});
            }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
        }
    });
});

module.exports = router;