const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const _ERROR_ = require("../utils/error");

const collection = "vehicles_history";

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
    const filter = {_id: Number(_id)}; // NEVER LEAVE EMPTY! Will affect all
   
    db.getCollection(dbName,collection).find(filter).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

module.exports = router;