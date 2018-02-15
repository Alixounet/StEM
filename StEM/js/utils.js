/* utils.js
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

gvar.offset = 10;

function scalarProduct(ux,uy,vx,vy) {
    return ux*vx+uy*vy;
}
gvar.scalarProduct = scalarProduct;

function pixWInPer(val) {
    return val/document.body.clientWidth;
}
gvar.pixWInPer = pixWInPer;

function pixHInPer(val) {
    return val/document.body.clientHeight;
}
gvar.pixHInPer = pixHInPer;

function resize() {
    gvar.clean_connectors();
    gvar.resize_help();
    gvar.resize_computation();
    gvar.resize_graphs();
    gvar.resize_workspace();
    gvar.resize_scenario();
    gvar.resize_screen();
    gvar.update_views();
}
gvar.resize = resize;

function isPortrait(w,h) {
    return h >= w;
}
gvar.isPortrait = isPortrait;

function isTallerThanWide(w,h,from_screen) {
    var max_w_px;
    var max_h_px;
    if (from_screen) {
        max_w_px = $("#screen").width()*0.4; // max w that the screen can take
        max_h_px = $("#screen").height()-10; // max h that the screen can take
    } else {
        max_w_px = $("#scenario").width()*0.3-185;     // max w that the screen can take
        max_h_px = $("#scenario").height()-200 -15-30; // max h that the screen can take
    }

    var ratio = w/max_w_px;
    var theoritical_h = h/ratio;

    return theoritical_h > max_h_px;
}
gvar.isTallerThanWide = isTallerThanWide;

function contains(div_id,x,y) {
    var div_x = $("#"+div_id).offset().left;
    var div_y = $("#"+div_id).offset().top;
    var div_w = $("#"+div_id).width();
    var div_h = $("#"+div_id).height();

    if (x >= div_x && x <= div_x+div_w) {
        if (y >= div_y && y <= div_y+div_h) {
            return true;
        }
    }

    return false;
}
gvar.contains = contains;


function contained_in_upper_part(div_id,y) {
    var div_y = $("#"+div_id).offset().top;
    var div_h = $("#"+div_id).height();

    return y <= div_y + div_h*0.5;
}
gvar.contained_in_upper_part = contained_in_upper_part;

function sequence_to_string(seq) {
    var str = "";
    var errors = "";
    var nb_err = 0;

    for (var k = 0; k < seq.length; k++) {
        var nb_consecutive_P = 0;
        for (var l = 0; l < seq[k]["seq"].length; l++) {
            if (seq[k]["seq"][l]["type"] == "WRONG") {
                str += '<span class="wrong">X</span>';
                errors += "<li>"+seq[k]["seq"][l]["reason"]+"</li>"
                nb_err += 1;
            } else if (seq[k]["seq"][l]["type"] == "TAP") {
                str += "T";
            } else if (seq[k]["seq"][l]["type"] == "POINTING") {
                nb_consecutive_P += 1;
                if (nb_consecutive_P <= 1) {
                    str += "P";
                }
            } else if (seq[k]["seq"][l]["type"] == "DRAG") {
                str += "D";
            } else if (seq[k]["seq"][l]["type"] == "ROTATE") {
                str += "R";
            } else if (seq[k]["seq"][l]["type"] == "SCALE") {
                str += "S";
            } else if (seq[k]["seq"][l]["type"] == "SWIPE") {
                str += "F"; // for flick
            } else if (seq[k]["seq"][l]["type"] == "DWELL") {
                str = str.substring(0, str.length-1);
                str += "&#9679;";
            } else if (seq[k]["seq"][l]["type"] == "TIMEOUT") {
                str += "W";
            }
        }
        if (nb_consecutive_P > 1) {
            str += "("+nb_consecutive_P+")";
        }
        str += " ";
    }
    if (str.length == 0) {
        return ["null",""];
    }
    if (nb_err > 0) {
        errors = "Error explanation:"+errors
    }
    return [str.substring(0, str.length-1),errors];
}
gvar.sequence_to_string = sequence_to_string;

function is_wrong(sub_seq) {
    for (var k = 0; k < sub_seq.length; k++) {
        if (sub_seq[k]["type"] == "WRONG") {
            return true
        }
    }
    return false;
}
gvar.is_wrong = is_wrong;

function seq_is_wrong(seq) {
    for (var k = 0; k < seq.length; k++) {
        for (var l = 0; l < seq[k]["seq"].length; l++) {
            if (seq[k]["seq"][l]["type"] == "WRONG") {
                return true;
            }
        }
    }
    return false;
}
gvar.seq_is_wrong = seq_is_wrong;

function get_scenarios_name(ws) {
    var names = [];
    for (var k = 0; k < ws["scenario_list"].length; k++) {
        var axiom_exist = false;
        for (var l = 0; l < ws["scenario_list"][k]["screen_list"].length; l++) {
            axiom_exist = ws["scenario_list"][k]["screen_list"][l]["seq"].length > 0;
            if (axiom_exist) {
                break;
            }
        }
        if (axiom_exist) {
            names.push(ws["scenario_list"][k]["name"]);
        }
    }
    return names;
}
gvar.get_scenarios_name = get_scenarios_name

function get_screens_name(sc) {
    var names = [];
    for (var k = 0; k < sc["screen_list"].length; k++) {
        if (sc["screen_list"][k]["seq"].length > 0) {
            names.push(sc["screen_list"][k]["name"]);
        }
    }
    return names;
}
gvar.get_screens_name = get_screens_name;

gvar.err_timeout = null;
function hide_general_error() {
    if ($("#general_error").is(":visible")) {
        $("#general_error").slideUp();
    }
    gvar.err_timeout = null;
}
gvar.hide_general_error = hide_general_error;

function set_general_error(msg) {
    $("#general_error").html("<p>"+msg+"</p>");
    if (gvar.err_timeout != null) {
        clearTimeout(gvar.err_timeout);
    } else {
        $("#general_error").slideDown();
    } 
    gvar.err_timeout = setTimeout(hide_general_error, 4000);
}
gvar.set_general_error = set_general_error;

function change_from_spinner() {
    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    var scr = sc["screen_list"][gvar.cur_ind_scr];
    gvar.compute_sequence(scr,sc);
    var strgs = gvar.sequence_to_string(scr["seq"]);
    var seq = strgs[0];
    var err = strgs[1];
    document.getElementById("sequence_name").innerHTML = "Seq: "+seq+"<br>"+err;
}
gvar.change_from_spinner = change_from_spinner;