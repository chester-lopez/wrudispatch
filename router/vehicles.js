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
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const query = db.getCollection(dbName,collection).find(filter).skip(skip).limit(limit);
    // console.log("HI")

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
    const _id = Number(req.params._id);
    const query = db.getCollection(dbName,collection).find({_id});

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

    Joi.validate(userInput,schema[collection](),(err,result)=>{
        if(err){
            next(_ERROR_.UNPROCESSABLE_ENTITY(err));
        } else {
            userInput.created_by = username;
            userInput.created_on = new Date().toISOString();
            db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else res.json({ok:1});
            });
        }
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
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

    db.getCollection(dbName,collection).findOneAndUpdate({_id},update_obj,{returnOriginal: false},(err,docs)=>{
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
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = Number(req.params._id);
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