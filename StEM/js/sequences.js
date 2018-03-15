/* sequences.js
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

// sequence element
// axiom {
//     "type":        WRONG, TAP, POINTING, DRAG, SWIPE, DWELL
//     "direction":   EAST, WEST, NORTH, SOUTH    -- only for SWIPE
//     "ID":          float                       -- all but SWIPE, DWELL
//     "time":        int in ms
//     "orientation": Landscape, Portrait
//     "diagonal":    in inches (every .5)
// }
function add_wrong(reason) {
    return {"type": "WRONG", "time": 500, "reason": reason};
} gvar.add_wrong = add_wrong;

function add_tap(act,sc,is_gesture) {
    var axiom = {};
    axiom["type"] = "TAP";
    axiom["time"] = null;
    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    var diameter = Math.min(sc["width"],sc["height"])*0.5; // for swipe
    if (!is_gesture) {
        diameter = Math.min(act["properties"]["width"],act["properties"]["height"]);
    }
    var id = Math.log2(1 + (scr_diag / diameter));
    axiom["ID"] = id;
    // console.log("TAP: "+id+"("+sc["width"]+" "+sc["height"]+" "+scr_diag+" "+diameter+")");

    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_tap = add_tap;

function add_pointing(act,last_act,sc,is_gesture) {
    var axiom = {};
    axiom["type"] = "POINTING";
    axiom["time"] = null;
    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    var tol = Math.min(sc["width"],sc["height"])*0.5; // for swipe
    if (!is_gesture) {
        tol = Math.min(act["properties"]["width"],act["properties"]["height"]);
    }
    if (tol < 1) {
        return gvar.add_wrong("Pointing: target too small");
    }
    var dx =        act["properties"]["left"] + act["properties"]["width"]*0.5
             - last_act["properties"]["left"] - last_act["properties"]["width"]*0.5;
    var dy =        act["properties"]["top"] + act["properties"]["height"]*0.5
             - last_act["properties"]["top"] - last_act["properties"]["height"]*0.5;
    var amp = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
    // if (amp < 1) {
    //     return gvar.add_wrong("Pointing: target is too close from the starting point");
    // }
    var id = Math.log2(1 + (amp / tol));
    axiom["ID"] = id;
    // console.log("POINTING: "+id+"("+scr_diag+" "+tol+" "+amp+")");

    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_pointing = add_pointing;

function add_drag(act,last_token_act,last_act,sc) {
    var axiom = {};
    axiom["type"] = "DRAG";
    axiom["time"] = null;
    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    var tol = Math.min(act["properties"]["width"] - last_token_act["properties"]["width"],
                       act["properties"]["height"] - last_token_act["properties"]["height"]);
    if (tol < 1) {
        return gvar.add_wrong("Drag: drop area smaller than the token");
    }
    var dx =        act["properties"]["left"] + act["properties"]["width"]*0.5
             - last_act["properties"]["left"] - last_act["properties"]["width"]*0.5;
    var dy =        act["properties"]["top"] + act["properties"]["height"]*0.5
             - last_act["properties"]["top"] - last_act["properties"]["height"]*0.5;
    var amp = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
    if (amp < 1) {
        return gvar.add_wrong("Drag: target is too close from the starting point");
    }
    var id = Math.log2(1 + (amp / tol));
    axiom["ID"] = id;
    // console.log("DRAG: "+id+"("+scr_diag+" "+tol+" "+amp+")");

    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;

    return axiom;
} gvar.add_drag = add_drag;

function add_swipe(act,sc) {
    var axiom = {};
    axiom["type"] = "SWIPE";
    axiom["time"] = null;
    if (act["properties"]["direction"] == "right") {
        axiom["direction"] = "EAST";
    } else if (act["properties"]["direction"] == "left") {
        axiom["direction"] = "WEST";
    } else if (act["properties"]["direction"] == "up") {
        axiom["direction"] = "NORTH";
    } else {
        axiom["direction"] = "SOUTH";
    }

    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_swipe = add_swipe;

function add_dwell(act,sc) {
    var axiom = {};
    axiom["type"] = "DWELL";
    axiom["time"] = act["properties"]["time"];

    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_dwell = add_dwell;

function add_timeout(act,sc) {
    var axiom = {};
    axiom["type"] = "TIMEOUT";
    axiom["time"] = parseInt(act["div_seq"].lastElementChild.lastElementChild.getAttribute("msval"));

    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_timeout = add_timeout;

function add_rotation(act,sc) {
    var axiom = {};
    axiom["type"] = "ROTATE";
    axiom["time"] = null;
    var tol = 40;
    var amp = Math.abs(parseInt(act["div_seq"].lastElementChild.lastElementChild.getAttribute("degval")));
    if (amp < 1) {
        return gvar.add_wrong("Rotation: the rotation movement is too small");
    }
    var id = Math.log2(1 + (amp / tol));
    axiom["ID"] = id;

    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_rotation = add_rotation;

function add_scaling(act,sc) {
    var axiom = {};
    axiom["type"] = "SCALE";
    axiom["time"] = null;

    var tol = Math.min(sc["width"],sc["height"]) / 8;
    if (tol < 1) {
        return gvar.add_wrong("Scaling: the screen is too small to perform this action");
    }
    var amp = 2*Math.abs(parseInt(act["div_seq"].lastElementChild.lastElementChild.getAttribute("ratioval")));
    if (amp < 1) {
        return gvar.add_wrong("Scaling: the finger movement is too small");
    }
    var id = Math.log2(1 + (amp / tol));
    axiom["ID"] = id;

    var scr_diag = Math.sqrt(Math.pow(sc["width"],2)+Math.pow(sc["height"],2)); // in mm
    if (amp > scr_diag) {
        return gvar.add_wrong("Scaling: the screen is too small to perform this action");
    }
    axiom["orientation"] = (sc["width"]<=sc["height"]?"Portrait":"Landscape");
    axiom["diagonal"] = Math.round(scr_diag/25.4 * 2) / 2;
    return axiom;
} gvar.add_scaling = add_scaling;

function compute_sequence(scr,sc) { // both sizes in mm
    var sequence = [];
    var last_ind = null;
    var last_token_ind = null;
    var last_button_ind = null;

    for (var k = 0; k < scr["action_list"].length; k++) {
        var act = scr["action_list"][k];

        var last_type = null;
        if (last_ind != null) {
            last_type = scr["action_list"][last_ind]["type"];
        }

        if (act["type"].indexOf("button") != -1) {
            if (last_type == null) {                                       //         -> button   =   [ ]
                // add TAP to sequence, no connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": ""});
            } else if (last_type.indexOf("button") != -1) {                // button  -> button   =   air
                // add POINTING to sequence, air connector
                sequence.push({"seq":[gvar.add_pointing(act,scr["action_list"][last_ind],sc,false)], "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop    -> button   =   air
                // add POINTING to sequence, air connector
                sequence.push({"seq":[gvar.add_pointing(act,scr["action_list"][last_ind],sc,false)], "connector": "air"});
            } else if (last_type.indexOf("token") != -1) {                 // token   -> button   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A button card cannot follow a draggable object")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation-> button   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling -> button   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe   -> button   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            } else if (last_type.indexOf("timeout") != -1) {               // timeout -> button   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            }
            last_ind = k;
            last_button_ind = k;
        } else if (act["type"].indexOf("drop") != -1) {
            if (last_type == null) {                                       //        -> drop     =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A drop card cannot start a sequence")], "connector": "problem"});
            } else if (last_type.indexOf("button") != -1) {                // button -> drop     =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A drop card cannot follow a button")], "connector": "problem"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> drop     =   glass
                // add DRAG to sequence, glass connector
                if (last_token_ind == null) {
                    sequence.push({"seq":[gvar.add_wrong("No draggable object found previously")], "connector": "glass"});
                } else {
                    sequence.push({"seq":[gvar.add_drag(act,scr["action_list"][last_token_ind],scr["action_list"][last_ind],sc)], "connector": "glass"});
                }
            } else if (last_type.indexOf("token") != -1) {                 // token  -> drop     =   glass
                // add DRAG to sequence, glass connector
                sequence.push({"seq":[gvar.add_drag(act,scr["action_list"][last_token_ind],scr["action_list"][last_ind],sc)], "connector": "glass"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> drop     =   /!\
                // sequence wrong - add a "error class
                sequence.push({"seq":[gvar.add_wrong("A drop card cannot follow a rotation")], "connector": "problem"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> drop     =   /!\
                // sequence wrong - add a "error class
                sequence.push({"seq":[gvar.add_wrong("A drop card cannot follow a scaling")], "connector": "problem"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> drop     =   /!\
                // sequence wrong - add a "error class
                sequence.push({"seq":[gvar.add_wrong("A drop card cannot follow a flick/swipe")], "connector": "problem"});
            } else if (last_type.indexOf("timeout") != -1) {               // timeout -> drop   =   /!\
                // sequence wrong - add a "error class"
                //sequence.push({"seq":[gvar.add_wrong("A drop card cannot follow a timeout")], "connector": "problem"});
                if (last_token_ind == null) {
                    sequence.push({"seq":[gvar.add_wrong("No draggable object found previously")], "connector": "glass"});
                } else {
                    sequence.push({"seq":[gvar.add_drag(act,scr["action_list"][last_token_ind],scr["action_list"][last_ind],sc)], "connector": "glass"});
                }
            }
            last_ind = k;
        } else if (act["type"].indexOf("token") != -1) {
            if (k == scr["action_list"].length-1) {
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A draggable object card cannot end a sequence")], "connector": "problem"});
            } else if (last_type == null) {                                //        -> token   =   [ ]
                // add TAP to sequence, no connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": ""});
            } else if (last_type.indexOf("button") != -1) {                // button -> token   =   air
                // add POINTING to sequence, air connector
                sequence.push({"seq":[gvar.add_pointing(act,scr["action_list"][last_ind],sc,false)], "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> token   =   air
                // add POINTING to sequence, air connector
                sequence.push({"seq":[gvar.add_pointing(act,scr["action_list"][last_ind],sc,false)], "connector": "air"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> token   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A draggable object card cannot follow a flick/swipe")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation -> token   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> token   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> token   =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            } else if (last_type.indexOf("timeout") != -1) {               // timeout -> token  =   air
                // add TAP to sequence, air connector
                sequence.push({"seq":[gvar.add_tap(act,sc,false)], "connector": "air"});
            }
            last_ind = k;
            last_token_ind = k;
        } else if (act["type"].indexOf("rotation") != -1) {
            if (last_type == null) {                                       //        -> rotation   =   [ ]
                var sub_seq = [];
                // add TAP to sequence, no connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add ROTATE to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": ""});
            } else if (last_type.indexOf("button") != -1) {                // button -> rotation   =   air
                var sub_seq = [];
                // add POINTING to sequence, air connector
                // sub_seq.push(gvar.add_tap(act,sc,true));
                sub_seq.push(gvar.add_pointing(act,scr["action_list"][last_ind],sc,true));
                // add rotation to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> rotation   =   air
                var sub_seq = [];
                // add POINTING to sequence, air connector
                sub_seq.push(gvar.add_pointing(act,scr["action_list"][last_ind],sc,true));
                // add rotation to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> rotation   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A rotation card cannot follow a draggable object")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> rotation   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add rotation to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> rotation   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add rotation to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> rotation   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add rotation to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("timeout") != -1) {              // timeout  -> rotation   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add rotation to sequence, air connector
                sub_seq.push(gvar.add_rotation(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            }
            last_ind = k;
        } else if (act["type"].indexOf("scaling") != -1) {
            if (last_type == null) {                                       //        -> scaling   =   [ ]
                var sub_seq = [];
                // add TAP to sequence, no connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": ""});
            } else if (last_type.indexOf("button") != -1) {                // button -> scaling   =   air
                var sub_seq = [];
                // add POINTING to sequence, air connector
                // sub_seq.push(gvar.add_tap(act,sc,true));
                sub_seq.push(gvar.add_pointing(act,scr["action_list"][last_ind],sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> scaling   =   air
                var sub_seq = [];
                // add POINTING to sequence, air connector
                sub_seq.push(gvar.add_pointing(act,scr["action_list"][last_ind],sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> scaling   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A scaling card cannot follow a draggable object")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> scaling   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> scaling   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> scaling   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("timeout") != -1) {              // timeout  -> scaling   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add scaling to sequence, air connector
                sub_seq.push(gvar.add_scaling(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            }
            last_ind = k;
        } else if (act["type"].indexOf("swipe") != -1) {
            if (last_type == null) {                                       //        -> swipe   =   [ ]
                var sub_seq = [];
                // add TAP to sequence, no connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": ""});
            } else if (last_type.indexOf("button") != -1) {                // button -> swipe   =   air
                var sub_seq = [];
                // add POINTING to sequence, air connector
                // sub_seq.push(gvar.add_tap(act,sc,true));
                sub_seq.push(gvar.add_pointing(act,scr["action_list"][last_ind],sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> swipe   =   air
                var sub_seq = [];
                // add POINTING to sequence, air connector
                sub_seq.push(gvar.add_pointing(act,scr["action_list"][last_ind],sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> swipe   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A flick/swipe card cannot follow a draggable object")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> swipe   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> swipe   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> swipe   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("timeout") != -1) {              // timeout  -> swipe   =   air
                var sub_seq = [];
                // add TAP to sequence, air connector
                sub_seq.push(gvar.add_tap(act,sc,true));
                // add SWIPE to sequence, air connector
                sub_seq.push(gvar.add_swipe(act,sc));
                sequence.push({"seq":sub_seq, "connector": "air"});
            }
            last_ind = k;
        } else if (act["type"].indexOf("dwell") != -1) {
            if (last_type == null) {                                       //        -> dwell   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A long-press card cannot start a sequence")], "connector": "problem"});
            } else if (last_type.indexOf("button") != -1) {                // button -> dwell   =   glass
                // add DWELL to sequence, glass connector
                sequence.push({"seq":[gvar.add_dwell(act,sc)], "connector": "glass"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> dwell   =   glass
                // add DWELL to sequence, glass connector
                sequence.push({"seq":[gvar.add_dwell(act,sc)], "connector": "glass"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> dwell   =   glass
                // add DWELL to sequence, glass connector
                sequence.push({"seq":[gvar.add_dwell(act,sc)], "connector": "glass"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> dwell   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A long-press card cannot follow a rotation")], "connector": "problem"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> dwell   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A long-press card cannot follow a scaling")], "connector": "problem"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> dwell   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A long-press card cannot follow a flick/swipe")], "connector": "problem"});
            } else if (last_type.indexOf("timeout") != -1) {              // timeout  -> dwell   =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A long-press card cannot follow a timeout")], "connector": "problem"});
            }
        } else if (act["type"].indexOf("timeout") != -1) {
            if (last_type == null) {                                       //        -> timeout =   []
                // add TIMEOUT to sequence, no connector
                sequence.push({"seq":[gvar.add_timeout(act,sc,false)], "connector": ""});
            } else if (last_type.indexOf("button") != -1) {                // button -> timeout =   air
                // add TIMEOUT to sequence, air connector
                sequence.push({"seq":[gvar.add_timeout(act,sc)], "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> timeout =   air
                // add TIMEOUT to sequence, air connector
                sequence.push({"seq":[gvar.add_timeout(act,sc)], "connector": "air"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> timeout =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A timeout card cannot follow a draggable object")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> timeout =   /!\
                // add TIMEOUT to sequence, air connector
                sequence.push({"seq":[gvar.add_timeout(act,sc)], "connector": "air"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> timeout =   /!\
                // add TIMEOUT to sequence, air connector
                sequence.push({"seq":[gvar.add_timeout(act,sc)], "connector": "air"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> timeout =   /!\
                // add TIMEOUT to sequence, air connector
                sequence.push({"seq":[gvar.add_timeout(act,sc)], "connector": "air"});
            } else if (last_type.indexOf("timeout") != -1) {               // timout -> timeout =   air
                // add TIMEOUT to sequence, air connector
                sequence.push({"seq":[gvar.add_timeout(act,sc)], "connector": "air"});
            }
            last_ind = k;
        } else if (act["type"].indexOf("multiplier") != -1) {
            if (last_type == null) {                                       //        -> multiplier =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A consecutive press card cannot start a sequence")], "connector": "problem"});
            } else if (last_type.indexOf("button") != -1) {                // button -> multiplier =   air
                // add POINTING to sequence, air connector
                var sub_seq = [];
                for (k_mult = 0; k_mult < parseInt(act["div_seq"].lastElementChild.lastElementChild.getAttribute("multval")); k_mult++) {
                    sub_seq.push(gvar.add_pointing(scr["action_list"][last_button_ind],scr["action_list"][last_button_ind],sc,false));
                }
                sequence.push({"seq":sub_seq, "connector": "air"});
            } else if (last_type.indexOf("drop") != -1) {                  // drop   -> multiplier =   air
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A consecutive press card cannot follow a drop card")], "connector": "problem"});
            } else if (last_type.indexOf("token") != -1) {                 // token  -> multiplier =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A consecutive press card cannot follow a draggable object")], "connector": "problem"});
            } else if (last_type.indexOf("rotation") != -1) {              // rotation  -> multiplier =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A consecutive press card cannot follow a rotation")], "connector": "problem"});
            } else if (last_type.indexOf("scaling") != -1) {               // scaling  -> multiplier =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A consecutive press card cannot follow a scaling")], "connector": "problem"});
            } else if (last_type.indexOf("swipe") != -1) {                 // swipe  -> multiplier =   /!\
                // sequence wrong - add a "error class"
                sequence.push({"seq":[gvar.add_wrong("A consecutive press card cannot follow a flick/swipe")], "connector": "problem"});
            } else if (last_type.indexOf("timeout") != -1) {               // timout -> multiplier =   air
                if (last_button_ind == null) {
                    // sequence wrong - add a "error class"
                    sequence.push({"seq":[gvar.add_wrong("No button found previously")], "connector": "glass"});
                } else {
                    var sub_seq = [];
                    // add TAP to sequence, no connector
                    sub_seq.push(gvar.add_tap(scr["action_list"][last_button_ind],sc,false));
                    // add POINTING to sequence, air connector
                    for (k_mult = 0; k_mult < parseInt(act["div_seq"].lastElementChild.lastElementChild.getAttribute("multval"))-1; k_mult++) {
                        sub_seq.push(gvar.add_pointing(scr["action_list"][last_button_ind],scr["action_list"][last_button_ind],sc,false));
                    }
                    sequence.push({"seq":sub_seq, "connector": "air"});
                }
            }
        }
    }
    scr["seq"] = sequence;
}
gvar.compute_sequence = compute_sequence;

function update_action_properties(act, screen_w, screen_h) { // both sizes in mm
    var prop;
    if (typeof act["properties"] === 'undefined') {
        act["properties"] = {};

        act["properties"]["left"] = screen_w * ($("#interface").width()*0.5 - 20 - 2) / $("#interface").width(); // in mm
        act["properties"]["top"] = screen_h * ($("#interface").height()*0.5 - 20 - 2) / $("#interface").height(); // in mm
        act["properties"]["width"] = screen_w * 40 / $("#interface").width(); // in mm
        act["properties"]["height"] = screen_h * 40 / $("#interface").height(); // in mm   / $("#interface").width()

        if (act["type"].indexOf("swipe") != -1) {
            act["properties"]["direction"] = "right";
            act["properties"]["width"] = 50; // in px
            act["properties"]["height"] = 2; // in px
        }
        if (act["type"].indexOf("dwell") != -1) {
            act["properties"]["time"] = 300; // ms
            act["properties"]["width"] = 18; // in px
            act["properties"]["height"] = 18; // in px
        }
        if (act["type"].indexOf("timeout") != -1) {
            act["properties"]["time"] = 1000; // ms
            act["properties"]["width"] = 18; // in px
            act["properties"]["height"] = 18; // in px
        }
        if (act["type"].indexOf("multiplier") != -1) {
            act["properties"]["multiplier"] = 1; // unit
            act["properties"]["width"] = 18; // in px
            act["properties"]["height"] = 18; // in px
        }
        if (act["type"].indexOf("rotation") != -1) {
            act["properties"]["angle"] = 90; // deg
            act["properties"]["width"] = 18; // in px
            act["properties"]["height"] = 18; // in px
        }
        if (act["type"].indexOf("scaling") != -1) {
            act["properties"]["ratio"] = 20; // in mm
            act["properties"]["width"] = 18; // in px
            act["properties"]["height"] = 18; // in px
        }
    } else {
        if (act["type"].indexOf("swipe") != -1) {
            if (act["div_canvas"].className.indexOf("right") != -1) {
                act["properties"]["direction"] = "right";
            } else if (act["div_canvas"].className.indexOf("left") != -1) {
                act["properties"]["direction"] = "left";
            } else if (act["div_canvas"].className.indexOf("up") != -1) {
                act["properties"]["direction"] = "up";
            } else {
                act["properties"]["direction"] = "down";
            }
        }

        prop = act["div_canvas"].style.left;
        prop = parseFloat(prop.substring(0, prop.length-2));
        act["properties"]["left"] = screen_w * prop / $("#interface").width(); // in mm
        prop = act["div_canvas"].style.top;
        prop = parseFloat(prop.substring(0, prop.length-2));
        act["properties"]["top"] = screen_h * prop / $("#interface").height(); // in mm

        if (act["type"].indexOf("swipe") != -1 ||
            act["type"].indexOf("dwell") != -1 ||
            act["type"].indexOf("timeout") != -1 ||
            act["type"].indexOf("multiplier") != -1 || 
            act["type"].indexOf("rotation") != -1 || 
            act["type"].indexOf("scaling") != -1) {
            prop = act["div_canvas"].style.width;
            act["properties"]["width"] = parseFloat(prop.substring(0, prop.length-2)); // in px
            prop = act["div_canvas"].style.height
            act["properties"]["height"] = parseFloat(prop.substring(0, prop.length-2)); // in px
        } else {
            prop = act["div_canvas"].style.width;
            prop = parseFloat(prop.substring(0, prop.length-2));
            act["properties"]["width"] = screen_w * prop / $("#interface").width(); // in mm
            prop = act["div_canvas"].style.height;
            prop = parseFloat(prop.substring(0, prop.length-2));
            act["properties"]["height"] = screen_h * prop / $("#interface").height(); // in mm
        }
    }
}
gvar.update_action_properties = update_action_properties;