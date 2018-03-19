/* tutorial.js
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

function set_pannels(left, top, right, bottom) {
    $("#pannel_left").animate({"left": "0%", "top": "0%", "right": ($("#main").width()-left)+"px", "bottom": bottom+"px"},
                              {duration: 1000, specialEasing: {width: "linear", height: "easeOutBounce"}}
                              );
    $("#pannel_top").animate({"left": left+"px", "top": "0%", "right": "0%", "bottom": ($("#main").height()-top)+"px"},
                              {duration: 1000, specialEasing: {width: "linear", height: "easeOutBounce"}}
                              );
    $("#pannel_right").animate({"left": ($("#main").width()-right)+"px", "top": top+"px", "right": "0%", "bottom": "0%"},
                              {duration: 1000, specialEasing: {width: "linear", height: "easeOutBounce"}}
                              );
    $("#pannel_bottom").animate({"left": "0%", "top": ($("#main").height()-bottom)+"px", "right": right+"px", "bottom": "0%"},
                              {duration: 1000, specialEasing: {width: "linear", height: "easeOutBounce"}}
                              );
}
gvar.set_pannels = set_pannels;

function set_pannels_over_div(div, margin) {
    gvar.set_pannels(($(div).offset().left - margin),
                     ($(div).offset().top - margin),
                     ($("#main").width() - $(div).offset().left - $(div).width() - margin),
                     ($("#main").height() - $(div).offset().top - $(div).height() - margin));
}
gvar.set_pannels_over_div = set_pannels_over_div;

gvar.current_tuto_step = "Step_1";
function tuto_next_step() {
    if (gvar.current_tuto_step == "Step_1") {
        $("#tutorial").hide();
        $("#tutorial_pannel").show();

        gvar.set_pannels(0, 0, $("#main").width(), $("#main").height());
        $("#tuto_explanations").css({"left": "25%", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 1: the basics</h1>";
        document.getElementById("tuto_text").innerHTML += "Let's start with the basics. ";
        document.getElementById("tuto_text").innerHTML += "StEM allows designers to build touch-interaction sequences on top of visual representations "
        document.getElementById("tuto_text").innerHTML += "of an interface - whether these are rough sketches, wireframes, screenshots of actual "
        document.getElementById("tuto_text").innerHTML += "prototypes, or even blank screens. StEM allows designers to drag and drop touch actions onto "
        document.getElementById("tuto_text").innerHTML += "the interface pictures. Because many tasks require interaction with several screens, "
        document.getElementById("tuto_text").innerHTML += "the designer can link individual screens together into a scenario. A scenario is therefore "
        document.getElementById("tuto_text").innerHTML += "the unit at which a designer models a high-level task on a particular device."

        gvar.current_tuto_step = "Step_2";
    } else if (gvar.current_tuto_step == "Step_2") {
        gvar.set_pannels_over_div("#scenarios", 5);
        $("#tuto_explanations").css({"left": "20%", "top": "calc(80% - 10px)"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 2: creating a scenario</h1>";
        document.getElementById("tuto_text").innerHTML += "To create a scenario click the 'Add' button.";
        $("#next_step_tuto").hide();

        gvar.current_tuto_step = "Step_2_bis";
    } else if (gvar.current_tuto_step == "Step_2_bis") {
        gvar.set_pannels($("#scenarios").offset().left,
                         $("#scenarios").offset().top,
                         $("#main").width() - $("#scenarios").offset().left - 130,
                         $("#main").height() - $("#scenarios").offset().top - 180);
        $("#tuto_explanations").css({"left": "40%", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 2: creating a scenario</h1>";
        document.getElementById("tuto_text").innerHTML += "Awesome! Now to modify the scenario, open it using a double click.";

        gvar.current_tuto_step = "Step_3";
    } else if (gvar.current_tuto_step == "Step_3") {
        gvar.set_pannels(30, 30, $("#main").width()*0.80, $("#main").height()*0.20 + 90);
        $("#tuto_explanations").css({"left": "25%", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 3: modifying a scenario</h1>";
        document.getElementById("tuto_text").innerHTML += "Nice! Once you've created your scenario, you can specify a ";
        document.getElementById("tuto_text").innerHTML += "name as well as the screen dimension of the device. It is important to enter ";
        document.getElementById("tuto_text").innerHTML += "the right dimensions as they will be used later on to calibrate the touch axioms.";
        $("#next_step_tuto").show();

        gvar.current_tuto_step = "Step_4";
    } else if (gvar.current_tuto_step == "Step_4") {
        gvar.set_pannels_over_div("#screens", 5);
        $("#tuto_explanations").css({"left": "20%", "top": "calc(80% - 10px)"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 4: creating a screen</h1>";
        document.getElementById("tuto_text").innerHTML += "Alright, a scenario is composed of several screens. Think of the screens "
        document.getElementById("tuto_text").innerHTML += "as the elements of your storyboard. To create a screen click the 'Add' button.";
        $("#next_step_tuto").hide();

        gvar.current_tuto_step = "Step_4_bis";
    } else if (gvar.current_tuto_step == "Step_4_bis") {
        gvar.set_pannels($("#screens").offset().left,
                         $("#screens").offset().top,
                         $("#main").width() - $("#screens").offset().left - 130,
                         $("#main").height() - $("#screens").offset().top - 180);
        $("#tuto_explanations").css({"left": "calc("+$("#screens").offset().left+"px + 150px)", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 4: creating a screen</h1>";
        document.getElementById("tuto_text").innerHTML += "Perfect! Now as previously, double click on the screen to modify it.";

        gvar.current_tuto_step = "Step_5";
    } else if (gvar.current_tuto_step == "Step_5") {
        gvar.set_pannels(30, 30, $("#main").width()*0.80, $("#main").height()*0.20 + 90);
        $("#tuto_explanations").css({"left": "calc(20% + 10px)", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 5: modifying a screen</h1>";
        document.getElementById("tuto_text").innerHTML += "Ok almost there... As previously, you can specify a ";
        document.getElementById("tuto_text").innerHTML += "name as well as the screen background. If you decide to upload a new ";
        document.getElementById("tuto_text").innerHTML += "background simply select a image file from your file system.";
        $("#next_step_tuto").show();

        gvar.current_tuto_step = "Step_6";
    } else if (gvar.current_tuto_step == "Step_6") {
        gvar.set_pannels($("#timeline").offset().left, 0, 0, $("#main").height()*0.60);
        $("#tuto_explanations").css({"left": "5%", "top": "20%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 6: modeling an interaction</h1>";
        document.getElementById("tuto_text").innerHTML += "Now the fun part! To model an interaction sequence drag and drop interaction ";
        document.getElementById("tuto_text").innerHTML += "axioms onto the timeline. Try adding a button by expanding the 'Buttons' menu. ";
        document.getElementById("tuto_text").innerHTML += "You can also try to add a draggable object on the timeline and see what will happen. ";
        document.getElementById("tuto_text").innerHTML += "I'm waiting till you get 3 axioms in your timeline.";

        $("#next_step_tuto").hide();

        gvar.current_tuto_step = "Step_6_bis";
    } else if (gvar.current_tuto_step == "Step_6_bis") {
        if (gvar.ws_hist[gvar.cur_ws_hist]["scenario_list"][gvar.cur_ind_sc]["screen_list"][gvar.cur_ind_scr]['seq'].length >= 2) {
            gvar.set_pannels(30, 30, $("#main").width()*0.80, $("#main").height()*0.20 + 90);
            $("#tuto_explanations").css({"left": "calc(20% + 10px)", "top": "5%"});
            document.getElementById("tuto_text").innerHTML  = "<h1>Step 6: modeling an interaction</h1>";
            document.getElementById("tuto_text").innerHTML += "Perfect. As you can see the sequence of axiom has been automatically updated. ";
            document.getElementById("tuto_text").innerHTML += "If any error in the sequence is detected (for example a draggable object which is not ";
            document.getElementById("tuto_text").innerHTML += "released), faulty axioms will turn red and explanations will be provided.";
            $("#next_step_tuto").show();

            gvar.current_tuto_step = "Step_7";
        }
    } else if (gvar.current_tuto_step == "Step_7") {
        gvar.set_pannels_over_div("#interface", 0);
        $("#tuto_explanations").css({"left": "5%", "top": "calc(80% - 10px)"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 7: modeling an interaction</h1>";
        document.getElementById("tuto_text").innerHTML += "When you add an axiom to the timeline, you may specify its position and size by ";
        document.getElementById("tuto_text").innerHTML += "drag and dropping its representation on the screen. To change the size simply start ";
        document.getElementById("tuto_text").innerHTML += "on the edges of the graphical representation.";

        gvar.current_tuto_step = "Step_7_bis";
    } else if (gvar.current_tuto_step == "Step_7_bis") {
        gvar.set_pannels_over_div("#timeline", 0);
        $("#tuto_explanations").css({"left": "5%", "top": "calc(80% - 10px)"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 7: modeling an interaction</h1>";
        document.getElementById("tuto_text").innerHTML += "You can re-order the axioms by dragging them onto the timeline. You can suppress them ";
        document.getElementById("tuto_text").innerHTML += "by dragging them out of the timeline.";

        gvar.current_tuto_step = "Step_8";
    } else if (gvar.current_tuto_step == "Step_8") {
        gvar.set_pannels(0, 0, $("#main").width() - 30, $("#main").height() - 90);
        $("#tuto_explanations").css({"left": "5%", "top": "calc(80% - 10px)"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 8: navigation</h1>";
        document.getElementById("tuto_text").innerHTML += "To go back to the workspace or scenario panel simply click the corresponding tab. ";
        document.getElementById("tuto_text").innerHTML += "Click on the workspace tab.";
        $("#next_step_tuto").hide();

        gvar.current_tuto_step = "Step_9";
    } else if (gvar.current_tuto_step == "Step_9") {
        // TO REMOVE
        // TO REMOVE
        $("#next_step_tuto").hide();// TO REMOVE // TO REMOVE
        // TO REMOVE
        // TO REMOVE

        gvar.set_pannels(0, 0, $("#main").width()*0.80, $("#main").height() - 230);
        $("#tuto_explanations").css({"left": "calc(20% + 10px)", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 9: loading a dummy example</h1>";
        document.getElementById("tuto_text").innerHTML += "Ok. For the last steps we're going to learn how to predict interaction time. ";
        document.getElementById("tuto_text").innerHTML += "Load the example 'Checking Updates on Android' by selecting it in the drop down menu. ";

        gvar.current_tuto_step = "Step_10";
    } else if (gvar.current_tuto_step == "Step_10") {
        gvar.set_pannels($("#main").width()-30, 45, 0, $("#main").height() - 90);
        $("#tuto_explanations").css({"left": "calc(40% + 10px)", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 10: prediction times</h1>";
        document.getElementById("tuto_text").innerHTML += "Awesome. Now that we have an example, let's open the filter menu by clicking the ";
        document.getElementById("tuto_text").innerHTML += "'gear' icon located just under the 'help' icon.";

        gvar.current_tuto_step = "Step_10_bis";
    } else if (gvar.current_tuto_step == "Step_10_bis") {
        gvar.set_pannels($("#main").width() - $("#computation").width() - 30, 0, 0, 0);
        $("#tuto_explanations").css({"left": "5%", "top": "200px"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 10: prediction times</h1>";
        document.getElementById("tuto_text").innerHTML += "These options are quite simple. They allow to filter the Touch Action Data base  ";
        document.getElementById("tuto_text").innerHTML += "in order to specialize the time prediction models to a specific device or population. ";
        document.getElementById("tuto_text").innerHTML += "Once you've selected your filters, simply click the 'Compute completion times' button. ";
        document.getElementById("tuto_text").innerHTML += "The results will be displayed in the graph panel. ";

        gvar.current_tuto_step = "Step_11";
    } else if (gvar.current_tuto_step == "Step_11") {
        gvar.set_pannels(0, $("#main").height()*0.80 - 30, 0, 0);
        $("#tuto_explanations").css({"left": "calc(30% + 25px)", "top": "5%"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 11: reading the graphs</h1>";
        document.getElementById("tuto_text").innerHTML += "We can now harvest the fruit of our labour! First thing to notice, we only one scenario ";
        document.getElementById("tuto_text").innerHTML += "in the current workspace so only one colour. The middle bar corresponds to the prediction time in ms ";
        document.getElementById("tuto_text").innerHTML += "computed with all the data (after we applied the filters your specified). The top bar is ";
        document.getElementById("tuto_text").innerHTML += "is the prediction time using only the fastest users. The bottom one using only the slowest users. ";
        document.getElementById("tuto_text").innerHTML += "If you move the cursor on the bars you'll get the precise prediction. If you click on the panel ";
        document.getElementById("tuto_text").innerHTML += "we will have more details.";

        gvar.current_tuto_step = "Step_11_bis";
    } else if (gvar.current_tuto_step == "Step_11_bis") {
        gvar.set_pannels(0, $("#main").height()*0.20    , 0, 0);
        $("#tuto_explanations").css({"left": "calc(30% + 25px)", "top": "0px"});
        document.getElementById("tuto_text").innerHTML  = "<h1>Step 11: reading the graphs</h1>";
        document.getElementById("tuto_text").innerHTML += "The bottom left graph corresponds to the prediction time for all individual users. ";
        document.getElementById("tuto_text").innerHTML += "The bottom right graph is the distribution of those individual users. ";
        document.getElementById("tuto_text").innerHTML += "One last thing, if you compute de prediction times in the 'scenario' or 'screen' panel, you will ";
        document.getElementById("tuto_text").innerHTML += "time predictions will be broken down to the screen or axiom level.";

        gvar.current_tuto_step = "End";
    } else {
        gvar.tutorial_on = false;
        $("#tutorial").show();
        $("#tutorial_pannel").hide();
        gvar.current_tuto_step = "Step_1";
        location.reload();
    }
}
gvar.tuto_next_step = tuto_next_step;

gvar.tutorial_on = false;
gvar.explanation_on = true;

function set_tutorial() {
    $("#tutorial_pannel").hide();

    document.getElementById("start_stem").addEventListener("click", function(evt) {
        if (gvar.explanation_on) {
            $("#tutorial").hide();
            gvar.explanation_on = false;
        }
    });

    document.getElementById("start_tuto").addEventListener("click", function(evt) {
        if (gvar.tutorial_on == false) {
            gvar.tutorial_on = true;
            gvar.tuto_next_step();
        }
    });

    document.getElementById("next_step_tuto").addEventListener("click", function(evt) {
        if (gvar.tutorial_on) {
            gvar.tuto_next_step();
        }
    });

    gvar.set_pannels(0, 0, $("#main").width(), $("#main").height());
}
gvar.set_tutorial = set_tutorial;