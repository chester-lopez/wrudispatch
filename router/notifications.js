const express = require('express');
const router = express.Router();

const defaultFilter = require("../utils/defaultFilter");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "notifications";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
        const aggregate = [
            {
                $match: filter
            },
            { 
                $lookup: {
                    from: 'dispatch',
                    localField: 'dispatch_id',
                    foreignField: '_id',
                    as: 'dispatchDetails',
                }
            },
            {
                $unwind: "$dispatchDetails"
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
                    "_id": 1,
                    "escalation": 1,
                    "delay_type": 1,
                    "timelapse": 1,
                    "site": 1,
                    "timestamp": 1,
                    "dispatch_id": 1,
                    "username": 1,
                    "dispatchDetails.status": 1,
                    "dispatchDetails.departure_date": 1,
                    // "userDetails.name": 1,
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


// get all (Delay report)
router.get('/:dbName/:username/dr/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
        const aggregate = [
            {
                $match: filter
            },
            { 
                $lookup: {
                    from: 'dispatch',
                    localField: 'dispatch_id',
                    foreignField: '_id',
                    as: 'dispatchDetails',
                }
            },
            {
                $unwind: "$dispatchDetails"
            },
            {
                $project: {
                    "_id": 1,
                    "escalation": 1,
                    "delay_type": 1,
                    "timelapse": 1,
                    "site": 1,
                    "timestamp": 1,
                    "dispatch_id": 1,
                    "dispatchDetails.vehicle_id": 1,
                    "dispatchDetails.trailer": 1,
                    "dispatchDetails.route": 1,
                }
            },
            {
                $group: {
                    "_id": {
                        dispatch_id: "$dispatch_id",
                        escalation: "$escalation",
                        delay_type: "$delay_type",
                    },
                    escalation: {$max:"$escalation"},
                    delay_type: {$first: "$delay_type"},
                    timelapse: {$last: "$timelapse"},
                    site: {$first: "$site"},
                    timestamp: {$max: "$timestamp"},
                    dispatch_id: {$first: "$dispatch_id"},
                    dispatchDetails: {$first: "$dispatchDetails"},
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

// get all. de dashboard
router.get('/:dbName/:username/all/de/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
        const aggregate = [
            {
                $match: _filter
            },
            { 
                $lookup: {
                    from: 'dispatch',
                    localField: 'dispatch_id',
                    foreignField: '_id',
                    as: 'dispatchDetails',
                }
            },
            {
                $unwind: "$dispatchDetails"
            },
            {
                $unwind: "$dispatchDetails.destination"
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
                $group: {
                    _id: {
                        dispatch_id: "$dispatch_id",
                        // escalation: "$escalation",
                        delay_type: "$delay_type",
                    },
                    id: {$first: "$_id"},
                    escalation: {$max:"$escalation"},
                    delay_type: {$first: "$delay_type"},
                    timelapse: {$last: "$timelapse"},
                    site: {$first: "$site"},
                    timestamp: {$max: "$timestamp"},
                    dispatch_id: {$first: "$dispatch_id"},
                    username: {$first: "$username"},
                    dispatch_location_id: {$first: "$dispatchDetails.destination.location_id"},
                    dispatch_vehicle_id: {$first: "$dispatchDetails.vehicle_id"},
                    dispatch_status: {$first: "$dispatchDetails.status"},
                    // user_name: {$first: "$userDetails.name"},
                }
            }
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

// get one
router.get('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;
    const filter = {_id: db.getPrimaryKey(_id)};

    const aggregate = [
                {
                    $match: filter
                },
                { 
                    $lookup: {
                        from: 'dispatch',
                        localField: 'dispatch_id',
                        foreignField: '_id',
                        as: 'dispatchDetails',
                    }
                },
                { 
                    $lookup: {
                        from: 'users',
                        localField: 'username',
                        foreignField: '_id',
                        as: 'userDetails',
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

// get count
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
        db.getCollection(dbName,collection).find(_filter).count({}, function(err, numOfDocs){
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            
            res.json(numOfDocs);
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

// delete
router.delete('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const _id = req.params._id;

    db.getCollection(dbName,collection).findOneAndDelete({_id:db.getPrimaryKey(_id)},(err,docs)=>{
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