const check = (filter) => {
    return new Promise((resolve,reject) => {
        if(Object.keys(filter).length === 0){
            // will not do anything
            reject({
                details: "Empty filter"
            });
        } else {
            resolve();
        }
    });
};
const set = (filter,options={}) => {
    return new Promise((resolve,reject) => {
        if(typeof filter != "object"){
            filter = {};
        }
        if(Object.keys(filter).length === 0){
            if(options.condition){
                if(options.defaultValue == "date"){
                    var start = new Date();
                    start.setHours(0,0,0,0);
        
                    var end = new Date();
                    end.setHours(23,59,59,999);
        
                    filter[options.key] = {
                        '$gte': start.toISOString(),
                        '$lt': end.toISOString(),
                    };
                }
            }
            if(Object.keys(filter).length === 0){
                reject({
                    details: "Empty filter"
                });
            } else {
                resolve(filter);
            }
        } else {
            resolve(filter);
        }
    });
};

module.exports = {check,set};