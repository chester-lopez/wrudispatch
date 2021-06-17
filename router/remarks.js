const express = require('express');
const router = express.Router();

const db = require("../utils/db");
const _ERROR_ = require("../utils/error");

function dispatchAggregate(filter){
    return [
        {
            $match: filter,
        },
        // { 
        //     $lookup: {
        //         from: "notifications",
        //         let: {
        //             dispatch_id: "$_id",
        //             username: "$username",
        //         },
        //         pipeline: [
        //             {
        //                 $match: {
        //                     $expr: {
        //                         $and: [
        //                             {
        //                                 $eq: ["$$dispatch_id","$dispatch_id"]
        //                             },
        //                             {
        //                                 $eq: ["$$username","$username"]
        //                             },
        //                             {
        //                                 $eq: [code,"$code"]
        //                             }
        //                         ]
        //                     }
        //                 }
        //             }
        //         ],
        //         as: "_notifications",
        //     }
        // },
        // { $unwind: "$_notifications" },
        { 
            $lookup: {
                from: 'geofences',
                localField: 'origin_id',
                foreignField: '_id',
                as: '_origin',
            }
        },
        { $unwind: { path: "$_origin", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'geofences',
                localField: 'destination.0.location_id',
                foreignField: '_id',
                as: '_destination',
            }
        },
        { $unwind: { path: "$_destination", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'routes',
                localField: 'route',
                foreignField: '_id',
                as: '_route',
            }
        },
        { $unwind: { path: "$_route", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'clusters',
                let: { 
                    origin: "$_origin", 
                },
                pipeline: [
                    {
                        $match: { 
                            $expr: { 
                                $eq: ["$_id","$$origin.cluster_id"]
                            } 
                        }
                    },
                ],
                as: '_cluster',
            }
        },
        { $unwind: { path: "$_cluster", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'regions',
                let: { 
                    origin: "$_origin", 
                },
                pipeline: [
                    {
                        $match: { 
                            $expr: { 
                                $eq: ["$_id","$$origin.region_id"]
                            } 
                        }
                    },
                ],
                as: '_region',
            }
        },
        { $unwind: { path: "$_region", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'vehicles',
                localField: 'vehicle_id',
                foreignField: '_id',
                as: '_vehicle',
            }
        },
        { $unwind: { path: "$_vehicle", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'trailers',
                localField: 'trailer',
                foreignField: '_id',
                as: '_trailer',
            }
        },
        { $unwind: { path: "$_trailer", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'users',
                localField: 'username',
                foreignField: '_id',
                as: '_user',
            }
        },
        { $unwind: { path: "$_user", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'vehicle_personnel',
                localField: 'driver',
                foreignField: '_id',
                as: '_driver',
            }
        },
        { $unwind: { path: "$_driver", preserveNullAndEmptyArrays: true } },
        { 
            $lookup: {
                from: 'vehicle_personnel',
                localField: 'checker',
                foreignField: '_id',
                as: '_checker',
            }
        },
        { $unwind: { path: "$_checker", preserveNullAndEmptyArrays: true } },
    ];
}

router.get('/:dbName/:filter', (req,res,next)=>{
    const dbName = req.params.dbName;
    const filter = JSON.parse(req.params.filter);

    const query = db.getCollection(dbName,"dispatch").aggregate(dispatchAggregate(filter));

    query.toArray((err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            query.close();
            res.json(docs);
        }
    });
});

// put
router.put('/:dbName/:username/:_id', (req,res,next)=>{
    const dbName = req.params.dbName;
    const _id = req.params._id;
    const userInput = req.body;

    db.getCollection(dbName,"dispatch").findOneAndUpdate({ _id },{ $set: userInput },(err,docs)=>{
        if(err) next(_ERROR_.INTERNAL_SERVER(err));
        else {
            const query = db.getCollection(dbName,"dispatch").aggregate(dispatchAggregate({ _id }));

            query.toArray((err,docs)=>{
                if(err) next(_ERROR_.INTERNAL_SERVER(err));
                else {
                    query.close();
                    res.json({ok:1,docs});
                }
            });
        }
    });
});

module.exports = router;