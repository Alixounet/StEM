/* client.js
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

window.gvar = {};
var gvar = window.gvar;

function loadjscssfile(filename, filetype){
    //console.log(filename + " loaded");
    if (filetype == "js") {
        var fileref = document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    } else if (filetype == "css") {
        var fileref = document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}

function whenAvailable(names, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        var all_loaded = true;
        for (var k = 0; k < names.length; k++) {
            if (!window[names[k]]) {
                all_loaded = false;
            }
        }
        if (all_loaded) {
            callback();
        } else {
            window.setTimeout(arguments.callee, interval);
        }
    }, interval);
}

$(function(){
    loadjscssfile(window.location.origin + "/socket.io/socket.io.js", "js");
    loadjscssfile("js/Blob.js", "js");
    loadjscssfile("js/FileSaver.js", "js");
    loadjscssfile("js/utils.js", "js");
    loadjscssfile("js/help.js", "js");
    loadjscssfile("js/computation.js","js");
    loadjscssfile("js/graphs.js", "js");
    loadjscssfile("js/sequences.js","js");
    loadjscssfile("js/navigation.js", "js");
    loadjscssfile("js/screen.js", "js");
    loadjscssfile("js/scenario.js", "js");
    loadjscssfile("js/workspace.js", "js");
    loadjscssfile("js/tutorial.js", "js");

    whenAvailable(["io", "set_help", "set_computation", "set_graphs", "update_views", "set_workspace",
                   "set_scenario", "set_screen", "compute_sequence", "set_tutorial"], function() {
        console.log("io and js files loaded");

        // Server communication
        var origin = window.location.origin;
        var socket = io.connect(origin);
        gvar.socket = socket;
        socket.on('connected', function (data) {
            console.log("Server responded and gave the id '"+data+"'.");
        });
        socket.on('crunched', function(data) {
            gvar.update_data(data);
        });
        ////////////////////////
        $("#general_error").hide();
        $("#general_tooltip").hide();

        window.addEventListener("resize", function() { gvar.resize(); });

        gvar.set_help();
        gvar.set_computation();
        gvar.set_graphs();
        gvar.set_workspace();
        gvar.set_scenario();
        gvar.set_screen();
        gvar.set_tutorial();

        $(".spinner").spinner().spinner("option", "min", 1);
        $(".has_tooltip").on('mouseenter', function(){ gvar.display_tooltip($(this)); });
        $(".has_tooltip").on('mouseleave', gvar.remove_tooltip);
        $(".has_tooltip").on('click', gvar.remove_tooltip);
        $(".has_tooltip").on('doubleclick', gvar.remove_tooltip);
        $(".has_tooltip").on('move', gvar.remove_tooltip);

        $("#load_examples").selectmenu({
            change: function(event, ui) {
                $("#load_examples")[0].selectedIndex = 0;
                $("#load_examples").selectmenu("refresh");

                if (ui.item.label == "Checking Updates on Android") {
                    gvar.httpGet_workspace('scenario/simple_paper.sws');
                    if (gvar.tutorial_on) { gvar.tuto_next_step(); }
                } else if (ui.item.label == "Design comparison") {
                    gvar.httpGet_workspace('scenario/comparison_paper.sws');
                } else if (ui.item.label == "Misc.") {
                    gvar.httpGet_workspace('scenario/scenarios_paper.sws');
                }
            }
        });
    });
})