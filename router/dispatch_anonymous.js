
const express = require('express');
const Joi = require('joi');
const moment = require('moment-timezone');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const schema = require("../utils/schema");

const collection = "dispatch";
const db = require("../utils/db");

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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];
    var testArr = [];
    var updatedData = [];

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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    var childPromise = [];
    var updatedData = [];

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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
                        ASSIGNED_VEHICLE_ID: val.ASSIGNED_VEHICLE_ID,
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
    var prodURL = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var devURL = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
var drivers_checkers = [];
router.get('/test/insert/driverchecker', (req,res,next)=>{
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    
    // PRODUCTION
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"

    // var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    
    var dbName = "wd-wilcon";

    var newSets = {};
    var notifSet = {};
    var noSet = {};
    var originalSet = null;
    var hasEntryUpdateOrRemark = {};
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
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

    // var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    const query = req.query;
    const _id = query._id;
    const enteredOrigin = query.enteredOrigin;
    const inTransit = query.inTransit;
    const OnSite = query.OnSite;
    const Returning = query.Returning;
    const Complete = query.Complete;
    const Incomplete = query.Incomplete;
    const view = query.view;
    const db = query.db;

    var url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    if(db == "production"){
        url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    }
    // PRODUCTION
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = 


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
    
    var dbName = "wd-wilcon";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
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
                                var onSite = (OnSite) ? ddd(OnSite) : null;
                                var returning = (Returning) ? ddd(Returning) : null;
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
                                if(OnSite){
                                    events_captured[onSite.timestamp] = "onSite";
                                }
                                if(Returning){
                                    events_captured[returning.timestamp] = "returning";
                                }
                                if(Complete){
                                    events_captured[complete.timestamp] = "complete";
                                }
                                
                                if(Incomplete){
                                    events_captured[in_transit.incomplete] = "incomplete";
                                }
            
                                var sortedEC = OBJECT.sortByKey(events_captured);
                                console.log("sortedEC",sortedEC);
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
                                        // // delete keys in between in transit and complete OR incomplete
                                        // if((inTransit && Number(key) > in_transit.timestamp) && ((complete && Number(key) < complete.timestamp) || (Incomplete && Number(key) < in_transit.incomplete))){
                                        //     delete sortedEC[key];
                                        // }
                                        // remove duplicates
                                        if(entered_origin && val == "entered_origin" && key != entered_origin.timestamp){
                                            delete sortedEC[key];
                                        }
                                        if(in_transit && val == "in_transit" && (inTransit && key != in_transit.timestamp)){
                                            delete sortedEC[key];
                                        }
                                        if(onSite && val == "onSite" && (OnSite && key != onSite.timestamp)){
                                            delete sortedEC[key];
                                        }
                                        if(returning && val == "returning" && (Returning && key != returning.timestamp)){
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
                                    if(original){
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
                                    }

                                    var updatedToAssigned = "";
                                    // console.log(doc.history);
                                    Object.keys(doc.history).forEach(key => {
                                        if((doc.history[key]||"").indexOf("Scheduled Dispatch -") > -1){
                                            updatedToAssigned = key;
                                        }
                                    })
    
                                    var sortedNewHistory = OBJECT.sortByKey(newHistory);
                                    var updatedHistory = {};
                                    updatedHistory.original = original;
                                    updatedHistory.vehicle = doc.history.vehicle;
                                    (updatedToAssigned) ? updatedHistory[updatedToAssigned] = "Scheduled Dispatch - Status updated to <status>assigned</status>." : null;
    
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
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var url1 = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
    var data = [];

    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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

// update dispatch status
router.get('/test/update/dispatchStatus/:_id/:status', (req,res,next)=>{
    const _id = req.params._id;
    const status = req.params.status;
    // PRODUCTION
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket1";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("dispatch").updateOne({_id},{$set:{status}}).then(docs => {
                res.json({ok:1});
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

var chassis = [];
// import chassis
router.get('/test/import/chassis', (req,res,next)=>{
    // PRODUCTION
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            var finalChassisList = [];

            client.db(dbName).collection("chassis_section").find({}).toArray().then(sDocs => {
                client.db(dbName).collection("chassis_company").find({}).toArray().then(cDocs => {
                    client.db(dbName).collection("chassis_type").find({}).toArray().then(tDocs => {
                        chassis.forEach(val => {
                            var newObj = {
                                _id: val._id,
                            };

                            var type = tDocs.find(x => x.type == val.type);
                            (type) ? newObj.type_id = db.getPrimaryKey(type._id) : null;

                            var section = sDocs.find(x => x.section == val.section);
                            (section) ? newObj.section_id = db.getPrimaryKey(section._id) : null;

                            var company = cDocs.find(x => x.company == val.company);
                            (company) ? newObj.company_id = db.getPrimaryKey(company._id) : null;

                            finalChassisList.push(newObj);
                        });
                        client.db(dbName).collection("chassis").insertMany(finalChassisList).then(result => {
                            res.json({ok:1});
                        });
                    });
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

var events = [];
// fix events
router.get('/test/fix/events/:from/:to', (req,res,next)=>{
    const from = Number(req.params.from);
    const to = Number(req.params.to);

    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon-logging";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            const childPromise = [];
            const slicedEvents = events.slice(from, to);
            slicedEvents.forEach(val => {
                var regex = new RegExp(val["Event start time"]); // .slice(0, -3)
                childPromise.push( client.db(dbName).collection("events").updateOne(
                    { timestamp: new Date(val["Event start time"]+"Z").toISOString(), stage: "end" , "USER_NAME": val["USER_NAME"], "GEOFENCE_NAME": val["GEOFENCE_NAME"]  }, // , "USER_NAME": val["USER_NAME"] 
                    { 
                        $set: {
                            timestamp: new Date(val["EVENT_TIME"]+"Z").toISOString()
                        }
                    },
                ) );
            });
            if(childPromise.length > 0){
                console.log("Start Promise",childPromise.length);
                Promise.all(childPromise).then(result => {
                    client.close();

                    var modified = 0;
                    result.forEach(val => {
                        modified += val.result.nModified;
                    });
                    res.json({ok:1,length:childPromise.length,modified});
                });
            } else {
                client.close();
                res.json({ok:1,length:childPromise.length});
            }
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// import geofence from another db
router.get('/test/import/geofence', (req,res,next)=>{
    const from = Number(req.params.from);
    const to = Number(req.params.to);

    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket2";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            const childPromise = [];
            client.db("wd-coket1").collection("geofences").find({}).toArray().then(docs => {
                docs.forEach(val => {
                    const set = {
                        // geofence_id: val.geofence_id,
                        cico: val.cico,
                        code: val.code,
                        site_name: val.site_name,
                    };
                    try { set.region_id = db.getPrimaryKey(val.region_id); } catch(eror) {}
                    try { set.cluster_id = db.getPrimaryKey(val.cluster_id); } catch(eror) {}
                    
                    childPromise.push( client.db(dbName).collection("geofences").updateOne(
                        { short_name: val.short_name }, 
                        { 
                            $set: set
                        },
                        // { upsert: true }
                    ) );
                });
                if(childPromise.length > 0){
                    console.log("Start Promise",childPromise.length);
                    Promise.all(childPromise).then(result => {
                        client.close();
    
                        res.json({ok:1,length:childPromise.length});
                    });
                } else {
                    client.close();
                    res.json({ok:1,length:childPromise.length});
                }
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// delete geofences
router.get('/test/delete/geofence', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket2";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("geofences").deleteMany({}).then(result => {
                client.close();
                res.json({ok:1});
            }).catch(error => {
                client.close();
                res.json({error});
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// import regions & clusters from another db
router.get('/test/import/regionsClusters', (req,res,next)=>{
    const from = Number(req.params.from);
    const to = Number(req.params.to);

    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-coket2";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            const childPromise = [];
            client.db("wd-coket1").collection("regions").find({}).toArray().then(docs => {
                childPromise.push( client.db(dbName).collection("regions").insertMany(docs));

                client.db("wd-coket1").collection("clusters").find({}).toArray().then(docs => {
                    childPromise.push( client.db(dbName).collection("clusters").insertMany(docs));

                    if(childPromise.length > 0){
                        console.log("Start Promise",childPromise.length);
                        Promise.all(childPromise).then(result => {
                            client.close();
        
                            res.json({ok:1,length:childPromise.length});
                        });
                    } else {
                        client.close();
                        res.json({ok:1,length:childPromise.length});
                    }
                });
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// remove history.vehicle
router.get('/test/delete/history/vehicle', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("dispatch").updateMany({ "history.vehicle": { $exists: true } }, { $unset: { "history.vehicle": "" } }).then(result => {
                client.close();
                res.json({ok:1,result});
            }).catch(error => {
                client.close();
                res.json({error});
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});

// export dispatch entries
router.get('/test/deleted/dispatch', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    var dbName = "wd-wilcon-logging";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db(dbName).collection("user_action").deleteMany({ collection: "dispatch" }).then(docs => {
                client.close();
                res.json(docs);
            }).catch(error => {
                client.close();
                res.json({error});
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


var cData = [];
// insert customers
router.get('/test/insert/customers', (req,res,next)=>{
    var prodURL = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var devURL = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"

    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};

    var dbName = "wd-coket2";
    const childPromise = [];

    MongoClient.connect(prodURL, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
            res.json({error:1,error:err});
        } else {
            client.db(dbName).collection("regions").find({}).toArray().then(rDocs => {
                client.db(dbName).collection("geofences").find({}).toArray().then(gDocs => {
                    const finalData = [];
                    cData.forEach(val => {
                        const regionId = (rDocs.find(x => x.code == val.region) || {})._id;
                        const geofenceId = (gDocs.find(x => x.short_name == val.dc) || {})._id;

                        if(val.number) {
                            finalData.push({
                                number: val.number,
                                name: val.name,
                                service_model: val.service_model,
                                mode_of_transport: val.mode_of_transport,
                                type: val.type,
                                region_id: regionId ? db.getPrimaryKey(regionId) : "",
                                dc_id: geofenceId ? db.getPrimaryKey(geofenceId) : "",
                            });
                        }
                    });
                    client.db(dbName).collection("customers").insertMany(finalData).then(result => {
                        client.close();
                        res.json({ok:1,result});
                    }).catch(error => {
                        client.close();
                        console.log("ERROR2",error);
                        res.json({error:1,error});
                    });
                }).catch(error => {
                    client.close();
                    console.log("ERRO3",error);
                    res.json({error:1,error});
                });
            }).catch(error => {
                client.close();
                console.log("ERROR4",error);
                res.json({error:1,error});
            });
        }
    });

   
});


// update overspeeding_events
router.get('/test/update/overspeeding_events/:skip/:limit', (req,res,next)=>{
    const skip = Number(req.params.skip);
    const limit = Number(req.params.limit);
    var prodURL = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    var devURL = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"

    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};

    var dbName = "wd-fleet-logging";
    const childPromise = [];

    MongoClient.connect(devURL, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
            res.json({error:1,error:err});
        } else {
            const query = client.db(dbName).collection("overspeeding_events");

            const deleteArrIds = [];
            const insertArr = [];

            query.find({ id: { $exists: false } }).skip(skip).limit(limit).toArray().then(docs => {
                console.log(docs.length);
                docs.forEach(val => {
                    if(!val.id){

                        // add to delete array
                        deleteArrIds.push(val._id);


                        // add to insert array
                        const obj = {
                            id: val._id,
                            userID: val.userID,
                            RuleName: val.RuleName,
                            UserName: val.UserName,
                            Namespace: val.Namespace,
                            Value: val.Value,
                            State: val.State,
                            lng: val.lng,
                            lat: val.lat,
                            alt: val.alt,
                            timestamp: new Date(val.utc).toISOString(),
                        };
                        
                        insertArr.push(obj);
                    }
                });

                // delete
                if(deleteArrIds.length > 0){
                    childPromise.push(
                        query.deleteMany({ _id: { $in: deleteArrIds } })
                    );
                }

                // insert
                if(insertArr.length > 0){
                    childPromise.push(
                        query.insertMany(insertArr)
                    );
                }
                
                if(childPromise.length > 0){
                    Promise.all(childPromise).then(result => {
                        client.close();
                        res.json({ok:1,result});
                    }).catch(error => {
                        client.close();
                        console.log("ERROR2",error);
                        res.json({error:1,error});
                    });
                } else {
                    client.close();
                    res.json({ok:1,empty:1});
                }

            }).catch(error => {
                client.close();
                console.log("ERROR4",error);
                res.json({error:1,error});
            });
        }
    });

   
});


module.exports = router;