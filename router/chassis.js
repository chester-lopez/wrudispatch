const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "chassis";

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

// post
router.post('/:clientId/:username', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const userInput = req.body;

    userInput.created_by = username;
    userInput.created_on = new Date().toISOString();

    (userInput.body_type_id) ? userInput.body_type_id = db.getPrimaryKey(userInput.body_type_id) : null;
    (userInput.section_id) ? userInput.section_id = db.getPrimaryKey(userInput.section_id) : null;
    (userInput.company_id) ? userInput.company_id = db.getPrimaryKey(userInput.company_id) : null;
    (userInput.vehicle_id) ? userInput.vehicle_id = Number(userInput.vehicle_id) : null;

    db.getCollectionOtherDB(null,collection,clientId).insertOne(userInput,(err,result)=>{
        if(err){
            var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Chassis") : _ERROR_.INTERNAL_SERVER(err);
            next(error);
        } else res.json({ok:1});
    });
});

// put
router.put('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = req.params._id;
    const username = req.params.username;
    const userInput = req.body;

    (userInput.body_type_id) ? userInput.body_type_id = db.getPrimaryKey(userInput.body_type_id) : null;
    (userInput.section_id) ? userInput.section_id = db.getPrimaryKey(userInput.section_id) : null;
    (userInput.company_id) ? userInput.company_id = db.getPrimaryKey(userInput.company_id) : null;
    (userInput.vehicle_id) ? userInput.vehicle_id = Number(userInput.vehicle_id) : null;

    db.getCollectionOtherDB(null,collection,clientId).findOneAndUpdate({_id},{$set: userInput},{returnOriginal: false},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

// delete
router.delete('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = req.params._id;
    const username = req.params.username; // not included yet in filter
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

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
                res.json({ok:1});
            }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
        }
    });
});

module.exports = router;