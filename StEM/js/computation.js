/* computation.js
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

 gvar.computation_on = false;

function toogle_computation() {
    if (gvar.computation_on) {
        $("#computation").animate({
            "left":"100%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
        $("#quick_crunch").fadeIn();
    } else {
        $("#computation").animate({
            "left": ($("#main").width()-$("#computation").width())+"px"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
        $("#quick_crunch").fadeOut();
    }
    gvar.computation_on = !gvar.computation_on;
}
gvar.toogle_computation = toogle_computation;

function resize_computation() {
    if (!gvar.computation_on) {
        $("#computation").css({"left":"100%"});
    } else {
        $("#computation").css({"left": ($("#main").width()-$("#computation").width())+"px"});
    }
}
gvar.resize_computation = resize_computation;

function set_computation() {
    $(".checkbox").checkboxradio();

    $("#expert").spinner().spinner("option", "min", 1);
    $("#expert").spinner().spinner("option", "max", 99);
    $("#novice").spinner().spinner("option", "min", 1);
    $("#novice").spinner().spinner("option", "max", 99);

    $("#age_lower_thresh").spinner().spinner("option", "min", 1);
    $("#age_lower_thresh").spinner().spinner("option", "max", 127);
    $("#age_upper_thresh").spinner().spinner("option", "min", 1);
    $("#age_upper_thresh").spinner().spinner("option", "max", 127);

    document.getElementById("computation_icon").addEventListener("click", function(evt) {
        gvar.toogle_computation();
    });

    document.getElementById("compute").addEventListener("click", function(evt) {
        gvar.crunch_numbers();
    });

    document.getElementById("quick_crunch").addEventListener("click", function(evt) {
        gvar.crunch_numbers();
    });
}
gvar.set_computation = set_computation;

function get_filters() {
    var filters = {};
    filters["method"] = $("input[name='agg_type']:checked").attr('id').split('_')[2];
    filters["gender"] = $("input[name='gender_type']:checked").attr('id').split('_')[2];
    filters["orientation"] = $("input[name='orientation_type']:checked").attr('id').split('_')[2];
    filters["grip"] = $("input[name='grip_type']:checked").attr('id').split('_')[2];
    filters["diagonal"] = $("input[name='diagonal_type']:checked").attr('id').split('_')[2];
    filters["expert"] = $("#expert").spinner("value");
    filters["novice"] = $("#novice").spinner("value");

    filters["age_lower_opt"] = $("input[name='age_lower']:checked").attr('id').split('_')[2];
    filters["age_lower_thr"] = $("#age_lower_thresh").spinner("value");
    filters["age_upper_opt"] = $("input[name='age_upper']:checked").attr('id').split('_')[2];
    filters["age_upper_thr"] = $("#age_upper_thresh").spinner("value");
    return filters;
}
gvar.get_filters = get_filters;

gvar.fixing = "";
function get_seq_from_workspace(ws) {
    var seq = [];
    for (var k = 0; k < ws["scenario_list"].length; k++) {
        var res = gvar.get_seq_from_scenario(ws["scenario_list"][k]);
        if (typeof res === 'boolean') {
            gvar.fixing = ""+(k+1);
            return false
        }
        if (res.length > 0) {
            seq.push(res);
        }
    }
    return seq;
}
gvar.get_seq_from_workspace = get_seq_from_workspace;

function get_seq_from_scenario(sc) {
    var seq = [];
    for (var k = 0; k < sc["screen_list"].length; k++) {
        var res = gvar.get_seq_from_screen(sc["screen_list"][k]);
        if (typeof res === 'boolean') {
            gvar.fixing = ""+(k+1);
            return false
        }
        if (res.length > 0) {
            seq.push(res);
        }
    }
    return seq;
}
gvar.get_seq_from_scenario = get_seq_from_scenario;

function get_seq_from_screen(scr) {
    if (gvar.seq_is_wrong(scr["seq"])) {
        return false
    }
    var seq = [];
    for (var k = 0; k < scr["seq"].length; k++) {
        seq.push(scr["seq"][k]["seq"]);
    }
    return seq;
}
gvar.get_seq_from_screen = get_seq_from_screen;

function crunch_numbers() {
    var filters = gvar.get_filters();
    gvar.fixing = "";
    document.getElementById("warning").innerHTML = "";

    if (gvar.screen_on) {
        var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
        var seq = gvar.get_seq_from_screen(scr);
        if (typeof seq === 'boolean') {
            document.getElementById("warning").innerHTML = "The current screen needs to be fixed first";
            if (!gvar.computation_on) { gvar.toogle_computation(); }
            return;
        }
        if (seq.length > 0) {
            gvar.socket.emit('crunch_screen', {"filters": filters, "seq": seq});
        }
    } else if (gvar.scenario_on) {
        var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
        var seq = gvar.get_seq_from_scenario(sc);
        if (typeof seq === 'boolean') {
            document.getElementById("warning").innerHTML = "The screen n&deg;"+gvar.fixing+" needs to be fixed first";
            if (!gvar.computation_on) { gvar.toogle_computation(); }
            return;
        }
        if (seq.length > 0) {
            gvar.socket.emit('crunch_scenario', {"filters": filters, "seq": seq, "names": gvar.get_screens_name(sc)});
        }
    } else {
        var ws = gvar.ws_hist[gvar.cur_ws_hist];
        var seq = gvar.get_seq_from_workspace(ws);
        if (typeof seq === 'boolean') {
            document.getElementById("warning").innerHTML = "The scenario n&deg;"+gvar.fixing+" needs to be fixed first";
            if (!gvar.computation_on) { gvar.toogle_computation(); }
            return;
        }
        if (seq.length > 0) {
            gvar.socket.emit('crunch_workspace', {"filters": filters, "seq": seq, "names": gvar.get_scenarios_name(ws)});
        }
    }
    if (gvar.computation_on) {
        gvar.toogle_computation();
    }
}
gvar.crunch_numbers = crunch_numbers;