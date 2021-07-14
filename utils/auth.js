const _ERROR_ = require("./error");

// always make sure to put global variables outside the const exports.
// It will not update the value when it is inside.
var LIMIT = 200,
    ALL_PERMISSION_BY_ROLE = {
        user: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
        },
        dispatcher: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "self",
                update: "self",
                delete: "self"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "self",
                delete: "none"
            },
        },
        management: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "self",
                delete: "none"
            },
            users:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            trailers:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            regions:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            clusters:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            geofences:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            routes:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
        },
        administrator: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                // adminButton: "all"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none"
            },
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            trailers:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            regions:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            clusters:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            geofences:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            routes:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
        },
        developer: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                // adminButton: "all"
            },
            dispatch_deleted:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                // adminButton: "all"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "all",
                delete: "all"
            },
            events_sn: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                editPermission: "all"
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            trailers:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            regions:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            clusters:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            geofences:{
                read: "all",
                create: "none",
                update: "all",
                delete: "all",
            },
            routes:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            all_events: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            changelog:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            // help:{
            //     read: "all",
            //     create: "all",
            //     update: "all",
            //     delete: "self",
            // },
        },

        // Wilcon
        user_wilcon: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
        },
        dispatcher_wilcon: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "self",
                update: "self",
                delete: "self"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "self",
                delete: "none"
            },
        },
        management_wilcon: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            users:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            vehicle_personnel:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            chassis:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            regions:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            clusters:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            geofences:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            routes:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
        },
        administrator_wilcon: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all"
            },
            shift_schedule: {
                read: "all",
                create: "all",
                update: "none",
                delete: "all"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none"
            },
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            vehicle_personnel:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            chassis:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            regions:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            clusters:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            geofences:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            routes:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
        },
        developer_wilcon: {
            dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            de_dashboard:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            dispatch:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all"
            },
            shift_schedule: {
                read: "all",
                create: "all",
                update: "none",
                delete: "all"
            },
            dispatch_deleted:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                // adminButton: "all"
            },
            reports:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none"
            },
            notifications:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none"
            },
            events_sn: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                editPermission: "all"
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            vehicle_personnel:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            chassis:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            regions:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            clusters:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            geofences:{
                read: "all",
                create: "none",
                update: "all",
                delete: "all",
            },
            routes:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            all_events: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            changelog:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
        },
        // end Wilcon
        
        // Coke T2
        user_t2: {
            events_sn: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
        },
        developer_t2: {
            events_sn: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
                editPermission: "all"
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "all",
                delete: "none",
            },
            all_events: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            changelog:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
        },
        // end Coke T2
        
        // Coke Fleet
        user_fleet: {
            vehicles:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            fuel_refill: {
                read: "all",
                create: "all",
                update: "none",
                delete: "all"
            },
        },
        developer_fleet: {
            users:{
                read: "all",
                create: "all",
                update: "all",
                delete: "all",
            },
            vehicles:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
            fuel_refill: {
                read: "all",
                create: "all",
                update: "none",
                delete: "all"
            },
            all_events: {
                read: "all",
                create: "none",
                update: "none",
                delete: "all"
            },
            changelog:{
                read: "all",
                create: "none",
                update: "none",
                delete: "none",
            },
        }
        // end Coke Fleet
    },
    CLIENTS = {
        // Manually create Google Storage Bucket. It will not create automatically.
        // Add permission to 'allUsers' for public access. (Role: Storage Object Viewer)
        coket1: {
            id: "coket1",
            name: "CokeT1",
            dsName: "wd-coket1", // database & storage name = dsName
            appId: 9, //process.env.APP_ID_COKET1
            ggsURL: `coca-cola.server93.com`,
            type: 1,
            tabCloseAutoLogout: true,
            loadInBackground: ["VEHICLES","REGIONS","CLUSTERS","GEOFENCES","ROUTES","TRAILERS","USERS","VEHICLES_HISTORY","NOTIFICATIONS","SESSIONS"],
            allowRolesToViewAs: {
                developer: ["developer","administrator","management","dispatcher","user"],
            },
            custom: {
                dashboard: {
                    // calendarView: ["day"],
                    visibleStatus: ["in_transit","total_shipment","incomplete","assigned","queueingAtOrigin","processingAtOrigin","complete"]
                },
                dispatch: {
                    editableTrailer: true,
                    previousCheckIns: {
                        status: ["queueingAtOrigin","processingAtOrigin","idlingAtOrigin","in_transit"],
                        roles: ["administrator","developer"]
                    },
                    columns: {
                        list: ["_id","departureDate","region","cluster","origin","route","destination","etd","eta","targetTransitTime","targetCicoTime","vehicle","trailer","conductionNumber","palCap","comments","queueingDuration","processingDuration","idlingDuration","cicoTime","cicoTimeCapped","transitDuration","status","postedBy","postingDate","lateEntry","action"],
                        visible: ["_id","departureDate","origin","destination","vehicle","trailer","palCap","status","postedBy","postingDate","lateEntry","action"],
                        notExport: ["action"]
                    },
                    rowButtons: { 
                        buttons: ["statusUpdate","view","edit","delete"],
                    },
                    
                },
                vehicles: {
                    gSelect2: {
                        subtext: ["trailer","availability"],
                        subtextAdmin: ["conduction_number","trailer","availability"]
                    },
                    columns: ["name","trailer","equipmentNumber","conductionNumber","site","availability","last2Locations","action"],
                    columnOrder: [[ 4, "asc" ]],
                    modalFields: ["Trailer","Availability","desc",],
                    tableButtons: { 
                        buttons: ["refresh","filter","export"]
                    },
                },
                routes: {
                    originDestinationSeparator: ""
                },
                clusters: {
                    modalFields: ["cluster","region_id"],
                    columns: ["cluster","region","geofences","esq1_lq","esq1_oc","esq1_ot","esq2_lq","esq2_oc","esq2_ot","esq3_lq","esq3_oc","esq3_ot","action"],
                    rowButtons: { 
                        buttons: ["edit","delete"],
                    },
                },
                notifications: {
                    columns: ["shipmentNumber","delayType","escalation","timelapse","site","status","dateTime","sentTo","action"],
                },
                reports: {
                    desr: true,
                    ular: {
                        roles: ["administrator","developer"]
                    },
                    cicor: ["destination","origin","route","sn","plateNumber","trailer","palCap","haulerName","targetCico","actualTimelapse","remarks1","remarks2","truckBasePlant"],
                    otr: ["origin","destination","route","sn","plateNumber","trailer","palCap","haulerName","targetTransit","actualTimelapse","remarks1","remarks2","truckBasePlant"]
                },
                users: {
                    ignoreRolesWithString: ["t2","wilcon","fleet"]
                }
            },
        },
        wilcon: {
            id: "wilcon",
            name: "Wilcon",
            dsName: "wd-wilcon", // database & storage name = dsName
            appId: 427, //process.env.APP_ID_WILCON
            ggsURL: `wru.server93.com`,
            type: 1,
            loadInBackground: ["VEHICLES","REGIONS","CLUSTERS","GEOFENCES","ROUTES","TRAILERS","VEHICLE_PERSONNEL","SHIFT_SCHEDULE","USERS","VEHICLES_SECTION","VEHICLES_COMPANY","VEHICLE_PERSONNEL_SECTION","VEHICLE_PERSONNEL_COMPANY","VEHICLES_HISTORY","CHASSIS","CHASSIS_SECTION","CHASSIS_COMPANY","CHASSIS_TYPE","NOTIFICATIONS","SESSIONS"],
            allowRolesToViewAs: {
                developer: ["developer","administrator","management","dispatcher","user"],
                administrator: ["administrator","management","dispatcher","user"],
            },
            custom: {
                dashboard: {
                    // calendarView: ["day","month"],
                    visibleStatus: ["total_shipment","scheduled","assigned","processingAtOrigin","in_transit","onSite","returning","complete","incomplete"], // "scheduled",
                    filterType: "postingDate-scheduledDate"
                },
                dispatch: {
                    editableChassis: true,
                    autoGeneratedId: true,
                    roundtrip: true,
                    scheduled: true,
                    // statusWhenTruckEnteredOrigin: "processingAtOrigin", // SHOULD CHANGE WHEN IN PROCESSSING NA TALAGA
                    statusWhenTruckEnteredOrigin: "assigned",
                    rowButtons: { 
                        buttons: ["statusUpdate","view","edit","delete"],
                        condition: [
                            { roles: ["administrator","developer"], removeButtons: ["statusUpdate"], not: true }
                        ] 
                    },
                    filterType: "postingDate-scheduledDate",
                    columns: {
                        list: ["_id","ticketNumber","departureDate","_departureDate_","_departureTime_","region","cluster","origin","route","destination","etd","eta","targetTransitTime","targetCicoTime","vehicle","chassis","plateNumber","truckNumber","driver","checker","helper","comments","processingDuration","cicoTime","cicoTimeCapped","transitDuration","status","scheduledDate","shiftSchedule","postedBy","postingDate","lateEntry","action"],
                        visible: ["_id","departureDate","origin","destination","vehicle","driver","checker","status","postedBy","lateEntry","action"],
                        hiddenInCustomVisibilityOptions: ["_departureDate_","_departureTime_","plateNumber","truckNumber"],
                        notExport: ["departureDate","vehicle","action"]
                    }
                },
                vehicles: {
                    gSelect2: {
                        subtext: ["plate_number","truck_number"],
                        subtextAdmin: ["plate_number","truck_number"],
                    },
                    tableButtons: { 
                        buttons: ["refresh","filter","export"], 
                        condition: [
                            { roles: ["administrator","developer"], additionalButton: ["data_maintenance"] }
                        ] 
                    },
                    columns: ["name","plateNumber","truckNumber","section_id","company_id","last2Locations","action"],
                    columnOrder: [[ 0, "asc" ]],
                    modalFields: ["section_id","company_id"]
                },
                vehicle_personnel: {
                    tableButtons: { 
                        buttons: ["create","refresh","filter","export"], 
                        condition: [
                            { roles: ["administrator","developer"], additionalButton: ["data_maintenance"] }
                        ] 
                    },
                },
                chassis: {
                    tableButtons: { 
                        buttons: ["create","refresh","filter","export"], 
                        condition: [
                            { roles: ["administrator","developer"], additionalButton: ["data_maintenance"] }
                        ] 
                    },
                },
                routes: {
                    defaultOrigin: {
                        roles: ["dispatcher"],
                        id: "5f32e955690b4be5ebea1c37"
                    },
                    originDestinationSeparator: "-"
                },
                clusters: {
                    modalFields: ["cluster","region_id","sequence"],
                    columns: ["cluster","region","geofences","sequence","esq1_lq","esq1_oc","esq1_ot","esq2_lq","esq2_oc","esq2_ot","esq3_lq","esq3_oc","esq3_ot","action"],
                    rowButtons: { 
                        buttons: ["edit","delete"],
                    },
                },
                notifications: {
                    allowExportTable: true,
                    columns: ["shipmentNumber","departureDate","delayType","escalation","timelapse","site","status","dateTime","sentTo","action"],
                },
                reports: {
                    ser: true,
                    mtur: true,
                    ular: {
                        roles: ["administrator","developer"]
                    },
                    cicor: ["destination","origin","route","sn","plateNumber","targetCico","actualTimelapse","remarks1","remarks2","truckBasePlant"],
                    otr: ["origin","destination","route","sn","plateNumber","targetTransit","actualTimelapse","remarks1","remarks2","truckBasePlant"]
                },
                users: {
                    ignoreRolesWithString: ["t2","fleet"]
                }
            },
        },
        coket2: {
            id: "coket2",
            name: "CokeT2",
            dsName: "wd-coket2", // database & storage name = dsName
            appId: 9, //process.env.APP_ID_COKET1
            ggsURL: `coca-cola.server93.com`,
            allowDownloadFromOtherDB: "CokeT1",
            type: 2,
            tabCloseAutoLogout: true,
            loadInBackground: ["VEHICLES","USERS","SESSIONS"],
            custom: {
                vehicles: {
                    columns: ["name","trailer","equipmentNumber","site","availability"],
                    tableButtons: { 
                        buttons: ["refresh","filter","export"]
                    },
                },
                users: {
                    ignoreRolesWithString: ["wilcon","fleet"]
                }
            }
        },
        fleet: {
            id: "fleet",
            name: "Fleet",
            dsName: "wd-fleet", // database & storage name = dsName
            appId: 14, //process.env.APP_ID_COKET1
            ggsURL: `coca-cola.server93.com`,
            allowDownloadFromOtherDB: "CokeT1",
            type: 2,
            tabCloseAutoLogout: true,
            loadInBackground: ["VEHICLES","USERS","SESSIONS"],
            menuGroupOptions: [
                {
                    title: "Vehicles",
                    class: "m-0",
                    roles: ["user"]
                }
            ],
            custom: {
                vehicles: {
                    columns: ["name","cn1","cn2","fuelCapacity","truckModel"],
                    tableButtons: { 
                        buttons: ["refresh","filter","export"]
                    },
                },
                users: {
                    ignoreRolesWithString: ["wilcon","coket2"]
                }
            }
        },
    },
    CLIENT_OPTIONS = [
        {
            pathName: "coket2",
            tempKey: "_t2"
        },
        {
            pathName: "wilcon",
            tempKey: "_wilcon"
        },
        {
            pathName: "fleet",
            tempKey: "_fleet"
        }
    ];

const getCredentials = (pathName) => {
    const CLIENT = getClient(pathName);
    return {
        CLIENT,
        LIMIT
    }
};
const getPermission = (pathName,role) => {
    const CLIENT = getClient(pathName);
    role = role || "user";
    return (CLIENT) ? CLIENT.xPERMISSION_BY_ROLE[role] : null;
};
const getClient = (pathName) => {
    const CLIENT = CLIENTS[pathName];
    CLIENT.xPERMISSION_BY_ROLE = {};
    
    Object.keys(ALL_PERMISSION_BY_ROLE).forEach(key => {
        var _tempKey_;
        CLIENT_OPTIONS.forEach(val => {
            if(pathName == val.pathName && key.indexOf(val.tempKey) > -1){
                _tempKey_ = val.tempKey;
            }
        });
        if(_tempKey_){
            var temp_key = key.replace(_tempKey_,"");
            CLIENT.xPERMISSION_BY_ROLE[temp_key] = ALL_PERMISSION_BY_ROLE[key];
        } else {
            CLIENT.xPERMISSION_BY_ROLE[key] = ALL_PERMISSION_BY_ROLE[key];
        }
    });
    return CLIENT;
};

module.exports = {getCredentials,getPermission,getClient};