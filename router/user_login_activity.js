const express = require('express');
const router = express.Router();

const defaultFilter = require("../utils/defaultFilter");
const db = require("../utils/db");
const auth = require("../utils/auth");
const _ERROR_ = require("../utils/error");

const collection = "user_login_activity";

// get all
router.get('/:dbName/:username/all/:filter/:skip/:limit', (req,res,next)=>{
    const dbName = req.params.dbName;
    const username = req.params.username;
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const filter = JSON.parse(req.params.filter);

    defaultFilter.set(filter,{
        condition: !filter.login_date,
        defaultValue: "date",
        key: "login_date"
    }).then(_filter => {
        var aggregate = [
            {
                $match: _filter
            },
            // {
            //     $lookup: {
            //         from: "users",
            //         localField: "username",
            //         foreignField: "_id",
            //         as: "userDetails",
                    
            //     }
            // },
            // { $unwind: "$userDetails" },
            // {
            //     $project: {
            //         "userDetails._id": 0,
            //         "userDetails.email": 0,
            //         "userDetails.phoneNumber": 0,
            //         "userDetails.filter": 0,
            //         "userDetails.role": 0,
            //         "userDetails.settings": 0,
            //     }
            // },
        ];
        const query = (limit != 0) ? db.getCollectionOtherDB(dbName,collection).aggregate(aggregate).sort( { 'login_date': -1 } ).skip(skip).limit(limit) : 
                                     db.getCollectionOtherDB(dbName,collection).aggregate(aggregate).sort( { 'login_date': -1 } );
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
        condition: !filter.login_date,
        defaultValue: "date",
        key: "login_date"
    }).then(_filter => {
        db.getCollectionOtherDB(dbName,collection).find(_filter).count({}, function(err, numOfDocs){
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

    db.getCollectionOtherDB(dbName,collection).findOneAndDelete({_id:db.getPrimaryKey(_id)},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

module.exports = router;