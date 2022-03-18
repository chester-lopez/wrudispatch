const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const _ERROR_ = require("../utils/error");

const collection = "body_type";

// get all
router.get('/:clientId/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};
    
    const query = (limit != 0) ? db.getCollectionOtherDB(null,collection,clientId).find(filter).skip(skip).limit(limit) : 
                                 db.getCollectionOtherDB(null,collection,clientId).find(filter);
    query.toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
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
router.get('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all
   
    db.getCollectionOtherDB(null,collection,clientId).find(filter).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

// post
router.post('/:clientId/:username', (req,res,next)=>{
    const clientId = req.params.clientId;
    const userInput = req.body;
    const username = req.params.username;

    userInput.created_by = username;
    userInput.created_on = new Date().toISOString();
    
    db.getCollectionOtherDB(null,collection,clientId).insertOne(userInput,(err,result)=>{
        if(err){
            var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Section") : _ERROR_.INTERNAL_SERVER(err);
            next(error);
        } else {
            res.json({ok:1,_id:result.insertedId});
        }
    });
});

// put
router.put('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const _id = req.params._id;
    const userInput = req.body;
    const filter = {_id:db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

    db.getCollectionOtherDB(null,collection,clientId).findOneAndUpdate(filter,{$set: userInput},{returnOriginal: false},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

// delete
router.delete('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id:db.getPrimaryKey(_id)}; // NEVER LEAVE EMPTY! Will affect all

    db.getCollectionOtherDB(null,collection,clientId).findOneAndDelete(filter,(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            db.getCollectionOtherDB(`${clientId}-logging`,"user_action").insertOne({
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