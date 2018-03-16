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


gvar.tooltip_timer = null;
gvar.tooltip_elem = null;
function display_tooltip(elem) {
    $("#general_tooltip").hide();
    gvar.tooltip_elem = elem;

    if (gvar.tooltip_timer != null) {
        clearTimeout(gvar.tooltip_timer);
        gvar.tooltip_timer = null;
    }
    gvar.tooltip_timer = setTimeout(gvar.display_tooltip_aux, 1000);
}
gvar.display_tooltip = display_tooltip;

gvar.tooltip_dico = {};

gvar.tooltip_dico["help_icon"] = "More about StEM. Click to expand or contract the tab.";

gvar.tooltip_dico["computation_icon"] = "Set up filters to specialize the predictions to screen orientations, hand grips, ... Click to expand or contract the tab.";
gvar.tooltip_dico["quick_crunch"]     = "Refresh the predictions usign the current filters.";
gvar.tooltip_dico["agg_label"]        = "Method used while aggregating the data to compute the different models.";
gvar.tooltip_dico["ori_label"]        = "Filter the data by screen orientation.";
gvar.tooltip_dico["dia_label"]        = "Filter the data by screen sizes.";
gvar.tooltip_dico["grip_label"]       = "Filter the data by type of grips (see the '?' tab for more information).";
gvar.tooltip_dico["gender_label"]     = "Filter the data by gender.";
gvar.tooltip_dico["age_low_label"]    = "Filter the data by age (sets a lower limit).";
gvar.tooltip_dico["age_upp_label"]    = "Filter the data by age (sets an upper limit).";
gvar.tooltip_dico["fast_label"]       = "Threshold limit for the fastest users.";
gvar.tooltip_dico["slow_label"]       = "Threshold limit for the slowest users.";
gvar.tooltip_dico["compute"]          = "Refresh the predictions usign the current filters.";

gvar.tooltip_dico["graphs_icon"] = "Results section containing the different graphs. Click to expand or contract the tab.";

gvar.tooltip_dico["workspace_icon"]   = "Go to the workspace menu. Click to expand the tab.";
gvar.tooltip_dico["workspace_delete"] = "Delete the toggled scenario (highlighted in black).";
gvar.tooltip_dico["workspace_clone"]  = "Clone the toggled scenario (highlighted in black) and place it in the end.";
gvar.tooltip_dico["workspace_add"]    = "Add a new scenario and place it in the end.";
gvar.tooltip_dico["elem_scenarios"]   = "Scenario composing the current workspace. Click to select it (highlighted in black). Double click to modify it.";
gvar.tooltip_dico["workspace_load"]   = "Load a workspace and replace the current one.";
gvar.tooltip_dico["workspace_save"]   = "Save the current workspace.";
gvar.tooltip_dico["workspace_undo"]   = "Undo the last action performed";
gvar.tooltip_dico["workspace_redo"]   = "Redo the last action performed";

gvar.tooltip_dico["scenario_icon"]   = "Go to the scenario menu. Click to expand the tab.";
gvar.tooltip_dico["scenario_name"]   = "Specify the name of the current scenario.";
gvar.tooltip_dico["phone_width"]     = "Specify the phone width in mm. If the width is larger than the height, the device is considered with a landscape orientation.";
gvar.tooltip_dico["phone_height"]    = "Specify the phone height in mm. If the height is larger than the width, the device is considered with a portrait orientation.";
gvar.tooltip_dico["elem_screens"]    = "Screen composing the current scenario. Click to select it (highlighted in black). Double click to modify it.";
gvar.tooltip_dico["scenario_delete"] = "Delete the toggled screen (highlighted in black).";
gvar.tooltip_dico["scenario_clone"]  = "Clone the toggled screen (highlighted in black) and place it in the end.";
gvar.tooltip_dico["scenario_add"]    = "Add a new screen and place it in the end.";
gvar.tooltip_dico["scenario_load"]   = "Load a scenario and replace the current one.";
gvar.tooltip_dico["scenario_save"]   = "Save the current scenario.";
gvar.tooltip_dico["scenario_undo"]   = "Undo the last action performed";
gvar.tooltip_dico["scenario_redo"]   = "Redo the last action performed";

gvar.tooltip_dico["screen_name"]   = "Specify the name of the current screen.";
gvar.tooltip_dico["up_backgrnd"]   = "Upload an image to replace the current background of the screen.";
gvar.tooltip_dico["sequence_name"] = "Axioms of the interaction sequence. Error are displayed in red and explained below.";
gvar.tooltip_dico["screen_load"]   = "Load a screen and replace the current one.";
gvar.tooltip_dico["screen_save"]   = "Save the current screen.";
gvar.tooltip_dico["screen_undo"]   = "Undo the last action performed";
gvar.tooltip_dico["screen_redo"]   = "Redo the last action performed";

gvar.tooltip_dico["interface_phone"] = "Interface representing the actions performed of interaction. Move the elements by dragging them on the phone. Specify the size by dragging the edges.";
gvar.tooltip_dico["elem_interface"]  = "Move the element by dragging it on the phone. Specify the size by dragging the edges.";

gvar.tooltip_dico["timeline"]      = "Timeline representing the sequence of interaction. Drag and drop cards onto it to construct the interaction sequence. Reorder the elements by dragging them elsewhere onto the timeline. Remove them by dragging them out.";
gvar.tooltip_dico["elem_timeline"] = "Reorder the elements by dragging them onto the timeline. Remove them by dragging them out.";

gvar.tooltip_dico["timers"]        = "Timer components. Click to expand or contract the tab.";
gvar.tooltip_dico["dwell"]         = "Timer component long presses on a screen. Drag and drop this card onto the timeline after a button, draggable object or a drop area component.";
gvar.tooltip_dico["timeout"]       = "Generic timer component representing period with no interaction (web page loading, computation time, ...). Drag and drop this card onto the timeline.";
gvar.tooltip_dico["gestures"]      = "Gesture components. Click to expand or contract the tab.";
gvar.tooltip_dico["swipe"]         = "Swipe gesture component. Click on the interface component to change the direction. Drag and drop this card onto the timeline.";
gvar.tooltip_dico["scaling"]       = "Scale gesture component. Setting the spinner will specify the combined distance travelled by both fingers on the screen. Drag and drop this card onto the timeline.";
gvar.tooltip_dico["rotation"]      = "Rotation gesture component. Setting the spinner will specify the angle of rotation. Positive numbers represent clockwise rotation, negative counter-clockwise. Drag and drop this card onto the timeline.";
gvar.tooltip_dico["drop"]          = "Drop area components. Click to expand or contract the tab.";
gvar.tooltip_dico["drop_square"]   = "Square drop area component. Drag and drop this card onto the timeline after a draggable object component or another drop area component.";
gvar.tooltip_dico["drop_circle"]   = "Circular drop area component. Drag and drop this card onto the timeline after a draggable object component or another drop area component.";
gvar.tooltip_dico["token"]         = "Draggable object components. Click to expand or contract the tab.";
gvar.tooltip_dico["token_square"]  = "Square draggable object component. Drag and drop this card onto the timeline before a drop area component.";
gvar.tooltip_dico["token_circle"]  = "Circular draggable object component. Drag and drop this card onto the timeline before a drop area component.";
gvar.tooltip_dico["button"]        = "Button components. Click to expand or contract the tab.";
gvar.tooltip_dico["button_square"] = "Square button component. Drag and drop this card onto the timeline.";
gvar.tooltip_dico["button_circle"] = "Circular button component. Drag and drop this card onto the timeline.";
gvar.tooltip_dico["multiplier"]    = "Additional presses onto the previous button. Setting the spinner to 4 would simulate a button pressed 5 times. Drag and drop this card onto the timeline after a button component.";

function display_tooltip_aux() {
    if (gvar.tooltip_elem == null) { return; }
    gvar.tooltip_timer = null;
    elem = gvar.tooltip_elem[0];

    $("#general_tooltip").show();
    var css = ""
    if ($("#"+elem.id).offset().left <= window.innerWidth/2) {
        css += "left:"+$("#"+elem.id).offset().left+"px;"
        css += "right:auto;"
    } else {
        right = window.innerWidth-$("#"+elem.id).offset().left-$("#"+elem.id)[0].offsetWidth;
        if (right < 0) {
            right = 0;
        }
        css += "right:"+right+"px;"
        css += "left:auto;"
    }
    if ($("#"+elem.id).offset().top <= window.innerHeight/2) {
        css += "top:"+($("#"+elem.id).offset().top+$("#"+elem.id)[0].offsetHeight)+"px;"
        css += "bottom:auto;"
    } else {
        css += "bottom:"+(window.innerHeight-$("#"+elem.id).offset().top)+"px;"
        css += "top:auto;"
    }
    document.getElementById("general_tooltip").setAttribute("style",css)
    
    if (elem.id in gvar.tooltip_dico) {
        document.getElementById("general_tooltip").innerHTML = gvar.tooltip_dico[elem.id];
    } else {
        if (elem.id.split("_")[0] == "elem") {
            parent = gvar.tooltip_elem.parent()[0].id;
            document.getElementById("general_tooltip").innerHTML = gvar.tooltip_dico["elem_"+parent];
        } else {
            console.log(elem.id);
            document.getElementById("general_tooltip").innerHTML = "Hum... Tooltip not found...";
        }
    }
}
gvar.display_tooltip_aux = display_tooltip_aux;

function remove_tooltip() {
    $("#general_tooltip").hide();
    if (gvar.tooltip_timer != null) {
        clearTimeout(gvar.tooltip_timer);
        gvar.tooltip_timer = null;
    }
    gvar.tooltip_elem = null;
}
gvar.remove_tooltip = remove_tooltip;