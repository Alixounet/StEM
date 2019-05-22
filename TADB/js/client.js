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
    $("#demographics").hide();
    $("#agreement").hide();
    $("#noagreement").hide();
    $("#training").hide();
    $("#newtask").hide();
    $("#instructions").hide();
    $("#smallinstruction").hide();
    $("#previnfos").hide();
    $("#nextinfos").hide();
    $("#task").hide();
    $(".share").hide();
    $("#finish").hide();
    $("#grips").hide();

    // document.getElementById("device_value").addEventListener("onblur", function(evt) {
    //     // document.getElementById("device_input").blur();
    //     var vpm = document.getElementById("viewport");
    //     vpm.setAttribute('content','minimal-ui');
    //     console.log("yo?");
    // });

    document.getElementById("main").addEventListener("touchstart", function(evt) {
        if (evt.target == document.getElementById("device_value")/* ||
            evt.target == document.getElementById("age_value")*/) {
            console.log(evt);
        } else {
            evt.preventDefault();
            evt.stopPropagation();
        }
        document.activeElement.blur();
    });
    document.getElementById("main").addEventListener("touchmove", function(evt) {
        if (evt.target == document.getElementById("device_value")/* ||
            evt.target == document.getElementById("age_value")*/) {
            //console.log(evt);
        } else {
            evt.preventDefault();
            evt.stopPropagation();
        }
        document.activeElement.blur();
    });
    document.getElementById("main").addEventListener("touchend", function(evt) {
        if (evt.target == document.getElementById("device_value")/* ||
            evt.target == document.getElementById("age_value")*/) {
            //console.log(evt);
        } else {
            evt.preventDefault();
            evt.stopPropagation();
        }
        document.activeElement.blur();
    });

    loadjscssfile("js/utils.js", "js");
    // loadjscssfile(window.location.origin + "/socket.io/socket.io.js", "js");
    loadjscssfile(window.location + "socket.io/socket.io.js", "js");
    whenAvailable(["io"], function() {
        console.log("io loaded");

        var origin = window.location.origin;
        // var socket = io.connect(origin);
        var socket = io("",{path: "/TADB/socket.io"});
        gvar.socket = socket;

        socket.on('connected', function (data) {
            console.log("Server responded and gave the id '"+data+"'.");

            gvar.client_id = data;

            var client_id = gvar.getCookie('client_id');
            if (client_id == null) {
                gvar.setCookie({'client_id':gvar.client_id},200);
            }

        });

        loadjscssfile("//wurfl.io/wurfl.js", "js");
        loadjscssfile("js/eligibility.js", "js");
        loadjscssfile("js/demographics.js", "js");
        loadjscssfile("js/tap.js", "js");
        loadjscssfile("js/pointing.js", "js");
        loadjscssfile("js/drag.js", "js");
        loadjscssfile("js/rotation.js", "js");
        loadjscssfile("js/scaling.js", "js");
        loadjscssfile("js/swipe.js", "js");
        console.log("js files loaded");

        whenAvailable(["WURFL", "isEligible", "setDemographics"], function() {
            var is_eligible = isEligible();
            document.getElementById("infos").innerHTML = gvar.textEligibility(is_eligible,WURFL.complete_device_name,gvar.disclaimerpart);

            if (!is_eligible) {
                function preContinueAnyway() {
                    document.getElementById("agreement").className = "button_agr but_active";
                }
                function continueAnyway() {
                    document.getElementById("agreement").className = "button_agr but_inactive";
                    document.getElementById("agreement").removeEventListener("touchstart", preContinueAnyway);
                    document.getElementById("agreement").removeEventListener("touchend", continueAnyway);
                    mainDish();
                }
                document.getElementById("agreement").innerHTML = gvar.textContinueAnyway();
                $("#agreement").show();
                document.getElementById("agreement").addEventListener("touchstart", preContinueAnyway, false);
                document.getElementById("agreement").addEventListener("touchend", continueAnyway, false);
            }

            function mainDish() {
                document.getElementById("infos").innerHTML = gvar.textEligibility(true,WURFL.complete_device_name,gvar.disclaimerpart);
                $("#previnfos").show();
                $("#nextinfos").show();

                function shareFB() {
                    var win = window.open(gvar.fb_url, '_blank');
                    win.focus();
                }
                function shareTW() {
                    var win = window.open(gvar.tw_url, '_blank');
                    win.focus();
                }
                document.getElementById("facebook").addEventListener("touchstart", shareFB, false);
                document.getElementById("twitter").addEventListener("touchstart", shareTW, false);

                function prevDisclaimer() {
                    document.getElementById("previnfos").className = "unchecked";
                    document.getElementById("nextinfos").className = "unchecked";
                    gvar.disclaimerpart = gvar.disclaimerpart - 1;
                    if (gvar.disclaimerpart <= 1) {
                        gvar.disclaimerpart = 1;
                        document.getElementById("previnfos").className = "checked";
                    }
                    document.getElementById("infos").innerHTML = gvar.textEligibility(true,WURFL.complete_device_name,gvar.disclaimerpart);
                }
                function nextDisclaimer() {
                    document.getElementById("previnfos").className = "unchecked";
                    document.getElementById("nextinfos").className = "unchecked";
                    gvar.disclaimerpart = gvar.disclaimerpart + 1;
                    if (gvar.disclaimerpart >= gvar.disclaimermaxpart) {
                        gvar.disclaimerpart = gvar.disclaimermaxpart;
                        document.getElementById("nextinfos").className = "checked";
                    }
                    document.getElementById("infos").innerHTML = gvar.textEligibility(true,WURFL.complete_device_name,gvar.disclaimerpart);
                }
                document.getElementById("previnfos").addEventListener("touchstart", prevDisclaimer, false);
                document.getElementById("nextinfos").addEventListener("touchstart", nextDisclaimer, false);

                setDemographics();

                document.getElementById("agreement").innerHTML = gvar.textAgree();
                document.getElementById("noagreement").innerHTML = gvar.textNoAgree();
                $("#agreement").show();
                $("#noagreement").show();

                function preFinish() {
                    document.getElementById("finish").className = "button_finish but_active";
                }
                function finish() {
                    document.getElementById("finish").className = "button_finish but_inactive";
                    $("#training").hide();
                    $("#newtask").hide();
                    $("#grips").hide();
                    $("#finish").hide();
                    $("#motivations").hide();
                    $("#infos").show();
                    document.getElementById("infos").innerHTML = gvar.textFinish();
                }
                document.getElementById("finish").addEventListener("touchstart", preFinish, false);
                document.getElementById("finish").addEventListener("touchend", finish, false);

                function preLeave() {
                    document.getElementById("noagreement").className = "button_noagr but_active";
                }
                function leave() {
                    document.getElementById("noagreement").className = "button_noagr but_active";
                    $("#agreement").hide();
                    $("#noagreement").hide();
                    $("#demographics").hide();
                    $("#previnfos").hide();
                    $("#nextinfos").hide();
                    $("#infos").show();
                    $(".share").show();
                    gvar.setShareMessages(null);
                    document.getElementById("infos").innerHTML = gvar.textLeave();
                }

                function preRegisterUser() {
                    document.getElementById("agreement").className = "button_agr but_active";
                }
                function registerUser() {
                    document.getElementById("agreement").className = "button_agr but_inactive";
                    if (demographicsValid()) {
                        $("#demographics").hide();

                        // register participant
                        var participant = {
                            'id': gvar.client_id,
                            'prev_id': gvar.getCookie('client_id'),
                            ////////////////////////////////////////////////////////
                            'age': gvar.age,
                            'handiness': gvar.hand, // 'Right','Left'
                            'gender': gvar.gender,     // 'Female','Male'
                            'expertise': gvar.expertise, // 'Daily','Weekly','Rarely'
                            'screenwidth': window.screen.width,
                            'screenheight': window.screen.height,
                            'devicepixelratio' : window.devicePixelRatio,
                            //'model': WURFL.complete_device_name + ' -- ' + clientInformation.userAgent,
                            'model': gvar.device + ' -- ' + WURFL.complete_device_name + ' -- ' + window.navigator.userAgent,
                            'eligibility': (is_eligible?'Y':'N')
                        }
                        gvar.socket.emit('registerparticipant', participant);
                        $("#agreement").hide();
                        $("#noagreement").hide();
                        $("#infos").hide();
                        $("#previnfos").hide();
                        $("#nextinfos").hide();

                        gvar.in_task = false;

                        document.getElementById("training").innerHTML = gvar.textTraining(false);
                        document.getElementById("newtask").innerHTML = gvar.textNextTrial();

                        socket.on('registered', function (data) {
                            $("#newtask").show();
                            $("#training").show();
                            $("#grips").show();

                            function preGetNextTrainingTask() {
                                document.getElementById("training").className = "button_training but_active";
                                if (gvar.in_task || gvar.requestpending) { return; }
                            }
                            function getNextTrainingTask() {
                                document.getElementById("training").className = "button_training but_inactive";
                                if (gvar.in_task || gvar.requestpending) { return; }
                                $('#motivations').hide();
                                gvar.socket.emit('requestparameters', {'id': gvar.client_id, 'training':true});
                                gvar.requestpending = true;
                            }
                            document.getElementById("training").addEventListener("touchstart", preGetNextTrainingTask, false);
                            document.getElementById("training").addEventListener("touchend", getNextTrainingTask, false);

                            function preGetNextTask() {
                                document.getElementById("newtask").className = "button but_active";
                                //if (gvar.in_task || gvar.requestpending) { return; }
                            }
                            function getNextTask() {
                                document.getElementById("newtask").className = "button but_inactive";
                                if (gvar.in_task || gvar.requestpending) { return; }
                                if (gvar.grip != "Unknown") {
                                    $('#motivations').hide();
                                    document.getElementById("grips").className = "demo_category";
                                    gvar.socket.emit('requestparameters', {'id': gvar.client_id, 'training':false, 'grip':gvar.grip});
                                    gvar.requestpending = true;
                                } else {
                                    document.getElementById("grips").className = "demo_category ko";
                                }
                            }
                            document.getElementById("newtask").addEventListener("touchstart", preGetNextTask, false);
                            document.getElementById("newtask").addEventListener("touchend", getNextTask, false);

                            socket.on('parameters', function (data) {
                                gvar.in_task = true;
                                gvar.requestpending = false;

                                $("#training").hide();
                                $("#newtask").hide();
                                $("#grips").hide();
                                $(".share").hide();
                                $("#finish").hide();
                                if (data['training']) {
                                    $("#instructions").show();
                                }
                                $("#smallinstruction").show();
                                $("#task").show();

                                document.getElementById("instructions").innerHTML = gvar.textInstructions(data['type']);
                                document.getElementById("smallinstruction").innerHTML = gvar.textSmallInstructions(data['type']);
                                // set up the tasks
                                if (data['type'] == 'tap') {
                                    setTapTask(data);
                                } else if (data['type'] == 'pointing') {
                                    setPointingTask(data);
                                } else if (data['type'] == 'drag') {
                                    setDragTask(data);
                                } else if (data['type'] == 'rotation') {
                                    setRotationTask(data);
                                } else if (data['type'] == 'scaling') {
                                    setScalingTask(data);
                                } else if (data['type'] == 'swipe') {
                                    setSwipeTask(data);
                                }
                            });
                        });

                        socket.on('motivations', function (data) {
                            clearTimeout(gvar.error_timeout);
                            gvar.in_task = false;

                            // console.log(data);
                            if (data['was_in_training']) {
                                document.getElementById("training").innerHTML = gvar.textTraining(data['has_next'] != 0);
                                if (data['has_next'] == 0) {
                                    document.getElementById("newtask").innerHTML = gvar.textNextTrial();
                                    $("#newtask").show();
                                    $("#grips").show();
                                } else {
                                    $("#newtask").hide();
                                    $("#grips").hide();
                                }
                            } else {
                                $('#motivations').show();
                                document.getElementById("motivations").innerHTML = gvar.textMotivation(data);
                                $(".share").show();
                                $("#finish").show();
                                gvar.setShareMessages(data);
                            }

                        });
                    }
                }
                document.getElementById("agreement").addEventListener("touchstart", preRegisterUser, false);
                document.getElementById("agreement").addEventListener("touchend", registerUser, false);

                document.getElementById("noagreement").addEventListener("touchstart", preLeave, false);
                document.getElementById("noagreement").addEventListener("touchend", leave, false);
            }

            if (is_eligible) {
                mainDish();
            }
        });
    });
})