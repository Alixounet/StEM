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

var port = 3000;
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

var error_once = true;

var training_tasks = [];
training_tasks.push({'type': 'tap', 'cx':25, 'cy':25, 'r':10})
training_tasks.push({'type': 'pointing', 'scx':11, 'scy':11, 'sr':10, 'ecx':89, 'ecy':89, 'er':5})
training_tasks.push({'type': 'drag', 'scx':11, 'scy':11, 'sr':10, 'ecx':81, 'ecy':81, 'er':13})
training_tasks.push({'type': 'rotation', 'cx':50, 'cy':50, 'r':40, 'angle':-90, 'aperture':20})
training_tasks.push({'type': 'scaling', 'cx':50, 'cy':50, 'sr':20, 'er':40, 'thickness':10})
training_tasks.push({'type': 'scaling', 'cx':50, 'cy':50, 'sr':40, 'er':20, 'thickness':10})
training_tasks.push({'type': 'swipe', 'scx':11, 'scy':50, 'r':10, 'ecx':89, 'ecy':50})

// var tasks = [];
// // tasks.push({'type': 'tap', 'cx':25, 'cy':25, 'r':10})
// // tasks.push({'type': 'pointing', 'scx':11, 'scy':11, 'sr':10, 'ecx':89, 'ecy':89, 'er':5})
// // tasks.push({'type': 'drag', 'scx':11, 'scy':11, 'sr':10, 'ecx':81, 'ecy':81, 'er':13})
// // tasks.push({'type': 'rotation', 'cx':50, 'cy':50, 'r':40, 'angle':-90, 'aperture':20})
// tasks.push({'type': 'scaling', 'cx':50, 'cy':50, 'sr':20, 'er':40, 'thickness':10})

function cloneTasks(tasks) {
    var clone = [];
    for (var k = 0; k < tasks.length; k++) {
        var aux = {};
        for (var key in tasks[k]) {
            aux[key] = tasks[k][key];
        }
        clone.push(aux);
    }
    return clone;
}

var loaded_tasks = [];
var task_pool = [];
var loaded_type_of_tasks = [];
var task_refresh_count = 0;
var task_refresh_step = 30;

function getTaskAux(client_data) {
    if (task_pool.length == 0) {
        task_pool = cloneTasks(loaded_tasks);
    }
    on_pool = true;
    var ind = Math.floor(Math.random() * task_pool.length);
    if (client_data['grip'] == "Grip11" && (task_pool[ind]['type'] == 'rotation' || task_pool[ind]['type'] == 'scaling')) {
        on_pool = false;
        for (var k = 0; k < task_pool.length; k++) {
            if (task_pool[k]['type'] != 'rotation' && task_pool[k]['type'] != 'scaling') {
                ind = k;
                on_pool = true;
                break;
            }
        }
        if (!on_pool) {
            ind = Math.floor(Math.random() * loaded_tasks.length);
            if (loaded_tasks[ind]['type'] == 'rotation' || loaded_tasks[ind]['type'] == 'scaling') {
                for (var k = 0; k < loaded_tasks.length; k++) {
                    if (loaded_tasks[k]['type'] != 'rotation' && loaded_tasks[k]['type'] != 'scaling') {
                        ind = k;
                        break;
                    }
                }
            }
        }
    }
    var task = null;
    if (on_pool) {
        task = task_pool[ind];
        task_pool.splice(ind, 1);
    } else {
        task = loaded_tasks[ind];
    }
    return task;
}
function getTask(client_data,socket) {
    if (!client_data['training'] && (task_refresh_count == 0 || loaded_tasks.length == 0)) {
        fs.readFile(__dirname+'/tasks.txt', 'utf8', function (err,data) {
            if (err) {
                datelog(err);
                return;
            }

            loaded_tasks = [];
            loaded_type_of_tasks = [];

            var lines = data.split('\n');
            for (var k = 0; k < lines.length; k++) {
                if (lines[k] != "" && lines[k].match(".*//.*") == null) {
                    var cur_task = JSON.parse(lines[k]);
                    loaded_tasks.push(cur_task);
                    if (loaded_type_of_tasks.indexOf(cur_task['type']) == -1) {
                        loaded_type_of_tasks.push(cur_task['type']);
                    }
                }
            }
            datelog("Tasks loaded from /tasks.txt");
            // console.log(loaded_tasks);

            // if (clients[client_data['id']]['tasks'].length == 0) {
            //     clients[client_data['id']]['tasks'] = cloneTasks(loaded_tasks);
            // }
            // var ind = Math.floor(Math.random() * clients[client_data['id']]['tasks'].length);
            // var task = clients[client_data['id']]['tasks'][ind];
            // clients[client_data['id']]['tasks'].splice(ind, 1);

            var task = getTaskAux(client_data);

            task['training'] = false;
            clients[client_data['id']]['intask'] = true;
            clients[client_data['id']]['training'] = client_data['training'];
            clients[client_data['id']]['task'] = task['type'];
            socket.emit('parameters', task);
        });
    } else {
        var task = null;

        if (client_data['training']) {
            task = training_tasks[clients[client_data['id']]['training_id']];
            task['training'] = true;
        } else {
            if (clients[client_data['id']]['tasks'].length == 0) {
                clients[client_data['id']]['tasks'] = cloneTasks(loaded_tasks);
            }

            // var ind = Math.floor(Math.random() * clients[client_data['id']]['tasks'].length);
            // task = clients[client_data['id']]['tasks'][ind];
            // clients[client_data['id']]['tasks'].splice(ind, 1);

            var task = getTaskAux(client_data);

            task['training'] = false;
        }
        clients[client_data['id']]['intask'] = true;
        clients[client_data['id']]['training'] = client_data['training'];
        clients[client_data['id']]['task'] = task['type'];
        socket.emit('parameters', task);
    }
    if (!client_data['training']) {
        task_refresh_count = (task_refresh_count+1)%task_refresh_step;
    }
}

var clients = {};

function is_valid(data,type) {
    if (typeof clients[data['id']] !== 'undefined') {
        return clients[data['id']]['DBid'] != -1 &&
               clients[data['id']]['intask']     &&
               clients[data['id']]['task'] == type &&
               clients[data['id']]['training'] == false;
    }
    return false;
}
function discard_user(data,socket) {
    if (typeof clients[data['id']] !== 'undefined') {
        clients[data['id']]['intask'] = false;
        clients[data['id']]['task'] = null;

        if (clients[data['id']]['training'] == false) {
            // trying to log without permission
            clients[data['id']]['DBid'] = -1; // no longer admit
        } else {
            clients[data['id']]['training'] = false;
            clients[data['id']]['training_id'] = (clients[data['id']]['training_id']+1)%training_tasks.length;

            socket.emit('motivations', {'was_in_training':true, 'has_next':clients[data['id']]['training_id']});
        }
    }
}

function displayListOfCurrentClients() {
    datelog("List of currently connected clients:");
    for (var key in clients) {
        datelog("  |-> Socket: '"+key+"' is connected and registered as '"+clients[key]['DBid']+"' in the database.");
    }
}

io.sockets.on('connection', function (socket) {
    datelog("New client connection");


    socket.emit('connected', socket.id);
    clients[socket.id] = {'DBid': -1, 'intask': false, 'task': null, 'training': false, 'training_id':0, 'tasks':cloneTasks(loaded_tasks)};
    displayListOfCurrentClients();


    socket.on('registerparticipant', function (data) {
        datelog("Client '"+data['id']+"' agreed to participate.");
        if (typeof clients[data['id']] !== 'undefined') {
            if (data['id'] == data['prev_id']) {
                register_participant(data);
            } else {
                retreive_participant(data);
            }
        }
    });


    socket.on('taptrial', function (data) {
        datelog("Client '"+data['id']+"' performed a tap trial.");
        if (is_valid(data,'tap')) { register_tap(data); } else { discard_user(data,socket); }
    });

    socket.on('pointingtrial', function (data) {
        datelog("Client '"+data['id']+"' performed a pointing trial.");
        if (is_valid(data,'pointing')) { register_pointing(data); } else { discard_user(data,socket); }
    });

    socket.on('dragtrial', function (data) {
        datelog("Client '"+data['id']+"' performed a drag trial.");
        if (is_valid(data,'drag')) { register_drag(data); } else { discard_user(data,socket); }
    });

    socket.on('rotationtrial', function (data) {
        datelog("Client '"+data['id']+"' performed a rotation trial.");
        if (is_valid(data,'rotation')) { register_rotation(data); } else { discard_user(data,socket); }
    });

    socket.on('scalingtrial', function (data) {
        datelog("Client '"+data['id']+"' performed a scaling trial.");
        if (is_valid(data,'scaling')) { register_scaling(data); } else { discard_user(data,socket); }
    });

    socket.on('swipetrial', function (data) {
        datelog("Client '"+data['id']+"' performed a swipe trial.");
        if (is_valid(data,'swipe')) { register_swipe(data); } else { discard_user(data,socket); }
    });


    socket.on('requestparameters', function (data) {
        if (typeof clients[data['id']] == 'undefined') {
            return;
        }

        getTask(data,socket);
    });


    socket.on('disconnect' , function() {
        datelog("Client '"+clients[socket.id]+"'disconnected");
        delete clients[socket.id];
        displayListOfCurrentClients();
    });






    function register_participant(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            datelog(data['id']);

            var query =
                " UPDATE `CurrentUserID` SET `ID` = `ID`+1;                            \n"+
                " INSERT INTO `Users` (`ID`,`Age`, `Handiness`, `Gender`, `Expertise`, \n"+
                "                      `ScreenWidth`, `ScreenHeight`, `Model`,         \n"+
                "                      `DevicePixelRatio`, `Eligibility`)              \n"+
                " VALUES ((SELECT `ID` FROM `CurrentUserID` LIMIT 1),                  \n"+
                "          "+data['age']+",                                            \n"+
                "         '"+data['handiness']+"',                                     \n"+
                "         '"+data['gender']+"',                                        \n"+
                "         '"+data['expertise']+"',                                     \n"+
                "          "+data['screenwidth']+",                                    \n"+
                "          "+data['screenheight']+",                                   \n"+
                "         '"+data['model']+"',                                         \n"+
                "          "+data['devicepixelratio']+",                               \n"+
                "         '"+data['eligibility']+"');                                  \n"+
                " INSERT INTO `Connexions` (`Socket`, `User`)                          \n"+
                " VALUES ('"+data['prev_id']+"',                                       \n"+
                "         (SELECT `ID` FROM `CurrentUserID` LIMIT 1));                 \n"+
                " SELECT `ID` FROM `CurrentUserID` LIMIT 1;                              ";
            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    clients[data['id']]['DBid'] = rows[rows.length-1][0]['ID'];
                    socket.emit('registered', null);
                    displayListOfCurrentClients();
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            if (error_once) {
                error_once = false;
                connection.on('error', function(err) { datelog(err); return; });
            }
        });
    }

    function retreive_participant(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " SELECT U.`ID`                                                 \n"+
                " FROM                                                          \n"+
                "     `Users` AS U,                                             \n"+
                "     `Connexions` AS C                                         \n"+
                " WHERE                                                         \n"+
                "     C.`Socket`           = '"+data['prev_id']+"'          AND \n"+
                "     C.`User`             = U.`ID`                         AND \n"+
                "     U.`Age`              =  "+data['age']+"               AND \n"+
                "     U.`Handiness`        = '"+data['handiness']+"'        AND \n"+
                "     U.`Gender`           = '"+data['gender']+"'           AND \n"+
                "     U.`Expertise`        = '"+data['expertise']+"'        AND \n"+
                "     U.`ScreenWidth`      =  "+data['screenwidth']+"       AND \n"+
                "     U.`ScreenHeight`     =  "+data['screenheight']+"      AND \n"+
                "     U.`DevicePixelRatio` =  "+data['devicepixelratio']+"  AND \n"+
                "     U.`Model`            = '"+data['model']+"'                 ;"
            connection.query(query,function(err,rows) {
                // console.log(query);
                // console.log(rows);
                connection.release();
                if(!err) {
                    if (typeof rows[0] != 'undefined' && typeof rows[0]['ID'] != 'undefined') {
                        clients[data['id']]['DBid'] = rows[0]['ID'];
                        socket.emit('registered', null);
                        displayListOfCurrentClients();
                    } else {
                        register_participant(data);
                    }
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_trial(db_id) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Motivations` (`User`, `NumberOfTasksPerformed`)    \n"+
                " VALUES ("+db_id+",                                              \n"+
                "         1)                                                      \n"+
                " ON DUPLICATE KEY                                                \n"+
                " UPDATE `NumberOfTasksPerformed` = `NumberOfTasksPerformed` + 1; \n"+
                " SELECT `NumberOfTasksPerformed`                                 \n"+
                " FROM `Motivations`                                              \n"+
                " ORDER BY `NumberOfTasksPerformed` DESC LIMIT 2;                 \n"+
                // " SELECT MAX(`NumberOfTasksPerformed`)                         \n"+
                // " FROM `Motivations`;                                          \n"+
                " SELECT `NumberOfTasksPerformed`                                 \n"+
                " FROM `Motivations` WHERE `User` = "+db_id+";                    \n"+
                " SELECT SUM(`NumberOfTasksPerformed`)                            \n"+
                " FROM `Motivations`;                                               "
            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    var data = {};
                    data['maxperformed'] = rows[1][0]['NumberOfTasksPerformed'];
                    if (typeof rows[1][1] != 'undefined') {
                        data['secondmaxperformed'] = rows[1][1]['NumberOfTasksPerformed'];
                    }
                    data['userperformed'] = rows[2][0]['NumberOfTasksPerformed'];
                    data['sumperformed'] = rows[3][0]['SUM(`NumberOfTasksPerformed`)'];
                    data['was_in_training'] = false;
                    socket.emit('motivations', data);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_tap(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Taps` (`Date`, `User`, `Orientation`, `Grip`, `CenterX`,     \n"+
                "                     `CenterY`, `Radius`, `CompletionTime`, `NumberOfTry`, \n"+
                "                     `EndX`, `EndY`)                                       \n"+
                " VALUES (CURRENT_TIMESTAMP(),                                              \n"+
                "          "+clients[data['id']]['DBid']+",                                 \n"+
                "         '"+data['orientation']+"',                                        \n"+
                "         '"+data['grip']+"',                                               \n"+
                "          "+data['centerx']+",                                             \n"+
                "          "+data['centery']+",                                             \n"+
                "          "+data['radius']+",                                              \n"+
                "          "+data['completiontime']+",                                      \n"+
                "          "+data['numberoftry']+",                                         \n"+
                "          "+data['endx']+",                                                \n"+
                "          "+data['endy']+");                                                 ";

            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    register_trial(clients[data['id']]['DBid']);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_pointing(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Pointings` (`Date`, `User`, `Orientation`, `Grip`,         \n"+
                "                          `StartCenterX`, `StartCenterY`, `StartRadius`, \n"+
                "                          `EndCenterX`, `EndCenterY`, `EndRadius`,       \n"+
                "                          `CompletionTime`, `NumberOfTry`,               \n"+
                "                          `CompletionTimeNoDrag`, `NumberOfTryNoDrag`,   \n"+
                "                          `EndX`, `EndY`)                                \n"+
                " VALUES (CURRENT_TIMESTAMP(),                                            \n"+
                "          "+clients[data['id']]['DBid']+",                               \n"+
                "         '"+data['orientation']+"',                                      \n"+
                "         '"+data['grip']+"',                                             \n"+
                "          "+data['startcenterx']+",                                      \n"+
                "          "+data['startcentery']+",                                      \n"+
                "          "+data['startradius']+",                                       \n"+
                "          "+data['endcenterx']+",                                        \n"+
                "          "+data['endcentery']+",                                        \n"+
                "          "+data['endradius']+",                                         \n"+
                "          "+data['completiontime']+",                                    \n"+
                "          "+data['numberoftry']+",                                       \n"+
                "          "+data['completiontimenodrag']+",                              \n"+
                "          "+data['numberoftrynodrag']+",                                 \n"+
                "          "+data['endx']+",                                              \n"+
                "          "+data['endy']+");                                               ";

            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    register_trial(clients[data['id']]['DBid']);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_drag(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Drags` (`Date`, `User`, `Orientation`, `Grip`,         \n"+
                "                      `StartCenterX`, `StartCenterY`, `StartRadius`, \n"+
                "                      `EndCenterX`, `EndCenterY`, `EndRadius`,       \n"+
                "                      `CompletionTime`, `NumberOfTry`,               \n"+
                "                      `EndX`, `EndY`)                                \n"+
                " VALUES (CURRENT_TIMESTAMP(),                                        \n"+
                "          "+clients[data['id']]['DBid']+",                           \n"+
                "         '"+data['orientation']+"',                                  \n"+
                "         '"+data['grip']+"',                                         \n"+
                "          "+data['startcenterx']+",                                  \n"+
                "          "+data['startcentery']+",                                  \n"+
                "          "+data['startradius']+",                                   \n"+
                "          "+data['endcenterx']+",                                    \n"+
                "          "+data['endcentery']+",                                    \n"+
                "          "+data['endradius']+",                                     \n"+
                "          "+data['completiontime']+",                                \n"+
                "          "+data['numberoftry']+",                                   \n"+
                "          "+data['endx']+",                                          \n"+
                "          "+data['endy']+");                                           ";

            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    register_trial(clients[data['id']]['DBid']);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_rotation(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Rotations` (`Date`, `User`, `Orientation`, `Grip`,   \n"+
                "                      `CenterX`, `CenterY`, `Radius`, `Angle`,     \n"+
                "                      `Aperture`, `CompletionTime`, `NumberOfTry`, \n"+
                "                      `EndAngle`)                                  \n"+
                " VALUES (CURRENT_TIMESTAMP(),                                      \n"+
                "          "+clients[data['id']]['DBid']+",                         \n"+
                "         '"+data['orientation']+"',                                \n"+
                "         '"+data['grip']+"',                                       \n"+
                "          "+data['centerx']+",                                     \n"+
                "          "+data['centery']+",                                     \n"+
                "          "+data['radius']+",                                      \n"+
                "          "+data['angle']+",                                       \n"+
                "          "+data['aperture']+",                                    \n"+
                "          "+data['completiontime']+",                              \n"+
                "          "+data['numberoftry']+",                                 \n"+
                "          "+data['endangle']+");                                     "

            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    register_trial(clients[data['id']]['DBid']);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_scaling(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Scalings` (`Date`, `User`, `Orientation`, `Grip`,            \n"+
                "                      `CenterX`, `CenterY`, `StartRadius`, `TargetRadius`, \n"+
                "                      `Thickness`, `CompletionTime`, `NumberOfTry`,        \n"+
                "                      `EndRadius`)                                         \n"+
                " VALUES (CURRENT_TIMESTAMP(),                                              \n"+
                "          "+clients[data['id']]['DBid']+",                                 \n"+
                "         '"+data['orientation']+"',                                        \n"+
                "         '"+data['grip']+"',                                               \n"+
                "          "+data['centerx']+",                                             \n"+
                "          "+data['centery']+",                                             \n"+
                "          "+data['startradius']+",                                         \n"+
                "          "+data['targetradius']+",                                        \n"+
                "          "+data['thickness']+",                                           \n"+
                "          "+data['completiontime']+",                                      \n"+
                "          "+data['numberoftry']+",                                         \n"+
                "          "+data['endradius']+");                                            ";

            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    register_trial(clients[data['id']]['DBid']);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

    function register_swipe(data) {
        pool.getConnection(function(err,connection) {
            if (err) { datelog(err); return; }

            var query =
                " INSERT INTO `Swipes` (`Date`, `User`, `Orientation`, `Grip`,        \n"+
                "                       `StartCenterX`, `StartCenterY`, `Radius`,     \n"+
                "                       `EndCenterX`, `EndCenterY`, `CompletionTime`, \n"+
                "                       `CompletionMethod`, `NumberOfTry`,            \n"+
                "                       `EndDistance`, `EndSpeed`, `EndX`, `EndY`)    \n"+
                " VALUES (CURRENT_TIMESTAMP(),                                        \n"+
                "          "+clients[data['id']]['DBid']+",                           \n"+
                "         '"+data['orientation']+"',                                  \n"+
                "         '"+data['grip']+"',                                         \n"+
                "          "+data['startcenterx']+",                                  \n"+
                "          "+data['startcentery']+",                                  \n"+
                "          "+data['radius']+",                                        \n"+
                "          "+data['endcenterx']+",                                    \n"+
                "          "+data['endcentery']+",                                    \n"+
                "          "+data['completiontime']+",                                \n"+
                "         '"+data['completionmethod']+"',                             \n"+
                "          "+data['numberoftry']+",                                   \n"+
                "          "+data['enddistance']+",                                   \n"+
                "          "+data['endspeed']+",                                      \n"+
                "          "+data['endx']+",                                          \n"+
                "          "+data['endy']+");                                           ";

            connection.query(query,function(err,rows) {
              // console.log(query);
              // console.log(rows);
                connection.release();
                if(!err) {
                    register_trial(clients[data['id']]['DBid']);
                    return;
                } else {
                    datelog(query);
                    datelog(err);
                    return;
                }
            });

            // connection.on('error', function(err) { console.log(err); return; });
        });
    }

});