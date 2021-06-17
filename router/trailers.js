const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "trailers";

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

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const userInput = req.body;

    userInput.username = username;
    userInput.timestamp = new Date().toISOString();
    db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
        if(err){
            var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Trailer") : _ERROR_.INTERNAL_SERVER(err);
            next(error);
        } else res.json({ok:1});
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username;
    const userInput = req.body;

    db.getCollection(dbName,collection).findOneAndUpdate({_id},{$set: userInput},{returnOriginal: false,upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username; // not included yet in filter
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

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