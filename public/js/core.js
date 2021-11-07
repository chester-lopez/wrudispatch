/************** GLOBAL VARIABLES **************/
var ENVIRONMENT = $(`#ENVIRONMENT`).text() || "development";
var s = $(`#PAGE`).text() || "main";

const authorizationLevel  = {
    dispatcher: () => { return ["dispatcher"].includes(USER.role); },
    administrator: () => { return ["administrator","developer"].includes(USER.role); },
};
const CUSTOM = {
    COLUMN:{
        settings: [
            { data: "Device Info", title: "Device Info", visible: true },
            { data: "Last Accessed", title: "Last Accessed", visible: true },
            { data: "Expiry", title: "Expiry", visible: true },
            { data: "Location", title: "Location", visible: true },
            { data: "Action", title: "Action", className: "notExport", width: "40px", orderable: false, searchable: false, visible: true },
        ],
        dashboard: function(){
            var totalShipmentTooltipTitle = (clientCustom.roundtrip) ? "The total count of shipments, In Transit, Incomplete, Scheduled, Assigned, On-Site, Returning & Complete of Plant/DC." : "The total count of shipments, In Transit, Incomplete, Assigned, Queueing, Processing & Complete of Plant/DC.",
                tooltipTitles = {
                    "In Transit": "All units on the road bound to Plant/DC in the first column of the same row.",
                    "Total Shipment" : totalShipmentTooltipTitle,
                    "Incomplete" : "The premature shipments. Premature for the reason of having incomplete details at the DE. (e.g. can’t find the tractor-trailer match)",
                    "Scheduled" : "The total number of scheduled shipments.",
                    "Assigned" : "The total number of assigned shipments.",
                    "Queueing" : "The total number of units inside the queueing area.",
                    "Processing" : "The total number of units that is on-going loading inside the processing area.",
                    "On-Site" : "The total number of units that arrived at shipment's destination.",
                    "Returning" : "The total number of units that is returning to the origin.",
                    "Complete" : "The total number of shipments already checked out and will eventually tagged as “In Transit”.",
                    // "" : "",
                };
            function getTooltip(key){
                return `<i class="la la-info" data-toggle="tooltip" title="${tooltipTitles[key]}" style="color:#5b5b5b;position: absolute;top: 0px;right: 0px;padding:1px 8px 5px 5px;"></i>`;
            }
            var columns = [
                { data: "Region", className: "notExport", visible: false},
                { data: "Plant", title: `Plant/DC`},
            ];

            (clientCustom.visibleStatus||[]).forEach(val => {
                switch (val) {
                    case "in_transit":
                        columns.push({ data: "In Transit", title: `In Transit ${getTooltip("In Transit")}`, className: "clickable"});
                        break;
                    case "total_shipment":
                        columns.push({ data: "Total Shipment", title: `Total Shipment ${getTooltip("Total Shipment")}`, className: "clickable"});
                        break;
                    case "incomplete":
                        columns.push({ data: "Incomplete", title: `Incomplete ${getTooltip("Incomplete")}`, className: "clickable"});
                        break; 
                    case "scheduled":
                        columns.push({ data: "Scheduled", title: `Scheduled ${getTooltip("Scheduled")}`, className: "clickable"});
                        break;
                    case "assigned":
                        columns.push({ data: "Assigned", title: `Assigned ${getTooltip("Assigned")}`, className: "clickable"});
                        break;
                    case "queueingAtOrigin":
                        columns.push({ data: "Queueing", title: `Queueing ${getTooltip("Queueing")}`, className: "clickable"});
                        break;
                    case "processingAtOrigin":
                        columns.push({ data: "Processing", title: `Processing ${getTooltip("Processing")}`, className: "clickable"});
                        break;
                    case "onSite":
                        columns.push({ data: "On-Site", title: `On-Site ${getTooltip("On-Site")}`, className: "clickable"});
                        break;
                    case "returning":
                        columns.push({ data: "Returning", title: `Returning ${getTooltip("Returning")}`, className: "clickable"});
                        break;
                    case "complete":
                        columns.push({ data: "Complete", title: `Complete ${getTooltip("Complete")}`, className: "clickable"});
                        break;
                    default:
                        break;
                }
            });
            return columns;
        },
        de_dashboard: [
            { data: "Region ID", title: "Region ID", visible: false },
            { data: "Delay Type", title: "Delay Type", visible: false },
            { data: "SN", title: "SN", visible: false },
            { data: "Plate No", title: "Plate No.", visible: true },
            { data: "Destination", title: "Destination", visible: true },
            { data: "Duration", title: "Duration", visible: true },
            { data: "Escalation", title: "Escalation", visible: true },
            { data: "Base Plant", title: "Base Plant", visible: true },
        ],
        dispatch: function(){
            var arr = [];
            var column = clientCustom.columns.dispatch;
            if(column){
                function objectOptions(val,obj){
                    obj.visible = (column.visible||[]).includes(val);
                    obj.hiddenInCustomVisibilityOptions = (column.hiddenInCustomVisibilityOptions||[]).includes(val);
                    ((column.notExport||[]).includes(val)) ? obj.className = "notExport" : null;
                    return obj;
                }
                column.list.forEach(val => {
                    switch (val) {
                        case "_id":
                            arr.push(objectOptions(val,{ data: "_id", title: "Shipment Number", visible: true }));
                            break;
                        case "ticketNumber":
                            arr.push(objectOptions(val,{ data: "Ticket Number", title: "Ticket Number", visible: true }));
                            break;
                        case "departureDate":
                            arr.push(objectOptions(val,{ data: "Departure Date", title: "Departure Date", type:"date", visible: true }));
                            break;
                        case "dispatchDateTime":
                            arr.push(objectOptions(val,{ data: "Departure Date", title: "Dispatch Date and Time", type:"date", visible: true }));
                            break;
                        case "_departureDate_":
                            arr.push(objectOptions(val,{ data: "Departure__Date", title: "Departure Date", visible: true }));
                            break;
                        case "_departureTime_":
                            arr.push(objectOptions(val,{ data: "Departure__Time", title: "Departure Time", visible: true }));
                            break;
                        case "region":
                            arr.push(objectOptions(val,{ data: "Region", title: "Region", visible: true }));
                            break;
                        case "cluster":
                            arr.push(objectOptions(val,{ data: "Cluster", title: "Cluster", visible: true }));
                            break;
                        case "origin":
                            arr.push(objectOptions(val,{ data: "Origin", title: "Origin", visible: true }));
                            break;
                        case "originSiteCode":
                            arr.push(objectOptions(val,{ data: "Origin Site Code", title: "Origin Site Code", visible: true }));
                            break;
                        case "origin_id":
                            arr.push(objectOptions(val,{ data: "Origin", title: "Origin", visible: true }));
                            break;
                        case "customers":
                            arr.push(objectOptions(val,{ data: "Customers", title: "Customer(s)", visible: true }));
                            break;
                        case "route":
                            arr.push(objectOptions(val,{ data: "Route", title: "Route", visible: true }));
                            break;
                        case "destination":
                            arr.push(objectOptions(val,{ data: "Destination", title: "Destination", visible: true }));
                            break;
                        case "etd":
                            arr.push(objectOptions(val,{ data: "ETD", title: "ETD", type:"date", visible: true }));
                            break;
                        case "eta":
                            arr.push(objectOptions(val,{ data: "ETA", title: "ETA", type:"date", visible: true }));
                            break;
                        case "targetTransitTime":
                            arr.push(objectOptions(val,{ data: "Target Transit Time", title: "Target Transit Time", visible: true }));
                            break;
                        case "targetCicoTime":
                            arr.push(objectOptions(val,{ data: "Target CICO Time", title: "Target CICO Time", visible: true }));
                            break;
                        case "vehicle":
                            arr.push(objectOptions(val,{ data: "Vehicle", title: "Vehicle", visible: true }));
                            break;
                        case "truckName":
                            arr.push(objectOptions(val,{ data: "Vehicle", title: "Truck Plate Number", visible: true }));
                            break;
                        case "truckBase":
                            arr.push(objectOptions(val,{ data: "Truck Base", title: "Truck Base", visible: true }));
                            break;
                        case "truckBaseRegion":
                            arr.push(objectOptions(val,{ data: "Truck Base Region", title: "Truck Base Region", visible: true }));
                            break;
                        case "truckBaseCluster":
                            arr.push(objectOptions(val,{ data: "Truck Base Cluster", title: "Truck Base Cluster", visible: true }));
                            break;
                        case "chassis":
                            arr.push(objectOptions(val,{ data: "Chassis", title: "Chassis", visible: false }));
                            break;
                        case "trailer":
                            arr.push(objectOptions(val,{ data: "Trailer", title: "Trailer", visible: true }));
                            break;
                        case "conductionNumber":
                            arr.push(objectOptions(val,{ data: "Conduction Number", title: "Conduction #", visible: true }));
                            break;
                        case "palCap":
                            arr.push(objectOptions(val,{ data: "Pal Cap", title: "Pal Cap", visible: true }));
                            break;
                        case "truckPalCap":
                            arr.push(objectOptions(val,{ data: "Pal Cap", title: "Truck Pallet Capacity", visible: true }));
                            break;
                        case "plateNumber":
                            arr.push(objectOptions(val,{ data: "Plate Number", title: "Plate Number", visible: true }));
                            break;
                        case "truckNumber":
                            arr.push(objectOptions(val,{ data: "Truck Number", title: "Truck Number", visible: true }));
                            break;
                        case "driver":
                            arr.push(objectOptions(val,{ data: "Driver", title: "Driver", visible: true }));
                            break;
                        case "checker":
                            arr.push(objectOptions(val,{ data: "Checker", title: "Checker", visible: true }));
                            break;
                        case "helper":
                            arr.push(objectOptions(val,{ data: "Helper", title: "Helper", visible: true }));
                            break;
                        case "supportUnit":
                            arr.push(objectOptions(val,{ data: "Support Unit", title: "Support Truck", visible: false }));
                            break;
                        case "shipmentType":
                            arr.push(objectOptions(val,{ data: "Shipment Type", title: "Shipment Type", visible: false }));
                            break;
                        case "deliverySequence":
                            arr.push(objectOptions(val,{ data: "Delivery Sequence", title: "Delivery Sequence", visible: false }));
                            break;
                        case "mdsdUsage":
                            arr.push(objectOptions(val,{ data: "MDSD Usage", title: "MDSD Usage", visible: false }));
                            break;
                        case "comments":
                            arr.push(objectOptions(val,{ data: "Comments", title: "Comments", visible: true }));
                            break;
                        case "queueingDuration":
                            arr.push(objectOptions(val,{ data: "Queueing Duration", title: "Queueing Duration", visible: true }));
                            break;
                        case "processingDuration":
                            arr.push(objectOptions(val,{ data: "Processing Duration", title: "Processing Duration", visible: true }));
                            break;
                        case "idlingDuration":
                            arr.push(objectOptions(val,{ data: "Idling Duration", title: "Idling Duration", visible: true }));
                            break;
                        case "cicoTime2":
                            arr.push(objectOptions(val,{ data: "CICO Time2", title: "CICO", visible: true }));
                            break;
                        case "cicoTime":
                            arr.push(objectOptions(val,{ data: "CICO Time", title: "CICO Time", visible: true }));
                            break;
                        case "cicoTimeCapped":
                            arr.push(objectOptions(val,{ data: "CICO Time (Capped)", title: "CICO Time (Capped)", visible: true }));
                            break;
                        case "transitDuration":
                            arr.push(objectOptions(val,{ data: "Transit Duration", title: "Transit Duration", visible: true }));
                            break;
                        case "deliveryDuration":
                            arr.push(objectOptions(val,{ data: "Delivery Duration", title: "Delivery Duration", visible: true }));
                            break;
                        case "status":
                            arr.push(objectOptions(val,{ data: "Status", title: "Status", visible: true }));
                            break;
                        case "scheduledDate":
                            arr.push(objectOptions(val,{ data: "Scheduled Date", title: "Scheduled Date", type:"date", visible: true }));
                            break;
                        case "shiftSchedule":
                            arr.push(objectOptions(val,{ data: "Shift Schedule", title: "Shift Schedule", visible: true }));
                            break;
                        case "postedBy":
                            arr.push(objectOptions(val,{ data: "Posted By", title: "Posted By", visible: true }));
                            break;
                        case "postingDate":
                            arr.push(objectOptions(val,{ data: "Posting Date", title: "Posting Date", type:"date", visible: true }));
                            break;
                        case "postingDateTime":
                            arr.push(objectOptions(val,{ data: "Posting Date", title: "Posting Date and Time", type:"date", visible: true }));
                            break;
                        case "lateEntry":
                            arr.push(objectOptions(val,{ data: "Late Entry", title: "Late Entry", visible: true }));
                            break;
                        case "action":
                            arr.push(objectOptions(val,{ data: "Action", title: "Action", orderable: false, searchable: false, visible: true }));
                            break;
                        default:
                            break;
                    }
                });
            }
            
            return arr;
        },
        dispatch_deleted: [
            { data: "_id", title: "Shipment Number", visible: true },
            { data: "Departure Date", title: "Departure Date", type:"date", visible: false },
            { data: "Region", title: "Region", visible: false },
            { data: "Cluster", title: "Cluster", visible: false },
            { data: "Origin", title: "Origin", visible: true },
            { data: "Route", title: "Route", visible: false },
            { data: "Destination", title: "Destination", visible: true },
            { data: "ETD", title: "ETD", visible: false, type:"date", visible: true },
            { data: "ETA", title: "ETA", visible: false, type:"date", visible: true },
            { data: "Target Transit Time", title: "Target Transit Time", visible: false },
            { data: "Target CICO Time", title: "Target CICO Time", visible: false },
            { data: "Vehicle", title: "Vehicle", visible: true },
            { data: "Trailer", title: "Trailer", visible: false },
            { data: "Conduction Number", title: "Conduction #", visible: false },
            { data: "Pal Cap", title: "Pal Cap", visible: false },
            { data: "Comments", title: "Comments", visible: false },
            { data: "Queueing Duration", title: "Queueing Duration", visible: false },
            { data: "Processing Duration", title: "Processing Duration", visible: false },
            { data: "Idling Duration", title: "Idling Duration", visible: false },
            { data: "CICO Time", title: "CICO Time", visible: false },
            { data: "CICO Time (Capped)", title: "CICO Time (Capped)", visible: false },
            { data: "Transit Duration", title: "Transit Duration", visible: false },
            { data: "Status", title: "Status Before Deleted", visible: true },
            { data: "Posted By", title: "Posted By", visible: true },
            { data: "Posting Date", title: "Posting Date", type:"date", visible: true },
            { data: "Late Entry", title: "Late Entry", visible: false },
            { data: "Deleted By", title: "Deleted By", visible: true },
            { data: "Deleted Date", title: "Deleted Date", type:"date", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        dispatch_mod2_deleted: [
            { data: "_id", title: "Shipment Number", visible: true },
            { data: "Ticket Number", title: "Ticket Number", type:"date", visible: true },
            { data: "Departure Date", title: "Departure Date", className: "notExport", type:"date", visible: true },
            { data: "Departure__Date", title: "Departure Date", visible: false, hiddenInCustomVisibilityOptions: true},
            { data: "Departure__Time", title: "Departure Time", visible: false, hiddenInCustomVisibilityOptions: true},
            { data: "Region", title: "Region", visible: false },
            { data: "Cluster", title: "Cluster", visible: false },
            { data: "Origin", title: "Origin", visible: true },
            { data: "Route", title: "Route", visible: false },
            { data: "Destination", title: "Destination", visible: true },
            { data: "ETD", title: "ETD", visible: false, type:"date", visible: true },
            { data: "ETA", title: "ETA", visible: false, type:"date", visible: true },
            { data: "Target Transit Time", title: "Target Transit Time", visible: false },
            { data: "Target CICO Time", title: "Target CICO Time", visible: false },
            { data: "Vehicle", title: "Vehicle", className: "notExport", visible: true },
            { data: "Plate Number", title: "Plate Number", visible: false, hiddenInCustomVisibilityOptions: true},
            { data: "Truck Number", title: "Truck Number", visible: false, hiddenInCustomVisibilityOptions: true},
            { data: "Driver", title: "Driver", visible: false },
            { data: "Checker", title: "Checker", visible: false },
            { data: "Helper", title: "Helper", visible: false },
            { data: "Comments", title: "Comments", visible: false },
            { data: "Queueing Duration", title: "Queueing Duration", visible: false },
            { data: "Processing Duration", title: "Processing Duration", visible: false },
            { data: "CICO Time", title: "CICO Time", visible: false },
            { data: "CICO Time (Capped)", title: "CICO Time (Capped)", visible: false },
            { data: "Transit Duration", title: "Transit Duration", visible: false },
            { data: "Status", title: "Status Before Deleted", visible: true },
            { data: "Scheduled Date", title: "Scheduled Date", type:"date", visible: false },
            { data: "Shift Schedule", title: "Shift Schedule", visible: false },
            { data: "Posted By", title: "Posted By", visible: true },
            { data: "Posting Date", title: "Posting Date", type:"date", visible: true },
            { data: "Late Entry", title: "Late Entry", visible: false },
            { data: "Deleted By", title: "Deleted By", visible: true },
            { data: "Deleted Date", title: "Deleted Date", type:"date", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        shift_schedule: [
            { data: "_id", title: "Schedule", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        regions: [
            { data: "Region Name", title: "Region Name", visible: true },
            { data: "Region Code", title: "Region Code", visible: true },
            { data: "Sequence", title: "Sequence", width: "50px", visible: true },
            { data: "esq1_lq", title: "Person In-Charge (E-1 Long Queueing)", visible: false },
            { data: "esq1_oc", title: "Person In-Charge (E-1 Over CICO)", visible: false },
            { data: "esq1_ot", title: "Person In-Charge (E-1 Over Transit)", visible: false },
            { data: "esq2_lq", title: "Person In-Charge (E-2 Long Queueing)", visible: false },
            { data: "esq2_oc", title: "Person In-Charge (E-2 Over CICO)", visible: false },
            { data: "esq2_ot", title: "Person In-Charge (E-2 Over Transit)", visible: false },
            { data: "esq3_lq", title: "Person In-Charge (E-3 Long Queueing)", visible: false },
            { data: "esq3_oc", title: "Person In-Charge (E-3 Over CICO)", visible: false },
            { data: "esq3_ot", title: "Person In-Charge (E-3 Over Transit)", visible: false },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        clusters: function(){
            var arr = [];

            clientCustom.columns.clusters.forEach(val => {
                switch (val) {
                    case "cluster":
                        arr.push({ data: "Cluster", title: "Cluster", visible: true });
                        break;
                    case "region":
                        arr.push({ data: "Region", title: "Region", visible: true });
                        break;
                    case "geofences":
                        arr.push({ data: "Geofences", title: "Sites", visible: true });
                        break;
                    case "sequence":
                        arr.push({ data: "Sequence", title: "Sequence", width: "50px", visible: true });
                        break;
                    case "esq1_lq":
                        arr.push({ data: "esq1_lq", title: "Person In-Charge (E-1 Long Queueing)", visible: false });
                        break;
                    case "esq1_oc":
                        arr.push({ data: "esq1_oc", title: "Person In-Charge (E-1 Over CICO)", visible: false });
                        break;
                    case "esq1_ot":
                        arr.push({ data: "esq1_ot", title: "Person In-Charge (E-1 Over Transit)", visible: false });
                        break;
                    case "esq2_lq":
                        arr.push({ data: "esq2_lq", title: "Person In-Charge (E-2 Long Queueing)", visible: false });
                        break;
                    case "esq2_oc":
                        arr.push({ data: "esq2_oc", title: "Person In-Charge (E-2 Over CICO)", visible: false });
                        break;
                    case "esq2_ot":
                        arr.push({ data: "esq2_ot", title: "Person In-Charge (E-2 Over Transit)", visible: false });
                        break;
                    case "esq3_lq":
                        arr.push({ data: "esq3_lq", title: "Person In-Charge (E-3 Long Queueing)", visible: false });
                        break;
                    case "esq3_oc":
                        arr.push({ data: "esq3_oc", title: "Person In-Charge (E-3 Over CICO)", visible: false });
                        break;
                    case "esq3_ot":
                        arr.push({ data: "esq3_ot", title: "Person In-Charge (E-3 Over Transit)", visible: false });
                        break;
                    case "action":
                        arr.push({ data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true });
                        break;
                    default:
                        break;
                }
            });

            return arr;
        },
        geofences: function(){
            var arr = [];
            const cicoTitle = (CLIENT.id == "coket2") ? "RCICO Target" : "CICO (HH:MM)";

            clientCustom.columns.geofences.forEach(val => {
                switch (val) {
                    case "siteCode":
                        arr.push({ data: "Site Code", title: "Site Code", visible: true });
                        break;
                    case "siteName":
                        arr.push({ data: "Site Name", title: "Site Name", visible: true });
                        break;
                    case "shortName":
                        arr.push({ data: "Short Name", title: "Short Name", visible: true });
                        break;
                    case "cico":
                        arr.push({ data: "CICO", title: cicoTitle, visible: true });
                        break;
                    case "trippageTarget":
                        arr.push({ data: "Trippage Target", title: "Trippage Target", visible: true });
                        break;
                    case "cluster":
                        arr.push({ data: "Cluster", title: "Cluster", visible: true });
                        break;
                    case "region":
                        arr.push({ data: "Region", title: "Region", visible: true });
                        break;
                    case "dispatcher":
                        arr.push({ data: "Dispatcher", title: "Dispatcher", visible: true });
                        break;
                    case "esq1_lq":
                        arr.push({ data: "esq1_lq", title: "Person In-Charge (E-1 Long Queueing)", visible: false });
                        break;
                    case "esq1_oc":
                        arr.push({ data: "esq1_oc", title: "Person In-Charge (E-1 Over CICO)", visible: false });
                        break;
                    case "esq1_ot":
                        arr.push({ data: "esq1_ot", title: "Person In-Charge (E-1 Over Transit)", visible: false });
                        break;
                    case "esq2_lq":
                        arr.push({ data: "esq2_lq", title: "Person In-Charge (E-2 Long Queueing)", visible: false });
                        break;
                    case "esq2_oc":
                        arr.push({ data: "esq2_oc", title: "Person In-Charge (E-2 Over CICO)", visible: false });
                        break;
                    case "esq2_ot":
                        arr.push({ data: "esq2_ot", title: "Person In-Charge (E-2 Over Transit)", visible: false });
                        break;
                    case "esq3_lq":
                        arr.push({ data: "esq3_lq", title: "Person In-Charge (E-3 Long Queueing)", visible: false });
                        break;
                    case "esq3_oc":
                        arr.push({ data: "esq3_oc", title: "Person In-Charge (E-3 Over CICO)", visible: false });
                        break;
                    case "esq3_ot":
                        arr.push({ data: "esq3_ot", title: "Person In-Charge (E-3 Over Transit)", visible: false });
                        break;
                    case "action":
                        arr.push({ data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true });
                        break;
                    default:
                        break;
                }
            });

            return arr;
        },
        routes: [
            { data: "_id", title: "Route", visible: true },
            { data: "Origin", title: "Origin", visible: true },
            { data: "Destination", title: "Destination", visible: true },
            { data: "Transit Time", title: "Transit Time", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        notifications: function(){
            var arr = [];
            clientCustom.columns.notifications.forEach(val => {
                switch (val) {
                    case "shipmentNumber":
                        arr.push({ data: "Shipment No", title: "Shipment Number", visible: true });
                        break;
                    case "departureDate":
                        arr.push({ data: "Departure Date", title: "Departure Date", visible: true });
                        break;
                    case "delayType":
                        arr.push({ data: "Delay Type", title: "Delay Type", visible: true });
                        break;
                    case "escalation":
                        arr.push({ data: "Escalation", title: "Escalation", visible: true });
                        break;
                    case "timelapse":
                        arr.push({ data: "Timelapse", title: "Timelapse", visible: true });
                        break;
                    case "site":
                        arr.push({ data: "Site", title: "Site", visible: true });
                        break;
                    case "status":
                        arr.push({ data: "Status", title: "Status", visible: true });
                        break;
                    case "dateTime":
                        arr.push({ data: "DateTime", title: "Date & Time", type:"date", visible: true });
                        break;
                    case "sentTo":
                        arr.push({ data: "Sent to", title: "Sent to", visible: true });
                        break;
                    case "action":
                        arr.push({ data: "Action", title: "Action", orderable: false, searchable: false, visible: true });
                        break;
                    default:
                        break;
                }
            });
            
            return arr;
        },
        event_viewer: function(){
            return [
                        { data: "Date", title: "Date", type:"date", visible: true },
                        { data: "Shipment Numbers", title: "Shipment Numbers", visible: ((CLIENT.allowDownloadFromOtherDB)?false:true)},
                        { data: "Rule Name", title: "Rule Name", visible: true },
                        { data: "Vehicle Name", title: "Vehicle Name", visible: true },
                        { data: "Geofence Name", title: "Geofence Name", visible: true },
                        { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
                    ];
        },
        all_events: [
            { data: "Date", title: "Date", type:"date", visible: true },
            { data: "Rule Name", title: "Rule Name", visible: true },
            { data: "Vehicle Name", title: "Vehicle Name", visible: true },
            { data: "Geofence Name", title: "Geofence Name", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        users: function(){
            return [
                { data: "Name", title: "Name", visible: true },
                { data: "_id", title: "Username", visible: true },
                // { data: "Title", title: "Title", visible: true },
                { data: "Email", title: "Email", visible: true },
                { data: "Phone Number", title: "Phone Number", visible: true },
                { data: "Role", title: "Role", visible: true },
                { data: "Exempted", title: "Exempted From Auto-Logout", width: "70px", visible: (CLIENT.tabCloseAutoLogout||false) },
                { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
            ];
        },
        vehicles: function(){
            var arr = [];

            clientCustom.columns.vehicles.forEach(val => {
                switch (val) {
                    case "name":
                        arr.push({ data: "Name", title: "Name", visible: true });
                        break;
                    case "trailer":
                        arr.push({ data: "Trailer", title: "Trailer", visible: true });
                        break;
                    case "equipmentNumber":
                        arr.push({ data: "Equipment Number", title: "Equipment Number", visible: true });
                        break;
                    case "conductionNumber":
                        arr.push({ data: "Conduction Number", title: "Conduction Number", visible: true });
                        break;
                    case "plateNumber":
                        arr.push({ data: "Plate Number", title: "Plate Number", visible: true });
                        break;
                    case "truckNumber":
                        arr.push({ data: "Truck Number", title: "Truck Number", visible: true });
                        break;
                    case "truckType":
                        arr.push({ data: "Truck Type", title: "Truck Type", visible: true });
                        break;
                    case "site":
                        arr.push({ data: "Site", title: "Site", visible: true });
                        break;
                    case "truckBase":
                        arr.push({ data: "Site", title: "Truck Base", visible: true });
                        break;
                    case "section_id":
                        arr.push({ data: "Section", title: "Section", visible: true });
                        break;
                    case "company_id":
                        arr.push({ data: "Company", title: "Company", visible: true });
                        break;
                    case "cn1":
                        arr.push({ data: "CN1", title: "CN1", visible: true });
                        break;
                    case "cn2":
                        arr.push({ data: "CN2", title: "CN2", visible: true });
                        break;
                    case "fuelCapacity":
                        arr.push({ data: "Fuel Capacity", title: "Fuel Capacity", visible: true });
                        break;
                    case "truckModel":
                        arr.push({ data: "Truck Model", title: "Truck Model", visible: true });
                        break;
                    case "availability":
                        arr.push({ data: "Availability", title: "Availability", visible: true });
                        break;
                    case "last2Locations":
                        arr.push({ data: "Last 2 Locations", title: "Last 2 Locations", className: "notExport", visible: true });
                        break;
                    case "body_type":
                        arr.push({ data: "Body Type", title: "Body Type", visible: false });
                        break;
                    case "year_model":
                        arr.push({ data: "Year Model", title: "Year Model", visible: false });
                        break;
                    case "registration_month":
                        arr.push({ data: "Registration Month", title: "Registration Month", visible: false });
                        break;
                    case "registration_status":
                        arr.push({ data: "Registration Status", title: "Registration Status", visible: false });
                        break;
                    case "case_number":
                        arr.push({ data: "Case Number", title: "Case Number", visible: false });
                        break;
                    case "ltfrb_status":
                        arr.push({ data: "LTFRB Status", title: "LTFRB Status", visible: false });
                        break;
                    case "issued_date":
                        arr.push({ data: "Issued Date", title: "Issued Date", visible: false });
                        break;
                    case "expiry_date":
                        arr.push({ data: "Expiry Date", title: "Expiry Date", visible: false });
                        break;
                    case "action":
                        arr.push({ data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true });
                        break;
                    default:
                        break;
                }
            });

            return arr;
        },
        fuel_refill: [
            { data: "Summary", title: "Summary", visible: true },
            { data: "Converted", title: "Converted", width: "22%", visible: true },
            { data: "Failed to Import", title: "Failed to Import", width: "22%", visible: true },
            { data: "Error", title: "Error", width: "22%", visible: true },
            { data: "Upload Date", title: "Upload Date", type:"date", visible: true },
            { data: "Uploaded By", title: "Uploaded By", visible: false },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        vehicle_personnel: [
            { data: "Name", title: "Name", visible: true },
            { data: "Occupation", title: "Occupation", visible: true },
            { data: "Vehicle", title: "Vehicle", visible: true },
            { data: "Section", title: "Section", visible: true },
            { data: "Company", title: "Company", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        trailers: [
            { data: "_id", title: "Trailer", visible: true },
            { data: "Pal Cap", title: "Pal Cap", visible: true },
            { data: "Region", title: "Region", visible: true },
            { data: "Cluster", title: "Cluster", visible: true },
            { data: "Site", title: "Site", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        chassis: [
            { data: "_id", title: "Name", visible: true },
            { data: "Chassis Type", title: "Chassis Type", visible: true },
            { data: "Plate Number", title: "Plate Number", visible: true },
            { data: "Section", title: "Section", visible: true },
            { data: "Company", title: "Company", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
        customers: [
            { data: "_id", title: "Customer Number", visible: true },
            { data: "Customer Name", title: "Customer Name", visible: true },
            { data: "Service Model", title: "Service Model", visible: true },
            { data: "Territory", title: "Territory", visible: true },
            { data: "Region", title: "Region", visible: true },
            { data: "DC", title: "DC", visible: true },
            { data: "Mode of Transport", title: "Mode of Transport", visible: true },
            { data: "Type", title: "Type", visible: true },
            { data: "Action", title: "Action", className: "notExport", orderable: false, searchable: false, visible: true },
        ],
    },
    FORM: {
        dispatch: {
            coket1: function(){
                return [
                    {id:"#shipment_number",key:"_id",inputType:"val",readonly:true,regex:/^\d{8}$/},
                    {id:"shipment_type",key:"shipment_type",inputType:"val",required:true,dataType:"radiobutton"},
                    {id:"#route",key:"route",inputType:"val",readonly:true,required:true,trigger:"change",dataType:"select"},
                    {id:"#trailer",key:"trailer",inputType:"val",trigger:"change",required:true,dataType:"select"}, // should be before vehilce
                    {id:"#vehicle_id",key:"vehicle_id",inputType:"val",trigger:"change",required:true,dataType:"select",typeOf:"number"},
                    {id:"#comments",key:"comments",inputType:"val"},
                ];
            },
            coket2: function(){
                return [
                    {id:"#shipment_number",key:"_id",inputType:"val",readonly:true,regex:/^\d{8}$/},
                    {id:"#origin_id",key:"origin_id",inputType:"val",required:true,trigger:"change",dataType:"select"},
                    {id:"#customers",key:"customers",inputType:"val",required:true,trigger:"change",dataType:"select"},
                    {id:"#vehicle_id",key:"vehicle_id",inputType:"val",trigger:"change",required:true,dataType:"select",typeOf:"number"},
                    {id:"support_unit",key:"support_unit",inputType:"val",required:true,dataType:"radiobutton"},
                    {id:"shipment_type",key:"shipment_type",inputType:"val",required:true,dataType:"radiobutton"},
                    {id:"delivery_sequence",key:"delivery_sequence",inputType:"val",required:true,dataType:"radiobutton"},
                    {id:"mdsd_usage",key:"mdsd_usage",inputType:"val",required:true,dataType:"radiobutton"},
                    {id:"#comments",key:"comments",inputType:"val"},
                ];
            },
            wilcon: function(){
                return [
                    {id:"#ticket_number",key:"ticket_number",inputType:"val",required:true},
                    {id:"#scheduled_date",key:"scheduled_date",inputType:"val",required:true,dataType:"date"},
                    {id:"#shift_schedule",key:"shift_schedule",inputType:"val",trigger:"change",dataType:"select"},
                    {id:"#route",key:"route",inputType:"val",readonly:true,required:true,trigger:"change",dataType:"select"},
                    {id:"#trailer",key:"trailer",inputType:"val",trigger:"change",required:true,dataType:"select"}, // shohul be  before cehicle
                    {id:"#vehicle_id",key:"vehicle_id",inputType:"val",trigger:"change",required:true,dataType:"select",typeOf:"number"},
                    {id:"#chassis",key:"chassis",inputType:"val",trigger:"change",required:true,dataType:"select"},
                    {id:"#driver_id",key:"driver_id",inputType:"val",trigger:"change",required:true,dataType:"select"},
                    {id:"#checker_id",key:"checker_id",inputType:"val",trigger:"change",required:true,dataType:"select"},
                    {id:"#helper_id",key:"helper_id",inputType:"val",trigger:"change",required:true,dataType:"select"},
                    {id:"#comments",key:"comments",inputType:"val"},
                ];
            }
        },
    },
    IMPORT_TEMPLATE: {
        dispatch: {
            coket1: function(){
                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Shipment Number</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Origin</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Destination</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Truck Name</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Comments</th>
                            </tr>
                            <tr>
                                <td style="font-size:14px;border-color:#D9D9D9;">10000001</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">BBC EXT</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">CEW PL</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">DAE8439</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">Comment is optional.</td>
                            </tr>
                        </table>`;
            },
            wilcon: function(){
                var body = "";
                var lists = [];
    
                (LIST["shift_schedule"]||[]).forEach((val,i) => {
                    lists[i] = lists[i] || {};
                    lists[i].shift_schedule = val._id;
                });
                var tempVehicleList = [];
                (LIST["vehicles"]||[]).forEach((val,i) => {
                    var driver = (LIST["vehicle_personnel"]||[]).find(x => Number(x.vehicle_id) == Number(val._id) && x.occupation == "Driver") || {};
                    var checker = (LIST["vehicle_personnel"]||[]).find(x => Number(x.vehicle_id) == Number(val._id) && x.occupation == "Checker") || {};
                    var helper = (LIST["vehicle_personnel"]||[]).find(x => Number(x.vehicle_id) == Number(val._id) && x.occupation == "Helper") || {};
                    var vehicle_driver = driver.name;
                    var vehicle_checker = checker.name;
                    var vehicle_helper = helper.name;
    
                    if(vehicle_driver && vehicle_checker && vehicle_helper){} 
                    else if(vehicle_driver){
                        if(!vehicle_checker) vehicle_checker = "";
                        if(!vehicle_helper) vehicle_helper = "";
                    } else if(vehicle_checker){
                        if(!vehicle_driver) vehicle_driver = "";
                        if(!vehicle_helper) vehicle_helper = "";
                    } else if(vehicle_helper){
                        if(!vehicle_driver) vehicle_driver = "";
                        if(!vehicle_checker) vehicle_checker = "";
                    } else {
                        vehicle_driver = "ZZZZZZZZ";
                        vehicle_checker = "ZZZZZZZZ";
                        vehicle_helper = "ZZZZZZZZ";
                    }
                    tempVehicleList.push({
                        vehicle: val.name,
                        vehicle_driver,
                        vehicle_checker,
                        vehicle_helper,
                    })
                });
                var sortedBehicleList = SORT.ARRAY_OBJECT(tempVehicleList,"vehicle_driver",{sortType: "asc"});
                sortedBehicleList.forEach((val,i) => {
                    lists[i] = lists[i] || {};
                    lists[i].vehicle = val.vehicle;
                    lists[i].vehicle_driver = (val.vehicle_driver == "ZZZZZZZZ") ? "" : val.vehicle_driver;
                    lists[i].vehicle_checker = (val.vehicle_checker == "ZZZZZZZZ") ? "" : val.vehicle_checker;
                    lists[i].vehicle_helper = (val.vehicle_helper == "ZZZZZZZZ") ? "" : val.vehicle_helper;
                });
                var tempDriverList = (LIST["vehicle_personnel"]||[]).filter(x => x.occupation == "Driver");
                var driverList = SORT.ARRAY_OBJECT(tempDriverList,"name",{sortType: "asc"});
                driverList.forEach((val,i) => {
                    lists[i] = lists[i] || {};
                    lists[i].driver = val.name;
                });
                var tempCheckerList = (LIST["vehicle_personnel"]||[]).filter(x => x.occupation == "Checker");
                var checkerList = SORT.ARRAY_OBJECT(tempCheckerList,"name",{sortType: "asc"});
                checkerList.forEach((val,i) => {
                    lists[i] = lists[i] || {};
                    lists[i].checker = val.name;
                });
                var tempHelperList = (LIST["vehicle_personnel"]||[]).filter(x => x.occupation == "Helper");
                var helperList = SORT.ARRAY_OBJECT(tempHelperList,"name",{sortType: "asc"});
                helperList.forEach((val,i) => {
                    lists[i] = lists[i] || {};
                    lists[i].helper = val.name;
                });
                var routeList = SORT.ARRAY_OBJECT(LIST["routes"]||[],"_id",{sortType: "asc"});
                routeList.forEach((val,i) => {
                    lists[i] = lists[i] || {};
                    lists[i].route = val._id;
                });
                lists.forEach((val,i) => {
                    body += `<tr>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"ABC 123":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"MDC01-D03":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"WD NDI3452":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"Jane Doe":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"John Smith":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"James Clark":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"04/02/2021":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"4:00 AM - 5:00 AM":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${i==0?"Comment is optional.":""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;"></td>
                                <td style="font-size:14px;border-color:#D9D9D9;"></td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.shift_schedule||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.vehicle||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.vehicle_driver||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.vehicle_checker||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.vehicle_helper||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.driver||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.checker||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.helper||""}</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">${val.route||""}</td>
                            </tr>`;
                });
                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Ticket Number</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Route</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Truck Name</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Driver</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Checker</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Helper</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Scheduled Date</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Shift Schedule</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Comments</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;"></th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;"></th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Shift List</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Truck List</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Truck Driver</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Truck Checker</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Truck Helper</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Driver List</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Checker List</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Helper List</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Route List</th>
                            </tr>
                            ${body}
                        </table>`;
            },
        },
        fuel_refill: {
            fleet: function(){
                return `<table id="report-hidden" style="opacity:0;">
                            <tr>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Delivery Date</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Time</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Quantity</th>
                                <th style="font-size:14px;border-color:#D9D9D9;text-align:left;">Vehicle License Number</th>
                            </tr>
                            <tr>
                                <td style="font-size:14px;border-color:#D9D9D9;">19/06/2021</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">0:08:26</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">100</td>
                                <td style="font-size:14px;border-color:#D9D9D9;">JM0522</td>
                            </tr>
                        </table>`;
            }
        }
    }
};

var USER = null,
    SESSION_TOKEN = null,
    HASNOTIFICATION = false,
    SOCKET = null,
    CHANGESTREAMS = {},
    VERSION = null,
    ISMOBILE = false,
    LIMIT = 200,
    PAGE_FUNCTIONALITIES = null,
    PERMISSION = {},
    LIST = {},
    GRANTED_PAGES = [],
    MAX_TRIES = 5,
    PERMISSION_BY_ROLE = {},
    DE_NOTIF_COUNT = [],
    G_SELECT = {},
    G_SELECT2 = {},
    GGS = { STATUS: {} },
    DE_CHECKDUPS = null,
    INTERVALS = {},
    BASE_PLANTS = null,
    DEFAULT_DATE = null,
    CLIENT = null,
    exlStyle = "font-family:Arial;font-size:20px;",
    clientCustom = {};
/************** END GLOBAL VARIABLES **************/

const WEBSOCKET = {
    sendUserInfo: function(){
        return new Promise((resolve,reject) => {
            if(USER && USER.username){
                s = $(`#PAGE`).text() || "main";
                
                WEBSOCKET.resolve = resolve;
                SOCKET.emit("userInfo",{
                    username: USER.username,
                    role: USER.role,
                    session_token: USER.sessionToken,
                    ISMOBILE,
                    dbName: CLIENT.id
                });
            }
        });
    },
    connect: function(){
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            ISMOBILE = true;
        }
        
        return new Promise((resolve,reject) => {
            var socketServer = (ENVIRONMENT === "development") ? "ws" : "wss";

            function setClientCustom(){
                function setValue(str,defaultValue){
                    var value = null;
                    try {
                        var split = str.split(".");
                        var obj = CLIENT;
                        split.forEach(val => {
                            obj = obj[val];
                        });
                        value = obj;
                    } catch (error) { }
                    return value || defaultValue;
                };

                clientCustom.statusAllowedEditable = {};
                clientCustom.allowExportTable = {};
                clientCustom.requiredFields = {};
                clientCustom.calendarView = {};
                clientCustom.tableButtons = {};
                clientCustom.columnOrder = {};
                clientCustom.exportTable = {};
                clientCustom.modalFields = {};
                clientCustom.filterType = {};
                clientCustom.rowButtons = {};
                
                clientCustom.gSelect2 = {};
                clientCustom.columns = {};
                clientCustom.status = {};

                clientCustom.ignoreRolesWithString = setValue("custom.users.ignoreRolesWithString", []);
                clientCustom.visibleStatus = setValue("custom.dashboard.visibleStatus", []);
                clientCustom.defaultOrigin = setValue("custom.routes.defaultOrigin", {});
                clientCustom.reports = setValue("custom.reports", {});

                // filterType
                clientCustom.filterType.dashboard = setValue("custom.dashboard.filterType", "");
                clientCustom.filterType.dispatch = setValue("custom.dispatch.filterType", "");

                // exportTable
                clientCustom.exportTable.dashboard = setValue("custom.dashboard.exportTable", false);

                // columns
                clientCustom.columns.notifications = setValue("custom.notifications.columns", []);
                clientCustom.columns.vehicles = setValue("custom.vehicles.columns", []);
                clientCustom.columns.dispatch = setValue("custom.dispatch.columns", {});
                clientCustom.columns.clusters = setValue("custom.clusters.columns", []);
                clientCustom.columns.geofences = setValue("custom.geofences.columns", []);
                
                // calendarView
                clientCustom.calendarView.dashboard = setValue("custom.dashboard.calendarView", ["day"]);
                
                // gSelect2
                clientCustom.gSelect2.vehicles = setValue("custom.vehicles.gSelect2", {});
                
                // allowExportTable
                clientCustom.allowExportTable.notifications = setValue("custom.notifications.allowExportTable", false);
                
                // dispatch
                // clientCustom.statusWhenTruckEnteredOrigin = setValue("custom.dispatch.statusWhenTruckEnteredOrigin", "assigned");
                clientCustom.previousCheckIns = setValue("custom.dispatch.previousCheckIns", { status: [], roles: [] });
                clientCustom.originDestinationSeparator = setValue("custom.dispatch.originDestinationSeparator", "");
                clientCustom.editableTrailer = setValue("custom.dispatch.editableTrailer", false);
                clientCustom.editableChassis = setValue("custom.dispatch.editableChassis", false);
                clientCustom.autoGeneratedId = setValue("custom.dispatch.autoGeneratedId", false);
                clientCustom.roundtrip = setValue("custom.dispatch.autoGeneratedId", false);
                clientCustom.scheduled = setValue("custom.dispatch.scheduled", false);
                
                // modalFields
                clientCustom.modalFields.vehicles = setValue("custom.vehicles.modalFields", []);
                clientCustom.modalFields.clusters = setValue("custom.clusters.modalFields", []);
                clientCustom.modalFields.geofences = setValue("custom.geofences.modalFields", []);

                // columnOrder
                clientCustom.columnOrder.dispatch = setValue("custom.dispatch.columnOrder", [[ 0, "asc" ]]);
                clientCustom.columnOrder.vehicles = setValue("custom.vehicles.columnOrder", [[ 0, "asc" ]]);
                
                // tableButtons
                clientCustom.tableButtons.vehicle_personnel = setValue("custom.vehicle_personnel.tableButtons", { buttons: [] });
                clientCustom.tableButtons.vehicles = setValue("custom.vehicles.tableButtons", { buttons: [] });
                clientCustom.tableButtons.chassis = setValue("custom.chassis.tableButtons", { buttons: [] });
                clientCustom.tableButtons.users = setValue("custom.users.tableButtons", { buttons: [] });

                // rowButtons
                clientCustom.rowButtons.dispatch = setValue("custom.dispatch.rowButtons", { buttons: [] });
                clientCustom.rowButtons.clusters = setValue("custom.clusters.rowButtons", { buttons: [] });
                clientCustom.rowButtons.vehicles = setValue("custom.vehicles.rowButtons", { buttons: [] });

                // requiredFields
                clientCustom.requiredFields.dispatch = setValue("custom.dispatch.create.requiredFields", []);

                // status
                clientCustom.status.all = setValue("custom.dispatch.status.all", []);
                clientCustom.status.enrouteToDestination = setValue("custom.dispatch.status.enrouteToDestination", "in_transit");
            }

            SOCKET = io();

            SOCKET.on("*", function(event,data){
                event = JSON.parse(event);
                if(event.type == "credentials"){
                    if(CLIENT == null){
                        var data = event.data;
                        sessionStorage.setItem("version", event.version);
                        CLIENT = data.CLIENT;
                        setClientCustom();
                        PERMISSION_BY_ROLE = CLIENT.xPERMISSION_BY_ROLE;
                        (!CLIENT) ? location.reload() : resolve();
                    } else {
                        if(sessionStorage.getItem("version") != event.version){
                            sessionStorage.setItem("version", event.version);
                            if(event.forceUpdate.includes(CLIENT.id)){
                                $(`body`).append(views.new_version());
                            }
                        }
                        SESSION_FROM_DB(function(){
                            // do nothing
                        },function(){
                            LOGOUT();
                        });
                        console.log("credentials",event);
                    }
                    
                } else if(event.type == "error") {
                    event.message = event.message || "An error has occured.";
                    toastr.error(event.message,null,{ timeOut: 0, extendedTimeOut: 0 });
                } else if(event.type == "server_status") {
                    WEBSOCKET.resolve();
                } else {
                    if(CHANGESTREAMS[event.type]){
                        var data = event.data;
                        CHANGESTREAMS[event.type](data);
                    }
                }
            })
            SOCKET.once('credentials', function(data) {
                console.log("credentials",data);
                CLIENT = data.CLIENT;
                PERMISSION_BY_ROLE = CLIENT.xPERMISSION_BY_ROLE;
                (!CLIENT) ? location.reload() : resolve();
            });
            SOCKET.once('server_status', function(data) {
                WEBSOCKET.resolve();
            });
            SOCKET.on('error', function(data) {
                console.log(data);
                data.message = data.message || "An error has occured.";
                toastr.error(data.message,null,{ timeOut: 0, extendedTimeOut: 0 });
            });
            SOCKET.on('connect', function(data) {
                console.log("OPENED : ", SOCKET.connected);
            });
        });
    }
};

function SESSION_FROM_DB(existCallback,notExistCallback){
    if(sessionStorage.getItem("prev_session_token")){
        Cookies.set(`session_token`,sessionStorage.getItem("prev_session_token"),{expires: 30});
        sessionStorage.removeItem("prev_session_token");
    }
    
    SESSION_TOKEN = Cookies.get("session_token");

    try {
        GET.AJAX({
            url: `/api/verifyToken/${CLIENT.id}`,
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": SESSION_TOKEN
            },
            data: JSON.stringify({token: SESSION_TOKEN}),
        }, function(docs){
            console.log("Session:",docs);
            var session = docs[0];
            if(docs.error || !session){
                if (typeof notExistCallback === 'function') { notExistCallback(); }
            } else {
                var user = docs[0].userDetails;
                if(!user.name || !user.email){
                    $(`body`).append(modalViews.notice.emptyProfile());
                    $(`#empty_profile`).click(function(){
                        window.history.pushState({}, null, `/${CLIENT.name}#profile`);
                        PAGE.GO_TO();
                        $(this).parents("#overlay").remove();
                    });
                }
                if(CLIENT.tabCloseAutoLogout && !user.exemptAutoLogout) {
                    _SESSION_.window_tab_close(CLIENT.id,"THISISME",SESSION_TOKEN);
                }


                USER = new User(user);

                try {
                    if(USER.settings.push_notification == "desktop" && Notification.permission == "default") {
                        $(`body`).append(`<div class="cd-popup" id="confirm-modal">
                                            <div class="cd-popup-container">
                                                <p class="mb-0">Your settings are set to allow Desktop Notifications from this website. Please click '<b>Allow</b>' to receive push notifications when asked by the browser.</p>
                                                <ul class="cd-buttons">
                                                    <li style="width: 100%;">
                                                        <a style="background-color: #00a548;color: white;" confirm>OKAY</a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>`);
                        $(`#confirm-modal [confirm]`).click(function(){
                            $(`#confirm-modal`).remove();
                            Notification.requestPermission().then(function(result) {
                                console.log(result);
                                if(result == "granted"){} else {
                                    alert("Push notification request was denied. Please enable them in your browser if you've changed your mind.");
                                }
                            });
                        });
                    }
                } catch(error){}
                
                if(session.dispatcherDetails && authorizationLevel .dispatcher()){
                    USER.dc = session.dispatcherDetails._id;
                }
                
                PERMISSION = PERMISSION_BY_ROLE[USER.role] || {};

                session.notificationExists.forEach(val => {
                    if(val._id === false){
                        HASNOTIFICATION = true;
                    }
                });
                WEBSOCKET.sendUserInfo().then(() => {
                    if (typeof existCallback === 'function') { existCallback(); }
                });
            }
        });
    } catch (error) {
        $('#body-main').html(modalViews.notice.browserNotSupported());
        console.log("NOT SUUPORTTED")
    }
};
function LOGOUT(){
    $(`body`).append(`<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;background-color: #ffffffc2;z-index: 999999;">
                        <h3 style="text-align: center;margin-top: 40vh;font-weight: 100;">Logging out...</h3>
                      </div>`);

    if(SESSION_TOKEN && USER){
        $.ajax({ 
            url: `/api/sessions/${CLIENT.id}/${USER.username}/${SESSION_TOKEN}`, 
            method: "DELETE", 
            timeout: 90000, 
            headers: {
                "Authorization": SESSION_TOKEN
            },
            async: true
        }).done(function (docs) {
            Cookies.remove("tabs");
            Cookies.remove("GKEY");
            Cookies.remove("session_token");
            location.href = `../${CLIENT.name}/login`;
        }).fail(function(error){
            console.log("Error:",error);
        });
    } else {
        Cookies.remove("tabs");
        Cookies.remove("GKEY");
        Cookies.remove("session_token");
        location.href = `../${CLIENT.name}/login`;
    }
};