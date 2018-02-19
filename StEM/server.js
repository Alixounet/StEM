/* server.js
 * StEM: Storyboard-Based Empirical
 *       Modeling of Touch Interface
 *       Performance
 *
 * 2017-02-01
 *
 * Code by: Alix Goguey, www.alixgoguey.fr
 *
 * Project Authors: Alix Goguey, Gery Casiez, Andy Cockburn and Carl Gutwin
 *                  http://ns.inria.fr/mjolnir/StEM
 *
 * License: GNU General Public License v3.0
 *   See https://github.com/Alixounet/StEM/blob/master/LICENSE
 */

var express  =  require("express");
var mysql    =  require('mysql');
var simstats = require('simple-statistics');
var fs = require('fs');
var PythonShell = require('python-shell');


var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    multipleStatements: true,
    host     : 'localhost',
    port     :  3306,
    user     : 'fitts',
    password : 'fitts',
    database : 'fitts',
    debug    :  false
});

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

var port = 3999;
app.listen(port);
datelog('Server listening on port '+port+'.')

function addZ(n) {
    return n<10?'0'+n:''+n;
}

function datelog(string) {
    var date = new Date();
    console.log("[" + date.getFullYear() + "-" + addZ(date.getMonth()+1) + "-" + addZ(date.getDate()) + " " + addZ(date.getHours()) + ":" + addZ(date.getMinutes()) + "] " + string);
}

function handler (req, res) {
    // console.log(__dirname);
    // console.log(req.url);
    var url = req.url;
    if (url == '/') { url = '/index.html'; }
    fs.readFile(__dirname + url,

    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading URL '+url);
        }
        res.writeHead(200);
        res.end(data);
    });
}

var clients = {};

function displayListOfCurrentClients() {
    datelog("List of currently connected clients:");
    for (var key in clients) {
        datelog("  |-> Socket: '"+key+"' is connected.");
    }
}

io.sockets.on('connection', function (socket) {
    datelog("New client connection");

    socket.emit('connected', socket.id);
    clients[socket.id] = {};
    displayListOfCurrentClients();

    var current_crunch = -1;
    var results = {};

    socket.on('crashtest', function(data) {
        console.log(data);
        console.log(data["filters"];)
    });

    function emit_results(cur_crunch) {
        if (cur_crunch == current_crunch) {
            socket.emit('crunched', results);
        }
    }

    function prepare_res(data, res_type) {
        results = {};
        results["type"] = res_type;
        results["filters"] = data["filters"];
        if (res_type != "screen") {
            results["names"] = data["names"];
        }
        results["expert"] = [];
        results["normal"] = [];
        results["novice"] = [];
        results["users"]  = [];
    }

    function prepare_axiom(axiom) {
        var prep = {};
        prep["type"] = axiom["type"];
        prep["time"] = axiom["time"];
        return prep;
    }

    // example of use: set_time_results("expert", [k_ws, k_sc, k_scr, k_ax], time)
    function set_time_results(type, inds, time, cur_crunch, u_id) {
        if (cur_crunch == current_crunch) {
            var ptr = results[type];
            // console.log(ptr);
            for (var k = 0; k < inds.length -1; k++) {
                ptr = ptr[inds[k]];
            }
            if (type == "users") {
                if (ptr[inds[inds.length-1]]["time"] == null) { ptr[inds[inds.length-1]]["time"] = []; }
                ptr[inds[inds.length-1]]["time"].push({"user": u_id, "time": time});
            } else {
                ptr[inds[inds.length-1]]["time"] = time;
            }
        }
    }
    // example of use: get_time_results("expert", [k_ws, k_sc, k_scr, k_ax])
    function get_time_results(type, inds, cur_crunch) {
        if (type == "users") { return null; }
        if (cur_crunch == current_crunch) {
            var ptr = results[type];
            for (var k = 0; k < inds.length -1; k++) {
                ptr = ptr[inds[k]];
            }
            return ptr[inds[inds.length-1]]["time"];
        }
        return null;
    }

    // data = {"filters": filters, "seq": [ [ [ [axiom] ] ] ]}
    socket.on('crunch_workspace', function(data) {
        current_crunch += 1;
        var cur_crunch = current_crunch;
        console.log("Crunching workspace");
        // console.log(data);
        prepare_res(data, "workspace");

        for (var k_ws = 0; k_ws < data["seq"].length; k_ws++) {
            results["expert"].push([]);
            results["normal"].push([]);
            results["novice"].push([]);
            results["users"].push([]);
            for (var k_sc = 0; k_sc < data["seq"][k_ws].length; k_sc++) {
                results["expert"][k_ws].push([]);
                results["normal"][k_ws].push([]);
                results["novice"][k_ws].push([]);
                results["users"][k_ws].push([]);
                for (var k_scr = 0; k_scr < data["seq"][k_ws][k_sc].length; k_scr++) {
                    results["expert"][k_ws][k_sc].push([]);
                    results["normal"][k_ws][k_sc].push([]);
                    results["novice"][k_ws][k_sc].push([]);
                    results["users"][k_ws][k_sc].push([]);
                    for (var k_ax = 0; k_ax < data["seq"][k_ws][k_sc][k_scr].length; k_ax++) {
                        results["expert"][k_ws][k_sc][k_scr].push(prepare_axiom(data["seq"][k_ws][k_sc][k_scr][k_ax]));
                        results["normal"][k_ws][k_sc][k_scr].push(prepare_axiom(data["seq"][k_ws][k_sc][k_scr][k_ax]));
                        results["novice"][k_ws][k_sc][k_scr].push(prepare_axiom(data["seq"][k_ws][k_sc][k_scr][k_ax]));
                        results["users"][k_ws][k_sc][k_scr].push(prepare_axiom(data["seq"][k_ws][k_sc][k_scr][k_ax]));
                    }
                }
            }
        }

        for (var k_ws = 0; k_ws < data["seq"].length; k_ws++) {
            for (var k_sc = 0; k_sc < data["seq"][k_ws].length; k_sc++) {
                for (var k_scr = 0; k_scr < data["seq"][k_ws][k_sc].length; k_scr++) {
                    for (var k_ax = 0; k_ax < data["seq"][k_ws][k_sc][k_scr].length; k_ax++) {
                        compute_axiom(data["seq"][k_ws][k_sc][k_scr][k_ax],
                                      [k_ws, k_sc, k_scr, k_ax],
                                      data["filters"],
                                      cur_crunch);
                    }
                }
            }
        }
    });

    // data = {"filters": filters, "seq": [ [ [axiom] ] ]}
    socket.on('crunch_scenario', function(data) {
        current_crunch += 1;
        var cur_crunch = current_crunch;
        console.log("Crunching scenario");
        // console.log(data);
        prepare_res(data, "scenario");

        for (var k_sc = 0; k_sc < data["seq"].length; k_sc++) {
            results["expert"].push([]);
            results["normal"].push([]);
            results["novice"].push([]);
            results["users"].push([]);
            for (var k_scr = 0; k_scr < data["seq"][k_sc].length; k_scr++) {
                results["expert"][k_sc].push([]);
                results["normal"][k_sc].push([]);
                results["novice"][k_sc].push([]);
                results["users"][k_sc].push([]);
                for (var k_ax = 0; k_ax < data["seq"][k_sc][k_scr].length; k_ax++) {
                    results["expert"][k_sc][k_scr].push(prepare_axiom(data["seq"][k_sc][k_scr][k_ax]));
                    results["normal"][k_sc][k_scr].push(prepare_axiom(data["seq"][k_sc][k_scr][k_ax]));
                    results["novice"][k_sc][k_scr].push(prepare_axiom(data["seq"][k_sc][k_scr][k_ax]));
                    results["users"][k_sc][k_scr].push(prepare_axiom(data["seq"][k_sc][k_scr][k_ax]));
                }
            }
        }

        for (var k_sc = 0; k_sc < data["seq"].length; k_sc++) {
            for (var k_scr = 0; k_scr < data["seq"][k_sc].length; k_scr++) {
                for (var k_ax = 0; k_ax < data["seq"][k_sc][k_scr].length; k_ax++) {
                    compute_axiom(data["seq"][k_sc][k_scr][k_ax],
                                  [k_sc, k_scr, k_ax],
                                  data["filters"],
                                  cur_crunch);
                }
            }
        }
    });

    // data = {"filters": filters, "seq": [ [axiom] ]}
    socket.on('crunch_screen', function(data) {
        current_crunch += 1;
        var cur_crunch = current_crunch;
        console.log("Crunching screen");
        prepare_res(data, "screen");

        for (var k_scr = 0; k_scr < data["seq"].length; k_scr++) {
            results["expert"].push([]);
            results["normal"].push([]);
            results["novice"].push([]);
            results["users"].push([]);
            for (var k_ax = 0; k_ax < data["seq"][k_scr].length; k_ax++) {
                results["expert"][k_scr].push(prepare_axiom(data["seq"][k_scr][k_ax]));
                results["normal"][k_scr].push(prepare_axiom(data["seq"][k_scr][k_ax]));
                results["novice"][k_scr].push(prepare_axiom(data["seq"][k_scr][k_ax]));
                results["users"][k_scr].push(prepare_axiom(data["seq"][k_scr][k_ax]));
            }
        }

        for (var k_scr = 0; k_scr < data["seq"].length; k_scr++) {
            for (var k_ax = 0; k_ax < data["seq"][k_scr].length; k_ax++) {
                compute_axiom(data["seq"][k_scr][k_ax],
                             [k_scr, k_ax],
                             data["filters"],
                             cur_crunch);
            }
        }
    });

    // data = {"filters": filters, "seq": [axiom]}
    socket.on('crunch_axiom', function(data) {
        current_crunch += 1;
        var cur_crunch = current_crunch;
        console.log("Crunching axiom");
        // console.log(data);
        prepare_res(data, "axiom");

        for (var k_ax = 0; k_ax < data["seq"].length; k_ax++) {
            results["expert"].push(prepare_axiom(data["seq"][k_ax]));
            results["normal"].push(prepare_axiom(data["seq"][k_ax]));
            results["novice"].push(prepare_axiom(data["seq"][k_ax]));
            results["users"].push(prepare_axiom(data["seq"][k_ax]));
        }

        for (var k_ax = 0; k_ax < data["seq"].length; k_ax++) {
            compute_axiom(data["seq"][k_ax], [k_ax], data["filters"], cur_crunch);
        }
    });

    socket.on('disconnect' , function() {
        datelog("Client '"+clients[socket.id]+"'disconnected");
        delete clients[socket.id];
        displayListOfCurrentClients();
    });


    // filters
    // filters {
    //     "method":      Mean, Median
    //     "gender":      All, Female, Male
    //     "orientation": All, Current
    //     "diagonal":    All, Current
    //     "expert":      1 to 99
    //     "novice":      1 to 99
    // }

    // sequence element
    // axiom {
    //     "type":        WRONG, TAP, POINTING, DRAG, SWIPE, DWELL
    //     "direction":   EAST, WEST, NORTH, SOUTH    -- only for SWIPE
    //     "ID":          float                       -- all but SWIPE, DWELL
    //     "time":        int in ms
    //     "orientation": Landscape, Portrait
    //     "diagonal":    in inches (every .5)
    // }

    function compute_axiom(axiom, inds, filters, cur_crunch) {
        if (get_time_results("normal", inds) != null) {
            emit_results(cur_crunch);
        }

        if (axiom["type"] == "TAP") {
            retrieve_tap_trials(axiom, inds, filters, cur_crunch);
        } else if (axiom["type"] == "POINTING") {
            retrieve_poiting_trials(axiom, inds, filters, cur_crunch);
        } else if (axiom["type"] == "DRAG") {
            retrieve_drag_trials(axiom, inds, filters, cur_crunch);
        } else if (axiom["type"] == "ROTATE") {
            retrieve_rotate_trials(axiom, inds, filters, cur_crunch);
        } else if (axiom["type"] == "SCALE") {
            retrieve_scale_trials(axiom, inds, filters, cur_crunch);
        } else if (axiom["type"] == "SWIPE") {
            retrieve_swipe_trials(axiom, inds, filters, cur_crunch);
        } else {
            emit_results(cur_crunch);
        }
    }

    function prepare_sql_filters(filters, axiom, table) {
        var cond_orientation = (filters["orientation"]=="All"?"":"AND "+table+".`Orientation` = '"+axiom["orientation"]+"'\n");
        var cond_grip        = (filters["grip"]=="All"?"":"AND "+table+".`Grip` = '"+filters["grip"]+"'\n");
        var cond_diagonal    = (filters["diagonal"]=="All"?"":"AND D.`Diagonal` = "+axiom["diagonal"]+"\n");
        var cond_gender      = (filters["gender"]=="All"?"":"AND U.`Gender` = '"+filters["gender"]+"'\n");

        return cond_orientation + cond_diagonal + cond_gender + cond_grip;
    }

    function compute_axiom_time(axiom, data, inds, filters, cur_crunch) {
        if (cur_crunch != current_crunch) { return; }

        var overall_data = {};
        var ratio_expert = filters["expert"] * 0.01;
        var ratio_novice = 1.0 - filters["novice"] * 0.01;

        if (axiom["type"] == "SWIPE") {
            overall_data = [];
            for (var u_id in data) {
                var times = data[u_id];
                times.sort(function(a, b){return a-b});
                if (filters["method"] == "Mean") {
                    var time = simstats.mean(times);
                    if (time > 0) {
                        overall_data.push(time);
                        set_time_results("users", inds, time, cur_crunch, u_id);
                    }
                } else {
                    var time = simstats.median(times);
                    if (time > 0) {
                        overall_data.push(time);
                        set_time_results("users", inds, time, cur_crunch, u_id);
                    }
                }
            }
        } else {
            for (var u_id in data) {
                var user_data = [];
                for (var id in data[u_id]) {
                    if (typeof overall_data[id] == 'undefined') { overall_data[id] = []; }
                    var times = data[u_id][id];
                    times.sort(function(a, b){return a-b});
                    if (filters["method"] == "Mean") {
                        var time = simstats.mean(times);
                        overall_data[id].push(time);
                        user_data.push([parseFloat(id), time]);
                        //set_time_results("users", inds, time, cur_crunch, u_id);
                    } else {
                        var time = simstats.median(times);
                        overall_data[id].push(time);
                        user_data.push([parseFloat(id), time]);
                        //set_time_results("users", inds, time, cur_crunch, u_id);
                    }
                }
                var lreg_user = simstats.linearRegressionLine(simstats.linearRegression(user_data));
                var u_time = lreg_user(axiom["ID"]);
                if (u_time > 0) {
                    set_time_results("users", inds, u_time, cur_crunch, u_id);
                }
            }
        }

        if (axiom["type"] == "SWIPE") {
            overall_data.sort(function(a, b){return a-b});
            var times_expert = overall_data.slice(0,Math.ceil(overall_data.length * ratio_expert));
            var times_novice = overall_data.slice(Math.floor(overall_data.length * ratio_novice), overall_data.length);

            if (filters["method"] == "Mean") {
                set_time_results("novice", inds, simstats.mean(times_novice),cur_crunch);
                ///////
                set_time_results("normal", inds, simstats.mean(overall_data),cur_crunch);
                // set_time_results("normal", inds, 115,cur_crunch); // FLM
                ///////
                set_time_results("expert", inds, simstats.mean(times_expert),cur_crunch);
            } else {
                set_time_results("novice", inds, simstats.median(times_novice),cur_crunch);
                set_time_results("normal", inds, simstats.median(overall_data),cur_crunch);
                set_time_results("expert", inds, simstats.median(times_expert),cur_crunch);
            }
        } else {
            var data_pts_novice = [];  // [ [ID_1, Time_1], ..., [ID_n, Time_n] ] for the (100-filters["novice"]) to 100
            var data_pts_normal = [];  // [ [ID_1, Time_1], ..., [ID_n, Time_n] ] for all
            var data_pts_expert = [];  // [ [ID_1, Time_1], ..., [ID_n, Time_n] ] for the 0 to filters["expert"]

            for (var id in overall_data) {
                var times_normal = overall_data[id];
                times_normal.sort(function(a, b){return a-b});
                var times_expert = times_normal.slice(0,Math.ceil(times_normal.length * ratio_expert));
                var times_novice = times_normal.slice(Math.floor(times_normal.length * ratio_novice), times_normal.length);
                if (times_normal.length > 0 && times_expert.length > 0 && times_novice.length > 0) {
                    if (filters["method"] == "Mean") {
                        data_pts_novice.push([parseFloat(id), simstats.mean(times_novice)])
                        data_pts_normal.push([parseFloat(id), simstats.mean(times_normal)])
                        data_pts_expert.push([parseFloat(id), simstats.mean(times_expert)])
                    } else {
                        data_pts_novice.push([parseFloat(id), simstats.median(times_novice)])
                        data_pts_normal.push([parseFloat(id), simstats.median(times_normal)])
                        data_pts_expert.push([parseFloat(id), simstats.median(times_expert)])
                    }
                }
            }

            var lreg_novice = simstats.linearRegressionLine(simstats.linearRegression(data_pts_novice));
            var lreg_normal = simstats.linearRegressionLine(simstats.linearRegression(data_pts_normal));
            var lreg_expert = simstats.linearRegressionLine(simstats.linearRegression(data_pts_expert));
            set_time_results("novice", inds, lreg_novice(axiom["ID"]),cur_crunch)
            ///////
            set_time_results("normal", inds, lreg_normal(axiom["ID"]),cur_crunch)
            // if (axiom["type"] == "TAP") {
            //     set_time_results("normal", inds, 104+126*axiom["ID"],cur_crunch) // FLM
            // } else if (axiom["type"] == "POINTING") {
            //     set_time_results("normal", inds, 104+126*axiom["ID"],cur_crunch) // FLM
            // } else if (axiom["type"] == "DRAG") {
            //     set_time_results("normal", inds, -33+80*axiom["ID"],cur_crunch) // FLM
            // } else {
            //     set_time_results("normal", inds, lreg_normal(axiom["ID"]),cur_crunch) // FLM
            // }
            ///////
            set_time_results("expert", inds, lreg_expert(axiom["ID"]),cur_crunch)
        }
        emit_results(cur_crunch);
    }

    function retrieve_tap_trials(axiom, inds, filters, cur_crunch) {
        var sql_filter = prepare_sql_filters(filters, axiom, "T");

        var query = "";
        query += " SELECT                                                        \n";
        query += "     T.`User`, T.`Radius`, T.`CompletionTime`,                 \n";
        query += "     D.`RealDiagonal`, D.`RatioMmPerPixW`, D.`RatioMmPerPixH`  \n";
        query += " FROM                                                          \n";
        query += "     `Taps`      AS T,                                         \n";
        query += "     `Users`     AS U,                                         \n";
        query += "     `Diagonals` AS D                                          \n";
        query += " WHERE                                                         \n";
        query += "         T.`User` = U.`ID` AND U.`ID` = D.`User`               \n";
        query += "     AND T.`NumberOfTry` = 1                                   \n";
        query +=       sql_filter;
        query += ";                                                                ";

        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            connection.query(query, function(err,rows) {
                connection.release();
                if(!err && cur_crunch == current_crunch) {
                    var data = {};
                    for (var k = 0; k < rows.length; k++) {
                        // console.log(rows[k])
                        // RowDataPacket {
                        //   User: 79, Radius: 99.95, CompletionTime: 662,
                        //   RatioMmPerPixW: 0.0078, RatioMmPerPixH: 0.0078, RealDiagonal: 127
                        // }
                        var u_id = rows[k]["User"];
                        if (typeof data[u_id] === 'undefined') { data[u_id] = {}; }

                        var scr_diag = rows[k]["RealDiagonal"];                       // in mm
                        var diameter = rows[k]["RatioMmPerPixW"]*rows[k]["Radius"]*2; // in mm
                        var id       = Math.log2(1 + (scr_diag / diameter));
                        id = Number(id.toFixed(2));

                        if (typeof data[u_id][id] === 'undefined') { data[u_id][id] = []; }
                        data[u_id][id].push(rows[k]["CompletionTime"]);
                        // console.log(u_id+" "+id+" "+rows[k]["CompletionTime"]);
                    }
                    compute_axiom_time(axiom, data, inds, filters, cur_crunch);
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });
        });
    }

    function retrieve_poiting_trials(axiom, inds, filters, cur_crunch) {
        var sql_filter = prepare_sql_filters(filters, axiom, "P");

        var query = "";
        query += " SELECT                                                        \n";
        query += "     P.`User`, P.`CompletionTimeNoDrag`,                       \n";
        query += "     P.`StartCenterX`, P.`StartCenterY`,                       \n";
        query += "     P.`EndCenterX`, P.`EndCenterY`, P.`EndRadius`,            \n";
        query += "     D.`RatioMmPerPixW`, D.`RatioMmPerPixH`                    \n";
        query += " FROM                                                          \n";
        query += "     `Pointings` AS P,                                         \n";
        query += "     `Users`     AS U,                                         \n";
        query += "     `Diagonals` AS D                                          \n";
        query += " WHERE                                                         \n";
        query += "         P.`User` = U.`ID` AND U.`ID` = D.`User`               \n";
        query += "     AND P.`NumberOfTryNoDrag` = 1                             \n";
        query +=       sql_filter;
        query += ";                                                                ";

        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            connection.query(query, function(err,rows) {
                connection.release();
                if(!err && cur_crunch == current_crunch) {
                    var data = {};
                    for (var k = 0; k < rows.length; k++) {
                        // console.log(rows[k])
                        var u_id = rows[k]["User"];
                        if (typeof data[u_id] === 'undefined') { data[u_id] = {}; }

                        var tol      = rows[k]["RatioMmPerPixW"]*rows[k]["EndRadius"]*2; // in mm
                        var dx       = rows[k]["RatioMmPerPixW"]*(rows[k]["EndCenterX"] - rows[k]["StartCenterX"]); // in mm
                        var dy       = rows[k]["RatioMmPerPixH"]*(rows[k]["EndCenterY"] - rows[k]["StartCenterY"]); // in mm
                        var amp      = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
                        var id       = Math.log2(1 + (amp / tol));
                        id = Number(id.toFixed(2));

                        if (typeof data[u_id][id] === 'undefined') { data[u_id][id] = []; }
                        data[u_id][id].push(rows[k]["CompletionTimeNoDrag"]);
                    }
                    compute_axiom_time(axiom, data, inds, filters, cur_crunch);
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });
        });
    }

    function retrieve_drag_trials(axiom, inds, filters, cur_crunch) {
        var sql_filter = prepare_sql_filters(filters, axiom, "Dr");

        var query = "";
        query += " SELECT                                                        \n";
        query += "     Dr.`User`, Dr.`CompletionTime`,                           \n";
        query += "     Dr.`StartCenterX`, Dr.`StartCenterY`, Dr.`StartRadius`,   \n";
        query += "     Dr.`EndCenterX`, Dr.`EndCenterY`, Dr.`EndRadius`,         \n";
        query += "     D.`RatioMmPerPixW`, D.`RatioMmPerPixH`                    \n";
        query += " FROM                                                          \n";
        query += "     `Drags`     AS Dr,                                        \n";
        query += "     `Users`     AS U,                                         \n";
        query += "     `Diagonals` AS D                                          \n";
        query += " WHERE                                                         \n";
        query += "         Dr.`User` = U.`ID` AND U.`ID` = D.`User`              \n";
        query += "     AND Dr.`NumberOfTry` = 1                                  \n";
        query +=       sql_filter;
        query += ";                                                                ";

        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            connection.query(query, function(err,rows) {
                connection.release();
                if(!err && cur_crunch == current_crunch) {
                    var data = {};
                    for (var k = 0; k < rows.length; k++) {
                        // console.log(rows[k])
                        var u_id = rows[k]["User"];
                        if (typeof data[u_id] === 'undefined') { data[u_id] = {}; }

                        var tol      = rows[k]["RatioMmPerPixW"]*(rows[k]["EndRadius"] - rows[k]["StartRadius"])*2; // in mm
                        var dx       = rows[k]["RatioMmPerPixW"]*(rows[k]["EndCenterX"] - rows[k]["StartCenterX"]); // in mm
                        var dy       = rows[k]["RatioMmPerPixH"]*(rows[k]["EndCenterY"] - rows[k]["StartCenterY"]); // in mm
                        var amp      = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
                        var id       = Math.log2(1 + (amp / tol));
                        id = Number(id.toFixed(2));

                        if (typeof data[u_id][id] === 'undefined') { data[u_id][id] = []; }
                        data[u_id][id].push(rows[k]["CompletionTime"]);
                    }
                    compute_axiom_time(axiom, data, inds, filters, cur_crunch);
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });
        });
    }

    function retrieve_rotate_trials(axiom, inds, filters, cur_crunch) {
        var sql_filter = prepare_sql_filters(filters, axiom, "R");

        var query = "";
        query += " SELECT                                                        \n";
        query += "     R.`User`, R.`CompletionTime`,                             \n";
        query += "     R.`Angle`, R.`Aperture`,                                  \n";
        query += "     D.`RatioMmPerPixW`, D.`RatioMmPerPixH`                    \n";
        query += " FROM                                                          \n";
        query += "     `Rotations` AS R,                                         \n";
        query += "     `Users`     AS U,                                         \n";
        query += "     `Diagonals` AS D                                          \n";
        query += " WHERE                                                         \n";
        query += "         R.`User` = U.`ID` AND U.`ID` = D.`User`               \n";
        query += "     AND R.`NumberOfTry` = 1                                   \n";
        query +=       sql_filter;
        query += ";                                                                ";

        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            connection.query(query, function(err,rows) {
                connection.release();
                if(!err && cur_crunch == current_crunch) {
                    var data = {};
                    for (var k = 0; k < rows.length; k++) {
                        // console.log(rows[k])
                        var u_id = rows[k]["User"];
                        if (typeof data[u_id] === 'undefined') { data[u_id] = {}; }

                        var tol      = rows[k]["Aperture"]; // in deg
                        var amp      = Math.abs(rows[k]["Angle"]);
                        var id       = Math.log2(1 + (amp / tol));
                        id = Number(id.toFixed(2));

                        if (typeof data[u_id][id] === 'undefined') { data[u_id][id] = []; }
                        data[u_id][id].push(rows[k]["CompletionTime"]);
                    }
                    compute_axiom_time(axiom, data, inds, filters, cur_crunch);
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });
        });
    }

    function retrieve_scale_trials(axiom, inds, filters, cur_crunch) {
        var sql_filter = prepare_sql_filters(filters, axiom, "S");

        var query = "";
        query += " SELECT                                                        \n";
        query += "     S.`User`, S.`CompletionTime`,                             \n";
        query += "     S.`StartRadius`, S.`TargetRadius`,                        \n";
        query += "     S.`Thickness`,                                            \n";
        query += "     D.`RatioMmPerPixW`, D.`RatioMmPerPixH`                    \n";
        query += " FROM                                                          \n";
        query += "     `Scalings`  AS S,                                         \n";
        query += "     `Users`     AS U,                                         \n";
        query += "     `Diagonals` AS D                                          \n";
        query += " WHERE                                                         \n";
        query += "         S.`User` = U.`ID` AND U.`ID` = D.`User`               \n";
        query += "     AND S.`NumberOfTry` = 1                                   \n";
        query +=       sql_filter;
        query += ";                                                                ";

        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            connection.query(query, function(err,rows) {
                connection.release();
                if(!err && cur_crunch == current_crunch) {
                    var data = {};
                    for (var k = 0; k < rows.length; k++) {
                        // console.log(rows[k])
                        var u_id = rows[k]["User"];
                        if (typeof data[u_id] === 'undefined') { data[u_id] = {}; }

                        var tol      = rows[k]["Thickness"]; // in mm
                        var amp      = 2*Math.abs(rows[k]["StartRadius"] - rows[k]["TargetRadius"]);
                        var id       = Math.log2(1 + (amp / tol));
                        id = Number(id.toFixed(2));

                        if (typeof data[u_id][id] === 'undefined') { data[u_id][id] = []; }
                        data[u_id][id].push(rows[k]["CompletionTime"]);
                    }
                    compute_axiom_time(axiom, data, inds, filters, cur_crunch);
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });
        });
    }
    function retrieve_swipe_trials(axiom, inds, filters, cur_crunch) {
        var sql_filter = prepare_sql_filters(filters, axiom, "S");

        var query = "";
        query += " SELECT                                                        \n";
        query += "     S.`User`, S.`CompletionTime`,                             \n";
        query += "     S.`StartCenterX`, S.`StartCenterY`,                       \n";
        query += "     S.`EndCenterX`, S.`EndCenterY`,                           \n";
        query += "     D.`RatioMmPerPixW`, D.`RatioMmPerPixH`                    \n";
        query += " FROM                                                          \n";
        query += "     `Swipes`    AS S,                                         \n";
        query += "     `Users`     AS U,                                         \n";
        query += "     `Diagonals` AS D                                          \n";
        query += " WHERE                                                         \n";
        query += "         S.`User` = U.`ID` AND U.`ID` = D.`User`               \n";
        query += "     AND S.`NumberOfTry` = 1                                   \n";
        query +=       sql_filter;
        query += ";                                                                ";

        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            connection.query(query, function(err,rows) {
                connection.release();
                if(!err && cur_crunch == current_crunch) {
                    var data = {};
                    for (var k = 0; k < rows.length; k++) {
                        // console.log(rows[k])
                        var u_id = rows[k]["User"];

                        var dx       = rows[k]["RatioMmPerPixW"]*(rows[k]["EndCenterX"] - rows[k]["StartCenterX"]); // in mm
                        var dy       = rows[k]["RatioMmPerPixH"]*(rows[k]["EndCenterY"] - rows[k]["StartCenterY"]); // in mm
                        var dir      = 'NORTH';
                        if (dx > -10 && dy > -10) {
                            if (dx > dy) {
                                dir = 'EAST';
                            } else {
                                dir = 'SOUTH';
                            }
                        } else {
                            if (dx < dy) {
                                dir = 'WEST';
                            }
                        }

                        if (dir == axiom["direction"]) {
                            if (typeof data[u_id] === 'undefined') { data[u_id] = []; }
                            data[u_id].push(rows[k]["CompletionTime"]);
                        }
                    }
                    compute_axiom_time(axiom, data, inds, filters, cur_crunch);
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });
        });
    }

});