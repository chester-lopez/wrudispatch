const express = require('express');
const router = express.Router();

const defaultFilter = require("../utils/defaultFilter");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "events";

// get all
router.get('/:clientId/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter);

    // remove _region_id and _cluster_id from filter.
    const finalFilter = {};
    Object.keys(filter).forEach(key => {
        if(!['_region_id','_cluster_id'].includes(key)){
            finalFilter[key] = filter[key];
        }
        
    });

    var locQuery = null;

    // filter geofences with corresponding region
    if(filter['_region_id']){
        locQuery = db.getCollectionOtherDB(null,'geofences',clientId).find({
            region_id: db.getPrimaryKey(filter['_region_id'])
        });
    }

    // filter geofences with corresponding cluster
    if(filter['_cluster_id']){
        locQuery = db.getCollectionOtherDB(null,'geofences',clientId).find({
            cluster_id: db.getPrimaryKey(filter['_cluster_id'])
        });
    }

    // get geofences with corresponding region/cluster
    if(locQuery){
        const short_names = [];
        locQuery.toArray().then(lDocs => {

            // get geofence short names
            lDocs.forEach(lVal => {
                short_names.push(lVal.short_name);
            });

            // add to final filter for events
            finalFilter['Value.Site'] = {
                $in: short_names
            };
    
            retrieveEvents();
        });
    } else {
        retrieveEvents();
    }

    function retrieveEvents(){

        const query = (limit != 0) ? db.getCollectionOtherDB(`${clientId}-logging`,collection).find(finalFilter).skip(skip).limit(limit) : 
                                     db.getCollectionOtherDB(`${clientId}-logging`,collection).find(finalFilter);
    
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
    }
});

// get count
router.get('/:clientId/:username/all/:filter/count', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    // remove _region_id and _cluster_id from filter.
    const finalFilter = {};
    Object.keys(filter).forEach(key => {
        if(!['_region_id','_cluster_id'].includes(key)){
            finalFilter[key] = filter[key];
        }
        
    });

    var locQuery = null;

    // filter geofences with corresponding region
    if(filter['_region_id']){
        locQuery = db.getCollectionOtherDB(null,'geofences',clientId).find({
            region_id: db.getPrimaryKey(filter['_region_id'])
        });
    }

    // filter geofences with corresponding cluster
    if(filter['_cluster_id']){
        locQuery = db.getCollectionOtherDB(null,'geofences',clientId).find({
            cluster_id: db.getPrimaryKey(filter['_cluster_id'])
        });
    }

    // get geofences with corresponding region/cluster
    if(locQuery){
        const short_names = [];
        locQuery.toArray().then(lDocs => {

            // get geofence short names
            lDocs.forEach(lVal => {
                short_names.push(lVal.short_name);
            });

            // add to final filter for events
            finalFilter['Value.Site'] = {
                $in: short_names
            };
    
            retrieveEventCount();
        });
    } else {
        retrieveEventCount();
    }

    function retrieveEventCount(){
        db.getCollectionOtherDB(`${clientId}-logging`,collection).find(filter).count({}, function(err, numOfDocs){
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            
            res.json(numOfDocs);
        });
    }
});

// delete
router.delete('/:clientId/:username/:_id', (req,res,next)=>{
    const clientId = req.params.clientId;
    const username = req.params.username;
    const _id = req.params._id;

    db.getCollectionOtherDB(`${clientId}-logging`,collection).findOneAndDelete({_id:db.getPrimaryKey(_id)},(err,docs)=>{
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