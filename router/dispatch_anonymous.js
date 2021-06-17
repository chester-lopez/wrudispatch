
const express = require('express');
const Joi = require('joi');
const moment = require('moment-timezone');
const mcpApp = require("mcp-app")({modulesOnly:true});

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const schema = require("../utils/schema");
const db = mcpApp.db;
const auth = mcpApp.auth;
const _ERROR_ = mcpApp.error;

const collection = "dispatch";

const router = express.Router();



var OBJECT = {
    sortByKey: o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}),
    getKeyByValue: (o,v) => Object.keys(o).find(key => o[key] === v),
};
var DATETIME = {
    FORMAT:function(date_,format='MMM D, YYYY, h:mm A',empty="-"){
        return date_ ? moment(new Date(date_)).format(format) : empty;
    },
    DH: function(ms,hh_mm,def="-"){
        (ms && ms >=0) ? def = (ms/3600)/1000 : null; // milliseconds to decimal hours

        if(hh_mm != null){
            hh_mm = hh_mm.toString().replace(/ /g,"");
            var decimalHours = moment.duration(hh_mm).asHours();
            def = Math.round(decimalHours * 100) / 100;
        }
        return def;
    },
    HH_MM: function(ms,dh,def="-"){
        var hour = "",
            minute = "";
        if(ms && ms >=0 || dh != null){
            (ms && ms >=0) ? dh = (ms/3600)/1000 : null; // milliseconds to decimal hours
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
    },
};

router.get('/export/database', (req,res,next)=>{
    const skip = req.body.skip;
    var _trim = function(str){
        str = str || "";
        str = str.replace(/[^\x00-\x7F]/g,"");
        return str.replace(/ +(?= )/g,'').trim().toLowerCase();
    };
    function done(){
        Promise.all(childPromise).then(result => { res.json({arr,result}); }).catch(error => { console.log("Error",error); res.json(error); });
    }
    var childPromise = [];
    /**************** LOCATIONS */
    var collection = req.body.collection;
    var count = 0,count_1 = 0,arr=[];
    
    db.getCollection(collection).find({}).skip(skip).limit(1000).toArray().then(docs=>{
        res.json(docs);
    });
    /**************** END LOCATIONS */
});
router.get('/import/database', (req,res,next)=>{
    const skip = req.body.skip;
    var _trim = function(str){
        str = str || "";
        str = str.replace(/[^\x00-\x7F]/g,"");
        return str.replace(/ +(?= )/g,'').trim().toLowerCase();
    };
    function done(){
        Promise.all(childPromise).then(result => { res.json({arr,result}); }).catch(error => { console.log("Error",error); res.json(error); });
    }
    var childPromise = [];
    /**************** LOCATIONS */
    var collection = "dispatch";
    var count = 0,count_1 = 0,arr=[];

    
    db.getCollection(req.body.collection).insertMany(req.body.import).then(docs=>{
        res.json(docs);
    });
    /**************** END LOCATIONS */
});
router.get('/test/all_events/:skip/:limit', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};

    var collection = "all_events";
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db("wd-wilcon").collection(collection).find({}).skip(skip).limit(limit).toArray().then(docs=> {
                var newData = [];
                docs.forEach(val => {
                    newData.push(val);
                });
                client.db("wd-wilcon-logging").collection(collection).insertMany(newData).then(doc => {
                    res.json(doc);
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});
// export locations
router.get('/test/export/locations/:skip/:limit', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const _id = req.params._id;
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";

    
    var HH_MM = function(dh){
        var hour = "",
            minute = "";
        if(ms && ms >=0 || dh != null){
            (dh != null) ? dh = Number(dh) : null;

            dh = dh.toFixed(2);

            hour = dh.toString().split(".")[0]; // convert decimal hour to HH:MM
            minute = JSON.stringify(Math.round((dh % 1)*60)).split(".")[0];
            if(hour.length < 2) hour = '0' + hour;
            if(minute.length < 2) minute = '0' + minute;
        }
        return {
            hour,
            minute
        };
    };

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var text = "Short Name|Site Name|Site Code|CICO|Region|Cluster|Person In Charge|Dispatcher/s</br>";
            client.db(dbName).collection("users").find({}).toArray().then(uDocs=> {
                client.db(dbName).collection("regions").find({}).toArray().then(rDocs=> {
                    client.db(dbName).collection("clusters").find({}).toArray().then(cDocs=> {
                        client.db(dbName).collection("geofences").find({}).toArray().then(gDocs=> {
                            
                            gDocs.forEach(val => {
                                if(val.cico){
                                    var region = rDocs.find(x => x._id.toString() == (val.region_id || "").toString()) || {};
                                    var cluster = cDocs.find(x => x._id.toString() == (val.cluster_id || "").toString()) || {};
                                    var pic = [];
                                    var dispatcher = [];
                                    val.person_in_charge = val.person_in_charge || [];
                                    val.person_in_charge.forEach(_val_ => {
                                        var user = uDocs.find(x => x._id == _val_);
                                        if(user ){
                                            pic.push(user.name || user._id);
                                        }
                                    });
                                    val.dispatcher = val.dispatcher || [];
                                    val.dispatcher.forEach(_val_ => {
                                        var user = uDocs.find(x => x._id == _val_);
                                        if(user){
                                            dispatcher.push(user.name || user._id);
                                        }
                                    });
                                    text += `${val.short_name}|${val.site_name}|${val.code}|${val.cico}|${region.region}|${cluster.cluster}|${pic.join(", ")}|${dispatcher.join(", ")}</br>`;
                                }
                            });
                            res.send(text);
                        });
                    });
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// export routes
router.get('/test/export/routes/:skip/:limit', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const _id = req.params._id;
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";

    
    var HH_MM = function(dh){
        var hour = "",
            minute = "";
        if(dh != null){
            (dh != null) ? dh = Number(dh) : null;

            dh = dh.toFixed(2);

            hour = dh.toString().split(".")[0]; // convert decimal hour to HH:MM
            minute = JSON.stringify(Math.round((dh % 1)*60)).split(".")[0];
            if(hour.length < 2) hour = '0' + hour;
            if(minute.length < 2) minute = '0' + minute;
        }
        return {
            hour,
            minute
        };
    };

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var text = "Origin|Destination|Hour|Minute</br>";
            client.db(dbName).collection("geofences").find({}).toArray().then(gDocs=> {
                client.db(dbName).collection("routes").find({}).toArray().then(rDocs=> {
                            
                    rDocs.forEach(val => {
                        if(val.transit_time){
                            var origin = gDocs.find(x => x._id.toString() == (val.origin_id || "").toString());
                            var destination = gDocs.find(x => x._id.toString() == (val.destination_id || "").toString());
                            var transit_time = HH_MM(val.transit_time);
                            if(origin && destination){
                                text += `${origin.short_name}|${destination.short_name}|${transit_time.hour}|${transit_time.minute}</br>`;   
                            }
                        }
                    });
                    res.send(text);
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


// export users
router.get('/test/export/users/:skip/:limit', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const _id = req.params._id;
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var text = "Full Name|Username|Email|Phone Number|Role</br>";
            client.db(dbName).collection("users").find({}).toArray().then(uDocs=> {
                            
                uDocs.forEach(val => {
                    text += `${val.name || ""}|${val._id}|${val.email || ""}|${val.phoneNumber || ""}|${val.role}</br>`;   
                });
                res.send(text);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// add to notifications db (test)
router.get('/test/addto/notifications', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    const _id = req.params._id;
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var obj = [{
                type: "delay",
                escalation: 3,
                delay_type: "Over CICO",
                timelapse: 0.76,
                site: "ZAM DC",
                timestamp: "2021-02-02T08:44:35.487Z",
                dispatch_id: "10000001",
                username: "wru_marielle",
                read: false
            },
            {
                type: "delay",
                escalation: 3,
                delay_type: "Over CICO",
                timelapse: 0.76,
                site: "ZAM DC",
                timestamp: "2021-02-02T08:44:35.487Z",
                dispatch_id: "10000001",
                username: "admin",
                read: false
            },
            {
                type: "delay",
                escalation: 3,
                delay_type: "Over CICO",
                timelapse: 0.76,
                site: "ZAM DC",
                timestamp: "2021-02-02T08:44:35.487Z",
                dispatch_id: "10000001",
                username: "wru_vincent",
                read: false
            }];
            client.db(dbName).collection("notifications").insertMany(obj).then(uDocs=> {
                res.send(uDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


// add to notifications db (test)
router.get('/test/delete/notifications/:_id', (req,res,next)=>{
    const _id = req.params._id;
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("notifications").deleteMany({dispatch_id:_id}).then(uDocs=> {
                res.send(uDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


// update Transit Times
router.get('/test/update/transit_times', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];
    var testArr = [];
    var updatedData = [
        {
            "origin": "ANTI DC",
            "destination": "STAROSA PL",
            "transit_time": "1.43"
        },
        {
            "origin": "ANTI DC",
            "destination": "SILANGAN DC",
            "transit_time": "1.6"
        },
        {
            "origin": "ANTI DC",
            "destination": "PQUE DC",
            "transit_time": "1.14"
        },
        {
            "origin": "ANTI DC",
            "destination": "TOLL SF 1 PL",
            "transit_time": "2.3"
        },
        {
            "origin": "ANTI DC",
            "destination": "MEYC PL",
            "transit_time": "1.46"
        },
        {
            "origin": "ANTI DC",
            "destination": "CNL PL",
            "transit_time": "1.76"
        },
        {
            "origin": "ANTI DC",
            "destination": "RSVLT DC",
            "transit_time": "0.9"
        },
        {
            "origin": "ANTI DC",
            "destination": "BAGUM DC",
            "transit_time": "0.64"
        },
        {
            "origin": "BAGUIO DC",
            "destination": "CLS PL",
            "transit_time": "4.3"
        },
        {
            "origin": "BAGUM DC",
            "destination": "SILANGAN DC",
            "transit_time": "1.3"
        },
        {
            "origin": "BAGUM DC",
            "destination": "CNBC EXT",
            "transit_time": "2.3"
        },
        {
            "origin": "BAGUM DC",
            "destination": "RSVLT DC",
            "transit_time": "1.1"
        },
        {
            "origin": "BAGUM DC",
            "destination": "MEYC PL",
            "transit_time": "1.46"
        },
        {
            "origin": "BAGUM DC",
            "destination": "ANTI DC",
            "transit_time": "0.64"
        },
        {
            "origin": "BAGUM DC",
            "destination": "STAROSA PL",
            "transit_time": "1.27"
        },
        {
            "origin": "BAGUM DC",
            "destination": "CNL PL",
            "transit_time": "1.53"
        },
        {
            "origin": "BAGUM DC",
            "destination": "PQUE DC",
            "transit_time": "0.91"
        },
        {
            "origin": "BALANGA DC",
            "destination": "CENTRAL AUX",
            "transit_time": "1.82"
        },
        {
            "origin": "BALANGA DC",
            "destination": "MEYC PL",
            "transit_time": "3.06"
        },
        {
            "origin": "BALANGA DC",
            "destination": "SAN FER PL",
            "transit_time": "1.74"
        },
        {
            "origin": "BBC EXT",
            "destination": "SAN FER PL",
            "transit_time": "1.5"
        },
        {
            "origin": "BBC EXT",
            "destination": "MEYC PL",
            "transit_time": "0.13"
        },
        {
            "origin": "BTGS DC",
            "destination": "CNBC EXT",
            "transit_time": "1.25"
        },
        {
            "origin": "BTGS DC",
            "destination": "CNL PL",
            "transit_time": "1.34"
        },
        {
            "origin": "BTGS DC",
            "destination": "STAROSA PL",
            "transit_time": "1.37"
        },
        {
            "origin": "BTGS DC",
            "destination": "SILANGAN DC",
            "transit_time": "1.2"
        },
        {
            "origin": "BUTUAN DC",
            "destination": "MISAMIS PL",
            "transit_time": "4.77"
        },
        {
            "origin": "CAU EXT",
            "destination": "ISABELA DC",
            "transit_time": "0.17"
        },
        {
            "origin": "CAU EXT",
            "destination": "TUGUE DC",
            "transit_time": "2.76"
        },
        {
            "origin": "CAU EXT",
            "destination": "ILA PL",
            "transit_time": "1.02"
        },
        {
            "origin": "CENTRAL AUX",
            "destination": "SAN FER PL",
            "transit_time": "0.12"
        },
        {
            "origin": "CLS PL",
            "destination": "URDA DC",
            "transit_time": "1.31"
        },
        {
            "origin": "CLS PL",
            "destination": "CRLTN DC",
            "transit_time": "2.18"
        },
        {
            "origin": "CLS PL",
            "destination": "BAGUIO DC",
            "transit_time": "4.3"
        },
        {
            "origin": "CLS PL",
            "destination": "PINMA EXT",
            "transit_time": "0.63"
        },
        {
            "origin": "CNBC EXT",
            "destination": "DSMA DC",
            "transit_time": "1.3"
        },
        {
            "origin": "CNBC EXT",
            "destination": "LUCENA DC",
            "transit_time": "2.94"
        },
        {
            "origin": "CNBC EXT",
            "destination": "PQUE DC",
            "transit_time": "2.22"
        },
        {
            "origin": "CNBC EXT",
            "destination": "SAN FER PL",
            "transit_time": "9.7"
        },
        {
            "origin": "CNBC EXT",
            "destination": "RSVLT DC",
            "transit_time": "2.5"
        },
        {
            "origin": "CNBC EXT",
            "destination": "CNL PL",
            "transit_time": "0.47"
        },
        {
            "origin": "CNBC EXT",
            "destination": "STAROSA PL",
            "transit_time": "0.55"
        },
        {
            "origin": "CNBC EXT",
            "destination": "LIPA DC",
            "transit_time": "1.03"
        },
        {
            "origin": "CNBC EXT",
            "destination": "MEYC PL",
            "transit_time": "1.7"
        },
        {
            "origin": "CNBC EXT",
            "destination": "BAGUM DC",
            "transit_time": "2.3"
        },
        {
            "origin": "CNBC EXT",
            "destination": "SMY PL",
            "transit_time": "0.34"
        },
        {
            "origin": "CNBC EXT",
            "destination": "BTGS DC",
            "transit_time": "1.25"
        },
        {
            "origin": "CNL PL",
            "destination": "MNL DC",
            "transit_time": "1.36"
        },
        {
            "origin": "CNL PL",
            "destination": "MLBN DC",
            "transit_time": "1.87"
        },
        {
            "origin": "CNL PL",
            "destination": "SMY PL",
            "transit_time": "0.04"
        },
        {
            "origin": "CNL PL",
            "destination": "DSMA DC",
            "transit_time": "0.99"
        },
        {
            "origin": "CNL PL",
            "destination": "SILANGAN DC",
            "transit_time": "0.02"
        },
        {
            "origin": "CNL PL",
            "destination": "BAGUM DC",
            "transit_time": "1.53"
        },
        {
            "origin": "CNL PL",
            "destination": "IMUS PL",
            "transit_time": "1.5"
        },
        {
            "origin": "CNL PL",
            "destination": "MEYC PL",
            "transit_time": "2.11"
        },
        {
            "origin": "CNL PL",
            "destination": "PQUE DC",
            "transit_time": "0.87"
        },
        {
            "origin": "CNL PL",
            "destination": "ANTI DC",
            "transit_time": "1.76"
        },
        {
            "origin": "CNL PL",
            "destination": "TANZA DC",
            "transit_time": "2.08"
        },
        {
            "origin": "CNL PL",
            "destination": "STAROSA PL",
            "transit_time": "0.32"
        },
        {
            "origin": "CNL PL",
            "destination": "LUCENA DC",
            "transit_time": "2.92"
        },
        {
            "origin": "CNL PL",
            "destination": "PINMA EXT",
            "transit_time": "6.86"
        },
        {
            "origin": "CNL PL",
            "destination": "CNBC EXT",
            "transit_time": "0.47"
        },
        {
            "origin": "CNL PL",
            "destination": "RSVLT DC",
            "transit_time": "1.7"
        },
        {
            "origin": "CNL PL",
            "destination": "BTGS DC",
            "transit_time": "1.34"
        },
        {
            "origin": "CNL PL",
            "destination": "LIPA DC",
            "transit_time": "0.96"
        },
        {
            "origin": "CRLTN DC",
            "destination": "CLS PL",
            "transit_time": "2.18"
        },
        {
            "origin": "DSMA DC",
            "destination": "LIPA DC",
            "transit_time": "4.3"
        },
        {
            "origin": "DSMA DC",
            "destination": "PQUE DC",
            "transit_time": "0.86"
        },
        {
            "origin": "DSMA DC",
            "destination": "CNL PL",
            "transit_time": "0.99"
        },
        {
            "origin": "DSMA DC",
            "destination": "SILANGAN DC",
            "transit_time": "1.4"
        },
        {
            "origin": "DSMA DC",
            "destination": "TANZA DC",
            "transit_time": "1.43"
        },
        {
            "origin": "DSMA DC",
            "destination": "CNBC EXT",
            "transit_time": "1.3"
        },
        {
            "origin": "DSMA DC",
            "destination": "SMY PL",
            "transit_time": "1.1"
        },
        {
            "origin": "DSMA DC",
            "destination": "STAROSA PL",
            "transit_time": "0.75"
        },
        {
            "origin": "DSMA DC",
            "destination": "MEYC PL",
            "transit_time": "2.63"
        },
        {
            "origin": "DVO 1 PL",
            "destination": "GENSAN DC",
            "transit_time": "5.26"
        },
        {
            "origin": "DVO 1 PL",
            "destination": "DVO DC",
            "transit_time": "0.19"
        },
        {
            "origin": "DVO 1 PL",
            "destination": "TAGUM DC",
            "transit_time": "3.39"
        },
        {
            "origin": "DVO 1 PL",
            "destination": "ULAS EXT",
            "transit_time": "0.18"
        },
        {
            "origin": "DVO 1 PL",
            "destination": "DVO 2 PL",
            "transit_time": "0.88"
        },
        {
            "origin": "DVO 2 PL",
            "destination": "ULAS EXT",
            "transit_time": "0.94"
        },
        {
            "origin": "DVO 2 PL",
            "destination": "TAGUM DC",
            "transit_time": "4.41"
        },
        {
            "origin": "DVO 2 PL",
            "destination": "DVO DC",
            "transit_time": "0.8"
        },
        {
            "origin": "DVO 2 PL",
            "destination": "DVO 1 PL",
            "transit_time": "0.88"
        },
        {
            "origin": "DVO 2 PL",
            "destination": "GENSAN DC",
            "transit_time": "4.62"
        },
        {
            "origin": "DVO DC",
            "destination": "ULAS EXT",
            "transit_time": "0.28"
        },
        {
            "origin": "DVO DC",
            "destination": "DVO 1 PL",
            "transit_time": "0.19"
        },
        {
            "origin": "DVO DC",
            "destination": "GENSAN DC",
            "transit_time": "5.36"
        },
        {
            "origin": "DVO DC",
            "destination": "DVO 2 PL",
            "transit_time": "0.8"
        },
        {
            "origin": "DVO DC",
            "destination": "TAGUM DC",
            "transit_time": "3.3"
        },
        {
            "origin": "GENSAN DC",
            "destination": "ULAS EXT",
            "transit_time": "3.6"
        },
        {
            "origin": "GENSAN DC",
            "destination": "DVO 1 PL",
            "transit_time": "5.26"
        },
        {
            "origin": "GENSAN DC",
            "destination": "DVO 2 PL",
            "transit_time": "4.62"
        },
        {
            "origin": "GENSAN DC",
            "destination": "DVO DC",
            "transit_time": "5.36"
        },
        {
            "origin": "ILA PL",
            "destination": "TUGUE DC",
            "transit_time": "2.43"
        },
        {
            "origin": "ILA PL",
            "destination": "SOLANO DC",
            "transit_time": "5.6"
        },
        {
            "origin": "ILA PL",
            "destination": "ISABELA DC",
            "transit_time": "1.29"
        },
        {
            "origin": "ILA PL",
            "destination": "CAU EXT",
            "transit_time": "1.02"
        },
        {
            "origin": "ILIGAN DC",
            "destination": "MISAMIS PL",
            "transit_time": "3.74"
        },
        {
            "origin": "IMUS PL",
            "destination": "CNL PL",
            "transit_time": "1.5"
        },
        {
            "origin": "IMUS PL",
            "destination": "STAROSA PL",
            "transit_time": "1.31"
        },
        {
            "origin": "ISABELA DC",
            "destination": "CAU EXT",
            "transit_time": "0.17"
        },
        {
            "origin": "ISABELA DC",
            "destination": "SOLANO DC",
            "transit_time": "3.5"
        },
        {
            "origin": "ISABELA DC",
            "destination": "ILA PL",
            "transit_time": "1.29"
        },
        {
            "origin": "LIPA DC",
            "destination": "CNL PL",
            "transit_time": "0.96"
        },
        {
            "origin": "LIPA DC",
            "destination": "CNBC EXT",
            "transit_time": "1.03"
        },
        {
            "origin": "LIPA DC",
            "destination": "DSMA DC",
            "transit_time": "4.3"
        },
        {
            "origin": "LIPA DC",
            "destination": "STAROSA PL",
            "transit_time": "1.12"
        },
        {
            "origin": "LIPA DC",
            "destination": "SILANGAN DC",
            "transit_time": "0.8"
        },
        {
            "origin": "LUCENA DC",
            "destination": "STAROSA PL",
            "transit_time": "2.75"
        },
        {
            "origin": "LUCENA DC",
            "destination": "CNBC EXT",
            "transit_time": "2.94"
        },
        {
            "origin": "LUCENA DC",
            "destination": "MEYC PL",
            "transit_time": "8.15"
        },
        {
            "origin": "LUCENA DC",
            "destination": "SMY PL",
            "transit_time": "2.8"
        },
        {
            "origin": "LUCENA DC",
            "destination": "SILANGAN DC",
            "transit_time": "2.5"
        },
        {
            "origin": "LUCENA DC",
            "destination": "CNL PL",
            "transit_time": "2.92"
        },
        {
            "origin": "MEYC PL",
            "destination": "BBC EXT",
            "transit_time": "0.13"
        },
        {
            "origin": "MEYC PL",
            "destination": "DSMA DC",
            "transit_time": "2.63"
        },
        {
            "origin": "MEYC PL",
            "destination": "SILANGAN DC",
            "transit_time": "2.7"
        },
        {
            "origin": "MEYC PL",
            "destination": "RSVLT DC",
            "transit_time": "1.13"
        },
        {
            "origin": "MEYC PL",
            "destination": "CNBC EXT",
            "transit_time": "1.7"
        },
        {
            "origin": "MEYC PL",
            "destination": "LUCENA DC",
            "transit_time": "8.15"
        },
        {
            "origin": "MEYC PL",
            "destination": "NUEVA DC",
            "transit_time": "5.25"
        },
        {
            "origin": "MEYC PL",
            "destination": "MNL DC",
            "transit_time": "1.04"
        },
        {
            "origin": "MEYC PL",
            "destination": "STAROSA PL",
            "transit_time": "2.39"
        },
        {
            "origin": "MEYC PL",
            "destination": "PAMPANGA DC",
            "transit_time": "1.53"
        },
        {
            "origin": "MEYC PL",
            "destination": "BALANGA DC",
            "transit_time": "3.06"
        },
        {
            "origin": "MEYC PL",
            "destination": "SAN FER PL",
            "transit_time": "1.88"
        },
        {
            "origin": "MEYC PL",
            "destination": "TARLAC DC",
            "transit_time": "2.31"
        },
        {
            "origin": "MEYC PL",
            "destination": "PQUE DC",
            "transit_time": "1.97"
        },
        {
            "origin": "MEYC PL",
            "destination": "TANZA DC",
            "transit_time": "3.35"
        },
        {
            "origin": "MEYC PL",
            "destination": "CNL PL",
            "transit_time": "2.11"
        },
        {
            "origin": "MEYC PL",
            "destination": "BAGUM DC",
            "transit_time": "1.46"
        },
        {
            "origin": "MEYC PL",
            "destination": "ANTI DC",
            "transit_time": "1.46"
        },
        {
            "origin": "MEYC PL",
            "destination": "SMY PL",
            "transit_time": "2.37"
        },
        {
            "origin": "MEYC PL",
            "destination": "MLBN DC",
            "transit_time": "1.06"
        },
        {
            "origin": "MEYC PL",
            "destination": "TOLL SF 1 PL",
            "transit_time": "1.98"
        },
        {
            "origin": "MEYC PL",
            "destination": "SUBIC DC",
            "transit_time": "3.6"
        },
        {
            "origin": "MISAMIS PL",
            "destination": "ILIGAN DC",
            "transit_time": "3.74"
        },
        {
            "origin": "MISAMIS PL",
            "destination": "BUTUAN DC",
            "transit_time": "4.77"
        },
        {
            "origin": "MLBN DC",
            "destination": "MEYC PL",
            "transit_time": "1.06"
        },
        {
            "origin": "MLBN DC",
            "destination": "PQUE DC",
            "transit_time": "2.1"
        },
        {
            "origin": "MLBN DC",
            "destination": "TOLL SF 1 PL",
            "transit_time": "2.1"
        },
        {
            "origin": "MLBN DC",
            "destination": "CNL PL",
            "transit_time": "1.87"
        },
        {
            "origin": "MLBN DC",
            "destination": "STAROSA PL",
            "transit_time": "1.87"
        },
        {
            "origin": "MLLS DC",
            "destination": "STAROSA PL",
            "transit_time": "2.1"
        },
        {
            "origin": "MNL DC",
            "destination": "CNL PL",
            "transit_time": "1.36"
        },
        {
            "origin": "MNL DC",
            "destination": "STAROSA PL",
            "transit_time": "1.06"
        },
        {
            "origin": "MNL DC",
            "destination": "MEYC PL",
            "transit_time": "1.04"
        },
        {
            "origin": "NUEVA DC",
            "destination": "SAN FER PL",
            "transit_time": "3.04"
        },
        {
            "origin": "NUEVA DC",
            "destination": "CENTRAL AUX",
            "transit_time": "3.11"
        },
        {
            "origin": "NUEVA DC",
            "destination": "MEYC PL",
            "transit_time": "5.25"
        },
        {
            "origin": "ORMOC DC",
            "destination": "TAC PL",
            "transit_time": "3.54"
        },
        {
            "origin": "PAMPANGA DC",
            "destination": "MEYC PL",
            "transit_time": "1.53"
        },
        {
            "origin": "PAMPANGA DC",
            "destination": "SAN FER PL",
            "transit_time": "0.25"
        },
        {
            "origin": "PAMPANGA DC",
            "destination": "STAROSA PL",
            "transit_time": "3.06"
        },
        {
            "origin": "PAMPANGA DC",
            "destination": "CENTRAL AUX",
            "transit_time": "0.1"
        },
        {
            "origin": "PAMPANGA DC",
            "destination": "TOLL SF 1 PL",
            "transit_time": "0.17"
        },
        {
            "origin": "PINMA EXT",
            "destination": "CNL PL",
            "transit_time": "6.86"
        },
        {
            "origin": "PINMA EXT",
            "destination": "URDA DC",
            "transit_time": "0.56"
        },
        {
            "origin": "PINMA EXT",
            "destination": "CLS PL",
            "transit_time": "0.63"
        },
        {
            "origin": "PINMA EXT",
            "destination": "CRLTN DC",
            "transit_time": "2.31"
        },
        {
            "origin": "PQUE DC",
            "destination": "DSMA DC",
            "transit_time": "0.86"
        },
        {
            "origin": "PQUE DC",
            "destination": "CNL PL",
            "transit_time": "0.87"
        },
        {
            "origin": "PQUE DC",
            "destination": "RSVLT DC",
            "transit_time": "1.01"
        },
        {
            "origin": "PQUE DC",
            "destination": "ANTI DC",
            "transit_time": "1.14"
        },
        {
            "origin": "PQUE DC",
            "destination": "STAROSA PL",
            "transit_time": "0.73"
        },
        {
            "origin": "PQUE DC",
            "destination": "SILANGAN DC",
            "transit_time": "1.13"
        },
        {
            "origin": "PQUE DC",
            "destination": "BAGUM DC",
            "transit_time": "0.91"
        },
        {
            "origin": "PQUE DC",
            "destination": "MEYC PL",
            "transit_time": "1.97"
        },
        {
            "origin": "PQUE DC",
            "destination": "LUCENA DC",
            "transit_time": "3.5"
        },
        {
            "origin": "PQUE DC",
            "destination": "SAN FER PL",
            "transit_time": "3.2"
        },
        {
            "origin": "PQUE DC",
            "destination": "MLBN DC",
            "transit_time": "2.1"
        },
        {
            "origin": "RSVLT DC",
            "destination": "BAGUM DC",
            "transit_time": "1.1"
        },
        {
            "origin": "RSVLT DC",
            "destination": "PQUE DC",
            "transit_time": "1.01"
        },
        {
            "origin": "RSVLT DC",
            "destination": "MEYC PL",
            "transit_time": "1.13"
        },
        {
            "origin": "RSVLT DC",
            "destination": "CNL PL",
            "transit_time": "1.7"
        },
        {
            "origin": "RSVLT DC",
            "destination": "STAROSA PL",
            "transit_time": "1.42"
        },
        {
            "origin": "RSVLT DC",
            "destination": "TOLL SF 1 PL",
            "transit_time": "3.5"
        },
        {
            "origin": "RSVLT DC",
            "destination": "ANTI DC",
            "transit_time": "0.9"
        },
        {
            "origin": "SAN FER PL",
            "destination": "BALANGA DC",
            "transit_time": "1.74"
        },
        {
            "origin": "SAN FER PL",
            "destination": "TARLAC DC",
            "transit_time": "1.96"
        },
        {
            "origin": "SAN FER PL",
            "destination": "SUBIC DC",
            "transit_time": "2.27"
        },
        {
            "origin": "SAN FER PL",
            "destination": "TLVR EXT",
            "transit_time": "2.9"
        },
        {
            "origin": "SAN FER PL",
            "destination": "PAMPANGA DC",
            "transit_time": "0.25"
        },
        {
            "origin": "SAN FER PL",
            "destination": "STAROSA PL",
            "transit_time": "2.8"
        },
        {
            "origin": "SAN FER PL",
            "destination": "CENTRAL AUX",
            "transit_time": "0.12"
        },
        {
            "origin": "SAN FER PL",
            "destination": "PQUE DC",
            "transit_time": "3.2"
        },
        {
            "origin": "SAN FER PL",
            "destination": "TOLL SF 1 PL",
            "transit_time": "0.51"
        },
        {
            "origin": "SAN FER PL",
            "destination": "NUEVA DC",
            "transit_time": "3.04"
        },
        {
            "origin": "SAN FER PL",
            "destination": "CNBC EXT",
            "transit_time": "9.7"
        },
        {
            "origin": "SAN FER PL",
            "destination": "MEYC PL",
            "transit_time": "1.88"
        },
        {
            "origin": "SAN FER PL",
            "destination": "BBC EXT",
            "transit_time": "1.5"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "MEYC PL",
            "transit_time": "2.7"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "BTGS DC",
            "transit_time": "1.2"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "PQUE DC",
            "transit_time": "1.13"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "SMY PL",
            "transit_time": "0.04"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "STAROSA PL",
            "transit_time": "0.33"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "LIPA DC",
            "transit_time": "0.8"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "LUCENA DC",
            "transit_time": "2.5"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "ANTI DC",
            "transit_time": "1.6"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "BAGUM DC",
            "transit_time": "1.3"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "DSMA DC",
            "transit_time": "1.4"
        },
        {
            "origin": "SILANGAN DC",
            "destination": "CNL PL",
            "transit_time": "0.02"
        },
        {
            "origin": "SMY PL",
            "destination": "MEYC PL",
            "transit_time": "2.37"
        },
        {
            "origin": "SMY PL",
            "destination": "CNBC EXT",
            "transit_time": "0.34"
        },
        {
            "origin": "SMY PL",
            "destination": "STAROSA PL",
            "transit_time": "0.53"
        },
        {
            "origin": "SMY PL",
            "destination": "CNL PL",
            "transit_time": "0.04"
        },
        {
            "origin": "SOLANO DC",
            "destination": "ILA PL",
            "transit_time": "5.6"
        },
        {
            "origin": "SOLANO DC",
            "destination": "ISABELA DC",
            "transit_time": "3.5"
        },
        {
            "origin": "STAROSA PL",
            "destination": "SILANGAN DC",
            "transit_time": "0.33"
        },
        {
            "origin": "STAROSA PL",
            "destination": "MNL DC",
            "transit_time": "1.06"
        },
        {
            "origin": "STAROSA PL",
            "destination": "MEYC PL",
            "transit_time": "2.39"
        },
        {
            "origin": "STAROSA PL",
            "destination": "MLBN DC",
            "transit_time": "1.87"
        },
        {
            "origin": "STAROSA PL",
            "destination": "LIPA DC",
            "transit_time": "1.12"
        },
        {
            "origin": "STAROSA PL",
            "destination": "RSVLT DC",
            "transit_time": "1.42"
        },
        {
            "origin": "STAROSA PL",
            "destination": "SMY PL",
            "transit_time": "0.53"
        },
        {
            "origin": "STAROSA PL",
            "destination": "CNL PL",
            "transit_time": "0.32"
        },
        {
            "origin": "STAROSA PL",
            "destination": "PAMPANGA DC",
            "transit_time": "3.06"
        },
        {
            "origin": "STAROSA PL",
            "destination": "TANZA DC",
            "transit_time": "1.79"
        },
        {
            "origin": "STAROSA PL",
            "destination": "LUCENA DC",
            "transit_time": "2.75"
        },
        {
            "origin": "STAROSA PL",
            "destination": "SAN FER PL",
            "transit_time": "2.8"
        },
        {
            "origin": "STAROSA PL",
            "destination": "TOLL PUREBEV PL",
            "transit_time": "1"
        },
        {
            "origin": "STAROSA PL",
            "destination": "PQUE DC",
            "transit_time": "0.73"
        },
        {
            "origin": "STAROSA PL",
            "destination": "BTGS DC",
            "transit_time": "1.37"
        },
        {
            "origin": "STAROSA PL",
            "destination": "ANTI DC",
            "transit_time": "1.43"
        },
        {
            "origin": "STAROSA PL",
            "destination": "TOLL SF 1 PL",
            "transit_time": "3.2"
        },
        {
            "origin": "STAROSA PL",
            "destination": "BAGUM DC",
            "transit_time": "1.27"
        },
        {
            "origin": "STAROSA PL",
            "destination": "DSMA DC",
            "transit_time": "0.75"
        },
        {
            "origin": "STAROSA PL",
            "destination": "IMUS PL",
            "transit_time": "1.31"
        },
        {
            "origin": "STAROSA PL",
            "destination": "CNBC EXT",
            "transit_time": "0.55"
        },
        {
            "origin": "STAROSA PL",
            "destination": "MLLS DC",
            "transit_time": "2.1"
        },
        {
            "origin": "SUBIC DC",
            "destination": "SAN FER PL",
            "transit_time": "2.27"
        },
        {
            "origin": "SUBIC DC",
            "destination": "MEYC PL",
            "transit_time": "3.6"
        },
        {
            "origin": "SUBIC DC",
            "destination": "CENTRAL AUX",
            "transit_time": "2.43"
        },
        {
            "origin": "TAC PL",
            "destination": "ORMOC DC",
            "transit_time": "3.54"
        },
        {
            "origin": "TAGUM DC",
            "destination": "DVO 1 PL",
            "transit_time": "3.39"
        },
        {
            "origin": "TAGUM DC",
            "destination": "DVO DC",
            "transit_time": "3.3"
        },
        {
            "origin": "TAGUM DC",
            "destination": "ULAS EXT",
            "transit_time": "2.94"
        },
        {
            "origin": "TAGUM DC",
            "destination": "DVO 2 PL",
            "transit_time": "4.41"
        },
        {
            "origin": "TANZA DC",
            "destination": "STAROSA PL",
            "transit_time": "1.79"
        },
        {
            "origin": "TANZA DC",
            "destination": "DSMA DC",
            "transit_time": "1.43"
        },
        {
            "origin": "TANZA DC",
            "destination": "CNBC EXT",
            "transit_time": "2.9"
        },
        {
            "origin": "TANZA DC",
            "destination": "MEYC PL",
            "transit_time": "3.35"
        },
        {
            "origin": "TANZA DC",
            "destination": "CNL PL",
            "transit_time": "2.08"
        },
        {
            "origin": "TARLAC DC",
            "destination": "CENTRAL AUX",
            "transit_time": "1.77"
        },
        {
            "origin": "TARLAC DC",
            "destination": "SAN FER PL",
            "transit_time": "1.96"
        },
        {
            "origin": "TARLAC DC",
            "destination": "MEYC PL",
            "transit_time": "2.31"
        },
        {
            "origin": "TLVR EXT",
            "destination": "SAN FER PL",
            "transit_time": "2.9"
        },
        {
            "origin": "TOLL PUREBEV PL",
            "destination": "STAROSA PL",
            "transit_time": "1"
        },
        {
            "origin": "TOLL PUREBEV PL",
            "destination": "DSMA DC",
            "transit_time": "0.2"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "PAMPANGA DC",
            "transit_time": "0.17"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "RSVLT DC",
            "transit_time": "3.5"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "ANTI DC",
            "transit_time": "2.3"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "MEYC PL",
            "transit_time": "1.98"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "SAN FER PL",
            "transit_time": "0.51"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "STAROSA PL",
            "transit_time": "3.2"
        },
        {
            "origin": "TOLL SF 1 PL",
            "destination": "MLBN DC",
            "transit_time": "2.1"
        },
        {
            "origin": "TUGUE DC",
            "destination": "ILA PL",
            "transit_time": "2.43"
        },
        {
            "origin": "TUGUE DC",
            "destination": "CAU EXT",
            "transit_time": "2.76"
        },
        {
            "origin": "ULAS EXT",
            "destination": "DVO 2 PL",
            "transit_time": "0.94"
        },
        {
            "origin": "ULAS EXT",
            "destination": "GENSAN DC",
            "transit_time": "3.6"
        },
        {
            "origin": "ULAS EXT",
            "destination": "DVO DC",
            "transit_time": "0.28"
        },
        {
            "origin": "ULAS EXT",
            "destination": "DVO 1 PL",
            "transit_time": "0.18"
        },
        {
            "origin": "URDA DC",
            "destination": "CLS PL",
            "transit_time": "1.31"
        },
        {
            "origin": "URDA DC",
            "destination": "PINMA EXT",
            "transit_time": "0.56"
        }
    ];

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("geofences").find({}).toArray().then(gDocs=> {
                updatedData.forEach(val => {
                    var originGeofence = gDocs.find(x => x.short_name == val.origin);
                    var destinationGeofence = gDocs.find(x => x.short_name == val.destination);
                    if(originGeofence && destinationGeofence){
                        var route = originGeofence.code + destinationGeofence.code;
                        // TEST
                        // testArr.push(route);
                        // PRODUCTION
                        childPromise.push(client.db(dbName).collection("routes").updateOne({_id:route},{$set:{transit_time: Number(val.transit_time)}}));
                    } else {
                        console.log("NONE", val);
                    }
                });
                // TEST
                // res.json(testArr);
                // PRODUCTION
                Promise.all(childPromise).then(result => { res.json(result); }).catch(error => { console.log("Error",error); res.json(error); });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


// update CICO
router.get('/test/update/cico', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];
    var updatedData = [
        {
            "code": "102",
            "cico": "2.5"
        },
        {
            "code": "153",
            "cico": "1.25"
        },
        {
            "code": "101",
            "cico": "1.62"
        },
        {
            "code": "139",
            "cico": "1.33"
        },
        {
            "code": "175",
            "cico": "1.87"
        },
        {
            "code": "142",
            "cico": "1.15"
        },
        {
            "code": "149",
            "cico": "2.07"
        },
        {
            "code": "251",
            "cico": "1.32"
        },
        {
            "code": "128",
            "cico": "3.12"
        },
        {
            "code": "152",
            "cico": "1.41"
        },
        {
            "code": "498",
            "cico": "2.52"
        },
        {
            "code": "179",
            "cico": "2.97"
        },
        {
            "code": "156",
            "cico": "2.14"
        },
        {
            "code": "176",
            "cico": "2.76"
        },
        {
            "code": "158",
            "cico": "1.16"
        },
        {
            "code": "130",
            "cico": "1.96"
        },
        {
            "code": "132",
            "cico": "2.19"
        },
        {
            "code": "112",
            "cico": "2.87"
        },
        {
            "code": "680",
            "cico": "2.68"
        },
        {
            "code": "113",
            "cico": "1.49"
        },
        {
            "code": "115",
            "cico": "3.44"
        },
        {
            "code": "148",
            "cico": "1.8"
        },
        {
            "code": "223",
            "cico": "1.63"
        },
        {
            "code": "138",
            "cico": "1.47"
        },
        {
            "code": "103",
            "cico": "3.20"
        },
        {
            "code": "100",
            "cico": "1.36"
        },
        {
            "code": "137",
            "cico": "2.32"
        },
        {
            "code": "134",
            "cico": "1.30"
        },
        {
            "code": "157",
            "cico": "1.36"
        },
        {
            "code": "106",
            "cico": "2.79"
        },
        {
            "code": "222",
            "cico": "2.61"
        },
        {
            "code": "167",
            "cico": "1.72"
        },
        {
            "code": "108",
            "cico": "1.05"
        },
        {
            "code": "151",
            "cico": "1.16"
        },
        {
            "code": "253",
            "cico": "2.54"
        },
        {
            "code": "159",
            "cico": "1.55"
        },
        {
            "code": "170",
            "cico": "2.09"
        }
    ];

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            updatedData.forEach(val => {
                childPromise.push(client.db(dbName).collection("geofences").updateOne({code:val.code},{$set:{cico: val.cico}}));
            });
            
            // TEST
            // res.json(childPromise.length);
            // PRODUCTION
            Promise.all(childPromise).then(result => { res.json(result); }).catch(error => { console.log("Error",error); res.json(error); });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// check ACP8861 from events
router.get('/test/check/events', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(`${dbName}-logging`).collection("events").find({USER_NAME:"ACP8861",GEOFENCE_NAME:"CLS PL"}).toArray().then(gDocs=> {
                var arr = [];

                gDocs.forEach(val => {
                    arr.push({
                        GEOFENCE_NAME: val.GEOFENCE_NAME,
                        RULE_NAME: val.RULE_NAME,
                        GEOFENCE_ID: val.GEOFENCE_ID,
                        stage: val.stage,
                        USER_NAME: val.USER_NAME,
                        USER_USERNAME: val.USER_USERNAME,
                        ASSIGNED_VEHICLE_ID: val.GEOASSIGNED_VEHICLE_IDFENCE_NAME,
                        Region: val.Region,
                        Cluster: val.Cluster,
                        Site: val.Site,
                        timestamp: val.timestamp,
                        Date: moment(new Date(val.timestamp)).format("MMM DD YYYY"),
                        Time: moment(new Date(val.timestamp)).format("hh:mm:ss A"),
                    });
                    										

                });
                res.json(arr);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

/******* IMPORT DATA FROM PROD TO DEV *******/
router.get('/test/import/prod_dev/:collection', (req,res,next)=>{
    var prodURL = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var devURL = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    const collection = req.params.collection;

    var dbName = "wm-wilcon";

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
                    prodClient.db(dbName).collection(collection).find({}).toArray().then(pDocs=> {
                        devClient.db(dbName).collection(collection).deleteMany({}).then(()=> {
                            devClient.db(dbName).collection(collection).insertMany(pDocs).then(dDocs=> {
                                res.json(dDocs);
                            });
                        });
                    });
                }
            });
        }
    });
});
/******* END IMPORT DATA FROM PROD TO DEV *******/

// insert drivers/checkers
var drivers_checkers = [
    {
        "vehicle_name": "WD CANTER 24 WPP 911",
        "driver": "Ryan Lobregito",
        "checker": "Gerardo Rivera"
    },
    {
        "vehicle_name": "WD 6WH68 JM9353",
        "driver": "Ernesto Alvarez",
        "checker": "Mark Gohetia"
    },
    {
        "vehicle_name": "WD FWD-R01 NEB3977",
        "driver": "Blandino Ytang",
        "checker": "Diosdado Lenares"
    },
    {
        "vehicle_name": "WD FWD-R03 NEB3206",
        "driver": "Ricky Regachuelo",
        "checker": "Nicolas Cadille",
        "helper": "Trabe Trajano"
    },
    {
        "vehicle_name": "WD FWD-R05 NEB3205",
        "driver": "Froilan Sotto",
        "checker": "Maximo Brazas",
        "helper": "Reymund Antonio"
    },
    {
        "vehicle_name": "WD FWD-R08 NEB3215",
        "driver": "Nenito Posadas",
        "checker": "Wilfredo Dela Rama"
    },
    {
        "vehicle_name": "WD FWD-R12 NEB3184",
        "driver": "Kevyn Merciales",
        "checker": "Rex Abongan",
        "helper": "Marcelo Santos"
    },
    {
        "vehicle_name": "WD FWD-R14 NEB3204",
        "driver": "Garry Estopare",
        "checker": "Gino Libres"
    },
    {
        "vehicle_name": "WD FWD-R15 NEB3196",
        "driver": "Roberto Cabigon",
        "checker": "Rolly Andaya"
    },
    {
        "vehicle_name": "WD FORWARD 17 NAV1166",
        "driver": "Jernieh Bahandi",
        "checker": "Mark Leo Delda"
    },
    {
        "vehicle_name": "WD FORWARD 19 NAV1167",
        "driver": "Rene Muyalde",
        "checker": "Roberto Rebolledo"
    },
    {
        "vehicle_name": "WD FORWARD 22 NAV1170",
        "driver": "Romeo Niepes",
        "checker": "Benidick Belo",
        "helper": "Junjun Antonio"
    },
    {
        "vehicle_name": "WD 10WH1 CRX 234",
        "driver": "Michael Cudiamat",
        "checker": "Alanver Calaguas"
    },
    {
        "vehicle_name": "WD 10WHLS-R02 NDT2548",
        "driver": "Edgar Tan",
        "checker": "Renato Bulang"
    },
    {
        "vehicle_name": "WD 10WH3 RBU 955",
        "driver": "Angelito Baloca",
        "checker": "Ruben Galay"
    },
    {
        "vehicle_name": "WD 10WH4 XLA 331",
        "driver": "David Amor",
        "checker": "Lito Torre"
    },
    {
        "vehicle_name": "WD 10WH7 RGE 270",
        "driver": "Christian Abellaneda",
        "checker": "Jomar Cruz"
    },
    {
        "vehicle_name": "WD 10WH8 RHG 977",
        "driver": "Vacant",
        "checker": "Michael Dano"
    },
    {
        "vehicle_name": "WD 10WH10 RHK 989",
        "driver": "Romil Culanculan",
        "checker": "Danilo Quirante"
    },
    {
        "vehicle_name": "WD 10WH11 RNK 958",
        "driver": "Teddy Piedad",
        "checker": "Greg Arigadas"
    },
    {
        "vehicle_name": "WD 10WH12 WIV 402",
        "driver": "Teodoro Cais",
        "checker": "Ruel Gargar"
    },
    {
        "vehicle_name": "WD 10WH15 AAR1053",
        "driver": "Vacant",
        "checker": "Matthew Sarmiento"
    },
    {
        "vehicle_name": "WD 10WH16 AAR1522",
        "driver": "Jezreel Ygay",
        "checker": "Neil Lim"
    },
    {
        "vehicle_name": "WD 10WH17 AAR1522",
        "driver": "Arman Alisna",
        "checker": "Miguel Gubalane"
    },
    {
        "vehicle_name": "WD 14WH6 AMA1582",
        "driver": "Gilbert Abejuela",
        "checker": "Alden Tan"
    },
    {
        "vehicle_name": "WD 14WH7 AWA4354",
        "driver": "Ervin Requillas",
        "checker": "Jeffrey Cimafranca"
    },
    {
        "vehicle_name": "WD 14WH8 NDX6566",
        "driver": "Romer Cardenas",
        "checker": "Charles Pelayo"
    },
    {
        "vehicle_name": "WD 14WH9 NDX6565",
        "driver": "Mark Cometeja",
        "checker": "Mark Pacistol"
    },
    {
        "vehicle_name": "WD 14WH10 NDY4993",
        "driver": "Jerry Melecotones",
        "checker": "Antonio Ortiz"
    },
    {
        "vehicle_name": "WD 14WH11 NDY7301",
        "driver": "Eduardo Caberto",
        "checker": "Niener Garcia"
    },
    {
        "vehicle_name": "WD 14WH12 NDB4344",
        "driver": "Felix Maramag",
        "checker": "Joel Delantar"
    },
    {
        "vehicle_name": "WD 14WH14 NDB4345",
        "driver": "Allan Banayag",
        "checker": "Ervin Eulin"
    },
    {
        "vehicle_name": "WD 14WH15 APA4815",
        "driver": "Marlon Galay",
        "checker": "Jaypee Sillar",
        "helper": "Ronnel Quimno"
    },
    {
        "vehicle_name": "WD 14WH16 NDQ1034",
        "driver": "Mark Ranil Belegano",
        "checker": "Edward Bañega"
    },
    {
        "vehicle_name": "WD 14WH17 NDQ1036",
        "driver": "Carlito Cruz",
        "checker": "Rommel Opistan"
    },
    {
        "vehicle_name": "WD 14WH19 NDQ1037",
        "driver": "Wilfredo Ohao",
        "checker": "Jomar Harayo"
    },
    {
        "vehicle_name": "WD 14WH20 NDQ1041",
        "driver": "Ronelo De Guzman",
        "checker": "Jay Bulusan"
    },
    {
        "vehicle_name": "WD TRAILER 5 PQD 223",
        "driver": "Arman Villadelgado",
        "checker": ""
    },
    {
        "vehicle_name": "WD TRAILER 6 PQD 251",
        "driver": "Ryan Palinquez",
        "checker": "Cezar John Berber",
        "helper": "Regiel Lobendino"
    },
    {
        "vehicle_name": "WD TRAILER 11 RMD 624",
        "driver": "Allan Badilla",
        "checker": "Robert Ortega"
    },
    {
        "vehicle_name": "WD TRAILER 16 WAQ 120",
        "driver": "Elmer Pagaduan",
        "checker": "Marlie Leynes"
    },
    {
        "vehicle_name": "WD TRAILER 17 WAQ 110",
        "driver": "Ronie Baclado",
        "checker": "Carl Cuevas"
    },
    {
        "vehicle_name": "WD TRAILER 20 AAI7861",
        "driver": "William Gerero",
        "checker": "Ever Bayoca"
    },
    {
        "vehicle_name": "WD TRAILER 23 AQA5951",
        "driver": "Alfredo Mallari",
        "checker": "Florante Oriendo"
    },
    {
        "vehicle_name": "WD TRAILER 26 ABS6141",
        "driver": "Eduardo Anescal",
        "checker": "Jesril Noynay"
    },
    {
        "vehicle_name": "WD TRAILER 27 ABS6142",
        "driver": "Joam Añite",
        "checker": "Christopher Balisa"
    },
    {
        "vehicle_name": "WD TRAILER 30 ABS6145",
        "driver": "Antonio Fajardo",
        "checker": "Robert Coral"
    },
    {
        "vehicle_name": "WD TH-31 NAD7688",
        "driver": "Allan Epil",
        "checker": "Michael Hagunos"
    },
    {
        "vehicle_name": "WD TH-33 NAV6866",
        "driver": "",
        "checker": ""
    },
    {
        "vehicle_name": "WD TH-34 ",
        "driver": "Richard Aguillon",
        "checker": "Chandy Sacal"
    },
    {
        "vehicle_name": "WD THH03 ",
        "driver": "Levie Sayson",
        "checker": "Roldan Jorda"
    },
    {
        "vehicle_name": "WD TH-42 NBG8430",
        "driver": "Renato Capinig",
        "checker": "Jason Curiba"
    },
    {
        "vehicle_name": "WD TH-45 NBG8429",
        "driver": "Rey Doniza Hobayan",
        "checker": "Larry Catalino"
    },
    {
        "vehicle_name": "WD TH-49 NBG8433",
        "driver": "Michael Morgado",
        "checker": "Rolando Ducay"
    },
    {
        "vehicle_name": "WD TH-50 NBO8521",
        "driver": "Logen Balawang",
        "checker": "Diony Fragata"
    },
    {
        "vehicle_name": "WD TH-51 NBO8519",
        "driver": "Juan Camacho",
        "checker": "Pedro Tuando"
    },
    {
        "vehicle_name": "WD TH-53 NBO8525",
        "driver": "Geramel Bacud",
        "checker": "Rogelio Panuga"
    },
    {
        "vehicle_name": "WD TH-61 NDQ1046",
        "driver": "Arnel Lacsa",
        "checker": "Alexander Nicol"
    },
    {
        "vehicle_name": "WD TH-62 NDQ1048",
        "driver": "Amos Narciso",
        "checker": "Rex Labra"
    },
    {
        "vehicle_name": "WD TH-64 NDQ1045",
        "driver": "Gregorio Dela Cruz",
        "checker": "Jonathan Eula"
    },
    {
        "vehicle_name": "WD THH-15 NDD1130",
        "driver": "Rodel Poral",
        "checker": "Lloyd Antonio"
    },
    {
        "vehicle_name": "WD THH-17 NCY9160",
        "driver": "Albert Abellana",
        "checker": "Raldy Binayug"
    },
    {
        "vehicle_name": "WD METH02 NAW8164",
        "driver": "Arnold Panganiban",
        "checker": "Jovito Pacheco"
    },
    {
        "vehicle_name": "WD METH03 NAW8165",
        "driver": "Rogelio Cortez",
        "checker": "Joseph Cruz"
    },
    {
        "vehicle_name": "WD METH04 NAX9293",
        "driver": "Jerry Beato",
        "checker": "Roberto Aguilar"
    },
    {
        "vehicle_name": "WD METH05 NAX9291",
        "driver": "Knorr Constantino",
        "checker": "Dennis De Leon"
    },
    {
        "vehicle_name": "WD METH08 NAX9292",
        "driver": "Mike Tabornal",
        "checker": "James Naldo"
    },
    {
        "vehicle_name": "WD CANTER 62 TIF 584",
        "driver": "Jemes Pep Empasis",
        "checker": "Eddie Perillo"
    },
    {
        "vehicle_name": "WD 4WHLS-121 NBO8535",
        "driver": "Sherwin Soriano",
        "checker": "Janie Belanizo"
    },
    {
        "vehicle_name": "WD 4WHLS-129 NDI3037",
        "driver": "Norlando Munda",
        "checker": "Primitivo Taganna",
        "helper": "Gary Sentillas"
    },
    {
        "vehicle_name": "WD 6WH58 NBT8122",
        "driver": "Marino Lagada",
        "checker": "Joey Teraza"
    },
    {
        "vehicle_name": "WD 6WH61 NBT7890",
        "driver": "Jason Buena",
        "checker": "Sean Segara",
        "helper": "Reynaldo Salor"
    },
    {
        "vehicle_name": "WD 6WH64 JM9120",
        "driver": "Anthony Arabejo",
        "checker": "Reggie Salen"
    },
    {
        "vehicle_name": "WD FWD-R02 NEB3186",
        "driver": "Jomar Rodriguez",
        "checker": "Jerome Gomez"
    },
    {
        "vehicle_name": "WD FWD-R06 NEB3207",
        "driver": "Junjun Montoy",
        "checker": "Pjay Junio",
        "helper": "Jefferson Zonio"
    },
    {
        "vehicle_name": "WD FWD-R11 NEB3187",
        "driver": "Randy Madrid",
        "checker": "Rolan Pereira",
        "helper": "Jervin Magan"
    },
    {
        "vehicle_name": "WD 10W-6 ",
        "driver": "Laurencio Lusung",
        "checker": "Ryan Gregorio"
    },
    {
        "vehicle_name": "WD 14W-2 ",
        "driver": "Nicky Perez",
        "checker": "Julius Ramintas"
    },
    {
        "vehicle_name": "WD 14W1 ",
        "driver": "Gleen Merced",
        "checker": "Carl Max Cortaga"
    },
    {
        "vehicle_name": "WD FW-11 ",
        "driver": "Julius Vasquez",
        "checker": "Moises Sanchez"
    },
    {
        "vehicle_name": "WD FW-12 ",
        "checker": "Julio Davocol"
    },
    {
        "vehicle_name": "WD FW-02 "
    }
];
router.get('/test/insert/driverchecker', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(`${dbName}`).collection("vehicles").find({}).toArray().then(vDocs=> {
                var insertArr = [];
                var noneArr = [];
                drivers_checkers.forEach(val => {
                    var vehicle = vDocs.find(x => x.name == val.vehicle_name);
                    if(vehicle){
                        // if(val.driver){
                        //     insertArr.push({
                        //         name: val.driver,
                        //         occupation: "Driver",
                        //         vehicle_id: vehicle._id
                        //     });
                        // }
                        // if(val.checker){
                        //     insertArr.push({
                        //         name: val.checker,
                        //         occupation: "Checker",
                        //         vehicle_id: vehicle._id
                        //     });
                        // }
                        // if(val.helper){
                        //     insertArr.push({
                        //         name: val.helper,
                        //         occupation: "Helper",
                        //         vehicle_id: vehicle._id
                        //     });
                        // }
                    } else {
                        if(val.driver){
                            insertArr.push({
                                name: val.driver,
                                occupation: "Driver",
                                // vehicle_id: vehicle._id
                            });
                        }
                        if(val.checker){
                            insertArr.push({
                                name: val.checker,
                                occupation: "Checker",
                                // vehicle_id: vehicle._id
                            });
                        }
                        if(val.helper){
                            insertArr.push({
                                name: val.helper,
                                occupation: "Helper",
                                // vehicle_id: vehicle._id
                            });
                        }
                        noneArr.push(val.vehicle_name);
                    }
                });
                client.db(`${dbName}`).collection("vehicle_personnel").insertMany(insertArr,{ ordered: false }).then(docs=> {
                    res.json({length:insertArr.length,noneArr,docs});
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/add/ula', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(`${dbName}`).collection("sessions").find({}).toArray().then(vDocs=> {
                var insertArr = [];
                vDocs.forEach(val => {
                    val.device_info = val.device_info || {};
                    val.device_info.metadata = val.device_info.metadata || {};
                    var metadata = val.device_info.metadata;
                    insertArr.push({
                        _id: val._id,
                        username: val.username,
                        login_date: val.timestamp,
                        location: `${metadata.city||""}, ${metadata.region||""}, ${metadata.country||""}`,
                        ip: metadata.ip,
                    });
                });
                client.db(`${dbName}`).collection("user_login_activity").insertMany(insertArr,{ ordered: false }).then(docs=> {
                    res.json({length:insertArr.length,docs});
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/get/dispatch', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(`${dbName}`).collection("dispatch").find({
                $or: [
                    {  
                        $and: [
                            {
                                posting_date: {
                                    $gte: "2021-03-19T16:00:00.000Z",
                                    $lt: "2021-03-20T15:59:59.999Z",
                                }
                            },
                            {
                                status: {$nin:["plan","scheduled"]}
                            }
                        ]
                    },
                    {
                        $and: [
                            {
                                scheduled_date: {
                                    $gte: "2021-03-19T16:00:00.000Z",
                                    $lt: "2021-03-20T15:59:59.999Z",
                                }
                            },
                            {
                                status: {$nin:["plan","scheduled"]}
                            }
                        ]
                    },
                    {
                        status: "in_transit"
                    }
                ],
            }).toArray().then(gDocs=> {
               res.json(gDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


router.get('/test/update/dispatch/:skip/:limit', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    
    var dbName = "wd-wilcon";

    var sortObject = o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var childPromise = [];
            var ids = [];
            client.db(dbName).collection("dispatch").find({}).skip(skip).limit(limit).toArray().then(docs=> {
                docs.forEach(val => {
                    var event_time = val.event_time || {};
                    var events_captured = val.events_captured || {};
                    
                    Object.keys(event_time).forEach(key => {
                        events_captured[new Date(event_time[key]).getTime()] = key;
                    });
                    var sorted = sortObject(events_captured);
                    ids.push(val._id);
                    childPromise.push(client.db(dbName).collection("dispatch").updateOne({_id:val._id},{$set:{
                        events_captured: sorted
                    }}));
                });
                Promise.all(childPromise).then(result => { res.json({ok:1}); }).catch(error => { console.log("Error",error); res.json(error); });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// 12:25 PM
router.get('/test/update/dispatch_stat/:_id/:save/:le', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    const save = req.params.save || false;
    const _id = req.params._id;
    const le = req.params.le;
    
    var dbName = "wd-wilcon";

    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var childPromise = [];
            var ids = [];
            var __events_captured = {};
            var gStat = "assigned";
            var posting_date ;
            var shouldBeLateEntry = true ;
            

            var departure_date,etd,eta,history;

            client.db(dbName).collection("geofences").find({}).toArray().then(gDocs=> {
                client.db(dbName).collection("routes").find({}).toArray().then(rDocs=> {
                    client.db(dbName).collection("dispatch").find({_id: _id}).toArray().then(docs=> {
                        docs.forEach(val => {
                            posting_date = val.posting_date;
                            var vehicleData = events.filter(x => x.ASSIGNED_VEHICLE_ID.toString() == val.vehicle_id.toString());
                            var beforePosting = vehicleData.filter(x => x.timestamp <= val.posting_date);
                            var afterPosting = vehicleData.filter(x => x.timestamp > val.posting_date);
                            var sortedBefore = beforePosting.sort((a,b) => (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0));
                            var sortedAfter = afterPosting.sort((a,b) => (a.timestamp > b.timestamp) ? 1 : ((b.timestamp > a.timestamp) ? -1 : 0));

                            var oGeofence = gDocs.find(x => x._id.toString() == val.origin_id.toString());
                            var dGeofence = gDocs.find(x => x._id.toString() == val.destination[0].location_id.toString());
                            var tempDateTime = new Date(val.posting_date).getTime();

                            if(oGeofence && dGeofence){
                                var getIndexOf = function(text,arr,op){
                                    var cond = null;
                                    arr.forEach(val => {
                                        if(op == "or" && !cond){
                                            cond = (text.indexOf(val) > -1);
                                        }
                                        if(op == "and" && (cond == null || cond == true)){
                                            cond = (text.indexOf(val) > -1);
                                        }
                                    });
                                    return cond;
                                };
                                if(sortedBefore.length > 0){
                                    var numLoc = 0;
                                    var lastLoc;

                                    var loc1=[],loc2=[];
                                    for(var i = sortedBefore.length-1; i>=0; i--){
                                        var ev = sortedBefore[i];
                                        var GEOFENCE_NAME = ev.GEOFENCE_NAME.split(" - ")[0];
                                        if(!lastLoc){
                                            lastLoc = GEOFENCE_NAME;
                                            numLoc ++;
                                        } else {
                                            if(lastLoc == GEOFENCE_NAME){}
                                            else {
                                                lastLoc = GEOFENCE_NAME;
                                                numLoc ++;
                                            }
                                        }
                                        if(numLoc == 1){
                                            console.log("1",GEOFENCE_NAME,oGeofence.short_name,dGeofence.short_name);
                                            loc1.push(ev);
                                        }
                                        if(numLoc == 2){
                                            console.log("2",GEOFENCE_NAME,oGeofence.short_name,dGeofence.short_name);
                                            loc2.push(ev);
                                        }
                                    }
        
                                    // for(var i = sortedBefore.length-1; i>=0; i--){
                                    
                                    for(var i = 0; i < loc2.length; i++){
                                        var ev = loc2[i];
                                        var GEOFENCE_NAME = ev.GEOFENCE_NAME.split(" - ")[0];

                                        if(GEOFENCE_NAME == oGeofence.short_name){
                                            var eventDate = new Date(ev.timestamp).getTime(),
                                                hourDiff = Math.abs(tempDateTime - eventDate) / 36e5;
                
                                            if(hourDiff < 3){
                                                // entered_origin
                                                if(ev.RULE_NAME == "Inside Geofence" && ev.stage == "start" && !__events_captured[eventDate]){
                                                    __events_captured[eventDate] = "entered_origin";
                                                }
                                                // end origin
                                                if(gStat != "in_transit"){
                                                    // queueing
                                                    // if IG queueing, queueingAtOrigin and hours < 8. if status == in_transit/processingAtOrigin, save event time and not status
                                                    if(getIndexOf(ev.RULE_NAME,["Inside Geofence","Queueing"],"and") && gStat != "queueingAtOrigin" && !__events_captured[eventDate]){
                                                        gStat = "queueingAtOrigin";
                                                        __events_captured[eventDate] = "queueingAtOrigin";
                                                    }
                                                    
                                                    // processing
                                                    // if IG processing, processingAtOrigin and hours < 8. if status == in_transit, save event time and not status
                                                    // if status is queueingAtOrigin and !processingAtOrigin, delete queueuingAtOrigin time 
                                                    if(getIndexOf(ev.RULE_NAME,["Inside Geofence","Processing"],"and") && ev.stage == "start" && gStat != "processingAtOrigin" && !__events_captured[eventDate]){
                                                        gStat = "processingAtOrigin";
                                                        __events_captured[eventDate] = "processingAtOrigin";
                                                    }
                                                    
                                                    // idling
                                                    // if IG processing, idlingAtOrigin and hours < 8. if status == in_transit, save event time and not status
                                                    // if status is queueingAtOrigin and !idlingAtOrigin, delete queueuingAtOrigin time 
                                                    if(getIndexOf(ev.RULE_NAME,["Inside","Idle"],"and") && gStat != "idlingAtOrigin" && !__events_captured[eventDate]){
                                                        gStat = "idlingAtOrigin";
                                                        __events_captured[eventDate] = "idlingAtOrigin";
                                                    }
                    
                                                    // in transit
                                                    // if inside geofence - end or outside geofence - start, in_transit and hours < 8 and status != dispatch/in_transit but time <= 1minute, update to in_transit.
                                                    // if status is not dispatch, delete other time???
                                                    if(((ev.RULE_NAME == "Inside Geofence" && ev.stage == "end") || (ev.RULE_NAME == "Outside Geofence" && ev.stage == "start") || 
                                                    (getIndexOf(ev.RULE_NAME,["Inside",""],"and") && ev.stage == "end")) && gStat != "in_transit" && !__events_captured[eventDate]) {
                                                        gStat = "in_transit";
                                                        __events_captured[eventDate] = "in_transit";
                                                        tempDateTime = new Date(ev.timestamp).getTime();
                                                    }
                                                }
                                                shouldBeLateEntry = true;
                                            } else {
                                                console.log("Loc 2 Hourdiff");
                                                break;
                                            }
                                        } else {
                                            console.log("Not Loc 2");
                                            break;
                                        }
                                    }
                                    for(var i = 0; i < loc1.length; i++){
                                        var ev = loc1[i];
                                        var GEOFENCE_NAME = ev.GEOFENCE_NAME.split(" - ")[0];

                                        if(GEOFENCE_NAME == oGeofence.short_name){
                                            var eventDate = new Date(ev.timestamp).getTime();
                
                                            // entered_origin
                                            if(ev.RULE_NAME == "Inside Geofence" && ev.stage == "start" && !__events_captured[eventDate]){
                                                __events_captured[eventDate] = "entered_origin";
                                            }
                                            // end origin
                                            if(gStat != "in_transit"){
                                                // queueing
                                                // if IG queueing, queueingAtOrigin and hours < 8. if status == in_transit/processingAtOrigin, save event time and not status
                                                if(getIndexOf(ev.RULE_NAME,["Inside Geofence","Queueing"],"and") && gStat != "queueingAtOrigin" && !__events_captured[eventDate]){
                                                    gStat = "queueingAtOrigin";
                                                    __events_captured[eventDate] = "queueingAtOrigin";
                                                }
                                                
                                                // processing
                                                // if IG processing, processingAtOrigin and hours < 8. if status == in_transit, save event time and not status
                                                // if status is queueingAtOrigin and !processingAtOrigin, delete queueuingAtOrigin time 
                                                if(getIndexOf(ev.RULE_NAME,["Inside Geofence","Processing"],"and") && ev.stage == "start" && gStat != "processingAtOrigin" && !__events_captured[eventDate]){
                                                    gStat = "processingAtOrigin";
                                                    __events_captured[eventDate] = "processingAtOrigin";
                                                }
                                                
                                                // idling
                                                // if IG processing, idlingAtOrigin and hours < 8. if status == in_transit, save event time and not status
                                                // if status is queueingAtOrigin and !idlingAtOrigin, delete queueuingAtOrigin time 
                                                if(getIndexOf(ev.RULE_NAME,["Inside","Idle"],"and") && gStat != "idlingAtOrigin" && !__events_captured[eventDate]){
                                                    gStat = "idlingAtOrigin";
                                                    __events_captured[eventDate] = "idlingAtOrigin";
                                                }
                
                                                // in transit
                                                // if inside geofence - end or outside geofence - start, in_transit and hours < 8 and status != dispatch/in_transit but time <= 1minute, update to in_transit.
                                                // if status is not dispatch, delete other time???
                                                if(((ev.RULE_NAME == "Inside Geofence" && ev.stage == "end") || (ev.RULE_NAME == "Outside Geofence" && ev.stage == "start") || 
                                                (getIndexOf(ev.RULE_NAME,["Inside",""],"and") && ev.stage == "end")) && gStat != "in_transit" && !__events_captured[eventDate]) {
                                                    gStat = "in_transit";
                                                    __events_captured[eventDate] = "in_transit";
                                                    tempDateTime = new Date(ev.timestamp).getTime();
                                                }
                                            }
                                            shouldBeLateEntry = false;
                                        } else {
                                            console.log("Not Loc 1 O");
                                            break;
                                        }
                                        if(GEOFENCE_NAME == dGeofence.short_name){
                                            var eventDate = new Date(ev.timestamp).getTime();
                
                                            // in transit (if no datetime)
                                            if(ev.RULE_NAME == "Inside Geofence" && ev.stage == "start" && !OBJECT.getKeyByValue(__events_captured,"in_transit") && !__events_captured[eventDate]){
                                                __events_captured[eventDate] = "in_transit";
                                                gStat = "in_transit";
                                            }
                                            // end in transit (if no datetime)
                                            
                                            // complete
                                            if((ev.RULE_NAME == "Outside Geofence" || ev.RULE_NAME == "Inside Geofence") && ev.stage == "start" && OBJECT.getKeyByValue(__events_captured,"in_transit") && gStat != "complete" && !__events_captured[eventDate]){
                                                gStat = "complete";
                                                __events_captured[eventDate] = "complete";
                                            }
                                            // end complete
                                            shouldBeLateEntry = true;
                                        } else {
                                            console.log("Not Loc 1 D");
                                            break;
                                        }
                                    }
                                } 
                                if(sortedAfter.length > 0){
                                    for(var i = 0; i < sortedAfter.length; i++){
                                        var ev = sortedAfter[i];
                                        var GEOFENCE_NAME = ev.GEOFENCE_NAME.split(" - ")[0];

                                        if(gStat != "in_transit" && gStat != "complete"){
                                            if(GEOFENCE_NAME == oGeofence.short_name){
                                                var eventDate = new Date(ev.timestamp).getTime();
                    
                                                // entered_origin
                                                if(ev.RULE_NAME == "Inside Geofence" && ev.stage == "start" && !__events_captured[eventDate]){
                                                    __events_captured[eventDate] = "entered_origin";
                                                }
                                                // end origin
                                                if(gStat != "in_transit"){
                                                    // queueing
                                                    // if IG queueing, queueingAtOrigin and hours < 8. if status == in_transit/processingAtOrigin, save event time and not status
                                                    if(getIndexOf(ev.RULE_NAME,["Inside Geofence","Queueing"],"and") && gStat != "queueingAtOrigin" && !__events_captured[eventDate]){
                                                        gStat = "queueingAtOrigin";
                                                        __events_captured[eventDate] = "queueingAtOrigin";
                                                    }
                                                    
                                                    // processing
                                                    // if IG processing, processingAtOrigin and hours < 8. if status == in_transit, save event time and not status
                                                    // if status is queueingAtOrigin and !processingAtOrigin, delete queueuingAtOrigin time 
                                                    if(getIndexOf(ev.RULE_NAME,["Inside Geofence","Processing"],"and") && ev.stage == "start" && gStat != "processingAtOrigin" && !__events_captured[eventDate]){
                                                        gStat = "processingAtOrigin";
                                                        __events_captured[eventDate] = "processingAtOrigin";
                                                    }
                                                    
                                                    // idling
                                                    // if IG processing, idlingAtOrigin and hours < 8. if status == in_transit, save event time and not status
                                                    // if status is queueingAtOrigin and !idlingAtOrigin, delete queueuingAtOrigin time 
                                                    if(getIndexOf(ev.RULE_NAME,["Inside","Idle"],"and") && gStat != "idlingAtOrigin" && !__events_captured[eventDate]){
                                                        gStat = "idlingAtOrigin";
                                                        __events_captured[eventDate] = "idlingAtOrigin";
                                                    }
                    
                                                    // in transit
                                                    // if inside geofence - end or outside geofence - start, in_transit and hours < 8 and status != dispatch/in_transit but time <= 1minute, update to in_transit.
                                                    // if status is not dispatch, delete other time???
                                                    if(((ev.RULE_NAME == "Inside Geofence" && ev.stage == "end") || (ev.RULE_NAME == "Outside Geofence" && ev.stage == "start") || 
                                                    (getIndexOf(ev.RULE_NAME,["Inside",""],"and") && ev.stage == "end")) && gStat != "in_transit" && !__events_captured[eventDate]) {
                                                        gStat = "in_transit";
                                                        __events_captured[eventDate] = "in_transit";
                                                        tempDateTime = new Date(ev.timestamp).getTime();
                                                    }
                                                }
                                                shouldBeLateEntry = false;
                                            } else {
                                                console.log("Not Loc 1 O");
                                                break;
                                            }
                                        } else {
                                            if(GEOFENCE_NAME == dGeofence.short_name){
                                                var eventDate = new Date(ev.timestamp).getTime();
                    
                                                // in transit (if no datetime)
                                                if(ev.RULE_NAME == "Inside Geofence" && ev.stage == "start" && !OBJECT.getKeyByValue(__events_captured,"in_transit") && !__events_captured[eventDate]){
                                                    __events_captured[eventDate] = "in_transit";
                                                    gStat = "in_transit";
                                                }
                                                // end in transit (if no datetime)
                                                
                                                // complete
                                                if((ev.RULE_NAME == "Outside Geofence" || ev.RULE_NAME == "Inside Geofence") && ev.stage == "start" && OBJECT.getKeyByValue(__events_captured,"in_transit") && gStat != "complete" && !__events_captured[eventDate]){
                                                    gStat = "complete";
                                                    __events_captured[eventDate] = "complete";
                                                }
                                                // end complete
                                            }
                                        }
                                    }
                                }
                                var sortedEvents = OBJECT.sortByKey(__events_captured);
                            
                                departure_date = OBJECT.getKeyByValue(sortedEvents,"in_transit");
                                if(departure_date){
                                    departure_date = Number(departure_date);
                                    departure_date = moment(new Date(departure_date)).toISOString();
    
                                    etd = departure_date;
    
                                    var route = rDocs.find(x => x._id.toString() == val.route.toString());
                                    var date = new Date(departure_date),
                                        transit_time = DATETIME.HH_MM(null,route.transit_time),
                                        hours = transit_time.hour,
                                        minutes = transit_time.minute;
                                        
                                    (hours)?date.setHours(date.getHours() + Number(hours)):null;
                                    (minutes)?date.setMinutes(date.getMinutes() + Number(minutes)):null;
                            
    
                                    eta = date.toISOString();
                                }
                                console.log("Hello",gStat,route.transit_time,val.route,sortedEvents);
                                
                                // departure_date
                                // etd
                                // eta
                                // history

                                if(save == "yes"){
                                    var set = {
                                        status: gStat,
                                        late_entry: (le == "yes") ? true : false,
                                        events_captured: sortedEvents,
                                        departure_date
                                    };
                                    set["destination.0.etd"] = etd;
                                    set["destination.0.eta"] = eta;
                                    // set[`history`] = eta;

                                    childPromise.push(client.db(dbName).collection("dispatch").updateOne({_id:val._id},{$set:set}));
                                }

                            } else {
                                console.log("NO GEOFENCE");
                            }
                        });
                        
                        if(save == "yes"){
                            Promise.all(childPromise).then(result => { res.json({ok:1}); }).catch(error => { console.log("Error",error); res.json(error); });
                        } else {
                            var sortedEvents = OBJECT.sortByKey(__events_captured);
                            var temp = {};
                            Object.keys(sortedEvents).forEach(key => {
                                temp[sortedEvents[key]] = moment(new Date(Number(key))).format("MMM DD, YYYY, hh:mm:ss A");
                            });
                            console.log("-------------------------------------------------------------")
                            res.json({ok:1,le,shouldBeLateEntry,departure_date,etd,eta,posting_date: moment(new Date(posting_date)).format("MMM DD, YYYY, hh:mm:ss A"),temp});
                        }
                    });
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.post('/test/goooosh/dispatch/:_id', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    const _id = req.params._id;
    const data = req.body.data;

    var dbName = "wd-coket1";
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            // res.json(data);
            client.db(dbName).collection("dispatch").updateMany({status:"entered_origin"},{$set:{status:"assigned"}}).then(eDocs=> {
                res.json(eDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});



/**
    {
        "Vehicle": "ACP7706",
        "Check In Date": "04/22/2021",
        "Check In Time": "0:01",
        "Check Out Date": "04/22/2021",
        "Check Out Time": "2:30",
        "Site": "TAGUM DC",
        "Destination": "DVO 1 PL"
    }
 */
var mainDocs = [];

/***
 {
            "Shipment Number": "22028880",
            "Origin": "MNL DC",
            "Destination": "MEYC PL",
            "Vehicle": "PTO394",
            "Posting Date": "Apr 23, 2021, 9:54 PM"
        }
 */
var wdDocs = [];



router.post('/test/please/makeitwork', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    const query = req.query;
    const startDate = query.startDate;
    const endDate = query.endDate;
    const getOriginal = query.getOriginal;
    var childPromise = [];

    function ddd(date,transitTime=0,posting_date){
        function iso(){return new Date(date).toISOString()};
        function timestamp(){return new Date(date).getTime()};
        function eta(){
            var _date = new Date(date),
                transit_time = DATETIME.HH_MM(null,transitTime),
                hours = transit_time.hour,
                minutes = transit_time.minute;

            (hours)?_date.setHours(_date.getHours() + Number(hours)):null;
            (minutes)?_date.setMinutes(_date.getMinutes() + Number(minutes)):null;

            return new Date(_date).toISOString()
        }
        function incomplete(){
            var _date = new Date(date),
                transit_time = DATETIME.HH_MM(null,transitTime),
                hours = transit_time.hour,
                minutes = transit_time.minute;

            (hours)?_date.setHours(_date.getHours() + (Number(hours)+12)):null;
            (minutes)?_date.setMinutes(_date.getMinutes() + Number(minutes)):null;

            var finalIncompleteTime = new Date(_date).getTime();
            if(new Date(posting_date).getTime() > new Date(_date).getTime()){
                var postingTimestamp = new Date(posting_date);
                postingTimestamp.setMinutes(postingTimestamp.getMinutes() + 2)
                finalIncompleteTime = new Date(postingTimestamp).getTime();
            }

            return finalIncompleteTime;
        }
        return {
            iso: iso(),
            timestamp: timestamp(),
            eta: eta(),
            incomplete: incomplete()
        }
    }
    
    var dbName = "wd-coket1";

    var newSets = {};
    var notifSet = {};
    var noSet = {};
    var originalSet = null;
    var hasEntryUpdateOrRemark = {};
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("dispatch").find({
                posting_date: {
                    $gte: startDate,
                    $lt: endDate,
                }
            }).toArray().then(docs=> {
                originalSet = docs;
                if(getOriginal == "yes"){
                    res.json({
                        ok:1,
                        originalSet
                    });
                } else {
                    client.db(dbName).collection("routes").find({}).toArray().then(rDocs=> {
                        function aaaaaaaaaa(doc,rDoc,enteredOrigin,inTransit,Complete,Incomplete){
                            var set = {
                                history: {},
                                events_captured: {}
                            };
                            var events_captured = doc.events_captured || {};
                            var original = doc.history.original;
                            var nin = [];
    
                            var entered_origin = (enteredOrigin) ? ddd(enteredOrigin) : null;
                            var in_transit = (inTransit) ? ddd(inTransit,rDoc.transit_time,doc.posting_date) : null;
                            var complete = (Complete) ? ddd(Complete) : null;
    
                            if(enteredOrigin){
                                events_captured[entered_origin.timestamp] = "entered_origin";
                            }
                            if(inTransit){
                                events_captured[in_transit.timestamp] = "in_transit";
                                set[`departure_date`] = in_transit.iso;
                                set["destination.0.etd"] = in_transit.iso;
                                set["destination.0.eta"] = in_transit.eta;
                            }
                            if(Complete){
                                events_captured[complete.timestamp] = "complete";
                            }
                            
                            if(Incomplete){
                                events_captured[in_transit.incomplete] = "incomplete";
                            }
        
                            var sortedEC = OBJECT.sortByKey(events_captured);
                            var eo = OBJECT.getKeyByValue(sortedEC,"entered_origin");
    
                            var newHistory = {};
    
                            if(eo){
                                Object.keys(sortedEC).forEach(key => {
                                    var val = sortedEC[key];
                                    // delete keys before entered_origin
                                    if(entered_origin && Number(key) < entered_origin.timestamp){
                                        delete sortedEC[key];
                                    }
                                    // delete keys after complete
                                    if(complete && Number(key) > complete.timestamp){
                                        delete sortedEC[key];
                                    }
                                    // delete keys after incomplete
                                    if(Incomplete && Number(key) > in_transit.incomplete){
                                        delete sortedEC[key];
                                    }
                                    // delete keys in between in transit and complete OR incomplete
                                    if((inTransit && Number(key) > in_transit.timestamp) && ((complete && Number(key) < complete.timestamp) || (Incomplete && Number(key) < in_transit.incomplete))){
                                        delete sortedEC[key];
                                    }
                                    // remove duplicates
                                    if(entered_origin && val == "entered_origin" && key != entered_origin.timestamp){
                                        delete sortedEC[key];
                                    }
                                    if(in_transit && val == "in_transit" && (inTransit && key != in_transit.timestamp)){
                                        delete sortedEC[key];
                                    }
                                    if(complete && val == "complete" && key != complete.timestamp){
                                        delete sortedEC[key];
                                    }
                                    if(in_transit && val == "incomplete" && key != in_transit.incomplete){
                                        delete sortedEC[key];
                                    }
                                });
    
                                var postingTimestamp = new Date(doc.posting_date).getTime();
                                var isLateEntry = false;
                                var originalStatus = "assigned";
                                var lateEntryStatus = "in_transit";
    
                                var sortedHistory = OBJECT.sortByKey(doc.history);
    
                                var lastTimestamp;
                                var lastValue;
    
                                var ABORT = false;
                                
                                Object.keys(sortedEC).forEach(KEY => {
                                    var key = Number(KEY);
                                    var val = sortedEC[KEY];
    
                                    // if key is less than posting date,
                                    if(key < postingTimestamp){
                                        if(val == "entered_origin"){
                                            val = "assigned";
                                        }
                                        // set value as original status
                                        originalStatus = val;
                                    }
                                    // if in transit date > posting date,
                                    if(val == "in_transit" && key < postingTimestamp){
                                        // set as LE
                                        isLateEntry = true;
                                        lateEntryStatus = "in_transit";
                                    }
                                    if(val == "complete" && key < postingTimestamp){
                                        // set as LE
                                        isLateEntry = true;
                                        lateEntryStatus = "complete";
                                    }
    
    
                                    if(val != "entered_origin"){
                                        Object.keys(sortedHistory).forEach(HKEY => {
                                            
                                            // System - Status update
                                            // entry update
                                            // manually
    
                                            // long queueing
                                            // over cico
                                            // over transit
                                            
                                            var hKey = Number(HKEY);
                                            if(!!hKey){
                                                var hVal = sortedHistory[HKEY].toLowerCase();
                                                var HVAL = sortedHistory[HKEY];
                                                function contains(text){
                                                    return hVal.indexOf(text) > -1;
                                                }
                                                if(contains("status manually")){
                                                    ABORT = true;
                                                } else {
                                                    if(hKey >= lastTimestamp && hKey < key) {
                                                        if(contains("entry update")){
                                                            newHistory[HKEY] = HVAL;
                                                            hasEntryUpdateOrRemark[val._id] = "entry update";
                                                        } else if(contains("record updated")){
                                                            newHistory[HKEY] = HVAL;
                                                            hasEntryUpdateOrRemark[val._id] = "record updated";
                                                        } else if(contains("added a")){
                                                            newHistory[HKEY] = HVAL;
                                                            hasEntryUpdateOrRemark[val._id] = "remarks";
                                                        } else {
                                                            if(lastValue == "entered_origin"){} 
                                                            else {
                                                                if(lastValue == "queueingAtOrigin"){
                                                                    if(contains("long queueing") || contains("over cico")){
                                                                        newHistory[HKEY] = HVAL;
                                                                        nin.push(new Date(hKey).toISOString());
                                                                    }
                                                                }
                                                                if(lastValue == "processingAtOrigin"){
                                                                    if(contains("over cico")){
                                                                        newHistory[HKEY] = HVAL;
                                                                        nin.push(new Date(hKey).toISOString());
                                                                    }
                                                                }
                                                                if(lastValue == "in_transit"){
                                                                    if(contains("over transit")){
                                                                        newHistory[HKEY] = HVAL;
                                                                        nin.push(new Date(hKey).toISOString());
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    lastTimestamp = key;
                                    lastValue = val;
    
                                    set["status"] = (val == "entered_origin") ? "assigned" : val;
                                });
                                var lastVal = originalStatus;
                                Object.keys(sortedEC).forEach(key => {
                                    var val = sortedEC[key];
    
                                    if(val != "entered_origin"){
                                        if(lastVal == val){} 
                                        else {
                                            if(isLateEntry){
                                                if(lateEntryStatus == "in_transit"){
                                                    if(val == "complete" || val == "incomplete") {
                                                        newHistory[key] = `System - Status updated to '${val}'.`;
                                                    }
                                                } else {
                                                    
                                                }
                                            } else {
                                                newHistory[key] = `System - Status updated to '${val}'.`;
                                            }
                                        }
                                        lastVal = val;
                                    }
                                });
                                var original = doc.history.original;
                                if(isLateEntry === true){
                                    set[`late_entry`] = true;
                                    original = original.replace("entered_origin",lateEntryStatus);
                                    original = original.replace("plan",lateEntryStatus);
                                    original = original.replace("assigned",lateEntryStatus);
                                    original = original.replace("queueingAtOrigin",lateEntryStatus);
                                    original = original.replace("processingAtOrigin",lateEntryStatus);
                                    original = original.replace("idlingAtOrigin",lateEntryStatus);
                                    original = original.replace("in_transit",lateEntryStatus);
                                    original = original.replace("complete",lateEntryStatus);
                                } else {
                                    set[`late_entry`] = false;
                                    original = original.replace("entered_origin",originalStatus);
                                    original = original.replace("plan",originalStatus);
                                    original = original.replace("assigned",originalStatus);
                                    original = original.replace("queueingAtOrigin",originalStatus);
                                    original = original.replace("processingAtOrigin",originalStatus);
                                    original = original.replace("idlingAtOrigin",originalStatus);
                                    original = original.replace("in_transit",originalStatus);
                                    original = original.replace("complete",originalStatus);
                                }
    
                                var sortedNewHistory = OBJECT.sortByKey(newHistory);
                                var updatedHistory = {};
                                updatedHistory.original = original;
                                updatedHistory.vehicle = doc.history.vehicle;
    
                                Object.keys(sortedNewHistory).forEach(key => {
                                    updatedHistory[key] = sortedNewHistory[key];
                                });
                                set.history = updatedHistory;
                                set.events_captured = sortedEC;
    
                            } else {
                                res.json({warning:"NO EO"});
                            }
    
                            if(ABORT == true){
                                noSet[doc._id] = "ABORT";
                            } else {
                                newSets[doc._id] = set;
                                if(nin.length > 0){
                                    notifSet[doc._id] = nin;
                                }
                            }
                            // if(ABORT == true){
                            //     res.json({ok:0,error:"ABORT"});
                            // } else {
                            //     if(view){
                            //         res.json({ok:1,set});
                            //     } else {
                            //         client.db(dbName).collection("dispatch").updateOne({_id: _id},{$set:set}).then(result=> {
                            //             client.db(dbName).collection("notifications").deleteMany({
                            //                 dispatch_id: _id,
                            //                 timestamp: {
                            //                     $nin: nin
                            //                 }
                            //             }).then(result=> {
                            //                 res.json({ok:1,set,result});
                            //             });
                            //         });
                            //     }
                            // }
                        }
    
                        wdDocs.forEach(val => {
                            var posting_date = new Date(val["Posting Date"]).getTime();
                            var check_in = null;
                            var check_out = null;
                            var on_site = null;
                            var filteredMainDocs = mainDocs.filter(x => x["Vehicle"] == val["Vehicle"]);
                        
                            // console.log("length",val["Shipment Number"],filteredMainDocs.length);
                            for(var i = 0; i < filteredMainDocs.length; i++){
                                var mVal = filteredMainDocs[i];
                                var mNext = filteredMainDocs[i+1] || {};
                                var __check_in = new Date(`${mVal["Check In Date"]}, ${mVal["Check In Time"]}`).getTime();
                                var __check_out = new Date(`${mVal["Check Out Date"]}, ${mVal["Check Out Time"]}`).getTime();
                                var __on_site = new Date(`${mNext["Check In Date"]}, ${mNext["Check In Time"]}`).getTime();
                        
                                if(isNaN(__check_in) || isNaN(__check_out) || isNaN(__on_site)) {}
                                else {
                                    if(val["Shipment Number"] == "21050103"){
                                        console.log(val["Shipment Number"],posting_date,__check_in,__check_out,__on_site,posting_date >= __check_in,posting_date <= __check_out,val["Origin"],mVal["Site"],val["Destination"],mVal["Destination"]);
                                    }
                                    if(posting_date >= __check_in && posting_date <= __check_out && val["Origin"] == mVal["Site"] && val["Destination"] == mVal["Destination"]){
                                        check_in = __check_in;
                                        check_out = __check_out;
                                        on_site = __on_site;
                                        break;
                                    }
                                    if(posting_date >= __check_out && posting_date <= __on_site && val["Origin"] == mVal["Site"] && val["Destination"] == mVal["Destination"]){
                                        check_in = __check_in;
                                        check_out = __check_out;
                                        on_site = __on_site;
                                        break;
                                    }
                                }
                            }
                            if(check_in && check_out && on_site){
                                var doc = docs.find(x => x._id == val["Shipment Number"]);
                                if(doc){
                                    var rDoc = rDocs.find(x => x._id == doc.route);
                                    if(rDoc){
                                        aaaaaaaaaa(doc,rDoc,check_in,check_out,on_site,null);
                                    } else {
                                        noSet[val["Shipment Number"]] = "Invalid route.";
                                    }
                                } else {
                                    noSet[val["Shipment Number"]] = "Document does not exist.";
                                }
                            } else {
                                noSet[val["Shipment Number"]] = "Either no check-in, check-out, or on-site data.";
                            }
                        });
                        
                        if(Object.keys(newSets).length > 0){
                            Object.keys(newSets).forEach(key => {
                                childPromise.push( client.db(dbName).collection("dispatch").updateOne({_id: key},{$set: newSets[key]}) );

                                var nin = notifSet[key];
                                if(nin){
                                    childPromise.push( client.db(dbName).collection("notifications").deleteMany({dispatch_id: key},{ timestamp: {  $nin: nin } }) );
                                }
                            });
                            if(childPromise.length > 0){
                                Promise.all(childPromise).then(() => {
                                    res.json({
                                        ok:1,
                                        message: "OKAY",
                                        newSetsLength: Object.keys(newSets).length,
                                        notifSetLength: Object.keys(notifSet).length, 
                                        noSetLength: Object.keys(noSet).length, 
                                        newSets, 
                                        notifSet,
                                        noSet,
                                        hasEntryUpdateOrRemark,
                                    });
                                }).catch(error => {
                                    res.status(500).send('Error in Promise All: ' + JSON.stringify(error));
                                });
                            } else {
                                res.json({
                                    ok:0,
                                    message: "Empty childPromise.",
                                    newSetsLength: Object.keys(newSets).length,
                                    notifSetLength: Object.keys(notifSet).length, 
                                    noSetLength: Object.keys(noSet).length, 
                                    newSets, 
                                    notifSet,
                                    noSet,
                                    hasEntryUpdateOrRemark,
                                });
                            }
                        } else {
                            res.json({
                                ok:0,
                                message: "Empty newSets.",
                                newSetsLength: Object.keys(newSets).length,
                                notifSetLength: Object.keys(notifSet).length, 
                                noSetLength: Object.keys(noSet).length, 
                                newSets, 
                                notifSet,
                                noSet,
                                hasEntryUpdateOrRemark,
                            });
                        }
                    });
                }
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


router.post('/test/please/help', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    const query = req.query;
    const _id = query._id;
    const enteredOrigin = query.enteredOrigin;
    const inTransit = query.inTransit;
    const Complete = query.Complete;
    const Incomplete = query.Incomplete;
    const view = query.view;

    function ddd(date,transitTime=0,posting_date){
        function iso(){return new Date(date).toISOString()};
        function timestamp(){return new Date(date).getTime()};
        function eta(){
            var _date = new Date(date),
                transit_time = DATETIME.HH_MM(null,transitTime),
                hours = transit_time.hour,
                minutes = transit_time.minute;

            (hours)?_date.setHours(_date.getHours() + Number(hours)):null;
            (minutes)?_date.setMinutes(_date.getMinutes() + Number(minutes)):null;

            return new Date(_date).toISOString()
        }
        function incomplete(){
            var _date = new Date(date),
                transit_time = DATETIME.HH_MM(null,transitTime),
                hours = transit_time.hour,
                minutes = transit_time.minute;

            (hours)?_date.setHours(_date.getHours() + (Number(hours)+12)):null;
            (minutes)?_date.setMinutes(_date.getMinutes() + Number(minutes)):null;

            var finalIncompleteTime = new Date(_date).getTime();
            if(new Date(posting_date).getTime() > new Date(_date).getTime()){
                var postingTimestamp = new Date(posting_date);
                postingTimestamp.setMinutes(postingTimestamp.getMinutes() + 2)
                finalIncompleteTime = new Date(postingTimestamp).getTime();
            }

            return finalIncompleteTime;
        }
        return {
            iso: iso(),
            timestamp: timestamp(),
            eta: eta(),
            incomplete: incomplete()
        }
    }
    
    var dbName = "wd-coket1";
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            if(_id){
                client.db(dbName).collection("dispatch").find({_id: _id}).toArray().then(docs=> {
                    var doc = docs[0];
                    if(doc){
                        client.db(dbName).collection("routes").find({_id: doc.route}).toArray().then(rDocs=> {
                            var rDoc = rDocs[0];
                            if(rDoc){
                                var set = {
                                    history: {},
                                    events_captured: {}
                                };
                                var events_captured = doc.events_captured || {};
                                var original = doc.history.original;
                                var nin = [];
    
                                var entered_origin = (enteredOrigin) ? ddd(enteredOrigin) : null;
                                var in_transit = (inTransit) ? ddd(inTransit,rDoc.transit_time,doc.posting_date) : null;
                                var complete = (Complete) ? ddd(Complete) : null;
    
                                if(enteredOrigin){
                                    events_captured[entered_origin.timestamp] = "entered_origin";
                                }
                                if(inTransit){
                                    events_captured[in_transit.timestamp] = "in_transit";
                                    set[`departure_date`] = in_transit.iso;
                                    set["destination.0.etd"] = in_transit.iso;
                                    set["destination.0.eta"] = in_transit.eta;
                                }
                                if(Complete){
                                    events_captured[complete.timestamp] = "complete";
                                }
                                
                                if(Incomplete){
                                    events_captured[in_transit.incomplete] = "incomplete";
                                }
            
                                var sortedEC = OBJECT.sortByKey(events_captured);
                                var eo = OBJECT.getKeyByValue(sortedEC,"entered_origin");
    
                                var newHistory = {};
    
                                if(eo){
                                    Object.keys(sortedEC).forEach(key => {
                                        var val = sortedEC[key];
                                        // delete keys before entered_origin
                                        if(entered_origin && Number(key) < entered_origin.timestamp){
                                            delete sortedEC[key];
                                        }
                                        // delete keys after complete
                                        if(complete && Number(key) > complete.timestamp){
                                            delete sortedEC[key];
                                        }
                                        // delete keys after incomplete
                                        if(Incomplete && Number(key) > in_transit.incomplete){
                                            delete sortedEC[key];
                                        }
                                        // delete keys in between in transit and complete OR incomplete
                                        if((inTransit && Number(key) > in_transit.timestamp) && ((complete && Number(key) < complete.timestamp) || (Incomplete && Number(key) < in_transit.incomplete))){
                                            delete sortedEC[key];
                                        }
                                        // remove duplicates
                                        if(entered_origin && val == "entered_origin" && key != entered_origin.timestamp){
                                            delete sortedEC[key];
                                        }
                                        if(in_transit && val == "in_transit" && (inTransit && key != in_transit.timestamp)){
                                            delete sortedEC[key];
                                        }
                                        if(complete && val == "complete" && key != complete.timestamp){
                                            delete sortedEC[key];
                                        }
                                        if(in_transit && val == "incomplete" && key != in_transit.incomplete){
                                            delete sortedEC[key];
                                        }
                                    });
    
                                    var postingTimestamp = new Date(doc.posting_date).getTime();
                                    var isLateEntry = false;
                                    var originalStatus = "assigned";
                                    var lateEntryStatus = "in_transit";
    
                                    var sortedHistory = OBJECT.sortByKey(doc.history);
    
                                    var lastTimestamp;
                                    var lastValue;
    
                                    var ABORT = false;
                                    
                                    Object.keys(sortedEC).forEach(KEY => {
                                        var key = Number(KEY);
                                        var val = sortedEC[KEY];
    
                                        // if key is less than posting date,
                                        if(key < postingTimestamp){
                                            if(val == "entered_origin"){
                                                val = "assigned";
                                            }
                                            // set value as original status
                                            originalStatus = val;
                                        }
                                        // if in transit date > posting date,
                                        if(val == "in_transit" && key < postingTimestamp){
                                            // set as LE
                                            isLateEntry = true;
                                            lateEntryStatus = "in_transit";
                                        }
                                        if(val == "complete" && key < postingTimestamp){
                                            // set as LE
                                            isLateEntry = true;
                                            lateEntryStatus = "complete";
                                        }
    
    
                                        if(val != "entered_origin"){
                                            Object.keys(sortedHistory).forEach(HKEY => {
                                                
                                                // System - Status update
                                                // entry update
                                                // manually
    
                                                // long queueing
                                                // over cico
                                                // over transit
                                                
                                                var hKey = Number(HKEY);
                                                if(!!hKey){
                                                    var hVal = sortedHistory[HKEY].toLowerCase();
                                                    var HVAL = sortedHistory[HKEY];
                                                    function contains(text){
                                                        return hVal.indexOf(text) > -1;
                                                    }
                                                    if(contains("status manually")){
                                                        ABORT = true;
                                                    } else {
                                                        if(hKey >= lastTimestamp && hKey < key) {
                                                            if(contains("entry update")){
                                                                newHistory[HKEY] = HVAL;
                                                            } else if(contains("record updated")){
                                                                newHistory[HKEY] = HVAL;
                                                            } else if(contains("added a")){
                                                                newHistory[HKEY] = HVAL;
                                                            } else {
                                                                if(lastValue == "entered_origin"){} 
                                                                else {
                                                                    if(lastValue == "queueingAtOrigin"){
                                                                        if(contains("long queueing") || contains("over cico")){
                                                                            newHistory[HKEY] = HVAL;
                                                                            nin.push(new Date(hKey).toISOString());
                                                                        }
                                                                    }
                                                                    if(lastValue == "processingAtOrigin"){
                                                                        if(contains("over cico")){
                                                                            newHistory[HKEY] = HVAL;
                                                                            nin.push(new Date(hKey).toISOString());
                                                                        }
                                                                    }
                                                                    if(lastValue == "in_transit"){
                                                                        if(contains("over transit")){
                                                                            newHistory[HKEY] = HVAL;
                                                                            nin.push(new Date(hKey).toISOString());
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        lastTimestamp = key;
                                        lastValue = val;
    
                                        set["status"] = (val == "entered_origin") ? "assigned" : val;
                                    });
                                    var lastVal = originalStatus;
                                    Object.keys(sortedEC).forEach(key => {
                                        var val = sortedEC[key];
    
                                        if(val != "entered_origin"){
                                            if(lastVal == val){} 
                                            else {
                                                if(isLateEntry){
                                                    if(lateEntryStatus == "in_transit"){
                                                        if(val == "complete" || val == "incomplete") {
                                                            newHistory[key] = `System - Status updated to '${val}'.`;
                                                        }
                                                    } else {
                                                        
                                                    }
                                                } else {
                                                    newHistory[key] = `System - Status updated to '${val}'.`;
                                                }
                                            }
                                            lastVal = val;
                                        }
                                    });
                                    var original = doc.history.original;
                                    if(isLateEntry === true){
                                        set[`late_entry`] = true;
                                        original = original.replace("entered_origin",lateEntryStatus);
                                        original = original.replace("plan",lateEntryStatus);
                                        original = original.replace("assigned",lateEntryStatus);
                                        original = original.replace("queueingAtOrigin",lateEntryStatus);
                                        original = original.replace("processingAtOrigin",lateEntryStatus);
                                        original = original.replace("idlingAtOrigin",lateEntryStatus);
                                        original = original.replace("in_transit",lateEntryStatus);
                                        original = original.replace("complete",lateEntryStatus);
                                    } else {
                                        set[`late_entry`] = false;
                                        original = original.replace("entered_origin",originalStatus);
                                        original = original.replace("plan",originalStatus);
                                        original = original.replace("assigned",originalStatus);
                                        original = original.replace("queueingAtOrigin",originalStatus);
                                        original = original.replace("processingAtOrigin",originalStatus);
                                        original = original.replace("idlingAtOrigin",originalStatus);
                                        original = original.replace("in_transit",originalStatus);
                                        original = original.replace("complete",originalStatus);
                                    }
    
                                    var sortedNewHistory = OBJECT.sortByKey(newHistory);
                                    var updatedHistory = {};
                                    updatedHistory.original = original;
                                    updatedHistory.vehicle = doc.history.vehicle;
    
                                    Object.keys(sortedNewHistory).forEach(key => {
                                        updatedHistory[key] = sortedNewHistory[key];
                                    });
                                    set.history = updatedHistory;
                                    set.events_captured = sortedEC;
    
                                } else {
                                    res.json({warning:"NO EO"});
                                }
    
                                
                                if(ABORT == true){
                                    res.json({ok:0,error:"ABORT"});
                                } else {
                                    if(view){
                                        res.json({ok:1,set});
                                    } else {
                                        client.db(dbName).collection("dispatch").updateOne({_id: _id},{$set:set}).then(result=> {
                                            client.db(dbName).collection("notifications").deleteMany({
                                                dispatch_id: _id,
                                                timestamp: {
                                                    $nin: nin
                                                }
                                            }).then(result=> {
                                                res.json({ok:1,set,result});
                                            });
                                        });
                                    }
                                }
                                
                            }
                        });
                    } else {
                        res.json({warning:"No shipment"});
                    }
                });
            } else {
                res.json({warning:"No ID"});
            }
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/update/marielle', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    
    const query = req.query;
    const role = query.role;

    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("users").updateOne({_id:"wru_marielle"},{$set:{role}}).then(gDocs=> {
                res.json(gDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/get/events', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(`${dbName}-logging`).collection("events").find({timestamp: {
                    $gte: "2021-03-21T16:00:00.000Z",
                    $lt: "2021-03-23T15:59:59.999Z",
                }
            }).toArray().then(eDocs=> {
                res.json(eDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/get/search', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {

            var arr = [];
            client.db(dbName).collection("dispatch").aggregate([
                { "$project": { "history": { "$objectToArray": "$history" }}},
                { "$match": { "history.v": {$regex : ".*Entry Update.*"} }},
                { "$project": { "history": { "$arrayToObject": "$history" }}}
            ]).toArray().then(eDocs=> {
                eDocs.forEach(val => {
                    Object.keys(val.history||{}).forEach(key => {
                        var value = val.history[key];
                        if(value.indexOf("5f33") > -1 && value.indexOf("Entry Update") > -1){
                            arr.push({
                                _id: val._id,
                                value,
                            });
                        }
                    });
                });
                res.json(arr);
                // Promise.all(childPromise).then(result => { res.json({ok:1}); }).catch(error => { console.log("Error",error); res.json(error); });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/user_login_activity/lala', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wm-coket1";
    var childPromise = [];
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var arr = [];
            client.db(dbName).collection("user_login_activity").find({logout_date:{$exists:false}}).toArray().then(docs => {
                docs.forEach(doc => {
                    var end = moment();
                    var startTime = moment(new Date(doc.login_date));
                    var duration = moment.duration(end.diff(startTime));

                    if(duration.asDays() >= 30){
                        var logout_date = startTime.add(30,"days").toISOString();
                        arr.push(logout_date);
                        childPromise.push( client.db(dbName).collection("user_login_activity").updateOne({_id: doc._id},{$set: {logout_date}}) );
                    }
                });
                if(childPromise.length > 0){
                    Promise.all(childPromise).then(() => {
                        res.json({ok:1});
                    }).catch(error => {
                        res.status(500).send('Error in Promise All: ' + JSON.stringify(error));
                    });
                } else {
                    res.json({ok:1});
                }
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/delete/after', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];

    const query = req.query;
    const startDate = query.startDate;
    const endDate = query.endDate;
    const version = query.version;
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("dispatch").find({
                posting_date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                version
            }).toArray().then(docs => {
                res.json(docs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/update/deleted_dispatch/:skip/:limit', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    
    var dbName = "wd-coket1";

    var sortObject = o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
    
    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var childPromise = [];
            var ids = [];
            client.db(`${dbName}-logging`).collection("user_action").find({collection:"dispatch"}).skip(skip).limit(limit).toArray().then(docs=> {
                docs.forEach(val => {
                    var data;
                    try {
                        data = JSON.parse(val.data);
                    } catch(error){
                        console.log("Parsing error");
                    }
                    if(data){
                        var event_time = data.event_time || {};
                        var events_captured = data.events_captured || {};
                        Object.keys(event_time).forEach(key => {
                            events_captured[new Date(event_time[key]).getTime()] = key;
                        });
                        var sorted = sortObject(events_captured);
                        data.events_captured = sorted;
                        delete data.event_time;
                        ids.push(data._id);
                        childPromise.push(client.db(`${dbName}-logging`).collection("user_action").updateOne({_id:db.getPrimaryKey(val._id)},{$set:{
                            data: JSON.stringify(data)
                        }}));
                    }
                });
                Promise.all(childPromise).then(result => { res.json({ok:1}); }).catch(error => { console.log("Error",error); res.json(error); });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/delete/deleted_dispatch', (req,res,next)=>{
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";

    MongoClient.connect(url1, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var childPromise = [];
            client.db(`${dbName}-logging`).collection("user_action").deleteMany({collection:"dispatch",username:"wru_marielle"}).then(gDocs=> {
                res.json(gDocs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/import/escalation/recipients', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];

    const query = req.query;
    const startDate = query.startDate;
    const endDate = query.endDate;
    const version = query.version;
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("dispatch").find({
                posting_date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                version
            }).toArray().then(docs => {
                res.json(docs);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// import vehicle (section & company) from json
router.get('/test/update/vehicles', (req,res,next)=>{
    var data = [
        {
            "Plate Number": "WFT364",
            "Company": "SADC"
        },
        {
            "Plate Number": "WGB626",
            "Company": "SADC"
        },
        {
            "Plate Number": "WRU940",
            "Company": "SADC"
        },
        {
            "Plate Number": "WPP911",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RBP112",
            "Company": "SADC"
        },
        {
            "Plate Number": "RBP207",
            "Company": "SADC"
        },
        {
            "Plate Number": "REL479",
            "Company": "SADC"
        },
        {
            "Plate Number": "RBE282",
            "Company": "SADC"
        },
        {
            "Plate Number": "RDG793",
            "Company": "SADC"
        },
        {
            "Plate Number": "RDG144",
            "Company": "SADC"
        },
        {
            "Plate Number": "RBE272",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGK733",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGK731",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGK702",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGK775",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGZ425",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGK779",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGZ405",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGZ447",
            "Company": "SADC"
        },
        {
            "Plate Number": "ZSC874",
            "Company": "SADC"
        },
        {
            "Plate Number": "ZTH913",
            "Company": "SADC"
        },
        {
            "Plate Number": "ZTG265",
            "Company": "SADC"
        },
        {
            "Plate Number": "ZTF789",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCQ696",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFQ656",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFQ626",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFQ636",
            "Company": "SADC"
        },
        {
            "Plate Number": "PWI607",
            "Company": "SADC"
        },
        {
            "Plate Number": "PWI617",
            "Company": "SADC"
        },
        {
            "Plate Number": "THI626",
            "Company": "SADC"
        },
        {
            "Plate Number": "THI646",
            "Company": "SADC"
        },
        {
            "Plate Number": "TIF584",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "TOK272",
            "Company": "SADC"
        },
        {
            "Plate Number": "WIR650",
            "Company": "SADC"
        },
        {
            "Plate Number": "XDN150",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABE9775",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABE9746",
            "Company": "SADC"
        },
        {
            "Plate Number": "APA4551",
            "Company": "SADC"
        },
        {
            "Plate Number": "APA4400",
            "Company": "SADC"
        },
        {
            "Plate Number": "APA4433",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDH4261",
            "Company": "SADC"
        },
        {
            "Plate Number": "APA4545",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCD4604",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCD4603",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBW7684",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBW7685",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBW7684",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBW7686",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDQ6977",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3341",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3340",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3344",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3343",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3332",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3329",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3330",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3331",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3328",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCF3342",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAG1859",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAG1861",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAG1860",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAG1862",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAG1863",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAR1786",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAL2482",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAL2484",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAL2494",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAL2495",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAT2848",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAT2849",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1202",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1201",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5825",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5827",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5828",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5826",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDA2672",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBF9379",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBF9381",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBO8532",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBO8530",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBO8533",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBO8534",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBO8531",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBO8535",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NBT8121",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT8116",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT7889",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT8119",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM8717",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDI3450",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDI3032",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDI3037",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NDI3042",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM8716",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM8718",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDI3041",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDI3451",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDI3040",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9187",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9186",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9189",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDQ1033",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5459",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5460",
            "Company": "SADC"
        },
        {
            "Plate Number": "NGL2392",
            "Company": "SADC"
        },
        {
            "Plate Number": "NGL2391",
            "Company": "SADC"
        },
        {
            "Plate Number": "NGL2390",
            "Company": "SADC"
        },
        {
            "Plate Number": "TSX832",
            "Company": "SADC"
        },
        {
            "Plate Number": "XGP890",
            "Company": "SADC"
        },
        {
            "Plate Number": "XGP958",
            "Company": "SADC"
        },
        {
            "Plate Number": "RCT501",
            "Company": "SADC"
        },
        {
            "Plate Number": "RCT503",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMB842",
            "Company": "SADC"
        },
        {
            "Plate Number": "PQD343",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAQ3370",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3377",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3358",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3359",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3369",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3375",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3371",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3372",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3376",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3373",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3378",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3380",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3379",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3360",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3374",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA3348",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA3345",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA3346",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA3347",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2670",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2677",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2676",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2671",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2675",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2674",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2673",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "RGK703",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGK765",
            "Company": "SADC"
        },
        {
            "Plate Number": "NQR451",
            "Company": "SADC"
        },
        {
            "Plate Number": "NQZ529",
            "Company": "SADC"
        },
        {
            "Plate Number": "TMO354",
            "Company": "SADC"
        },
        {
            "Plate Number": "TOK514",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMK771",
            "Company": "SADC"
        },
        {
            "Plate Number": "RLU886",
            "Company": "SADC"
        },
        {
            "Plate Number": "AAI1020",
            "Company": "SADC"
        },
        {
            "Plate Number": "RNE168",
            "Company": "SADC"
        },
        {
            "Plate Number": "WIS461",
            "Company": "SADC"
        },
        {
            "Plate Number": "WIU903",
            "Company": "SADC"
        },
        {
            "Plate Number": "WLQ506",
            "Company": "SADC"
        },
        {
            "Plate Number": "WIU954",
            "Company": "SADC"
        },
        {
            "Plate Number": "AAV6371",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMD594",
            "Company": "SADC"
        },
        {
            "Plate Number": "APA2793",
            "Company": "SADC"
        },
        {
            "Plate Number": "APA2789",
            "Company": "SADC"
        },
        {
            "Plate Number": "WLQ746",
            "Company": "SADC"
        },
        {
            "Plate Number": "WIU923",
            "Company": "SADC"
        },
        {
            "Plate Number": "URI809",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMV685",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABE9837",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABW7746",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABE9939",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABE9829",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCY9157",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCY9159",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCY9158",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCY9156",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCY9155",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAT2843",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAT2845",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAR1779",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAR1778",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAT2844",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAT2846",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5823",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5824",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBF9380",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBG4982",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBG4983",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBG4981",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT8120",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT8122",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NBT8117",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT7891",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT7890",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NBT7892",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBT7885",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9120",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "JM9116",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9350",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9346",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9353",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDI3457",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9352",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDL6578",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5463",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5464",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5461",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5465",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5462",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAQ3403",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3367",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3368",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3366",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3365",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3361",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3363",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3364",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3362",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAQ3357",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2681",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2679",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2680",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NDA2678",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBF9382",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBF9384",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBF9377",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBG4980",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "CTH495",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "PIM262",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMR984",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMK967",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RMP227",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RMV693",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMV823",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1166",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NAV1168",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1167",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NAV1169",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1171",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1170",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3977",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3186",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NEB3206",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3194",
            "Company": "SADC"
        },
        {
            "Plate Number": "NEB3205",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3207",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NEB3197",
            "Company": "SADC"
        },
        {
            "Plate Number": "NEB3215",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3187",
            "Company": "SADC",
            "Section": "Customer"
        },
        {
            "Plate Number": "NEB3184",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3204",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3196",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NEB3195",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM5195",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "JM5196",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "JM5194",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "CRX234",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RBU955",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "XLA331",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "REX850",
            "Company": "SADC"
        },
        {
            "Plate Number": "RGE270",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RHG977",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RHK989",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RNK958",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "WIV402",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AAR1049",
            "Company": "SADC"
        },
        {
            "Plate Number": "AAR1053",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AAR1522",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AAQ5261",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDH3897",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDT2548",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AAR1668",
            "Company": "SADC"
        },
        {
            "Plate Number": "ABB6453",
            "Company": "SADC"
        },
        {
            "Plate Number": "AMA1582",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AWA4354",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDX6566",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDX6565",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDY4993",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDY7301",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDB4344",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDB4345",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "APA4815",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1034",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1036",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1040",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDQ1037",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1041",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "PDO565",
            "Company": "SADC"
        },
        {
            "Plate Number": "PQD223",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "PQD251",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RLG805",
            "Company": "SADC"
        },
        {
            "Plate Number": "ZNJ323",
            "Company": "SADC"
        },
        {
            "Plate Number": "PIM171",
            "Company": "SADC"
        },
        {
            "Plate Number": "RMD624",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "RMR219",
            "Company": "SADC"
        },
        {
            "Plate Number": "WAQ120",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "WAQ110",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "ABS2460",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AAI7859",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AAI7861",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AQA5952",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AQA5953",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AQA5951",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "ABH3575",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "ABS6144",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "ABS6141",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "ABS6142",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "ABS6143",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "ABS6140",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "ABS6145",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NAD7688",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NAV6865",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NAV6866",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NAV6864",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NAV6867",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NCL8502",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NAV6869",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NAV6870",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NAV6868",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBZ5648",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBZ5647",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NBG8430",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NBG8431",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBG8436",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBG8429",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NBG8435",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBG8432",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBG8434",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBG8433",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NBO8521",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NBO8519",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NBO8527",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBO8525",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NBO8524",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBO8522",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBO8523",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBO8526",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBO8520",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBO8518",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBQ4265",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NDQ1046",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1048",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1049",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NDQ1045",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NDQ1047",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCI3882",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NCI3873",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NCI3881",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NCI3880",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NCY1245",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "NCY9151",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9154",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9162",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9152",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9163",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9150",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9153",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9161",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NDD1130",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NCY9164",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NCY9160",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "NAW8168",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAW8164",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAW8165",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAX9293",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAX9291",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAX9290",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAX9289",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NAX9292",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NCX8612",
            "Company": "SADC"
        },
        {
            "Plate Number": "NCX8613",
            "Company": "SADC"
        },
        {
            "Plate Number": "NDD1128",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAL2483",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAV1184",
            "Company": "WILCON DEPOT INC"
        },
        {
            "Plate Number": "JM0006",
            "Company": "WILCON DEPOT INC"
        },
        {
            "Plate Number": "NAV1187",
            "Company": "WILCON DEPOT INC"
        },
        {
            "Plate Number": "NBC5822",
            "Company": "SADC"
        },
        {
            "Plate Number": "NBC5821",
            "Company": "SADC"
        },
        {
            "Plate Number": "NAW1526",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9168",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9473",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9474",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM9475",
            "Company": "SADC"
        },
        {
            "Plate Number": "NFY5458",
            "Company": "SADC"
        },
        {
            "Plate Number": "JM4383",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "JM4614",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "JM5865",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "JM4743",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBF9385",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBF9378",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NBF9386",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "MBF9383",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "CUR698",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUS903",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUT411",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUS769",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUU202",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUU842",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUU812",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUV510",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUV623",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUX438",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUX708",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "CUX688",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUA9970",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUA9969",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC1242",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC1434",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC1955",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC1244",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC1964",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC1998",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC3967",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "AUC3972",
            "Company": "SADC",
            "Section": "Base to Base"
        },
        {
            "Plate Number": "PUZ307",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "PUZ327",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "PUZ358",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "PUZ377",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "PUZ380",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "PUZ397",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AUA7140",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AUA6810",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AUA8251",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AUA8255",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AUA8247",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "AUA8390",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "FKC22070051",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "FKC22070144",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "TC2045817",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "TC2046310",
            "Company": "SADC",
            "Section": "Local Shipping"
        },
        {
            "Plate Number": "TUB238",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "TUB386",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "CUW925",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "CUW935",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA1623",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA1619",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA1624",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA1878",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "CUW915",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA1882",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUB1491",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUB1492",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUB1489",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUB1490",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA7609",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "AUA7614",
            "Company": "SADC",
            "Section": "Importation"
        },
        {
            "Plate Number": "NBT9198",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NEG1473",
            "Company": "MOVEASY"
        },
        {
            "Plate Number": "NEG1470",
            "Company": "MOVEASY"
        }
    ];

    // PRODUCTION
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";
    var childPromise = [];

    const query = req.query;
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            /**
            {
                "Plate Number": "WFT364",
                "Company": "SADC",
                "Section": "RESERVED"
            }
             */
            client.db(dbName).collection("vehicles_section").find().toArray().then(vsDocs => {
                client.db(dbName).collection("vehicles_company").find().toArray().then(vcDocs => {
                    data.forEach(val => {
                        var company = vcDocs.find(x => x.company == val["Company"]) || {};
                        var section = vsDocs.find(x => x.section == val["Section"]) || {};
                        var set = { 
                            company_id: company._id || "",
                            section_id: section._id || "",
                        };
                        childPromise.push( client.db(dbName).collection("vehicles").updateOne({ "Plate Number": val["Plate Number"] }, { $set: set }) );
                    });
                    Promise.all(childPromise).then(result => { res.json(result); }).catch(error => { console.log("Error",error); res.json(error); });
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

router.get('/test/update/entryupdates/:skip/:limit', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    // PRODUCTION
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";
    var childPromise = [];
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var arr = [];
            client.db(dbName).collection("dispatch").find({}).skip(skip).limit(limit).toArray().then(docs => {
                docs.forEach(val => {
                    var history = (val.history||{});
                    Object.keys(history).forEach(key => {
                        // if((history[key]||"").toLowerCase().indexOf("<username><username>") > -1){
                        if((history[key]||"").toLowerCase().indexOf("entry update") > -1){
                            arr.push(val._id);
                        }
                    });
                });
                res.json(arr);
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

module.exports = router;