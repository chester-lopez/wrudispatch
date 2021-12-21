const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const _ERROR_ = require("../utils/error");

const collection = "vehicles_history";

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
    const filter = {_id: Number(_id)}; // NEVER LEAVE EMPTY! Will affect all
   
    db.getCollectionOtherDB(null,collection,clientId).find(filter).toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json(docs);
    });
});

module.exports = router;