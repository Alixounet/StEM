/* demographics.js
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

gvar.age = 18;
gvar.device = null;
gvar.gender = null;
gvar.hand = null;
gvar.expertise = null;

function preAgeMinus() {
    document.getElementById("age_minus").className = "demo_button checked";
}
function ageMinus() {
    document.getElementById("age_minus").className = "demo_button unchecked";
    gvar.age = gvar.age-1;
    if (gvar.age < 1) { gvar.age = 1; }
    // document.getElementById("age_value").innerHTML = gvar.age;
    document.getElementById("age_value").value = gvar.age;
}

function preAgePlus() {
    document.getElementById("age_plus").className = "demo_button checked";
}
function agePlus() {
    document.getElementById("age_plus").className = "demo_button unchecked";
    gvar.age = gvar.age+1;
    // document.getElementById("age_value").innerHTML = gvar.age;
    document.getElementById("age_value").value = gvar.age;
}

function setGenderFemale() {
    gvar.gender = "Female";
    document.getElementById("gender_female").className = "demo_button checked";
    document.getElementById("gender_male").className = "demo_button unchecked";
}
function setGenderMale() {
    gvar.gender = "Male";
    document.getElementById("gender_female").className = "demo_button unchecked";
    document.getElementById("gender_male").className = "demo_button checked";
}

function setHandLeft() {
    gvar.hand = "Left";
    document.getElementById("hand_left").className = "demo_button checked";
    document.getElementById("hand_right").className = "demo_button unchecked";
}
function setHandRight() {
    gvar.hand = "Right";
    document.getElementById("hand_left").className = "demo_button unchecked";
    document.getElementById("hand_right").className = "demo_button checked";
}

function setExpDaily() {
    gvar.expertise = "Daily";
    document.getElementById("exp_daily").className = "demo_button checked";
    document.getElementById("exp_weekly").className = "demo_button unchecked";
    document.getElementById("exp_rarely").className = "demo_button unchecked";
}
function setExpWeekly() {
    gvar.expertise = "Weekly";
    document.getElementById("exp_daily").className = "demo_button unchecked";
    document.getElementById("exp_weekly").className = "demo_button checked";
    document.getElementById("exp_rarely").className = "demo_button unchecked";
}
function setExpRarely() {
    gvar.expertise = "Rarely";
    document.getElementById("exp_daily").className = "demo_button unchecked";
    document.getElementById("exp_weekly").className = "demo_button unchecked";
    document.getElementById("exp_rarely").className = "demo_button checked";
}

function setGrip11() {
    gvar.grip = "Grip11";
    document.getElementById("grip11").className = "demo_button checked";
    document.getElementById("grip21").className = "demo_button unchecked";
    document.getElementById("grip22").className = "demo_button unchecked";
}
function setGrip21() {
    gvar.grip = "Grip21";
    document.getElementById("grip11").className = "demo_button unchecked";
    document.getElementById("grip21").className = "demo_button checked";
    document.getElementById("grip22").className = "demo_button unchecked";
}
function setGrip22() {
    gvar.grip = "Grip22";
    document.getElementById("grip11").className = "demo_button unchecked";
    document.getElementById("grip21").className = "demo_button unchecked";
    document.getElementById("grip22").className = "demo_button checked";
}

function setDemographics() {
    $("#demographics").show();

    gvar.device = gvar.getCookie('device');
    if (gvar.device != null) {
        document.getElementById("device_value").value = gvar.device;
    } else {
        if (WURFL.complete_device_name.indexOf("Generic") == -1) {
            gvar.device = WURFL.complete_device_name;
            document.getElementById("device_value").value = gvar.device;
        }
    }

    var res = gvar.getCookie('age');
    if (res != null) {
        gvar.age = parseInt(res);
        // document.getElementById("age_value").innerHTML = gvar.age;
        document.getElementById("age_value").value = gvar.age;
    }

    gvar.gender = gvar.getCookie('gender');
    if (gvar.gender != null) {
        if (gvar.gender == 'Female') { setGenderFemale(); }
        if (gvar.gender == 'Male') { setGenderMale(); }
    }

    gvar.hand = gvar.getCookie('hand');
    if (gvar.hand != null) {
        if (gvar.hand == 'Left') { setHandLeft(); }
        if (gvar.hand == 'Right') { setHandRight(); }
    }

    gvar.expertise = gvar.getCookie('expertise');
    if (gvar.expertise != null) {
        if (gvar.expertise == 'Daily') { setExpDaily(); }
        if (gvar.expertise == 'Weekly') { setExpWeekly(); }
        if (gvar.expertise == 'Rarely') { setExpRarely(); }
    }

    document.getElementById("age_minus").addEventListener("touchstart", preAgeMinus, false);
    document.getElementById("age_minus").addEventListener("touchend", ageMinus, false);

    document.getElementById("age_plus").addEventListener("touchstart", preAgePlus, false);
    document.getElementById("age_plus").addEventListener("touchend", agePlus, false);

    document.getElementById("gender_female").addEventListener("touchend", setGenderFemale, false);
    document.getElementById("gender_male").addEventListener("touchend", setGenderMale, false);

    document.getElementById("hand_left").addEventListener("touchend", setHandLeft, false);
    document.getElementById("hand_right").addEventListener("touchend", setHandRight, false);

    document.getElementById("exp_daily").addEventListener("touchend", setExpDaily, false);
    document.getElementById("exp_weekly").addEventListener("touchend", setExpWeekly, false);
    document.getElementById("exp_rarely").addEventListener("touchend", setExpRarely, false);

    document.getElementById("grip11").addEventListener("touchend", setGrip11, true);
    document.getElementById("grip21").addEventListener("touchend", setGrip21, true);
    document.getElementById("grip22").addEventListener("touchend", setGrip22, true);
    document.getElementById("svggrip11").addEventListener("touchend", setGrip11, true);
    document.getElementById("svggrip21").addEventListener("touchend", setGrip21, true);
    document.getElementById("svggrip22").addEventListener("touchend", setGrip22, true);
}

function demographicsValid() {
    var valid = true;

    gvar.device = document.getElementById("device_value").value;
    if (gvar.device == null || gvar.device == "") {
        document.getElementById("device").className = "demo_category ko";
        valid = false;
    } else {
        document.getElementById("device").className = "demo_category";
    }
    if (gvar.age < 18) {
        document.getElementById("age").className = "demo_category ko";
        valid = false;
    } else {
        document.getElementById("age").className = "demo_category";
    }
    if (gvar.gender == null || (gvar.gender != 'Female' && gvar.gender != 'Male')) {
        document.getElementById("gender").className = "demo_category ko";
        valid = false;
    } else {
        document.getElementById("gender").className = "demo_category";
    }
    if (gvar.hand == null || (gvar.hand != 'Left' && gvar.hand != 'Right')) {
        document.getElementById("handiness").className = "demo_category ko";
        valid = false;
    } else {
        document.getElementById("handiness").className = "demo_category";
    }
    if (gvar.expertise == null || (gvar.expertise != 'Daily' && gvar.expertise != 'Weekly' && gvar.expertise != 'Rarely')) {
        document.getElementById("expertise").className = "demo_category ko";
        valid = false;
    } else {
        document.getElementById("expertise").className = "demo_category";
    }
    if (valid) {
        gvar.setCookie({'device':gvar.device,
                        'age':gvar.age,
                        'gender':gvar.gender,
                        'hand':gvar.hand,
                        'expertise':gvar.expertise},200);
    }
    return valid;
}