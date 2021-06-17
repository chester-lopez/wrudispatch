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
            // var pipeline = [];
            // if(ISMOBILE === true) {
            //     pipeline = [{
            //         $match: {
            //             $or:[{
            //                 "fullDocument.username" : userInfo.username
            //             }]
            //         }
            //     }]
            // }
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
};
/******** END STREAMLIST ********/

var changestreams = {};
var resumeTokens = {};
var wsClients = {};

const connect = function(io){ //io
    function conn(dbName,socket){
        var PERMISSION = {};
        var userInfo = {};

        wsClients[dbName] = wsClients[dbName] || [];
        wsClients[dbName].push(socket);
        
        function watch(x){
            x.options = x.options || {};
            if(db.getCollection(dbName,x.collection) && !changestreams[`${dbName}_${x.key}`]){
                function watch_collection(){
                    x.options.resumeAfter = resumeTokens[`${dbName}_${x.key}`] || null;
                    changestreams[`${dbName}_${x.key}`] = db.getCollection(dbName,x.collection).watch([],x.options);

                    changestreams[`${dbName}_${x.key}`].on('change', function(event){
                        resumeTokens[`${dbName}_${x.key}`] = event._id;

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
                if(!obj.type || (obj.type && obj.type == userInfo.type)){ // do not delete. Look at Maintenance
                    watch(obj.watch());
                }
            });
            // END LOOP STREAMLIST
            socket.emit("*",JSON.stringify({
                type: "server_status",
                status: 200
            }));
        };
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
            version: "vv.-2.52.107",
            forceUpdate: ["wilcon"],
            // ["coket1","coket2","wilcon"]
            data: auth.getCredentials(dbName)
        }));
    }

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
        } else {
            // socket.destroy();
        }
    });
};

module.exports = {connect};