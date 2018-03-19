/* workspace.js
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

gvar.workspace_on = true;

function enable_workspace(val,change_view) {
    if (val == gvar.workspace_on) { return; }
    gvar.workspace_on = val;
    gvar.toogle_workspace();
    if (change_view) {
        if (gvar.workspace_on) {
            gvar.ws_hist[gvar.cur_ws_hist]["view"] = "ws";
            gvar.enable_scenario(false,false);
        } else {
            gvar.enable_scenario(true,change_view);
        }
    }
}
gvar.enable_workspace = enable_workspace;

function toogle_workspace() {
    if (!gvar.workspace_on) {
        // $("#workspace").css("right","100%");
        $("#workspace").animate({
            "right": "100%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    } else {
        // $("#workspace").css("right","0%");
        $("#workspace").animate({
            "right":"0%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
        if (gvar.tutorial_on) { gvar.tuto_next_step(); }
    }
}
gvar.toogle_workspace = toogle_workspace;

gvar.ws_top_button = 0;
function resize_workspace() {
    if (!gvar.workspace_on) {
        $("#workspace").css({"right": "100%"});
    } else {
        $("#workspace").css({"right":"0%"});
    }
    
    var ch = document.getElementById("scenarios").clientHeight;
    var offset = $("#scenarios").height()*document.getElementById("scenarios").scrollTop/ch;
    document.getElementById("workspace_but").style.bottom = (5-offset)+"px";
}
gvar.resize_workspace = resize_workspace;

function set_workspace() {
    document.getElementById("scenarios").addEventListener("scroll", function(evt) {
        var ch = document.getElementById("scenarios").clientHeight;
        var offset = $("#scenarios").height()*document.getElementById("scenarios").scrollTop/ch;
        document.getElementById("workspace_but").style.bottom = (5-offset)+"px";
    });

    document.getElementById("workspace_icon").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.enable_workspace(!gvar.workspace_on,true);
        gvar.update_views();
    });

    document.getElementById("workspace_add").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.add_scenario();
        gvar.update_views();

        if (gvar.tutorial_on) { gvar.tuto_next_step(); }
    });
    document.getElementById("workspace_clone").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.add_scenario(gvar.clone_scenario());
        gvar.update_views();
    });
    document.getElementById("workspace_delete").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.delete_scenario();
        gvar.update_views();
    });

    document.getElementById("workspace_undo").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.undo();
        gvar.update_views();
    });
    document.getElementById("workspace_redo").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.redo();
        gvar.update_views();
    });
    document.getElementById("workspace_save").addEventListener("click", function(evt) {
        gvar.clean_views();
        var to_save = {"type":"workspace", "data":gvar.save_workspace()};
        // window.open('data:text/plain;charset=utf-8,' + escape(JSON.stringify(to_save)));

        var blob = new Blob([escape(JSON.stringify(to_save))], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "workspace.sws");

        gvar.update_views();
    });

    function httpGet(url) {
        var xmlHttp = null;
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
        xmlHttp.responseType = "blob";
        xmlHttp.onload = function(e) {
            var blob = xmlHttp.response;
            var _reader = new FileReader()
            _reader.onload = function (e) {
                try {
                    var res = e.target.result
                    res = res.slice(3,res.length)
                    data = JSON.parse(unescape(res));
                    if (data["type"] == "workspace") {
                        gvar.clean_views();
                        gvar.store_current_history();
                        gvar.ws_hist[gvar.cur_ws_hist] = gvar.load_workspace(data["data"]);
                        gvar.update_views();
                    } else if (data["type"] == "scenario") {
                        gvar.clean_views();
                        gvar.store_current_history();
                        add_scenario(gvar.load_scenario(data["data"]));
                        gvar.update_views();
                    } else {
                        gvar.set_general_error("The loaded file does not describe a scenario nor a workspace but a "+data["type"]+".");
                    }
                } catch(err) {
                    gvar.set_general_error("The loaded file is not recognized.");
                }
                $("#hidden_workspace_load").prop("value","");
            }
            _reader.readAsBinaryString(blob)
        };

        // var xmlHttp = null;
        // xmlHttp = new XMLHttpRequest();
        // xmlHttp.open("GET", url, false);
        // xmlHttp.send(null);
        // return xmlHttp.responseText;
    }
    gvar.httpGet_workspace = httpGet;
    function readData(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = httpGet(e.target.result);
                // data = JSON.parse(data);
                // if (data["type"] == "workspace") {
                //     gvar.clean_views();
                //     gvar.store_current_history();
                //     gvar.ws_hist[gvar.cur_ws_hist] = gvar.load_workspace(data["data"]);
                //     gvar.update_views();
                // }
                // $("#hidden_workspace_load").prop("value","");
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#hidden_workspace_load").change(function() { readData(this); });
    $("#hidden_workspace_load").hide();
    document.getElementById("workspace_load").addEventListener("click", function(evt) { $("#hidden_workspace_load").click(); });

    gvar.ws_hist = [{"view": "ws", "selected": null, "scenario_list": []}];
    gvar.cur_ws_hist = 0;
}
gvar.set_workspace = set_workspace;

function clone_workspace(ws) {
    ws = (typeof sc !== 'undefined' ? ws : gvar.ws_hist[gvar.cur_ws_hist]);

    var new_ws = {}
    new_ws["view"] = ws["view"];
    new_ws["selected"] = ws["selected"];
    var new_sc_list = [];
    for (var k = 0; k < ws["scenario_list"].length; k++) {
        new_sc_list.push(gvar.clone_scenario(ws["scenario_list"][k]));
    }
    new_ws["scenario_list"] = new_sc_list;
    return new_ws;
}
gvar.clone_workspace = clone_workspace;

//////////////////////
// Calbacks //////////
function select_scenario(evt,ind) {
    var ws = gvar.ws_hist[gvar.cur_ws_hist];
    var sc;
    if (ws["selected"] != null) {
        sc = ws["scenario_list"][ws["selected"]];
        $("#"+sc['div'].id).removeClass("selected");
    }
    ws["selected"] = ind;
    sc = ws["scenario_list"][ind];
    $("#"+sc['div'].id).addClass("selected");
}
gvar.select_scenario = select_scenario;

function open_scenario(evt,ind) {
    gvar.clean_views();
    gvar.store_current_history();
    gvar.enable_workspace(false,true);
    gvar.set_cur_scenario(gvar.ws_hist[gvar.cur_ws_hist]["selected"]);
    gvar.update_views();

    if (gvar.tutorial_on) { gvar.tuto_next_step(); }
}
gvar.open_scenario = open_scenario;
//////////////////////
//////////////////////

function create_div_scenario() {
    var div = document.createElement('div');
    div.className = "elem has_tooltip";
    div.id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    return div;
}
gvar.create_div_scenario = create_div_scenario;

function add_scenario(sc) {
    var new_sc = null;

    if (typeof sc === 'undefined') {
        new_sc = {}
        new_sc["name"] = "My Scenario";
        new_sc["width"] = $("#phone_width").spinner("value");
        new_sc["height"] = $("#phone_height").spinner("value");
        new_sc["div"] = gvar.create_div_scenario();
        new_sc["listeners"] = [];
        new_sc["listeners"].push({"event": "click", "callback":gvar.select_scenario}); // selection
        new_sc["listeners"].push({"event": "dblclick", "callback":gvar.open_scenario}); // open
        new_sc["selected"] = null;
        new_sc["screen_list"] = [];
    } else {
        new_sc = gvar.clone_scenario(sc);
    }
    var ws = gvar.ws_hist[gvar.cur_ws_hist];
    ws["scenario_list"].push(new_sc);
    ws["selected"] = ws["scenario_list"].length-1;
    new_sc["div"].className += " selected";
}
gvar.add_scenario = add_scenario;

function clone_scenario(sc) {
    var ws = gvar.ws_hist[gvar.cur_ws_hist];
    if (typeof sc === 'undefined') {
        if (ws["selected"] == null) {
            return;
        }
    }
    sc = (typeof sc !== 'undefined' ? sc : ws["scenario_list"][ws["selected"]]);

    var new_sc = {}
    new_sc["name"] = sc["name"];
    new_sc["width"] = sc["width"];
    new_sc["height"] = sc["height"];
    new_sc["div"] = sc["div"].cloneNode(true);
    new_sc["div"].id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    var new_listeners = [];
    for (var k = 0; k < sc["listeners"].length; k++) {
        new_listeners.push({"event":    sc["listeners"][k]["event"],
                            "callback": sc["listeners"][k]["callback"]});
    }
    new_sc["listeners"] = new_listeners;
    new_sc["selected"] = sc["selected"];
    var new_scr_list = [];
    for (var k = 0; k < sc["screen_list"].length; k++) {
        new_scr_list.push(gvar.clone_screen(sc["screen_list"][k]));
    }
    new_sc["screen_list"] = new_scr_list;
    return new_sc;
}
gvar.clone_scenario = clone_scenario;

function delete_scenario(sc) {
    if (typeof sc === 'undefined') {
        var ws = gvar.ws_hist[gvar.cur_ws_hist];
        if (ws["selected"] == null) {
            return;
        }
        var sc_list = ws["scenario_list"];
        var ind = ws["selected"];
        sc = sc_list[ind];
        sc_list.splice(ind,1);
        ind = (ind<sc_list.length?ind:sc_list.length-1);
        ind = (ind<0?null:ind);
        ws["selected"] = ind;
        if (ind != null) {
            sc_list[ind]["div"].className += " selected" ;
        }
    }
    delete sc;
    return null;
}
gvar.delete_scenario = delete_scenario;

function save_workspace(ws) {
    if (typeof ws === 'undefined') {
        ws = gvar.ws_hist[gvar.cur_ws_hist];
    }

    var to_save = gvar.clone_workspace(ws);
    for (var k = 0; k < to_save["scenario_list"].length; k++) {
        to_save["scenario_list"][k] = gvar.save_scenario(to_save["scenario_list"][k]);
    }
    return JSON.stringify(to_save);
}
gvar.save_workspace = save_workspace;

function load_workspace(data) {
    var ws = JSON.parse(data);
    for (var k = 0; k < ws["scenario_list"].length; k++) {
        ws["scenario_list"][k] = gvar.load_scenario(ws["scenario_list"][k]);
    }
    return ws;
}
gvar.load_workspace = load_workspace;