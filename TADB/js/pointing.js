/* pointing.js
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
var last_start_date = null;
var end_date = null;
var trial = null;

var training = null;

var task_started = false;

function startDownPointingTask(evt) {
    if (task_elements['end'].className != 'active') {
        last_start_date = new Date();
    }
    if (!task_started) {
        task_started = true;
        $("#instructions").hide();
        start_date = last_start_date;
    }
    // if (task_elements['start'].className == 'active') {
    //     task_elements['start'].className = 'inactive';
    //     task_elements['end'].className = 'active';
    //     start_date = new Date();
    // }
}

function startUpPointingTask(evt) {
    var dx = evt.changedTouches[0].clientX - task_elements['scx'];
    var dy = evt.changedTouches[0].clientY - task_elements['scy'];
    if (task_started && Math.sqrt(gvar.scalarProduct(dx,dy,dx,dy)) < task_elements['r']) {
        task_elements['start'].className = 'inactive';
        task_elements['end'].className = 'active';
    }
}

function falsePointing(evt) {
    $("#instructions").hide();
    if (task_started) {
        trial['numberoftry'] += 1;

        if (task_elements['end'].className == 'active') {
            trial['numberoftrynodrag'] += 1;
        }
    }
}

function endPointingTask(evt) {
    if (task_elements['end'].className == 'active') {
        end_date = new Date();

        trial['completiontime'] = end_date - start_date;
        trial['completiontimenodrag'] = end_date - last_start_date;
        trial['endx'] = evt.changedTouches[0].clientX;
        trial['endy'] = evt.changedTouches[0].clientY;

        document.getElementById("newtask").innerHTML = gvar.textPreviousTrial(trial['completiontime']);

        document.getElementById("pointing_start").removeEventListener("touchstart", startDownPointingTask);
        document.getElementById("pointing_start").removeEventListener("touchend", startUpPointingTask);
        document.getElementById("pointing_end").removeEventListener("touchend", endPointingTask);
        document.getElementById("task").removeEventListener("touchstart", falsePointing);

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

        // gvar.socket.emit('pointingtrial', trial);
        gvar.emitData('pointingtrial', trial);
        trial = null;
    }
}

function setPointingTask(data) {
    training = data['training'];
    task_elements = {};

    var start_div = document.createElement('div');
    start_div.id = 'pointing_start';
    start_div.className = 'active';
    start_div.style.borderWidth = gvar.borderthickness+'px';
    var start_setup = gvar.getSetupInPixel(data['scx'], data['scy'], data['sr'], null);
    start_div.style.left = Number(start_setup['left']-gvar.borderthickness)+'px';
    start_div.style.top = Number(start_setup['top']-gvar.borderthickness)+'px';
    start_div.style.width = start_setup['width']+'px';
    start_div.style.height = start_setup['height']+'px';

    var end_div = document.createElement('div');
    end_div.id = 'pointing_end';
    end_div.className = 'inactive';
    end_div.style.borderWidth = gvar.borderthickness+'px';
    var end_setup = gvar.getSetupInPixel(data['ecx'], data['ecy'], data['er'], null);
    end_div.style.left = Number(end_setup['left']-gvar.borderthickness)+'px';
    end_div.style.top = Number(end_setup['top']-gvar.borderthickness)+'px';
    end_div.style.width = end_setup['width']+'px';
    end_div.style.height = end_setup['height']+'px';

    task_elements = {'start': start_div, 'end': end_div, 'scx':start_setup['cx'], 'scy':start_setup['cy'], 'r':start_setup['r']};

    document.getElementById('task').appendChild(start_div);
    document.getElementById('task').appendChild(end_div);

    document.getElementById("pointing_start").addEventListener("touchstart", startDownPointingTask, false);
    document.getElementById("pointing_start").addEventListener("touchend", startUpPointingTask, false);
    document.getElementById("pointing_end").addEventListener("touchend", endPointingTask, false);
    document.getElementById("task").addEventListener("touchstart", falsePointing, false);

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
        'numberoftry': -1,
        'numberoftrynodrag': 0
    }

    task_started = false;
}