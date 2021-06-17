var a = function(s,ENVIRONMENT){
    $("body").on('click', `#overlay #close`,function(e){
        $(this).parents("#overlay").remove();
    });
    
    var urlParams = new URLSearchParams(window.location.search),
        __data = CRYPTO.DECRYPT(urlParams.get('data')),
        _ids = __data._ids || [],
        username = __data.username || "",
        name = __data.name || "",
        clientId = __data.clientId || "",
        __escalation = Number(__data.escalation),
        filter = {};

    // console.log("__data",__data);

    /************** FUNCTIONS **************/
    function getDuration(status,obj){
        obj.events_captured = obj.events_captured || {};
        var events_captured = OBJECT.sortByKey(obj.events_captured);
        var duration = 0;
        var start,end;
        Object.keys(events_captured).forEach(key => {
            if(events_captured[key] == status){
                start = Number(key);
            } else {
                if(start && !end){
                    end = Number(key);
                    duration += end - start;
                    start = null;
                    end = null;
                }
            }
        });
        if(start && !end){
            duration = 0;
        }
        return duration;
    }
    function getDateTime(status,obj,type="first"){
        obj.events_captured = obj.events_captured || {};
        var events_captured = OBJECT.sortByKey(obj.events_captured);
        var datetime = 0;
        Object.keys(events_captured).forEach(key => {
            if(events_captured[key] == status){
                if(type == "first" && !datetime){
                    datetime = Number(key);
                }
                if(type == "last"){
                    datetime = Number(key);
                }
            }
            if(!status){
                if(type == "first" && !datetime){
                    datetime = Number(key);
                }
                if(type == "last"){
                    datetime = Number(key);
                }
            }
        });
        return datetime;
    }
    function getStatus(status=""){
        var color = "label-default";
        var stat = { color: "label-default", text: "" };
        if(status == "plan") stat = { color: "label-info", text: "Plan" }; // light blue
        if(status == "assigned") stat = { color: "label-brown", text: "Assigned" }; // brown
        if(status == "scheduled") stat = { color: "label-default", text: "Scheduled" }; // default
        if(status == "queueingAtOrigin") stat = { color: "label-warning", text: "Queueing (Origin)" }; // yellow
        if(status == "processingAtOrigin") stat = { color: "label-lime", text: "Processing (Origin)" }; // lime
        if(status == "idlingAtOrigin") stat = { color: "label-purple", text: "Idling (Origin)" }; // purple
        if(status == "in_transit") stat = { color: "label-orange", text: "In Transit" }; // orange
        if(status == "onSite") stat = { color: "label-blue", text: "On-Site" }; // blue
        if(status == "returning") stat = { color: "label-pink", text: "Returning" }; // pink
        if(status == "complete") stat = { color: "label-success", text: "Complete" }; // green
        if(status == "incomplete") stat = { color: "label-danger", text: "Incomplete" }; // red
        if(status == "deleted") stat = { color: "label-default", text: "Deleted" }; // gray
        
        return {
            html:`<span class="label ${stat.color} label-transparent">${stat.text.toUpperCase()}</span>`,
            color: stat.color,
            text: stat.text
        };
    }
    /************** END FUNCTIONS **************/


    /************** CLASS **************/
    class Dispatch {
        constructor(obj) {
            obj.events_captured = obj.events_captured || {};
            obj.destination = obj.destination || [];
            obj.destination[0] = obj.destination[0] || {};
            
            var entered_origin = getDuration("entered_origin",obj),
                queueingAtOrigin = getDuration("queueingAtOrigin",obj),
                processingAtOrigin = getDuration("processingAtOrigin",obj),
                idlingAtOrigin = getDuration("idlingAtOrigin",obj),
                in_transit = getDuration("in_transit",obj),
                user = obj._user || {},
                origin = obj._origin || {},
                destination = obj._destination || {},
                route = obj._route || {},
                vehicle = obj._vehicle || {},
                driver = obj._driver || {},
                checker = obj._checker || {},
                region = obj._region || {},
                cluster = obj._cluster || {},
                trailer = obj._trailer || {},
                posted_by = user.name || obj.username,
                beforeCheckOutTime = getDateTime("entered_origin",obj) || getDateTime("queueingAtOrigin",obj) || getDateTime("processingAtOrigin",obj) || getDateTime("idlingAtOrigin",obj),
                cico_time_calcAtOrigin = (beforeCheckOutTime) ?  (getDateTime("in_transit",obj,"last") - beforeCheckOutTime) : 0,
                cico_time_dhAtOrigin = (["in_transit","complete","incomplete"].includes(obj.status)) ? DATETIME.DH(cico_time_calcAtOrigin || 0) : "-",
                cico_time_hhmmAtOrigin = (cico_time_dhAtOrigin == "-")?"-":DATETIME.HH_MM(null,cico_time_dhAtOrigin).hour_minute,
                cico_time_5AtOrigin =(cico_time_dhAtOrigin == "-")?"-": DATETIME.HH_MM(null,5.0).hour_minute,
                isPL = (origin.short_name) ? (origin.short_name.indexOf(" PL") > -1) : false;

            (posted_by == "_API_") ? posted_by = `Server` : null;

            this._id = obj._id;
            this.ticket_number = obj.ticket_number||"-";
            this.departure_date = DATETIME.FORMAT(obj.departure_date);
            this.region = region.region || "-";
            this.cluster = cluster.cluster || "-";
            this.origin = origin.short_name || "-";
            this.route = obj.route || "-";
            this.destination = destination.short_name || "-";
            this.etd = DATETIME.FORMAT(obj.destination[0].etd);
            this.eta = DATETIME.FORMAT(obj.destination[0].eta);
            this.target_transit_time = DATETIME.HH_MM(null,route.transit_time).hour_minute;
            this.target_cico_time = DATETIME.HH_MM(null,origin.cico).hour_minute;
            this.vehicle = vehicle.name || "-";
            this.conduction_number = vehicle["Tractor Conduction"] || "-";
            this.trailer = trailer._id || "-";
            this.pal_cap = trailer.pal_cap || "-";
            this.driver = driver.name || "-";
            this.checker = checker.name || "-";
            this.comments = obj.comments || "-";
            
            this.entered_datetime = DATETIME.FORMAT(getDateTime(null,obj));
            this.queueing_datetime = DATETIME.FORMAT(getDateTime("queueingAtOrigin",obj));
            this.queueingDuration = DATETIME.HH_MM(queueingAtOrigin).hour_minute;
            this.processing_datetime = DATETIME.FORMAT(getDateTime("processingAtOrigin",obj));
            this.processingDuration = DATETIME.HH_MM(processingAtOrigin).hour_minute;
            this.idling_datetime = DATETIME.FORMAT(getDateTime("idlingAtOrigin",obj));
            this.idlingDuration = DATETIME.HH_MM(idlingAtOrigin).hour_minute;
            this.cico = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? cico_time_hhmmAtOrigin : "-";
            this.cico_capped = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? ((cico_time_dhAtOrigin>5 && isPL)?cico_time_5AtOrigin:cico_time_hhmmAtOrigin) : "-";
            this.transit_datetime = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("in_transit",obj,"last")) : "-";
            this.transitDuration = (["in_transit","onSite","returning","complete","incomplete"].includes(obj.status)) ? DATETIME.HH_MM(in_transit).hour_minute : "-";
            this.onSite_datetime = (["onSite","returning","complete","incomplete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("onSite",obj,"last")) : "-";
            this.returning_datetime = (["returning","complete","incomplete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("returning",obj,"last")) : "-";
            this.complete_datetime = (["complete"].includes(obj.status)) ? DATETIME.FORMAT(getDateTime("complete",obj,"last")) : "-";
            this.status = getStatus(obj.status).html;
            this.statusText = getStatus(obj.status).text;
            this.scheduled_date = DATETIME.FORMAT(obj.scheduled_date,"MMM DD, YYYY");
            this.shift_schedule = obj.shift_schedule || "-";
            this.posted_by = posted_by;
            this.posting_date = DATETIME.FORMAT(obj.posting_date);
            this.late_entry = obj.late_entry ? "Yes".bold() : "No";

            this.ongoingHTML = (obj.status != "complete") ? `<span class="ongoing" style="width: 7px;height: 7px;background: #00a548;border-radius: 20px;top: 14px;margin-left: 4px;position: absolute;"></span>` : "";

            var esc1_remarks = "";
            Object.keys(obj.esc1_remarks||{}).forEach(key => {
                var val = obj.esc1_remarks[key];
                esc1_remarks += `${val.remarks}<div class="font-11 text-muted mb-1">${val.username} | ${DATETIME.FORMAT(Number(key))}</div>`;
            });
            var esc2_remarks = "";
            Object.keys(obj.esc2_remarks||{}).forEach(key => {
                var val = obj.esc2_remarks[key];
                esc2_remarks += `${val.remarks}<div class="font-11 text-muted mb-1">${val.username} | ${DATETIME.FORMAT(Number(key))}</div>`;
            });
            var esc3_remarks = "";
            Object.keys(obj.esc3_remarks||{}).forEach(key => {
                var val = obj.esc3_remarks[key];
                esc3_remarks += `${val.remarks}<div class="font-11 text-muted mb-1">${val.username} | ${DATETIME.FORMAT(Number(key))}</div>`;
            });
            this.esc1_remarks = esc1_remarks || "-";
            this.esc2_remarks = esc2_remarks || "-";
            this.esc3_remarks = esc3_remarks || "-";

            this.history = obj.history || {};
        }

        tbl() {
            var tr = `width: 50%;float: left !important;padding-bottom: 2px;`;
            var tdFirst = `style="font-weight: bold;vertical-align:top;"`;
            return {
                tr,
                tdFirst,
                empty:  `<tr style="${tr}">
                            <td class="tdFirst" ${tdFirst}>&nbsp;</td>
                            <td>&nbsp;</td>
                        </tr>`,
                getTr: (key,value,color="",attr="",customTr) => {
                    return `<tr style="${customTr||tr} ${color}">
                                <td class="tdFirst" ${tdFirst}>${key}</td>
                                <td ${attr}>${(value?`: ${value}`:"")}</td>
                            </tr>`
                }
                
            };
        }

        historyHTML(history={}){
            var str = "";
            var paddingTop = "pt-3";
                
            const original = history.original;
            // delete history.original;
            // delete history.vehicle;
            const sorted = OBJECT.sortByKey(history);
            const ordered = {};
            Object.keys(sorted).reverse().forEach(function(key) {
                ordered[key] = history[key];
            });
            
            Object.keys(ordered).forEach(key => {
                if(!["original","vehicle"].includes(key)){
                    var _key = DATETIME.FORMAT(new Date(Number(key)),"MMM D, YYYY, h:mm A"),
                        _desc = ordered[key] || "-";
                        
                    if(_desc.indexOf("System - Status updated") > -1){
                        // ' -> old setup. Do not remove.
                        var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>") || GET.TEXT_BETWEEN(_desc,"'","'");
                        str += ` <div class="${paddingTop}">
                                    <small class="text-muted">${_key}</small>
                                    <div>Status updated to ${getStatus(status).html}</div>
                                </div>`;
                    } else if(_desc.indexOf("Manual - Status updated") > -1){
                        var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>") || GET.TEXT_BETWEEN(_desc,"'","'");
                        var username = GET.TEXT_BETWEEN(_desc,"<username>","</username>");
                        str += ` <div class="${paddingTop}">
                                    <small class="text-muted">${_key}</small>
                                    <div>Status manually updated to ${getStatus(status).html} by ${username||"-"}.</div>
                                </div>`;
                    } else {
                        var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>");
                        if(status){
                            _desc = _desc.replace(`<status>${status}</status>`,getStatus(status).html);
                        }

                        str += ` <div class="${paddingTop}">
                                    <small class="text-muted">${_key}</small>
                                    <div>${_desc}</div>
                                </div>`;
                    }
                }              
            });
            if(original){
                var _obj = JSON.parse(original);
                // console.log("_obj",_obj);
                str += ` <div class="${paddingTop}">
                            <small class="text-muted">${DATETIME.FORMAT(new Date(_obj.posting_date),"MMM D, YYYY, h:mm A")}</small>
                            <div>Entry posted with status ${getStatus(_obj.status).html}</div>
                        </div>`;
            } 
            return str;
        }
        
        fullView(){
            return `<div id="overlay" class="swal2-container swal2-fade swal2-shown" style="overflow-y: auto;z-index:999999 !important;">
                        <div id="modal" class="modal" role="dialog" aria-labelledby="myLargeModalLabel">
                            <div role="document" class="modal-dialog modal-lg" style="margin:20px auto;width:90%;">
                                <div class="modal-content">
                                    <div class="modal-header pb-2">
                                        <button type="button" class="close" id="close" aria-hidden="true">×</button>
                                        <div class="float-left">
                                            <h4 class="modal-title" id="myModalLabel2">
                                                <b>${this._id}${((clientId == "wilcon")?` | ${this.ticket_number}`:"")}</b> 
                                                <div style="display: inline-block;top: -4px;position: relative;margin-left: 2px;font-size: 12px;">${this.status}</div>
                                            </h4>
                                            <div>Full Entry Details</div>
                                        </div>
                                    </div>
                                    <div class="modal-body row p-0" max-height: 480px;overflow-y: auto;>
                                        <div class="main-details col-sm-9" style="border-right: 1px solid #eee;padding: 15px 0px 10px 30px !important;">
                                            <table>
                                                <tbody>
                                                    ${this.tbl().getTr("Region",this.region)}
                                                    ${this.tbl().getTr("Origin",this.origin)}
                                                    ${this.tbl().getTr("Cluster",this.cluster)}
                                                    ${this.tbl().getTr("Destination",this.destination)}
                                                    ${this.tbl().getTr("Route",this.route)} ${this.tbl().empty} 

                                                    ${this.tbl().empty} ${this.tbl().empty}

                                                    ${this.tbl().getTr("Vehicle",this.vehicle)}
                                                    ${this.tbl().getTr("Trailer",this.trailer)}
                                                    ${this.tbl().getTr("Pal Cap",this.pal_cap)}
                                                    ${this.tbl().getTr("Conduction #",this.conduction_number)}

                                                    ${this.tbl().empty} ${this.tbl().empty}

                                                    ${(clientId=="wilcon")?`
                                                        ${this.tbl().getTr("Driver",this.driver)}
                                                        ${this.tbl().getTr("Checker",this.checker)}

                                                        ${this.tbl().empty} ${this.tbl().empty}
                                                    `:""}

                                                    ${this.tbl().getTr("Check In Date & Time",this.entered_datetime)} ${this.tbl().empty}
                                                    ${this.tbl().getTr("Queueing Duration",this.queueingDuration)} ${this.tbl().empty}
                                                    ${this.tbl().getTr("Processing Duration",this.processingDuration)} ${this.tbl().empty}
                                                    ${this.tbl().getTr("Idling Duration",this.idlingDuration)} ${this.tbl().empty}
                                                    ${this.tbl().getTr("Check Out Date & Time",this.transit_datetime)} ${this.tbl().empty}

                                                    ${this.tbl().empty} ${this.tbl().empty}

                                                    ${this.tbl().getTr("CICO Time",this.cico)}
                                                    ${this.tbl().getTr("Target CICO Time",this.target_cico_time)}
                                                    ${this.tbl().getTr("Transit Time",this.transitDuration)}
                                                    ${this.tbl().getTr("Target Transit Time",this.target_transit_time)}

                                                    ${this.tbl().empty} ${this.tbl().empty}
                                                    
                                                    ${(clientId)?`
                                                        ${this.tbl().getTr("On-Site Date & Time",this.onSite_datetime)} ${this.tbl().empty}
                                                        ${this.tbl().getTr("Returned Date & Time",this.returning_datetime)} ${this.tbl().empty}
                                                        ${this.tbl().getTr("Completion Date & Time",this.complete_datetime)} ${this.tbl().empty}
                                                    `:` 
                                                        ${this.tbl().getTr("Completion Date & Time",this.complete_datetime)}
                                                    `}
                                                </tbody>
                                            </table>
                                            <div class="border-bottom mb-2 mt-2"></div>
                                            <table>
                                                <tbody>
                                                    ${this.tbl().getTr("Late Entry",this.late_entry)}
                                                    ${this.tbl().getTr("Comments",this.comments)}

                                                    ${this.tbl().empty} ${this.tbl().empty}

                                                    ${(clientId=="wilcon")?`
                                                        ${this.tbl().getTr("Scheduled Date",this.scheduled_date)}
                                                        ${this.tbl().getTr("Shift Schedule",this.shift_schedule)}
                                                    `:""}
                                                    
                                                    ${this.tbl().getTr("Posted By",this.posted_by)}
                                                    ${this.tbl().getTr("Posting Date",this.posting_date)}
                                                </tbody>
                                            </table>
                                            <div class="border-bottom mb-2 mt-2"></div>
                                            <table>
                                                <tbody>
                                                    ${this.tbl().getTr("Escalation 1 Remarks",this.esc1_remarks,"","","padding-bottom: 2px;")}
                                                    ${this.tbl().getTr("Escalation 2 Remarks",this.esc2_remarks,"","","padding-bottom: 2px;")}
                                                    ${this.tbl().getTr("Escalation 3 Remarks",this.esc3_remarks,"","","padding-bottom: 2px;")}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="history-details col-sm-3" style="overflow-y: auto;padding-right:30px;">
                                            <h5 class="mb-1">Logs</h5>
                                            ${this.historyHTML(this.history)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        }
    }
    /************** END CLASS **************/
    
    
    if(_ids.length > 0){
        var __ids = [];
        var LIST = [];
        _ids.forEach(val => {
            __ids.push(val._id);
        });
        filter["_id"] = {$in: __ids};

        $.ajax({
            url: `/api/remarks/${clientId}/${JSON.stringify(filter)}`,
            method: "GET",
            timeout: 90000, // 1 minute and 30 seconds
        }).done(function (docs) {
            // console.log("docs",docs);
            LIST = docs;

            if(docs.length > 0){
                var optionsHTML = `<option value="" selected="true" disabled="disabled">Select Shipment Number</option>`;
                docs.forEach(val => {
                    var notification = _ids.find(x => x._id == val._id);
                    optionsHTML += `<option value="${val._id}">${val._id} - ${notification.delay}, Escalation ${__escalation}</option>`;
                });

                $(`#body-main`).html(`<div style="height: 100%;background-color: #00800014;">
                                        <div style="background-color: green;width: 100%;height: 10em;display: inline-block;"></div>
                                        <div class="remarks-container">
                                            <div class="col-sm-12 pt-4 pb-2 pr-4 pl-4">
                                                <h3 class="text-dark">Shipment Entry Remarks</h3>
                                                <h5 class="mt-5">Hello <b>${name||""}</b>,<br><br><br>Please select the shipment number you wish to add your remarks.</h5>
                                                <select id="sn" class="form-control mt-2">${optionsHTML}</select>
                                            </div>
                                            <div id="remarks-container" class="col-sm-12 pt-0 pl-4 pr-4 pb-4"></div>
                                        </div>
                                    </div>`);
                $(`#sn`).change(function(){
                    var _id = $(this).val();
                    // console.log("_id",_id)
                    $(`#remarks-container`).html(`<h5>Please add your remarks in the textbox below.</h5>
                                                <textarea id="${_id}-remarks" class="form-control" placeholder="Add your remarks here..."></textarea>
                                                <a href="javascript:void(0);" id="${_id}-view" class="d-block mt-3">Click to view the shipment details</a>
                                                <button id="${_id}-btn" class="btn btn-success mt-4" disabled>Submit</button>`);
                    $(`#${_id}-remarks`).keyup(function(){
                        $(`#${_id}-btn`).attr("disabled",($(this).val().trim() == ""));
                    });
                    $(`#${_id}-view`).click(function(){
                        var obj = LIST.find(x=> x._id == _id);
                        var de = new Dispatch(obj);
                        $(`body`).append(de.fullView());
                        // console.log(de);
                    });
                    $(`#${_id}-btn`).click(function(){
                        var remarks = $(`#${_id}-remarks`).val();
                        
                        if(remarks.trim() == ""){
                            alert("Error: Please fill in the textbox.");
                        } else {
                            var set = {};
                            var timestamp = new Date().getTime();
                            var notification = _ids.find(x => x._id == _id);
                            if(__escalation == 1){
                                set[`esc1_remarks.${timestamp}`] = {
                                    remarks,
                                    username,
                                    type: notification.type
                                };
                            }
                            if(__escalation == 2){
                                set[`esc2_remarks.${timestamp}`] = {
                                    remarks,
                                    username,
                                    type: notification.type
                                };
                            }
                            if(__escalation == 3){
                                set[`esc3_remarks.${timestamp}`] = {
                                    remarks,
                                    username,
                                    type: notification.type
                                };
                            }
                            if(Object.keys(set).length > 0){
                                $(`#${_id}-remarks`).attr("disabled",true);
                                $(`#${_id}-btn`).html(`<i class="la la-spin la-spinner"></i> Submit`).attr("disabled",true);
                                set[`history.${timestamp}`] = `<username>${username}</username> added a comment/remark.`;
                                GET.AJAX({
                                    url: `/api/remarks/${clientId}/${username}/${_id}`,
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json; charset=utf-8",
                                    },
                                    data: JSON.stringify(set)
                                }, function(docs){
                                    if(docs.ok == 1){
                                        toastr.info("Remarks submitted.");
                                        $(`#${_id}-btn`).html(`Submit`).attr("disabled",true);
                                        $(`#${_id}-remarks`).attr("disabled",false).val("");
                                        var doc = docs.docs[0];
                                        var index = LIST.findIndex(x => x._id == doc._id);
                                        LIST[index] = doc;
                                    } else {
                                        toastr.error("Something went wrong</br></br>Error Code - ec023/03");
                                    }
                                    // $(`#confirm-modal`).remove(); 
                                },function(error){
                                    console.log(error);
                                    // $(`#confirm-modal`).remove();
                                    toastr.error("Something went wrong</br></br>Error Code - ec023/03");
                                });
                            }
                        }
                    });
                });
            } else {
                alert("Error: Shipment does not exist.");
            }
        });
    } else {
        alert("Error: Empty shipment list.");
    }
};