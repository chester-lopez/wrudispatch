
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
    var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
var drivers_checkers = [];
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
    
    // PRODUCTION
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"

    // var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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

    // var url1 = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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

    var url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    if(db == "production"){
        url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    }
    // PRODUCTION
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
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
    var data = [];

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

// update dispatch status
router.get('/test/update/dispatchStatus/:_id/:status', (req,res,next)=>{
    const _id = req.params._id;
    const status = req.params.status;
    // PRODUCTION
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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

var events = [
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T16:23:38",
      "Event start time": "2021-07-30T16:22:35",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T16:23:38",
      "Event start time": "2021-07-30T16:22:35",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T16:33:33",
      "Event start time": "2021-07-30T16:22:41",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T16:40:48",
      "Event start time": "2021-07-30T16:39:39",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T16:40:48",
      "Event start time": "2021-07-30T16:39:39",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T16:46:30",
      "Event start time": "2021-07-30T16:45:01",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T16:48:51",
      "Event start time": "2021-07-30T16:43:47",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T16:57:10",
      "Event start time": "2021-07-30T16:56:24",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T16:57:10",
      "Event start time": "2021-07-30T16:56:24",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T17:07:59",
      "Event start time": "2021-07-30T17:01:45",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T17:07:59",
      "Event start time": "2021-07-30T17:01:45",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T17:13:54",
      "Event start time": "2021-07-30T17:10:59",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T17:13:54",
      "Event start time": "2021-07-30T17:10:59",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-30T17:14:12",
      "Event start time": "2021-07-30T17:11:15",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-30T17:21:23",
      "Event start time": "2021-07-30T17:19:20",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-07-30T17:22:56",
      "Event start time": "2021-07-30T17:21:56",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T17:31:10",
      "Event start time": "2021-07-30T17:26:07",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T17:38:13",
      "Event start time": "2021-07-30T17:15:02",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T17:38:13",
      "Event start time": "2021-07-30T17:15:02",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T17:46:05",
      "Event start time": "2021-07-30T17:43:56",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T17:46:54",
      "Event start time": "2021-07-30T17:36:37",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T18:02:29",
      "Event start time": "2021-07-30T18:01:00",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-07-30T18:10:46",
      "Event start time": "2021-07-30T18:10:18",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T18:14:01",
      "Event start time": "2021-07-30T18:13:57",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-30T18:22:36",
      "Event start time": "2021-07-30T17:33:41",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T18:30:09",
      "Event start time": "2021-07-30T17:18:17",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T18:31:12",
      "Event start time": "2021-07-30T18:29:31",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T18:42:21",
      "Event start time": "2021-07-30T18:40:17",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T18:42:42",
      "Event start time": "2021-07-30T17:48:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T18:47:56",
      "Event start time": "2021-07-30T18:31:48",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T18:48:31",
      "Event start time": "2021-07-30T18:37:14",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T18:49:57",
      "Event start time": "2021-07-30T17:18:17",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T19:00:34",
      "Event start time": "2021-07-30T18:50:42",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T19:04:51",
      "Event start time": "2021-07-30T17:48:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T19:09:55",
      "Event start time": "2021-07-30T19:09:41",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T19:09:56",
      "Event start time": "2021-07-30T19:09:41",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T19:10:47",
      "Event start time": "2021-07-30T18:37:34",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T19:19:17",
      "Event start time": "2021-07-30T19:17:27",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T19:23:10",
      "Event start time": "2021-07-30T19:17:05",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T19:23:10",
      "Event start time": "2021-07-30T19:17:05",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T19:34:22",
      "Event start time": "2021-07-30T17:39:15",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T19:34:23",
      "Event start time": "2021-07-30T17:39:15",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T19:48:10",
      "Event start time": "2021-07-30T19:10:52",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T19:48:10",
      "Event start time": "2021-07-30T19:10:52",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-30T20:00:43",
      "Event start time": "2021-07-30T19:00:51",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-30T20:02:20",
      "Event start time": "2021-07-30T20:00:50",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T20:03:23",
      "Event start time": "2021-07-30T20:01:21",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T20:11:14",
      "Event start time": "2021-07-30T20:10:37",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T20:13:28",
      "Event start time": "2021-07-30T19:52:20",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T20:14:41",
      "Event start time": "2021-07-30T20:10:12",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T20:18:01",
      "Event start time": "2021-07-30T19:52:20",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T20:18:24",
      "Event start time": "2021-07-30T20:16:28",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-30T20:19:36",
      "Event start time": "2021-07-30T20:19:17",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T20:22:12",
      "Event start time": "2021-07-30T20:20:07",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T20:26:12",
      "Event start time": "2021-07-30T20:23:09",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T20:33:13",
      "Event start time": "2021-07-30T18:03:28",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T20:33:13",
      "Event start time": "2021-07-30T18:03:28",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-30T20:34:02",
      "Event start time": "2021-07-30T20:33:38",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-30T20:40:18",
      "Event start time": "2021-07-30T20:39:57",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-30T20:43:38",
      "Event start time": "2021-07-30T20:41:03",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T20:54:36",
      "Event start time": "2021-07-30T20:54:17",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T20:54:36",
      "Event start time": "2021-07-30T20:54:17",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-30T20:55:37",
      "Event start time": "2021-07-30T20:55:23",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T20:59:40",
      "Event start time": "2021-07-30T19:55:11",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T20:59:40",
      "Event start time": "2021-07-30T19:55:11",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-30T21:01:55",
      "Event start time": "2021-07-30T18:33:50",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T21:07:33",
      "Event start time": "2021-07-30T21:00:29",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-30T21:07:47",
      "Event start time": "2021-07-30T21:03:53",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T21:51:37",
      "Event start time": "2021-07-30T20:18:38",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T21:51:37",
      "Event start time": "2021-07-30T20:18:38",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T22:21:19",
      "Event start time": "2021-07-30T22:19:35",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-30T22:25:55",
      "Event start time": "2021-07-30T20:38:14",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-30T22:44:34",
      "Event start time": "2021-07-30T22:43:28",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T22:54:16",
      "Event start time": "2021-07-30T22:33:12",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-30T23:06:08",
      "Event start time": "2021-07-30T21:00:38",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-30T23:06:08",
      "Event start time": "2021-07-30T21:00:38",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-30T23:08:21",
      "Event start time": "2021-07-30T23:07:21",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-30T23:36:09",
      "Event start time": "2021-07-30T21:28:03",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-30T23:55:08",
      "Event start time": "2021-07-30T23:47:08",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T00:01:06",
      "Event start time": "2021-07-30T22:01:11",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T00:07:56",
      "Event start time": "2021-07-31T00:03:09",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T00:13:16",
      "Event start time": "2021-07-31T00:09:21",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T00:18:01",
      "Event start time": "2021-07-30T22:17:23",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:18:01",
      "Event start time": "2021-07-30T22:17:23",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T00:19:15",
      "Event start time": "2021-07-31T00:15:37",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:21:32",
      "Event start time": "2021-07-31T00:21:29",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T00:22:07",
      "Event start time": "2021-07-30T22:52:32",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "WHSE 12",
      "EVENT_TIME": "2021-07-31T00:25:23",
      "Event start time": "2021-07-31T00:24:50",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-07-31T00:26:06",
      "Event start time": "2021-07-30T16:46:05",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T00:30:21",
      "Event start time": "2021-07-31T00:28:46",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:31:11",
      "Event start time": "2021-07-31T00:10:39",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:32:01",
      "Event start time": "2021-07-30T23:24:36",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:35:50",
      "Event start time": "2021-07-31T00:32:28",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T00:42:43",
      "Event start time": "2021-07-30T22:34:51",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:46:37",
      "Event start time": "2021-07-31T00:45:30",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T00:50:25",
      "Event start time": "2021-07-31T00:32:28",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T00:52:57",
      "Event start time": "2021-07-31T00:08:54",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T00:54:58",
      "Event start time": "2021-07-31T00:52:20",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T00:55:00",
      "Event start time": "2021-07-31T00:52:34",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T00:55:16",
      "Event start time": "2021-07-31T00:10:39",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T00:56:56",
      "Event start time": "2021-07-31T00:56:21",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-07-31T00:59:29",
      "Event start time": "2021-07-31T00:59:10",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T01:04:43",
      "Event start time": "2021-07-31T00:56:55",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T01:06:39",
      "Event start time": "2021-07-31T00:22:18",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T01:10:50",
      "Event start time": "2021-07-31T00:49:33",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T01:10:53",
      "Event start time": "2021-07-31T01:10:27",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T01:11:40",
      "Event start time": "2021-07-31T00:36:47",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T01:12:37",
      "Event start time": "2021-07-31T01:12:16",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T01:14:02",
      "Event start time": "2021-07-31T00:35:13",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T01:15:03",
      "Event start time": "2021-07-31T01:14:35",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T01:15:44",
      "Event start time": "2021-07-31T01:08:13",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T01:16:06",
      "Event start time": "2021-07-31T00:42:19",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T01:16:14",
      "Event start time": "2021-07-31T01:15:47",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 49",
      "EVENT_TIME": "2021-07-31T01:17:34",
      "Event start time": "2021-07-30T22:14:06",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T01:17:45",
      "Event start time": "2021-07-31T01:16:57",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T01:20:20",
      "Event start time": "2021-07-31T01:19:52",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T01:20:25",
      "Event start time": "2021-07-30T18:54:21",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T01:20:56",
      "Event start time": "2021-07-31T01:20:22",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T01:22:45",
      "Event start time": "2021-07-31T01:22:06",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T01:25:28",
      "Event start time": "2021-07-31T01:24:56",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T01:30:12",
      "Event start time": "2021-07-31T01:25:47",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T01:40:37",
      "Event start time": "2021-07-30T23:23:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T01:50:50",
      "Event start time": "2021-07-30T23:23:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T01:55:24",
      "Event start time": "2021-07-31T01:50:19",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T01:56:54",
      "Event start time": "2021-07-31T00:22:17",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T01:57:53",
      "Event start time": "2021-07-31T01:04:54",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T01:59:30",
      "Event start time": "2021-07-31T01:48:24",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T02:06:04",
      "Event start time": "2021-07-31T02:03:26",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T02:09:48",
      "Event start time": "2021-07-31T00:49:33",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-07-31T02:12:13",
      "Event start time": "2021-07-30T22:01:31",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-07-31T02:13:39",
      "Event start time": "2021-07-30T21:38:47",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T02:18:40",
      "Event start time": "2021-07-31T02:11:36",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-07-31T02:21:06",
      "Event start time": "2021-07-31T02:19:03",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T02:27:32",
      "Event start time": "2021-07-31T02:15:39",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-07-31T02:31:21",
      "Event start time": "2021-07-31T02:25:47",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T02:33:53",
      "Event start time": "2021-07-31T02:33:27",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T02:39:56",
      "Event start time": "2021-07-31T02:39:39",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T02:40:37",
      "Event start time": "2021-07-31T01:56:56",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-07-31T02:40:56",
      "Event start time": "2021-07-31T02:39:28",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T02:44:25",
      "Event start time": "2021-07-31T01:53:44",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T02:44:34",
      "Event start time": "2021-07-31T01:51:06",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-07-31T02:45:19",
      "Event start time": "2021-07-31T02:44:17",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T02:49:39",
      "Event start time": "2021-07-31T02:49:23",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T02:51:56",
      "Event start time": "2021-07-30T18:44:01",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T02:53:31",
      "Event start time": "2021-07-31T02:51:21",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T02:56:05",
      "Event start time": "2021-07-31T02:53:30",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T02:57:52",
      "Event start time": "2021-07-30T16:48:31",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T02:59:14",
      "Event start time": "2021-07-31T01:16:17",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T03:03:14",
      "Event start time": "2021-07-31T02:59:35",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T03:06:20",
      "Event start time": "2021-07-31T03:00:46",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 25",
      "EVENT_TIME": "2021-07-31T03:06:23",
      "Event start time": "2021-07-30T21:48:26",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T03:08:35",
      "Event start time": "2021-07-31T01:32:50",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T03:11:58",
      "Event start time": "2021-07-31T03:06:12",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T03:13:18",
      "Event start time": "2021-07-31T03:12:14",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T03:14:50",
      "Event start time": "2021-07-30T21:48:20",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T03:20:17",
      "Event start time": "2021-07-31T03:13:34",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-07-31T03:20:22",
      "Event start time": "2021-07-30T23:50:09",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T03:24:55",
      "Event start time": "2021-07-31T03:19:33",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T03:25:42",
      "Event start time": "2021-07-31T03:24:39",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T03:27:25",
      "Event start time": "2021-07-31T03:26:23",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "DEPOT 21",
      "EVENT_TIME": "2021-07-31T03:28:59",
      "Event start time": "2021-07-31T01:35:40",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-07-31T03:29:52",
      "Event start time": "2021-07-31T02:38:52",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T03:30:38",
      "Event start time": "2021-07-31T02:01:56",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T03:37:19",
      "Event start time": "2021-07-31T01:03:44",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-07-31T03:41:01",
      "Event start time": "2021-07-31T03:38:48",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T03:41:19",
      "Event start time": "2021-07-31T03:40:59",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T03:42:54",
      "Event start time": "2021-07-31T03:42:35",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 8",
      "EVENT_TIME": "2021-07-31T03:44:45",
      "Event start time": "2021-07-31T01:57:39",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T03:53:13",
      "Event start time": "2021-07-31T03:48:02",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T03:53:36",
      "Event start time": "2021-07-31T03:30:41",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-07-31T03:54:26",
      "Event start time": "2021-07-31T03:50:53",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T03:57:58",
      "Event start time": "2021-07-31T03:42:55",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T03:59:32",
      "Event start time": "2021-07-31T03:59:23",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T04:01:40",
      "Event start time": "2021-07-31T04:00:55",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T04:04:06",
      "Event start time": "2021-07-31T01:39:55",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-07-31T04:15:17",
      "Event start time": "2021-07-31T04:06:30",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-07-31T04:15:34",
      "Event start time": "2021-07-31T01:59:55",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T04:19:24",
      "Event start time": "2021-07-31T04:03:17",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T04:21:34",
      "Event start time": "2021-07-31T04:21:11",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T04:22:35",
      "Event start time": "2021-07-31T04:21:42",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T04:22:45",
      "Event start time": "2021-07-30T18:33:06",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-07-31T04:28:30",
      "Event start time": "2021-07-31T04:27:27",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T04:34:40",
      "Event start time": "2021-07-31T04:29:36",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-07-31T04:36:05",
      "Event start time": "2021-07-30T16:35:47",
      "USER_NAME": "WD 6W-74 NFY5461"
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-07-31T04:38:08",
      "Event start time": "2021-07-31T04:37:37",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T04:45:20",
      "Event start time": "2021-07-31T04:44:42",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T04:45:34",
      "Event start time": "2021-07-31T04:45:18",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-07-31T04:53:19",
      "Event start time": "2021-07-31T04:19:02",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T04:54:33",
      "Event start time": "2021-07-31T04:52:59",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T04:56:51",
      "Event start time": "2021-07-30T22:49:37",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 26",
      "EVENT_TIME": "2021-07-31T04:58:40",
      "Event start time": "2021-07-31T02:51:37",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T05:01:05",
      "Event start time": "2021-07-31T05:00:31",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T05:04:25",
      "Event start time": "2021-07-31T05:00:09",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T05:05:34",
      "Event start time": "2021-07-31T05:04:50",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T05:07:31",
      "Event start time": "2021-07-31T03:07:29",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:10:56",
      "Event start time": "2021-07-31T05:05:35",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T05:11:32",
      "Event start time": "2021-07-31T04:55:28",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T05:11:54",
      "Event start time": "2021-07-31T05:11:39",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:12:23",
      "Event start time": "2021-07-31T05:12:12",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T05:13:36",
      "Event start time": "2021-07-31T04:17:31",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T05:15:47",
      "Event start time": "2021-07-31T05:14:45",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T05:16:14",
      "Event start time": "2021-07-31T05:15:50",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T05:16:58",
      "Event start time": "2021-07-31T05:13:49",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T05:19:57",
      "Event start time": "2021-07-31T03:58:44",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-07-31T05:20:25",
      "Event start time": "2021-07-31T05:16:18",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:21:01",
      "Event start time": "2021-07-31T05:20:09",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-07-31T05:21:26",
      "Event start time": "2021-07-31T05:20:23",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:22:41",
      "Event start time": "2021-07-31T05:21:32",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:24:56",
      "Event start time": "2021-07-31T05:24:40",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:34:53",
      "Event start time": "2021-07-31T05:33:00",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:36:13",
      "Event start time": "2021-07-31T05:35:26",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T05:37:08",
      "Event start time": "2021-07-31T05:36:04",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T05:48:44",
      "Event start time": "2021-07-31T05:37:17",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:49:18",
      "Event start time": "2021-07-31T05:44:14",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T05:49:49",
      "Event start time": "2021-07-31T05:48:43",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T05:50:46",
      "Event start time": "2021-07-31T05:50:09",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T05:55:53",
      "Event start time": "2021-07-31T05:55:15",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T05:57:10",
      "Event start time": "2021-07-31T05:55:05",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T05:58:57",
      "Event start time": "2021-07-31T05:58:07",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T06:05:09",
      "Event start time": "2021-07-31T05:16:14",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T06:07:38",
      "Event start time": "2021-07-31T05:45:36",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T06:12:35",
      "Event start time": "2021-07-31T06:12:11",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-07-31T06:12:42",
      "Event start time": "2021-07-31T04:38:28",
      "USER_NAME": "WD 4W-122 NBT8121"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T06:13:47",
      "Event start time": "2021-07-31T06:13:42",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-07-31T06:19:57",
      "Event start time": "2021-07-31T04:03:18",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T06:20:01",
      "Event start time": "2021-07-31T06:17:35",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T06:24:51",
      "Event start time": "2021-07-31T06:22:54",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "HO6",
      "EVENT_TIME": "2021-07-31T06:27:40",
      "Event start time": "2021-07-31T05:25:09",
      "USER_NAME": "WD 6W-69 NDI3457"
    },
    {
      "GEOFENCE_NAME": "DEPOT 20",
      "EVENT_TIME": "2021-07-31T06:30:02",
      "Event start time": "2021-07-31T06:29:25",
      "USER_NAME": "WD 6W-67 NDI3031"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-07-31T06:32:13",
      "Event start time": "2021-07-31T04:18:32",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T06:33:18",
      "Event start time": "2021-07-31T06:30:42",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T06:34:13",
      "Event start time": "2021-07-31T06:32:10",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T06:36:19",
      "Event start time": "2021-07-31T06:32:16",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-07-31T06:38:42",
      "Event start time": "2021-07-31T06:37:41",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T06:38:49",
      "Event start time": "2021-07-31T06:35:35",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T06:40:16",
      "Event start time": "2021-07-31T06:31:59",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T06:41:48",
      "Event start time": "2021-07-31T05:33:01",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T06:42:40",
      "Event start time": "2021-07-31T06:40:57",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T06:43:48",
      "Event start time": "2021-07-31T06:42:02",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T06:46:26",
      "Event start time": "2021-07-31T06:45:24",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T06:48:31",
      "Event start time": "2021-07-31T06:43:49",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T06:48:33",
      "Event start time": "2021-07-31T06:42:38",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T06:49:58",
      "Event start time": "2021-07-31T06:46:55",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-07-31T06:50:02",
      "Event start time": "2021-07-31T06:13:54",
      "USER_NAME": "WD 6W-66 NDI3033"
    },
    {
      "GEOFENCE_NAME": "DEPOT 32",
      "EVENT_TIME": "2021-07-31T06:57:16",
      "Event start time": "2021-07-31T04:59:29",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T06:58:01",
      "Event start time": "2021-07-31T06:08:37",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-07-31T07:03:40",
      "Event start time": "2021-07-31T07:02:38",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T07:04:11",
      "Event start time": "2021-07-31T03:24:17",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T07:04:56",
      "Event start time": "2021-07-31T06:54:46",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T07:34:54",
      "Event start time": "2021-07-31T07:20:54",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T07:38:22",
      "Event start time": "2021-07-31T07:32:19",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T07:40:23",
      "Event start time": "2021-07-31T07:32:18",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T07:40:46",
      "Event start time": "2021-07-31T07:35:42",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T07:41:03",
      "Event start time": "2021-07-31T06:50:41",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 42",
      "EVENT_TIME": "2021-07-31T07:53:44",
      "Event start time": "2021-07-31T06:42:11",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T08:05:38",
      "Event start time": "2021-07-31T08:03:35",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T08:10:02",
      "Event start time": "2021-07-31T08:04:26",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-07-31T08:16:19",
      "Event start time": "2021-07-31T07:57:24",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T08:25:36",
      "Event start time": "2021-07-31T08:23:41",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "WHSE 14",
      "EVENT_TIME": "2021-07-31T08:25:37",
      "Event start time": "2021-07-31T08:24:58",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T08:26:24",
      "Event start time": "2021-07-31T08:24:13",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T08:27:56",
      "Event start time": "2021-07-31T08:26:55",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T08:28:02",
      "Event start time": "2021-07-31T08:25:41",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T08:41:16",
      "Event start time": "2021-07-31T08:22:44",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T08:41:16",
      "Event start time": "2021-07-31T08:34:06",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T08:43:46",
      "Event start time": "2021-07-31T08:41:37",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T08:43:57",
      "Event start time": "2021-07-31T08:32:56",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T08:45:05",
      "Event start time": "2021-07-31T08:44:33",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T08:45:17",
      "Event start time": "2021-07-31T08:14:22",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T08:51:15",
      "Event start time": "2021-07-30T17:48:50",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T08:51:15",
      "Event start time": "2021-07-31T07:48:53",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T08:52:05",
      "Event start time": "2021-07-31T08:23:03",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T08:53:23",
      "Event start time": "2021-07-31T08:52:21",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T08:53:56",
      "Event start time": "2021-07-31T08:52:26",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T08:54:42",
      "Event start time": "2021-07-31T08:41:54",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T08:57:52",
      "Event start time": "2021-07-31T07:00:34",
      "USER_NAME": "WD 4W-116 NBO8532"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T08:58:30",
      "Event start time": "2021-07-31T05:50:03",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T08:59:46",
      "Event start time": "2021-07-31T08:56:28",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T09:01:33",
      "Event start time": "2021-07-31T08:36:01",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T09:04:40",
      "Event start time": "2021-07-31T09:02:38",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-07-31T09:08:38",
      "Event start time": "2021-07-31T08:57:07",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T09:09:34",
      "Event start time": "2021-07-31T09:08:24",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 21",
      "EVENT_TIME": "2021-07-31T09:10:16",
      "Event start time": "2021-07-31T09:08:09",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:15:34",
      "Event start time": "2021-07-31T09:14:23",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:15:56",
      "Event start time": "2021-07-31T09:15:47",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:16:29",
      "Event start time": "2021-07-31T09:16:22",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-07-31T09:21:55",
      "Event start time": "2021-07-31T07:41:31",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T09:22:12",
      "Event start time": "2021-07-31T09:02:57",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T09:22:15",
      "Event start time": "2021-07-31T03:54:06",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T09:25:00",
      "Event start time": "2021-07-31T09:23:16",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T09:28:40",
      "Event start time": "2021-07-31T09:14:09",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:29:33",
      "Event start time": "2021-07-31T09:17:26",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T09:32:46",
      "Event start time": "2021-07-31T09:24:12",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T09:33:57",
      "Event start time": "2021-07-31T09:26:27",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-07-31T09:34:24",
      "Event start time": "2021-07-31T09:30:21",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T09:35:36",
      "Event start time": "2021-07-31T09:33:08",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T09:35:55",
      "Event start time": "2021-07-30T19:21:08",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T09:42:38",
      "Event start time": "2021-07-31T09:36:13",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:43:16",
      "Event start time": "2021-07-31T09:37:04",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:45:03",
      "Event start time": "2021-07-31T09:44:15",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T09:45:13",
      "Event start time": "2021-07-31T09:26:27",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T09:46:22",
      "Event start time": "2021-07-31T09:42:51",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-07-31T09:47:54",
      "Event start time": "2021-07-31T09:42:04",
      "USER_NAME": "WD 4W-140 NFY5459"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:51:21",
      "Event start time": "2021-07-31T09:46:16",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-07-31T09:54:50",
      "Event start time": "2021-07-31T09:32:31",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:56:12",
      "Event start time": "2021-07-31T09:52:17",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T09:58:24",
      "Event start time": "2021-07-31T09:57:22",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T10:00:05",
      "Event start time": "2021-07-31T09:59:24",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T10:06:31",
      "Event start time": "2021-07-31T10:02:25",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T10:07:16",
      "Event start time": "2021-07-31T10:07:10",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T10:09:30",
      "Event start time": "2021-07-31T10:00:52",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T10:13:20",
      "Event start time": "2021-07-31T09:38:48",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T10:20:25",
      "Event start time": "2021-07-31T10:20:19",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T10:22:09",
      "Event start time": "2021-07-31T10:00:57",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T10:22:17",
      "Event start time": "2021-07-31T09:54:16",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-07-31T10:24:39",
      "Event start time": "2021-07-31T10:11:58",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "WHSE 12",
      "EVENT_TIME": "2021-07-31T10:29:06",
      "Event start time": "2021-07-31T10:24:02",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T10:34:25",
      "Event start time": "2021-07-31T10:07:12",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T10:45:18",
      "Event start time": "2021-07-31T10:34:02",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T10:46:24",
      "Event start time": "2021-07-31T10:23:24",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-07-31T10:54:11",
      "Event start time": "2021-07-31T10:51:33",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T10:54:33",
      "Event start time": "2021-07-31T10:48:10",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T10:58:53",
      "Event start time": "2021-07-31T10:10:11",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-07-31T11:07:04",
      "Event start time": "2021-07-31T11:00:56",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T11:08:10",
      "Event start time": "2021-07-31T11:02:12",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:11:15",
      "Event start time": "2021-07-31T09:00:43",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T11:12:43",
      "Event start time": "2021-07-31T11:08:29",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 18",
      "EVENT_TIME": "2021-07-31T11:13:48",
      "Event start time": "2021-07-31T11:08:08",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T11:20:32",
      "Event start time": "2021-07-31T11:16:18",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T11:29:09",
      "Event start time": "2021-07-31T11:20:45",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T11:38:59",
      "Event start time": "2021-07-31T09:00:43",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:38:59",
      "Event start time": "2021-07-31T11:11:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T11:41:29",
      "Event start time": "2021-07-31T11:40:22",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:41:30",
      "Event start time": "2021-07-31T11:40:22",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T11:43:28",
      "Event start time": "2021-07-31T11:36:49",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T11:46:47",
      "Event start time": "2021-07-31T07:38:22",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:46:47",
      "Event start time": "2021-07-31T07:43:37",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T11:46:59",
      "Event start time": "2021-07-31T11:45:51",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:53:19",
      "Event start time": "2021-07-31T11:52:33",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:53:19",
      "Event start time": "2021-07-31T11:52:33",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T11:55:19",
      "Event start time": "2021-07-31T11:48:01",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T11:57:59",
      "Event start time": "2021-07-31T11:52:00",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T11:59:41",
      "Event start time": "2021-07-31T11:56:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T11:59:42",
      "Event start time": "2021-07-31T11:56:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 58",
      "EVENT_TIME": "2021-07-31T12:04:17",
      "Event start time": "2021-07-31T12:03:15",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T12:05:01",
      "Event start time": "2021-07-31T12:04:56",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T12:05:35",
      "Event start time": "2021-07-31T12:05:10",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 11",
      "EVENT_TIME": "2021-07-31T12:11:36",
      "Event start time": "2021-07-31T09:47:31",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T12:12:00",
      "Event start time": "2021-07-31T12:05:56",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T12:20:59",
      "Event start time": "2021-07-31T12:15:44",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T12:30:38",
      "Event start time": "2021-07-31T11:39:36",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T12:43:49",
      "Event start time": "2021-07-31T12:43:45",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 40",
      "EVENT_TIME": "2021-07-31T12:46:39",
      "Event start time": "2021-07-31T10:02:03",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DEPOT 8",
      "EVENT_TIME": "2021-07-31T12:54:28",
      "Event start time": "2021-07-31T08:07:11",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T13:10:23",
      "Event start time": "2021-07-31T13:09:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T13:10:23",
      "Event start time": "2021-07-31T13:09:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T13:19:47",
      "Event start time": "2021-07-31T13:18:45",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-07-31T13:28:13",
      "Event start time": "2021-07-31T10:20:05",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T13:28:50",
      "Event start time": "2021-07-31T13:18:45",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T13:37:13",
      "Event start time": "2021-07-31T13:35:58",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T13:39:39",
      "Event start time": "2021-07-31T13:38:48",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T13:58:11",
      "Event start time": "2021-07-31T10:56:33",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T13:58:11",
      "Event start time": "2021-07-31T10:59:34",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T14:00:38",
      "Event start time": "2021-07-31T10:30:05",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T14:00:38",
      "Event start time": "2021-07-31T10:13:57",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-07-31T14:03:39",
      "Event start time": "2021-07-31T13:38:00",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T14:03:39",
      "Event start time": "2021-07-31T13:32:07",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T14:15:44",
      "Event start time": "2021-07-31T12:19:58",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T14:15:44",
      "Event start time": "2021-07-31T12:19:58",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T14:21:53",
      "Event start time": "2021-07-31T14:21:27",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T14:22:26",
      "Event start time": "2021-07-31T14:22:11",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-07-31T14:35:24",
      "Event start time": "2021-07-31T14:34:11",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T14:39:05",
      "Event start time": "2021-07-31T14:35:02",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T14:41:43",
      "Event start time": "2021-07-31T14:40:39",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-07-31T14:45:51",
      "Event start time": "2021-07-31T14:45:13",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-07-31T14:50:47",
      "Event start time": "2021-07-31T14:34:23",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T14:56:13",
      "Event start time": "2021-07-31T14:47:08",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T15:04:46",
      "Event start time": "2021-07-31T14:59:13",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T15:28:03",
      "Event start time": "2021-07-31T06:48:57",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T15:28:03",
      "Event start time": "2021-07-31T07:15:44",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-07-31T15:45:39",
      "Event start time": "2021-07-31T14:47:48",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-07-31T15:46:13",
      "Event start time": "2021-07-31T14:41:46",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T15:57:35",
      "Event start time": "2021-07-31T12:30:46",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T16:06:41",
      "Event start time": "2021-07-31T15:50:07",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-07-31T16:22:41",
      "Event start time": "2021-07-31T14:57:12",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-07-31T16:58:07",
      "Event start time": "2021-07-31T15:29:43",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T17:19:17",
      "Event start time": "2021-07-31T15:58:38",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-07-31T18:03:13",
      "Event start time": "2021-07-30T20:08:37",
      "USER_NAME": "WD 4W-139 NDQ1033"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T21:05:42",
      "Event start time": "2021-07-31T12:00:03",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T22:20:52",
      "Event start time": "2021-07-31T07:35:45",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T22:40:35",
      "Event start time": "2021-07-31T07:15:29",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T23:02:56",
      "Event start time": "2021-07-31T05:09:29",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T00:15:21",
      "Event start time": "2021-07-31T14:24:46",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T00:29:07",
      "Event start time": "2021-07-31T14:24:46",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T00:43:28",
      "Event start time": "2021-07-31T15:39:57",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T00:51:43",
      "Event start time": "2021-07-31T09:03:37",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:05:44",
      "Event start time": "2021-07-31T06:34:33",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:15:00",
      "Event start time": "2021-07-31T11:01:15",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T01:15:44",
      "Event start time": "2021-07-31T11:01:01",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-01T02:02:47",
      "Event start time": "2021-07-31T10:05:48",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-01T02:03:32",
      "Event start time": "2021-07-31T09:33:32",
      "USER_NAME": "WD 4W-116 NBO8532"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-01T02:58:54",
      "Event start time": "2021-07-31T08:53:54",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-01T03:28:26",
      "Event start time": "2021-07-31T05:00:31",
      "USER_NAME": "WD 6W-74 NFY5461"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-01T05:48:22",
      "Event start time": "2021-07-31T11:01:40",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-01T09:05:27",
      "Event start time": "2021-07-31T04:29:48",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T16:04:17",
      "Event start time": "2021-07-31T11:59:52",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T16:04:17",
      "Event start time": "2021-07-31T12:03:45",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T20:27:15",
      "Event start time": "2021-07-31T08:31:12",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T23:41:31",
      "Event start time": "2021-07-31T02:45:59",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T00:11:55",
      "Event start time": "2021-07-31T11:09:27",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T01:10:38",
      "Event start time": "2021-07-31T11:19:14",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T01:25:43",
      "Event start time": "2021-07-31T09:49:38",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T01:25:43",
      "Event start time": "2021-07-31T05:50:36",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T01:26:36",
      "Event start time": "2021-07-31T10:07:25",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T01:29:56",
      "Event start time": "2021-07-31T07:29:57",
      "USER_NAME": "WD 6W-66 NDI3033"
    },
    {
      "GEOFENCE_NAME": "DEPOT 56",
      "EVENT_TIME": "2021-08-02T01:30:00",
      "Event start time": "2021-07-31T07:01:18",
      "USER_NAME": "WD 4W-123 NBT8116"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-08-02T01:31:26",
      "Event start time": "2021-07-31T11:09:52",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-02T01:31:42",
      "Event start time": "2021-07-31T10:00:01",
      "USER_NAME": "WD 4W-122 NBT8121"
    },
    {
      "GEOFENCE_NAME": "DEPOT 57",
      "EVENT_TIME": "2021-08-02T01:36:54",
      "Event start time": "2021-07-31T07:54:35",
      "USER_NAME": "WD 6W-71 NDL6578"
    },
    {
      "GEOFENCE_NAME": "DEPOT 41",
      "EVENT_TIME": "2021-08-02T01:44:46",
      "Event start time": "2021-07-31T06:53:22",
      "USER_NAME": "WD 4W-119 NBO8534"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-02T01:52:43",
      "Event start time": "2021-07-31T10:59:14",
      "USER_NAME": "WD 6W-62 NBT7892"
    },
    {
      "GEOFENCE_NAME": "DEPOT 8",
      "EVENT_TIME": "2021-08-02T01:53:47",
      "Event start time": "2021-07-31T08:40:33",
      "USER_NAME": "WD FWD-R16 NEB3195"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:26:10",
      "Event start time": "2021-07-31T11:23:38",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DEPOT 11",
      "EVENT_TIME": "2021-08-02T02:31:41",
      "Event start time": "2021-07-31T05:28:41",
      "USER_NAME": "WD 6W-55 NBG4983"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-08-02T02:33:23",
      "Event start time": "2021-07-31T07:22:19",
      "USER_NAME": "WD 6W-60 NBT7891"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:36:35",
      "Event start time": "2021-07-31T08:31:32",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-02T02:59:45",
      "Event start time": "2021-07-31T09:57:42",
      "USER_NAME": "WD 4W-140 NFY5459"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-02T03:01:22",
      "Event start time": "2021-07-31T11:24:51",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 37",
      "EVENT_TIME": "2021-08-02T03:41:17",
      "Event start time": "2021-07-31T08:47:12",
      "USER_NAME": "WD FWD-R07 NEB3197"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T22:11:37",
      "Event start time": "2021-07-31T07:26:17",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "DEPOT 12",
      "EVENT_TIME": "2021-08-03T02:28:04",
      "Event start time": "2021-07-31T06:21:45",
      "USER_NAME": "WD 6W-47 NAR1779"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-08-03T03:01:54",
      "Event start time": "2021-07-31T07:07:32",
      "USER_NAME": "WD 6W-69 NDI3457"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T16:08:30",
      "Event start time": "2021-07-31T16:03:22",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T16:54:28",
      "Event start time": "2021-07-31T16:50:33",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-07-31T17:03:13",
      "Event start time": "2021-07-31T17:02:40",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T17:05:35",
      "Event start time": "2021-07-31T17:00:27",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T17:06:17",
      "Event start time": "2021-07-31T17:01:23",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T17:14:46",
      "Event start time": "2021-07-31T17:10:46",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T17:18:09",
      "Event start time": "2021-07-31T17:11:51",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T17:22:05",
      "Event start time": "2021-07-31T17:15:55",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T17:34:20",
      "Event start time": "2021-07-31T17:24:10",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T17:52:57",
      "Event start time": "2021-07-31T17:37:38",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T17:52:57",
      "Event start time": "2021-07-31T17:42:39",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T18:05:34",
      "Event start time": "2021-07-31T18:00:31",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T18:06:50",
      "Event start time": "2021-07-31T17:20:15",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T18:07:45",
      "Event start time": "2021-07-31T18:05:54",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T18:24:41",
      "Event start time": "2021-07-31T18:09:42",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T18:24:41",
      "Event start time": "2021-07-31T18:15:34",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T19:11:01",
      "Event start time": "2021-07-31T19:08:58",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T19:45:31",
      "Event start time": "2021-07-31T16:56:27",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T19:45:31",
      "Event start time": "2021-07-31T16:56:27",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T20:00:48",
      "Event start time": "2021-07-31T20:00:40",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-07-31T20:08:02",
      "Event start time": "2021-07-31T19:00:33",
      "USER_NAME": "WD 4W-139 NDQ1033"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-07-31T20:11:35",
      "Event start time": "2021-07-31T18:07:36",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T20:11:52",
      "Event start time": "2021-07-31T20:08:49",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T21:14:17",
      "Event start time": "2021-07-31T21:05:12",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T21:16:27",
      "Event start time": "2021-07-31T21:07:21",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T21:23:23",
      "Event start time": "2021-07-31T21:16:34",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T21:51:42",
      "Event start time": "2021-07-31T21:44:51",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:00:45",
      "Event start time": "2021-07-31T21:58:42",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T22:20:34",
      "Event start time": "2021-07-31T22:19:00",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:24:54",
      "Event start time": "2021-07-31T22:20:58",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:28:56",
      "Event start time": "2021-07-31T22:27:04",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:30:58",
      "Event start time": "2021-07-31T22:29:26",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T22:31:32",
      "Event start time": "2021-07-31T21:16:03",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:33:59",
      "Event start time": "2021-07-31T22:31:48",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T22:37:43",
      "Event start time": "2021-07-31T22:36:09",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-07-31T22:41:06",
      "Event start time": "2021-07-31T22:40:39",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T22:45:41",
      "Event start time": "2021-07-31T22:43:09",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-07-31T22:48:16",
      "Event start time": "2021-07-31T22:44:12",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:50:05",
      "Event start time": "2021-07-31T22:36:07",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-07-31T22:55:52",
      "Event start time": "2021-07-31T22:50:54",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T22:58:52",
      "Event start time": "2021-07-31T22:58:25",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-07-31T23:07:17",
      "Event start time": "2021-07-31T23:05:04",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-07-31T23:16:27",
      "Event start time": "2021-07-31T22:49:49",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-07-31T23:25:33",
      "Event start time": "2021-07-31T23:25:14",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T00:18:50",
      "Event start time": "2021-07-31T22:57:47",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T00:22:27",
      "Event start time": "2021-07-31T22:58:07",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T00:33:49",
      "Event start time": "2021-08-01T00:18:02",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T00:46:29",
      "Event start time": "2021-08-01T00:04:12",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-08-01T00:50:45",
      "Event start time": "2021-07-31T23:38:24",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T00:57:59",
      "Event start time": "2021-08-01T00:35:26",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:07:08",
      "Event start time": "2021-08-01T00:32:57",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T01:07:41",
      "Event start time": "2021-08-01T00:59:37",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:07:51",
      "Event start time": "2021-07-31T22:49:49",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T01:07:51",
      "Event start time": "2021-08-01T00:08:21",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T01:09:30",
      "Event start time": "2021-08-01T00:31:14",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:10:37",
      "Event start time": "2021-07-31T17:45:33",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:14:09",
      "Event start time": "2021-08-01T01:08:05",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T01:14:09",
      "Event start time": "2021-08-01T01:11:06",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "WHSE 14",
      "EVENT_TIME": "2021-08-01T01:15:50",
      "Event start time": "2021-08-01T01:14:57",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:15:51",
      "Event start time": "2021-08-01T01:15:20",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T01:15:51",
      "Event start time": "2021-08-01T01:15:20",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:20:26",
      "Event start time": "2021-08-01T01:16:11",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:22:13",
      "Event start time": "2021-07-31T21:05:12",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:24:09",
      "Event start time": "2021-08-01T01:00:04",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T01:24:23",
      "Event start time": "2021-07-31T16:51:41",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T01:25:56",
      "Event start time": "2021-07-31T17:08:53",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T01:25:56",
      "Event start time": "2021-08-01T01:16:46",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:29:24",
      "Event start time": "2021-08-01T01:27:53",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 73",
      "EVENT_TIME": "2021-08-01T01:30:02",
      "Event start time": "2021-08-01T00:25:44",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T01:31:49",
      "Event start time": "2021-08-01T01:31:37",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:40:36",
      "Event start time": "2021-08-01T00:55:46",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T01:43:45",
      "Event start time": "2021-08-01T00:53:32",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T01:44:25",
      "Event start time": "2021-08-01T01:43:26",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T01:54:27",
      "Event start time": "2021-08-01T01:09:49",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T01:56:06",
      "Event start time": "2021-08-01T01:22:24",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T01:56:44",
      "Event start time": "2021-08-01T01:07:36",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T01:57:23",
      "Event start time": "2021-08-01T01:15:54",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:00:28",
      "Event start time": "2021-08-01T01:56:25",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:01:21",
      "Event start time": "2021-08-01T01:11:42",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T02:01:39",
      "Event start time": "2021-08-01T02:01:24",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:02:29",
      "Event start time": "2021-08-01T02:00:54",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T02:02:46",
      "Event start time": "2021-08-01T02:00:44",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:07:02",
      "Event start time": "2021-08-01T01:56:25",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:07:02",
      "Event start time": "2021-08-01T02:05:29",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-01T02:08:24",
      "Event start time": "2021-07-31T21:59:33",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:10:22",
      "Event start time": "2021-08-01T02:08:31",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:11:48",
      "Event start time": "2021-08-01T02:08:31",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:11:48",
      "Event start time": "2021-08-01T02:10:23",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:15:11",
      "Event start time": "2021-08-01T02:11:51",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:15:11",
      "Event start time": "2021-08-01T02:11:51",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T02:20:32",
      "Event start time": "2021-08-01T02:20:13",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-01T02:22:23",
      "Event start time": "2021-07-31T21:37:39",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:24:08",
      "Event start time": "2021-08-01T02:23:00",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:26:46",
      "Event start time": "2021-08-01T01:58:35",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-01T02:28:52",
      "Event start time": "2021-08-01T02:27:32",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T02:30:25",
      "Event start time": "2021-08-01T00:48:22",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T02:31:48",
      "Event start time": "2021-08-01T02:31:40",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T02:33:25",
      "Event start time": "2021-08-01T00:45:38",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T02:38:54",
      "Event start time": "2021-08-01T01:29:55",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T02:39:02",
      "Event start time": "2021-08-01T01:24:46",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T02:45:01",
      "Event start time": "2021-08-01T02:44:35",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T02:45:23",
      "Event start time": "2021-08-01T01:13:13",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T02:54:19",
      "Event start time": "2021-08-01T02:15:12",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:54:19",
      "Event start time": "2021-08-01T02:15:12",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T02:55:30",
      "Event start time": "2021-08-01T01:45:26",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T02:57:42",
      "Event start time": "2021-08-01T02:05:56",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:00:07",
      "Event start time": "2021-08-01T02:55:10",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T03:00:13",
      "Event start time": "2021-08-01T02:32:41",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T03:02:41",
      "Event start time": "2021-08-01T02:03:20",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T03:03:20",
      "Event start time": "2021-08-01T02:28:32",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:03:31",
      "Event start time": "2021-08-01T02:55:10",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:03:31",
      "Event start time": "2021-08-01T03:00:55",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:03:57",
      "Event start time": "2021-08-01T03:03:34",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:03:57",
      "Event start time": "2021-08-01T03:03:34",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T03:04:47",
      "Event start time": "2021-08-01T03:04:15",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T03:05:30",
      "Event start time": "2021-08-01T03:05:03",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:12:57",
      "Event start time": "2021-08-01T03:11:00",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:12:56",
      "Event start time": "2021-08-01T03:11:00",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:14:58",
      "Event start time": "2021-08-01T02:04:13",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:17:00",
      "Event start time": "2021-08-01T03:16:04",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T03:19:35",
      "Event start time": "2021-08-01T03:16:53",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:21:08",
      "Event start time": "2021-08-01T03:18:05",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:21:08",
      "Event start time": "2021-08-01T03:16:04",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:21:39",
      "Event start time": "2021-07-31T22:33:31",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T03:22:03",
      "Event start time": "2021-08-01T02:59:45",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:24:03",
      "Event start time": "2021-08-01T02:35:24",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T03:25:56",
      "Event start time": "2021-08-01T03:25:48",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:31:14",
      "Event start time": "2021-08-01T03:25:12",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T03:31:20",
      "Event start time": "2021-08-01T03:27:55",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T03:34:14",
      "Event start time": "2021-08-01T03:33:49",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:34:50",
      "Event start time": "2021-08-01T03:25:12",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:34:50",
      "Event start time": "2021-08-01T03:32:13",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-01T03:36:43",
      "Event start time": "2021-08-01T03:31:39",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:37:26",
      "Event start time": "2021-08-01T03:09:46",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-01T03:40:41",
      "Event start time": "2021-08-01T03:36:59",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-01T03:41:33",
      "Event start time": "2021-08-01T03:41:04",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T03:55:36",
      "Event start time": "2021-08-01T03:05:29",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:55:48",
      "Event start time": "2021-08-01T03:50:15",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:55:48",
      "Event start time": "2021-08-01T03:50:15",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T03:57:16",
      "Event start time": "2021-08-01T03:56:31",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T03:57:16",
      "Event start time": "2021-08-01T03:56:31",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T04:02:38",
      "Event start time": "2021-07-31T16:56:38",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T04:02:51",
      "Event start time": "2021-07-31T17:41:25",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T04:03:02",
      "Event start time": "2021-08-01T03:05:05",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T04:03:56",
      "Event start time": "2021-08-01T03:59:18",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T04:05:05",
      "Event start time": "2021-08-01T03:57:55",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T04:05:05",
      "Event start time": "2021-08-01T03:57:55",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T04:09:52",
      "Event start time": "2021-08-01T04:09:08",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T04:10:35",
      "Event start time": "2021-08-01T04:05:22",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T04:14:09",
      "Event start time": "2021-08-01T03:02:47",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T04:21:35",
      "Event start time": "2021-08-01T03:18:52",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T04:47:57",
      "Event start time": "2021-08-01T03:04:10",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T04:49:23",
      "Event start time": "2021-08-01T04:49:10",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T04:50:00",
      "Event start time": "2021-07-31T21:16:03",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T04:55:46",
      "Event start time": "2021-08-01T04:52:08",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T05:02:28",
      "Event start time": "2021-08-01T05:00:05",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T05:04:44",
      "Event start time": "2021-08-01T02:57:15",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T05:09:55",
      "Event start time": "2021-08-01T03:31:20",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T05:12:41",
      "Event start time": "2021-08-01T03:25:58",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T05:17:09",
      "Event start time": "2021-08-01T05:16:34",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-01T05:20:03",
      "Event start time": "2021-08-01T05:18:29",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-01T05:34:51",
      "Event start time": "2021-08-01T04:39:20",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-01T05:36:46",
      "Event start time": "2021-08-01T05:20:04",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T05:41:16",
      "Event start time": "2021-08-01T05:21:56",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T05:42:14",
      "Event start time": "2021-08-01T04:10:16",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T05:43:43",
      "Event start time": "2021-08-01T04:04:23",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T05:44:30",
      "Event start time": "2021-08-01T04:05:26",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T05:46:27",
      "Event start time": "2021-08-01T05:06:26",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T05:53:56",
      "Event start time": "2021-08-01T04:43:45",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-01T05:54:17",
      "Event start time": "2021-08-01T02:25:44",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T05:55:30",
      "Event start time": "2021-08-01T05:14:41",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-01T05:56:48",
      "Event start time": "2021-08-01T05:54:39",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T05:58:35",
      "Event start time": "2021-08-01T04:51:50",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T06:00:52",
      "Event start time": "2021-08-01T05:46:07",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T06:01:10",
      "Event start time": "2021-08-01T04:49:22",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T06:05:30",
      "Event start time": "2021-08-01T04:47:10",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:06:07",
      "Event start time": "2021-08-01T06:05:45",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:07:20",
      "Event start time": "2021-08-01T06:04:40",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-01T06:09:22",
      "Event start time": "2021-08-01T03:07:24",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:09:27",
      "Event start time": "2021-08-01T06:01:19",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 1",
      "EVENT_TIME": "2021-08-01T06:12:20",
      "Event start time": "2021-08-01T01:19:04",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-01T06:13:49",
      "Event start time": "2021-08-01T04:30:55",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:16:26",
      "Event start time": "2021-08-01T06:07:29",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-01T06:18:11",
      "Event start time": "2021-08-01T05:35:50",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T06:23:45",
      "Event start time": "2021-08-01T05:59:14",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:27:38",
      "Event start time": "2021-08-01T06:06:46",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T06:30:09",
      "Event start time": "2021-08-01T06:02:41",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:31:05",
      "Event start time": "2021-08-01T05:49:37",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T06:33:00",
      "Event start time": "2021-08-01T05:57:46",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T06:34:00",
      "Event start time": "2021-08-01T05:47:54",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-01T06:37:56",
      "Event start time": "2021-08-01T05:48:47",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T06:47:21",
      "Event start time": "2021-08-01T05:40:35",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T06:50:20",
      "Event start time": "2021-08-01T06:49:05",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-01T06:52:06",
      "Event start time": "2021-08-01T06:50:04",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T06:52:15",
      "Event start time": "2021-08-01T06:02:50",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-01T06:54:52",
      "Event start time": "2021-08-01T06:52:50",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T06:55:30",
      "Event start time": "2021-08-01T06:14:07",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T06:56:00",
      "Event start time": "2021-08-01T06:53:57",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T06:59:09",
      "Event start time": "2021-08-01T06:56:15",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-01T07:04:25",
      "Event start time": "2021-08-01T05:54:29",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T07:09:57",
      "Event start time": "2021-08-01T06:42:34",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T07:10:02",
      "Event start time": "2021-08-01T07:04:03",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T07:11:41",
      "Event start time": "2021-08-01T07:10:39",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T07:11:58",
      "Event start time": "2021-08-01T05:59:47",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T07:11:58",
      "Event start time": "2021-08-01T07:11:45",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-01T07:12:34",
      "Event start time": "2021-08-01T06:52:43",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T07:14:59",
      "Event start time": "2021-08-01T06:38:47",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T07:19:54",
      "Event start time": "2021-08-01T06:46:31",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T07:29:54",
      "Event start time": "2021-08-01T07:21:02",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T07:33:16",
      "Event start time": "2021-08-01T07:16:45",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T07:37:34",
      "Event start time": "2021-08-01T07:12:07",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T07:43:20",
      "Event start time": "2021-08-01T07:15:02",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T07:57:34",
      "Event start time": "2021-08-01T07:02:09",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-01T08:00:49",
      "Event start time": "2021-07-31T20:43:48",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T08:01:27",
      "Event start time": "2021-08-01T07:55:31",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:04:03",
      "Event start time": "2021-08-01T07:12:16",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T08:09:51",
      "Event start time": "2021-08-01T07:12:39",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:24:46",
      "Event start time": "2021-08-01T06:54:21",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:44:05",
      "Event start time": "2021-08-01T08:40:58",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:44:35",
      "Event start time": "2021-08-01T08:40:44",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:45:11",
      "Event start time": "2021-08-01T08:44:20",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T08:47:55",
      "Event start time": "2021-08-01T08:28:56",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:52:33",
      "Event start time": "2021-08-01T08:51:07",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:53:03",
      "Event start time": "2021-08-01T08:52:22",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T08:53:45",
      "Event start time": "2021-08-01T08:53:35",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T08:54:37",
      "Event start time": "2021-08-01T08:53:41",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-01T09:19:19",
      "Event start time": "2021-08-01T08:28:28",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T09:21:02",
      "Event start time": "2021-08-01T09:18:33",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T09:30:35",
      "Event start time": "2021-08-01T09:29:40",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T09:32:11",
      "Event start time": "2021-08-01T07:44:42",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T09:32:12",
      "Event start time": "2021-08-01T07:49:13",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T09:47:39",
      "Event start time": "2021-08-01T07:40:10",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T09:57:47",
      "Event start time": "2021-08-01T09:47:44",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T09:58:35",
      "Event start time": "2021-08-01T09:58:27",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-01T10:05:46",
      "Event start time": "2021-08-01T08:00:56",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T10:21:20",
      "Event start time": "2021-08-01T10:05:37",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-01T11:48:20",
      "Event start time": "2021-08-01T11:47:31",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T11:56:28",
      "Event start time": "2021-08-01T10:36:31",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 8",
      "EVENT_TIME": "2021-08-01T12:47:10",
      "Event start time": "2021-08-01T02:12:31",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-01T12:49:14",
      "Event start time": "2021-08-01T09:20:33",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-01T14:02:32",
      "Event start time": "2021-08-01T12:01:36",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-01T14:52:05",
      "Event start time": "2021-08-01T14:35:43",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T15:01:03",
      "Event start time": "2021-08-01T14:59:22",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-01T15:07:24",
      "Event start time": "2021-08-01T14:50:52",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T16:38:59",
      "Event start time": "2021-08-01T11:11:52",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T18:00:52",
      "Event start time": "2021-08-01T14:34:42",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-01T18:54:43",
      "Event start time": "2021-08-01T15:08:33",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T19:30:49",
      "Event start time": "2021-08-01T09:32:53",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T19:55:17",
      "Event start time": "2021-08-01T04:50:55",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T20:00:44",
      "Event start time": "2021-07-31T17:11:00",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T20:21:50",
      "Event start time": "2021-08-01T09:22:01",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T23:01:00",
      "Event start time": "2021-08-01T06:04:29",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T23:19:25",
      "Event start time": "2021-08-01T09:22:50",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-02T00:35:34",
      "Event start time": "2021-08-01T08:39:55",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-02T00:56:05",
      "Event start time": "2021-08-01T03:52:35",
      "USER_NAME": "WD 6W-74 NFY5461"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T01:55:59",
      "Event start time": "2021-08-01T08:54:05",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-02T01:56:03",
      "Event start time": "2021-08-01T05:37:37",
      "USER_NAME": "WD 4W-116 NBO8532"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-02T02:06:48",
      "Event start time": "2021-08-01T14:54:04",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:08:39",
      "Event start time": "2021-08-01T08:46:32",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:18:54",
      "Event start time": "2021-08-01T05:45:20",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-02T02:19:09",
      "Event start time": "2021-08-01T07:49:16",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:52:01",
      "Event start time": "2021-08-01T07:31:14",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-02T02:53:43",
      "Event start time": "2021-08-01T06:13:25",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-08-02T02:57:44",
      "Event start time": "2021-07-31T20:53:18",
      "USER_NAME": "WD 4W-139 NDQ1033"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T03:13:45",
      "Event start time": "2021-08-01T08:56:14",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T03:14:48",
      "Event start time": "2021-08-01T08:26:17",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T03:26:44",
      "Event start time": "2021-08-01T08:05:26",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T03:34:44",
      "Event start time": "2021-07-31T16:08:32",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:38:28",
      "Event start time": "2021-08-01T04:05:58",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T03:51:03",
      "Event start time": "2021-08-01T06:13:44",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-02T04:06:33",
      "Event start time": "2021-08-01T08:46:37",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T04:22:40",
      "Event start time": "2021-08-01T04:05:58",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T04:32:02",
      "Event start time": "2021-08-01T07:34:53",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T05:49:57",
      "Event start time": "2021-07-31T16:10:45",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:04:43",
      "Event start time": "2021-08-01T08:45:55",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:49:50",
      "Event start time": "2021-08-01T15:04:28",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T16:30:27",
      "Event start time": "2021-08-01T16:13:18",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T16:30:26",
      "Event start time": "2021-08-01T16:13:18",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T16:38:59",
      "Event start time": "2021-08-01T16:35:02",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-01T16:39:47",
      "Event start time": "2021-08-01T16:06:25",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T17:06:18",
      "Event start time": "2021-08-01T16:39:04",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T17:06:18",
      "Event start time": "2021-08-01T16:39:04",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T18:25:03",
      "Event start time": "2021-08-01T18:10:55",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T18:51:05",
      "Event start time": "2021-08-01T18:26:53",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T18:58:18",
      "Event start time": "2021-08-01T18:51:43",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T19:16:26",
      "Event start time": "2021-08-01T19:05:20",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T19:29:28",
      "Event start time": "2021-08-01T19:28:07",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T19:33:34",
      "Event start time": "2021-08-01T19:29:31",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T19:34:08",
      "Event start time": "2021-08-01T19:34:00",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T19:42:56",
      "Event start time": "2021-08-01T19:35:50",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T19:52:01",
      "Event start time": "2021-08-01T19:44:55",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T20:04:53",
      "Event start time": "2021-08-01T20:02:46",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T20:10:09",
      "Event start time": "2021-08-01T19:54:17",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T20:11:26",
      "Event start time": "2021-08-01T17:11:46",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-01T20:13:50",
      "Event start time": "2021-08-01T19:14:26",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T20:16:27",
      "Event start time": "2021-08-01T17:11:46",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T20:19:50",
      "Event start time": "2021-08-01T20:18:04",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T20:24:36",
      "Event start time": "2021-08-01T20:24:17",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-01T20:31:45",
      "Event start time": "2021-08-01T20:29:07",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T20:33:20",
      "Event start time": "2021-08-01T20:23:14",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-01T20:37:17",
      "Event start time": "2021-08-01T20:36:55",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T20:50:17",
      "Event start time": "2021-08-01T19:33:46",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T21:46:29",
      "Event start time": "2021-08-01T21:02:10",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T21:54:00",
      "Event start time": "2021-08-01T20:38:22",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T21:56:03",
      "Event start time": "2021-08-01T21:55:01",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-01T21:57:37",
      "Event start time": "2021-08-01T21:54:34",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T22:22:11",
      "Event start time": "2021-08-01T22:04:05",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T22:48:41",
      "Event start time": "2021-08-01T22:05:06",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T22:52:25",
      "Event start time": "2021-08-01T22:22:16",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T22:58:09",
      "Event start time": "2021-08-01T22:52:43",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T23:11:13",
      "Event start time": "2021-08-01T22:27:44",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T23:13:40",
      "Event start time": "2021-08-01T23:13:25",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T23:15:09",
      "Event start time": "2021-08-01T22:49:24",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-01T23:17:07",
      "Event start time": "2021-08-01T23:13:13",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T23:23:42",
      "Event start time": "2021-08-01T23:18:38",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-01T23:25:36",
      "Event start time": "2021-08-01T23:24:04",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T23:28:45",
      "Event start time": "2021-08-01T23:25:56",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T23:31:46",
      "Event start time": "2021-08-01T23:30:22",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T23:43:48",
      "Event start time": "2021-08-01T23:41:23",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T23:48:55",
      "Event start time": "2021-08-01T23:28:30",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-01T23:49:22",
      "Event start time": "2021-08-01T23:38:48",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T23:54:21",
      "Event start time": "2021-08-01T22:47:44",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-01T23:55:27",
      "Event start time": "2021-08-01T23:54:47",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-01T23:56:03",
      "Event start time": "2021-08-01T23:02:41",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T00:05:47",
      "Event start time": "2021-08-02T00:00:00",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T00:06:10",
      "Event start time": "2021-08-01T23:25:52",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T00:08:38",
      "Event start time": "2021-08-01T23:21:56",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T00:14:52",
      "Event start time": "2021-08-02T00:13:15",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T00:17:37",
      "Event start time": "2021-08-01T22:30:57",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T00:23:59",
      "Event start time": "2021-08-02T00:20:51",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T00:29:01",
      "Event start time": "2021-08-02T00:27:58",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T00:33:00",
      "Event start time": "2021-08-02T00:32:32",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T00:40:24",
      "Event start time": "2021-08-01T19:57:10",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T00:49:21",
      "Event start time": "2021-08-02T00:10:48",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T00:52:40",
      "Event start time": "2021-08-02T00:31:01",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T00:53:13",
      "Event start time": "2021-08-02T00:25:45",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T00:54:29",
      "Event start time": "2021-08-02T00:53:25",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T00:55:03",
      "Event start time": "2021-08-01T20:45:01",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T00:55:42",
      "Event start time": "2021-08-02T00:55:11",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T01:04:15",
      "Event start time": "2021-08-02T00:49:47",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T01:23:38",
      "Event start time": "2021-08-02T00:05:55",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T01:26:20",
      "Event start time": "2021-08-01T23:57:40",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T01:27:20",
      "Event start time": "2021-08-02T00:56:17",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "WHSE 12",
      "EVENT_TIME": "2021-08-02T01:32:01",
      "Event start time": "2021-08-02T01:30:38",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T01:34:50",
      "Event start time": "2021-08-02T01:08:18",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T01:35:03",
      "Event start time": "2021-08-02T00:56:06",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-02T01:36:11",
      "Event start time": "2021-08-02T00:36:14",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T01:37:22",
      "Event start time": "2021-08-02T00:51:53",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T01:46:46",
      "Event start time": "2021-08-02T01:32:38",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 20",
      "EVENT_TIME": "2021-08-02T01:47:48",
      "Event start time": "2021-08-02T01:38:44",
      "USER_NAME": "WD 6W-67 NDI3031"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T01:48:26",
      "Event start time": "2021-08-02T01:47:44",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T01:49:49",
      "Event start time": "2021-08-02T01:45:00",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T01:50:59",
      "Event start time": "2021-08-02T01:28:30",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T01:54:15",
      "Event start time": "2021-08-02T01:50:28",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:00:03",
      "Event start time": "2021-08-02T01:57:56",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 21",
      "EVENT_TIME": "2021-08-02T02:00:37",
      "Event start time": "2021-08-01T21:54:01",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T02:01:45",
      "Event start time": "2021-08-02T00:31:00",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:07:10",
      "Event start time": "2021-08-02T01:08:15",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:08:39",
      "Event start time": "2021-08-01T23:52:29",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-02T02:16:34",
      "Event start time": "2021-08-02T02:15:59",
      "USER_NAME": "WD 6W-62 NBT7892"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:17:35",
      "Event start time": "2021-08-02T02:11:30",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-02T02:17:35",
      "Event start time": "2021-08-01T23:28:10",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:19:41",
      "Event start time": "2021-08-02T01:52:50",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:20:03",
      "Event start time": "2021-08-02T02:11:30",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:20:03",
      "Event start time": "2021-08-02T02:18:34",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T02:20:10",
      "Event start time": "2021-08-02T02:19:37",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-02T02:20:51",
      "Event start time": "2021-08-02T02:20:01",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T02:21:36",
      "Event start time": "2021-08-02T01:50:35",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:22:32",
      "Event start time": "2021-08-02T02:20:17",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-02T02:23:50",
      "Event start time": "2021-08-02T01:40:29",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:23:53",
      "Event start time": "2021-08-02T02:22:36",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:23:53",
      "Event start time": "2021-08-02T02:22:36",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T02:25:17",
      "Event start time": "2021-08-02T02:23:10",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-02T02:25:20",
      "Event start time": "2021-08-02T02:24:19",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:25:58",
      "Event start time": "2021-08-02T00:50:34",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T02:26:26",
      "Event start time": "2021-08-02T02:12:37",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:27:20",
      "Event start time": "2021-08-02T02:25:16",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:29:21",
      "Event start time": "2021-08-02T02:27:34",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:31:30",
      "Event start time": "2021-08-02T02:29:27",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:31:30",
      "Event start time": "2021-08-02T02:29:27",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:36:59",
      "Event start time": "2021-08-02T02:34:06",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:37:01",
      "Event start time": "2021-08-02T02:36:37",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:38:59",
      "Event start time": "2021-08-01T20:45:01",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:39:53",
      "Event start time": "2021-08-02T02:38:23",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:40:09",
      "Event start time": "2021-08-02T01:28:57",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T02:40:45",
      "Event start time": "2021-08-02T02:11:47",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-02T02:41:11",
      "Event start time": "2021-08-01T21:41:59",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T02:42:22",
      "Event start time": "2021-08-02T02:25:35",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:43:04",
      "Event start time": "2021-08-02T02:40:54",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T02:45:17",
      "Event start time": "2021-08-02T02:44:52",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-08-02T02:45:29",
      "Event start time": "2021-08-02T02:27:21",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:45:50",
      "Event start time": "2021-08-02T02:43:48",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T02:47:01",
      "Event start time": "2021-08-02T02:46:30",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:50:05",
      "Event start time": "2021-08-02T02:47:49",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T02:51:05",
      "Event start time": "2021-08-02T02:50:39",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T02:52:41",
      "Event start time": "2021-08-02T02:38:46",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 7",
      "EVENT_TIME": "2021-08-02T02:52:46",
      "Event start time": "2021-08-02T02:52:25",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:53:05",
      "Event start time": "2021-08-02T02:12:44",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:55:49",
      "Event start time": "2021-08-02T02:53:40",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T02:57:43",
      "Event start time": "2021-08-02T02:34:33",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T02:57:57",
      "Event start time": "2021-08-02T02:56:17",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T03:01:19",
      "Event start time": "2021-08-02T03:00:53",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "DEPOT 1",
      "EVENT_TIME": "2021-08-02T03:01:22",
      "Event start time": "2021-08-02T03:00:17",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:13:45",
      "Event start time": "2021-08-02T03:07:40",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T03:14:32",
      "Event start time": "2021-08-02T02:26:11",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:15:52",
      "Event start time": "2021-08-02T03:12:32",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T03:18:06",
      "Event start time": "2021-08-02T03:17:32",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 43",
      "EVENT_TIME": "2021-08-02T03:18:56",
      "Event start time": "2021-08-01T23:11:19",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T03:19:06",
      "Event start time": "2021-08-02T03:18:19",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:19:06",
      "Event start time": "2021-08-02T03:18:19",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T03:19:20",
      "Event start time": "2021-08-02T03:16:49",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T03:20:20",
      "Event start time": "2021-08-02T02:20:50",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 49",
      "EVENT_TIME": "2021-08-02T03:22:51",
      "Event start time": "2021-08-02T02:18:46",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-08-02T03:24:03",
      "Event start time": "2021-08-02T03:23:01",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T03:24:51",
      "Event start time": "2021-08-02T02:45:33",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-02T03:30:32",
      "Event start time": "2021-08-02T03:30:05",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T03:31:37",
      "Event start time": "2021-08-02T03:29:14",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T03:35:34",
      "Event start time": "2021-08-02T03:35:08",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T03:35:36",
      "Event start time": "2021-08-02T03:35:20",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T03:38:29",
      "Event start time": "2021-08-02T03:36:00",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:43:56",
      "Event start time": "2021-08-02T03:43:49",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T03:48:18",
      "Event start time": "2021-08-02T03:21:55",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:48:18",
      "Event start time": "2021-08-02T03:21:55",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T03:48:39",
      "Event start time": "2021-08-02T02:43:21",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T03:55:29",
      "Event start time": "2021-08-02T03:55:05",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T03:55:55",
      "Event start time": "2021-08-02T03:47:50",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T03:58:15",
      "Event start time": "2021-08-02T03:57:54",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T03:59:25",
      "Event start time": "2021-08-02T02:43:42",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T04:05:26",
      "Event start time": "2021-08-02T03:50:18",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "HO5",
      "EVENT_TIME": "2021-08-02T04:10:26",
      "Event start time": "2021-08-02T03:32:29",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T04:21:45",
      "Event start time": "2021-08-02T03:52:35",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T04:22:34",
      "Event start time": "2021-08-02T03:27:02",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T04:22:34",
      "Event start time": "2021-08-02T04:11:08",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T04:25:59",
      "Event start time": "2021-08-02T03:44:26",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "WHSE 14",
      "EVENT_TIME": "2021-08-02T04:27:46",
      "Event start time": "2021-08-02T04:26:56",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T04:27:48",
      "Event start time": "2021-08-02T04:23:33",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T04:27:48",
      "Event start time": "2021-08-02T04:23:33",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T04:30:43",
      "Event start time": "2021-08-02T04:24:41",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T04:34:42",
      "Event start time": "2021-08-02T03:31:46",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T04:35:02",
      "Event start time": "2021-08-02T04:34:22",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T04:37:45",
      "Event start time": "2021-08-02T04:34:14",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-02T04:39:07",
      "Event start time": "2021-08-02T04:38:25",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-08-02T04:44:14",
      "Event start time": "2021-08-02T03:12:30",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T04:48:40",
      "Event start time": "2021-08-02T04:48:18",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T04:58:48",
      "Event start time": "2021-08-02T04:58:27",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-02T05:02:15",
      "Event start time": "2021-08-02T04:19:41",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DEPOT 21",
      "EVENT_TIME": "2021-08-02T05:02:16",
      "Event start time": "2021-08-02T05:01:14",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T05:02:16",
      "Event start time": "2021-08-02T03:21:58",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-02T05:03:47",
      "Event start time": "2021-08-02T05:02:14",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T05:05:07",
      "Event start time": "2021-08-02T03:50:18",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T05:05:07",
      "Event start time": "2021-08-02T04:48:39",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:05:10",
      "Event start time": "2021-08-02T03:01:21",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T05:05:36",
      "Event start time": "2021-08-02T04:30:48",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:08:38",
      "Event start time": "2021-08-02T05:07:09",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:10:01",
      "Event start time": "2021-08-02T05:09:27",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:10:14",
      "Event start time": "2021-08-02T02:57:57",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T05:11:42",
      "Event start time": "2021-08-02T05:10:39",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:12:12",
      "Event start time": "2021-08-02T05:07:46",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T05:14:56",
      "Event start time": "2021-08-02T05:13:54",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-02T05:16:37",
      "Event start time": "2021-08-02T04:57:20",
      "USER_NAME": "WD 6W-70 NDI3034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T05:17:31",
      "Event start time": "2021-08-02T05:06:45",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:18:19",
      "Event start time": "2021-08-02T05:17:59",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:18:47",
      "Event start time": "2021-08-02T03:59:46",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:18:55",
      "Event start time": "2021-08-02T02:41:38",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:20:25",
      "Event start time": "2021-08-02T05:07:05",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:21:55",
      "Event start time": "2021-08-02T05:18:50",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 57",
      "EVENT_TIME": "2021-08-02T05:26:09",
      "Event start time": "2021-08-02T03:27:23",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "DEPOT 32",
      "EVENT_TIME": "2021-08-02T05:26:11",
      "Event start time": "2021-08-02T05:25:30",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T05:29:32",
      "Event start time": "2021-08-02T05:29:17",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T05:29:52",
      "Event start time": "2021-08-02T05:29:28",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T05:32:15",
      "Event start time": "2021-08-02T05:31:37",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T05:33:20",
      "Event start time": "2021-08-02T03:09:19",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T05:35:47",
      "Event start time": "2021-08-02T05:34:45",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:38:47",
      "Event start time": "2021-08-02T04:26:17",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:38:47",
      "Event start time": "2021-08-02T04:23:16",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T05:43:38",
      "Event start time": "2021-08-02T05:43:16",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T05:44:53",
      "Event start time": "2021-08-02T05:44:20",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:45:48",
      "Event start time": "2021-08-02T05:43:20",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T05:48:25",
      "Event start time": "2021-08-02T05:04:11",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-02T05:54:21",
      "Event start time": "2021-08-02T05:53:46",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T05:54:58",
      "Event start time": "2021-08-02T05:54:36",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-08-02T05:57:39",
      "Event start time": "2021-08-02T05:55:36",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T05:58:45",
      "Event start time": "2021-08-02T05:58:03",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-02T05:59:32",
      "Event start time": "2021-08-02T05:25:58",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T05:59:32",
      "Event start time": "2021-08-02T01:39:15",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "DEPOT 57",
      "EVENT_TIME": "2021-08-02T06:03:40",
      "Event start time": "2021-08-02T04:47:01",
      "USER_NAME": "WD 6W-66 NDI3033"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:05:02",
      "Event start time": "2021-08-02T06:02:06",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:07:17",
      "Event start time": "2021-08-02T06:05:30",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-08-02T06:07:22",
      "Event start time": "2021-08-02T03:12:14",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "HO6",
      "EVENT_TIME": "2021-08-02T06:11:04",
      "Event start time": "2021-08-02T03:32:07",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T06:12:15",
      "Event start time": "2021-08-02T05:50:27",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:12:37",
      "Event start time": "2021-08-02T06:10:47",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 32",
      "EVENT_TIME": "2021-08-02T06:12:47",
      "Event start time": "2021-08-02T05:26:28",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-02T06:15:21",
      "Event start time": "2021-08-02T03:42:18",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "WHSE 14",
      "EVENT_TIME": "2021-08-02T06:15:45",
      "Event start time": "2021-08-02T06:15:23",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T06:17:20",
      "Event start time": "2021-08-02T06:16:30",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T06:18:43",
      "Event start time": "2021-08-02T06:17:34",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:20:51",
      "Event start time": "2021-08-02T05:51:32",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T06:22:32",
      "Event start time": "2021-08-02T06:21:55",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:26:36",
      "Event start time": "2021-08-02T06:24:27",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-02T06:34:14",
      "Event start time": "2021-08-02T06:17:32",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T06:37:55",
      "Event start time": "2021-08-02T06:35:53",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "HO5",
      "EVENT_TIME": "2021-08-02T06:39:45",
      "Event start time": "2021-08-02T03:59:41",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:40:26",
      "Event start time": "2021-08-02T06:14:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-02T06:41:23",
      "Event start time": "2021-08-02T05:58:41",
      "USER_NAME": "WD 4W-122 NBT8121"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T06:42:31",
      "Event start time": "2021-08-02T06:22:50",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:43:03",
      "Event start time": "2021-08-02T06:40:52",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-02T06:45:50",
      "Event start time": "2021-08-02T06:44:41",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T06:46:59",
      "Event start time": "2021-08-02T06:45:57",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-08-02T06:52:32",
      "Event start time": "2021-08-02T06:52:14",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T06:54:20",
      "Event start time": "2021-08-02T06:42:30",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T06:55:47",
      "Event start time": "2021-08-02T06:55:30",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-02T06:55:54",
      "Event start time": "2021-08-02T06:53:14",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T06:59:32",
      "Event start time": "2021-08-02T06:28:02",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T06:59:42",
      "Event start time": "2021-08-02T06:58:13",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-02T07:01:16",
      "Event start time": "2021-08-02T06:06:02",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-08-02T07:01:32",
      "Event start time": "2021-08-02T04:05:58",
      "USER_NAME": "WD 4W-139 NDQ1033"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-08-02T07:03:39",
      "Event start time": "2021-08-02T06:01:10",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-08-02T07:06:14",
      "Event start time": "2021-08-02T07:04:12",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T07:06:15",
      "Event start time": "2021-08-02T06:56:14",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 1",
      "EVENT_TIME": "2021-08-02T07:07:28",
      "Event start time": "2021-08-02T05:25:20",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-02T07:16:54",
      "Event start time": "2021-08-02T06:29:19",
      "USER_NAME": "WD 4W-116 NBO8532"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T07:28:49",
      "Event start time": "2021-08-02T07:26:51",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T07:28:51",
      "Event start time": "2021-08-02T07:27:27",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DEPOT 32",
      "EVENT_TIME": "2021-08-02T07:32:50",
      "Event start time": "2021-08-02T05:29:14",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T07:40:28",
      "Event start time": "2021-08-02T07:37:24",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-02T07:40:35",
      "Event start time": "2021-08-02T06:24:34",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T07:50:36",
      "Event start time": "2021-08-02T07:50:20",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T07:52:15",
      "Event start time": "2021-08-02T07:51:35",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T07:53:36",
      "Event start time": "2021-08-02T07:49:36",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 31",
      "EVENT_TIME": "2021-08-02T07:54:39",
      "Event start time": "2021-08-02T06:46:00",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T07:54:56",
      "Event start time": "2021-08-02T06:56:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-02T07:56:52",
      "Event start time": "2021-08-02T07:56:39",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-02T07:58:30",
      "Event start time": "2021-08-02T07:46:22",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-02T08:01:27",
      "Event start time": "2021-08-02T07:59:52",
      "USER_NAME": "WD 6W-74 NFY5461"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T08:02:22",
      "Event start time": "2021-08-02T08:01:56",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:02:25",
      "Event start time": "2021-08-02T06:44:13",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T08:02:52",
      "Event start time": "2021-08-02T00:01:03",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:05:16",
      "Event start time": "2021-08-02T08:03:57",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-02T08:07:36",
      "Event start time": "2021-08-02T08:04:32",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-02T08:10:03",
      "Event start time": "2021-08-02T07:43:16",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:12:04",
      "Event start time": "2021-08-02T08:10:24",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T08:12:24",
      "Event start time": "2021-08-02T07:56:55",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:13:22",
      "Event start time": "2021-08-02T08:12:12",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "WHSE 14",
      "EVENT_TIME": "2021-08-02T08:15:59",
      "Event start time": "2021-08-02T08:15:27",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T08:16:44",
      "Event start time": "2021-08-02T08:06:49",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T08:17:53",
      "Event start time": "2021-08-02T08:16:15",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 11",
      "EVENT_TIME": "2021-08-02T08:22:52",
      "Event start time": "2021-08-02T08:20:34",
      "USER_NAME": "WD 6W-55 NBG4983"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T08:23:31",
      "Event start time": "2021-08-02T03:54:31",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-02T08:25:46",
      "Event start time": "2021-08-02T08:12:37",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T08:33:43",
      "Event start time": "2021-08-02T08:32:03",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:36:02",
      "Event start time": "2021-08-02T08:13:59",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 19",
      "EVENT_TIME": "2021-08-02T08:36:45",
      "Event start time": "2021-08-02T07:14:14",
      "USER_NAME": "WD 6W-62 NBT7892"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T08:41:36",
      "Event start time": "2021-08-02T08:21:19",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T08:44:30",
      "Event start time": "2021-08-02T08:43:28",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T08:45:00",
      "Event start time": "2021-08-02T08:41:49",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:45:55",
      "Event start time": "2021-08-02T08:44:05",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-02T08:46:56",
      "Event start time": "2021-08-02T08:27:12",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T08:47:44",
      "Event start time": "2021-08-02T08:18:20",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T09:22:56",
      "Event start time": "2021-08-02T09:21:39",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T09:25:31",
      "Event start time": "2021-08-02T09:24:25",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "DEPOT 49",
      "EVENT_TIME": "2021-08-02T09:32:06",
      "Event start time": "2021-08-02T09:31:49",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T09:32:31",
      "Event start time": "2021-08-02T09:30:59",
      "USER_NAME": "WD 6W-58 NBT8122"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T09:36:48",
      "Event start time": "2021-08-02T07:01:05",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-02T09:41:32",
      "Event start time": "2021-08-02T09:05:52",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T09:45:23",
      "Event start time": "2021-08-02T08:37:57",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T09:45:40",
      "Event start time": "2021-08-02T08:49:17",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T09:46:49",
      "Event start time": "2021-08-02T09:46:44",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T09:50:18",
      "Event start time": "2021-08-02T09:49:02",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T09:53:25",
      "Event start time": "2021-08-02T06:29:15",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T10:01:50",
      "Event start time": "2021-08-02T10:00:01",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T10:16:40",
      "Event start time": "2021-08-02T09:50:50",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T10:17:06",
      "Event start time": "2021-08-02T09:49:14",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T10:19:06",
      "Event start time": "2021-08-02T09:46:49",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T10:19:32",
      "Event start time": "2021-08-02T09:47:21",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T10:31:15",
      "Event start time": "2021-08-02T10:20:53",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T10:36:01",
      "Event start time": "2021-08-02T10:21:35",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T10:45:41",
      "Event start time": "2021-08-02T10:26:59",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T10:48:33",
      "Event start time": "2021-08-02T10:45:24",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T10:50:28",
      "Event start time": "2021-08-02T10:32:52",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T10:59:43",
      "Event start time": "2021-08-02T10:52:18",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T11:01:25",
      "Event start time": "2021-08-02T10:40:21",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T11:04:12",
      "Event start time": "2021-08-02T10:37:21",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T11:06:16",
      "Event start time": "2021-08-02T10:46:07",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T11:15:41",
      "Event start time": "2021-08-02T11:03:16",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T11:18:08",
      "Event start time": "2021-08-02T11:01:26",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T11:21:25",
      "Event start time": "2021-08-02T11:05:52",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T11:30:46",
      "Event start time": "2021-08-02T11:20:00",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T11:36:45",
      "Event start time": "2021-08-02T11:36:14",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 11",
      "EVENT_TIME": "2021-08-02T11:37:21",
      "Event start time": "2021-08-02T07:30:25",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T11:40:15",
      "Event start time": "2021-08-02T11:27:41",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T11:42:31",
      "Event start time": "2021-08-02T11:40:39",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T11:44:26",
      "Event start time": "2021-08-02T11:22:36",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T11:46:13",
      "Event start time": "2021-08-02T11:45:18",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T11:48:33",
      "Event start time": "2021-08-02T11:32:37",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T11:53:35",
      "Event start time": "2021-08-02T11:43:30",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T11:54:07",
      "Event start time": "2021-08-02T11:54:00",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T11:56:20",
      "Event start time": "2021-08-02T11:46:23",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 28",
      "EVENT_TIME": "2021-08-02T11:57:34",
      "Event start time": "2021-08-02T09:12:45",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T11:58:42",
      "Event start time": "2021-08-02T11:50:21",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T12:03:40",
      "Event start time": "2021-08-02T12:03:30",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T12:09:32",
      "Event start time": "2021-08-02T12:05:40",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T12:12:45",
      "Event start time": "2021-08-02T12:11:43",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T12:18:05",
      "Event start time": "2021-08-02T12:07:40",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T12:21:01",
      "Event start time": "2021-08-02T12:00:34",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T12:38:51",
      "Event start time": "2021-08-02T12:00:41",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T12:42:02",
      "Event start time": "2021-08-02T12:39:23",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T12:44:43",
      "Event start time": "2021-08-02T11:58:02",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T12:47:32",
      "Event start time": "2021-08-02T12:38:54",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T13:03:04",
      "Event start time": "2021-08-02T13:02:03",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 55",
      "EVENT_TIME": "2021-08-02T13:04:01",
      "Event start time": "2021-08-02T08:07:23",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 49",
      "EVENT_TIME": "2021-08-02T13:06:59",
      "Event start time": "2021-08-02T13:05:51",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T13:13:09",
      "Event start time": "2021-08-02T13:11:06",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 21",
      "EVENT_TIME": "2021-08-02T13:21:09",
      "Event start time": "2021-08-02T13:20:06",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-02T13:27:05",
      "Event start time": "2021-08-02T05:12:08",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T13:36:53",
      "Event start time": "2021-08-02T13:34:15",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "HO8",
      "EVENT_TIME": "2021-08-02T13:59:39",
      "Event start time": "2021-08-02T06:14:10",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T14:00:22",
      "Event start time": "2021-08-02T09:58:14",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T14:00:22",
      "Event start time": "2021-08-02T09:55:24",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T14:17:06",
      "Event start time": "2021-08-02T14:13:33",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T14:21:34",
      "Event start time": "2021-08-02T14:21:07",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MIP",
      "EVENT_TIME": "2021-08-02T14:29:26",
      "Event start time": "2021-08-02T07:03:20",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-02T14:43:31",
      "Event start time": "2021-08-02T14:41:29",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T14:43:47",
      "Event start time": "2021-08-02T10:04:37",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-02T14:47:52",
      "Event start time": "2021-08-02T08:01:47",
      "USER_NAME": "WD 6W-74 NFY5461"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T14:52:27",
      "Event start time": "2021-08-02T14:48:23",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T14:55:28",
      "Event start time": "2021-08-02T09:08:34",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T14:59:33",
      "Event start time": "2021-08-02T14:57:29",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T15:02:06",
      "Event start time": "2021-08-02T15:00:03",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T15:03:25",
      "Event start time": "2021-08-02T15:02:34",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T15:20:56",
      "Event start time": "2021-08-02T15:19:07",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T15:26:34",
      "Event start time": "2021-08-02T15:24:54",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T15:26:39",
      "Event start time": "2021-08-02T13:44:21",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-02T15:26:52",
      "Event start time": "2021-08-02T15:26:02",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T15:42:28",
      "Event start time": "2021-08-02T15:40:37",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T15:42:44",
      "Event start time": "2021-08-02T15:40:42",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T15:57:19",
      "Event start time": "2021-08-02T15:57:10",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T16:07:18",
      "Event start time": "2021-08-02T15:58:13",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T16:08:24",
      "Event start time": "2021-08-02T08:15:16",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T16:08:24",
      "Event start time": "2021-08-02T08:48:26",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-08-02T16:14:24",
      "Event start time": "2021-08-02T09:27:26",
      "USER_NAME": "WD 4W-139 NDQ1033"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-02T16:18:59",
      "Event start time": "2021-08-02T14:59:07",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T17:30:17",
      "Event start time": "2021-08-02T15:30:57",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T19:46:17",
      "Event start time": "2021-08-02T07:39:35",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T20:06:33",
      "Event start time": "2021-08-02T07:30:31",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T22:59:15",
      "Event start time": "2021-08-02T06:44:53",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T23:07:18",
      "Event start time": "2021-08-02T15:22:44",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T23:16:17",
      "Event start time": "2021-08-02T07:55:07",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T23:56:27",
      "Event start time": "2021-08-02T10:04:02",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-03T00:15:10",
      "Event start time": "2021-08-02T08:23:52",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:25:03",
      "Event start time": "2021-08-02T12:23:02",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:45:36",
      "Event start time": "2021-08-02T12:47:18",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:49:25",
      "Event start time": "2021-08-02T08:47:28",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T00:51:54",
      "Event start time": "2021-08-02T06:36:03",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "DEPOT 58",
      "EVENT_TIME": "2021-08-03T00:59:55",
      "Event start time": "2021-08-02T10:23:46",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:00:25",
      "Event start time": "2021-08-02T15:28:15",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 11",
      "EVENT_TIME": "2021-08-03T01:06:41",
      "Event start time": "2021-08-02T10:55:34",
      "USER_NAME": "WD 6W-55 NBG4983"
    },
    {
      "GEOFENCE_NAME": "DEPOT 56",
      "EVENT_TIME": "2021-08-03T01:07:14",
      "Event start time": "2021-08-02T08:05:34",
      "USER_NAME": "WD 4W-123 NBT8116"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:17:40",
      "Event start time": "2021-08-02T07:30:32",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "DEPOT 8",
      "EVENT_TIME": "2021-08-03T01:21:10",
      "Event start time": "2021-08-02T09:42:42",
      "USER_NAME": "WD FWD-R16 NEB3195"
    },
    {
      "GEOFENCE_NAME": "DEPOT 41",
      "EVENT_TIME": "2021-08-03T01:24:16",
      "Event start time": "2021-08-02T09:05:49",
      "USER_NAME": "WD 4W-119 NBO8534"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-03T01:26:06",
      "Event start time": "2021-08-02T10:46:10",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T01:30:48",
      "Event start time": "2021-08-02T10:10:53",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-03T01:46:03",
      "Event start time": "2021-08-02T15:32:10",
      "USER_NAME": "WD 6W-74 NFY5461"
    },
    {
      "GEOFENCE_NAME": "DEPOT 55",
      "EVENT_TIME": "2021-08-03T01:48:35",
      "Event start time": "2021-08-02T10:42:21",
      "USER_NAME": "WD 6W-59 NBT8117"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:52:49",
      "Event start time": "2021-08-02T07:11:46",
      "USER_NAME": "WD 6W-66 NDI3033"
    },
    {
      "GEOFENCE_NAME": "DEPOT 57",
      "EVENT_TIME": "2021-08-03T01:59:10",
      "Event start time": "2021-08-02T05:30:18",
      "USER_NAME": "WD 6W-71 NDL6578"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-08-03T02:04:10",
      "Event start time": "2021-08-02T09:44:32",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-03T02:09:50",
      "Event start time": "2021-08-02T10:49:30",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T02:11:07",
      "Event start time": "2021-08-02T08:56:17",
      "USER_NAME": "WD 6W-62 NBT7892"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:12:24",
      "Event start time": "2021-08-02T15:01:44",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T02:14:34",
      "Event start time": "2021-08-02T06:57:13",
      "USER_NAME": "WD 6W-65 NDI3456"
    },
    {
      "GEOFENCE_NAME": "DEPOT 28",
      "EVENT_TIME": "2021-08-03T02:20:03",
      "Event start time": "2021-08-02T09:16:16",
      "USER_NAME": "WD 4W-125 NBT8119"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:20:31",
      "Event start time": "2021-08-02T15:10:12",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:34:56",
      "Event start time": "2021-08-02T09:24:16",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T02:37:55",
      "Event start time": "2021-08-02T07:32:16",
      "USER_NAME": "WD 4W-140 NFY5459"
    },
    {
      "GEOFENCE_NAME": "DEPOT 20",
      "EVENT_TIME": "2021-08-03T02:49:23",
      "Event start time": "2021-08-02T07:30:43",
      "USER_NAME": "WD 6W-67 NDI3031"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-03T02:50:16",
      "Event start time": "2021-08-02T08:47:55",
      "USER_NAME": "WD 4W-135 NDI3040"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:53:59",
      "Event start time": "2021-08-02T14:54:41",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T03:08:10",
      "Event start time": "2021-08-02T15:44:02",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T03:24:17",
      "Event start time": "2021-08-02T06:14:19",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T03:28:52",
      "Event start time": "2021-08-02T08:30:21",
      "USER_NAME": "WD 4W-116 NBO8532"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T03:35:17",
      "Event start time": "2021-08-02T15:00:26",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:35:28",
      "Event start time": "2021-08-02T15:00:26",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T03:50:44",
      "Event start time": "2021-08-02T06:00:39",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T03:58:34",
      "Event start time": "2021-08-02T11:18:49",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T04:33:38",
      "Event start time": "2021-08-02T06:09:46",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DEPOT 37",
      "EVENT_TIME": "2021-08-03T04:37:20",
      "Event start time": "2021-08-02T08:43:45",
      "USER_NAME": "WD FWD-R07 NEB3197"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T05:05:33",
      "Event start time": "2021-08-02T15:44:17",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-03T07:08:24",
      "Event start time": "2021-08-02T09:32:47",
      "USER_NAME": "WD 4W-122 NBT8121"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-03T09:48:06",
      "Event start time": "2021-08-02T03:22:20",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T16:18:37",
      "Event start time": "2021-08-02T16:11:14",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T16:20:25",
      "Event start time": "2021-08-02T16:12:22",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T16:40:17",
      "Event start time": "2021-08-02T16:23:08",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T16:45:34",
      "Event start time": "2021-08-02T16:41:31",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T16:49:09",
      "Event start time": "2021-08-02T16:09:53",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T16:49:09",
      "Event start time": "2021-08-02T16:09:53",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T16:49:45",
      "Event start time": "2021-08-02T16:47:35",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T16:54:29",
      "Event start time": "2021-08-02T16:52:04",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T16:55:40",
      "Event start time": "2021-08-02T16:55:14",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T17:14:17",
      "Event start time": "2021-08-02T17:06:43",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 70",
      "EVENT_TIME": "2021-08-02T17:51:01",
      "Event start time": "2021-08-02T16:32:30",
      "USER_NAME": "WD 4W-139 NDQ1033"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T17:59:53",
      "Event start time": "2021-08-02T17:17:47",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T18:40:20",
      "Event start time": "2021-08-02T18:25:12",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T18:52:54",
      "Event start time": "2021-08-02T17:52:30",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T19:01:29",
      "Event start time": "2021-08-02T18:54:25",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T19:11:34",
      "Event start time": "2021-08-02T19:09:31",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T19:21:38",
      "Event start time": "2021-08-02T19:15:00",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T19:30:41",
      "Event start time": "2021-08-02T19:24:38",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T19:39:45",
      "Event start time": "2021-08-02T19:38:17",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T20:08:56",
      "Event start time": "2021-08-02T19:23:03",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T20:10:00",
      "Event start time": "2021-08-02T20:08:19",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T20:15:16",
      "Event start time": "2021-08-02T17:39:25",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T20:15:59",
      "Event start time": "2021-08-02T20:03:11",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-02T20:18:53",
      "Event start time": "2021-08-02T20:17:15",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T20:28:49",
      "Event start time": "2021-08-02T20:28:33",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-02T20:38:24",
      "Event start time": "2021-08-02T20:38:12",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T20:42:22",
      "Event start time": "2021-08-02T20:28:27",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T20:53:09",
      "Event start time": "2021-08-02T20:47:47",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 19",
      "EVENT_TIME": "2021-08-02T20:58:04",
      "Event start time": "2021-08-02T20:57:06",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T21:05:39",
      "Event start time": "2021-08-02T20:53:50",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-02T21:12:43",
      "Event start time": "2021-08-02T21:12:25",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T21:31:09",
      "Event start time": "2021-08-02T21:05:55",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T21:40:32",
      "Event start time": "2021-08-02T20:17:58",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T21:48:35",
      "Event start time": "2021-08-02T21:42:31",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T22:02:32",
      "Event start time": "2021-08-02T18:06:39",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T22:04:19",
      "Event start time": "2021-08-02T21:54:00",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T22:11:37",
      "Event start time": "2021-08-02T22:10:02",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T22:13:44",
      "Event start time": "2021-08-02T22:13:25",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T22:17:13",
      "Event start time": "2021-08-02T21:33:37",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T22:21:33",
      "Event start time": "2021-08-02T22:21:26",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-02T22:21:33",
      "Event start time": "2021-08-02T22:21:26",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-02T22:21:41",
      "Event start time": "2021-08-02T22:21:07",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T22:28:36",
      "Event start time": "2021-08-02T22:17:53",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T22:36:41",
      "Event start time": "2021-08-02T22:28:55",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-02T22:41:04",
      "Event start time": "2021-08-02T22:38:33",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T22:42:56",
      "Event start time": "2021-08-02T22:26:48",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T22:50:53",
      "Event start time": "2021-08-02T22:50:50",
      "USER_NAME": "WD MEDT-01 NEG1473"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T23:07:18",
      "Event start time": "2021-08-02T22:35:05",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T23:18:58",
      "Event start time": "2021-08-02T22:58:24",
      "USER_NAME": "WD MEDT-02 NEG1470"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-02T23:23:02",
      "Event start time": "2021-08-02T23:21:34",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-02T23:36:18",
      "Event start time": "2021-08-02T22:53:59",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T23:41:13",
      "Event start time": "2021-08-02T23:41:08",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T23:44:49",
      "Event start time": "2021-08-02T23:40:47",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T23:50:45",
      "Event start time": "2021-08-02T22:32:18",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-02T23:56:15",
      "Event start time": "2021-08-02T22:36:15",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:01:29",
      "Event start time": "2021-08-02T23:58:35",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T00:04:07",
      "Event start time": "2021-08-02T22:54:54",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:05:37",
      "Event start time": "2021-08-03T00:03:07",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:08:41",
      "Event start time": "2021-08-02T23:08:18",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T00:09:10",
      "Event start time": "2021-08-03T00:07:07",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:12:47",
      "Event start time": "2021-08-02T23:18:27",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T00:17:05",
      "Event start time": "2021-08-03T00:08:57",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T00:24:03",
      "Event start time": "2021-08-02T23:03:18",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T00:26:04",
      "Event start time": "2021-08-03T00:25:02",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T00:26:54",
      "Event start time": "2021-08-03T00:26:39",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:28:17",
      "Event start time": "2021-08-02T23:01:09",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T00:40:29",
      "Event start time": "2021-08-03T00:32:01",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:44:33",
      "Event start time": "2021-08-02T22:54:54",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T00:47:11",
      "Event start time": "2021-08-03T00:28:07",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:47:32",
      "Event start time": "2021-08-03T00:15:53",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:48:07",
      "Event start time": "2021-08-03T00:45:47",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T00:49:13",
      "Event start time": "2021-08-03T00:44:40",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:49:48",
      "Event start time": "2021-08-03T00:49:32",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-03T00:51:33",
      "Event start time": "2021-08-03T00:15:44",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T00:53:00",
      "Event start time": "2021-08-03T00:47:14",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:53:31",
      "Event start time": "2021-08-03T00:51:04",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:54:19",
      "Event start time": "2021-08-03T00:06:26",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:54:35",
      "Event start time": "2021-08-03T00:54:20",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T00:55:56",
      "Event start time": "2021-08-03T00:54:43",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T00:56:11",
      "Event start time": "2021-08-03T00:30:08",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T01:04:07",
      "Event start time": "2021-08-03T00:10:22",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T01:08:22",
      "Event start time": "2021-08-02T22:43:43",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T01:09:46",
      "Event start time": "2021-08-03T00:54:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:09:49",
      "Event start time": "2021-08-03T00:54:57",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:13:24",
      "Event start time": "2021-08-03T01:12:59",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T01:15:25",
      "Event start time": "2021-08-03T00:44:15",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T01:15:57",
      "Event start time": "2021-08-03T01:15:38",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:16:37",
      "Event start time": "2021-08-03T01:16:09",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T01:18:27",
      "Event start time": "2021-08-02T23:44:01",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T01:20:12",
      "Event start time": "2021-08-03T00:49:59",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:22:25",
      "Event start time": "2021-08-03T00:47:30",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:22:31",
      "Event start time": "2021-08-03T01:19:08",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:23:23",
      "Event start time": "2021-08-03T00:25:10",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T01:23:54",
      "Event start time": "2021-08-03T00:59:55",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-03T01:24:45",
      "Event start time": "2021-08-03T01:23:42",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:26:07",
      "Event start time": "2021-08-02T22:46:51",
      "USER_NAME": "WD MEDT-01 NEG1473"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:26:15",
      "Event start time": "2021-08-02T22:52:23",
      "USER_NAME": "WD MEDT-02 NEG1470"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:26:36",
      "Event start time": "2021-08-03T01:26:30",
      "USER_NAME": "WD MEDT-02 NEG1470"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:30:10",
      "Event start time": "2021-08-03T01:27:07",
      "USER_NAME": "WD MEDT-01 NEG1473"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:30:18",
      "Event start time": "2021-08-03T01:28:22",
      "USER_NAME": "WD MEDT-02 NEG1470"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:31:44",
      "Event start time": "2021-08-03T00:58:11",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:33:02",
      "Event start time": "2021-08-03T01:10:11",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T01:33:02",
      "Event start time": "2021-08-03T01:10:11",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T01:36:42",
      "Event start time": "2021-08-03T01:35:48",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "WHSE 12",
      "EVENT_TIME": "2021-08-03T01:38:52",
      "Event start time": "2021-08-03T01:36:49",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T01:40:49",
      "Event start time": "2021-08-03T00:52:36",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T01:41:42",
      "Event start time": "2021-08-03T01:24:30",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:43:54",
      "Event start time": "2021-08-03T00:49:48",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T01:45:42",
      "Event start time": "2021-08-03T01:04:23",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:48:22",
      "Event start time": "2021-08-03T01:02:00",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:49:25",
      "Event start time": "2021-08-03T01:49:01",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T01:50:41",
      "Event start time": "2021-08-03T01:36:49",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T01:53:09",
      "Event start time": "2021-08-03T01:01:07",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T01:56:08",
      "Event start time": "2021-08-03T00:57:47",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 15",
      "EVENT_TIME": "2021-08-03T01:58:43",
      "Event start time": "2021-08-03T01:45:33",
      "USER_NAME": "WD FWD-R16 NEB3195"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:59:44",
      "Event start time": "2021-08-03T01:59:23",
      "USER_NAME": "WD MEDT-01 NEG1473"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T01:59:56",
      "Event start time": "2021-08-03T01:59:39",
      "USER_NAME": "WD MEDT-02 NEG1470"
    },
    {
      "GEOFENCE_NAME": "DEPOT 18",
      "EVENT_TIME": "2021-08-03T02:00:33",
      "Event start time": "2021-08-03T01:27:55",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T02:04:54",
      "Event start time": "2021-08-03T02:02:01",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T02:05:08",
      "Event start time": "2021-08-03T00:37:43",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:06:47",
      "Event start time": "2021-08-03T02:01:42",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 58",
      "EVENT_TIME": "2021-08-03T02:09:31",
      "Event start time": "2021-08-03T02:09:02",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:10:05",
      "Event start time": "2021-08-03T02:07:18",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:14:21",
      "Event start time": "2021-08-02T16:57:30",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:15:54",
      "Event start time": "2021-08-03T02:14:08",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:18:00",
      "Event start time": "2021-08-03T01:50:05",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-03T02:18:04",
      "Event start time": "2021-08-03T02:10:02",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:21:21",
      "Event start time": "2021-08-03T01:46:47",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:23:34",
      "Event start time": "2021-08-03T02:23:06",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:23:49",
      "Event start time": "2021-08-03T01:43:47",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:25:08",
      "Event start time": "2021-08-03T02:22:18",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:28:11",
      "Event start time": "2021-08-03T02:09:30",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:31:23",
      "Event start time": "2021-08-03T01:33:23",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T02:38:31",
      "Event start time": "2021-08-03T02:02:56",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-03T02:38:54",
      "Event start time": "2021-08-03T02:37:52",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-03T02:39:26",
      "Event start time": "2021-08-03T02:10:25",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T02:40:45",
      "Event start time": "2021-08-03T02:40:28",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:41:06",
      "Event start time": "2021-08-03T01:54:52",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 12",
      "EVENT_TIME": "2021-08-03T02:44:09",
      "Event start time": "2021-08-03T02:42:59",
      "USER_NAME": "WD 6W-47 NAR1779"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T02:45:21",
      "Event start time": "2021-08-03T02:44:20",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:45:32",
      "Event start time": "2021-08-03T02:42:51",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:48:46",
      "Event start time": "2021-08-03T02:23:34",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:51:04",
      "Event start time": "2021-08-03T02:19:40",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:52:54",
      "Event start time": "2021-08-03T02:50:54",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "DEPOT 61",
      "EVENT_TIME": "2021-08-03T02:55:49",
      "Event start time": "2021-08-03T02:11:43",
      "USER_NAME": "WD 6W-63 NBI7885"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T02:57:22",
      "Event start time": "2021-08-03T02:26:08",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T02:58:22",
      "Event start time": "2021-08-03T02:36:09",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T02:58:22",
      "Event start time": "2021-08-03T02:38:26",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:00:18",
      "Event start time": "2021-08-03T02:56:08",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T03:03:34",
      "Event start time": "2021-08-03T00:35:38",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:04:43",
      "Event start time": "2021-08-03T03:04:22",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-03T03:05:53",
      "Event start time": "2021-08-03T03:05:32",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "DEPOT 27",
      "EVENT_TIME": "2021-08-03T03:07:51",
      "Event start time": "2021-08-03T01:44:17",
      "USER_NAME": "WD 4W-132 NDI3039"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:11:55",
      "Event start time": "2021-08-03T03:11:29",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T03:12:47",
      "Event start time": "2021-08-03T01:58:00",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 56",
      "EVENT_TIME": "2021-08-03T03:13:18",
      "Event start time": "2021-08-03T02:32:12",
      "USER_NAME": "WD 4W-123 NBT8116"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:14:27",
      "Event start time": "2021-08-03T03:09:39",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "HO2",
      "EVENT_TIME": "2021-08-03T03:14:37",
      "Event start time": "2021-08-03T03:13:24",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T03:15:44",
      "Event start time": "2021-08-03T02:17:55",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "WHSE 14",
      "EVENT_TIME": "2021-08-03T03:16:36",
      "Event start time": "2021-08-03T03:15:41",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:16:40",
      "Event start time": "2021-08-03T02:15:59",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:21:00",
      "Event start time": "2021-08-03T03:20:49",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T03:25:06",
      "Event start time": "2021-08-02T21:50:25",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:28:37",
      "Event start time": "2021-08-03T03:28:27",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:28:51",
      "Event start time": "2021-08-03T03:26:00",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T03:29:58",
      "Event start time": "2021-08-03T01:45:56",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:31:45",
      "Event start time": "2021-08-03T03:31:24",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:31:51",
      "Event start time": "2021-08-03T03:31:15",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T03:33:15",
      "Event start time": "2021-08-03T02:52:48",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:36:44",
      "Event start time": "2021-08-03T03:36:28",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 1",
      "EVENT_TIME": "2021-08-03T03:40:33",
      "Event start time": "2021-08-03T02:12:18",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T03:42:58",
      "Event start time": "2021-08-03T03:36:50",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 12",
      "EVENT_TIME": "2021-08-03T03:48:05",
      "Event start time": "2021-08-03T02:24:51",
      "USER_NAME": "WD FWD-R16 NEB3195"
    },
    {
      "GEOFENCE_NAME": "DEPOT 19",
      "EVENT_TIME": "2021-08-03T03:50:44",
      "Event start time": "2021-08-03T03:49:36",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T03:52:04",
      "Event start time": "2021-08-03T03:51:02",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T03:54:14",
      "Event start time": "2021-08-03T03:16:58",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:54:14",
      "Event start time": "2021-08-03T03:14:29",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T03:56:20",
      "Event start time": "2021-08-03T03:54:42",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T03:58:59",
      "Event start time": "2021-08-03T03:58:33",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T04:00:28",
      "Event start time": "2021-08-03T03:03:54",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T04:01:30",
      "Event start time": "2021-08-03T03:34:43",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:04:38",
      "Event start time": "2021-08-03T03:31:45",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T04:12:12",
      "Event start time": "2021-08-03T02:16:01",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "WHSE 12",
      "EVENT_TIME": "2021-08-03T04:13:30",
      "Event start time": "2021-08-03T04:12:39",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-03T04:13:30",
      "Event start time": "2021-08-03T04:12:28",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T04:16:46",
      "Event start time": "2021-08-03T04:13:44",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:16:49",
      "Event start time": "2021-08-02T16:11:51",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T04:29:43",
      "Event start time": "2021-08-03T00:28:45",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:30:31",
      "Event start time": "2021-08-03T02:58:21",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T04:30:31",
      "Event start time": "2021-08-03T03:03:27",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:34:29",
      "Event start time": "2021-08-03T00:26:43",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:35:24",
      "Event start time": "2021-08-03T04:34:31",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:35:40",
      "Event start time": "2021-08-03T04:31:29",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T04:44:31",
      "Event start time": "2021-08-03T04:36:57",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "DEPOT 5",
      "EVENT_TIME": "2021-08-03T04:49:40",
      "Event start time": "2021-08-03T04:35:32",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T04:52:33",
      "Event start time": "2021-08-03T04:52:09",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T04:54:52",
      "Event start time": "2021-08-03T04:54:31",
      "USER_NAME": "WD 6W-73 NFY5464"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T05:00:55",
      "Event start time": "2021-08-03T02:33:43",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 8",
      "EVENT_TIME": "2021-08-03T05:03:45",
      "Event start time": "2021-08-03T03:07:42",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T05:05:31",
      "Event start time": "2021-08-03T03:58:12",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T05:05:44",
      "Event start time": "2021-08-03T05:05:05",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T05:06:10",
      "Event start time": "2021-08-03T05:02:44",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T05:06:59",
      "Event start time": "2021-08-03T05:06:32",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T05:07:29",
      "Event start time": "2021-08-03T03:43:27",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T05:10:47",
      "Event start time": "2021-08-03T04:06:48",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T05:15:00",
      "Event start time": "2021-08-03T05:07:34",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "HO8",
      "EVENT_TIME": "2021-08-03T05:16:57",
      "Event start time": "2021-08-03T04:56:20",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "HO2",
      "EVENT_TIME": "2021-08-03T05:20:43",
      "Event start time": "2021-08-03T04:46:22",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T05:22:13",
      "Event start time": "2021-08-03T03:34:32",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T05:28:14",
      "Event start time": "2021-08-03T05:28:09",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T05:28:31",
      "Event start time": "2021-08-03T05:06:54",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T05:31:02",
      "Event start time": "2021-08-03T05:30:44",
      "USER_NAME": "WD TH-64 NDQ1045"
    },
    {
      "GEOFENCE_NAME": "HO5",
      "EVENT_TIME": "2021-08-03T05:33:27",
      "Event start time": "2021-08-03T03:23:05",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T05:33:34",
      "Event start time": "2021-08-03T04:37:09",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T05:36:03",
      "Event start time": "2021-08-03T05:35:46",
      "USER_NAME": "WD TH-62 NDQ1048"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T05:38:11",
      "Event start time": "2021-08-03T04:33:38",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T05:42:42",
      "Event start time": "2021-08-03T05:41:14",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 12",
      "EVENT_TIME": "2021-08-03T05:42:47",
      "Event start time": "2021-08-03T05:41:36",
      "USER_NAME": "WD 6W-47 NAR1779"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T05:46:26",
      "Event start time": "2021-08-03T05:12:56",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T05:48:47",
      "Event start time": "2021-08-03T05:47:25",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T05:49:17",
      "Event start time": "2021-08-03T05:24:11",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-08-03T05:52:04",
      "Event start time": "2021-08-03T03:31:35",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T05:54:09",
      "Event start time": "2021-08-03T05:19:21",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T05:54:42",
      "Event start time": "2021-08-03T05:07:26",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "DEPOT 7",
      "EVENT_TIME": "2021-08-03T05:55:27",
      "Event start time": "2021-08-03T04:15:58",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T05:57:10",
      "Event start time": "2021-08-03T05:55:19",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "HO5",
      "EVENT_TIME": "2021-08-03T06:00:49",
      "Event start time": "2021-08-03T06:00:24",
      "USER_NAME": "WD 4W-134 NDI3451"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:01:41",
      "Event start time": "2021-08-03T05:13:35",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:02:16",
      "Event start time": "2021-08-03T06:01:09",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:04:23",
      "Event start time": "2021-08-03T05:35:33",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T06:04:59",
      "Event start time": "2021-08-03T05:28:43",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 19",
      "EVENT_TIME": "2021-08-03T06:05:23",
      "Event start time": "2021-08-03T06:04:22",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-03T06:06:04",
      "Event start time": "2021-08-03T06:04:01",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T06:13:44",
      "Event start time": "2021-08-03T04:06:36",
      "USER_NAME": "WD 4W-138 NDI3454"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-03T06:15:59",
      "Event start time": "2021-08-03T06:13:54",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T06:18:59",
      "Event start time": "2021-08-03T06:03:55",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T06:26:41",
      "Event start time": "2021-08-03T06:07:59",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-03T06:28:27",
      "Event start time": "2021-08-03T05:51:12",
      "USER_NAME": "WD 4W-131 NDI3038"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:28:43",
      "Event start time": "2021-08-03T06:27:50",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:32:37",
      "Event start time": "2021-08-03T06:32:32",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:34:09",
      "Event start time": "2021-08-03T05:52:55",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T06:42:53",
      "Event start time": "2021-08-03T05:56:45",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:46:22",
      "Event start time": "2021-08-03T06:34:16",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T06:49:33",
      "Event start time": "2021-08-03T04:37:19",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:49:39",
      "Event start time": "2021-08-03T06:48:30",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:50:41",
      "Event start time": "2021-08-03T06:50:23",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T06:51:13",
      "Event start time": "2021-08-03T06:49:43",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:52:47",
      "Event start time": "2021-08-03T06:50:05",
      "USER_NAME": "WD 6W-64 NDI3455"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:52:57",
      "Event start time": "2021-08-03T05:50:58",
      "USER_NAME": "WD FWD-R14 NEB3204"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:55:00",
      "Event start time": "2021-08-03T06:51:13",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T06:55:27",
      "Event start time": "2021-08-03T06:52:41",
      "USER_NAME": "WD FWD-R06 NEB3207"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T06:56:10",
      "Event start time": "2021-08-03T06:09:18",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-03T06:57:22",
      "Event start time": "2021-08-03T06:56:49",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "DEPOT 11",
      "EVENT_TIME": "2021-08-03T07:00:21",
      "Event start time": "2021-08-03T06:04:33",
      "USER_NAME": "WD FWD-R16 NEB3195"
    },
    {
      "GEOFENCE_NAME": "HO6",
      "EVENT_TIME": "2021-08-03T07:04:41",
      "Event start time": "2021-08-03T07:03:50",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T07:07:01",
      "Event start time": "2021-08-03T03:49:43",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DEPOT 76",
      "EVENT_TIME": "2021-08-03T07:12:20",
      "Event start time": "2021-08-03T02:37:13",
      "USER_NAME": "WD TH-61 NDQ1046 "
    },
    {
      "GEOFENCE_NAME": "SILANG FARM",
      "EVENT_TIME": "2021-08-03T07:12:53",
      "Event start time": "2021-08-03T04:49:05",
      "USER_NAME": "WD MEDT-01 NEG1473"
    },
    {
      "GEOFENCE_NAME": "SILANG FARM",
      "EVENT_TIME": "2021-08-03T07:14:08",
      "Event start time": "2021-08-03T04:40:23",
      "USER_NAME": "WD MEDT-02 NEG1470"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-03T07:16:05",
      "Event start time": "2021-08-03T06:50:13",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-03T07:20:24",
      "Event start time": "2021-08-03T07:10:19",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "DEPOT 32",
      "EVENT_TIME": "2021-08-03T07:21:48",
      "Event start time": "2021-08-03T04:06:19",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T07:22:42",
      "Event start time": "2021-08-03T07:18:29",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "HO3",
      "EVENT_TIME": "2021-08-03T07:24:57",
      "Event start time": "2021-08-03T03:53:57",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T07:31:46",
      "Event start time": "2021-08-03T06:34:07",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T07:33:48",
      "Event start time": "2021-08-03T06:28:56",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T07:40:48",
      "Event start time": "2021-08-03T07:39:04",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T07:42:02",
      "Event start time": "2021-08-03T05:01:46",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-08-03T07:57:59",
      "Event start time": "2021-08-03T07:21:19",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T08:02:24",
      "Event start time": "2021-08-03T06:59:01",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-03T08:02:33",
      "Event start time": "2021-08-03T06:17:39",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T08:04:12",
      "Event start time": "2021-08-03T07:57:48",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T08:04:17",
      "Event start time": "2021-08-03T08:02:46",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T08:05:57",
      "Event start time": "2021-08-03T06:54:44",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T08:07:09",
      "Event start time": "2021-08-03T06:43:51",
      "USER_NAME": "WD FWD-R02 NEB3186"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T08:08:00",
      "Event start time": "2021-08-03T07:50:06",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T08:08:10",
      "Event start time": "2021-08-03T06:21:12",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T08:11:39",
      "Event start time": "2021-08-03T07:46:18",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-03T08:12:51",
      "Event start time": "2021-08-03T04:06:25",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T08:18:57",
      "Event start time": "2021-08-03T08:16:00",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-03T08:23:43",
      "Event start time": "2021-08-03T08:12:37",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-03T08:24:11",
      "Event start time": "2021-08-03T08:22:53",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T08:25:34",
      "Event start time": "2021-08-03T08:24:03",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T08:30:13",
      "Event start time": "2021-08-03T08:10:05",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T08:32:33",
      "Event start time": "2021-08-03T07:21:38",
      "USER_NAME": "WD 4W-137 NDI3453"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T08:34:38",
      "Event start time": "2021-08-03T08:33:18",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T08:36:56",
      "Event start time": "2021-08-03T08:13:26",
      "USER_NAME": "WD FWD-R15 NEB3196"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T08:37:04",
      "Event start time": "2021-08-03T07:48:12",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T08:37:04",
      "Event start time": "2021-08-03T08:00:47",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "WHSE 12",
      "EVENT_TIME": "2021-08-03T08:39:04",
      "Event start time": "2021-08-03T08:35:18",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-03T08:40:55",
      "Event start time": "2021-08-03T08:38:40",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T08:41:29",
      "Event start time": "2021-08-03T08:39:20",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T08:43:46",
      "Event start time": "2021-08-03T08:32:17",
      "USER_NAME": "WD FWD-R01 NEB3977"
    },
    {
      "GEOFENCE_NAME": "DEPOT 6",
      "EVENT_TIME": "2021-08-03T08:46:07",
      "Event start time": "2021-08-03T08:13:48",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T08:56:59",
      "Event start time": "2021-08-03T08:55:33",
      "USER_NAME": "WD 4W-141 NFY5460"
    },
    {
      "GEOFENCE_NAME": "B09",
      "EVENT_TIME": "2021-08-03T09:00:46",
      "Event start time": "2021-08-03T08:57:44",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-03T09:14:47",
      "Event start time": "2021-08-03T09:13:46",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "HO6",
      "EVENT_TIME": "2021-08-03T09:17:16",
      "Event start time": "2021-08-03T08:56:11",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T09:19:42",
      "Event start time": "2021-08-03T09:18:06",
      "USER_NAME": "WD 6W-68 NDI3036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-03T09:23:08",
      "Event start time": "2021-08-03T09:22:05",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 19",
      "EVENT_TIME": "2021-08-03T09:30:14",
      "Event start time": "2021-08-03T08:19:49",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "MDC 1 - LOADING AREA",
      "EVENT_TIME": "2021-08-03T09:32:42",
      "Event start time": "2021-08-03T08:29:26",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T09:37:28",
      "Event start time": "2021-08-03T09:12:55",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T09:48:32",
      "Event start time": "2021-08-03T09:47:30",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T09:50:52",
      "Event start time": "2021-08-03T09:49:25",
      "USER_NAME": "WD 6W-61 NBT7890"
    },
    {
      "GEOFENCE_NAME": "DEPOT 3",
      "EVENT_TIME": "2021-08-03T09:55:19",
      "Event start time": "2021-08-03T09:53:16",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-03T09:59:43",
      "Event start time": "2021-08-03T09:58:35",
      "USER_NAME": "WD 6W-53 NBF9380"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T10:32:05",
      "Event start time": "2021-08-03T09:53:56",
      "USER_NAME": "WD 4W-144 NGL2390"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T10:35:08",
      "Event start time": "2021-08-03T10:33:20",
      "USER_NAME": "WD 6W-56 NBG4981"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T10:39:52",
      "Event start time": "2021-08-03T10:21:44",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "DEPOT 9",
      "EVENT_TIME": "2021-08-03T10:46:19",
      "Event start time": "2021-08-03T10:43:27",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T10:46:55",
      "Event start time": "2021-08-03T10:41:52",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T11:05:03",
      "Event start time": "2021-08-03T10:54:57",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T11:05:40",
      "Event start time": "2021-08-03T11:05:35",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-03T11:08:30",
      "Event start time": "2021-08-03T11:07:52",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T11:10:37",
      "Event start time": "2021-08-03T11:08:50",
      "USER_NAME": "WD 4W-129 NDI3037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T11:18:32",
      "Event start time": "2021-08-03T08:51:39",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T11:20:09",
      "Event start time": "2021-08-03T11:19:04",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T11:20:26",
      "Event start time": "2021-08-03T11:18:30",
      "USER_NAME": "WD 4W-143 NGL2391"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T11:34:15",
      "Event start time": "2021-08-03T11:22:34",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T11:51:22",
      "Event start time": "2021-08-03T11:49:20",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T11:54:02",
      "Event start time": "2021-08-03T11:53:38",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "DEPOT 59",
      "EVENT_TIME": "2021-08-03T12:20:14",
      "Event start time": "2021-08-03T10:12:06",
      "USER_NAME": "WD 4W-142 NGL2392"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T12:29:47",
      "Event start time": "2021-08-03T09:41:11",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 1",
      "EVENT_TIME": "2021-08-03T12:30:06",
      "Event start time": "2021-08-03T07:24:10",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T12:35:41",
      "Event start time": "2021-08-03T12:35:10",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T12:36:25",
      "Event start time": "2021-08-03T12:35:23",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T12:41:25",
      "Event start time": "2021-08-03T10:34:37",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T12:41:42",
      "Event start time": "2021-08-03T12:41:28",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "WO9 PARA%u00d1AQUE",
      "EVENT_TIME": "2021-08-03T12:46:04",
      "Event start time": "2021-08-03T10:50:47",
      "USER_NAME": "WD 4W-127 NDI3450"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T12:54:26",
      "Event start time": "2021-08-03T12:41:57",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 73",
      "EVENT_TIME": "2021-08-03T13:01:24",
      "Event start time": "2021-08-03T05:34:21",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T13:05:21",
      "Event start time": "2021-08-03T12:30:03",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T13:06:30",
      "Event start time": "2021-08-03T06:03:29",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DEPOT 33",
      "EVENT_TIME": "2021-08-03T13:18:11",
      "Event start time": "2021-08-03T09:49:14",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T13:23:24",
      "Event start time": "2021-08-03T12:55:08",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T13:34:29",
      "Event start time": "2021-08-03T13:34:00",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T13:35:41",
      "Event start time": "2021-08-03T11:46:32",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T13:39:33",
      "Event start time": "2021-08-03T13:35:34",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T13:46:56",
      "Event start time": "2021-08-03T07:59:06",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T13:47:06",
      "Event start time": "2021-08-03T06:42:09",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T13:52:51",
      "Event start time": "2021-08-03T12:31:47",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T13:52:51",
      "Event start time": "2021-08-03T12:36:58",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "PARKING AREA",
      "EVENT_TIME": "2021-08-03T13:56:13",
      "Event start time": "2021-08-03T12:37:57",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T13:56:13",
      "Event start time": "2021-08-03T12:32:01",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T13:56:50",
      "Event start time": "2021-08-03T13:44:26",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T13:58:48",
      "Event start time": "2021-08-03T13:40:28",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "HO7",
      "EVENT_TIME": "2021-08-03T14:00:02",
      "Event start time": "2021-08-03T07:51:29",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 2C",
      "EVENT_TIME": "2021-08-03T14:03:04",
      "Event start time": "2021-08-03T14:02:02",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T14:09:08",
      "Event start time": "2021-08-03T14:08:42",
      "USER_NAME": "WD 14W-19 NDQ1037"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T14:10:27",
      "Event start time": "2021-08-03T13:57:48",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 10",
      "EVENT_TIME": "2021-08-03T14:17:27",
      "Event start time": "2021-08-03T14:17:12",
      "USER_NAME": "WD 14W-16 NDQ1034"
    },
    {
      "GEOFENCE_NAME": "MIP",
      "EVENT_TIME": "2021-08-03T14:19:26",
      "Event start time": "2021-08-03T06:21:59",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-03T14:28:31",
      "Event start time": "2021-08-03T14:26:29",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T14:30:09",
      "Event start time": "2021-08-03T13:59:46",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T14:47:34",
      "Event start time": "2021-08-03T14:40:12",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T14:48:24",
      "Event start time": "2021-08-03T14:45:05",
      "USER_NAME": "WD FWD-R03 NEB3206"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T14:48:27",
      "Event start time": "2021-08-03T14:45:07",
      "USER_NAME": "WD FWD-R05 NEB3205"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T14:50:11",
      "Event start time": "2021-08-03T14:13:55",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T14:57:07",
      "Event start time": "2021-08-03T14:48:17",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DEPOT 72",
      "EVENT_TIME": "2021-08-03T14:58:13",
      "Event start time": "2021-08-03T14:00:44",
      "USER_NAME": "WD 6W-76 NFY5462"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:02:36",
      "Event start time": "2021-08-03T15:01:21",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T15:09:11",
      "Event start time": "2021-08-03T14:57:24",
      "USER_NAME": "WD TH-60 NBQ4265"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:16:12",
      "Event start time": "2021-08-03T15:03:34",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T15:16:18",
      "Event start time": "2021-08-03T15:08:47",
      "USER_NAME": "WD FWD-R11 NEB3187"
    },
    {
      "GEOFENCE_NAME": "DEPOT 53",
      "EVENT_TIME": "2021-08-03T15:16:34",
      "Event start time": "2021-08-03T15:16:02",
      "USER_NAME": "WD FWD-R08 NED3215"
    },
    {
      "GEOFENCE_NAME": "DEPOT 29",
      "EVENT_TIME": "2021-08-03T15:18:54",
      "Event start time": "2021-08-03T15:17:43",
      "USER_NAME": "WD TH-63 NDQ1049"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:19:42",
      "Event start time": "2021-08-03T15:16:42",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T15:22:37",
      "Event start time": "2021-08-03T14:56:50",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T15:23:09",
      "Event start time": "2021-08-03T15:22:58",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T15:27:11",
      "Event start time": "2021-08-03T15:18:38",
      "USER_NAME": "WD FWD-R12 NEB3184"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:29:44",
      "Event start time": "2021-08-03T15:22:45",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T15:32:13",
      "Event start time": "2021-08-03T15:30:40",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MIP",
      "EVENT_TIME": "2021-08-03T15:33:46",
      "Event start time": "2021-08-03T06:13:07",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T15:33:49",
      "Event start time": "2021-08-03T15:23:33",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T15:34:40",
      "Event start time": "2021-08-03T15:30:21",
      "USER_NAME": "WD 14W-20 NDQ1041"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:35:08",
      "Event start time": "2021-08-03T15:31:47",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T15:35:17",
      "Event start time": "2021-08-03T15:33:42",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "MDC 2",
      "EVENT_TIME": "2021-08-03T15:37:34",
      "Event start time": "2021-08-03T15:35:33",
      "USER_NAME": "WD 14W-17 NDQ1036"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T15:43:21",
      "Event start time": "2021-08-03T15:41:36",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T15:43:58",
      "Event start time": "2021-08-03T15:40:45",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T15:44:48",
      "Event start time": "2021-08-03T15:44:04",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "B08",
      "EVENT_TIME": "2021-08-03T15:46:50",
      "Event start time": "2021-08-03T15:46:10",
      "USER_NAME": "WD 4W-136 NDI3452"
    },
    {
      "GEOFENCE_NAME": "LOCAL",
      "EVENT_TIME": "2021-08-03T15:51:54",
      "Event start time": "2021-08-03T15:49:52",
      "USER_NAME": "WD TH-65 NDQ1047"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:52:05",
      "Event start time": "2021-08-03T15:37:15",
      "USER_NAME": "WD 6W-72 NFY5463"
    },
    {
      "GEOFENCE_NAME": "DDC",
      "EVENT_TIME": "2021-08-03T15:55:42",
      "Event start time": "2021-08-03T15:43:35",
      "USER_NAME": "WD 14W-18 NDQ1040"
    },
    {
      "GEOFENCE_NAME": "DEPOT 71",
      "EVENT_TIME": "2021-08-03T15:56:31",
      "Event start time": "2021-08-03T15:53:04",
      "USER_NAME": "WD 6W-72 NFY5463"
    }
  ];
// fix events
router.get('/test/fix/events/:from/:to', (req,res,next)=>{
    const from = Number(req.params.from);
    const to = Number(req.params.to);

    // PRODUCTION
    // const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://marielle:gwt2sqiMDZ5JnBM@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
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
                    { timestamp: new Date(val["Event start time"]+"Z").toISOString(), stage: "end" }, // , "USER_NAME": val["USER_NAME"] 
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
module.exports = router;