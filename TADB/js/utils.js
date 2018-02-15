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

gvar.borderthickness = 3;
gvar.grip = "Unknown";
gvar.nav_offset = 0;
gvar.requestpending = false;

function getSetupInPixel(cx, cy, r, thickness) {
    var setup = {};
    if (window.innerHeight < window.innerWidth) {

        var ua = window.navigator.userAgent;
        var is_safari = ua.indexOf("Safari");
        var is_mobile = ua.indexOf("Mobile");
        gvar.nav_offset = 0;
        if (is_safari && is_mobile) {
            gvar.nav_offset = ((document.body.offsetHeight - window.innerHeight)*1.01)*0.5;
        }

        setup['left']   = (cx*window.innerWidth -r*window.innerHeight)/100.0;
        setup['top']    = gvar.nav_offset + (cy*window.innerHeight -r*window.innerHeight)/100.0;;
        setup['width']  = 2*r*window.innerHeight/100.0;
        setup['height'] = 2*r*window.innerHeight/100.0;

        setup['cx'] = cx*window.innerWidth/100.0;
        setup['cy'] = gvar.nav_offset + cy*window.innerHeight/100.0;
        setup['r'] = r*window.innerHeight/100.0;

        if (thickness != null) { setup['thickness'] = thickness*window.innerHeight/100.0; }
    } else {
        gvar.nav_offset = 0;

        setup['left']   = (cx*window.innerWidth -r*window.innerWidth)/100.0;
        setup['top']    = (cy*window.innerHeight -r*window.innerWidth)/100.0;;
        setup['width']  = 2*r*window.innerWidth/100.0;
        setup['height'] = 2*r*window.innerWidth/100.0;

        setup['cx'] = cx*window.innerWidth/100.0;
        setup['cy'] = cy*window.innerHeight/100.0;
        setup['r'] = r*window.innerWidth/100.0;

        if (thickness != null) { setup['thickness'] = thickness*window.innerWidth/100.0; }
    }
    return setup;
}
gvar.getSetupInPixel = getSetupInPixel;

function scalarProduct(ux,uy,vx,vy) {
    return ux*vx+uy*vy;
}
gvar.scalarProduct = scalarProduct;

function setCookie(dico, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ encodeURIComponent(d.toUTCString());

    for (var key in dico) {
        document.cookie = key + "=" + encodeURIComponent(dico[key]) + ";" + expires + ";path=/";
    }
    // console.log(decodeURIComponent(document.cookie));
}
gvar.setCookie = setCookie;

function getCookie(cname) {
    var decodedCookie = decodeURIComponent(document.cookie);
    // console.log("GetCookie "+cname);
    // console.log(decodedCookie);
    var ca = decodedCookie.split(';');

    for(var k = 0; k < ca.length; k++) {
        var data = ca[k].split('=');
        if (data[0].trim() == cname) {
            // console.log("Found "+data[1]);
            return data[1];
        }
    }

    // console.log("Not found");
    return null;
}
gvar.getCookie = getCookie;

function reloadError() {
    $('#motivations').show();
    document.getElementById("motivations").innerHTML = gvar.textReloadError();
}

function emitData(type,data) {
    gvar.error_timeout = setTimeout(reloadError, 3000);
    gvar.socket.emit(type, data);
}
gvar.emitData = emitData;











function textContinueAnyway() {
    var text = "<p>Continue anyway, my device has a touchscreen<br>"+
               "(If you cannot click this button, try using Chrome)</p>";
    return text;
}
gvar.textContinueAnyway = textContinueAnyway;

function textAgree() {
    return "<p>I agree</p>";
}
gvar.textAgree = textAgree;

function textNoAgree() {
    return "<p>I don't agree</p>";
}
gvar.textNoAgree = textNoAgree;

gvar.disclaimerpart = 1;
gvar.disclaimermaxpart = 10;
function textDisclaimer(part) {
    var disclaimer = null;
    if (part == 1) {
        disclaimer = ""
            +"<p><span style=\"font-weight: bold\">DEPARTMENT OF COMPUTER SCIENCE UNIVERSITY OF ............., "
            +"INFORMED CONSENT FORM</span><br>"
            +"Please read the following form carefully before continuing:<br>"
            +"<span style=\"font-weight: bold\">Research Project:<br>"
            +"Movement characteristics for touch screen interaction</span><br>"
            +"Investigators: Dr. ..........., Department of Computer Science (..................., "
            +".............); ..........., Department of Computer Science</p>"
            // +"Investigators: Dr. Carl Gutwin, Department of Computer Science (gutwin@cs.usask.ca, "
            // +"306-966-8646); Alix Goguey, Department of Computer Science</p>"
    } else if (part == 2) {
        disclaimer = ""
            +"<p>This consent form should give you the basic idea of what the research is about and "
            +"what your participation will involve. If you would like more detail about something "
            +"mentioned here, or information not included here, please ask. Please take the time "
            +"to read this form carefully and to understand any accompanying information.</p>"
    } else if (part == 3) {
        disclaimer = ""
            +"<p>This study is concerned with gathering basic data about touch screen interactions "
            +"(position of the touch points, screen resolution, grip, and demographics). "
            +"The goal of the research is to study the movement characteristics of touch screen "
            +"interactions.</p>"
    } else if (part == 4) {
        disclaimer = ""
            +"<p>The session duration or the number of tasks you may complete is entirely at "
            +"your discretion. You are free to stop whenever you want. You are also free to resume the "
            +"study and continue completing tasks. If you agree to participate, we register anonymous "
            +"information concerning your connection using browser cookies stored locally on "
            +"your device.</p>"
    } else if (part == 5) {
        disclaimer = ""
            +"<p>These cookies help us connect you with your previous tasks and prevent "
            +"re-entering your demographic information. You are free to remove these cookies by clearing "
            +"your browser data. If you do so, and then continue the experiment, you will be considered "
            +"as a new participant.</p>"
    } else if (part == 6) {
        disclaimer = ""
            +"<p>As one way of thanking you for your time, we will be pleased to make available to you "
            +"a summary of the results of this study once they have been compiled (usually within "
            +"two months). This summary will outline the research and discuss our findings and "
            +"recommendations. This summary will be available at "
            +"<a href=\"http://hci.usask.ca/\">http://hci.usask.ca/</a><br></p>"
    } else if (part == 7) {
        disclaimer = ""
            +"<p>The data collected from this study will be used in articles for publication in journals "
            +"and conference proceedings. All research data will be kept in a secure location under "
            +"confidentiality in accordance with University policy for 5 years post publication.</p>"
    } else if (part == 8) {
        disclaimer = ""
            +"<p>Your continued participation should be as informed as your initial consent, so you "
            +"should feel free to ask for clarification or new information throughout your participation. "
            +"If you have further questions concerning matters related to this research, please contact: "
            +"Dr. Carl Gutwin, Professor, Dept. of Computer Science, (306) 966-8646, gutwin@cs.usask.ca</p>"
    } else if (part == 9) {
        disclaimer = ""
            +"<p>By clicking the 'I Agree' button below and continuing with the study, you indicate "
            +"that you have understood to your satisfaction the information regarding participation "
            +"in the research project and agree to participate as a participant. In no way does this "
            +"waive your legal rights nor release the investigators, sponsors, or involved institutions "
            +"from their legal and professional responsibilities.</p>"
    } else if (part == 10) {
        disclaimer = ""
            +"<p>Please print or save a copy of this form for your records and reference. This research "
            +"has the ethical approval of the Research Ethics Office at the University of Saskatchewan.</p>"
    }
    return disclaimer;
}
gvar.textDisclaimer = textDisclaimer;

function textEligibility(eligibility, device_name, part) {
    var text = null;
    if (eligibility) {
        text = ""+
            '<h4>Welcome</h4>'+
            // '<p>Your device ('+device_name+') is eligible for the study.<br>'+
            // 'Your current screen resolution is: '+window.screen.width+'x'+window.screen.height+'</p>'+
            '<p style="font-style: italic" class="eligibility">Your device ('+device_name+') is eligible for the study.</p>'+
            gvar.textDisclaimer(part);
    } else {
        text = ""+
            '<h4>Oops... </h4>'+
            '<p style="font-style: italic">It seems that your device ('+device_name+') is not eligible for the study.<br>'+
            'Sorry for the inconvenience.<br>'+
            'If you want to participate, please come back using a smartphone or tablet device.</p>';
    }
    return text;
}
gvar.textEligibility = textEligibility;

function textLeave() {
    var text = '<h3>Thank you for your time</h3>'+
               '<p>Don\'t hesitate to come back if you change your mind.<br>'+
               'Here is a cat gif in any case...</p>'+
               '<a href="http://thecatapi.com"><img id="cat" src="http://thecatapi.com/api/images/get?format=src&type=gif"></a>';
    return text;
}
gvar.textLeave = textLeave;

function textFinish() {
    var text = '<h3>Thank you for your time</h3>'+
               '<p>Don\'t hesitate to come back and continue completing tasks '+
               '(your data have been saved).<br>'+
               'Here is a cat gif in any case...</p>'+
               '<a href="http://thecatapi.com"><img id="cat" src="http://thecatapi.com/api/images/get?format=src&type=gif"></a>';
    return text;
}
gvar.textFinish = textFinish;

function textInstructions(task) {
    var text = null;
    if (task == 'tap') {
        text = "<p>Tap the circular white target when it appears.</p>";
    } else if (task == 'pointing') {
        text = "<p>Tap the series of circular white targets.</p>";
    } else if (task == 'drag') {
        text = "<p>Drag the circular yellow object inside the circular green "+
               "area. Release it when the green area turns white.</p>";
    } else if (task == 'rotation') {
        text = "<p>Rotate the circular yellow object with two fingers so that the black tick-mark "+
               "is between the two target marks at the top of the circle. Release the object when the yellow circle turns white.</p>";
    } else if (task == 'scaling') {
        text = "<p>Scale (zoom) the circular yellow object with two fingers so that its edges fit inside "+
               "the green ring. Release it when the green ring turns white.</p>";
    } else if (task == 'swipe') {
        text = "<p>Swipe the circular yellow object toward the green end of the line.</p>";
    }
    text += "<p>Tap anywhere to remove this message.</p>";
    return text;
}
gvar.textInstructions = textInstructions;

function textSmallInstructions(task) {
    var text = null;
    if (task == 'tap') {
        text = "<p>Tap</p>";
    } else if (task == 'pointing') {
        text = "<p>Tap</p>";
    } else if (task == 'drag') {
        text = "<p>Drag</p>";
    } else if (task == 'rotation') {
        text = "<p>Rotate</p>";
    } else if (task == 'scaling') {
        text = "<p>Scale</p>";
    } else if (task == 'swipe') {
        text = "<p>Swipe</p>";
    }
    return text;
}
gvar.textSmallInstructions = textSmallInstructions;

function textNextTrial() {
    return "<p>New task</p>";
}
gvar.textNextTrial = textNextTrial;

function textTraining(has_next) {
    var text = null;
    if (has_next) {
        text = "<p>Next training task</p>";
    } else {
        //text = "<p>Training: go through all tasks</p>";
        text = "<p>Training</p>";
    }
    return text;
}
gvar.textTraining = textTraining;

gvar.timing = ""
function textPreviousTrial(time) {
    // return "<p>Previous task completed in "+time+"ms<br>New task</p>";
    gvar.timing = "Previous task completed in "+time+"ms<br>"
    return "<p>New task</p>";
}
gvar.textPreviousTrial = textPreviousTrial;

function textMotivation(data) {
    var diff_task = data['maxperformed']-data['userperformed'];
    var ratio = data['userperformed']*100.0/data['sumperformed'];

    var motivation = "<p>"+gvar.timing;
    if (data['userperformed'] > 1) {
        motivation += "You've completed "+data['userperformed']+" tasks!<br>";
    } else {
        motivation += "You've completed "+data['userperformed']+" task!<br>";
    }
    if (diff_task > 1) {
        motivation += "You're "+(diff_task)+" tasks away from the most ever done!<br>"
    } else if (diff_task == 1) {
        motivation += "You're "+(diff_task)+" task away from the most ever done!<br>"
    } else {
        motivation += "You've done "+(data['maxperformed']-data['secondmaxperformed'])+" more than anyone else!<br>";
    }
    motivation += "You contributed "+ratio.toPrecision(3)+"% of the overall data!<br>Thanks! :)</p>";
    return motivation;
}
gvar.textMotivation = textMotivation;

gvar.fb_url = "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Ftouch.usask.ca";
gvar.tw_url = "https://twitter.com/intent/tweet?url=http%3A%2F%2Ftouch.usask.ca";
function setShareMessages(data) {
    var share_text = "Contribute to research in Human-Computer Interaction about touchscreen interaction!";
    if (data != null) {
        if (data['userperformed'] > 1) {
            share_text += " I've done "+data['userperformed']+" tasks and you?";
        } else {
            share_text += " I've done 1 task and you?";
        }
    }
    gvar.tw_url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(share_text) + "&url=http%3A%2F%2Ftouch.usask.ca";
}

gvar.setShareMessages = setShareMessages;

function textReloadError() {
    var text = ""
        +"<p>Oops..<br>"
        +"It seems there was a connection error...<br>"
        +"Please reload the page to continue your session.<br>"
        +"No data was lost.</p>";
    return text;
}
gvar.textReloadError = textReloadError;