const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// PRODUCTION
// const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-shard-00-00.tyysb.mongodb.net:27017,wru-shard-00-01.tyysb.mongodb.net:27017,wru-shard-00-02.tyysb.mongodb.net:27017/wru?ssl=true&replicaSet=atlas-d1iq8u-shard-0&authSource=admin&retryWrites=true&w=majority";
// DEVELOPMENT
const url = "mongodb://wru:7t0R3DyO9JGtlQRe@wru-dev-shard-00-00.tyysb.mongodb.net:27017,wru-dev-shard-00-01.tyysb.mongodb.net:27017,wru-dev-shard-00-02.tyysb.mongodb.net:27017/wru-dev?ssl=true&replicaSet=atlas-5ae98n-shard-0&authSource=admin&retryWrites=true&w=majority"
const mongoOptions = {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 100};

var state = {
        db: null,
        client: null,
    },
    collections = {},
    projectInitial = "wd";

const connect = (cb) => {
    if(state.client){
        cb();
    } else {
        MongoClient.connect(url, mongoOptions, (err,client) => {
            if(err){
                cb(err);
            } else {
                state.client = client;
                cb();
            }
        });
    }
};
const getPrimaryKey = (_id) => {
    return ObjectID(_id);
};
const getCollection = (dbName,collection) => {
    var db = `${projectInitial}-${dbName}`;
    (!!collections[`${dbName}${collection}`]) ? null : collections[`${dbName}${collection}`] = state.client.db(db).collection(collection);
    return collections[`${dbName}${collection}`];
};

// get collection from another project/database
const getCollectionOtherDB = (clientId,collection,fullDbName) => {
    const db = fullDbName || `${projectInitial}-${clientId}`;
    // (!!collections[`${db}${collection}`]) ? null : collections[`${db}${collection}`] = state.client.db(db).collection(collection);
    return state.client.db(db).collection(collection);
};

module.exports = {connect,getPrimaryKey,getCollection,getCollectionOtherDB};