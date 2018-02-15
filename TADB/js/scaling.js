/* scaling.js
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
var radius, target_radius, thickness;
var dist;

function startScalingTask() {
    start_date = new Date();
}

function endScalingTask(evt) {
    end_date = new Date();
    trial['completiontime'] = end_date - start_date;
    trial['endradius'] = radius;

    document.getElementById("newtask").innerHTML = gvar.textPreviousTrial(trial['completiontime']);

    document.getElementById("task").removeEventListener('touchstart', scalingHandleDown);
    document.getElementById("task").removeEventListener('touchmove', scalingHandleMove);
    document.getElementById("task").removeEventListener('touchend', scalingHandleUp);

    task_elements['lower'].remove();
    task_elements['outer'].remove();
    task_elements['inner'].remove();
    task_elements['upper'].remove();
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

    // gvar.socket.emit('scalingtrial', trial);
    gvar.emitData('scalingtrial', trial);
    trial = null;
}

function isTokenInsideRing() {
    return (radius < target_radius+thickness) && (radius > target_radius);
}

// function falseScaling(evt) {
//     if (task_started) {
//         trial['numberoftry'] += 1;
//     }
// }

function scalingHandleDown(evt) {
    $("#instructions").hide();
    if (evt.touches.length > 1) {
        var dx = evt.touches[0].clientX - evt.touches[1].clientX;
        var dy = evt.touches[0].clientY - evt.touches[1].clientY;
        dist = Math.sqrt(dx*dx+dy*dy);
        if (!inside_div) {
            trial['numberoftry'] += 1;
        }
        if (!task_started) {
            startScalingTask();
            task_started = true;
            inside_div = true;
        }
    }
}

function scalingHandleMove(evt) {
    if (evt.touches.length > 1) {

        var dx = evt.touches[0].clientX - evt.touches[1].clientX;
        var dy = evt.touches[0].clientY - evt.touches[1].clientY;
        var dist_aux = Math.sqrt(dx*dx+dy*dy);
        var diff = 0.5*(dist_aux-dist);
        
        radius += diff;
        task_elements['setup']['left'] = task_elements['setup']['left']-diff;
        task_elements['setup']['top'] = task_elements['setup']['top']-diff;
        task_elements['setup']['width'] = task_elements['setup']['width']+2*diff;
        task_elements['setup']['height'] = task_elements['setup']['height']+2*diff;
        
        task_elements['lower'].style.left = Number(task_elements['setup']['left']-task_elements['border'])+'px';
        task_elements['lower'].style.top = Number(task_elements['setup']['top']-task_elements['border'])+'px';
        task_elements['lower'].style.width = Number(task_elements['setup']['width'])+'px';
        task_elements['lower'].style.height = Number(task_elements['setup']['height'])+'px';

        task_elements['upper'].style.left = Number(task_elements['setup']['left']-task_elements['border'])+'px';
        task_elements['upper'].style.top = Number(task_elements['setup']['top']-task_elements['border'])+'px';
        task_elements['upper'].style.width = Number(task_elements['setup']['width'])+'px';
        task_elements['upper'].style.height = Number(task_elements['setup']['height'])+'px';

        dist = dist_aux;

        if (isTokenInsideRing()) {
            if (task_elements['upper'].className != 'upper_active') {
                task_elements['upper'].className = 'upper_active';
                task_elements['outer'].className = 'ring ring_outer_active';
                task_elements['inner'].className = 'ring ring_inner_active';
            }
        } else {
            if (task_elements['upper'].className == 'upper_active') {
                task_elements['upper'].className = 'upper_inactive';
                task_elements['outer'].className = 'ring ring_outer_inactive';
                task_elements['inner'].className = 'ring ring_inner_inactive';
            }
        }
    }
}

function scalingHandleUp(evt) {
    if ((evt.touches.length < 2) && task_started) {
        if (task_elements['upper'].className == 'upper_active') {
            endScalingTask();
            task_started = false;
        }
        inside_div = false;
    }
}

function setScalingTask(data) {
    training = data['training'];

    var border_thickness = gvar.borderthickness;

    var lower_div = document.createElement('div');
    lower_div.id = 'lower_scaling';
    lower_div.className = 'movable';
    var setup = gvar.getSetupInPixel(data['cx'], data['cy'], data['sr'], null);
    lower_div.style.left = Number(setup['left']-border_thickness)+'px';
    lower_div.style.top = Number(setup['top']-border_thickness)+'px';
    lower_div.style.width = setup['width']+'px';
    lower_div.style.height = setup['height']+'px';

    var upper_div = document.createElement('div');
    upper_div.id = 'upper_scaling';
    upper_div.className = 'upper_inactive';
    upper_div.style.left = Number(setup['left']-border_thickness)+'px';
    upper_div.style.top = Number(setup['top']-border_thickness)+'px';
    upper_div.style.width = Number(setup['width'])+'px';
    upper_div.style.height = Number(setup['height'])+'px';
    upper_div.style.borderWidth = Number(border_thickness)+'px';

    var ring_setup = gvar.getSetupInPixel(data['cx'], data['cy'], data['er']-0.5*data['thickness'], data['thickness']);

    var outer = document.createElement('div');
    outer.id = 'ring_outer';
    outer.className = 'ring ring_outer_inactive';
    outer.style.left = Number(ring_setup['left'] - ring_setup['thickness'])+'px';
    outer.style.top = Number(ring_setup['top'] - ring_setup['thickness'])+'px';
    outer.style.width = ring_setup['width']+'px';
    outer.style.height = ring_setup['height']+'px';
    outer.style.borderWidth = ring_setup['thickness']+'px';

    var inner = document.createElement('div');
    inner.id = 'ring_inner';
    inner.className = 'ring ring_inner_inactive';
    inner.style.left = Number(ring_setup['left'] - ring_setup['thickness'] + border_thickness)+'px';
    inner.style.top = Number(ring_setup['top'] - ring_setup['thickness'] + border_thickness)+'px';
    inner.style.width = Number(ring_setup['width'] + 2*border_thickness)+'px';
    inner.style.height = Number(ring_setup['height'] + 2*border_thickness)+'px';
    inner.style.borderWidth = Number(ring_setup['thickness'] - 2*border_thickness)+'px';

    document.getElementById('task').appendChild(lower_div);
    document.getElementById('task').appendChild(outer);
    document.getElementById('task').appendChild(inner);
    document.getElementById('task').appendChild(upper_div);

    task_elements = {'lower': lower_div, 'upper': upper_div, 'setup': setup, 'outer': outer, 'inner': inner, 'border': border_thickness};

    document.getElementById('task').addEventListener("touchstart", scalingHandleDown, false);
    document.getElementById('task').addEventListener("touchmove", scalingHandleMove, false);
    document.getElementById('task').addEventListener("touchend", scalingHandleUp, false);

    task_started = false;
    inside_div = false;

    radius = setup['r'];
    target_radius = ring_setup['r']
    thickness = ring_setup['thickness'];

    trial = {
        'id': gvar.client_id,
        ////////////////////////////////////////////////////////
        'orientation': (window.screen.width>window.screen.height?'Landscape':'Portrait'),
        'grip': gvar.grip,
        'centerx': setup['cx'],
        'centery': setup['cy'],
        'startradius': setup['r'],
        'targetradius': ring_setup['r'],
        'thickness': ring_setup['thickness'],
        'completiontime': null,
        'numberoftry': 0
    }
}