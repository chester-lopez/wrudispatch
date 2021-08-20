const fs = require('fs');
const {Storage} = require('@google-cloud/storage');

var storage = null,
    bucket = null,
    bucketName = null,
    dir = "/tmp";

const initialize = () => {
    storage = new Storage({
        credentials: {
            "type": "service_account",
            "project_id": "secure-unison-275408",
            "private_key_id": "fe24c3779352313011bff7eb38404083422951e0",
            "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDB0udJE9SZZELg\nM37jkC//mjgu7q1QAEBZ2XRhSdn1DPBYSGgPIWBoYWVdTVgwNxL/9eNowu6oOG/4\nFDuOZBXFBkZmoXIVyYzUA/GaWxW/ikieJ+9woSap8Sre71uZhv1x7235ljHhL7m7\nBTAfX6kxU8Rs8JC5Knn9hW3I4bXuZa4L+uBc5oaT7eRByscMjseXVilwZARDuR4f\nMk7rLvI6d8lY9fIJ/la5SWYdsjKUAQ+w6EhJ+fnH+ufi3rEt7aDOo2xxXhYwMWuS\njHF+LJNOV0vR5wp9h6yw/+ySoT2nL38mQMwEZv/k6405uTxt7Sak1vcUK8EGb8fo\nPYtBwiaRAgMBAAECggEACwML6RLjb4fqz8OajYcYibBYnvv9pJpbDZpv764V4BkJ\nLQQyG01KuwDGP501vzQwfr0uMM/Fu5DMoGl/3Q4SeY7qyt5tyvntknHF6n6LIgZ9\n1onPeKnt4SuxQ0NnRCCkqhzlCzrYCyKebgHJszfzYXjQTl3YOcOayjH9joiaVkNf\nBGjoYdJNEM6nVkK1mFeZRNQiUjSlHOYnbTwyzAqIXN0Y73kl4Y1I3CCozAtgevw7\nZApl1idf5pnOXb8qMr06RhWOIkpl0VSXRqRnOYqD2Rq7jKUVBYO33F+49G0josQ8\nIQZgeWlm5ENh03DmDzn6YXSUouchpTLAAl70IkzNdQKBgQD26Ia0I5lqBdkdzdtX\nz2thILzXQLwONCZRSkeIdjvkTSfKvi5fdy7HjA2iUZWgOQW4A4mkOvWJHpcdB0ac\nFmXctuz52+RfLvGjvBMNKN62qTN666WbFU8FOft7YMcqkhZHWkrbdJue4uVQFcVO\npMkp7hjFrdcwSBTh0+w2+MxttQKBgQDI9fpoDAl4lhlNlVow27BiXyYkWA0rDMyY\nGt8YpbUwJpZcZzhCTnsT/KbTaFxFR7XYrOuOFRxIU+FCZngqx2n+nYIlJ41/Q5d1\nKA5FUr/elbvDa6zegFTunniBS74lCKDn0WFimV8JO2RrhvdWfslFMOAvf6jExInm\nmpjPaWv+7QKBgQCRFM7aGLTzvJ34SlbhgQq6ls7/uJUHz5LYX0orIDZPDxsboaaE\nB/cf3+a/Aytlazw2BTYin1ZZjPUEZJsT6oFOMNqMcq39VAs+x6t2Jxa+xCtwxfiY\naOv2yTxBIfvFwvN+V8r2qs0qjm5qIXC/pkph7fr2ZRC12RUUIT+Cia0tpQKBgDKa\ntlazCUODUJXX0SFSgOUUnq8yOQapL2/x/FHhkHGyldRo7aLMznNnAL9lnS6Y8zK/\nwIVDzZ5s+OFWmlXzZz6FfTtL7Xapl58Z2hYc01IClIiOObbBzCFWaHPuldAPjy0w\n7Xv9sQ/LE+t7zhbK0HYK67kqRV5fO3aFYYuBOX+1AoGAH1ST7XsF2prwf24kwtWh\n1BLna2TlhJ6R7odf+q5Pj9kt2BD7o88GJ9Mxgrv1pSyOD1AVNi1xrgm8ueDhba/E\ngoFo4OvHN5uVrselHggSL/47VQJ4QJJMENeJXYBMqmVa4ubXlunq64e0gfM1pXjv\ncu9GYEIJI+0ftrWxnyBZinA=\n-----END PRIVATE KEY-----\n",
            "client_email": "cloudstorage@secure-unison-275408.iam.gserviceaccount.com",
            "client_id": "101797234938420754889",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/cloudstorage%40secure-unison-275408.iam.gserviceaccount.com"
        },
        projectId:"secure-unison-275408"
    });
};
const initializeBucket = (_bucketName) => {
    bucketName = _bucketName;
};
const _storage_ = {
    upload: (attachments) => {
        return new Promise((resolve,reject) => {
            bucket = storage.bucket(bucketName);
            if(attachments && attachments.length > 0){
                var totalAttachments = attachments.length,
                    uploadedAttachments = 0;
                attachments.forEach(function(val){
                    var base64 = (val.base64||"").split(',')[1];
                    if(base64){
                        const fileDataDecoded = Buffer.from(base64, 'base64');
            
                        var filename_for_storage = val.storageFilename.split("/");
                        filename_for_storage = filename_for_storage[filename_for_storage.length-1];
    
                        const filepath = `/tmp/${filename_for_storage}`;
    
                        fs.mkdirSync(dir, { recursive: true }); // create directory if it does not exist yet
                        fs.writeFile(filepath, fileDataDecoded, function(error) {
                            if(error){
                                console.log("Error Write File: ",JSON.stringify(error));
                                isProcessDone();
                            } else {
                                // upload file to google storage
                                bucket.upload(filepath, { destination: decodeURI(val.storageFilename) }, function (error, file) {
                                    if (error) {
                                        console.log("err",JSON.stringify(error));
                                    }
                                    try {
                                        fs.unlinkSync(filepath); // remove file from directory
                                    } catch(error) {
                                        console.log(error);
                                    }
                                    isProcessDone();
                                });
                            }
                        });
                    } else {
                        isProcessDone();
                    }
                    function isProcessDone(){
                        uploadedAttachments++;
                        if(totalAttachments == uploadedAttachments){
                            resolve();
                        }
                    }
                });
            } else {
                resolve();
            }
        });
    },
    deleteFiles: (_id,attachments) => {
        return new Promise((resolve,reject) => {
            bucket = storage.bucket(bucketName);
            
            if(attachments && attachments.length > 0){
                bucket.getFiles({ prefix: `attachments/${_id}`}, function(error, files) {
                    if(error){
                        console.log("Error getting files:",JSON.stringify(error));
                    }
                    for (var i in files) {
                        if(attachments){
                            var isExists = attachments.find(x => { return x.storageFilename == encodeURI(files[i].name); });
                            (isExists) ? null : files[i].delete();
                        } else {
                            files[i].delete();
                        }
                    }
                    resolve();
                });
            } else {
                bucket.deleteFiles({ prefix: `attachments/${_id}`}, function(error, files) {
                    if(error){
                        console.log("Error getting files:",JSON.stringify(error));
                    }
                    resolve();
                });
            }
        });
    }
};
const _attachments_ = {
    filter: (_id,userInput,type,customKey="attachments") => {
        var unset_obj = {};
        var attachments = [];
        if(type == "object"){
            if(userInput[customKey] && Object.keys(userInput[customKey]).length > 0){
                Object.keys(userInput[customKey]).forEach(key => {
                    var list = userInput[customKey][key];
                    list.forEach((val,i) => {

                        var storageFilename = val.storageFilename.replace(/<INSERT_ID_HERE>/g,encodeURI(_id));
                        userInput[customKey][key][i].storageFilename = storageFilename;
                        userInput[customKey][key][i].url += storageFilename;
        
                        attachments.push({
                            base64: val.base64,
                            storageFilename,
                        });
        
                        delete userInput[customKey][key][i].base64;
                    });
                });
            } else {
                delete userInput[customKey];
                unset_obj[customKey] = "";
            }
        } else {
            if(userInput[customKey] && userInput[customKey].length > 0){
                userInput[customKey].forEach(function(val,i){
                    var storageFilename = userInput[customKey][i].storageFilename.replace(/<INSERT_ID_HERE>/g,encodeURI(_id));
                    userInput[customKey][i].storageFilename = storageFilename;
                    userInput[customKey][i].url += storageFilename;
    
                    attachments.push({
                        base64: val.base64,
                        storageFilename,
                    });
    
                    delete userInput[customKey][i].base64;
                });
            } else {
                delete userInput[customKey];
                unset_obj[customKey] = "";
            }
        }
        
        return { userInput, attachments, unset_obj };
    },
    add: (attachments) => {
        return new Promise((resolve,reject) => {
            _storage_.upload(attachments).then(() => {
                resolve();
            }).catch(error => {
                console.log("Error Uploading1: ",JSON.stringify(error));
                reject();
            });
        });
    },
    update: (_id,attachments) => {
        return new Promise((resolve,reject) => {
            _storage_.deleteFiles(_id,attachments).then(() => {
                if(attachments){
                    _storage_.upload(attachments).then(() => {
                        resolve();
                    }).catch(error => {
                        console.log("Error Uploading2: ",JSON.stringify(error));
                        reject();
                    });
                } else {
                    resolve();
                }
            }).catch(error => {
                console.log("Error Deleting: ",JSON.stringify(error));
                reject();
            });
        });
    },
    remove: (_id) => {
        return new Promise((resolve,reject) => {
            _storage_.deleteFiles(_id).then(() => {
                resolve();
            });
        });
    }
};

module.exports = { initialize, _attachments_, initializeBucket };