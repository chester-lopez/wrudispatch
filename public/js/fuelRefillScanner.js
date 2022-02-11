(ENVIRONMENT == "development") ? null : LOGGER.disableLogger();

WEBSOCKET.connect().then(() => {

    SESSION_FROM_DB(function(){
        new fuelRefillScanner().homeScreen();
    },function(){
    
        USER = new login();
        USER.getToken();
    });
});


class login {
    constructor() {

        // GGS Token
        this.apiKey = null;

        // username
        this.username = 'wru_dev';
        this.password = 'wplof4521amc';

        this.containerWidth = window.matchMedia("only screen and (max-width: 760px)").matches ? '100%' : '50%';
    }

    view(){
        const self = this;

        const btnCss = 'width: 80%;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 50px;margin: 15px auto;display: block;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: inherit;position: fixed;margin-top: 20px;">
                    <div style="width: 270px;margin: 20px auto 80px;">
                        <input type="text" id="username" placeholder="Username" style="width: 100%;height: 55px;font-size: 20px;padding: 10px;">
                        <input type="text" id="password" placeholder="*****" style="width: 100%;height: 55px;font-size: 20px;padding: 10px;">
                        <button id="submit" style="${btnCss}" class="btn">Submit</button>
                    </div>
                </div>
            </div>
        `);

        $('#submit').click(function(){
            const username = $('#username').val();
            const password = $('#password').val();

            // save username
            self.username = username;

            self.getToken( password );
        });
    }

    getToken( password ){

        const self = this;

        $.ajax({ 
            url: `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/tokens`, 
            method: "POST", 
            timeout: 90000, 
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ "password": self.password, "username": self.username }),
            async: true
        }).done(function (response) {
            const token = response.token;

            // save token
            self.apiKey = token;
            Cookies.set(`GKEY`,token,{expires: 30});

            // save user session
            self.saveSession();

        }).fail(function(error){
            console.log("Error:",error);
            if(error.status == 401){
                alert('Incorrent username or password');
            } else if(error.status == 503){
                alert('Service Unavailable');
            } else {
                alert('Internal server error. Please try again later');
            }
            $(`#submit`).html(`LOGIN`).attr("disabled",false);
        });
    }

    saveSession(){

        const self = this;
        
        // expiry date
        const date = new Date();
              date.setDate(date.getDate() + 30);

        const ipResponse = {};

        $.ajax({ 
            url: `/api/login/${CLIENT.id}`, 
            method: "POST", 
            timeout: 90000, 
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": SESSION_TOKEN
            },
            data: JSON.stringify({
                apiKey: self.apiKey, 
                username: self.username,
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
            // save session token
            Cookies.set('session_token', docs.token, {expires: 30});
            SESSION_TOKEN = docs.token;

            // remove loading image
            $("#body-main").remove();

            new fuelRefillScanner().homeScreen();
        }).fail(function(error){
            console.log("Error:",error);
            toastr.error("Something went wrong</br></br>Error Code - ec001/01");
        });
    }


}



class fuelRefillScanner {
    constructor() {
        // Vehicle
        this.vehicle_id = null;
        this.plate_number = null;

        // Volume
        this.volume = 0;
        
        // Timestamp refill was sent
        this.timestamp = null;

        this.containerWidth = window.matchMedia("only screen and (max-width: 760px)").matches ? '100%' : '50%';
    } 

    homeScreen(){

        const self = this;

        const btnCss = 'width: 100%;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 70px;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: inherit;position: fixed;bottom: 0;">
                    <div style="width: 270px;margin: 20px auto 80px;">
                        <button id="enter-platenum" style="${btnCss}" class="btn">Enter plate number</button>
                        <div style="margin: 20px auto;width: 20px;font-size: 20px;color: white;font-weight: 100;">OR</div>
                        <button id="scan-qr" style="${btnCss}" class="btn">Scan QR Code</button>
                    </div>
                </div>
            </div>
        `);

        // Enter Plate Number Button Listener
        $('#enter-platenum').click(function(){
            self.enterPlateNumberScreen();
        });

        // Scan QR Code Button Listener
        $('#scan-qr').click(function(){
            self.qrScreen();
        });
    }

    enterPlateNumberScreen( plate_number ) {

        const self = this;

        const btnCss = 'width: 80%;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 50px;margin: 15px auto;display: block;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: inherit;position: fixed;margin-top: 20px;">
                    <div style="width: 270px;margin: 20px auto 80px;">
                        <input type="text" id="plate_number" placeholder="Enter plate number" value="${plate_number||''}" style="width: 100%;height: 55px;font-size: 20px;padding: 10px;">
                        ${ plate_number ? '<div style="color: #b51515;font-size: 15px;">Plate number does not exist</div>' : '' }
                        <button id="submit" style="${btnCss}" class="btn">Submit</button>
                        <button id="home" style="${btnCss}" class="btn">Home</button>
                    </div>
                </div>
            </div>
        `);
        

        // Automatic Uppercase
        $('#plate_number').keyup (function () {
            return $(this).val(this.value.toUpperCase());
        });

        // Submit Button Listener
        $('#submit').click(function(){
            self.checkVehicleExists( 1, $('#plate_number').val() );
        });

        // Home Button Listener
        $('#home').click(function(){
            new fuelRefillScanner().homeScreen();
        });
    }

    qrScreen( vehicle_id ) {

        const self = this;

        // Add UI
        const btnCss = 'width: 216px;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 50px;margin: 15px auto;display: block;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: inherit;position: fixed;bottom: 20px;">
                    ${ vehicle_id ? '<div style="color: #b51515;font-size: 15px;width: 90%;margin: auto;">Plate number does not exist</div>' : '' }
                    <div id="qr-reader" style="width: 90%; position: relative; padding: 0px; border: 1px solid silver;background-color: white;margin: auto;border-radius: 10px;"></div>
                    <button id="home" style="${btnCss}" class="btn">Home</button>
                </div>
            </div>
        `);
            
            
        // QR Code Scanner
        function onScanSuccess(decodedText, decodedResult) {
            console.log(`Code scanned = ${decodedText}`, decodedResult);

            // Clear canvas (also stops the infinite loop)
            html5QrcodeScanner.clear();

            // Check if vehicle exists
            self.checkVehicleExists( 2, decodedText );
        }
        var html5QrcodeScanner = new Html5QrcodeScanner( "qr-reader", { fps: 10, qrbox: 250 });
        html5QrcodeScanner.render(onScanSuccess);

        // Home Button Listener
        $('#home').click(function(){
            new fuelRefillScanner().homeScreen();
        });
    }

    // Check if Vehicle ID Exists
    checkVehicleExists( checkType, plate_number ){

        const self = this;

        self.loadingScreen( 'Checking plate number' );
        console.log('Checking...');
        
        $.ajax({
            // USER IS NULL ------------------------------------------------------ USER.username
            url: `/api/vehicles/${CLIENT.id}/${USER.username}/all/${JSON.stringify({'name': plate_number })}/0/0`,
            method: "get",
            timeout: 90000, // 1 minute and 30 seconds
            headers: {
                "Authorization": SESSION_TOKEN
            },
            async: true
        }).done(function (docs) {
            console.log('Vehicle docs',docs);

            if( docs.length > 0 ){
                
                // set vehicle_id
                self.vehicle_id = docs[0]._id;

                // set vehicle name or plate number
                self.plate_number = docs[0].name;

                self.enterVolumeScreen();
            } else {
                if(checkType == 1){
                    self.enterPlateNumberScreen( plate_number );
                } else {
                    self.qrScreen( true );
                }
            }
        }).catch(error => {
            console.log('Vehicle Error',error);

            self.errorScreen();
        });
    }

    // Checking or Loading(Submit)
    loadingScreen( text ) {

        const self = this;

        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: 100%;margin-top: 30px;">
                    <div style="width: max-content;margin: auto;text-align: center;">
                        <i class="la la-spin la-spinner" style="font-size: 130px;color: #97c15b;"></i>
                        <div style="font-size: 20px;color: white;margin-top: 10px;">${text}</div>
                    </div>
                </div>
            </div>
        `);
    }

    enterVolumeScreen() {

        const self = this;

        const btnCss = 'width: 80%;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 50px;margin: 15px auto;display: block;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: inherit;position: fixed;margin-top: 20px;">
                    <div style="width: 270px;margin: 20px auto 80px;">
                        <div style="font-size: 20px;color: white;margin-bottom: 8px;">Plate Number: <b>${self.plate_number}</b></div>
                        <input type="text" id="volume" placeholder="Enter fuel volume (Number)" style="width: 100%;height: 55px;font-size: 20px;padding: 10px;">
                        <button id="submit" style="${btnCss}" class="btn">Submit</button>
                    </div>
                </div>
            </div>
        `);

        // Only allow numeric
        $("#volume").on('keypress', function (e) {
            return e.metaKey || e.which <= 0 || e.which == 8 || e.which == 46 || /[0-9]/.test(String.fromCharCode(e.which));
            //      cmd/ctrl ||  arrow keys  ||   delete key ||   dot key     || numbers
        })

        // Submit Button Listener
        $('#submit').click(function(){

            const volume = Number($('#volume').val());

            if(volume > 0){
                // set volume
                self.volume = volume;
    
                self.sendRefillData();
            }
        });
    }

    sendRefillData(){

        const self = this;

        self.loadingScreen( 'Submitting...' );

        self.timestamp = new Date().toISOString();

        const vehicle_id = Number(self.vehicle_id);
        const timestamp = self.timestamp.split('.')[0];
        const volume = Number(self.volume);

        // DOUBLE CHECK FOR DUPLICATE ENTRIES
        $.ajax({
            url: `https://${CLIENT.ggsURL}/comGpsGate/api/v.1/applications/${CLIENT.appId}/users/${vehicle_id}/fuelconsumption`,
            method: "post", 
            timeout: 90000 ,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": USER.apiKey
            },
            data: JSON.stringify({
                "id": 0, // automatically set by WRU Main
                "userId": vehicle_id,
                "refilledOn": timestamp,
                "volume": volume
            }),
            async: true
        }).done(()=>{
            self.refillSentScreen();
        }).fail(error=>{
            console.log('Result Error',error);
            self.errorScreen();
        });
    }

    refillSentScreen(){

        const self = this;
        
        const btnCss = 'width: 80%;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 50px;margin: 15px auto;display: block;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: 100%;margin-top: 20px;">
                    <div style="width: max-content;margin: auto;text-align: center;">
                        <i class="la la-check" style="font-size: 100px;color: #97c15b;"></i>
                        <div style="font-size: 20px;color: white;margin-top: 10px;">Refill sent!</div>
                        <div style="font-size: 20px;color: white;width: 100%;margin: 20px auto 0;border: 1px solid white;border-radius: 6px;padding: 10px;text-align: left;">
                            <div>Date &amp; Time: <b>${moment(self.timestamp).format('MMM DD, YYYY, hh:mm A')}</b></div>
                            <div>Plate Number: <b>${self.plate_number}</b></div>
                            <div>Volume: <b>${self.volume}</b></div>
                        </div>
                    </div>
                </div>
                <div style="width: inherit;position: fixed;bottom: 15px;">
                    <div style="width: 270px;margin: 20px auto;">
                        <button id="home" style="${btnCss}" class="btn">Home</button>
                    </div>
                </div>
            </div>
        `);
        

        // Home Button Listener
        $('#home').click(function(){
            new fuelRefillScanner().homeScreen();
        });
    }

    errorScreen(){

        const self = this;

        const btnCss = 'width: 80%;background-color: #97c15b;font-weight: bold;font-size: 20px !important;height: 50px;margin: 15px auto;display: block;';
        $('body').html(`
            <div style="background-color: #4c4c4c;width: ${self.containerWidth};height: 100%;margin: auto;min-width: 300px;">
                <img src="public/img/logo-gfm.png" style="width: 200px;margin: auto;display: block;padding: 50px 0px 20px;">
                <div style="width: 100%;margin-top: 30px;">
                    <div style="width: max-content;margin: auto;text-align: center;">
                        <i class="la la-times" style="font-size: 130px;color: #b51515;"></i>
                        <div style="font-size: 20px;color: white;margin-top: 10px;">Error</div>
                    </div>
                </div>
                <div style="width: inherit;position: fixed;bottom: 15px;">
                    <div style="width: 270px;margin: 20px auto;">
                        <button id="retry" style="${btnCss}" class="btn">Retry</button>
                        <button id="home" style="${btnCss}" class="btn">Home</button>
                    </div>
                </div>
            </div>
        `);
        
        

        // Home Button Listener
        $('#home').click(function(){
            new fuelRefillScanner().homeScreen();
        });

        // Retry Button Listener
        $('#retry').click(function(){
            self.sendRefillData();
        });
    }
}