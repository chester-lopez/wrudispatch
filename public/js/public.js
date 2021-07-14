var DEFAULT_DATE = null;

// FOR FUTURE: - encodeURIComponent($('textarea').val()) then $('textarea').val(decodeURIComponent("A%20test%202adf"))
// https://icons8.com/line-awesome
// http://culmat.github.io/jsTreeTable/
// http://coca-cola.server93.com/comGpsGate/api/v.1/test
// Moment.js (https://momentjs.com/docs/#/parsing/string-format/)

// String
String.prototype.capitalize = function(separator){
    separator = separator || "_";
    var str = this.toLowerCase(),
        arr = str.split(separator);
    $.each(arr,(i,val) => {
        arr[i] = val.substr(0,1).toUpperCase() + val.substr(1);
    });
    str = arr.join(" ");
    return str;
};
String.prototype.merge = function(){
    return this.replace(/ /g,"_").toLowerCase();
};
String.prototype.isEmpty = function(){
    return this.trim() == "";
};
String.prototype._trim = function(nonSpace_Space){
    var str = this.toString();
    if(nonSpace_Space){
        str = str.replace(/[^\x00-\x7F]/g,""); // removes ñ too
    }
    return str.replace(/ +(?= )/g,'').trim();
};
// Array
Array.prototype.insert = function ( index, item ) {
    this.splice( index, 0, item );
};
Array.prototype.isEmpty = function ( index, item ) {
    return this.length == 0;
};
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
        // dh = dh || null; // is NaN, it becomes 00:00. If null, code is to make it "-"

        // var day = "",
        //     hour = "",
        //     minute = "";
        // if(ms && ms >=0 || dh != null){
        //     (ms && ms >=0) ? dh = (ms/3600)/1000 : null; // milliseconds to decimal hours
        //     (dh != null) ? dh = Number(dh) : null;

        //     dh = dh.toFixed(2);

        //     hour = dh.toString().split(".")[0]; // convert decimal hour to HH:MM
        //     // day = Math.floor(hour/24); // uncomment to make day work
        //     // hour = hour - day * 24; // uncomment to make day work
        //     minute = JSON.stringify(Math.round((dh % 1)*60)).split(".")[0];
        //     // if(day.toString().length < 2) day = '0' + day; // uncomment to make day work
        //     if(hour.toString().length < 2) hour = '0' + hour;
        //     if(minute.length < 2) minute = '0' + minute;
        //     def = `${hour}:${minute}`;
        // }
        // return {
        //     day,
        //     hour,
        //     minute,
        //     hour_minute: def,
        // };

        
        var hour = "",
            minute = "";
        if(ms && ms >=0 || dh != null){
            (ms && ms >=0) ? dh = (ms/3600)/1000 : null; // milliseconds to decimal hours
            (dh != null) ? dh = Number(dh) : null;

            dh = dh.toFixed(2);

            hour = dh.toString().split(".")[0]; // convert decimal hour to HH:MM
            minute = JSON.stringify(Math.round((dh % 1)*60)).split(".")[0];

            hour = (!isNaN(Number(hour))) ? Number(hour) : "00";
            minute = (!isNaN(Number(minute))) ? Number(minute) : "00";

            if(hour.toString().length < 2) hour = '0' + hour;
            if(minute.toString().length < 2) minute = '0' + minute;

            def = `${hour}:${minute}`;
        }
        return {
            hour,
            minute,
            hour_minute: def,
        };
    },
};
var GET = {
    AJAX:function(settings,successCallback,errorCallback){
        $.ajax(settings).done(function (response) {
            if (typeof successCallback === 'function') { successCallback(response); }
        }).fail(function(error){
            if (typeof errorCallback === 'function') { errorCallback(error); }
        });
    },
    BROWSER:function(){
        var browser = "Unknown";
        // Opera 8.0+
        ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) ? browser = "Opera 8.0+" : null;

        // Firefox 1.0+
        (typeof InstallTrigger !== 'undefined') ? browser = "Firefox 1.0+" : null;

        // Safari 3.0+ "[object HTMLElementConstructor]" 
        (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification))) ? browser = "Safari 3.0+" : null;

        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        (isIE) ? browser = "Internet Explorer 6-11" : null;

        // Edge 20+
        (!isIE && !!window.StyleMedia) ? browser = "Edge 20+" : null;

        // Chrome 1 - 71
        (!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)) ? browser = "Chrome 1-71" : null;

        return browser;
    },
    LENGTH: function(length){
        length --;
        var word = (length == 1)?"other":"others";
        return {
            text: ((length > 0)?`<small class="text-primary"> and ${length} ${word}</small>`:``),
            actual: length
        }
    },
    ROUND_OFF:function(value,decimal_place=2){
        return Number(Math.round((value)+`e${decimal_place}`)+`e-${decimal_place}`);
    },
    TEXT_BETWEEN: function(str,char1,char2){
        var tmpStr = str.match(`${char1}(.*)${char2}`) || [];
        return tmpStr[1];
    },
    PERCENTAGE: function(value=0,decimal_place=1){
        return GET.ROUND_OFF(value*100,decimal_place);
    },
    INTLTELINPUT: function(el){
        $(el).intlTelInput({
            preferredCountries: ['ph'],
            separateDialCode: true,
            utilsScript: "./public/vendor/intlTelInput/utils.js",
        });
        $(el).on("countrychange", function(e, countryData) {
            GENERATE.MASK(el);
        });
        setTimeout(function(){
            GENERATE.MASK(el);
            $(el).css("padding-left","80px"); 
        },1000) 
        $(el).css("padding-left","80px"); 
    },
    INTLTELINPUT_VALUE: function(el){
        return ($($(".iti__selected-flag")[0]).text()+$(el).val().replace(/ /g,""));
    },
};
var SORT = {
    ARRAY_OBJECT: function(obj,key,options={}){
        obj.sort(function(a, b) {
            a[key] = a[key] || "";
            b[key] = b[key] || "";

            if(typeof a[key] == "number"){
                var _a = a[key], _b = b[key], sort;
                sort = (options.sortType == "asc") ? (_a-_b) : (_b-_a);
                return sort;
            } else { // will work on dates
                var sort = (options.sortType == "asc") ? a[key].toLowerCase().localeCompare(b[key].toLowerCase()) : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
                return sort;
            }
        });
        return obj;
    },
    OBJECT: function(obj,key){
        var sorted = [];
        Object.keys(obj).sort(function(a, b) {
            return obj[b][key] - obj[a][key];
        }).forEach(function(key) {
            sorted.push(obj[key]);
        });
        return sorted;
    }
};
var CRYPTO = {
    ENCRYPT: function(data){
        return window.btoa(JSON.stringify(data || {}));
    }, 
    DECRYPT: function(data){
        var parsedData = {};
        try {
            var decryptedData = window.atob(data);
            parsedData = (data)?JSON.parse(decryptedData):{}
        } catch(error){}
        return parsedData;
    }
};
var GENERATE = {
    RANDOM: function(length=6){
        const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var str = '';
        for (var i = length; i > 0; --i) str += mask[Math.round(Math.random() * (mask.length - 1))];
        return str;
    },
    MASK: function(id){
        var placeholder = $(id).attr("placeholder");
        if(placeholder){
            var reg = placeholder.replace(/\d/g, "9");
            $(id).mask(reg);
            $(id).blur();
        }
    },
    HIDESHOWPASSWORD: function(ids){
        $(ids).hideShowPassword({
            innerToggle: true,
            toggle: {
                className: 'hideShowPassword-toggle toggle-eye'
            },
            states: {
                shown: {
                    toggle: {
                        content: '<i class="la la-eye-slash">'
                    }
                },
                hidden: {
                    toggle: {
                        content: '<i class="la la-eye">'
                    }
                }
            }
        });
    },
    TABLE_TO_EXCEL: {
        SINGLE: (function(){
            var uri = 'data:application/vnd.ms-excel;base64,',
             template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>br {mso-data-placement:same-cell;}</style></head><body><table cellspacing="0" rules="rows" border="1" style="color:Black;background-color:White;border-color:#CCCCCC;border-width:1px;border-style:None;width:100%;border-collapse:collapse;font-size:9pt;text-align:center;">{table}</table></body></html>', 
             base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }, 
             format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
            return function (table, name) {
                if (!table.nodeType) table = document.getElementById(table)
                var ctx = { worksheet: 'Worksheet', table: table.innerHTML }
                if (navigator.msSaveBlob) {
                    var blob = new Blob([format(template, ctx)], { type: 'application/vnd.ms-excel', endings: 'native' });
                    navigator.msSaveBlob(blob, `${name}.xls`);
                } else {
                    $(`body`).append(`<a id="temp-link" href="${(uri + base64(format(template, ctx)))}" download="${name}.xls"></a>`);
                    $(`#temp-link`)[0].click();
                }
            }
        })(),
        MULTISHEET: (function ($) {
            // https://jsfiddle.net/xvkt0yw9/
            // https://stackoverflow.com/questions/29698796/how-to-convert-html-table-to-excel-with-multiple-sheet
            var uri = 'data:application/vnd.ms-excel;base64,'
            , html_start = `<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`
            , template_ExcelWorksheet = `<x:ExcelWorksheet><x:Name>{SheetName}</x:Name><x:WorksheetSource HRef="sheet{SheetIndex}.htm"/></x:ExcelWorksheet>`
            , template_ListWorksheet = `<o:File HRef="sheet{SheetIndex}.htm"/>`
            , template_HTMLWorksheet = '\n------=_NextPart_dummy\n' +
                                        'Content-Location: sheet{SheetIndex}.htm\n' +
                                        'Content-Type: text/html; charset=windows-1252\n\n' +
                                        html_start +
                                            '<head>' +
                                                '<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">' +
                                                '<link id="Main-File" rel="Main-File" href="../WorkBook.htm">' +
                                                '<link rel="File-List" href="filelist.xml">' +
                                            '</head>' +
                                            '<body><table>{SheetContent}</table></body>' +
                                        '</html>'
                                        
            , template_WorkBook = 'MIME-Version: 1.0\n' +
                                    'X-Document-Type: Workbook\n' +
                                    'Content-Type: multipart/related; boundary="----=_NextPart_dummy"\n\n' +
                                    '------=_NextPart_dummy\n' +
                                    'Content-Location: WorkBook.htm\n' +
                                    'Content-Type: text/html; charset=windows-1252\n\n' +
                                    html_start +
                                        '<head>' +
                                            '<meta name="Excel Workbook Frameset">' +
                                            '<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">' +
                                            '<link rel="File-List" href="filelist.xml">' +
                                            '<!--[if gte mso 9]><xml>' +
                                                '<x:ExcelWorkbook>' +
                                                    '<x:ExcelWorksheets>{ExcelWorksheets}</x:ExcelWorksheets>' +
                                                    '<x:ActiveSheet>0</x:ActiveSheet>' +
                                                '</x:ExcelWorkbook>' +
                                            '</xml><![endif]-->' +
                                        '</head>' +
                                        '<frameset>' +
                                            '<frame src="sheet0.htm" name="frSheet">' +
                                            '<noframes><body><p>This page uses frames, but your browser does not support them.</p></body></noframes>' +
                                        '</frameset>' +
                                    '</html>' +
                                    '{HTMLWorksheets}\n' +
                                        'Content-Location: filelist.xml\n' +
                                        'Content-Type: text/xml; charset="utf-8"\n' +
                                        '<xml xmlns:o="urn:schemas-microsoft-com:office:office">\n' +
                                        '<o:MainFile HRef="../WorkBook.htm"/>\n' +
                                        '{ListWorksheets}\n' +
                                        '<o:File HRef="filelist.xml"/>\n' +
                                        '</xml>\n' +
                                        '------=_NextPart_dummy--\n'
            , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
            return function (tables, filename) {
                console.log("OH YEAHHH");
                var context_WorkBook = {
                    ExcelWorksheets:''
                ,   HTMLWorksheets: ''
                ,   ListWorksheets: ''
                };
                var tables = jQuery(tables);
                $.each(tables,function(SheetIndex){
                    var $table = $(this);
                    var SheetName = $table.attr('data-SheetName');
                    if($.trim(SheetName) === ''){
                        SheetName = 'Sheet' + SheetIndex;
                    }
                    context_WorkBook.ExcelWorksheets += format(template_ExcelWorksheet, {
                        SheetIndex: SheetIndex
                    ,   SheetName: SheetName
                    });
                    context_WorkBook.HTMLWorksheets += format(template_HTMLWorksheet, {
                        SheetIndex: SheetIndex
                    ,   SheetContent: $table.html()
                    });
                    context_WorkBook.ListWorksheets += format(template_ListWorksheet, {
                        SheetIndex: SheetIndex
                    });
                });
        
                var link = document.createElement("A");
                link.href = uri + base64(format(template_WorkBook, context_WorkBook));
                link.download = filename || 'Workbook.xls';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })(jQuery),
        //https://jsfiddle.net/97ajn9wm/1/
    },
    CSV:{
        toArray:function(strData, strDelimiter){
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");
            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp((
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [[]];
            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;
            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];
                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[2].replace(
                    new RegExp("\"\"", "g"), "\"");
                } else {
                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[3];
                }
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }
            // Return the parsed data.
            return (arrData);
        },
        toJSON:function(csvString){
            var array = GENERATE.CSV.toArray(csvString);
            var objArray = [];
            for (var i = 1; i < array.length; i++) {
                objArray[i - 1] = {};
                for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                    var key = array[0][k];
                    objArray[i - 1][key] = array[i][k]
                }
            }
        
            var json = JSON.stringify(objArray);
            var str = json.replace(/},/g, "},\r\n");
        
            return str;
        }
    }
};
var ALERT = {
    HTML: {
        INFO: function(text,customClass,noBtn){
            var xBtn = (noBtn)?"":`<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`;
            customClass = customClass || "ml-4 mr-4 mt-2 mb-3";
            return `<div role="alert" class="alert alert-info alert-dismissible ${customClass}">
                        ${xBtn}
                        <i class="la la-info-circle mr-2"></i>${text}
                    </div>`;
        },
        SUCCESS: function(text){
            var customClass = customClass || "ml-4 mr-4 mt-2 mb-3";
            return `<div role="alert" class="alert alert-success alert-dismissible ${customClass}">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <i class="la la-check-circle mr-2"></i>${text}
                    </div>`;
        },
        WARNING: function(text,customClass="ml-4 mr-4 mt-2 mb-3"){
            return `<div role="alert" class="alert alert-warning alert-dismissible ${customClass}">
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <i class="la la-warning mr-2"></i>${text}
                    </div>`;
        },
        ERROR: function(text,customClass="ml-4 mr-4 mt-2 mb-3",noBtn){
            var xBtn = (noBtn)?"":`<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`;
            return `<div class="alert alert-danger alert-dismissible text-left ${customClass}" role="alert">
                        ${xBtn}
                        <i class="la la-times-circle mr-2"></i>${text}
                    </div>`;
        }
    },
    REQUIREGRANTEDDC: function(){
        return ALERT.HTML.WARNING(`Creating and importing of dispatch entries are disabled until you are assigned to a location. Please contact your administrator to assign you a location`);
    },
    DISABLEDLIVEUPDATE: function(){
        return ALERT.HTML.WARNING(`Real-time update is disabled. Please click the ' <i class="la la-refresh"></i> ' button to refresh data.`);
    },
    REQUIREDFIELDS: function(el,formElement){
        var css_default = {"background-color":"white"},
            css_error = {"background-color":"#ffe4e4"},
            hasEmptyRequiredFields = false;
        $(formElement).find("input,select,textarea").each((i,el) => {
            var val = $(el).val();
            var required = $(el).attr("required");
            if(required){
                if(val){
                    $(el).css(css_default);
                    $(el).next(".select2-container").find(".select2-selection").css(css_default);
                } else {
                    $(el).css(css_error);
                    $(el).next(".select2-container").find(".select2-selection").css(css_error);
                    hasEmptyRequiredFields = true;
                }
            }
        });
        if(hasEmptyRequiredFields){
            $(el).html(ALERT.HTML.ERROR("Please fill in required fields.","ml-3 mr-3 mt-2 mb-2")).show();
        }
        return hasEmptyRequiredFields;
    }
};
var TOASTR = {
    REQUIREDFIELDS: function(){
        toastr.error("Please fill in required fields.");
    },
    CREATEDSUCCESSFULLY: function(str,sticky){
        str = str || "";
        var message = "Record created successfully."+str,
            options = {timeOut: 1500};
        if(sticky){
            message += "<br><br>Tap to close.";
            options = { timeOut: 0, extendedTimeOut: 0 };
        }
        toastr.success(message,null,options);
    },
    UPDATEDSUCCESSFULLY: function(){
        toastr.success("Record updated successfully.",null,{timeOut: 1500});
    },
    DELETEDSUCCESSFULLY: function(){
        toastr.success("Record deleted successfully.",null,{timeOut: 1500});
    },
    ERROR: function(data = {},customMessage="",options){
        var error = data.error || {},
            status = data.status || error.status,
            message = (data.statusText || error.message)+customMessage,
            options = options || {};
        if(status == 400) toastr.error(`Bad Request.`,null,options);
        else if(status == 401) {
            window.stop();
            toastr.error(`Unauthorized.</br></br>Please refresh this page. If the problem persists, contact our administrators.`, null,{ timeOut: 0, extendedTimeOut: 0 });
            setTimeout(function(){LOGOUT();},10000);
        }
        else if(status == 403) toastr.error(`Forbidden.`,null,options);
        else if(status == 404) toastr.error(`Not Found.`,null,options);
        else if(status == 409) toastr.error(`Conflict.`,null,options); // double submit
        else if(status == 500) toastr.error(`Internal Server Error.`,null,options);
        else if(status == 503) toastr.error(`Service Unavailable.`,null,options);
        else toastr.error(message,null,options);
    }
};
const ARRAY = {
    OBJECT: {
        getDistinctValues: (a=[],k) => [...new Set(a.map(x => x[k]))],
        sort: function(obj,key,options={}){
            obj.sort(function(a, b) {
                a[key] = a[key] || "";
                b[key] = b[key] || "";
    
                if(typeof a[key] == "number"){
                    var _a = a[key], _b = b[key], sort;
                    sort = (options.sortType == "asc") ? (_a-_b) : (_b-_a);
                    return sort;
                } else { // will work on dates
                    var sort = (options.sortType == "asc") ? a[key].toLowerCase().localeCompare(b[key].toLowerCase()) : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
                    return sort;
                }
            });
            return obj;
        }
    }
};
var PING = {
    GET: function(){
        function calculatePing(){
            var start = new Date().getTime();
            $('#junkOne').attr('src', 'http://fate.holmes-cj.com:8886/').error(function() {
                var end = new Date().getTime();
                $('#timer').html("" + (end - start) + "ms");
            });
        }
        setInterval(function(){
            calculatePing();
        },5000); // 5 seconds

        calculatePing()
    }
};
var _SESSION_ = {
    window_tab_close: function(ID,USERNAME,SESSION_TOKEN) {
        if(ID && SESSION_TOKEN){
            (+Cookies.get('tabs') > 0) ? null : Cookies.set('tabs', 0);

            Cookies.set('tabs', +Cookies.get('tabs') + 1);

            window.onbeforeunload = function () {
                if(+Cookies.get('tabs') > 0){
                    Cookies.set('tabs', +Cookies.get('tabs') - 1);
                }
                if(!+Cookies.get('tabs') || +Cookies.get('tabs') <= 0){
                    sessionStorage.setItem("prev_session_token", SESSION_TOKEN);
                    Cookies.remove("session_token");
                    Cookies.remove("tabs");
                    $.ajax({
                        url: `/api/sessions/${ID}/${USERNAME}/temporary/${SESSION_TOKEN}`, 	
                        method: "DELETE", 
                        headers: {
                            "Authorization": SESSION_TOKEN
                        },
                        async:false,
                    });
                }
            };

            // Broadcast that you're opening a page
            // var counted = false;
            // localStorage.openpages = Date.now();
            // var onLocalStorageEvent = function(e){
            //     if(e.key == "openpages"){
            //         // Listen if anybody else is opening the same page!
            //         localStorage.page_available = Date.now();
            //     }
            //     if(e.key == "page_available" && !counted){
            //         counted = true;
            //         localStorage.countPages = Number(localStorage.countPages) || 1;
            //         localStorage.countPages ++;
            //     }
            // };
            // window.addEventListener('storage', onLocalStorageEvent, false);

            // window.onbeforeunload = function(evt) {
            //     if(localStorage.countPages > 0){
            //         localStorage.countPages --;
            //     }
            //     if(!localStorage.countPages || localStorage.countPages <= 0){
            //         sessionStorage.setItem("prev_session_token", SESSION_TOKEN);
            //         // sessionStorage.setItem("prev_GKEY", Cookies.get("GKEY"));
            //         // Cookies.remove("GKEY");
            //         Cookies.remove("session_token");
            //         $.ajax({
            //             url: `/api/sessions/${ID}/${USERNAME}/temporary/${SESSION_TOKEN}`, 	
            //             method: "DELETE", 
            //             headers: {
            //                 "Authorization": SESSION_TOKEN
            //             },
            //             async:false,
            //         });
            //     }
            // }
        }
    },
    lastActive: function(ID,USERNAME,SESSION_TOKEN){
        /************* SESSIONS ACTIVE *************/
        var last_active_timestamp = new Date().getTime();
        // Save last active timestamp every 30 seconds
        setInterval(function(){
            if(USERNAME){
                $.ajax({ 
                    url: `/api/sessions_active/${ID}/${USERNAME}/${SESSION_TOKEN}/${last_active_timestamp}`, 
                    method: "PUT", 
                    timeout: 90000 ,
                    headers: {
                        "Authorization": SESSION_TOKEN
                    },
                    async: true
                });
            }
        },30000); // 30 seconds
        // User's mouse movement will indicate that he/she is actively using WD.
        $(`body`).mousemove(function(){ last_active_timestamp = new Date().getTime(); });
        /************* END SESSIONS ACTIVE *************/
    }
};
var ATTACHMENTS = {
    initialize: function(noAction){
        /******** ATTACHMENT ********/
        $(`#new-attachment`).click(function(){
            $(`#new-file`).trigger("click");
        });
        $(`#new-file`).on("change", function(){
            var file = this.files[0];

            if(file.size/1024/1024 > 1){
                toastr.warning("Upto 1mb per attachment only.");
            } else {
                function getBase64(file) {
                    var reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function () {
                        file.base64 = reader.result;
                        ATTACHMENTS.add_attachment(file,noAction);
                    };
                    reader.onerror = function (error) {
                        toastr.error("Unable to upload file");
                        console.log('Error: ', error);
                    };
                 }
                getBase64(file); // prints the base64 string	
            }
        });
        /******** END ATTACHMENT ********/
    },
    add_attachment: function(file,noAction){
        var _row = ATTACHMENTS.add_table_row(file,noAction);
        $(`[_row="${_row}"] [delete-attachment]`).click(function(){
            $(this).parent().parent().remove();	
            if($('#tbl-attachment > tbody > tr').length > 0){
                $('#tbl-attachment > tbody > tr').each(function(index, tr) {
                    $(tr).children().eq(0).html(index+1);
                });
            }
        });
    },
    add_table_row: function(file,noAction){
        var fileExtension = {
            image: {
                ext: ["png","jpg","jpeg","gif"],
                icon: "la la-file-image-o"
            },
            pdf: {
                ext: ["pdf"],
                icon: "la la-file-pdf-o"
            },
            excel: {
                ext: ["xls","xlsx"],
                icon: "la la-file-excel-o"
            },
            word: {
                ext: ["doc","docx"],
                icon: "la la-file-word-o"
            },
            ppt: {
                ext: ["ppt"],
                icon: "la la-file-powerpoint-o"
            },
            archive: {
                ext: ["zip","rar"],
                icon: "la la-file-archive-o"
            },
        },
        filename = file.filename || file.name,
        ext = filename.split('.').pop().toLowerCase(),
        icon = "la la-file-o",
        contenteditable = (noAction===true)?"":`contenteditable="true"`;

        for (var key in fileExtension) {
            if ($.inArray(ext, fileExtension[key].ext) > -1){
                icon = fileExtension[key].icon;
            }
        }
        var _row = GENERATE.RANDOM(36),
            i = $('#tbl-attachment > tbody > tr').length + 1,
            new_row = `<tr _row="${_row}">
                            <td class="text-muted">${i}</td>
                            <td><a target="_blank" href="${file.base64 || file.url}"><i class="${icon} mr-2"></i>${filename}</a></td>
                            <td class="text-center">${(noAction===true)?"":`<a delete-attachment title="Delete" class="action-icon"><i class="la la-trash"></i></a></td>`}</td>
                        </tr>`;
        $(`#tbl-attachment tbody`).append(new_row);
        return _row;
    },
    get: function(dsName){
        var attachments = [];
        var allStorageFilenames = [];
        if($(`#tbl-attachment`).find('tr').length > 1){
            $(`#tbl-attachment`).find('tr').each(function (i, el) {
                if(i > 0) { //_id
                    var $tds = $(this).find('td'),
                        // name = $tds.eq(1).text(),
                        td2 = $tds.eq(1),
                        _link = td2.find("a"),
                        filename = _link.text(),
                        extsplit = filename.split("."),
                        ext = extsplit[extsplit.length-1],
                        href = _link.attr("href"),
                        base64_encoded = href.split(',')[1],
                        storageFilename = (base64_encoded) ? `attachments/<INSERT_ID_HERE>/${filename}` : href.substring(href.indexOf('attachments'));
                    
                    if(!allStorageFilenames.includes(storageFilename)){
                        allStorageFilenames.push(storageFilename);
                        attachments.push({ 
                            base64: href, 
                            // name, 
                            filename, 
                            storageFilename,
                            url: `https://storage.googleapis.com/${dsName}/`
                        });
                    } 
                } 
            });
        }
        return attachments;
    },
    set: function(attachments,noAction){
        $.each(attachments, function(i,val){
            ATTACHMENTS.add_attachment(val,noAction);
        });
    }
};
const HISTORY = {
    fromTo: function(title,from,to,type){
        from = (from || "").toString().replace(/undefined/g,"");
        to = (to || "").toString().replace(/undefined/g,"");
        return `• ${title} changed from '${from}' to '${to}'.`;
    },
    check: function(originalObject,updatedObject,USERNAME,historyOptions={}){
        var arrHistory = [];

        if(Object.keys(originalObject||{}).length > 0){
            Object.keys(updatedObject||{}).forEach(key => {
                if(!(historyOptions.excludeKeys||[]).includes(key)){
                    var fieldOptions = (historyOptions.fields||[]).find(x => x.key == key) || {};
                    var dataExtended = fieldOptions.dataExtended;
                    var fieldType = fieldOptions.type;
                    var isCustom = fieldOptions.custom;
                    var customFunction = fieldOptions.customFunction;
                    var customExternalFunction = fieldOptions.customExternalFunction;
                    var customTitle = fieldOptions.customTitle || key.capitalize();
                    var condition = true;

                    if(fieldType == null) condition = (updatedObject[key] != originalObject[key]);
                    if(fieldType == "number") condition = (Number(updatedObject[key]) != Number(originalObject[key]));
                    if(fieldType == "array") condition = ((updatedObject[key]||[]).toString() != (originalObject[key]||[]).toString());
                    if(fieldType == "date") condition = (DATETIME.FORMAT(updatedObject[key]||null,format) != DATETIME.FORMAT(originalObject[key]||null,format));
                    if(fieldType == "bool") condition = (updatedObject[key] != originalObject[key]);
                    
                    if(condition){
                        var original = originalObject[key];
                        var updated = updatedObject[key];

                        if (typeof customExternalFunction === 'function') { customExternalFunction(); }

                        if(dataExtended === true){
                            var data = fieldOptions.data || [];
                            var dataCompareKey = fieldOptions.dataCompareKey;
                            var dataValueKey = fieldOptions.dataValueKey;
                            
                            var _original = data.find(x => (x[dataCompareKey]||"").toString() == (original||"").toString()) || {};
                            var _new = data.find(x => (x[dataCompareKey]||"").toString() == (updated||"").toString()) || {};

                            original = _original[dataValueKey] || "-";
                            updated = _new[dataValueKey] || "-";
                        }
                        if(fieldType == "date") {
                            var format = fieldOptions.format;
                            original = DATETIME.FORMAT(original,format);
                            updated = DATETIME.FORMAT(updated,format);
                            arrHistory.push(HISTORY.fromTo(customTitle,original,updated));
                        } else if(fieldType == "array"){
                            var customCondition = fieldOptions.customCondition || function(val1,val2){ return val1 == val2; };
                            var customValue = fieldOptions.customValue || function(val1){ return val1; };

                            ($.isArray(original)) ? null : original = original.split(",");
                            ($.isArray(updated)) ? null : updated = updated.split(",");


                            var added = [];
                            var removed = [];
                            var arr = [];

                            function removedOrAdded(object1,object2,type){
                                (object1||[]).forEach(val1 => {
                                    var exists = false;
                                    (object2||[]).forEach(val2 => {
                                        if(customCondition(val1,val2)){
                                            exists = true;
                                        } 
                                    });
                                    if(exists === false){
                                        if(type == "removed") removed.push(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• ${customValue(val1)}`);
                                        if(type == "added") added.push(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• ${customValue(val1)}`);
                                    }
                                });
                            }
                            removedOrAdded(updated,original,"added");
                            removedOrAdded(original,updated,"removed");
                            
                            if(added.length > 0){
                                arr.push(`&nbsp;&nbsp;&nbsp;Added to list:<br>${added.join("<br>")}`);
                            }
                            if(removed.length > 0){
                                arr.push(`&nbsp;&nbsp;&nbsp;Removed from list:<br>${removed.join("<br>")}`);
                            }
                            (arr.length > 0) ? arrHistory.push(`• ${customTitle}:<br>${arr.join("<br>")}`) : null;
                        } else if(isCustom === true) {
                            var custom = customFunction(original,updated);
                            (custom) ? arrHistory.push(custom) : null;
                        } else if(fieldType === "bool") {
                            original = original || false;
                            updated = updated || false;
                            (original != updated) ? arrHistory.push(`• ${customTitle} changed from '${original}' to '${updated}'.`) : null;
                        } else if(fieldType === "status") {
                            var from = GET.STATUS(original).html;
                            var to = GET.STATUS(updated).html;
                            (from != to) ? arrHistory.push(`• ${customTitle} changed from '${from}' to '${to}'.`) : null;
                        } else if(fieldType === "attachments") {
                            var attachmentRemoved = [];
                            var attachmentAdded = [];
                            var attachmentChanges = [];

                            (original||[]).forEach(val1 => {
                                var existAttachment = false;
                                (updated||[]).forEach(val2 => {
                                    if(val1.filename == val2.filename){
                                        existAttachment = true;
                                    } 
                                });
                                if(existAttachment === false){
                                    // removed
                                    attachmentRemoved.push(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;<i class="la la-paperclip text-muted"></i> ${val1.filename}`);
                                }
                            });
                            (updated||[]).forEach(val2 => {
                                var existAttachment = false;
                                (original||[]).forEach(val1 => {
                                    if(val2.filename == val1.filename){
                                        existAttachment = true;
                                    } 
                                });
                                if(existAttachment === false){
                                    // added
                                    attachmentAdded.push(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;<i class="la la-paperclip text-muted"></i> ${val2.filename}`);
                                }
                            });

                            if(attachmentAdded.length > 0){
                                attachmentChanges.push(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;Added attachment/s:<br>${attachmentAdded.join("<br>")}`);
                            }
                            if(attachmentRemoved.length > 0){
                                attachmentChanges.push(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;Removed attachment/s:<br>${attachmentRemoved.join("<br>")}`);
                            }
                            
                            return (attachmentChanges.length > 0) ? arrHistory.push(`• Attachments:<br>${attachmentChanges.join("<br>")}`) : null;
                        } else {
                            arrHistory.push(HISTORY.fromTo(customTitle,original,updated));
                        }
                    }
                }
            });
        }
               
        (historyOptions.customChanges||[]).forEach(func => {
            if(func()){
                arrHistory.push(`• ${func()}`);
            }
        });
        
        (arrHistory.length > 0) ? updatedObject[`history.${new Date().getTime()}`] = `<span style="font-weight: normal;">Record updated by <username>${USERNAME}</username>:</span><br>${arrHistory.join("<br>")}` : null;
        return updatedObject;
    },
    view: function(history,userList){
        userList = userList || [];
        var str = "";
        const sorted = OBJECT.sortByKey(history||{});
        const ordered = {};
        Object.keys(sorted).reverse().forEach(function(key) {
            ordered[key] = sorted[key];
        });
        Object.keys(ordered).forEach((key,i) => {
            var _key = DATETIME.FORMAT(new Date(Number(key)),"MMM D, YYYY, h:mm A"),
                _desc = ordered[key] || "-";
            var paddingTop = (i == 0) ? "" : "pt-3"; 

            var status = GET.TEXT_BETWEEN(_desc,"<status>","</status>");
            var username = GET.TEXT_BETWEEN(_desc,"<username>","</username>");
            var user = userList.find(x => x._id == username) || {};
            if(status){
                _desc = _desc.replace(`<status>${status}</status>`,GET.STATUS(status).html);
            }
            if(user.name){
                _desc = _desc.replace(`<username>${username}</username>`,user.name||username);
            }
            
            str += ` <div class="${paddingTop}">
                        <small class="text-muted">${_key}</small>
                        <div>${_desc}</div>
                    </div>`;
        });
        return str;
    },
    defaults: {
        data_maintenance: function(ID,USERNAME,ROLE,SESSION_TOKEN,modalHTML="",initializeArray=[]){
            $(`body`).append(modalHTML);

            function initialize(_urlPath_,key,objectData,callback=()=>{return true;}){

                function addToList(val){
                    var _class_ = (val.delete) ? "text-danger" : "";
                    var _icon_ = [];
                    
                    if(ROLE == "developer"){
                        _icon_.push(`<span class="float-right ml-2 text-danger font-14" style="margin-top: -2px;cursor: pointer;" title="Delete Permanently"><i class="las la-times-circle" _id="${val._id.toString()}" remove-permanently></i></span>`);
                    }
                    if(val.delete){
                        _icon_.push(`<span class="float-right ml-2 font-14" style="margin-top: -2px;cursor: pointer;" title="Undo Delete"><i class="la la-undo" _id="${val._id.toString()}" undo></i></span>`);
                    } else {
                        _icon_.push(`<span class="float-right ml-2 font-14" style="margin-top: -2px;cursor: pointer;" title="Delete"><i class="las la-times-circle" _id="${val._id.toString()}" remove></i></span>`);
                    }

                    return `<div style="border-bottom: 1px solid #eee;" class="p-2 mb-2">
                                <span class="${_class_}" text>${val[key]}</span>
                                ${_icon_.join("")}
                            </div>`;
                }
                $.ajax({
                    url: `/api/${_urlPath_}/${ID}/${USERNAME}/all/${JSON.stringify({})}/0/0`,
                    method: "get",
                    timeout: 90000, // 1 minute and 30 seconds
                    headers: {
                        "Authorization": SESSION_TOKEN
                    },
                    async: true
                }).done(function (docs) {
                    console.log(_urlPath_,docs);
                    var listHTML = "";

                    docs.forEach(val => {
                        listHTML += addToList(val);
                    });

                    $(`#${key}-list`).html(listHTML);
                });
                $(`#${key}-btn`).click(function(){
                    var value = $(`#${key}`).val();

                    if(value._trim() && callback(value)){
                        $(`#${key},#${key}-btn`).attr("disabled",true);
                        $(`#${key}-btn`).html(`<i class="la la-spin la-spinner"></i> Submit`);
                        var obj = {};
                        obj[key] = value;

                        $.ajax({
                            url: `/api/${_urlPath_}/${ID}/${USERNAME}`,
                            method: "post",
                            timeout: 90000, // 1 minute and 30 seconds
                            headers: {
                                "Content-Type": "application/json; charset=utf-8",
                                "Authorization": SESSION_TOKEN
                            },
                            async: true,
                            data: JSON.stringify(obj)
                        }).done(function (result) {
                            $(`#${key},#${key}-btn`).attr("disabled",false);
                            $(`#${key}`).val(``);
                            $(`#${key}-btn`).html(`Submit`);

                            var _obj_ = {  _id: result._id };
                            _obj_[key] = value;
                            $(`#${key}-list`).prepend(addToList(_obj_));
                        });
                    }
                }); 

                $(`#${key}-list`).on('click', `[undo]`,function(e){
                    e.stopImmediatePropagation();

                    var el = $(this);
                    var _id = $(this).attr("_id");
                    
                    $(el).parent().parent().css({"pointer-events":"none","color":"#cecece"});
                    $(el).removeClass().addClass("la la-spin la-spinner");

                    var body = HISTORY.check(objectData(_id),{ delete: false },USERNAME,{
                        excludeKeys: ["history"],
                        fields: [
                            {
                                key: "delete",
                                type: "bool",
                            },
                        ]
                    });
                    $.ajax({
                        url: `/api/${_urlPath_}/${ID}/${USERNAME}/${_id}`,
                        method: "put",
                        timeout: 90000, // 1 minute and 30 seconds
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "Authorization": SESSION_TOKEN
                        },
                        data: JSON.stringify(body),
                        async: true
                    }).done(function (docs) {
                        $(el).parent().parent().replaceWith(addToList(docs.value));
                    });
                });

                $(`#${key}-list`).on('click', `[remove]`,function(e){
                    e.stopImmediatePropagation();

                    var el = $(this);
                    var _id = $(this).attr("_id");
                    
                    $(el).parent().parent().css({"pointer-events":"none","color":"#cecece"});
                    $(el).removeClass().addClass("la la-spin la-spinner");

                    var body = HISTORY.check(objectData(_id),{ delete: true },USERNAME,{
                        excludeKeys: ["history"],
                        fields: [
                            {
                                key: "delete",
                                type: "bool",
                            },
                        ]
                    });
                    $.ajax({
                        url: `/api/${_urlPath_}/${ID}/${USERNAME}/${_id}`,
                        method: "put",
                        timeout: 90000, // 1 minute and 30 seconds
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "Authorization": SESSION_TOKEN
                        },
                        data: JSON.stringify(body),
                        async: true
                    }).done(function (docs) {
                        $(el).parent().parent().replaceWith(addToList(docs.value));
                    });
                });

                $(`#${key}-list`).on('click', `[remove-permanently]`,function(e){
                    e.stopImmediatePropagation();

                    var el = $(this);
                    var _id = $(this).attr("_id");

                    MODAL.CONFIRMATION({
                        content: `Are you sure to delete this record permanently?`,
                        confirmCallback: function(){
                            $(el).parent().parent().css({"pointer-events":"none","color":"#cecece"});
                            $(el).removeClass().addClass("la la-spin la-spinner");
                            $.ajax({
                                url: `/api/${_urlPath_}/${ID}/${USERNAME}/${_id}`,
                                method: "delete",
                                timeout: 90000, // 1 minute and 30 seconds
                                headers: {
                                    "Authorization": SESSION_TOKEN
                                },
                                async: true
                            }).done(function (docs) {
                                $(el).parent().parent().remove();
                            });
                        }
                    });
                });
            }

            initializeArray.forEach(val => {
                initialize(val.urlPath,val.key,val.objectData,val.callback);
            });
        }
    }
};
var PAGE_SETUP = function(){
    $("body").on('click', `#overlay #close`,function(e){
        $(`.daterangepicker`).hide();
        $(this).parents("#overlay").remove();
    });
    $("body").on('click', `#slider-close`,function(e){
        $(`.slider-container`).each((i,el) => {
            $(el).hide("slide", {direction:'right'},100);
        });
    });


    /** (x) button **/
    function tog(v){return v?'addClass':'removeClass';} 
    $(document).on('input', '.clearable', function(){
        $(this)[tog(this.value)]('x');
    }).on('mousemove', '.x', function( e ){
        $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');
    }).on('touchstart click', '.onX', function( ev ){
        ev.preventDefault();
        var value = ($(this).attr("noval")) ? '' : DEFAULT_DATE;
        // if noval has no value, DEFAULT
        // if noval has value, clear default
        // if both has no value, add value to default

        var noVals = "";
        $(`input[noval]`).each(i => {
            if( $($(`input[noval]`)[i]).val()){
                noVals += $($(`input[noval]`)[i]).val();
            }
        });
        if($(this).attr("default") && !noVals.isEmpty()){
            value = '';
        } else if($(this).attr("default") && noVals.isEmpty()){
            value = DEFAULT_DATE;
        } else if($(this).attr("noval") && ($(`input[default]`).val()||"").isEmpty()){
            $(`input[default]`).data('daterangepicker').setStartDate(DEFAULT_DATE);
            $(`input[default]`).data('daterangepicker').setEndDate(DEFAULT_DATE);
            $(`input[default]`).data('daterangepicker').hide();
            $(`input[default]`).removeClass('x onX').val(DEFAULT_DATE).change().blur();
        }
        $(this).data('daterangepicker').setStartDate(DEFAULT_DATE);
        $(this).data('daterangepicker').setEndDate(DEFAULT_DATE);
        $(this).data('daterangepicker').hide();
        $(this).removeClass('x onX').val(value).change().blur();
        
        if (typeof FILTER.CALLBACK === 'function') { FILTER.CALLBACK(); }
    });
    /** END (x) button **/

    // window.onhashchange = function () {
    //     window.history.pushState({}, null, `${window.location.pathname}#${PAGE.GET()}`);
    //     PAGE.GO_TO();
    // }
};
const LOGGER = function(){
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger =  function enableLogger() {
        if(oldConsoleLog == null) return;
        window['console']['log'] = oldConsoleLog;
    };
    pub.disableLogger = function disableLogger(){
        oldConsoleLog = console.log;
        window['console']['log'] = function() {};
    };
    return pub;
}();

class User {
    constructor(user){
        this._username = user._id;
        this._fullName = user.name || "-";
        this._email = user.email || "-";
        this._phoneNumber = user.phoneNumber || "-";
        this._role = user.role  || "user";

        this._active = true;

        this._filters = user.filter || {};
        this._settings = user.settings || {};
    }

    // getter
    get apiKey(){ return Cookies.get("GKEY"); }
    get username(){ return this._username; }

    // getters & setters
    get fullName(){ return this._fullName; }
    set fullName(val){ return this._fullName = val || "-"; }

    get email(){ return this._email; }
    set email(val){ return this._email = val || "-"; }

    get phoneNumber(){ return this._phoneNumber; }
    set phoneNumber(val){ return this._phoneNumber = val || "-"; }

    get role(){ return this._role; }
    set role(val){ return this._role = val || "user"; }

    get dc(){ return this._dc; }
    set dc(val){ return this._dc = val; }

    get filters(){ return this._filters; }
    set filters(val){ return this._filters = val || {}; }

    get settings(){ return this._settings; }
    set settings(val){ return this._settings = val || {}; }

    get active(){ return this._active; }
    set active(val){ return this._active = val; }
}
class ProgressBar{
    constructor(count){
        this._minWidth = 1;
        this._maxWidth = 1;
        this._origPerc = 0;
        this._totalPerc = 0;
        this.count = count;

        // initialize loading bar
        $("div.tbl-progress-bar").html(this.html()).css({position:"absolute",left:"0px",bottom:"-6px",width:"160px",height:"20px"});
        // console.log($("div.tbl-progress-bar").html());
        $('#progress-striped .progress-bar, #progress-striped-active .progress-bar').progressbar({
            display_text: 'fill'
        });
    }

    get minWidth(){ return this._minWidth; }
    set minWidth(val){ this._minWidth = val; }

    get maxWidth(){ return this._maxWidth; }
    set maxWidth(val){ this._maxWidth = val; }

    get origPerc(){ return this._origPerc; }
    set origPerc(val){ this._origPerc = val; }

    get totalPerc(){ return this._totalPerc; }
    set totalPerc(val){ this._totalPerc = val; }

    calculate(){
        // console.log(this.count);
        var a = this.count/LIMIT;
        var wholeNumber = Math.floor(a);
        var modulo = a % 1;
        if(modulo > 0) wholeNumber++
        (this.origPerc) ? null : this.origPerc = (100 / wholeNumber);
        this.totalPerc = this.totalPerc + this.origPerc;

        console.log(this.origPerc,this.totalPerc, this.minWidth, this.maxWidth);

        this.minWidth = this.maxWidth;
        this.maxWidth = Math.floor(this.totalPerc);
        this.move();

        return this.maxWidth;
    }
    move(){
        const _this = this;

        var i = 0;

        if (i == 0) {
            i = 1;
            var elem = $(`#progress-striped-active .progress-bar`);
            var id = setInterval(frame, 10);
            function frame() {
                if (_this.minWidth >= _this.maxWidth) {
                    clearInterval(id);
                    i = 0;
                    TABLE.FINISH_LOADING.START_CHECK();
                } else {
                    _this.minWidth++;
                    $(elem).css("width",`${_this.minWidth}%`).html(`${_this.minWidth}%`);
                }
            }
        }
    }
    reset(){
        this._minWidth = 1;
        this._maxWidth = 1;
        this._origPerc = 0;
        this._totalPerc = 0;
    }
    html(){
        return `<div id="progress-striped-active" class="progress progress-striped active" style="width: 100%;">
                    <div class="progress-bar progress-bar-success" data-transitiongoal="0"></div>
                </div>`;
    }
}

function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
function exportTableToExcel(filename) {
    // get table
    var table = document.getElementById("report-hidden");
    // convert table to excel sheet
    var wb = XLSX.utils.table_to_book(table, {sheet:"Customer Report"});
    // write sheet to blob
    var blob = new Blob([s2ab(XLSX.write(wb, {bookType:'xlsx', type:'binary'}))], {
        type: "application/octet-stream"
    });
    // return sheet file
    return saveAs(blob, `${filename}.xlsx`);
}