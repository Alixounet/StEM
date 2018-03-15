/* navigation.js
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

gvar.ws_hist = [];
gvar.cur_ws_hist = -1;
gvar.cur_id = 1;
gvar.change_timeout = null;

// workspace history format
// [null, ..., {ws at t-1}, {ws at t}, {ws at t+1}, ...]

// workspace format
// ws = {
//     "view":     "ws" or "sc" or "scr"
//     "selected": ind,
//     "scenario_list": [see scenario format]
// }

// scenario format
// sc = {
//     "name":   "scenario name",
//     "width":  int,
//     "height": int,
//     "div":    html,
//     "listeners" : [{"event": ..., "callback":...}, ...],
//
//     "selected": ind,
//     "screen_list": [see screen format]
// }

// screen format
// scr = {
//     "name":       "screen name",
//     "seq":        [axiom1, axiom2, ...],
//     "background": data,
//     "div":        html,
//     "listeners" : [{"event": ..., "callback":...}, ...],
//
//     "selected": ind,
//     "action_list": [see action format]
// }

// action format
// action = {
//     "type":             "action type",
//     "properties": {}
//     "div_seq":           html,
//     "listeners_seq":    [{"event": ..., "callback":...}, ...],
//     "div_canvas":        html,
//     "listeners_canvas": [{"event": ..., "callback":...}, ...]
// }

gvar.connectors = []
gvar.reusable_connectors = []
function clean_connectors() {
    for (var k = 0; k < gvar.connectors.length; k++) {
        gvar.connectors[k].remove();
        gvar.reusable_connectors.push(gvar.connectors[k]);
        gvar.connectors[k] = null;
    }
    gvar.connectors = [];
}
gvar.clean_connectors = clean_connectors;

function add_connector(action_list, axiom_list, cur_ind, screen_w, screen_h) {
    var conn = gvar.reusable_connectors.pop();
    if (typeof conn == 'undefined') {
        conn = document.createElement('div');
    }
    conn.className = "connector "+axiom_list[cur_ind]["connector"];

    var norm, dx, dy, left, top;
    if (action_list[cur_ind]["type"].indexOf("swipe") != -1 ||
        action_list[cur_ind]["type"].indexOf("dwell") != -1 ||
        action_list[cur_ind]["type"].indexOf("timeout") != -1 ||
        action_list[cur_ind]["type"].indexOf("multiplier") != -1 ||
        action_list[cur_ind]["type"].indexOf("rotation") != -1 ||
        action_list[cur_ind]["type"].indexOf("scaling") != -1) {
        if (action_list[cur_ind-1]["type"].indexOf("swipe") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("dwell") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("timeout") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("multiplier") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("rotation") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("scaling") != -1) {
            dx =   action_list[cur_ind]["properties"]["left"] * $("#interface").width() / screen_w + action_list[cur_ind]["properties"]["width"]*0.5
                 - action_list[cur_ind-1]["properties"]["left"] * $("#interface").width() / screen_w - action_list[cur_ind-1]["properties"]["width"]*0.5;
            dy =   action_list[cur_ind]["properties"]["top"] * $("#interface").height() / screen_h + action_list[cur_ind]["properties"]["height"]*0.5
                 - action_list[cur_ind-1]["properties"]["top"] * $("#interface").height() / screen_h - action_list[cur_ind-1]["properties"]["height"]*0.5;
            norm = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

            left = action_list[cur_ind-1]["properties"]["left"] * $("#interface").width() / screen_w + action_list[cur_ind-1]["properties"]["width"]*0.5;
            top = action_list[cur_ind-1]["properties"]["top"] * $("#interface").height() / screen_h + action_list[cur_ind-1]["properties"]["height"]*0.5;
        } else {
            dx =   action_list[cur_ind]["properties"]["left"] * $("#interface").width() / screen_w + action_list[cur_ind]["properties"]["width"]*0.5
                 - (action_list[cur_ind-1]["properties"]["left"] + action_list[cur_ind-1]["properties"]["width"]*0.5)
                   * $("#interface").width() / screen_w;
            dy =   action_list[cur_ind]["properties"]["top"] * $("#interface").height() / screen_h + action_list[cur_ind]["properties"]["height"]*0.5
                 - (action_list[cur_ind-1]["properties"]["top"] + action_list[cur_ind-1]["properties"]["height"]*0.5)
                   * $("#interface").height() / screen_h;
            norm = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

            left = action_list[cur_ind-1]["properties"]["left"] + action_list[cur_ind-1]["properties"]["width"]*0.5;
            left = $("#interface").width() * left / screen_w;
            top = action_list[cur_ind-1]["properties"]["top"] + action_list[cur_ind-1]["properties"]["height"]*0.5;
            top = $("#interface").height() * top / screen_h;
        }
    } else {
        if (action_list[cur_ind-1]["type"].indexOf("swipe") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("dwell") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("timeout") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("multiplier") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("rotation") != -1 ||
            action_list[cur_ind-1]["type"].indexOf("scaling") != -1) {
            dx =   (action_list[cur_ind]["properties"]["left"] + action_list[cur_ind]["properties"]["width"]*0.5)
                   * $("#interface").width() / screen_w
                 - action_list[cur_ind-1]["properties"]["left"] * $("#interface").width() / screen_w - action_list[cur_ind-1]["properties"]["width"]*0.5;
            dy =   (action_list[cur_ind]["properties"]["top"] + action_list[cur_ind]["properties"]["height"]*0.5)
                   * $("#interface").height() / screen_h
                 - action_list[cur_ind-1]["properties"]["top"] * $("#interface").height() / screen_h - action_list[cur_ind-1]["properties"]["height"]*0.5;
            norm = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

            left = action_list[cur_ind-1]["properties"]["left"] * $("#interface").width() / screen_w + action_list[cur_ind-1]["properties"]["width"]*0.5;
            top = action_list[cur_ind-1]["properties"]["top"] * $("#interface").height() / screen_h + action_list[cur_ind-1]["properties"]["height"]*0.5;
        } else {
            dx =   action_list[cur_ind]["properties"]["left"] + action_list[cur_ind]["properties"]["width"]*0.5
                 - action_list[cur_ind-1]["properties"]["left"] - action_list[cur_ind-1]["properties"]["width"]*0.5;
            dy =   action_list[cur_ind]["properties"]["top"] + action_list[cur_ind]["properties"]["height"]*0.5
                 - action_list[cur_ind-1]["properties"]["top"] - action_list[cur_ind-1]["properties"]["height"]*0.5;
            norm = Math.sqrt(  Math.pow($("#interface").width() * dx / screen_w,2)
                             + Math.pow($("#interface").height() * dy / screen_h,2));

            left = action_list[cur_ind-1]["properties"]["left"] + action_list[cur_ind-1]["properties"]["width"]*0.5;
            left = $("#interface").width() * left / screen_w;
            top = action_list[cur_ind-1]["properties"]["top"] + action_list[cur_ind-1]["properties"]["height"]*0.5;
            top = $("#interface").height() * top / screen_h;
        }
    }
    // norm += 4
    // top -= 2;
    // left -= 2;

    var cos_theta = gvar.scalarProduct(dx,dy,1,0)/
                    (Math.sqrt(gvar.scalarProduct(dx,dy,dx,dy))*
                     Math.sqrt(gvar.scalarProduct(1,0,1,0)))
    var sign = (dx*0-dy*1<0?-1.0:1.0);
    var theta = -sign*Math.acos(cos_theta)*180.0/Math.PI;

    var angle = 0;
    if (!isNaN(theta)) {
        angle = theta;
    }

    var css = ""
    css += "left:"+left+"px;"
    css += "top:"+top+"px;"
    css += "width:"+norm+"px;"
    css += "-ms-transform:rotate("+angle+"deg);"
    css += "-moz-transform:rotate("+angle+"deg);"
    css += "-webkit-transform:rotate("+angle+"deg);"
    css += "-o-transform:rotate("+angle+"deg);"
    conn.setAttribute("style",css)

    gvar.connectors.push(conn);
    document.getElementById("interface").appendChild(conn);
}
gvar.add_connector = add_connector;

// remove divs, selection, callbacks
gvar.scrollSelected = 0;
gvar.scrollTotal = 999999;
gvar.lastScrollTop = 0;
function clean_views() {
    gvar.clean_connectors();
    $(".angle_spinner").spinner("destroy");
    $(".ratio_spinner").spinner("destroy");
    $(".timeout_spinner").spinner("destroy");
    $(".multiplier_spinner").spinner("destroy");

    var ws = gvar.ws_hist[gvar.cur_ws_hist];
    for (var k1 = 0; k1 < ws["scenario_list"].length; k1++) {
        var sc = ws["scenario_list"][k1];

        $("#"+sc["div"].id).removeClass("selected");
        sc["div"].remove();
        sc["div"] = sc["div"].cloneNode(true); // remove all listeners

        gvar.lastScrollTop = 0;
        gvar.scrollTotal = 999999;
        gvar.lastScrollTop = 0;
        for (var k2 = 0; k2 < sc["screen_list"].length; k2++) {
            var scr = sc["screen_list"][k2];

            $("#"+scr["div"].id).removeClass("selected");
            scr["div"].remove();
            scr["div"] = scr["div"].cloneNode(true); // remove all listeners
            if (k2 == sc["selected"] && gvar.screen_on) {
                gvar.lastScrollTop = document.getElementById("timeline").scrollTop;
                gvar.scrollTotal = 0;
                for (var k3 = 0; k3 < scr["action_list"].length; k3++) {
                    var act = scr["action_list"][k3];
                    gvar.scrollTotal += 5 + $("#"+act["div_seq"].id).height();
                    if ($("#"+act["div_seq"].id).hasClass("moving_card_timeline")) {
                        gvar.scrollSelected = gvar.scrollTotal;
                    }
                }
            }

            for (var k3 = 0; k3 < scr["action_list"].length; k3++) {
                var act = scr["action_list"][k3];

                $("#"+act["div_seq"].id).removeClass("selected");
                $("#"+act["div_seq"].id).removeClass("problem");
                act["div_seq"].remove();
                act["div_seq"] = act["div_seq"].cloneNode(true); // remove all listeners

                $("#"+act["div_canvas"].id).removeClass("selected");
                $("#"+act["div_canvas"].id).removeClass("problem");
                act["div_canvas"].remove();
                act["div_canvas"] = act["div_canvas"].cloneNode(true); // remove all listeners
            }
            // scr["selected"] = null;
        }
        // sc["selected"] = null;
    }
    // ws["selected"] = null;
}
gvar.clean_views = clean_views;

function save_changes_delay_done() {
    gvar.change_timeout = null;
}
gvar.save_changes_delay_done = save_changes_delay_done;

function save_changes_with_buffer() {
    if (gvar.change_timeout == null) {
        gvar.store_current_history();
        gvar.change_timeout = setTimeout(save_changes_delay_done, 3000);
    } else {
        clearTimeout(gvar.change_timeout);
        gvar.change_timeout = setTimeout(save_changes_delay_done, 3000);
    }
}
gvar.save_changes_with_buffer = save_changes_with_buffer;

// to be called before any changes
function store_current_history() {
    if (gvar.change_timeout != null) {
        clearTimeout(gvar.change_timeout);
    }
    if (gvar.cur_ws_hist < gvar.ws_hist.length-1) {
        gvar.ws_hist.splice(gvar.cur_ws_hist+1, gvar.ws_hist.length - gvar.cur_ws_hist+1);
    }
    gvar.ws_hist.push(gvar.clone_workspace(gvar.ws_hist[gvar.cur_ws_hist]));
    gvar.cur_ws_hist += 1;
}
gvar.store_current_history = store_current_history;

function update_views() {
    var ws = gvar.ws_hist[gvar.cur_ws_hist];
    for (var k1 = 0; k1 < ws["scenario_list"].length; k1++) {
        var sc = ws["scenario_list"][k1];

        sc["div"].innerHTML  = "Scenario n&deg;"+(k1+1)+"<br><br>"+sc["name"];
        sc["div"].innerHTML += "<br>&nbsp;&nbsp;w: "+sc["width"]+"mm";
        sc["div"].innerHTML += "<br>&nbsp;&nbsp;h: "+sc["height"]+"mm";
        sc["div"].innerHTML += "<br>";
        sc["div"].innerHTML += "<br>"+sc["screen_list"].length+" screen(s)";
        document.getElementById("scenarios").appendChild(sc["div"]);
        for (var l1 = 0; l1 < sc["listeners"].length; l1++) {
            var evt_name = sc["listeners"][l1]["event"];
            var cbck = sc["listeners"][l1]["callback"];
            !function outer(sc,k1,evt_name,cbck){ sc["div"].addEventListener(evt_name, function(evt) { cbck(evt,k1); }, true); }(sc,k1,evt_name,cbck);
        }

        if (ws["selected"] == k1) {
            sc["div"].className += " selected";
            for (var k2 = 0; k2 < sc["screen_list"].length; k2++) {
                var scr = sc["screen_list"][k2];
                var strgs = gvar.sequence_to_string(scr["seq"]);
                var seq = strgs[0];
                if (seq == 'null') { seq = 'empty'; }
                var err = strgs[1];

                var inner_html = "";
                if (scr["background"] != null) {
                    inner_html += '<div class="screen_prev" style="background-image: url('+scr["background"]+');">';
                } else {
                    inner_html = '<div class="screen_prev" style="background-image: url(img/background.png);">';
                }
                inner_html += '<div class="descr_prev">Screen n&deg;'+(k2+1)+'<br>'+scr["name"];
                inner_html += '<br>Seq: '+seq+'</div></div>';
                scr["div"].innerHTML = inner_html;
                document.getElementById("screens").appendChild(scr["div"]);
                for (var l2 = 0; l2 < scr["listeners"].length; l2++) {
                    var evt_name = scr["listeners"][l2]["event"];
                    var cbck = scr["listeners"][l2]["callback"];
                    !function outer(scr,k2,evt_name,cbck){ scr["div"].addEventListener(evt_name, function(evt) { cbck(evt,k2); }, true); }(scr,k2,evt_name,cbck);
                }

                if (sc["selected"] == k2) {
                    scr["div"].className += " selected";
                    if (scr["background"] != null) {
                        $("#interface").css({"background-image": "url("+scr["background"]+")"});
                    } else {
                        $("#interface").css({"background-image": "url(img/background.png)"});
                    }
                    document.getElementById("sequence_name").innerHTML = "Seq: "+seq+"<br>"+err;

                    var screen_w = sc["width"];
                    var screen_h = sc["height"];
                    for (var k3 = 0; k3 < scr["action_list"].length; k3++) {
                        var act = scr["action_list"][k3];

                        document.getElementById("timeline").appendChild(act["div_seq"]);
                        for (var l3 = 0; l3 < act["listeners_seq"].length; l3++) {
                            var evt_name = act["listeners_seq"][l3]["event"];
                            var cbck = act["listeners_seq"][l3]["callback"];
                            !function outer(act,k3,evt_name,cbck){ act["div_seq"].addEventListener(evt_name, function(evt) { cbck(evt,k3); }, true); }(act,k3,evt_name,cbck);
                        }

                        if (k3 > 0) {
                            gvar.add_connector(scr["action_list"], scr["seq"], k3, screen_w, screen_h);
                        }

                        act["div_canvas"].style.left = (act["properties"]["left"] * $("#interface").width() / screen_w)+"px";
                        act["div_canvas"].style.top = (act["properties"]["top"] * $("#interface").height() / screen_h)+"px";
                        act["div_canvas"].style.width = (act["properties"]["width"] * $("#interface").width() / screen_w)+"px";
                        act["div_canvas"].style.height = (act["properties"]["height"] * $("#interface").height() / screen_h)+"px";
                        if (act["type"].indexOf("swipe") != -1 ||
                            act["type"].indexOf("dwell") != -1 ||
                            act["type"].indexOf("timeout") != -1 ||
                            act["type"].indexOf("multiplier") != -1 ||
                            act["type"].indexOf("rotation") != -1 ||
                            act["type"].indexOf("scaling") != -1) {
                            act["div_canvas"].style.width = act["properties"]["width"]+"px";
                            act["div_canvas"].style.height = act["properties"]["height"]+"px";
                        }

                        document.getElementById("interface").appendChild(act["div_canvas"]);
                        for (var l3 = 0; l3 < act["listeners_canvas"].length; l3++) {
                            var evt_name = act["listeners_canvas"][l3]["event"];
                            var cbck = act["listeners_canvas"][l3]["callback"];
                            !function outer(act,k3,evt_name,cbck){ act["div_canvas"].addEventListener(evt_name, function(evt) { cbck(evt,k3); }, true); }(act,k3,evt_name,cbck);
                        }

                        if (gvar.is_wrong(scr["seq"][k3]["seq"])) {
                            act["div_seq"].className += " problem";
                            act["div_canvas"].className += " problem";
                        }
                    }
                    if (k2 == sc["selected"] && gvar.screen_on) {
                        var max_scroll = document.getElementById("timeline").scrollHeight
                                         - document.getElementById("timeline").clientHeight;
                        var ratio = gvar.scrollSelected/gvar.scrollTotal;
                        var ch = document.getElementById("timeline").scrollHeight;
                        var new_scroll_top = ratio*max_scroll;
                        if (((new_scroll_top - gvar.lastScrollTop) < max_scroll*50/gvar.scrollTotal && 
                            (new_scroll_top - gvar.lastScrollTop) > max_scroll - max_scroll*50/gvar.scrollTotal)) {
                            document.getElementById("timeline").scrollTop = new_scroll_top;
                        } else {
                            document.getElementById("timeline").scrollTop = gvar.lastScrollTop;
                        }
                    }
                }
            }
            document.getElementById("screens").appendChild(document.getElementById("scenario_but"));
        }

        $(".has_tooltip").off('mouseenter');
        $(".has_tooltip").off('mouseleave');
        $(".has_tooltip").off('click', gvar.remove_tooltip);
        $(".has_tooltip").off('doubleclick', gvar.remove_tooltip);
        $(".has_tooltip").off('move', gvar.remove_tooltip);
        $(".has_tooltip").on('mouseenter', function(){ gvar.display_tooltip($(this)); });
        $(".has_tooltip").on('mouseleave', gvar.remove_tooltip);
        $(".has_tooltip").on('click', gvar.remove_tooltip);
        $(".has_tooltip").on('doubleclick', gvar.remove_tooltip);
        $(".has_tooltip").on('move', gvar.remove_tooltip);
    }

    // console.log(to_save["action_list"][k]["div_seq"].lastElementChild.lastElementChild.getAttribute("msval"))
    $(".angle_spinner").spinner().spinner("option", "min", -360);
    $(".angle_spinner").each( function() {
        $(this).spinner().spinner("value", $(this).parent().parent().attr("degval"));
    });
    $(".angle_spinner").spinner({
        change: function(event, ui) {
            $(this).parent().parent().attr("degval", $(this).val());
            gvar.change_from_spinner();
        },
        stop: function(event, ui)   {
            $(this).parent().parent().attr("degval", $(this).val());
            gvar.change_from_spinner();
        }
    });
    $(".ratio_spinner").spinner().spinner("option", "min", -1000);
    $(".ratio_spinner").each( function() {
        $(this).spinner().spinner("value", $(this).parent().parent().attr("ratioval"));
    });
    $(".ratio_spinner").spinner({
        change: function(event, ui) {
            $(this).parent().parent().attr("ratioval", $(this).val());
            gvar.change_from_spinner();
        },
        stop: function(event, ui)   {
            $(this).parent().parent().attr("ratioval", $(this).val());
            gvar.change_from_spinner();
        }
    });
    $(".timeout_spinner").spinner().spinner("option", "min", 1);
    $(".timeout_spinner").each( function() {
        $(this).spinner().spinner("value", $(this).parent().parent().attr("msval"));
    });
    $(".timeout_spinner").spinner({
        change: function(event, ui) {
            $(this).parent().parent().attr("msval", $(this).val());
            gvar.change_from_spinner();
        },
        stop: function(event, ui)   {
            $(this).parent().parent().attr("msval", $(this).val());
            gvar.change_from_spinner();
        }
    });
    $(".multiplier_spinner").spinner().spinner("option", "min", 1);
    $(".multiplier_spinner").each( function() {
        $(this).spinner().spinner("value", $(this).parent().parent().attr("multval"));
    });
    $(".multiplier_spinner").spinner({
        change: function(event, ui) {
            $(this).parent().parent().attr("multval", $(this).val());
            gvar.change_from_spinner();
        },
        stop: function(event, ui)   {
            $(this).parent().parent().attr("multval", $(this).val());
            gvar.change_from_spinner();
        }
    });

    if (ws["view"] == "ws") {
        gvar.enable_workspace(true,false);
        gvar.enable_scenario(false,false);
        gvar.enable_screen(false,false);
    } else if (ws["view"] == "sc") {
        gvar.enable_workspace(false,false);
        gvar.enable_scenario(true,false);
        gvar.enable_screen(false,false);
    } else {
        gvar.enable_workspace(false,false);
        gvar.enable_scenario(false,false);
        gvar.enable_screen(true,false);
    }
}
gvar.update_views = update_views;

function undo() {
    gvar.cur_ws_hist -= 1;
    gvar.cur_ws_hist = (gvar.cur_ws_hist<0?0:gvar.cur_ws_hist);
}
gvar.undo = undo;

function redo() {
    gvar.cur_ws_hist += 1;
    gvar.cur_ws_hist = (gvar.cur_ws_hist>gvar.ws_hist.length-1?gvar.ws_hist.length-1:gvar.cur_ws_hist);
}
gvar.redo = redo;