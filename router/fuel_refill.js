const express = require('express');
const router = express.Router();
const Joi = require('joi');

const defaultFilter = require("../utils/defaultFilter");
const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const storage = require("../utils/storage");
const _ERROR_ = require("../utils/error");

const collection = "fuel_refill";
const encrypted = Buffer.from(collection, 'binary').toString('base64');

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};

    const query = (limit != 0) ? db.getCollection(dbName,collection).find({}).skip(skip).limit(limit) : 
                                 db.getCollection(dbName,collection).find({});

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

    db.getCollection(dbName,collection).find({}).count({}, function(err, numOfDocs){
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        
        res.json(numOfDocs);
    });
});

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    var userInput = req.body;

    userInput.created_by = username;
    userInput.created_on = new Date().toISOString();

    var fa = storage._attachments_.filter(`${encrypted}/${userInput._id}`,userInput);
    userInput = fa.userInput;

    db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
        if(err){
            console.log(err)
            var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Fleet #") : _ERROR_.INTERNAL_SERVER(err);
            next(error);
        } else {
            storage._attachments_.add(fa.attachments).then(() => {
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
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all

    defaultFilter.check(filter).then(() => {
        var query = db.getCollection(dbName,collection).find(filter);
        query.toArray((err,docs)=>{
            var doc = docs[0] || {};
            function deleteRecord(){
                db.getCollection(dbName,collection).findOneAndDelete(filter,(err,docs)=>{
                    if(err) next(_ERROR_.INTERNAL_SERVER(err));
                    else {
                        storage._attachments_.remove(`${encrypted}/${_id}`).then(() => {
                            query.close();
                            res.json({ok:1});
                        }).catch(error => {
                            query.close();
                            res.json({ok:1});
                        });
                    }
                });
            }
            if(doc.username == "wru_marielle"){
                deleteRecord();
            } else {
                db.getCollectionOtherDB(`${dbName}-logging`,"user_action").insertOne({
                    action:"delete",
                    timestamp: new Date().toISOString(),
                    posting_date: doc.posting_date,
                    unique_filter: `_id: ${_id}`,
                    data: JSON.stringify(doc),
                    collection,
                    username
                }).then(() => {
                    deleteRecord();
                }).catch(err => { next(_ERROR_.INTERNAL_SERVER(err)); });
            }
        });
    });
});

module.exports = router;