/* scenario.js
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

gvar.scenario_on = false;
gvar.cur_ind_sc = null;

function enable_scenario(val,change_view) {
    if (val == gvar.scenario_on) { return; }
    gvar.scenario_on = val;
    gvar.toogle_scenario();
    if (change_view) {
        if (gvar.scenario_on) {
            gvar.ws_hist[gvar.cur_ws_hist]["view"] = "sc";
            gvar.enable_screen(false,false);
        } else {
            gvar.enable_screen(true,change_view);
        }
    }
}
gvar.enable_scenario = enable_scenario;

function set_cur_scenario(ind) {
    gvar.cur_ind_sc = ind;
    // set current attributes
    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    $("#scenario_name")[0].value = sc["name"];
    $("#phone_width")[0].value = sc["width"];
    $("#phone_height")[0].value = sc["height"];
}
gvar.set_cur_scenario = set_cur_scenario;

function scenario_changed() {
    if (gvar.cur_ind_sc == null) {
        return;
    }
    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    sc["name"] = $("#scenario_name")[0].value;
    sc["width"] = $("#phone_width")[0].value;
    sc["height"] = $("#phone_height")[0].value;
}
gvar.scenario_changed = scenario_changed;

function toogle_scenario() {
    if (!gvar.scenario_on) {
        // $("#scenario").css("right","100%");
        $("#scenario").animate({
            "right": "100%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    } else {
        // $("#scenario").css("right","0%");
        $("#scenario").animate({
            "right": "0%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    }
}
gvar.toogle_scenario = toogle_scenario;

function resize_scenario() {
    if (!gvar.scenario_on) {
        $("#scenario").css({"right": "100%"});
    } else {
        $("#scenario").css({"right":"0%"});
    }

    if (($("#phone_width").spinner("value") != null) &&
        ($("#phone_height").spinner("value") != null)) {
        var w = $("#phone_width").spinner("value");
        var h = $("#phone_height").spinner("value");
        // if (gvar.isPortrait(w,h)) {
        if (gvar.isTallerThanWide(w,h,false)) {
            $("#phone").css({"height": "calc(100% - 300px)"});
            $("#phone").css({"width": (($("#phone").height()-15-30)*w/h)+"px"});
        } else {
            $("#phone").css({"width": "calc(30% - 185px)"});
            $("#phone").css({"height": ($("#phone").width()*h/w +15+30)+"px"});
        }
    }

    var ch = document.getElementById("screens").clientHeight;
    var offset = $("#screens").height()*document.getElementById("screens").scrollTop/ch;
    document.getElementById("scenario_but").style.bottom = (5-offset)+"px";
}
gvar.resize_scenario = resize_scenario;

function set_scenario() {
    document.getElementById("screens").addEventListener("scroll", function(evt) {
        var ch = document.getElementById("screens").clientHeight;
        var offset = $("#screens").height()*document.getElementById("screens").scrollTop/ch;
        document.getElementById("scenario_but").style.bottom = (5-offset)+"px";
    });

    document.getElementById("scenario_icon").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.save_changes_with_buffer();
        gvar.enable_scenario(!gvar.scenario_on,true);
        gvar.update_views();
    });

    function aux() {
        if (gvar.cur_ind_sc != null) {
            gvar.clean_views();
            gvar.save_changes_with_buffer();
            gvar.scenario_changed();
            gvar.update_views();
        }
        gvar.resize_scenario();
    }
    $("#scenario_name").on("change paste keyup", function(evt) { aux(); });

    $("#phone_width").spinner({
        change: function(event, ui) { gvar.resize_scenario(); },
        stop: function(event, ui) { aux(); }
    });
    $("#phone_height").spinner({
        change: function(event, ui) { gvar.resize_scenario(); },
        stop: function(event, ui) { aux(); }
    });
    $("#phone_width").spinner().spinner("value", 62);
    $("#phone_height").spinner().spinner("value", 110);

    document.getElementById("scenario_add").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.add_screen();
        gvar.update_views();
    });
    document.getElementById("scenario_clone").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.add_screen(gvar.clone_screen());
        gvar.update_views();
    });
    document.getElementById("scenario_delete").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.delete_screen();
        gvar.update_views();
    });

    document.getElementById("scenario_undo").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.undo();
        gvar.update_views();
    });
    document.getElementById("scenario_redo").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.redo();
        gvar.update_views();
    });
    document.getElementById("scenario_save").addEventListener("click", function(evt) {
        gvar.clean_views();
        var to_save = {"type":"scenario", "data":gvar.save_scenario()};
        // window.open('data:text/plain;charset=utf-8,' + escape(JSON.stringify(to_save)));

        var blob = new Blob([escape(JSON.stringify(to_save))], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "scenario.ssc");

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
                    if (data["type"] == "scenario") {
                        gvar.clean_views();
                        gvar.store_current_history();
                        gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc] = gvar.load_scenario(data["data"]);
                        gvar.set_cur_scenario(gvar.cur_ind_sc);
                        gvar.update_views();
                    } else if (data["type"] == "screen") {
                        gvar.clean_views();
                        gvar.store_current_history();
                        add_screen(gvar.load_screen(data["data"]));
                        gvar.update_views();
                    } else {
                        gvar.set_general_error("The loaded file does not describe a screen nor a scenario but a "+data["type"]+".")
                    }
                } catch(err) {
                    gvar.set_general_error("The loaded file is not recognized.");
                }
                $("#hidden_scenario_load").prop("value","");
            }
            _reader.readAsBinaryString(blob)
        };

        // var xmlHttp = null;
        // xmlHttp = new XMLHttpRequest();
        // xmlHttp.open("GET", url, false);
        // xmlHttp.send(null);
        // return xmlHttp.responseText;
    }
    function readData(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = httpGet(e.target.result);
                // data = JSON.parse(data);
                // if (data["type"] == "scenario") {
                //     gvar.clean_views();
                //     gvar.store_current_history();
                //     gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc] = gvar.load_scenario(data["data"]);
                //     gvar.set_cur_scenario(gvar.cur_ind_sc);
                //     gvar.update_views();
                // }
                // $("#hidden_scenario_load").prop("value","");
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#hidden_scenario_load").change(function() { readData(this); });
    $("#hidden_scenario_load").hide();
    document.getElementById("scenario_load").addEventListener("click", function(evt) { $("#hidden_scenario_load").click(); });
}
gvar.set_scenario = set_scenario;

//////////////////////
// Calbacks //////////
function select_screen(evt,ind) {
    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    var scr;
    if (sc["selected"] != null) {
        scr = sc["screen_list"][sc["selected"]];
        $("#"+scr['div'].id).removeClass("selected");
    }
    sc["selected"] = ind;
    scr = sc["screen_list"][ind];
    $("#"+scr['div'].id).addClass("selected");
}
gvar.select_screen = select_screen;

function open_screen(evt,ind) {
    gvar.clean_views();
    gvar.store_current_history();
    gvar.enable_scenario(false,true);
    gvar.set_cur_screen(gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["selected"]);
    gvar.update_views();
}
gvar.open_screen = open_screen;
//////////////////////
//////////////////////

function create_div_screen() {
    var div = document.createElement('div');
    div.className = "elem has_tooltip";
    div.id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    return div;
}
gvar.create_div_screen = create_div_screen;

function add_screen(scr) {
    var new_scr = null;

    if (typeof scr === 'undefined') {
        new_scr = {}
        new_scr["name"] = "My Screen";
        new_scr["seq"] = [];
        new_scr["background"] = null;
        new_scr["div"] = gvar.create_div_screen();
        new_scr["listeners"] = [];
        new_scr["listeners"].push({"event": "click", "callback":gvar.select_screen}); // selection
        new_scr["listeners"].push({"event": "dblclick", "callback":gvar.open_screen}); // open
        new_scr["selected"] = null;
        new_scr["action_list"] = [];
    } else {
        new_scr = gvar.clone_screen(scr);
    }
    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    sc["screen_list"].push(new_scr);
    sc["selected"] = sc["screen_list"].length-1;
    new_scr["div"].className += " selected";
}
gvar.add_screen = add_screen;

function clone_screen(scr) {
    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    if (typeof scr === 'undefined') {
        if (sc["selected"] == null) {
            return;
        }
    }
    scr = (typeof scr !== 'undefined' ? scr : sc["screen_list"][sc["selected"]]);

    var new_scr = {}
    new_scr["name"] = scr["name"];
    var new_seq = [];
    for (var k = 0; k < scr["seq"].length; k++) {
        var sub_seq = [];
        for (var l = 0; l < scr["seq"][k]["seq"].length; l++) {
            var axiom = {};
            axiom["type"] = scr["seq"][k]["seq"][l]["type"];
            axiom["direction"] = scr["seq"][k]["seq"][l]["direction"];
            axiom["ID"] = scr["seq"][k]["seq"][l]["ID"];
            axiom["time"] = scr["seq"][k]["seq"][l]["time"];
            axiom["orientation"] = scr["seq"][k]["seq"][l]["orientation"];
            axiom["diagonal"] = scr["seq"][k]["seq"][l]["diagonal"];
            sub_seq.push(axiom);
        }
        new_seq.push({"seq": sub_seq, "connector":scr["seq"][k]["connector"]});
    }
    new_scr["seq"] = new_seq;
    new_scr["background"] = scr["background"];
    new_scr["div"] = scr["div"].cloneNode(true);
    new_scr["div"].id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    var new_listeners = [];
    for (var k = 0; k < scr["listeners"].length; k++) {
        new_listeners.push({"event":    scr["listeners"][k]["event"],
                            "callback": scr["listeners"][k]["callback"]});
    }
    new_scr["listeners"] = new_listeners;
    new_scr["selected"] = scr["selected"];
    var new_act_list = [];
    for (var k = 0; k < scr["action_list"].length; k++) {
        new_act_list.push(gvar.clone_action(scr["action_list"][k]));
    }
    new_scr["action_list"] = new_act_list;
    return new_scr;
}
gvar.clone_screen = clone_screen;

function delete_screen(scr) {
    if (typeof scr === 'undefined') {
        var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
        if (sc["selected"] == null) {
            return;
        }
        var scr_list = sc["screen_list"];
        var ind = sc["selected"];
        scr = scr_list[ind];
        scr_list.splice(ind,1);
        ind = (ind<scr_list.length?ind:scr_list.length-1);
        ind = (ind<0?null:ind);
        sc["selected"] = ind;
        if (ind != null) {
            scr_list[ind]["div"].className += " selected" ;
        }
    }
    delete scr;
    return null;
}
gvar.delete_screen = delete_screen;

function save_scenario(sc) {
    if (typeof sc === 'undefined') {
        sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    }

    var to_save = gvar.clone_scenario(sc);
    to_save["div"] = to_save["div"].outerHTML
    for (var l = 0; l < to_save["listeners"].length; l++) {
        to_save["listeners"][l]["callback"] = "gvar."+to_save["listeners"][l]["callback"].name;
    }
    for (var k = 0; k < to_save["screen_list"].length; k++) {
        to_save["screen_list"][k] = gvar.save_screen(to_save["screen_list"][k]);
    }
    return JSON.stringify(to_save);
}
gvar.save_scenario = save_scenario;

function load_scenario(data) {
    var sc = JSON.parse(data);
    var div = document.createElement("div")
    div.innerHTML = sc["div"]
    div = div.firstChild
    div.id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    sc["div"] = div
    for (var l = 0; l < sc["listeners"].length; l++) {
        sc["listeners"][l]["callback"] = eval(sc["listeners"][l]["callback"]);
    }

    for (var k = 0; k < sc["screen_list"].length; k++) {
        sc["screen_list"][k] = gvar.load_screen(sc["screen_list"][k],sc);
    }
    return sc;
}
gvar.load_scenario = load_scenario;