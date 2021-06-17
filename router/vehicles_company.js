const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const _ERROR_ = require("../utils/error");

const collection = "vehicles_company";

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
        else res.json(docs);
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
   
    db.getCollection(dbName,collection).find(filter).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const userInput = req.body;
    const username = req.params.username;

    userInput.created_by = username;
    userInput.created_on = new Date().toISOString();
    
    db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
        if(err){
            var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Brand Tire") : _ERROR_.INTERNAL_SERVER(err);
            next(error);
        } else {
            res.json({ok:1,_id:result.insertedId});
        }
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const userInput = req.body;
    const filter = {_id:db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

    db.getCollection(dbName,collection).findOneAndUpdate(filter,{$set: userInput},{returnOriginal: false},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id:db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

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
                res.json(docs);
            }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
        }
    });
});

module.exports = router;