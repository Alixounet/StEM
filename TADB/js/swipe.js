/* swipe.js
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

var task_elements = {};
var start_date = null;
var end_date = null;
var trial = null;

var training = null;

var task_started = false;
var inside_div = false;
var x, y, timestamp, speed;
var dir_x, dir_y;
var scx, scy, cx, cy, r, s_left, s_top, left, top;
var ecx, ecy, e_left, e_top;
var method;
var norm, curent_dist;

function startSwipeTask() {
    $("#instructions").hide();
    start_date = new Date();
}

function endSwipeTask() {
    end_date = new Date();

    trial['completiontime'] = end_date - start_date;
    trial['completionmethod'] = method;
    trial['endx'] = x;
    trial['endy'] = y;
    trial['enddistance'] = curent_dist;
    trial['endspeed'] = speed;

    document.getElementById("swipe_start").removeEventListener('touchstart', swipeHandleDown);
    document.getElementById("task").removeEventListener('touchstart', falseSwipe);
    document.getElementById("task").removeEventListener('touchmove', swipeHandleMove);
    document.getElementById("swipe_start").removeEventListener('touchend', swipeHandleUp);

    var anim_duration = 200;
    if (method == "Speed") { anim_duration = 150; }
    $("#swipe_start").animate({
            left: Number(e_left-gvar.borderthickness)+"px",
            top: Number(e_top-gvar.borderthickness)+"px"
        }, {
            duration: anim_duration,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
        }, complete: function() {
            task_elements['start'].remove();
            task_elements['line'].remove();
            delete task_elements;
            task_elements = {};
            if (!training) {
                $("#newtask").show();
                $("#grips").show();
            }
            $("#training").show();
            $("#instructions").hide();
            $("#smallinstruction").hide();
            $("#task").hide();

            document.getElementById("newtask").innerHTML = gvar.textPreviousTrial(trial['completiontime']);

            // gvar.socket.emit('swipetrial', trial);
            gvar.emitData('swipetrial', trial);
            trial = null;
        }
    });
}

function isSwipeGood() {
    var speed_sthreshold = 1.75;
    if (curent_dist > 0.5 && !(speed < 0 && speed < -speed_sthreshold)) {
        method = "Distance";
        return true;
    } else if (speed > 0 && speed > speed_sthreshold) {
        method = "Speed";
        return true;
    }
    return false;
}

function falseSwipe(evt) {
    $("#instructions").hide();
    if (task_started) {
        trial['numberoftry'] += 1;
    }
}

function swipeHandleDown(evt) {
    speed = 0;
    x = evt.touches[0].clientX;
    y = evt.touches[0].clientY;
    timestamp = evt.timeStamp
    if (!task_started) {
        startDragTask();
        task_started = true;
        //trial['numberoftry'] += 1; // taken care of by false drag...
    }
    inside_div = true;
}

function swipeHandleMove(evt) {
    if (inside_div) {
        var dx = evt.touches[0].clientX - x;
        var dy = evt.touches[0].clientY - y;
        x = evt.touches[0].clientX;
        y = evt.touches[0].clientY;

        var dist = gvar.scalarProduct(dx,dy,dir_x,dir_y);
        dx = dist*dir_x;
        dy = dist*dir_y;

        var born_min = gvar.scalarProduct(cx+dx-scx,cy+dy-scy,dir_x,dir_y);
        var born_max = gvar.scalarProduct(cx+dx-ecx,cy+dy-ecy,-dir_x,-dir_y);

        if (born_min < 0) {
            cx = scx;
            cy = scy;
            cur_left = s_left;
            cur_top = s_top;
            curent_dist = 0;
        } if (born_max < 0) {
            cx = ecx;
            cy = ecy;
            cur_left = e_left;
            cur_top = e_top;
            curent_dist = 1;
        } else {
            cx += dx;
            cy += dy;
            cur_left += dx;
            cur_top += dy;
            curent_dist += dist/norm;
        }
        task_elements['start'].style.left = Number(cur_left-gvar.borderthickness)+'px';
        task_elements['start'].style.top = Number(cur_top-gvar.borderthickness)+'px';

    var dt = evt.timeStamp - timestamp;
    // var dmvt = Math.sqrt(gvar.scalarProduct(dx,dy,dx,dy));
    if (dt > 0) {
        speed = dist/dt;
    }
    // console.log(speed);
    timestamp = evt.timeStamp;
    }
}

function swipeHandleUp(evt) {
    if (isSwipeGood()) {
        endSwipeTask();
        task_started = false;
    } else {
        $("#swipe_start").animate({
            left: Number(s_left-gvar.borderthickness)+"px",
            top: Number(s_top-gvar.borderthickness)+"px"
        }, {
            duration: 50,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
        }, complete: function() {
            cx = scx;
            cy = scy;
            cur_left = s_left;
            cur_top = s_top;
            curent_dist = 0;
        }
    });
    }

    inside_div = false;
}

function setSwipeTask(data) {
    training = data['training'];
    task_elements = {};

    var start_div = document.createElement('div');
    start_div.id = 'swipe_start';
    start_div.className = 'movable';
    start_div.style.borderWidth = gvar.borderthickness+'px';
    var start_setup = gvar.getSetupInPixel(data['scx'], data['scy'], data['r'], null);
    start_div.style.left = Number(start_setup['left']-gvar.borderthickness)+'px';
    start_div.style.top = Number(start_setup['top']-gvar.borderthickness)+'px';
    start_div.style.width = start_setup['width']+'px';
    start_div.style.height = start_setup['height']+'px';
    cx = start_setup['cx'];
    cy = start_setup['cy'];
    scx = start_setup['cx'];
    scy = start_setup['cy'];
    r = start_setup['r'];
    cur_left = start_setup['left'];
    cur_top = start_setup['top'];
    s_left = start_setup['left'];
    s_top = start_setup['top'];

    var ratio = 4;

    var line_div = document.createElement('div');
    line_div.id = 'swipe_line';
    line_div.className = 'line';
    var end_setup = gvar.getSetupInPixel(data['ecx'], data['ecy'], data['r'], null);
    line_div.style.left = start_setup['cx']+'px';
    line_div.style.top = Number(start_setup['cy']-0.5*gvar.borderthickness*ratio)+'px';
    line_div.style.height = Number(gvar.borderthickness*ratio)+'px';
    dir_x = end_setup['cx'] - start_setup['cx'];
    dir_y = end_setup['cy'] - start_setup['cy'];
    norm = Math.sqrt(gvar.scalarProduct(dir_x,dir_y,dir_x,dir_y));
    line_div.style.width = Number(norm)+'px';
    ecx = end_setup['cx'];
    ecy = end_setup['cy'];
    e_left = end_setup['left'];
    e_top = end_setup['top'];

    document.getElementById('task').appendChild(line_div);
    document.getElementById('task').appendChild(start_div);

    var cos_theta = gvar.scalarProduct(dir_x,dir_y,1,0)/
                    (Math.sqrt(gvar.scalarProduct(dir_x,dir_y,dir_x,dir_y))*
                     Math.sqrt(gvar.scalarProduct(1,0,1,0)))
    var sign = (dir_x*0-dir_y*1<0?-1.0:1.0);
    var theta = -sign*Math.acos(cos_theta)*180.0/Math.PI;

    var angle = 0;
    if (!isNaN(theta)) {
        angle = theta;
    }

    var transform = 'rotate('+Number(angle)+'deg)';
    $('#swipe_line').css({
        'transform': transform,
        '-ms-transform': transform,
        '-webkit-transform': transform
    })

    dir_x = dir_x / norm;
    dir_y = dir_y / norm;

    curent_dist = 0;
    speed = 0;

    task_elements = {'start': start_div, 'line': line_div};


    document.getElementById("swipe_start").addEventListener("touchstart", swipeHandleDown, false);
    document.getElementById("task").addEventListener("touchstart", falseSwipe, false);
    document.getElementById("task").addEventListener("touchmove", swipeHandleMove, false);
    document.getElementById("swipe_start").addEventListener("touchend", swipeHandleUp, false);

    task_started = false;
    inside_div = false;

    trial = {
        'id': gvar.client_id,
        ////////////////////////////////////////////////////////
        'orientation': (window.screen.width>window.screen.height?'Landscape':'Portrait'),
        'grip': gvar.grip,
        'startcenterx': start_setup['cx'],
        'startcentery': start_setup['cy'],
        'radius': start_setup['r'],
        'endcenterx': end_setup['cx'],
        'endcentery': end_setup['cy'],
        'endradius': end_setup['r'],
        'completiontime': null,
        'numberoftry': 0
    }
}