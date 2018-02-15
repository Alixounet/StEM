/* rotation.js
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
var angle, aperture;
var dx, dy;

function startRotationTask() {
    start_date = new Date();
}

function endRotationTask(evt) {
    end_date = new Date();
    trial['completiontime'] = end_date - start_date;
    trial['endangle'] = ((angle%360)+360)%360;

    document.getElementById("newtask").innerHTML = gvar.textPreviousTrial(trial['completiontime']);

    document.getElementById("task").removeEventListener('touchstart', rotationHandleDown);
    document.getElementById("task").removeEventListener('touchmove', rotationHandleMove);
    document.getElementById("task").removeEventListener('touchend', rotationHandleUp);

    task_elements['div'].remove();
    task_elements['tick'].remove();
    task_elements['laperture'].remove();
    task_elements['raperture'].remove();
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

    // gvar.socket.emit('rotationtrial', trial);
    gvar.emitData('rotationtrial', trial);
    trial = null;
}

function isTickInside() {
    var positive_angle = ((angle%360)+360)%360;
    return (positive_angle < aperture*0.5) || (positive_angle > 360-aperture*0.5);
}

// function falseRotation(evt) {
//     if (task_started) {
//         trial['numberoftry'] += 1;
//     }
// }

function rotationHandleDown(evt) {
    $("#instructions").hide();
    if (evt.touches.length > 1) {
        dx = evt.touches[0].clientX - evt.touches[1].clientX;
        dy = evt.touches[0].clientY - evt.touches[1].clientY;
        if (!inside_div) {
            trial['numberoftry'] += 1;
        }
        if (!task_started) {
            startRotationTask();
            task_started = true;
            inside_div = true;
        }
    }
}

function rotationHandleMove(evt) {
    if (evt.touches.length > 1) {
        // cos0=<u|v>/||u||.||v||
        var dx_aux = evt.touches[0].clientX - evt.touches[1].clientX;
        var dy_aux = evt.touches[0].clientY - evt.touches[1].clientY;
        var cos_theta = gvar.scalarProduct(dx_aux,dy_aux,dx,dy)/
                        (Math.sqrt(gvar.scalarProduct(dx_aux,dy_aux,dx_aux,dy_aux))*
                         Math.sqrt(gvar.scalarProduct(dx,dy,dx,dy)))
        var sign = (dx_aux*dy-dy_aux*dx<0?-1.0:1.0);
        var theta = -sign*Math.acos(cos_theta)*180.0/Math.PI;

        if (!isNaN(theta)) {
            angle += theta;
        }

        var transform = 'rotate('+Number(angle-90)+'deg)';
        $('#tick').css({
            'transform': transform,
            '-ms-transform': transform,
            '-webkit-transform': transform
        })

        dx = dx_aux;
        dy = dy_aux;

        if (isTickInside()) {
            if (task_elements['div'].className != 'active') {
                task_elements['div'].className = 'active';
                task_elements['tick'].className = 'line linetick_active';
                task_elements['laperture'].className = 'line lineaperture_active';
                task_elements['raperture'].className = 'line lineaperture_active';
            }
        } else {
            if (task_elements['div'].className == 'active') {
                task_elements['div'].className = 'movable';
                task_elements['tick'].className = 'line linetick_inactive';
                task_elements['laperture'].className = 'line lineaperture_inactive';
                task_elements['raperture'].className = 'line lineaperture_inactive';
            }
        }
    }
}

function rotationHandleUp(evt) {
    if ((evt.touches.length < 2) && task_started) {
        if (task_elements['div'].className == 'active') {
            endRotationTask();
            task_started = false;
        }
        inside_div = false;
    }
}

function setRotationTask(data) {
    training = data['training'];
    var div = document.createElement('div');
    div.id = 'rotation';
    div.className = 'movable';
    var setup = gvar.getSetupInPixel(data['cx'], data['cy'], data['r'], null);
    div.style.left = Number(setup['left']-gvar.borderthickness)+'px';
    div.style.top = Number(setup['top']-gvar.borderthickness)+'px';
    div.style.width = setup['width']+'px';
    div.style.height = setup['height']+'px';
    div.style.borderWidth = gvar.borderthickness+'px';

    document.getElementById('task').appendChild(div);

    angle = data['angle'];
    aperture = data['aperture'];

    var tick = document.createElement('div');
    tick.id = 'tick';
    tick.className = 'line linetick_inactive';
    tick.style.left = setup['cx']+'px';
    tick.style.top = Number(setup['cy']-0.5*gvar.borderthickness)+'px';
    tick.style.height = gvar.borderthickness+'px';
    tick.style.width = Number(0.5*setup['width'])+'px';
    document.getElementById('task').appendChild(tick);

    var transform = 'rotate('+Number(angle-90)+'deg)';
    $('#tick').css({
        'transform': transform,
        '-ms-transform': transform,
        '-webkit-transform': transform
    })

    var l_aperture = document.createElement('div');
    l_aperture.id = 'l_aperture';
    l_aperture.className = 'line lineaperture_inactive';
    l_aperture.style.left = setup['cx']+'px';
    l_aperture.style.top = Number(setup['cy']-0.5*gvar.borderthickness)+'px';
    l_aperture.style.height = gvar.borderthickness+'px';
    l_aperture.style.width = Number(0.5*setup['width'])+'px';
    document.getElementById('task').appendChild(l_aperture);

    transform = 'rotate('+Number(-90+0.5*aperture)+'deg)';
    $('#l_aperture').css({
        'transform': transform,
        '-ms-transform': transform,
        '-webkit-transform': transform
    })

    var r_aperture = document.createElement('div');
    r_aperture.id = 'r_aperture';
    r_aperture.className = 'line lineaperture_inactive';
    r_aperture.style.left = setup['cx']+'px';
    r_aperture.style.top = Number(setup['cy']-0.5*gvar.borderthickness)+'px';
    r_aperture.style.height = gvar.borderthickness+'px';
    r_aperture.style.width = Number(0.5*setup['width'])+'px';
    document.getElementById('task').appendChild(r_aperture);

    transform = 'rotate('+Number(-90-0.5*aperture)+'deg)';
    $('#r_aperture').css({
        'transform': transform,
        '-ms-transform': transform,
        '-webkit-transform': transform
    })

    task_elements = {'div': div, 'tick': tick, 'laperture': l_aperture, 'raperture': r_aperture};

    document.getElementById('task').addEventListener("touchstart", rotationHandleDown, false);
    document.getElementById('task').addEventListener("touchmove", rotationHandleMove, false);
    document.getElementById('task').addEventListener("touchend", rotationHandleUp, false);

    task_started = false;
    inside_div = false;

    trial = {
        'id': gvar.client_id,
        ////////////////////////////////////////////////////////
        'orientation': (window.screen.width>window.screen.height?'Landscape':'Portrait'),
        'grip': gvar.grip,
        'centerx': setup['cx'],
        'centery': setup['cy'],
        'radius': setup['r'],
        'angle': angle,
        'aperture': aperture,
        'completiontime': null,
        'numberoftry': 0
    }
}