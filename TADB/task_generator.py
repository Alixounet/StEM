#  task_generator.py
#  StEM: Storyboard-Based Empirical
#        Modeling of Touch Interface
#        Performance
# 
#  2017-02-01
# 
#  Code by: Alix Goguey, www.alixgoguey.fr
# 
#  Project Authors: Alix Goguey, Gery Casiez, Andy Cockburn and Carl Gutwin
#                   http://ns.inria.fr/mjolnir/StEM
# 
#  License: GNU General Public License v3.0
#    See https://github.com/Alixounet/StEM/blob/master/LICENSE
#

import sys, os, re
import numpy, math, datetime

# import random
# random.seed(0)
# random.random()

def print_usage():
    print("Arguments: [output]")
    print("Usage:   python task_generator.py [output]")
    sys.exit()

# if len(sys.argv) < 2:
#     print_usage()
if len(sys.argv) > 2:
    print_usage()

# Format folder path
filename = 'tasks.txt'
if len(sys.argv) == 2:
    filename = sys.argv[1]

def getRange(min_val, max_val, nb_val):
    if not min_val < max_val:
        print("Problem of arguments (min, max) in function getRange(...)")
        aux = max_val
        max_val = min_val
        min_val = aux
        #sys.exit()
    if nb_val < 2:
        nb_val = 2

    step = float(max_val-min_val)/float(nb_val-1)
    return numpy.arange(min_val,max_val+step,step).tolist()

x_offset = 2
y_offset = 2
r_token = 10

output = open(filename,'w')
output.write("//\n")
output.write("// Tasks file generated with the 'task_generator.py' python script\n")
output.write("// Generated on "+str(datetime.datetime.now())+"\n")
output.write("//\n")
output.write("\n")



output.write("// Tap\n") # {"type": "tap", "cx":25, "cy":25, "r":10}
output.write("// Arguments:\n")
output.write("//      - cx: center x-coordinates of the circular target (in percentage of the viewport width)\n")
output.write("//      - cy: center y-coordinates of the circular target (in percentage of the viewport height)\n")
output.write("//      - r: radius of the circular target (in percentage of the viewport min(width/height))\n")
entry = {'type': 'tap'}
for r in getRange(5, 15, 3):
    for cx in getRange(r+x_offset, (100-r)-x_offset, 5):
        for cy in getRange(r+y_offset, (100-r)-y_offset, 5):
            entry['cx'] = cx
            entry['cy'] = cy
            entry['r'] = r
            output.write(str(entry).replace("'",'"')+"\n")
output.write("\n")



output.write("// Pointing\n") # {"type": "pointing", "scx":11, "scy":11, "sr":10, "ecx":89, "ecy":89, "er":5}
output.write("// Arguments:\n")
output.write("//      - scx: center x-coordinates of the circular start area (in percentage of the viewport width)\n")
output.write("//      - scy: center y-coordinates of the circular start area (in percentage of the viewport height)\n")
output.write("//      - sr: radius of the circular start area (in percentage of the viewport min(width/height))\n")
output.write("//      - ecx: center x-coordinates of the circular target (in percentage of the viewport width)\n")
output.write("//      - ecy: center y-coordinates of the circular target (in percentage of the viewport height)\n")
output.write("//      - er: radius of the circular target (in percentage of the viewport min(width/height))\n")
entry = {'type': 'pointing'}
for er in getRange(5, 15, 3):
    for task_offset in getRange(0, 50, 2):
        mincx = er + x_offset + task_offset
        maxcx = (100 - er) - x_offset - task_offset
        mincy = er + y_offset + task_offset
        maxcy = (100 - er) - y_offset - task_offset
        for ecx in getRange(mincx, maxcx, 5):
            for ecy in getRange(mincy, maxcy, 5):
                if (ecx in [mincx, maxcx]) or (ecy in [mincy, maxcy]):
                    scx = 100-ecx
                    if ecx == maxcx: #scx < 50:
                        scx = scx - er + r_token
                    else:
                        scx = scx + er - r_token
                    scy = 100-ecy
                    if ecy == maxcy: #scy < 50:
                        scy = scy - er + r_token
                    else:
                        scy = scy + er - r_token
                    entry['scx'] = scx
                    entry['scy'] = scy
                    entry['sr'] = r_token
                    entry['ecx'] = ecx
                    entry['ecy'] = ecy
                    entry['er'] = er
                    output.write(str(entry).replace("'",'"')+"\n")
output.write("\n")



output.write("// Drag\n") # {"type": "drag", "scx":11, "scy":11, "sr":10, "ecx":81, "ecy":81, "er":13}
output.write("// Arguments:\n")
output.write("//      - scx: center x-coordinates of the circular token (in percentage of the viewport width)\n")
output.write("//      - scy: center y-coordinates of the circular token (in percentage of the viewport height)\n")
output.write("//      - sr: radius of the circular token (in percentage of the viewport min(width/height))\n")
output.write("//      - ecx: center x-coordinates of the circular target (in percentage of the viewport width)\n")
output.write("//      - ecy: center y-coordinates of the circular target (in percentage of the viewport height)\n")
output.write("//      - er: radius of the circular target (in percentage of the viewport min(width/height))\n")
entry = {'type': 'drag'}
for er in [r_token+2.5,r_token+5,r_token+7.5]:
    for task_offset in getRange(0, 50, 2):
        mincx = er + x_offset + task_offset
        maxcx = (100 - er) - x_offset - task_offset
        mincy = er + y_offset + task_offset
        maxcy = (100 - er) - y_offset - task_offset
        for ecx in getRange(mincx, maxcx, 5):
            for ecy in getRange(mincy, maxcy, 5):
                if (ecx in [mincx, maxcx]) or (ecy in [mincy, maxcy]):
                    scx = 100-ecx
                    if ecx == maxcx: #scx < 50:
                        scx = scx - er + r_token
                    else:
                        scx = scx + er - r_token
                    scy = 100-ecy
                    if ecy == maxcy: #scy < 50:
                        scy = scy - er + r_token
                    else:
                        scy = scy + er - r_token
                    entry['scx'] = scx
                    entry['scy'] = scy
                    entry['sr'] = r_token
                    entry['ecx'] = ecx
                    entry['ecy'] = ecy
                    entry['er'] = er
                    output.write(str(entry).replace("'",'"')+"\n")
output.write("\n")



output.write("// Rotation\n") # {"type": "rotation", "cx":50, "cy":50, "r":40, "angle":-90, "aperture":20}
output.write("// Arguments:\n")
output.write("//      - cx: center x-coordinates of the circular token (in percentage of the viewport width)\n")
output.write("//      - cy: center y-coordinates of the circular token (in percentage of the viewport height)\n")
output.write("//      - r: radius of the circular token (in percentage of the viewport min(width/height))\n")
output.write("//      - angle: initial rotation of the token (in degrees)\n")
output.write("//      - aperture: aperture of the target (in degrees)\n")
entry = {'type': 'rotation'}
entry['cx'] = 50
entry['cy'] = 50
entry['r'] = 40
for angle in getRange(-135, 135, 7):
    if angle != 0:
        for aperture in getRange(5,25,5):
            entry['angle'] = angle
            entry['aperture'] = aperture
            output.write(str(entry).replace("'",'"')+"\n")
output.write("\n")



output.write("// Scaling\n") # {"type": "scaling", "cx":50, "cy":50, "sr":20, "er":40, "thickness":10}
output.write("// Arguments:\n")
output.write("//      - cx: center x-coordinates of the circular token (in percentage of the viewport width)\n")
output.write("//      - cy: center y-coordinates of the circular token (in percentage of the viewport height)\n")
output.write("//      - sr: radius of the circular token (in percentage of the viewport min(width/height))\n")
output.write("//      - er: radius of the ring target area (in percentage of the viewport min(width/height))\n")
output.write("//      - thickness: width of the ring (in percentage of the viewport min(width/height))\n")
entry = {'type': 'scaling'}
entry['cx'] = 50
entry['cy'] = 50
for thickness in getRange(5, 12.5, 4):
    minring = 15 + thickness*0.5
    maxring = 48 - thickness*0.5
    for er in getRange(minring, maxring, 2):
        for sr in getRange(minring, maxring, 5):
            if (sr < er - thickness*0.5) or (sr > er + thickness*0.5):
                entry['sr'] = sr
                entry['er'] = er
                entry['thickness'] = thickness
                output.write(str(entry).replace("'",'"')+"\n")
output.write("\n")



output.write("// Swipe\n") # {'type': 'swipe', 'scx':11, 'scy':50, 'r':10, 'ecx':89, 'ecy':85}
output.write("// Arguments:\n")
output.write("//      - scx: center x-coordinates of the circular token (in percentage of the viewport width)\n")
output.write("//      - scy: center y-coordinates of the circular token (in percentage of the viewport height)\n")
output.write("//      - r: radius of the circular token (in percentage of the viewport min(width/height))\n")
output.write("//      - ecx: x-coordinates of the end swipe line (in percentage of the viewport width)\n")
output.write("//      - ecy: y-coordinates of the end swipe line (in percentage of the viewport height)\n")
entry = {'type': 'swipe'}
entry['r'] = 10
mincx = entry['r'] + x_offset
maxcx = (100 - entry['r']) - x_offset
mincy = entry['r'] + y_offset
maxcy = (100 - entry['r']) - y_offset
cxs = getRange(mincx,maxcx,3)
cys = getRange(mincy,maxcy,3)
for cy in cys:
    scx = cxs[0]
    for ecx in cxs[1:]:
        entry['scx'] = scx
        entry['scy'] = cy
        entry['ecx'] = ecx
        entry['ecy'] = cy
        output.write(str(entry).replace("'",'"')+"\n")
    scx = cxs[-1]
    for ecx in cxs[:-1]:
        entry['scx'] = scx
        entry['scy'] = cy
        entry['ecx'] = ecx
        entry['ecy'] = cy
        output.write(str(entry).replace("'",'"')+"\n")
for cx in cxs:
    scy = cys[0]
    for ecy in cys[1:]:
        entry['scx'] = cx
        entry['scy'] = scy
        entry['ecx'] = cx
        entry['ecy'] = ecy
        output.write(str(entry).replace("'",'"')+"\n")
    scy = cys[-1]
    for ecy in cys[:-1]:
        entry['scx'] = cx
        entry['scy'] = scy
        entry['ecx'] = cx
        entry['ecy'] = ecy
        output.write(str(entry).replace("'",'"')+"\n")
output.write("\n")



output.close()