const express = require('express');
const router = express.Router();
const Joi = require('joi');

const defaultFilter = require("../utils/defaultFilter");
const schema = require("../utils/schema");
const db = require("../utils/db");
const auth = require("../utils/auth");
const storage = require("../utils/storage");
const _ERROR_ = require("../utils/error");

const collection = "dispatch";
const encrypted = Buffer.from(collection, 'binary').toString('base64');

var HH_MM = function(dh,def){
        def = def==null?"-":def;
        var hour = "",
            minute = "";
        if(dh != null){
            (dh != null) ? dh = Number(dh) : null;

            dh = dh.toFixed(2);

            hour = dh.toString().split(".")[0]; // convert decimal hour to HH:MM
            minute = JSON.stringify(Math.round((dh % 1)*60)).split(".")[0];
            if(hour.length < 2) hour = '0' + hour;
            if(minute.length < 2) minute = '0' + minute;
            def = `${hour}:${minute}`;
        }
        return {
            hour,
            minute,
            hour_minute: def,
        };
    };

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};

    (filter.origin_id && typeof filter.origin_id == "string") ? filter.origin_id = db.getPrimaryKey(filter.origin_id) : null;
    (filter.destination && filter.destination.$elemMatch.location_id) ? filter.destination.$elemMatch.location_id = db.getPrimaryKey(filter.destination.$elemMatch.location_id) : null;

    Object.keys(filter).forEach(key => {
        if(filter.origin_id && filter.origin_id.$in){
            filter.origin_id.$in.forEach((val,i) => {
                filter.origin_id.$in[i] = db.getPrimaryKey(val);
            })
        }
    });

    delete filter.region; // do not delete
    delete filter.cluster; // do not delete

    defaultFilter.set(filter,{
        condition: !filter.posting_date && !filter.departure_date,
        defaultValue: "date",
        key: "posting_date"
    }).then(_filter => {
        const aggregate = [
            {
                $match: _filter
            },
            // { 
            //     $lookup: {
            //         from: 'users',
            //         localField: 'username',
            //         foreignField: '_id',
            //         as: 'userDetails',
            //     }
            // },
            // { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    // "userDetails._id": 0,
                    // "userDetails.email": 0,
                    // "userDetails.phoneNumber": 0,
                    // "userDetails.filter": 0,
                    // "userDetails.role": 0,
                    "vehicle": 0,
                    "origin": 0,
                    "destination.location": 0,
                    "destination.transit_time": 0,
                    "destination.cico": 0,
                }
            },
        ],
        query = (limit != 0) ? db.getCollection(dbName,collection).aggregate(aggregate).skip(skip).limit(limit) : 
                            db.getCollection(dbName,collection).aggregate(aggregate);
    
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
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

// get batch (ADD USER ID)
router.get('/:dbName/:username/batch/:shipment_numbers', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const shipment_numbers = JSON.parse(req.params.shipment_numbers);

    const query = db.getCollection(dbName,collection).find({_id: {$in: shipment_numbers}});

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
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id};

    defaultFilter.check(filter).then(() => {
        var aggregate = [
            {
                $match: filter
            },
            // { 
            //     $lookup: {
            //         from: 'users',
            //         localField: 'username',
            //         foreignField: '_id',
            //         as: 'userDetails',
            //     }
            // },
            // { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    // "userDetails._id": 0,
                    // "userDetails.email": 0,
                    // "userDetails.phoneNumber": 0,
                    // "userDetails.filter": 0,
                    // "userDetails.role": 0,
                    "vehicle": 0,
                    "origin": 0,
                    "destination.location": 0,
                    "destination.transit_time": 0,
                    "destination.cico": 0,
                }
            },
        ],
        query = db.getCollection(dbName,collection).aggregate(aggregate);
        
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
});

// get (Manpower and Vehicle Utilization Report)
router.get('/:dbName/:username/mtur/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.check(filter).then(() => {
        var aggregate = [
            {
                $match: filter
            },
            {
                $project: {
                    "origin_id": 1,
                    "vehicle_id": 1,
                    "chassis": 1,
                    "driver_id": 1,
                    "checker_id": 1,
                    "helper_id": 1,
                    "scheduled_date": 1
                }
            },
        ],
        query = (limit != 0) ? db.getCollection(dbName,collection).aggregate(aggregate).skip(skip).limit(limit) : 
                               db.getCollection(dbName,collection).aggregate(aggregate);
        
        query.toArray((err,docs)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else {
                query.close();
                res.json(docs);
            }
        });
    });
});

// check if truck,driver,checker has same scheduled date
router.get('/:dbName/:username/vehicle_info/:filter', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);

    if(filter){
        try { (filter.$and[0].$or[1].driver_id) ? filter.$and[0].$or[1].driver_id = db.getPrimaryKey(filter.$and[0].$or[1].driver_id) : null; } catch(error) {}
        try { (filter.$and[0].$or[2].checker_id) ? filter.$and[0].$or[2].checker_id = db.getPrimaryKey(filter.$and[0].$or[2].checker_id) : null; } catch(error) {}
        try { (filter.$and[0].$or[3].helper_id) ? filter.$and[0].$or[3].helper_id = db.getPrimaryKey(filter.$and[0].$or[3].helper_id) : null; } catch(error) {}

        var query = db.getCollection(dbName,collection).find(filter);
        
        query.toArray((err,docs)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else {
                var _ids = [];
                docs.forEach(val => {
                    _ids.push(val._id);
                });
                res.json(docs);
            }
        });
    } else {
        res.json({ok:1});
    }
});

// get clone
router.get('/:dbName/:username/clone/:filter', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);
    const MongoClient = require('mongodb').MongoClient;

    var prodURL = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var devURL = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};

    if(Object.keys(filter).length > 0){
        // connect to production database
        MongoClient.connect(prodURL, mongoOptions, (err,prodClient) => {
            if(err){
                console.log("ERROR1",err);
            } else {
                // connect to development database
                MongoClient.connect(devURL, mongoOptions, (err,devClient) => {
                    if(err){
                        console.log("ERROR1",err);
                    } else {
                        prodClient.db(`wd-${dbName}`).collection(collection).find(filter).toArray().then(pDocs=> {
                            devClient.db(`wd-${dbName}`).collection(collection).insertMany(pDocs,{ ordered: false }).then(dDocs=> {
                                res.json({ok: 1});
                            }).catch(error => {
                                res.json({error: 1, message: error});
                            })
                        });
                    }
                });
            }
        });
    } else {
        res.json({error: 1, message: "Filter is required"});
    }
});

// get count
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};
    
    (filter.origin_id && typeof filter.origin_id == "string") ? filter.origin_id = db.getPrimaryKey(filter.origin_id) : null;
    (filter.destination && filter.destination.$elemMatch.location_id) ? filter.destination.$elemMatch.location_id = db.getPrimaryKey(filter.destination.$elemMatch.location_id) : null;

    Object.keys(filter).forEach(key => {
        if(filter.origin_id && filter.origin_id.$in){
            filter.origin_id.$in.forEach((val,i) => {
                filter.origin_id.$in[i] = db.getPrimaryKey(val);
            })
        }
    });

    delete filter.region; // do not delete
    delete filter.cluster; // do not delete


    defaultFilter.set(filter,{
        condition: !filter.posting_date && !filter.departure_date,
        defaultValue: "date",
        key: "posting_date"
    }).then(_filter => {
        db.getCollection(dbName,collection).find(_filter).count({}, function(err, numOfDocs){
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            
            res.json(numOfDocs);
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

// batch post
router.post('/:dbName/:username/batch', (req,res,next)=>{
    const dbName = req.params.dbName;
    const userInput = req.body;
    const username = req.params.username;
    const finalInput = [];
    function checkIfDone(){
        if(userInput.batchedData.length == finalInput.length){
            db.getCollection(dbName,collection).insertMany(finalInput,(err,result)=>{
                // console.log(result);
                if(err){
                    // console.log(JSON.parse(JSON.stringify(err.result)).writeErrors);
                    // console.log(JSON.parse(JSON.stringify(err.result)).insertedIds);
                    var error = ((err.name=="MongoError"||err.name=="BulkWriteError") && err.code==11000) ? _ERROR_.DUPLICATE("Shipment #") : _ERROR_.INTERNAL_SERVER(err);
                    next(error);
                } 
                else res.json({ok:1});
            });
        }
    }
    userInput.batchedData.forEach(val => {
        delete val.__rowNum__;
        
        (val.driver_id) ? val.driver_id = db.getPrimaryKey(val.driver_id) : null;
        (val.checker_id) ? val.checker_id = db.getPrimaryKey(val.checker_id) : null;
        (val.helper_id) ? val.helper_id = db.getPrimaryKey(val.helper_id) : null;

        (val.origin_id) ? val.origin_id = db.getPrimaryKey(val.origin_id) : null;
        (val.destination[0].location_id) ? val.destination[0].location_id = db.getPrimaryKey(val.destination[0].location_id) : null;
        (val.vehicle_id) ? val.vehicle_id = Number(val.vehicle_id) : null;

        if(val._id){
            val.history = { original: JSON.stringify(val) };
            finalInput.push(val);
            checkIfDone();
        } else {
            // db.getCollection(dbName,collection).find({}).sort({_id:-1}).limit(1).toArray().then(max => {
            //     console.log(Number(max[0]._id));
                db.getCollection(dbName,"counters").findOneAndUpdate({_id: "shipment_number"},{ $inc: { seq: 1 } },{new:true,returnOriginal: false,upsert: true},(err,docs)=>{
                    if(err) next(_ERROR_.INTERNAL_SERVER(err));
                    else {
                        var newSequence = docs.value.seq;
                        (newSequence < 999999999) ? newSequence = ('0000000000' + newSequence).slice(-10) : null; // 10-digit
                        val._id = newSequence;
                       
                        val.history = { original: JSON.stringify(val) };
                        finalInput.push(val);
                        checkIfDone();
                    }
                });
            // });
        }
    });
});

// post
router.post('/:dbName/:username', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    var userInput = req.body;

    if(userInput.status == "plan") {
        insertDocument();
    } else {
        Joi.validate(userInput,schema[collection](),(err,result)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else insertDocument();
        });
    }

    function insertDocument(){
        
        userInput.posting_date = new Date().toISOString();

        
        (userInput.driver_id) ? userInput.driver_id = db.getPrimaryKey(userInput.driver_id) : null;
        (userInput.checker_id) ? userInput.checker_id = db.getPrimaryKey(userInput.checker_id) : null;
        (userInput.helper_id) ? userInput.helper_id = db.getPrimaryKey(userInput.helper_id) : null;

        (userInput.origin_id) ? userInput.origin_id = db.getPrimaryKey(userInput.origin_id) : null;
        (userInput.destination && userInput.destination[0] && userInput.destination[0].location_id) ? userInput.destination[0].location_id = db.getPrimaryKey(userInput.destination[0].location_id) : null;

        var vehicleData = userInput.vehicleData;
        delete userInput.vehicleData;
        delete userInput.vehicleChanged;
        delete userInput.selectedCheckIn;

        userInput.history = { original: JSON.stringify(userInput) };
        if(vehicleData){
            userInput.history.vehicle = JSON.stringify(vehicleData);
        }

        function save(sequence){
            var fa = storage._attachments_.filter(`${encrypted}/${(sequence||userInput._id)}`,userInput);
            userInput = fa.userInput;

            db.getCollection(dbName,collection).insertOne(userInput,(err,result)=>{
                if(err){
                    console.log(err)
                    var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Shipment #") : _ERROR_.INTERNAL_SERVER(err);
                    next(error);
                } else {
                    storage._attachments_.add(fa.attachments).then(() => {
                        res.json({ok:1,sequence});
                    }).catch(error => {
                        console.log("Error Uploading: ",JSON.stringify(error));
                        res.json({ok:1,sequence});
                    });
                }
            });
        }

        if(userInput._id){
            save();
        } else {
            db.getCollection(dbName,"counters").findOneAndUpdate({_id: "shipment_number"},{ $inc: { seq: 1 } },{new:true,returnOriginal: false,upsert: true},(err,docs)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else {
                    var newSequence = docs.value.seq;
                    (newSequence < 999999999) ? newSequence = ('0000000000' + newSequence).slice(-10) : null; // 10-digit
                    userInput._id = newSequence;
                   
                    save(newSequence);
                }
            });
        }
    }
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const username = req.params.username;
    const filter = {_id}; // NEVER LEAVE EMPTY! Will affect all
    
    defaultFilter.check(filter).then(() => {
        var userInput = req.body,
            type = userInput.type,
            selectedCheckIn = userInput.selectedCheckIn,
            transit_time = userInput.transit_time,
            vehicleChanged = userInput.vehicleChanged,
            unset_obj = {},
            update_obj = {};

        delete userInput.type;
        delete userInput.transit_time;
        delete userInput.vehicleData;
        delete userInput.vehicleChanged;
        delete userInput.selectedCheckIn;

        delete userInput.username;

        (userInput.driver_id) ? userInput.driver_id = db.getPrimaryKey(userInput.driver_id) : null;
        (userInput.checker_id) ? userInput.checker_id = db.getPrimaryKey(userInput.checker_id) : null;
        (userInput.helper_id) ? userInput.helper_id = db.getPrimaryKey(userInput.helper_id) : null;

        (userInput.origin_id) ? userInput.origin_id = db.getPrimaryKey(userInput.origin_id) : null;
        (userInput.destination && userInput.destination[0] && userInput.destination[0].location_id) ? userInput.destination[0].location_id = db.getPrimaryKey(userInput.destination[0].location_id) : null;
        
        var fa = storage._attachments_.filter(`${encrypted}/${_id}`,userInput),
        // var fa = filterAttachments(userInput,unset_obj),
            attachments = fa.attachments;
        if(type != "statusUpdate") {
            userInput = fa.userInput;
            unset_obj = fa.unset_obj;
        }

        if(type == "statusUpdate"){
            var history = `Status manually updated to <status>${userInput.status}</status> by <username>${username}</username>.`;
            if(userInput.i_c_reason){
                history += `<div class="pt-2">Reason for updating status from Incomplete to Complete: <b>${userInput.i_c_reason}</b></div>`;
            }
            userInput[`history.${new Date().getTime()}`] = history;

            delete userInput.i_c_reason;

            if(["queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit","onSite","returning","complete","incomplete"].includes(userInput.status)){
                userInput[`events_captured.${new Date().getTime()}`] = userInput.status;
            }
            unset_obj["escalation1"] = "";
            unset_obj["escalation2"] = "";
            unset_obj["escalation3"] = "";

            if(["plan","assigned","queueingAtOrigin","processingAtOrigin","idlingAtOrigin"].includes(userInput.status)){
                unset_obj[`departure_date`] = "";
                unset_obj[`destination.0.etd`] = "";
                unset_obj[`destination.0.eta`] = "";
            } else if(["in_transit"].includes(userInput.status)){
                var date = new Date(),
                    transit_time = HH_MM(Number(transit_time)),
                    hours = transit_time.hour,
                    minutes = transit_time.minute;
                userInput[`departure_date`] = date.toISOString();
                userInput[`destination.0.etd`] = date.toISOString();
                
                (hours)?date.setHours(date.getHours() + Number(hours)):null;
                (minutes)?date.setMinutes(date.getMinutes() + Number(minutes)):null;
                
                userInput[`destination.0.eta`] = date.toISOString();
            }
        }
        update_obj["$set"] = userInput;
        (Object.keys(unset_obj).length > 0) ? update_obj["$unset"] = unset_obj : null; 

        if(vehicleChanged == true || selectedCheckIn == true){
            unset_obj["escalation1"] = "";
            unset_obj["escalation2"] = "";
            unset_obj["escalation3"] = "";
            update_obj["$unset"] = unset_obj;
            
            db.getCollection(dbName,"notifications").deleteMany({ dispatch_id: _id },(err,docs)=>{
                updateData();
            });
        } else {
            updateData();
        }

        function updateData(){
            db.getCollection(dbName,collection).findOneAndUpdate(filter,update_obj,{returnOriginal: false},(err,docs)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else {
                    if(type != "statusUpdate") {
                        storage._attachments_.update(`${encrypted}/${_id}`,attachments).then(() => {
                            res.json(docs);
                        }).catch(error => {
                            console.log("Error Uploading: ",JSON.stringify(error));
                            res.json(docs);
                        });
                    } else {
                        res.json(docs);
                    }
                }
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
                        // storage.deleteFiles(_id).then(() => {
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