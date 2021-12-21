const express = require('express');
const router = express.Router();
const Joi = require('joi');

const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const storage = require("../utils/storage");
const _ERROR_ = require("../utils/error");

const collection = "vehicles";
const encrypted = Buffer.from(collection, 'binary').toString('base64');

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
    const _id = Number(req.params._id);
    const query = db.getCollectionOtherDB(null,collection,clientId).find({_id});

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

// put
router.put('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = Number(req.params._id);
    const username = req.params.username;
    var userInput = req.body;

    (userInput.section_id) ? userInput.section_id = db.getPrimaryKey(userInput.section_id) : null;
    (userInput.company_id) ? userInput.company_id = db.getPrimaryKey(userInput.company_id) : null;

    var update_obj = {};
    var unset_obj = {};
    var lto_attachments;
    var ltfrb_attachments;
    if(userInput.lto_attachments){
        var fa = storage._attachments_.filter(`${encrypted}/${_id}`,userInput,undefined,"lto_attachments");
        lto_attachments = fa.attachments;
        unset_obj = fa.unset_obj;
    }
    if(userInput.ltfrb_attachments){
        var fa = storage._attachments_.filter(`${encrypted}/${_id}`,userInput,undefined,"ltfrb_attachments");
        ltfrb_attachments = fa.attachments;
        var mergedUnset = Object.assign( {}, unset_obj, fa.unset_obj );
        unset_obj = mergedUnset;
    }
    update_obj["$set"] = userInput;
    (Object.keys(unset_obj).length > 0) ? update_obj["$unset"] = unset_obj : null;

    db.getCollectionOtherDB(null,collection,clientId).findOneAndUpdate({_id},update_obj,{returnOriginal: false,upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            const attachments = (lto_attachments||[]).concat((ltfrb_attachments||[]));
            storage._attachments_.update(`${encrypted}/${_id}`,attachments).then(() => {
                res.json({ok:1});
            }).catch(error => {
                console.log("Error Uploading: ",JSON.stringify(error));
                res.json({ok:1});
            });
        }
    });
});

// delete
router.delete('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const _id = Number(req.params._id);
    const username = req.params.username; // not included yet in filter
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

    db.getCollectionOtherDB(null,collection,clientId).findOneAndDelete(filter,(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            storage._attachments_.remove(`${encrypted}/${_id}`).then(() => {
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
            }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
        }
    });
});

module.exports = router;