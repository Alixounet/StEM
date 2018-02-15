/* drag.js
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
var x = 0;
var y = 0;
var scx, scy, sr, s_left, s_top;
var ecx, ecy, er;

function startDragTask() {
    $("#instructions").hide();
    start_date = new Date();
}

function endDragTask() {
    end_date = new Date();

    trial['completiontime'] = end_date - start_date;
    trial['endx'] = scx;
    trial['endy'] = scy;

    document.getElementById("drag_start").removeEventListener('touchstart', dragHandleDown);
    document.getElementById("task").removeEventListener('touchstart', falseDrag);
    document.getElementById("task").removeEventListener('touchmove', dragHandleMove);
    document.getElementById("drag_start").removeEventListener('touchend', dragHandleUp);

    task_elements['start'].remove();
    task_elements['end'].remove();
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

    // gvar.socket.emit('dragtrial', trial);
    gvar.emitData('dragtrial', trial);
    trial = null;
}

function isTokenInside() {
    var dx = scx-ecx;
    var dy = scy-ecy;
    //return (Math.sqrt(dx*dx+dy*dy) <= er); // center inside
    return (Math.sqrt(dx*dx+dy*dy) <= er-sr); // completely inside
}

function falseDrag(evt) {
    $("#instructions").hide();
    if (task_started) {
        trial['numberoftry'] += 1;
    }
}

function dragHandleDown(evt) {
    x = evt.touches[0].clientX;
    y = evt.touches[0].clientY;
    if (!task_started) {
        startDragTask();
        task_started = true;
        //trial['numberoftry'] += 1; // taken care of by false drag...
    }
    inside_div = true;
}

function dragHandleMove(evt) {
    if (inside_div) {
        var dx = evt.touches[0].clientX - x;
        var dy = evt.touches[0].clientY - y;
        // console.log(dx+", "+dy);
        x = evt.touches[0].clientX;
        y = evt.touches[0].clientY;

        scx += dx;
        scy += dy;
        s_left += dx;
        s_top += dy;
        task_elements['start'].style.left = Number(s_left-gvar.borderthickness)+'px';
        task_elements['start'].style.top = Number(s_top-gvar.borderthickness)+'px';

        if (isTokenInside()) {
            if (task_elements['end'].className != 'active') {
                task_elements['end'].className = 'active';
                //task_elements['start']['div'].style.opacity = 0.3;
            }
        } else {
            if (task_elements['end'].className != 'move_inactive') {
                task_elements['end'].className = 'move_inactive';
                //task_elements['start']['div'].style.opacity = 1;
            }
        }
    }
}

function dragHandleUp(evt) {
    if (task_elements['end'].className == 'active') {
        endDragTask();
        task_started = false;
    }

    inside_div = false;
}

function setDragTask(data) {
    training = data['training'];
    task_elements = {};

    var start_div = document.createElement('div');
    start_div.id = 'drag_start';
    start_div.className = 'movable';
    start_div.style.borderWidth = gvar.borderthickness+'px';
    var start_setup = gvar.getSetupInPixel(data['scx'], data['scy'], data['sr'], null);
    start_div.style.left = Number(start_setup['left']-gvar.borderthickness)+'px';
    start_div.style.top = Number(start_setup['top']-gvar.borderthickness)+'px';
    start_div.style.width = start_setup['width']+'px';
    start_div.style.height = start_setup['height']+'px';
    scx = start_setup['cx'];
    scy = start_setup['cy'];
    sr = start_setup['r'];
    s_left = start_setup['left'];
    s_top = start_setup['top'];

    var end_div = document.createElement('div');
    end_div.id = 'drag_end';
    end_div.className = 'move_inactive';
    end_div.style.borderWidth = gvar.borderthickness+'px';
    var end_setup = gvar.getSetupInPixel(data['ecx'], data['ecy'], data['er'], null);
    end_div.style.left = Number(end_setup['left']-gvar.borderthickness)+'px';
    end_div.style.top = Number(end_setup['top']-gvar.borderthickness)+'px';
    end_div.style.width = end_setup['width']+'px';
    end_div.style.height = end_setup['height']+'px';
    ecx = end_setup['cx'];
    ecy = end_setup['cy'];
    er = end_setup['r'];

    task_elements = {'start': start_div, 'end': end_div};

    document.getElementById('task').appendChild(end_div);
    document.getElementById('task').appendChild(start_div);

    document.getElementById("drag_start").addEventListener("touchstart", dragHandleDown, false);
    document.getElementById("task").addEventListener("touchstart", falseDrag, false);
    document.getElementById("task").addEventListener("touchmove", dragHandleMove, false);
    document.getElementById("drag_start").addEventListener("touchend", dragHandleUp, false);

    task_started = false;
    inside_div = false;

    trial = {
        'id': gvar.client_id,
        ////////////////////////////////////////////////////////
        'orientation': (window.screen.width>window.screen.height?'Landscape':'Portrait'),
        'grip': gvar.grip,
        'startcenterx': start_setup['cx'],
        'startcentery': start_setup['cy'],
        'startradius': start_setup['r'],
        'endcenterx': end_setup['cx'],
        'endcentery': end_setup['cy'],
        'endradius': end_setup['r'],
        'completiontime': null,
        'numberoftry': 0
    }
}