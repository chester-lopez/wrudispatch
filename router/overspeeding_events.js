const express = require('express');
const router = express.Router();

const defaultFilter = require("../utils/defaultFilter");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "overspeeding_events";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter);

    defaultFilter.set(filter,{
        condition: !filter.timestamp,
        defaultValue: "date",
        key: "timestamp"
    }).then(_filter => {
        const query = (limit != 0) ? db.getCollectionOtherDB(`${dbName}-logging`,collection).find(_filter).sort( { 'timestamp': -1 } ).skip(skip).limit(limit) : 
                                     db.getCollectionOtherDB(`${dbName}-logging`,collection).find(_filter).sort( { 'timestamp': -1 } );
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

// get one with filter - ci_co_r
router.get('/:dbName/:username/:filter', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter);

    if(filter && Object.keys(filter).length > 0){
        const query = db.getCollectionOtherDB(`${dbName}-logging`,collection).find(filter).sort( { 'timestamp': 1 } ).limit(10);
        query.toArray((err,docs)=>{
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            else {
                function getOriginalAddress(addr){
                    addr = addr || "";
                    var str = addr.split(" - ");
                    return str[0];
                }

                /*** do not delete me. Code in main.js: XX001. Purpose:  originalEvent._id == val._id  |   */
                var finalDocs = [];
                var firstDoc = docs[0];
                var firstAddress = getOriginalAddress(firstDoc.GEOFENCE_NAME);
                var found = false;

                docs.forEach((val,i) => {
                    if(!found && firstAddress != getOriginalAddress(val.GEOFENCE_NAME)){
                        finalDocs.push(docs[i-1]);
                        finalDocs.push(val);
                        found = true;
                    }
                });
                if(docs.length < auth.LIMIT){
                    console.log(`CLOSE {${collection}} @`,docs.length);
                    query.close();
                }
                res.json(finalDocs);
            }
        });
    } else {
        next(_ERROR_.BAD_REQUEST());
    }
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
        db.getCollectionOtherDB(`${dbName}-logging`,collection).find(_filter).count({}, function(err, numOfDocs){
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

    db.getCollectionOtherDB(`${dbName}-logging`,collection).findOneAndDelete({_id:db.getPrimaryKey(_id)},(err,docs)=>{
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