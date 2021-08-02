const request = require('request');

const db = require("../utils/db");
const auth = require("../utils/auth");
const url = require('url');

/******** STREAMLIST ********/
var streamList = {
    sessions: {
        watch: () => {
            return {
                key: 'sessions',
                collection: 'sessions',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    dispatch: {
        watch: () => {
            return {
                key: 'dispatch',
                collection: 'dispatch',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        },
    },
    dispatch_status: {
        watch: () => {
           return {
                key: 'dispatch_status',
                collection: 'dispatch',
                pipeline: [{
                    $match: {
                        $and: [
                            { "updateDescription.updatedFields.status": { $exists: true } },
                            { operationType: "update" }
                        ]
                    }
                }],
                options: { fullDocument : "updateLookup" }
            };
        },
        ignoreInLoop: true
    },
    users: {
        watch: () => {
            return {
                key: 'users',
                collection: 'users',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    notifications: {
        watch: () => {
            return {
                key: 'notifications',
                collection: 'notifications',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        },
    },
    routes: {
        watch: () => {
            return {
                key: 'routes',
                collection: 'routes',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    geofences: {
        watch: () => {
            return {
                key: 'geofences',
                collection: 'geofences',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    regions: {
        watch: () => {
            return {
                key: 'regions',
                collection: 'regions',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    clusters: {
        watch: () => {
            return {
                key: 'clusters',
                collection: 'clusters',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicles: {
        watch: () => {
            return {
                key: 'vehicles',
                collection: 'vehicles',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicles_history: {
        watch: () => {
            return {
                key: 'vehicles_history',
                collection: 'vehicles_history',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicles_section: {
        watch: () => {
            return {
                key: 'vehicles_section',
                collection: 'vehicles_section',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicles_company: {
        watch: () => {
            return {
                key: 'vehicles_company',
                collection: 'vehicles_company',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicle_personnel: {
        watch: () => {
            return {
                key: 'vehicle_personnel',
                collection: 'vehicle_personnel',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicle_personnel_section: {
        watch: () => {
            return {
                key: 'vehicle_personnel_section',
                collection: 'vehicle_personnel_section',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    vehicle_personnel_company: {
        watch: () => {
            return {
                key: 'vehicle_personnel_company',
                collection: 'vehicle_personnel_company',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    chassis: {
        watch: () => {
            return {
                key: 'chassis',
                collection: 'chassis',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    chassis_section: {
        watch: () => {
            return {
                key: 'chassis_section',
                collection: 'chassis_section',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    chassis_company: {
        watch: () => {
            return {
                key: 'chassis_company',
                collection: 'chassis_company',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    chassis_type: {
        watch: () => {
            return {
                key: 'chassis_type',
                collection: 'chassis_type',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    trailers: {
        watch: () => {
            return {
                key: 'trailers',
                collection: 'trailers',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    shift_schedule: {
        watch: () => {
            return {
                key: 'shift_schedule',
                collection: 'shift_schedule',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
    fuel_refill: {
        watch: () => {
            return {
                key: 'fuel_refill',
                collection: 'fuel_refill',
                pipeline: [],
                options: { fullDocument : "updateLookup" }
            };
        }
    },
};
/******** END STREAMLIST ********/

var changestreams = {};
var resumeTokens = {};
var wsClients = {};

const connect = function(io,_ping_,ENVIRONMENT){ //io
    function conn(dbName,socket){
        var PERMISSION = {};
        var userInfo = {};

        wsClients[dbName] = wsClients[dbName] || [];
        socket ? wsClients[dbName].push(socket) : null;
        
        function watch(x){
            x.options = x.options || {};
            if(db.getCollection(dbName,x.collection) && !changestreams[`${dbName}_${x.key}`]){
                function watch_collection(){
                    x.options.resumeAfter = resumeTokens[`${dbName}_${x.key}`] || null;
                    changestreams[`${dbName}_${x.key}`] = db.getCollection(dbName,x.collection).watch(x.pipeline || [],x.options);

                    changestreams[`${dbName}_${x.key}`].on('change', function(event){
                        resumeTokens[`${dbName}_${x.key}`] = event._id;

                        if(x.key != "dispatch_status"){
                            var closedWsClientsIndex = [];
                            for (var i=0; i<wsClients[dbName].length; i++) {
                                var _ws = wsClients[dbName][i];
                                if (_ws.connected) {
                                    _ws.emit("*",JSON.stringify({
                                        type: x.key,
                                        data: event
                                    }));
                                } else {
                                    console.log(`_ws.connected = ${dbName}_${x.key}`,_ws.connected);
                                    _ws.disconnect(true);
                                    closedWsClientsIndex.push(i);
                                }
                            }
                            for (var i = closedWsClientsIndex.length -1; i >= 0; i--){
                                wsClients[dbName].splice(closedWsClientsIndex[i],1);
                            }
                        } else {
                            // if(ENVIRONMENT == "production" && dbName == "coket1"){
                            //     var fullDocument = event.fullDocument;
                            //     var origin_id = fullDocument.origin_id;
                            //     var destination_id = fullDocument.destination[0].location_id;
    
                            //     function getDateTime(status,obj,type="first"){
                            //         var OBJECT = {
                            //             sortByKey: o => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {}),
                            //             getKeyByValue: (o,v) => Object.keys(o).find(key => o[key] === v),
                            //         };
    
                            //         var events_captured = OBJECT.sortByKey(obj);
                            //         var datetime = 0;
                            //         Object.keys(events_captured).forEach(key => {
                            //             if(events_captured[key] == status){
                            //                 if(type == "first" && !datetime){
                            //                     datetime = Number(key);
                            //                 }
                            //                 if(type == "last"){
                            //                     datetime = Number(key);
                            //                 }
                            //             }
                            //             if(!status && !["plan","in_transit","complete","incomplete"].includes(events_captured[key])){
                            //                 if(type == "first" && !datetime){
                            //                     datetime = Number(key);
                            //                 }
                            //                 if(type == "last"){
                            //                     datetime = Number(key);
                            //                 }
                            //             }
                            //         });
                            //         return datetime;
                            //     }
    
                            //     db.getCollection(dbName,"geofences").find({_id:{$in:[db.getPrimaryKey(origin_id),db.getPrimaryKey(destination_id)]}}).toArray().then(gDocs => {
                            //         db.getCollection(dbName,"vehicles").find({_id:Number(fullDocument.vehicle_id)}).toArray().then(vDocs => {
                            //             fullDocument.destination[0] = fullDocument.destination[0] || {};
    
                            //             var origin = gDocs.find(x => (x._id||"").toString() == (origin_id||"").toString()) || {};
                            //             var destination = gDocs.find(x => (x._id||"").toString() == (destination_id||"").toString()) || {};
                            //             var vehicle = vDocs.find(x => (x._id||"").toString() == (fullDocument.vehicle_id||"").toString()) || {};
    
                            //             var events_captured = fullDocument.events_captured || {};
                            //             var entered_origin =  getDateTime(null,events_captured) ? new Date(getDateTime(null,events_captured)).toISOString() : null;
                            //             var in_transit =  getDateTime("in_transit",events_captured,"last") ? new Date(getDateTime("in_transit",events_captured,"last")).toISOString() : null;
                            //             var complete =  getDateTime("complete",events_captured,"last") ? new Date(getDateTime("complete",events_captured,"last")).toISOString() : null;
                                        
                            //             try {
                            //                 var obj = {
                            //                     "_id": fullDocument._id,
                            //                     "route": fullDocument.route || "",
                            //                     "origin": origin.short_name || "", // origin
                            //                     "destination": destination.short_name || "", // destination
        
                            //                     "plate_number": vehicle.name || "", // vehicle
                            //                     "pal_cap": vehicle["Pal Cap"] || "", // vehicle
                            //                     "conduction": vehicle["Tractor Conduction"] || "", // vehicle
                            //                     "trailer": fullDocument.trailer || "", // trailer
        
                            //                     "late_entry": fullDocument.late_entry || false,
                            //                     "comments": fullDocument.comments,
                            //                     "status": fullDocument.status,
        
                            //                     "checkin_datetime": entered_origin, 
                            //                     "checkout_datetime": in_transit,
                            //                     "completion_datetime": complete,
        
                            //                     "username": fullDocument.username,
                            //                     "posting_datetime": fullDocument.posting_date,
                            //                 };
                            //                 var queryParams = Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
                            //                 request
                            //                     .get(`https://asfa-ccbp-lct-dev-01.azurewebsites.net/api/wrudispatch?code=xyR6Yfbc5cJboGcIkKyCTQswKvRDG3/hs3U00HGaI8h5bJQdUJoZag==&${queryParams}`)
                            //                     .on('response', function(response) {
                            //                         console.log("Response",response.statusCode,response.statusMessage);
                            //                         console.log("Object",obj);
                            //                     })
                            //                     .on('error', function(err) {
                            //                         console.error("Error:",err);
                            //                     });
                            //             } catch (error){
                            //                 console.log("Request Error",error);
                            //             }
                            //         });
                            //     });
                            // }
                        }
                    }).on('error', err => {
                        console.log(`Error in ${x.key}: ${err}`);
                        watch_collection();
                    });
                }
                watch_collection();
            }
        };
        function startWatch(){
            // LOOP STREAMLIST
            Object.keys(streamList).forEach(key => {
                var obj = streamList[key];
                if(!obj.type || (obj.type && obj.type == userInfo.type) || !obj.ignoreInLoop){ // do not delete. Look at Maintenance
                    watch(obj.watch());
                }
            });
            // END LOOP STREAMLIST
            socket.emit("*",JSON.stringify({
                type: "server_status",
                status: 200
            }));
        };

        if(socket){
            socket.on('userInfo', function(data){
                userInfo = data;
                if(userInfo.dbName){
                    PERMISSION = auth.getPermission(dbName,userInfo.role);
    
                    if(PERMISSION){
                        startWatch(userInfo);
                    } else {
                        socket.emit("*",JSON.stringify({
                            type: "error",
                            message: "Unauthorized"
                        }));
                    }
                } else {
                    socket.emit("*",JSON.stringify({
                        type: "error",
                        message: "Unauthorized"
                    }));
                }
            });
    
            socket.emit("*",JSON.stringify({
                type: "credentials",
                version: "vv.-2.55.115.2",
                forceUpdate: [],
                // ["coket1","coket2","wilcon"]
                data: auth.getCredentials(dbName)
            }));
        }

        watch(streamList["dispatch_status"].watch());
        console.log("HELLO PING");
    }

    if(io){
        io.on('connection', function (socket) {
            var headers = socket.request.headers;
            var pathname = url.parse(headers.referer).pathname;
            console.log('Connected '+pathname);
    
            if (pathname.toLowerCase().indexOf('/coket1') > -1) {
                console.log("Hello there, CokeT1!");
                conn("coket1",socket);
            } else if (pathname.toLowerCase().indexOf('/coket2') > -1) {
                console.log("Hello there, CokeT2!");
                conn("coket2",socket);
            } else if (pathname.toLowerCase().indexOf('/wilcon') > -1) {
                console.log("Hello there, Wilcon!");
                conn("wilcon",socket);
            } else if (pathname.toLowerCase().indexOf('/fleet') > -1) {
                console.log("Hello there, Coke Fleet!");
                conn("fleet",socket);
            } else {
                // socket.destroy();
            }
        });
    } else {
        conn(_ping_);
    }
};

module.exports = {connect};