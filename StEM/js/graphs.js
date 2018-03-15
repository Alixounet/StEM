/* graphs.js
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

gvar.graphs_on = false;

function toogle_graphs() {
    if (gvar.graphs_on) {
        $("#graphs").animate({
            "top":"80%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    } else {
        $("#graphs").animate({
            "top":"20%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    }
    gvar.graphs_on = !gvar.graphs_on;
}
gvar.toogle_graphs = toogle_graphs;

function resize_graphs() {
    if (!gvar.graphs_on) {
        $("#graphs").css({"top":"80%"});
    } else {
        $("#graphs").css({"top":"20%"});
    }
    gvar.update_data(gvar.last_data);
}
gvar.resize_graphs = resize_graphs;

function set_graphs() {
    document.getElementById("graphs").addEventListener("click", function(evt) {
        gvar.toogle_graphs();
    });
}
gvar.set_graphs = set_graphs;

function dataset_users_into_histogram(dataset_users, filters) {
    var dataset_hist = [];

    for (var k_serie = 0; k_serie < dataset_users.length; k_serie++) {
        var new_entrie = {name: dataset_users["name"], data: []};
        var times = [];
        for (var k_data = 0; k_data < dataset_users[k_serie]["data"].length; k_data++) {
            times.push(dataset_users[k_serie]["data"][k_data]["time"]);
        }
        times.sort(function(a,b) { return a-b; });

        var min_time = times[0];
        var max_time = times[times.length-1];
        var nb_bin = 20;
        var span = (max_time - min_time) / nb_bin;
        var cur_span = min_time;

        if (max_time > min_time) {
            var nb_accounted = 0;
            for (var k_bin = 0; k_bin <= nb_bin; k_bin++) {
                var nb = 0;
                for (var k = 0; k < times.length; k++) {
                    if (times[k] <= cur_span + span) {
                        nb += 1;
                    }
                }

                new_entrie["data"].push({time: (cur_span+0.5*span), nb_users: (nb-nb_accounted), span: span});
                nb_accounted = nb;
                cur_span += span;
            }
            new_entrie["data"].push({time: (cur_span+0.5*span), nb_users: 0, span: span});
            dataset_hist.push(new_entrie);
        }
    }
    return dataset_hist;
}
gvar.dataset_users_into_histogram = dataset_users_into_histogram;

function clean_up_data(dataset_users, users, nb_actions, filters) {
    // clean up users list
    for (var u_id in users) {
        if (users[u_id]["nb"] != nb_actions) {
            delete users[u_id];
        }
    }

    // discard users
    var offset_time = 0;
    for (var k = 0; k < dataset_users.length; k++) {
        if (typeof dataset_users[k]["time"] !== 'undefined') {
            var time = dataset_users[k]["time"];
            offset_time += time;
            delete dataset_users[k]["time"];
            dataset_users[k]["data"] = [];
            for (var u_id in users) {
                dataset_users[k]["data"].push({user: u_id, time: time});
            }
        } else {
            var new_data = [];
            for (var l = 0; l < dataset_users[k]["data"].length; l++) {
                if (typeof users[dataset_users[k]["data"][l]["user"]] !== 'undefined') {
                    new_data.push(dataset_users[k]["data"][l]);
                }
            }
            dataset_users[k]["data"] = new_data;
        }
    }

    for (var k = 0; k < dataset_users.length; k++) {
        dataset_users[k]["data"].sort(function(a,b) { return users[a["user"]]["time"]-users[b["user"]]["time"] })
    }

    var times = [];
    for (var u_id in users) {
        times.push(users[u_id]["time"]);
    }
    times.sort(function(a,b) { return a-b; });
    gvar.time_expert = times[Math.ceil(times.length * filters["expert"]*0.01)] + offset_time;
    gvar.time_novice = times[Math.floor(times.length * (100-filters["novice"])*0.01)] + offset_time;
    gvar.nb_users = times.length;

    return dataset_users;
}
gvar.clean_up_data = clean_up_data;

function prepare_data_user_workspace(data) {
    var dataset_users = []
    var ind = 1;

    var users = {};
    var nb_actions = 0;
    var once = false;
    for (var k_ws = 0; k_ws < data["normal"].length; k_ws++) {
        var serie_name = "Scenario "+ind+": "+data["names"][k_ws];
        var new_serie_user = {data: [], name: serie_name};

        var time_users = {};
        var offset_time = 0;
        var once_user = false;
        for (var k_sc = 0; k_sc < data["normal"][k_ws].length; k_sc++) {
            for (var k_scr = 0; k_scr < data["normal"][k_ws][k_sc].length; k_scr++) {
                for (var k_ax = 0; k_ax < data["normal"][k_ws][k_sc][k_scr].length; k_ax++) {

                    if (data["users"][k_ws][k_sc][k_scr][k_ax]["time"] == null) {
                        new_serie_user["time"] = 20;
                    } else if (data["normal"][k_ws][k_sc][k_scr][k_ax]["type"] == "DWELL" ||
                               data["normal"][k_ws][k_sc][k_scr][k_ax]["type"] == "TIMEOUT") {
                        offset_time += data["users"][k_ws][k_sc][k_scr][k_ax]["time"];
                    } else {
                        if (!once_user) {
                            for (var k_id = 0; k_id < data["users"][k_ws][k_sc][k_scr][k_ax]["time"].length; k_id++) {
                                var u_id = data["users"][k_ws][k_sc][k_scr][k_ax]["time"][k_id]["user"];
                                var u_time = data["users"][k_ws][k_sc][k_scr][k_ax]["time"][k_id]["time"];
                                if (!once) {
                                    users[u_id] = {"time": u_time + offset_time, "nb": 1};
                                } else {
                                    if (typeof users[u_id] !== 'undefined') {
                                        users[u_id]["nb"] += 1;
                                        users[u_id]["time"] += u_time + offset_time;
                                    }
                                }
                                time_users[u_id] = u_time + offset_time;
                            }
                            once = true;
                            once_user = true;
                        } else {
                            for (var k_id = 0; k_id < data["users"][k_ws][k_sc][k_scr][k_ax]["time"].length; k_id++) {
                                var u_id = data["users"][k_ws][k_sc][k_scr][k_ax]["time"][k_id]["user"];
                                if (typeof users[u_id] !== 'undefined' && typeof time_users[u_id] !== 'undefined') {
                                    if (users[u_id]["nb"] == nb_actions) {
                                        users[u_id]["nb"] += 1;
                                        var u_time = data["users"][k_ws][k_sc][k_scr][k_ax]["time"][k_id]["time"];
                                        users[u_id]["time"] += u_time + offset_time;
                                        time_users[u_id] += u_time + offset_time;
                                    } else {
                                        delete users[u_id];
                                        delete time_users[u_id];
                                    }
                                }
                            }
                        }
                        offset_time = 0;
                        nb_actions += 1
                    }
                }
            }
        }
        for (var u_id in time_users) {
            new_serie_user["data"].push({user: u_id, time: time_users[u_id]+offset_time});
        }
        dataset_users.push(new_serie_user);
        ind += 1;
    }

    return clean_up_data(dataset_users,users,nb_actions,data["filters"]);
}
gvar.prepare_data_user_workspace = prepare_data_user_workspace;

function prepare_data_user_scenario(data) {
    var dataset_users = []
    var ind = 1;

    var users = {};
    var nb_actions = 0;
    var once = false;
    for (var k_sc = 0; k_sc < data["normal"].length; k_sc++) {
        var serie_name = "Screen "+ind+": "+data["names"][k_sc];
        var new_serie_user = {data: [], name: serie_name};

        var time_users = {};
        var offset_time = 0;
        var once_user = false;
        for (var k_scr = 0; k_scr < data["normal"][k_sc].length; k_scr++) {
            for (var k_ax = 0; k_ax < data["normal"][k_sc][k_scr].length; k_ax++) {

                if (data["users"][k_sc][k_scr][k_ax]["time"] == null) {
                    new_serie_user["time"] = 20;
                } else if (data["normal"][k_sc][k_scr][k_ax]["type"] == "DWELL" ||
                           data["normal"][k_sc][k_scr][k_ax]["type"] == "TIMEOUT") {
                    offset_time += data["users"][k_sc][k_scr][k_ax]["time"];
                } else {
                    if (!once_user) {
                        for (var k_id = 0; k_id < data["users"][k_sc][k_scr][k_ax]["time"].length; k_id++) {
                            var u_id = data["users"][k_sc][k_scr][k_ax]["time"][k_id]["user"];
                            var u_time = data["users"][k_sc][k_scr][k_ax]["time"][k_id]["time"];
                            if (!once) {
                                users[u_id] = {"time": u_time + offset_time, "nb": 1};
                            } else {
                                if (typeof users[u_id] !== 'undefined') {
                                    users[u_id]["nb"] += 1;
                                    users[u_id]["time"] += u_time + offset_time;
                                }
                            }
                            time_users[u_id] = u_time + offset_time;
                        }
                        once = true;
                        once_user = true;
                    } else {
                        for (var k_id = 0; k_id < data["users"][k_sc][k_scr][k_ax]["time"].length; k_id++) {
                            var u_id = data["users"][k_sc][k_scr][k_ax]["time"][k_id]["user"];
                            if (typeof users[u_id] !== 'undefined' && typeof time_users[u_id] !== 'undefined') {
                                if (users[u_id]["nb"] == nb_actions) {
                                    users[u_id]["nb"] += 1;
                                    var u_time = data["users"][k_sc][k_scr][k_ax]["time"][k_id]["time"];
                                    users[u_id]["time"] += u_time + offset_time;
                                    time_users[u_id] += u_time + offset_time;
                                } else {
                                    delete users[u_id];
                                    delete time_users[u_id];
                                }
                            }
                        }
                    }
                    offset_time = 0;
                    nb_actions += 1
                }
            }
        }
        for (var u_id in time_users) {
            new_serie_user["data"].push({user: u_id, time: time_users[u_id]+offset_time});
        }
        dataset_users.push(new_serie_user);
        ind += 1;
    }

    return clean_up_data(dataset_users,users,nb_actions,data["filters"]);
}
gvar.prepare_data_user_scenario = prepare_data_user_scenario;

function prepare_data_user_screen(data) {
    var dataset_users = []
    var ind = 1;

    var users = {};
    var nb_actions = 0;
    var once = false;

    // gather and format
    for (var k_scr = 0; k_scr < data["normal"].length; k_scr++) {
        for (var k_ax = 0; k_ax < data["normal"][k_scr].length; k_ax++) {
            var serie_name = "Axiom "+ind+": "+data["normal"][k_scr][k_ax]["type"];
            var new_serie_user = {data: [], name: serie_name};

            if (data["users"][k_scr][k_ax]["time"] == null) {
                new_serie_user["time"] = 20;
            } else if (data["normal"][k_scr][k_ax]["type"] == "DWELL" ||
                       data["normal"][k_scr][k_ax]["type"] == "TIMEOUT") {
                new_serie_user["time"] = data["users"][k_scr][k_ax]["time"];
            } else {
                
                if (!once) {
                    for (var k_id = 0; k_id < data["users"][k_scr][k_ax]["time"].length; k_id++) {
                        var u_id = data["users"][k_scr][k_ax]["time"][k_id]["user"];
                        var u_time = data["users"][k_scr][k_ax]["time"][k_id]["time"];
                        users[u_id] = {"time": u_time, "nb": 1};
                        new_serie_user["data"].push({user: u_id, time: u_time});
                    }
                    once = true;
                } else {
                    for (var k_id = 0; k_id < data["users"][k_scr][k_ax]["time"].length; k_id++) {
                        var u_id = data["users"][k_scr][k_ax]["time"][k_id]["user"];
                        if (typeof users[u_id] !== 'undefined') {
                            if (users[u_id]["nb"] == nb_actions) {
                                users[u_id]["nb"] += 1;
                                var u_time = data["users"][k_scr][k_ax]["time"][k_id]["time"];
                                users[u_id]["time"] += u_time;
                                new_serie_user["data"].push({user: u_id, time: u_time});
                            } else {
                                delete users[u_id];
                            }
                        }
                    }
                }
                nb_actions += 1
            }

            dataset_users.push(new_serie_user);

            ind += 1;
        }
    }

    return clean_up_data(dataset_users,users,nb_actions,data["filters"]);
}
gvar.prepare_data_user_screen = prepare_data_user_screen;

gvar.nb_scenarios = 1;
function prepare_data_workspace(data) {
    gvar.nb_scenarios = 0;
    var dataset = []
    var ind = 1;
    for (var k_ws = 0; k_ws < data["normal"].length; k_ws++) {
        var expt = 0;
        var norm = 0;
        var novc = 0;
        var serie_name = "Scenario "+ind+": "+data["names"][k_ws];
        gvar.nb_scenarios += 1;
        var stop = false;
        for (var k_sc = 0; k_sc < data["normal"][k_ws].length; k_sc++) {
            for (var k_scr = 0; k_scr < data["normal"][k_ws][k_sc].length; k_scr++) {
                for (var k_ax = 0; k_ax < data["normal"][k_ws][k_sc][k_scr].length; k_ax++) {
                    if (data["normal"][k_ws][k_sc][k_scr][k_ax]["time"] == null) {
                        expt = norm = novc = 20;
                        serie_name += " (not ready)";
                        stop = true;
                        break;
                    } else {
                        expt += data["expert"][k_ws][k_sc][k_scr][k_ax]["time"];
                        norm += data["normal"][k_ws][k_sc][k_scr][k_ax]["time"];
                        novc += data["novice"][k_ws][k_sc][k_scr][k_ax]["time"];
                    }
                }
                if (stop) { break; }
            }
            if (stop) { break; }
        }
        var new_serie = {data: [{ user_type: 'Fastest '+data["filters"]["expert"]+'%', time: expt },
                                { user_type: 'All', time: norm },
                                { user_type: 'Slowest '+data["filters"]["novice"]+'%', time: novc }],
                         name: serie_name }
        dataset.push(new_serie);
        ind += 1;
    }
    return dataset;
}
gvar.prepare_data_workspace = prepare_data_workspace;

function prepare_data_scenario(data) {
    var dataset = []
    var ind = 1;
    for (var k_sc = 0; k_sc < data["normal"].length; k_sc++) {
        var expt = 0;
        var norm = 0;
        var novc = 0;
        var serie_name = "Screen "+ind+": "+data["names"][k_sc];
        var stop = false;
        for (var k_scr = 0; k_scr < data["normal"][k_sc].length; k_scr++) {
            for (var k_ax = 0; k_ax < data["normal"][k_sc][k_scr].length; k_ax++) {
                if (data["normal"][k_sc][k_scr][k_ax]["time"] == null) {
                    expt = norm = novc = 20;
                    serie_name += " (not ready)";
                    stop = true;
                    break;
                } else {
                    expt += data["expert"][k_sc][k_scr][k_ax]["time"];
                    norm += data["normal"][k_sc][k_scr][k_ax]["time"];
                    novc += data["novice"][k_sc][k_scr][k_ax]["time"];
                }
            }
            if (stop) { break; }
        }
        var new_serie = {data: [{ user_type: 'Fastest '+data["filters"]["expert"]+'%', time: expt },
                                { user_type: 'All', time: norm },
                                { user_type: 'Slowest '+data["filters"]["novice"]+'%', time: novc }],
                         name: serie_name }
        dataset.push(new_serie);
        ind += 1;
    }
    return dataset;
}
gvar.prepare_data_scenario = prepare_data_scenario;

function prepare_data_screen(data) {
    var dataset = []
    var ind = 1;
    for (var k_scr = 0; k_scr < data["normal"].length; k_scr++) {
        for (var k_ax = 0; k_ax < data["normal"][k_scr].length; k_ax++) {
            var expt = data["expert"][k_scr][k_ax]["time"];
            var norm = data["normal"][k_scr][k_ax]["time"];
            var novc = data["novice"][k_scr][k_ax]["time"];
            var serie_name = "Axiom "+ind+": "+data["normal"][k_scr][k_ax]["type"];
            if (norm == null) {
                expt = norm = novc = 20;
                serie_name += " (not ready)";
            }
            var new_serie = {data: [{ user_type: 'Fastest '+data["filters"]["expert"]+'%', time: expt },
                                    { user_type: 'All', time: norm },
                                    { user_type: 'Slowest '+data["filters"]["novice"]+'%', time: novc }],
                             name: serie_name }
            dataset.push(new_serie);
            ind += 1;
        }
    }

    return dataset;
}
gvar.prepare_data_screen = prepare_data_screen;

gvar.time_expert = null;
gvar.time_novice = null;
gvar.nb_users = null;
gvar.last_data = null;

// gvar.colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

gvar.colors = ["#b5a633", "#b59210", "#4ea1a6", "#19698c", "#0f3c77"];
// gvar.colors = ["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628"];
gvar.colors = ["#f15854", "#faa43a", "#60bd68", "#5da5da", "#b276b2"]

function update_data(data) {
    if (data == null) {
        $(".placeholder").show();
        return;
    } else {
        $(".placeholder").hide();
    }
    gvar.last_data = data;
    //Object {
    //     type: "screen",
    //     filters: Object,
    //     expert: [ [{"time": 200, "type": "TAP"}] ],
    //     normal: [ [{"time": 250, "type": "TAP"}] ],
    //     novice: [ [{"time": 300, "type": "TAP"}] ],
    // }

    d3.selectAll("svg > *").remove();

    // for Screen
    // var dataset = [{data: [{ user_type: 'Experts (fastest X%)', time: 300 },
    //                        { user_type: 'All', time: 400 },
    //                        { user_type: 'Novices (slowest Y%)', time: 500 }],
    //                 name: 'Ax 1: TAP' },
    //                {data: [{ user_type: 'Experts (fastest X%)', time: 350 },
    //                        { user_type: 'All', time: 470 },
    //                        { user_type: 'Novices (slowest Y%)', time: 520 }],
    //                 name: 'Ax 2: POINTING' }];
    var dataset = [];
    var dataset_users = [];
    if (data["type"] == "screen") {
        gvar.stacked = true;
        dataset = gvar.prepare_data_screen(data);
        dataset_users = gvar.prepare_data_user_screen(data);
    } else if (data["type"] == "scenario") {
        gvar.stacked = true;
        dataset = gvar.prepare_data_scenario(data);
        dataset_users = gvar.prepare_data_user_scenario(data);
    } else if (data["type"] == "workspace") {
        gvar.stacked = false;
        dataset = gvar.prepare_data_workspace(data);
        dataset_users = gvar.prepare_data_user_workspace(data);
    } else {
        return;
    }
    dataset_hist = gvar.dataset_users_into_histogram(dataset_users, data["filters"])

    gvar.plot_stack_chart(dataset);
    gvar.plot_stack_user_chart(dataset_users,data["filters"],false);
    gvar.stacked = false;
    gvar.plot_stack_user_chart(dataset_hist,data["filters"],true);
}
gvar.update_data = update_data;

function plot_stack_chart(dataset) {
    var nb_series = dataset.length;

    var margins = {top: 0, left: 130, right: 0, bottom: 24},
    legendPanel = { width: 300 },
          width = $("#stacked_bar").width() - margins.left - margins.right - legendPanel.width,
         height = $("#stacked_bar").height() - margins.top - margins.bottom,
        series  = dataset.map(function (d) { return d.name; }),
        dataset = dataset.map(function (d) {
                      return d.data.map(function (o, i) {
                          // Structure it so that your numeric
                          // axis (the stacked amount) is y
                         return { y: o.time, x: o.user_type };
                      });
                  }),
          stack = d3.layout.stack();
    stack(dataset);

    var dataset = dataset.map(function (group) {
                      return group.map(function (d) {
                          // Invert the x and y values, and y0 becomes x0
                          return { x: d.y, y: d.x, x0: d.y0 };
                      });
                  }),
            svg = d3.select('#stacked_bar').append('svg')
                .attr('width', width + margins.left + margins.right + legendPanel.width)
                .attr('height', height + margins.top + margins.bottom).append('g')
                .attr('transform', 'translate(' + margins.left + ',' + (margins.top-0.75*height-20) + ')'),
           xMax = d3.max(dataset, function (group) {
                      return d3.max(group, function (d) {
                          return (gvar.stacked?(d.x+d.x0):d.x);
                      });
                  }),
         xScale = d3.scale.linear().domain([0, xMax]).range([0, width]),
     user_types = dataset[0].map(function (d) { return d.y; }),
         yScale = d3.scale.ordinal().domain(user_types).rangeRoundBands([0.75*height+20,height], .05),
          xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
          yAxis = d3.svg.axis().scale(yScale).orient('left'),
        colours = d3.scale.ordinal().range(gvar.colors),
         groups = svg.selectAll('g').data(dataset).enter().append('g').style('fill', function (d, i) {
                      return colours(i);
                  }),
            ind = 0,
          rects = groups.selectAll('rect').data(function (d) {
                      return d;
                  }).enter().append('rect').attr('x', function (d) {
                      return (gvar.stacked?xScale(d.x0):0);
                  }).attr('y', function (d, i) {
                      // return yScale(d.y);
                      var vy = yScale(d.y) + (ind / 3)*(yScale.rangeBand()/nb_series);
                      ind += 1;
                      if (ind >= 3*nb_series) { ind = 0; }
                      return (gvar.stacked?yScale(d.y):vy);
                  }).attr('height', function (d) {
                      return (gvar.stacked?yScale.rangeBand():yScale.rangeBand()/gvar.nb_scenarios);
                  }).attr('width', function (d) {
                      return xScale(d.x);
                  }).on('mouseover', function (d) {
                      var xPos = parseFloat(d3.select(this).attr('x')) + 100;
                      var yPos = parseFloat(d3.select(this).attr('y')) + yScale.rangeBand() / 2;

                      d3.select('#tooltip').style('left', xPos + 'px').style('top', yPos - (0.75*height+20) + 'px').select('#value').text(parseInt(d.x)+" ms");
                      d3.select('#tooltip').classed('hidden', false);
                  }).on('mouseout', function () {
                      d3.select('#tooltip').classed('hidden', true);
                  })

    svg.append('g').attr('class', 'axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
    svg.append('g').attr('class', 'axis').call(yAxis);

    series.forEach(function (s, i) {
        svg.append('rect').attr('fill', colours(i))
                          .attr('width', width*0.5)
                          .attr('height', 10)
                          .attr('x', width + margins.left )
                          .attr('y', i * 10 + 6 + 0.75*height+20);
        svg.append('text').attr('fill', 'black')
                          .attr('x', width + margins.left + 4)
                          .attr('y', i * 10 + 14 + 0.75*height+20)
                          .text(s);
    });
}
gvar.plot_stack_chart = plot_stack_chart;

gvar.stacked = false;
function plot_stack_user_chart(dataset,filters,distribution) {
    // console.log("start")
    // console.log(dataset);
    var nb_series = dataset.length;

    var margins = {top: 0, left: 50, right: 0, bottom: (!distribution?8:20)},
    legendPanel = { width: 0 },
          width = $((!distribution?"#user_stacked_bar":"#distribution")).width() - margins.left - margins.right - legendPanel.width,
         height = $((!distribution?"#user_stacked_bar":"#distribution")).height() - margins.top - margins.bottom,
        series  = dataset.map(function (d) { return d.name; }),
        dataset = dataset.map(function (d) {
                      return d.data.map(function (o, i) {
                          // Structure it so that your numeric
                          // axis (the stacked amount) is y
                         if (!distribution) {
                            return { y: o.time, x: o.user };
                        } else {
                            return { y: o.nb_users, x: o.time, span: o.span};
                        }
                      });
                  }),
          stack = d3.layout.stack();
    stack(dataset);

    var dataset = dataset.map(function (group) {
                      return group.map(function (d) {
                          // Invert the x and y values, and y0 becomes x0
                          return { x: d.x, y: d.y, y0: d.y0, x0: d.x0, span: d.span };
                      });
                  }),
            svg = d3.select((!distribution?"#user_stacked_bar":"#distribution")).append('svg')
                .attr('width', width + margins.left + margins.right + legendPanel.width)
                .attr('height', height + margins.top + margins.bottom).append('g')
                .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')'),
           yMax = d3.max(dataset, function (group) {
                      return d3.max(group, function (d) {
                          return (gvar.stacked?d.y+d.y0:d.y);;
                      });
                  });
        var users = (!distribution?dataset[0].map(function (d) { return d.x; }):null);
         var xMax = (!distribution?null:d3.max(dataset, function (group) {
                                           return d3.max(group, function (d) {
                                               return d.x;
                                           });
                                       }));
         var xScale = (!distribution?d3.scale.ordinal().domain(users).rangeRoundBands([0, width], 0):
                        d3.scale.linear().domain([0, xMax]).range([0,width]));

     var yScale = d3.scale.linear().domain([0, yMax]).range([height,0]),
          xAxis = d3.svg.axis().scale(xScale).orient('bottom'),
          yAxis = d3.svg.axis().scale(yScale).orient('left'),
        colours = d3.scale.ordinal().range(gvar.colors),
         groups = svg.selectAll('g').data(dataset).enter().append('g').style('fill', function (d, i) {
                      return colours(i);
                  }),
            ind = 0,
          rects = groups.selectAll('rect').data(function (d) {
                      return d;
                  }).enter().append('rect').attr('x', function (d,i) {
                      if (!distribution) {
                          var vx = xScale(d.x) + (ind / gvar.nb_users)*(xScale.rangeBand()/nb_series);
                          ind += 1;
                          if (ind >= gvar.nb_users*nb_series) { ind = 0; }
                          return (gvar.stacked?xScale(d.x):vx);
                      } else {
                          return xScale(d.x - d.span*0.5);
                      }
                  }).attr('y', function (d) {
                      return (gvar.stacked?yScale(d.y0+d.y):yScale(d.y));
                  }).attr('height', function (d) {
                      return height-yScale(d.y);
                  }).attr('width', function (d) {
                      if (!distribution) {
                          return (gvar.stacked?xScale.rangeBand():xScale.rangeBand() / nb_series);
                      } else {
                          return xScale(d.span);
                      }
                  }).attr('opacity',(!distribution?1:0.7)).on('mouseover', function (d) {
                      var xPos = (!distribution?parseFloat(d3.select(this).attr('x')) + xScale.rangeBand() / 2:
                                                xScale(d.x)+$("#distribution").width());
                      var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2;

                      d3.select((!distribution?"#tooltip_user":"#tooltip_distrib"))
                        .style('left', xPos + 'px').style('top', yPos + 'px')
                        .select('#value').text(parseInt(d.y)+(!distribution?" ms":" users"));
                      d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).classed('hidden', false);
                  }).on('mouseout', function () {
                      d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).classed('hidden', true);
                  })

    svg.append('g').attr('class', 'axis').attr('transform', 'translate(0,' + height + ')').call(xAxis);
    svg.append('g').attr('class', 'axis').call(yAxis);

    if (!distribution && !isNaN(gvar.time_expert)) {
    svg.append('rect').attr('fill', "#000000")
                      .attr('width', 1)
                      .attr('height', height-yScale(gvar.time_expert))
                      .attr('x', width*filters["expert"]*0.01)
                      .attr('y', yScale(gvar.time_expert))
                      .on('mouseover', function (d) {
                          var xPos = parseFloat(d3.select(this).attr('x')) + xScale.rangeBand() / 2;
                          var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2;

                          d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).style('left', xPos + 'px').style('top', yPos + 'px').select('#value').text('Experts (fastest '+filters["expert"]+'%)');
                          d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).classed('hidden', false);
                      }).on('mouseout', function () {
                          d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).classed('hidden', true);
                      });
    svg.append('rect').attr('fill', "#000000")
                      .attr('width', 1)
                      .attr('height', height-yScale(gvar.time_novice))
                      .attr('x', width*(100-filters["novice"])*0.01)
                      .attr('y', yScale(gvar.time_novice))
                      .on('mouseover', function (d) {
                          var xPos = parseFloat(d3.select(this).attr('x')) + xScale.rangeBand() / 2;
                          var yPos = parseFloat(d3.select(this).attr('y')) / 2 + height / 2;

                          d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).style('left', xPos + 'px').style('top', yPos + 'px').select('#value').text('Novices (slowest '+filters["novice"]+'%)');
                          d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).classed('hidden', false);
                      }).on('mouseout', function () {
                          d3.select((!distribution?"#tooltip_user":"#tooltip_distrib")).classed('hidden', true);
                      });
    }
}
gvar.plot_stack_user_chart = plot_stack_user_chart;