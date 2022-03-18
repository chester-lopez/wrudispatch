
const express = require('express');
const Joi = require('joi');
const moment = require('moment-timezone');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const schema = require("../utils/schema");

const collection = "dispatch";
const db = require("../utils/db");

const router = express.Router();


var chassis = [];
// import chassis
router.get('/test/import/chassis', (req,res,next)=>{
    // PRODUCTION
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            const childPromise = [];

            chassis.forEach(val => {
                const _id = val._id;

                (val.company_id) ? val.company_id = db.getPrimaryKey(val.company_id) : null;
                (val.section_id) ? val.section_id = db.getPrimaryKey(val.section_id) : null;
                (val.body_type_id) ? val.body_type_id = db.getPrimaryKey(val.body_type_id) : null;

                delete val._id;

                childPromise.push(
                    client.db('wilcon').collection("chassis").updateOne(
                        { _id },
                        { $set: val, $unset: { type_id: '', 'Plate Number': '' } }
                    )
                );

            });
            
            Promise.all(childPromise).then(result => {
                res.json({ok:1});
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
    
    var dbName = "wd-fleet";
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            const childPromise = [];
            client.db("wd-coket2").collection("geofences").find({}).toArray().then(docs => {
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
    
    var dbName = "wd-fleet";
    
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



// tramsfer chassis from wd-wilcon to wilcon
router.get('/test/transfer/cs/:collection', (req,res,next)=>{

    const collection = req.params.collection;

    // PRODUCTION
    const prodUrl = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const devUrl = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    MongoClient.connect(prodUrl, mongoOptions, (err,clientProd) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            MongoClient.connect(devUrl, mongoOptions, (err,clientDev) => {
                if(err){
                    console.log("ERROR3",err);
                } else {
                    clientDev.db('wilcon').collection(collection).find({}).toArray()
                    .then(docs => {
                        clientProd.db('wilcon').collection(collection).insertMany(docs)
                        .then(result => {
                            clientDev.close();
                            clientProd.close();
                            res.json({ok:1,result});
                        }).catch(error => {
                            clientDev.close();
                            clientProd.close();
                            res.json({error});
                        });
                    }).catch(error => {
                        clientDev.close();
                        clientProd.close();
                        res.json({error});
                    });
                }
            });
        }
    });
    /**************** END OTHER COLLECTIONS */
});


// from vehicles_company vehicle_personnel_company, chassis_company to 'company'   --- AND section
router.get('/test/update/cs/:old/:new', (req,res,next)=>{

    
    const old = db.getPrimaryKey(req.params.old);
    // const old = req.params.old;
    const _new = db.getPrimaryKey(req.params.new);


    // PRODUCTION
    // const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
    // DEVELOPMENT
    const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
    var mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 50};
    
    MongoClient.connect(url, mongoOptions, (err,client) => {
        if(err){
            console.log("ERROR1",err);
        } else {
            client.db('wilcon').collection("vehicles")
            .updateMany({ "section_id": old }, { $set: { "section_id": _new } })
            .then(result => {
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

/**
Company ID:
http://localhost:3000/api/dispatch_anon/test/update/cs/60adb86f64556100344daeda/62341cf52e16646be44b7b68 wd
http://localhost:3000/api/dispatch_anon/test/update/cs/60e5718b85a6900e981dcdfd/62341ce32e16646be44b7b67 sadc
http://localhost:3000/api/dispatch_anon/test/update/cs/60e5718f85a6900e981dcdfe/62341d002e16646be44b7b69 mo
http://localhost:3000/api/dispatch_anon/test/update/cs/60c4567f068b24003440cd29/62341d0c2e16646be44b7b6a wiza
http://localhost:3000/api/dispatch_anon/test/update/cs/60c45686068b24003440cd2a/62341d162e16646be44b7b6b triple
http://localhost:3000/api/dispatch_anon/test/update/cs/60c4568f068b24003440cd2b/623421b12e16646be44b7b6c wilcon


Section ID:
http://localhost:3000/api/dispatch_anon/test/update/cs/60a6671618b0483094318e1a/60e5717b85a6900e981dcdfa local
http://localhost:3000/api/dispatch_anon/test/update/cs/60a6671c18b0483094318e1b/60e5717e85a6900e981dcdfb base to base
http://localhost:3000/api/dispatch_anon/test/update/cs/60e5718285a6900e981dcdfc/60e5718285a6900e981dcdfc he mobi
http://localhost:3000/api/dispatch_anon/test/update/cs/60a6671418b0483094318e19/60e5717785a6900e981dcdf9 import
http://localhost:3000/api/dispatch_anon/test/update/cs/60adb86064556100344daed9/60c4566b068b24003440cd26 motorpool
http://localhost:3000/api/dispatch_anon/test/update/cs/60a6670d18b0483094318e18/60c4563b068b24003440cd24 customer delie
http://localhost:3000/api/dispatch_anon/test/update/cs/60cd8f8d2192b700341ea81c/60cd8f8d2192b700341ea81c warehouse
http://localhost:3000/api/dispatch_anon/test/update/cs/60b5963d3d9802003451030d/60b5963d3d9802003451030d gps


 */




module.exports = router;