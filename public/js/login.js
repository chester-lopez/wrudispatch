(ENVIRONMENT == "development") ? null : LOGGER.disableLogger();
WEBSOCKET.connect().then(() => {
    SESSION_FROM_DB(function(){
        location.href = `../${CLIENT.name}`;
    },function(){
        // remove loading image
        $("#body-main").remove();
        // display login form
        $("#wrapper").show();
        $(`#wrapper`).attr({"style":`background:url(../public/img/${CLIENT.id}-bg.jpg) no-repeat;background-size: cover;`});


        GENERATE.HIDESHOWPASSWORD(`#password`);
        $(`#submit`).click(function(e){
            e.preventDefault();
            var username = $(`#username`).val()._trim().toLowerCase(),
                password = $(`#password`).val()._trim();
            if(username.trim() == "" || password.trim() == ""){
                $(`#error`).html(ALERT.HTML.ERROR("Username or password is empty.","ml-0 mr-0 mt-2 mb-3",true));
                toastr.error("Username or password is empty");
            } else {
                $(`#submit`).html(`<i class="la la-spinner la-spin"></i>LOGIN`).attr("disabled",true);
                $.ajax({ 
                    url: `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/tokens`, 
                    method: "POST", 
                    timeout: 90000, 
                    headers: {
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({"password":password,"username":username}),
                    async: true
                }).done(function (response) {
                    var apiKey = response.token,
                        saveSession = function(ipResponse){
                            var date = new Date();
                            date.setDate(date.getDate() + 30);

                            $.ajax({ 
                                url: `/api/login/${CLIENT.id}`, 
                                method: "POST", 
                                timeout: 90000, 
                                headers: {
                                    "Content-Type": "application/json; charset=utf-8",
                                    "Authorization": SESSION_TOKEN
                                },
                                data: JSON.stringify({
                                    apiKey, 
                                    username,
                                    timestamp: (new Date()).toISOString(),
                                    expiry: date.toISOString(),
                                    device_info: {
                                        browser: GET.BROWSER(),
                                        device: (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1) ? "mobile" : "pc",
                                        metadata:{
                                            city:ipResponse.city || "Unknown",
                                            country:ipResponse.country || "Unknown",
                                            region:ipResponse.region || "Unknown",
                                            ip:ipResponse.ip || "Unknown",
                                            org:ipResponse.org || "Unknown",
                                        },
                                        platform: navigator.platform,
                                    }
                                }),
                                async: true
                            }).done(function (docs) {
                                Cookies.set(`session_token`,docs.token,{expires: 30});
                                location.href = `../${CLIENT.name}`;
                            }).fail(function(error){
                                console.log("Error:",error);
                                $(`#submit`).html(`LOGIN`).attr("disabled",false);
                                toastr.error("Something went wrong</br></br>Error Code - ec001/01");
                            });
                        };

                    Cookies.set(`GKEY`,apiKey,{expires: 30});
                    if(apiKey){
                        $.ajax({ 
                            url: "https://ipinfo.io?token=92bde40026acde", 
                            method: "GET", 
                            timeout: 6000,
                            async: true
                        }).done(function (docs) {
                            saveSession(docs);
                        }).fail(function(error){
                            saveSession({});
                        });
                    } else {
                        $(`#submit`).html(`LOGIN`).attr("disabled",false);
                        toastr.error("Something went wrong</br></br>Error Code - ec001/02");
                    }
                }).fail(function(error){
                    console.log("Error:",error);
                    if(error.status == 401){
                        $(`#error`).html(ALERT.HTML.ERROR("Incorrect username or password.","ml-0 mr-0 mt-2 mb-3",true));
                    } else if(error.status == 503){
                        $(`#error`).html(ALERT.HTML.ERROR("Service Unavailable.","ml-0 mr-0 mt-2 mb-3",true));
                    } else {
                        $(`#error`).html(ALERT.HTML.ERROR("Internal server error. Please try again later.","ml-0 mr-0 mt-2 mb-3",true));
                    }
                    $(`#submit`).html(`LOGIN`).attr("disabled",false);
                });
            }
        });
    });
});