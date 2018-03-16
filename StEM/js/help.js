/* help.js
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

gvar.help_on = false;

function toogle_help() {
    if (gvar.help_on) {
        $("#help").animate({
            "left":"100%"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    } else {
        $("#help").animate({
            //"left": ($("#main").width()-$("#help").width())+"px"
            "left": ($("#help").width()+20)+"px"
        }, {
            duration: 1000,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            }
        });
    }
    gvar.help_on = !gvar.help_on;
}
gvar.toogle_help = toogle_help;

function resize_help() {
    if (!gvar.help_on) {
        $("#help").css({"left":"100%"});
    } else {
        //$("#help").css({"left": ($("#main").width()-$("#help").width())+"px"});
        $("#help").css({"left": ($("#help").width()+20)+"px"});
    }
}
gvar.resize_help = resize_help;

function set_help() {
    document.getElementById("help").addEventListener("click", function(evt) {
        gvar.toogle_help();
    });
}
gvar.set_help = set_help;