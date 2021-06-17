const express = require('express');
const router = express.Router();

const defaultFilter = require("../utils/defaultFilter");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "user_action";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter);

    defaultFilter.set(filter,{
        condition: !filter.collection,
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

// get count
router.get('/:dbName/:username/all/:filter/count', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const filter = JSON.parse(req.params.filter) || {};

    defaultFilter.set(filter,{
        condition: !filter.collection,
    }).then(_filter => {
        db.getCollectionOtherDB(`${dbName}-logging`,collection).find(_filter).count({}, function(err, numOfDocs){
            if(err) next(_ERROR_.INTERNAL_SERVER(err));
            
            res.json(numOfDocs);
        });
    }).catch(error => {
        next(_ERROR_.BAD_REQUEST(error));
    });
});

module.exports = router;