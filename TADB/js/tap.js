/* tap.js
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

function setTapStimuli() {
    $('#tap').hide();
    var timeout = (Math.floor(Math.random() * 2500)+500); // at least 0.5s, at most 3s
    setTimeout(startTapTask, timeout);
}

function startTapTask() {
    $('#tap').show();
    start_date = new Date();
}

function falseTap(evt) {
    $("#instructions").hide();
    if ($('#tap').is(':visible')) {
        trial['numberoftry'] += 1;
    }
}

function endTapTask(evt) {
    end_date = new Date();
    trial['completiontime'] = end_date - start_date;
    trial['endx'] = evt.changedTouches[0].clientX;
    trial['endy'] = evt.changedTouches[0].clientY;

    document.getElementById("newtask").innerHTML = gvar.textPreviousTrial(trial['completiontime']);

    document.getElementById('tap').removeEventListener("touchend", endTapTask);
    document.getElementById("task").removeEventListener("touchstart", falseTap);

    task_elements['div'].remove();
    task_elements = {};
    if (!training) {
        $("#newtask").show();
        $("#grips").show();
    }
    $("#training").show();
    $("#instructions").hide();
    $("#smallinstruction").hide();
    $("#task").hide();

    // gvar.socket.emit('taptrial', trial);
    gvar.emitData('taptrial', trial);
    trial = null;
}

function setTapTask(data) {
    training = data['training'];
    var div = document.createElement('div');
    div.id = 'tap';
    div.className = 'active';
    div.style.borderWidth = gvar.borderthickness+'px';
    var setup = gvar.getSetupInPixel(data['cx'], data['cy'], data['r'], null);
    div.style.left = Number(setup['left']-gvar.borderthickness)+'px';
    div.style.top = Number(setup['top']-gvar.borderthickness)+'px';
    div.style.width = setup['width']+'px';
    div.style.height = setup['height']+'px';
    task_elements = {'div': div};

    document.getElementById('task').appendChild(div);

    document.getElementById('tap').addEventListener("touchend", endTapTask, false);
    document.getElementById("task").addEventListener("touchstart", falseTap, false);

    trial = {
        'id': gvar.client_id,
        ////////////////////////////////////////////////////////
        'orientation': (window.screen.width>window.screen.height?'Landscape':'Portrait'),
        'grip': gvar.grip,
        'centerx': setup['cx'],
        'centery': setup['cy'],
        'radius': setup['r'],
        'completiontime': null,
        'numberoftry': 0
    }

    setTapStimuli();
}