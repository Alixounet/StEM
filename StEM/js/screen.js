/* screen.js
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

gvar.screen_on = false;
gvar.cur_ind_scr = null;

function enable_screen(val,change_view) {
    if (val == gvar.screen_on) { return; }
    gvar.screen_on = val;
    if (change_view) {
        if (gvar.screen_on) {
            gvar.ws_hist[gvar.cur_ws_hist]["view"] = "scr";
        } else {
        }
    }
    // gvar.clean_views();
    // gvar.update_views();
}
gvar.enable_screen = enable_screen;

function resize_screen() {
    if (gvar.cur_ind_sc != null) {
        var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
        var w = sc["width"];
        var h = sc["height"];
        // if (gvar.isPortrait(w,h)) {
        if (gvar.isTallerThanWide(w,h,true)) {
            $("#interface_phone").css({"height": "calc(100% - 10px)"});
            $("#interface_phone").css({"width": (($("#interface_phone").height()-15-30)*w/h)+"px"});
        } else {
            $("#interface_phone").css({"width": "40%"});
            $("#interface_phone").css({"height": ($("#interface_phone").width()*h/w +15+30)+"px"});
        }
        var half_width_middle = "calc(40% - "+($("#actions").width()*0.5)+"px)"
        var half_width_interaction = ($("#interface_phone").width()+$("#timeline").width()+5)*0.5;
        var position_left = "calc(20% + calc("+half_width_middle+" - "+half_width_interaction+"px))";
        $("#interface_phone").css({"left": position_left});
        $("#timeline").css({"left": "calc(5px + "+position_left+" + "+$("#interface_phone").width()+"px)"});
    }
}
gvar.resize_screen = resize_screen;

function load_background_from_file(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            gvar.clean_views();
            gvar.store_current_history();
            var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
            scr["background"] = e.target.result;
            $("#interface").css({"background-image": "url("+scr["background"]+")"});
            gvar.update_views();
        }
        reader.readAsDataURL(input.files[0]);
    }
}
gvar.load_background_from_file = load_background_from_file;

function set_cur_screen(ind) {
    gvar.cur_ind_scr = ind;
    // set current attributes
    var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
    $("#screen_name")[0].value = scr["name"];

    if (scr["background"] != null) {
        $("#interface").css({"background-image": "url("+scr["background"]+")"});
    } else {
        $("#interface").css({"background-image": "url(img/background.png)"});
    }

    gvar.resize_screen();
}
gvar.set_cur_screen = set_cur_screen;

function screen_changed() {
    if (gvar.cur_ind_scr == null) {
        return;
    }
    var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
    scr["name"] = $("#screen_name")[0].value;
}
gvar.screen_changed = screen_changed;

function get_index_at_which_insert(at_x,at_y) {
    var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
    for (var k = 0; k < scr["action_list"].length; k++) {
        var act = scr["action_list"][k];
        if (gvar.contained_in_upper_part(act["div_seq"].id,at_y)) {
            return k;
        }
    }
    return scr["action_list"].length;
}
gvar.get_index_at_which_insert = get_index_at_which_insert;

gvar.moving_action = null;
gvar.current_card = null;
gvar.lastX = null;
gvar.lastY = null;
function handle_mouse_action(evt) {
    if (evt.type == "mousedown" &&
        (evt.data.type == "timeout" ||
         evt.data.type == "multiplier" ||
         evt.data.type == "rotation" ||
         evt.data.type == "scaling")) {
        if (gvar.contains("div_timeout", evt.clientX, evt.clientY) ||
            gvar.contains("div_multiplier", evt.clientX, evt.clientY) ||
            gvar.contains("div_angle", evt.clientX, evt.clientY) ||
            gvar.contains("div_ratio", evt.clientX, evt.clientY)) {
            return;
        }
    }

    if (evt.type == "mousedown" && gvar.moving_action == null && !gvar.graphs_on && !gvar.help_on) {
        gvar.moving_action = evt.data.type;

        if (gvar.moving_action == "timeout") {
            $(".timeout_spinner").spinner("destroy");
        }
        if (gvar.moving_action == "multiplier") {
            $(".multiplier_spinner").spinner("destroy");
        }
        if (gvar.moving_action == "rotation") {
            $(".angle_spinner").spinner("destroy");
        }
        if (gvar.moving_action == "scaling") {
            $(".ratio_spinner").spinner("destroy");
        }
        gvar.current_card = evt.currentTarget.cloneNode(true);
        gvar.current_card.className += " moving_card";
        gvar.current_card.id = "elem_"+gvar.cur_id;
        gvar.cur_id += 1;
        if (gvar.moving_action == "timeout" ||
            gvar.moving_action == "multiplier" ||
            gvar.moving_action == "rotation" ||
            gvar.moving_action == "scaling") {
            gvar.current_card.lastElementChild.lastElementChild.id = "elem_"+gvar.cur_id;
            gvar.cur_id += 1;
        }
        document.getElementById("screen").appendChild(gvar.current_card);
        if (gvar.moving_action.indexOf("button") != -1) {
            $("#"+gvar.current_card.id+" .card_name").html("Button")
        }
        if (gvar.moving_action.indexOf("token") != -1) {
            $("#"+gvar.current_card.id+" .card_name").html("Draggable object")
        }
        if (gvar.moving_action.indexOf("drop") != -1) {
            $("#"+gvar.current_card.id+" .card_name").html("Drop area")
        }
        if (gvar.moving_action == "timeout") {
            $(".timeout_spinner").spinner().spinner("option", "min", 1);
        }
        if (gvar.moving_action == "multiplier") {
            $(".multiplier_spinner").spinner().spinner("option", "min", 1);
        }
        if (gvar.moving_action == "rotation") {
            $(".angle_spinner").spinner().spinner("option", "min", -360);
        }
        if (gvar.moving_action == "scaling") {
            $(".ratio_spinner").spinner().spinner("option", "min", -1000);
        }
        $("#"+gvar.current_card.id).css("width",$("#"+evt.currentTarget.id).width()+"px");
        $("#"+gvar.current_card.id).css("height",$("#"+evt.currentTarget.id).height()+"px");
        $("#"+gvar.current_card.id).css("left",(evt.clientX - $("#"+gvar.current_card.id).width()*0.5)+"px");
        $("#"+gvar.current_card.id).css("top",(evt.clientY - $("#"+gvar.current_card.id).height()*0.5)+"px");

        gvar.lastX = evt.clientX;
        gvar.lastY = evt.clientY;

    } else if (evt.type == "mousemove" && gvar.moving_action != null) {
        $("#"+gvar.current_card.id).css("left",($("#"+gvar.current_card.id).position().left + evt.clientX - gvar.lastX)+"px");
        $("#"+gvar.current_card.id).css("top",($("#"+gvar.current_card.id).position().top + evt.clientY - gvar.lastY)+"px");

        gvar.lastX = evt.clientX;
        gvar.lastY = evt.clientY;
    } else if (evt.type == "mouseup" && gvar.moving_action != null) {
        $("#"+gvar.current_card.id).removeClass("moving_card");
        $("#"+gvar.current_card.id).addClass("timeline_card");
        $("#"+gvar.current_card.id).css("width","");
        $("#"+gvar.current_card.id).css("height","");
        $("#"+gvar.current_card.id).css("left","");
        $("#"+gvar.current_card.id).css("top","");
        gvar.current_card.remove();
        if (gvar.contains("timeline",evt.clientX,evt.clientY)) {
            var ind = gvar.get_index_at_which_insert(evt.clientX,evt.clientY);
            gvar.clean_views();
            gvar.store_current_history();
            gvar.add_action(gvar.moving_action,gvar.current_card,ind);
            var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
            var scr = sc["screen_list"][gvar.cur_ind_scr];
            gvar.compute_sequence(scr,sc);
            gvar.update_views();
        }
        gvar.current_card = null;
        gvar.moving_action = null;
        gvar.lastX = null;
        gvar.lastY = null;
    }
}
gvar.handle_mouse = gvar.handle_mouse;

gvar.lastX_timeline = null;
gvar.lastY_timeline = null;
gvar.initial_position = null;
gvar.current_position = null;
function handle_mouse_action_timeline(evt,ind) {
    if ($("#"+evt.currentTarget.id).hasClass("timeout_card") ||
        $("#"+evt.currentTarget.id).hasClass("multiplier_card") ||
        $("#"+evt.currentTarget.id).hasClass("angle_card") ||
        $("#"+evt.currentTarget.id).hasClass("ratio_card")) {
        if (gvar.contains(evt.currentTarget.lastElementChild.lastElementChild.id, evt.clientX, evt.clientY)) {
            return;
        }
    }

    if (evt.type == "mousedown" && !$(".moving_card_timeline").length && !gvar.graphs_on && !gvar.help_on) {
        gvar.clean_views();
        gvar.store_current_history();
        gvar.update_views();

        gvar.initial_position = ind;
        gvar.current_position = ind;

        gvar.lastX_timeline = evt.clientX;
        gvar.lastY_timeline = evt.clientY;

        var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
        var act = scr["action_list"][gvar.current_position];
        $("#"+act["div_seq"].id).addClass("moving_card_timeline");
        $("#"+act["div_canvas"].id).addClass("moving_card_timeline");

    } else if (evt.type == "mousemove" && $(".moving_card_timeline").length) {
        var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
        var scr = sc["screen_list"][gvar.cur_ind_scr];
        var act = scr["action_list"][gvar.current_position];
        if (gvar.contains("timeline",evt.clientX,evt.clientY)) {
            $("#"+act["div_seq"].id).removeClass("pre_remove");
            $("#"+act["div_canvas"].id).removeClass("pre_remove");
        } else {
            $("#"+act["div_seq"].id).addClass("pre_remove");
            $("#"+act["div_canvas"].id).addClass("pre_remove");
        }
        var pre_ind = gvar.get_index_at_which_insert(evt.clientX,evt.clientY);
        gvar.clean_views();
        if (gvar.current_position < pre_ind) {
            scr["action_list"].splice(gvar.current_position,1);
            scr["action_list"].splice(pre_ind-1, 0, act);
            gvar.current_position = pre_ind-1;
        } else {
            scr["action_list"].splice(gvar.current_position,1);
            scr["action_list"].splice(pre_ind, 0, act);
            gvar.current_position = pre_ind
        }
        gvar.compute_sequence(scr,sc);
        gvar.update_views();

        gvar.lastX_timeline = evt.clientX;
        gvar.lastY_timeline = evt.clientY;

    } else if (evt.type == "mouseup" && $(".moving_card_timeline").length) {
        var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
        var scr = sc["screen_list"][gvar.cur_ind_scr];
        var act = scr["action_list"][gvar.current_position];
        var has_pre_remove = $("#"+act["div_seq"].id).hasClass("pre_remove");

        gvar.clean_views();
        if (gvar.initial_position != gvar.current_position || has_pre_remove) {
            if (has_pre_remove) {
                scr["selected"] = gvar.current_position;
                gvar.delete_action();
            }
            gvar.compute_sequence(scr,sc);
        } else {
            gvar.undo();
        }
        gvar.update_views();

        $(".moving_card_timeline").removeClass("moving_card_timeline");

        gvar.lastX_timeline = null;
        gvar.lastY_timeline = null;
        gvar.initial_position = null;
    }
}
gvar.handle_mouse_action_timeline = handle_mouse_action_timeline;

gvar.current_action_ind = null;
gvar.current_canvas_elem = null;
gvar.initialX_canvas = null;
gvar.initialY_canvas = null;
gvar.initialX_screen = null;
gvar.initialY_screen = null;
gvar.initialW_canvas = null;
gvar.initialH_canvas = null;
gvar.firstX_canvas = null;
gvar.firstY_canvas = null;
gvar.action_type = null;
gvar.keep_ratio = null;
gvar.elem_canvas_border = 2;
function handle_mouse_action_canvas(evt,ind) {
    if (evt.type == "mousedown" && gvar.current_canvas_elem == null && !gvar.graphs_on && !gvar.help_on) {
        var rel_X = evt.layerX;
        var rel_Y = evt.layerY;

        gvar.current_action_ind = ind;

        gvar.clean_views();
        gvar.store_current_history();
        gvar.update_views();

        var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
        var act = scr["action_list"][ind];
        gvar.current_canvas_elem = act["div_canvas"];

        gvar.initialX_canvas = $("#"+gvar.current_canvas_elem.id).position().left;
        gvar.initialY_canvas = $("#"+gvar.current_canvas_elem.id).position().top;
        gvar.initialW_canvas = $("#"+gvar.current_canvas_elem.id).width();
        gvar.initialH_canvas = $("#"+gvar.current_canvas_elem.id).height();
        $("#"+gvar.current_canvas_elem.id).addClass("moving_elem_canvas");
        $("#"+act["div_seq"].id).addClass("moving_elem_canvas");

        if ((rel_X - gvar.initialW_canvas > -10) && (rel_Y - gvar.initialH_canvas > -10)) {
            gvar.action_type = "change_width_and_height";
        } else if (rel_X - gvar.initialW_canvas > -10) {
            gvar.action_type = "change_width";
        } else if (rel_Y - gvar.initialH_canvas > -10) {
            gvar.action_type = "change_height";
        } else {
            gvar.action_type = "change_pos";
        }
        if ($("#"+gvar.current_canvas_elem.id).hasClass("swipe")
            || $("#"+gvar.current_canvas_elem.id).hasClass("dwell")
            || $("#"+gvar.current_canvas_elem.id).hasClass("timeout")
            || $("#"+gvar.current_canvas_elem.id).hasClass("multiplier")
            || $("#"+gvar.current_canvas_elem.id).hasClass("rotation")
            || $("#"+gvar.current_canvas_elem.id).hasClass("scaling")) {
            gvar.action_type = "change_pos";
        }

        if ($("#"+gvar.current_canvas_elem.id).hasClass("circle")) {
            gvar.keep_ratio = gvar.initialW_canvas/gvar.initialH_canvas;
        }

        gvar.firstX_canvas = evt.clientX;
        gvar.firstY_canvas = evt.clientY;
    } else if (evt.type == "mousemove" && gvar.current_canvas_elem != null) {

        var new_left = gvar.initialX_canvas;
        var new_top = gvar.initialY_canvas;
        var new_width = gvar.initialW_canvas;
        var new_height = gvar.initialH_canvas;

        var ratio_w = null;
        var ratio_h = null;

        if (gvar.action_type == "change_width" || gvar.action_type == "change_width_and_height") {
            new_width += evt.clientX - gvar.firstX_canvas;

            var min_width = 10;
            var max_width = $("#interface").width() - $("#"+gvar.current_canvas_elem.id).position().left - 2*gvar.elem_canvas_border;
            new_width = (new_width<min_width?min_width:new_width);
            new_width = (new_width>max_width?max_width:new_width);

            if (gvar.keep_ratio != null) {
                ratio_h = new_width / gvar.keep_ratio;
            }
        }
        if (gvar.action_type == "change_height" || gvar.action_type == "change_width_and_height") {
            new_height += evt.clientY - gvar.firstY_canvas;

            var min_height = 10;
            var max_height = $("#interface").height() - $("#"+gvar.current_canvas_elem.id).position().top - 2*gvar.elem_canvas_border;
            new_height = (new_height<min_height?min_height:new_height);
            new_height = (new_height>max_height?max_height:new_height);

            if (gvar.keep_ratio != null) {
                ratio_w = new_height * gvar.keep_ratio;
            }
        }
        if (gvar.keep_ratio != null) {
            var max_size = Math.min((ratio_h==null?new_height:new_width),
                                    (ratio_w==null?new_width:new_height));

            var min_width = 10;
            var max_width = $("#interface").width() - $("#"+gvar.current_canvas_elem.id).position().left - 2*gvar.elem_canvas_border;
            max_size = (max_size<min_width?min_width:max_size);
            max_size = (max_size>max_width?max_width:max_size);
            var min_height = 10;
            var max_height = $("#interface").height() - $("#"+gvar.current_canvas_elem.id).position().top - 2*gvar.elem_canvas_border;
            max_size = (max_size<min_height?min_height:max_size);
            max_size = (max_size>max_height?max_height:max_size);

            new_width = max_size;
            new_height = max_size;
        }
        if (gvar.action_type == "change_pos") {
            new_left += evt.clientX - gvar.firstX_canvas;
            new_top += evt.clientY - gvar.firstY_canvas;

            var min_left = 0;//$("#interface").position().left;
            var min_top = 0;//$("#interface").position().top;
            var max_left = $("#interface").width() - $("#"+gvar.current_canvas_elem.id).width() - 2*gvar.elem_canvas_border;
            var max_top = $("#interface").height() - $("#"+gvar.current_canvas_elem.id).height() - 2*gvar.elem_canvas_border;
            new_left = (new_left<min_left?min_left:new_left);
            new_top = (new_top<min_top?min_top:new_top);
            new_left = (new_left>max_left?max_left:new_left);
            new_top = (new_top>max_top?max_top:new_top);
        }
        $("#"+gvar.current_canvas_elem.id).css("left",new_left+"px");
        $("#"+gvar.current_canvas_elem.id).css("top",new_top+"px");
        $("#"+gvar.current_canvas_elem.id).css("width",new_width+"px");
        $("#"+gvar.current_canvas_elem.id).css("height",new_height+"px");

    } else if (evt.type == "mouseup" && gvar.current_canvas_elem != null) {
        var x_canvas = $("#"+gvar.current_canvas_elem.id).position().left;
        var y_canvas = $("#"+gvar.current_canvas_elem.id).position().top;
        var w_canvas = $("#"+gvar.current_canvas_elem.id).width();
        var h_canvas = $("#"+gvar.current_canvas_elem.id).height();
        var swipe_canvas = $("#"+gvar.current_canvas_elem.id).hasClass("swipe");

        if (gvar.initialX_canvas == x_canvas && gvar.initialY_canvas == y_canvas &&
            gvar.initialW_canvas == w_canvas && gvar.initialH_canvas == h_canvas &&
            swipe_canvas) {
            $("#"+gvar.current_canvas_elem.id).css("width","");
            $("#"+gvar.current_canvas_elem.id).css("height","");
            if ($("#"+gvar.current_canvas_elem.id).hasClass("swipe_right")) {
                $("#"+gvar.current_canvas_elem.id).removeClass("swipe_right");
                $("#"+gvar.current_canvas_elem.id+" #arrow").removeClass("swipe_arrow_right");
                $("#"+gvar.current_canvas_elem.id+" #start").removeClass("swipe_start_right");
                $("#"+gvar.current_canvas_elem.id).addClass("swipe_down");
                $("#"+gvar.current_canvas_elem.id+" #arrow").addClass("swipe_arrow_down");
                $("#"+gvar.current_canvas_elem.id+" #start").addClass("swipe_start_down");

            } else if ($("#"+gvar.current_canvas_elem.id).hasClass("swipe_left")) {
                $("#"+gvar.current_canvas_elem.id).removeClass("swipe_left");
                $("#"+gvar.current_canvas_elem.id+" #arrow").removeClass("swipe_arrow_left");
                $("#"+gvar.current_canvas_elem.id+" #start").removeClass("swipe_start_left");
                $("#"+gvar.current_canvas_elem.id).addClass("swipe_up");
                $("#"+gvar.current_canvas_elem.id+" #arrow").addClass("swipe_arrow_up");
                $("#"+gvar.current_canvas_elem.id+" #start").addClass("swipe_start_up");

            } else if ($("#"+gvar.current_canvas_elem.id).hasClass("swipe_up")) {
                $("#"+gvar.current_canvas_elem.id).removeClass("swipe_up");
                $("#"+gvar.current_canvas_elem.id+" #arrow").removeClass("swipe_arrow_up");
                $("#"+gvar.current_canvas_elem.id+" #start").removeClass("swipe_start_up");
                $("#"+gvar.current_canvas_elem.id).addClass("swipe_right");
                $("#"+gvar.current_canvas_elem.id+" #arrow").addClass("swipe_arrow_right");
                $("#"+gvar.current_canvas_elem.id+" #start").addClass("swipe_start_right");

            } else {
                $("#"+gvar.current_canvas_elem.id).removeClass("swipe_down");
                $("#"+gvar.current_canvas_elem.id+" #arrow").removeClass("swipe_arrow_down");
                $("#"+gvar.current_canvas_elem.id+" #start").removeClass("swipe_start_down");
                $("#"+gvar.current_canvas_elem.id).addClass("swipe_left");
                $("#"+gvar.current_canvas_elem.id+" #arrow").addClass("swipe_arrow_left");
                $("#"+gvar.current_canvas_elem.id+" #start").addClass("swipe_start_left");
            }
        }

        var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
        var act = sc["screen_list"][gvar.cur_ind_scr]["action_list"][gvar.current_action_ind];
        gvar.update_action_properties(act, sc["width"], sc["height"]);

        $(".moving_elem_canvas").removeClass("moving_elem_canvas");
        gvar.current_canvas_elem = null;
        gvar.current_action_ind = null;

        gvar.clean_views();
        if (gvar.initialX_canvas == x_canvas && gvar.initialY_canvas == y_canvas &&
            gvar.initialW_canvas == w_canvas && gvar.initialH_canvas == h_canvas &&
            !swipe_canvas) {
            gvar.undo();
        } else {
            gvar.compute_sequence(sc["screen_list"][gvar.cur_ind_scr],sc);
        }
        gvar.update_views();

        gvar.initialX_canvas = null;
        gvar.initialY_canvas = null;
        gvar.initialX_screen = null;
        gvar.initialY_screen = null;
        gvar.initialW_canvas = null;
        gvar.initialH_canvas = null;
        gvar.firstX_canvas = null;
        gvar.firstY_canvas = null;
        gvar.action_type = null;
        gvar.keep_ratio = null;
    }
}
gvar.handle_mouse_action_canvas = handle_mouse_action_canvas;

function create_div_action_canvas(type) {
    var div = document.createElement('div');
    div.className = "elem_canvas "+type;
    div.id = "elem_"+gvar.cur_id;
    if (type == "swipe") {
        div.className = "elem_canvas "+type+" swipe_right";
        var sub_div;
        sub_div = document.createElement('div');
        sub_div.className = "swipe_arrow swipe_arrow_right";
        sub_div.id = "arrow";
        div.appendChild(sub_div);
        sub_div = document.createElement('div');
        sub_div.className = "swipe_start swipe_start_right";
        sub_div.id = "start";
        div.appendChild(sub_div);
    }
    gvar.cur_id += 1;
    return div;
}
gvar.create_div_action_canvas = create_div_action_canvas;

function add_action(type, div, ind) {
    var new_act = {};
    new_act["type"] = type;
    new_act["div_seq"] = div;
    new_act["listeners_seq"] = [];
    new_act["listeners_seq"].push({"event": "mousedown", "callback":gvar.handle_mouse_action_timeline});
    new_act["div_canvas"] = gvar.create_div_action_canvas(type);
    new_act["listeners_canvas"] = [];
    new_act["listeners_canvas"].push({"event": "mousedown", "callback":gvar.handle_mouse_action_canvas});

    var sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    gvar.update_action_properties(new_act, sc["width"], sc["height"]);
    var scr = sc["screen_list"][gvar.cur_ind_scr];
    scr["action_list"].splice(ind, 0, new_act);
}
gvar.add_action = add_action;

function clone_action(act) {
    if (typeof act === 'undefined') {
        return;
    }

    var new_act = {};
    new_act["type"] = act["type"];
    var new_properties = {};
    for (var key in act["properties"]) {
        new_properties[key] = act["properties"][key];
    }
    new_act["properties"] = new_properties;

    new_act["div_seq"] = act["div_seq"].cloneNode(true);
    new_act["div_seq"].id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    if (act["type"] == "timeout" ||
        act["type"] == "multiplier" ||
        act["type"] == "rotation" ||
        act["type"] == "scaling") {
        new_act["div_seq"].lastElementChild.lastElementChild.id = "elem_"+gvar.cur_id;
        gvar.cur_id += 1;
    }
    var new_listeners_seq = [];
    for (var k = 0; k < act["listeners_seq"].length; k++) {
        new_listeners_seq.push({"event":    act["listeners_seq"][k]["event"],
                                "callback": act["listeners_seq"][k]["callback"]});
    }
    new_act["listeners_seq"] = new_listeners_seq;

    new_act["div_canvas"] = act["div_canvas"].cloneNode(true);
    new_act["div_canvas"].id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    var new_listeners_canvas = [];
    for (var k = 0; k < act["listeners_canvas"].length; k++) {
        new_listeners_canvas.push({"event":    act["listeners_canvas"][k]["event"],
                                   "callback": act["listeners_canvas"][k]["callback"]});
    }
    new_act["listeners_canvas"] = new_listeners_canvas;

    return new_act;
}
gvar.clone_action = clone_action;

function delete_action(act) {
    if (typeof act === 'undefined') {
        var scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
        if (scr["selected"] == null) {
            return;
        }
        var act_list = scr["action_list"];
        var ind = scr["selected"];
        act = act_list[ind];
        act_list.splice(ind,1);
        scr["selected"] = null;
    }
    delete act;
    return null;
}
gvar.delete_action = delete_action;

function set_screen() {

    $(".angle_spinner").spinner().spinner("value", 90);
    $(".angle_spinner").spinner().spinner("option", "min", -360);
    $(".angle_spinner").spinner({
        change: function(event, ui) { $(this).parent().parent().attr("degval", $(this).val()); },
        stop: function(event, ui)   { $(this).parent().parent().attr("degval", $(this).val()); }
    });
    $(".ratio_spinner").spinner().spinner("value", 20);
    $(".ratio_spinner").spinner().spinner("option", "min", -1000);
    $(".ratio_spinner").spinner({
        change: function(event, ui) { $(this).parent().parent().attr("ratioval", $(this).val()); },
        stop: function(event, ui)   { $(this).parent().parent().attr("ratioval", $(this).val()); }
    });

    $(".timeout_spinner").spinner().spinner("value", 1000);
    $(".timeout_spinner").spinner().spinner("option", "min", 1);
    $(".timeout_spinner").spinner({
        change: function(event, ui) { $(this).parent().parent().attr("msval", $(this).val()); },
        stop: function(event, ui)   { $(this).parent().parent().attr("msval", $(this).val()); }
    });
    $(".multiplier_spinner").spinner().spinner("value", 1);
    $(".multiplier_spinner").spinner().spinner("option", "min", 1);
    $(".multiplier_spinner").spinner({
        change: function(event, ui) { $(this).parent().parent().attr("multval", $(this).val()); },
        stop: function(event, ui)   { $(this).parent().parent().attr("multval", $(this).val()); }
    });

    $("#hidden_up_backgrnd").change(function(){ gvar.load_background_from_file(this); });
    $("#hidden_up_backgrnd").hide();
    document.getElementById("up_backgrnd").addEventListener("click", function(evt) { $("#hidden_up_backgrnd").click(); });

    function aux() {
        if (gvar.cur_ind_scr != null) {
            gvar.clean_views();
            gvar.save_changes_with_buffer();
            gvar.screen_changed();
            gvar.update_views();
        }
    }
    $("#screen_name").on("change paste keyup", function(evt) { aux(); });

    $("#button").on("click", function() {
        if ($("#button").hasClass("pressed_card")) {
            $("#button").removeClass("pressed_card");
            $("#button .circle_square").slideDown();
            $("#button_square").slideUp("slow");
            $("#button_circle").slideUp("slow");
            $("#multiplier").slideUp("slow");
        } else {
            $("#button").addClass("pressed_card");
            $("#button .circle_square").slideUp();
            $("#button_square").slideDown("slow");
            $("#button_circle").slideDown("slow");
            $("#multiplier").slideDown("slow");
        }
    });
    $("#button_square").on("mousedown", { type: "button_square button square" }, handle_mouse_action);
    $("#button_circle").on("mousedown", { type: "button_circle button circle" }, handle_mouse_action);
    $("#multiplier").on("mousedown", { type: "multiplier" }, handle_mouse_action);
    $("#button_square").hide();
    $("#button_circle").hide();
    $("#multiplier").hide();

    $("#token").on("click", function() {
        if ($("#token").hasClass("pressed_card")) {
            $("#token").removeClass("pressed_card");
            $("#token .circle_square").slideDown();
            $("#token_square").slideUp("slow");
            $("#token_circle").slideUp("slow");
        } else {
            $("#token").addClass("pressed_card");
            $("#token .circle_square").slideUp();
            $("#token_square").slideDown("slow");
            $("#token_circle").slideDown("slow");
        }
    });
    $("#token_square").on("mousedown", { type: "token_square token square" }, handle_mouse_action);
    $("#token_circle").on("mousedown", { type: "token_circle token circle" }, handle_mouse_action);
    $("#token_square").hide();
    $("#token_circle").hide();

    $("#drop").on("click", function() {
        if ($("#drop").hasClass("pressed_card")) {
            $("#drop").removeClass("pressed_card");
            $("#drop .circle_square").slideDown();
            $("#drop_square").slideUp("slow");
            $("#drop_circle").slideUp("slow");
        } else {
            $("#drop").addClass("pressed_card");
            $("#drop .circle_square").slideUp();
            $("#drop_square").slideDown("slow");
            $("#drop_circle").slideDown("slow");
        }
    });
    $("#drop_square").on("mousedown", { type: "drop_square drop square" }, handle_mouse_action);
    $("#drop_circle").on("mousedown", { type: "drop_circle drop circle" }, handle_mouse_action);
    $("#drop_square").hide();
    $("#drop_circle").hide();

    $("#gestures").on("click", function() {
        if ($("#gestures").hasClass("pressed_card")) {
            $("#gestures").removeClass("pressed_card");
            $("#gestures .arrow_up").slideDown();
            $("#gestures .arrow_down").slideDown();
            $("#gestures .arrow_right").slideDown();
            $("#gestures .arrow_left").slideDown();
            $("#rotation").slideUp("slow");
            $("#scaling").slideUp("slow");
            $("#swipe").slideUp("slow");
        } else {
            $("#gestures").addClass("pressed_card");
            $("#gestures .arrow_up").slideUp();
            $("#gestures .arrow_down").slideUp();
            $("#gestures .arrow_right").slideUp();
            $("#gestures .arrow_left").slideUp();
            $("#rotation").slideDown("slow");
            $("#scaling").slideDown("slow");
            $("#swipe").slideDown("slow");
        }
    });
    $("#rotation").on("mousedown", { type: "rotation" }, handle_mouse_action);
    $("#scaling").on("mousedown", { type: "scaling" }, handle_mouse_action);
    $("#swipe").on("mousedown", { type: "swipe" }, handle_mouse_action);
    $("#rotation").hide();
    $("#scaling").hide();
    $("#swipe").hide();

    $("#timers").on("click", function() {
        if ($("#timers").hasClass("pressed_card")) {
            $("#timers").removeClass("pressed_card");
            $("#timers .clock_outer").slideDown();
            $("#timers .clock_square").slideDown();
            $("#timers .clock_inner").slideDown();
            $("#timers .clock_arrow").slideDown();
            $("#dwell").slideUp("slow");
            $("#timeout").slideUp("slow");
        } else {
            $("#timers").addClass("pressed_card");
            $("#timers .clock_outer").slideUp();
            $("#timers .clock_square").slideUp();
            $("#timers .clock_inner").slideUp();
            $("#timers .clock_arrow").slideUp();
            $("#dwell").slideDown("slow");
            $("#timeout").slideDown("slow");
        }
    });
    $("#dwell").on("mousedown", { type: "dwell" }, handle_mouse_action);
    $("#timeout").on("mousedown", { type: "timeout" }, handle_mouse_action);
    $("#dwell").hide();
    $("#timeout").hide();

    $("#main").on("mousemove mouseup", { type: "none" }, handle_mouse_action);
    $("#main").on("mousemove mouseup", handle_mouse_action_timeline);
    $("#main").on("mousemove mouseup", handle_mouse_action_canvas);

    document.getElementById("screen_undo").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.undo();
        gvar.update_views();
    });
    document.getElementById("screen_redo").addEventListener("click", function(evt) {
        gvar.clean_views();
        gvar.redo();
        gvar.update_views();
    });
    document.getElementById("screen_save").addEventListener("click", function(evt) {
        gvar.clean_views();
        var to_save = {"type":"screen", "data":gvar.save_screen()};
        // window.open('data:text/plain;charset=utf-8,' + escape(JSON.stringify(to_save)));

        var blob = new Blob([escape(JSON.stringify(to_save))], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, "screen.ssc");

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
                    if (data["type"] == "screen") {
                        gvar.clean_views();
                        gvar.store_current_history();
                        gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr] = gvar.load_screen(data["data"]);
                        gvar.set_cur_screen(gvar.cur_ind_scr);
                        gvar.update_views();
                    } else {
                        gvar.set_general_error("The loaded file does not describe a screen but a "+data["type"]+".");
                    }
                } catch(err) {
                    gvar.set_general_error("The loaded file is not recognized.");
                }
                $("#hidden_screen_load").prop("value","");
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
                // if (data["type"] == "screen") {
                //     gvar.clean_views();
                //     gvar.store_current_history();
                //     gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr] = gvar.load_screen(data["data"]);
                //     gvar.set_cur_screen(gvar.cur_ind_scr);
                //     gvar.update_views();
                // }
                // $("#hidden_screen_load").prop("value","");
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#hidden_screen_load").change(function() { readData(this); });
    $("#hidden_screen_load").hide();
    document.getElementById("screen_load").addEventListener("click", function(evt) { $("#hidden_screen_load").click(); });
}
gvar.set_screen = set_screen;

// action format
// action = {
//     "type":             "action type",
//     "properties": {}
//     "div_seq":           html,
//     "listeners_seq":    [{"event": ..., "callback":...}, ...],
//     "div_canvas":        html,
//     "listeners_canvas": [{"event": ..., "callback":...}, ...]
// }

function save_screen(scr) {
    if (typeof scr === 'undefined') {
        scr = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr];
    }
    var to_save = gvar.clone_screen(scr);
    to_save["div"] = to_save["div"].outerHTML
    for (var l = 0; l < to_save["listeners"].length; l++) {
        to_save["listeners"][l]["callback"] = "gvar."+to_save["listeners"][l]["callback"].name;
    }
    for (var k = 0; k < to_save["action_list"].length; k++) {
        to_save["action_list"][k]["div_seq"] = to_save["action_list"][k]["div_seq"].outerHTML;
        for (var l = 0; l < to_save["action_list"][k]["listeners_seq"].length; l++) {
            to_save["action_list"][k]["listeners_seq"][l]["callback"] =
                        "gvar."+to_save["action_list"][k]["listeners_seq"][l]["callback"].name;
        }
        to_save["action_list"][k]["div_canvas"] = to_save["action_list"][k]["div_canvas"].outerHTML;
        for (var l = 0; l < to_save["action_list"][k]["listeners_canvas"].length; l++) {
            to_save["action_list"][k]["listeners_canvas"][l]["callback"] =
                        "gvar."+to_save["action_list"][k]["listeners_canvas"][l]["callback"].name;
        }
    }
    return JSON.stringify(to_save);
}
gvar.save_screen = save_screen;

function load_screen(data,sc) {
    var scr = JSON.parse(data);

    var div = document.createElement("div")
    div.innerHTML = scr["div"]
    div = div.firstChild
    div.id = "elem_"+gvar.cur_id;
    gvar.cur_id += 1;
    scr["div"] = div
    for (var l = 0; l < scr["listeners"].length; l++) {
        scr["listeners"][l]["callback"] = eval(scr["listeners"][l]["callback"]);
    }

    for (var k = 0; k < scr["action_list"].length; k++) {
        var div_seq = document.createElement("div")
        div_seq.innerHTML = scr["action_list"][k]["div_seq"]
        div_seq = div_seq.firstChild
        div_seq.id = "elem_"+gvar.cur_id;
        gvar.cur_id += 1;
        scr["action_list"][k]["div_seq"] = div_seq;
        for (var l = 0; l < scr["action_list"][k]["listeners_seq"].length; l++) {
            scr["action_list"][k]["listeners_seq"][l]["callback"] =
                        eval(scr["action_list"][k]["listeners_seq"][l]["callback"]);
        }

        var div_canvas = document.createElement("div")
        div_canvas.innerHTML = scr["action_list"][k]["div_canvas"]
        div_canvas = div_canvas.firstChild
        div_canvas.id = "elem_"+gvar.cur_id;
        gvar.cur_id += 1;
        scr["action_list"][k]["div_canvas"] = div_canvas;
        for (var l = 0; l < scr["action_list"][k]["listeners_canvas"].length; l++) {
            scr["action_list"][k]["listeners_canvas"][l]["callback"] =
                        eval(scr["action_list"][k]["listeners_canvas"][l]["callback"]);
        }
    }
    if (typeof sc === 'undefined') {
        sc = gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc];
    }
    gvar.compute_sequence(scr,sc);
    return scr;
}
gvar.load_screen = load_screen;