const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const _ERROR_ = require("../utils/error");

const collection = "sessions_active";

// put
router.put('/:dbName/:username/:_id/:timestamp', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const timestamp = Number(req.params.timestamp);

    db.getCollection(dbName,collection).findOneAndUpdate({ _id },{ $set: { last_active_timestamp: (timestamp || new Date().getTime()) } },{upsert: true},(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else res.json({ok:1});
    });
});

module.exports = router;