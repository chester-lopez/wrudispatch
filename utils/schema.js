
const Joi = require('joi');

const dispatch = () => {
    return Joi.object().keys({
        _id: Joi.string().allow('',null), // shipment_number
        ticket_number: Joi.string().allow('',null),
        scheduled_date: Joi.string().allow('',null),
        shift_schedule: Joi.string().allow('',null),
        origin: Joi.string().allow('',null),
        origin_id: Joi.string().required(),
        route: Joi.string().required(),
        destination: Joi.array().required(),
        vehicle: Joi.object().allow('',null),
        vehicle_id: Joi.number().required(),
        trailer: Joi.string().allow('',null),
        driver_id: Joi.string().allow('',null),
        checker_id: Joi.string().allow('',null),
        helper_id: Joi.string().allow('',null),
        attachments: Joi.array().allow('',null),
        comments: Joi.string().allow(''),
        status: Joi.string().required(),
        posting_date: Joi.string(),
        departure_date: Joi.string().allow('',null),
        username: Joi.string().required(),
        event_time: Joi.object().allow(null),
        events_captured: Joi.object().allow(null),
        vehicleData: Joi.array().allow(null),
        late_entry: Joi.boolean().allow(null),
        version: Joi.string().allow('',null),
        vehicleChanged: Joi.boolean().allow(null),
        selectedCheckIn: Joi.boolean().allow(null),
    });
};
const access = () => {
    return Joi.object().keys({
        _id: Joi.string().required(), // username
        role: Joi.string().required(),
        pages: Joi.array(),
    });
};
const sessions = () => {
    return Joi.object().keys({
        _id: Joi.string().required(), // token
        apiKey: Joi.string().required(),
        username: Joi.string().required(),
        expiry: Joi.string().required(),
        timestamp: Joi.string().required(),
        device_info: Joi.object().required(),
    });
};
const users = () => {
    return Joi.object().keys({
        _id: Joi.string().required(), // username
        name: Joi.string().required(),
        role: Joi.string().required(),
        phoneNumber: Joi.string().allow(''),
        email: Joi.string().required(),
        title: Joi.string().allow(''),
        exemptAutoLogout: Joi.boolean().allow(null),
    });
};
const regions = () => {
    return Joi.object().keys({
        region: Joi.string().required(),
        person_in_charge: Joi.object().allow('',null),
        sequence: Joi.number().allow('',null),
    });
};
const clusters = () => {
    return Joi.object().keys({
        cluster: Joi.string().required(),
        region_id: Joi.string().required(),
        person_in_charge: Joi.object().allow(null).default([]),
    });
};
const geofences = () => {
    return Joi.object().keys({
        site_name: Joi.string().required(),
        short_name: Joi.string().required(),
        cico: Joi.number().required(),
        code: Joi.string().required(),
        cluster_id: Joi.string().required(),
        region_id: Joi.string().required(),
        person_in_charge: Joi.object().allow(null).default([]),
        dispatcher: Joi.array().allow(null).default([]),
    });
};
const routes = () => {
    return Joi.object().keys({
        _id: Joi.string().required(),
        origin_id: Joi.string().required(),
        destination_id: Joi.string().required(),
        transit_time: Joi.number().required(),
    });
};
const support = (type) => {
    type = type || "post";
    var schema = Joi.object().keys({
        user_role: Joi.string().required(),
        status: Joi.string().required(),
        attachments: Joi.array().allow('',null),
        message: Joi.string().required(),
        read: Joi.bool().required(),
    });
    if(type == "put"){
        schema = Joi.object().keys({
            read: Joi.bool().required(),
        });
    }
    if(type == "put|dev"){
        schema = Joi.object().keys({
            status: Joi.string().required(),
            acknowledged_by: Joi.string().allow('',null),
            acknowledged_on: Joi.string().allow('',null),
            fixed_by: Joi.string().allow('',null),
            fixed_on: Joi.string().allow('',null),
        });
    }
    return schema;
};

module.exports = {dispatch,access,sessions,users,regions,clusters,geofences,routes,support};