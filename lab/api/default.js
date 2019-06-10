var db = require("../db").db;
var user_collections = ['users', 'experiments', 'datasets'];
var global_collections = ['projects'];
var fs = require("fs");
//helper function for searching and formatting results
var convert_to_dict = function(array) {
    var new_array = {};
    if (array !== undefined && array.length >= 0) {
        for (var i = 0; i < array.length; i++) {
            var entry = array[i];
            var _id = entry['_id'];
            new_array[_id] = entry;
        }
    }
    return (new_array);
}
exports.convert_to_dict = convert_to_dict;
var group_on_key = function(array, key) {
    var new_array = {};
    for (old_key in array) {
        var entry = array[old_key];
        var _id = entry[key];
        if (new_array[_id] === undefined) {
            new_array[_id] = [];
        }
        new_array[_id].push(entry);
    }
    return (new_array);
}
exports.group_on_key = group_on_key;
exports.responder = function(req, res) {
    if (fs.existsSync('api/' + req.params.apipath + ".js")) {
        return (require("./" + req.params.apipath).responder(req, res));
    } else {
        return (responder(req, res));
    }
}


//return a list of datasets for each user
var responder = function(req, res) {
    var params = retParams(req);
    var query = {};
    if (params['filter_on_user']) {
        query['username'] = params['username'];
    }
    if (params['has_scores']) {
        query['_scores'] = {
            $exists: 1
        }
    }
    if (params['_project_id']) {
        query['_project_id'] = db.ObjectID(params['_project_id']);
    }
    if (params['_dataset_id']) {
        query['_dataset_id'] = db.ObjectID(params['_dataset_id']);
    }
    if (params['id']) {
        query['_id'] = db.ObjectID(params['id']);
    }
    if (params['date_start']) {
        query['_finished'] = {
            "$gte": new Date(params['date_start'])
        }
    }
    for (param in params.match) {
        var vals = params.match[param]
        if (vals.length !== undefined && vals.length >= 2) {
            //{ $or: [ { quantity: { $lt: 20 } }, { price: 10 }
            query[param] = vals;
            vals = {
                $in: vals
            }
        }
        query[param] = vals;
    }

    res.set('Content-Type', 'application/json');
    res.write('[');
    var prevChunk = null;
    if(params.limit !==undefined  && params.limit > 0) {
   limit = params.limit;
    } else {
   limit = 0;
    }

    db.collection(params['collection']).find(query).limit(limit)
        .on('data', function onData(data) {
            if (prevChunk) {
                res.write(JSON.stringify(prevChunk) + ',');
            }
            prevChunk = data;
        })
        .on('end', function onEnd() {
            if (prevChunk) {
                res.write(JSON.stringify(prevChunk));
            }
            res.end(']');
        });





}
//format the request into a dict
var retParams = function(req) {
    //
    var params = {};
    var is_global = false;
    var is_ai = false;
    var date_start = false;
    var filter_on_user = true;
    var _id = false;
    var limit = 0;
    params['match'] = {}
    //
    if (req.body !== undefined) {
        for (param in req.body) {
            var val = req.body[param];
            if (param == 'date_start') {
                if (!isNaN(parseFloat(val) && isFinite(val))) {
                    date_start = val
                }
            }
            if (param == 'ai') {
                params['match']['ai'] = val;
            }
            if (param == 'has_scores') {
                params[param] = val;
            }
        }
    }
    if (req.query !== undefined) {
        for (param in req.query) {
            var val = req.query[param];
            if(param == 'limit') {
               limit = parseInt(val);
            }
            if(param == 'project_id') {
            params['_' + param] =val;
            }
            if(param == 'dataset_id') {
            params['_' + param] =val;
            }
        }
    }

//console.log(req.params);
    if (req.params.user['roles'] !== undefined && req.params.user['roles'].indexOf('ai') >= 0) {
        is_ai = true;
    }

    if (req.params.apipath == 'preferences') {
        var collection = 'users';
    } else {
        var collection = req.params.apipath;
    }





    if (global_collections.indexOf(collection) >= 0) {
        is_global = true;
    }
    if (req.params.id) {
        _id = req.params.id;
    }
    if (req.params.project_id) {
        params['project_id'] = req.params.project_id;
    }
    if (is_global && !is_ai) {
        filter_on_user = false;
    }
    //allow ai to filter on other users
    if (is_ai) {
        if (req.body['username'] !== undefined) {
            params['username'] = req.body['username'];
        } else {
            filter_on_user = false;
        }
    } else {
        params['username'] = req.params.user.username;
    }
    params['collection'] = collection;
    params['is_ai'] = is_ai;
    params['is_global'] = is_global;
    params['id'] = _id;
    params['filter_on_user'] = filter_on_user;
    params['limit'] = limit;
    params['date_start'] = date_start;
    return (params);
}
exports.params = retParams;
