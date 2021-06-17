const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const db = require("./utils/db");
const storage = require("./utils/storage");
const auth = require("./utils/auth");
const changestream = require("./utils/changestream");
const _ERROR_ = require("./utils/error");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
  
// apply to all requests
// app.use(limiter);

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 10000 }));
app.use('/public', express.static(path.join(__dirname,'public')));
app.set("view engine","ejs");

/***** PAGE *****/
// DON'T FORGET TO CHANGE DB URL
const ENVIRONMENT = "production"; // development | production
const lTitle = "WRU Dispatch | Login";
const mTitle = "WRU Dispatch";
const setup = function(id,page,res,ENVIRONMENT,title){
    const CLIENT = auth.getClient(id);
    
    storage.initializeBucket(CLIENT.dsName);
    console.log(" ");

    res.render(page, {ENVIRONMENT,title});
};

app.get('/',(req,res)=>{ res.render("404", {title: mTitle}); });
app.get('/remarks',(req,res)=>{ setup("coket1","linkRemarks",res,ENVIRONMENT,mTitle); });
app.get('/CokeT1/login',(req,res)=>{ setup("coket1","login",res,ENVIRONMENT,lTitle); });
app.get('/CokeT1',(req,res)=>{ setup("coket1","main",res,ENVIRONMENT,mTitle); });
app.get('/Wilcon/login',(req,res)=>{ setup("wilcon","login",res,ENVIRONMENT,lTitle); });
app.get('/Wilcon',(req,res)=>{ setup("wilcon","main",res,ENVIRONMENT,mTitle); });
app.get('/CokeT2/login',(req,res)=>{ setup("coket2","login",res,ENVIRONMENT,lTitle); });
app.get('/CokeT2',(req,res)=>{ setup("coket2","main",res,ENVIRONMENT,mTitle); });
/***** END PAGE *****/

/***** ROUTER *****/
var secretkey = "secretKey";
function verifyToken(req, res, next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearerToken = bearerHeader.split(" ")[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403); // forbidden
    }
}
app.post(`/api/login/:dbName`, (req,res,next) => {
    const dbName = req.params.dbName;
    const userInput = req.body;
    const username = userInput.username;
    const user = {
        username,
        dbName
    };

    jwt.sign({user: user}, secretkey, (err, token) => {
        userInput._id = token;
        
        db.getCollection(dbName,"sessions").insertOne(userInput,(err,result)=>{
            if(err){
                res.sendStatus(500);
            } else {
                db.getCollection(dbName,"sessions_active").insertOne({_id: token, last_active_timestamp: new Date().getTime() },(err,result)=>{
                    if(err){
                        res.sendStatus(500);
                    } else {
                        db.getCollection(dbName,"users").find({_id: username}).count({}, function(err, numOfDocs){
                            if(err) res.sendStatus(500);
                            
                            userInput.device_info = userInput.device_info || {};
                            userInput.device_info.metadata = userInput.device_info.metadata || {};
                            var metadata = userInput.device_info.metadata;
                            var activity = {
                                _id: token,
                                username,
                                login_date: userInput.timestamp,
                                location: `${metadata.city||""}, ${metadata.region||""}, ${metadata.country||""}`,
                                ip: metadata.ip,
                            };
                            db.getCollection(dbName,"user_login_activity").insertOne(activity,(err,result)=>{
                                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                                else {
                                    if(numOfDocs > 0){
                                        res.json({ token });
                                    } else {
                                        var userData = {_id:username,role:"user"};
                                        db.getCollection(dbName,"users").insertOne(userData,(err,result)=>{
                                            if(err){
                                                var error = (err.name=="MongoError" && err.code==11000) ? _ERROR_.DUPLICATE("Username") : _ERROR_.INTERNAL_SERVER(err);
                                                next(error);
                                            } 
                                            else res.json({ token });
                                        });
                                    }
                                }
                            });
                        });
                    }
                });
            }
        });
    });
});
app.post(`/api/verifyToken/:dbName`, (req,res,next) => {
    const dbName = req.params.dbName;
    const userInput = req.body;
    const token = userInput.token;
    // verify a token symmetric
    jwt.verify(token, secretkey, function(err, decoded) {
        if(err) res.json({error: 1});
        else {
            var user = decoded.user;
            if(user.dbName == dbName){
                var aggregate = [
                    {
                        $match: {_id: token}
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "username",
                            foreignField: "_id",
                            as: "userDetails",
                            
                        }
                    },
                    { $unwind: "$userDetails" },
                    // {
                    //     $match: {
                    //         _id: user.username
                    //     }
                    // },
                    {
                    $lookup: {
                        from: "geofences",
                        let: {
                        username: user.username
                        },
                        pipeline: [
                        {
                            $addFields: {
                            _dispatcher: {$ifNull: ['$dispatcher', []] }
                            }
                        },
                        {
                            $match: {
                            $expr: {
                                $cond: [
                                {
                                    $in: [
                                        "$$username", 
                                        "$_dispatcher"
                                    ]
                                },
                                "$short_name",
                                null
                                ]
                            }
                            }
                        }
                        ],
                        as: "dispatcherDetails",
                    }
                    },
                    { $unwind: { path: "$dispatcherDetails", preserveNullAndEmptyArrays: true } },
                    {
                        $lookup: {
                            from: "notifications",
                            // localField: "username",
                            // foreignField: "username",
                            let: {
                                username: user.username
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $cond: [
                                                {
                                                    $eq: [
                                                        "$$username", 
                                                        "$username"
                                                    ]
                                                },
                                                "true",
                                                null
                                            ]
                                        }
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$read"
                                    }
                                }
                            ],
                            as: "notificationExists",
                        }
                    },
                ];
                db.getCollection(dbName,"temp_sessions").deleteOne({_id:token}).then(()=>{
                    db.getCollection(dbName,"sessions").aggregate(aggregate).toArray((err,docs)=>{
                        if(err) next(_ERROR_.INTERNAL_SERVER(err));
                        else res.json(docs);
                    });
                });
            } else {
                res.json({error: 1});
            }
        }
    });
});
app.use(`/api/sessions`, verifyToken, require("./router/sessions"));
app.use(`/api/sessions_active`, verifyToken, require("./router/sessions_active"));
app.use(`/api/dispatch`, verifyToken, require("./router/dispatch"));
app.use(`/api/users`, verifyToken, require("./router/users"));
app.use(`/api/regions`, verifyToken, require("./router/regions"));
app.use(`/api/clusters`, verifyToken, require("./router/clusters"));
app.use(`/api/geofences`, verifyToken, require("./router/geofences"));
app.use(`/api/routes`, verifyToken, require("./router/routes"));
app.use(`/api/vehicles`, verifyToken, require("./router/vehicles"));
app.use(`/api/vehicles_history`, verifyToken, require("./router/vehicles_history"));
app.use(`/api/vehicles_section`, verifyToken, require("./router/vehicles_section"));
app.use(`/api/vehicles_company`, verifyToken, require("./router/vehicles_company"));
app.use(`/api/vehicle_personnel`, verifyToken, require("./router/vehicle_personnel"));
app.use(`/api/vehicle_personnel_section`, verifyToken, require("./router/vehicle_personnel_section"));
app.use(`/api/vehicle_personnel_company`, verifyToken, require("./router/vehicle_personnel_company"));
app.use(`/api/trailers`, verifyToken, require("./router/trailers"));
app.use(`/api/events`, verifyToken, require("./router/events"));
app.use(`/api/notifications`, verifyToken, require("./router/notifications"));
app.use(`/api/user_login_activity`, verifyToken, require("./router/user_login_activity"));
app.use(`/api/user_action`, verifyToken, require("./router/user_action"));
app.use(`/api/shift_schedule`, verifyToken, require("./router/shift_schedule"));

app.use(`/api/remarks`, require("./router/remarks"));
// app.use(`/api/dispatch_anon`, require("./router/dispatch_anonymous"));
/***** END ROUTER *****/

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authentication");
    next();
});

app.use((err,req,res,next)=>{
    console.log(err);
    res.status(err.status).json({
        error: {
            message: err.message
        }
    });
});

storage.initialize();

// connect app to db
db.connect((err) => {
    if(err){
        console.log('Unable to connect to database');
        process.exit(1);
    } else {
        const server = http.listen(process.env.PORT || 3000, () => {
            const host = server.address().address;
            const port = server.address().port;

            changestream.connect(io);
            
            console.log(`App listening at http://${host}:${port}`)
        });

        // // When Server starts listening
        // server.on('listening',()=>{
        //     console.log('Captured listening event');
        // });
        
        // // When User tries to connect to server
        // server.on('connection', ()=>{
        //     console.log('Connection Established');
        // });
        
        // // When the server is closed
        // server.on('close', ()=>{
        //     console.log('Connection terminated - XOXO.');
        // });

        // setTimeout(function(){
        //     server.close();
        // },10000);
    }
});