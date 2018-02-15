#  set_diag.py
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
import mysql.connector
from mysql.connector import MySQLConnection, Error
import math
import json

def print_usage():
    print "Missing argument"
    print "Usage:   python set_diag.py"
    sys.exit()

general_path = os.path.dirname(os.path.abspath(sys.argv[0]))+"/"


manual_associations = None
manual_output = None
def getDevices(general_path):
    global manual_associations, manual_output
    manual_associations = {}
    for row in open(general_path+'manual_associations.txt','r'):
        model_requested, model_caracteristics = row.rstrip().split('--')
        manual_associations[model_requested] = eval(model_caracteristics)
    manual_output = open(general_path+'manual_associations.txt','w')
    for key in manual_associations:
        manual_output.write(key + "--" + str(manual_associations[key]) + "\n")

def matchDevice(general_path,device_model, pixw, pixh):
    global manual_associations, manual_output
    if manual_associations is None:
        getDevices(general_path)

    model = " ".join(device_model.split('--')[:2]).lower()

    if model in manual_associations:
        return manual_associations[model]

    print device_model
    print "Enter characteristics of", model
    print "   W x H: {} x {}".format(pixw, pixh)

    cmd = raw_input("  1 - W and H\n  2 - Diagonal\n  3 - Discard\nChoice? ")
    if cmd == '1':
        width = ''
        while width == '':
            width = raw_input("Width in mm: ")
        height = ''
        while height == '':
            height = raw_input("Height in mm: ")

        width = float(width)
        height = float(height)
        manual_associations[model] = {}     
        manual_associations[model]['w'] = width
        manual_associations[model]['h'] = height
        manual_associations[model]['d'] = math.sqrt(height*height+width*width)

        manual_output.write(model + "," + str(manual_associations[model]) + "\n")
        return manual_associations[model]

    elif cmd == '2':
        diag = ''
        while diag == '':
            diag = raw_input("Diagonal in mm: ")

        diag = float(diag)
        manual_associations[model] = {}
        manual_associations[model]['w'] = pixw*float(diag)/math.sqrt(pixw*pixw+pixh*pixh)
        manual_associations[model]['h'] = pixh*float(diag)/math.sqrt(pixw*pixw+pixh*pixh)
        manual_associations[model]['d'] = diag

        manual_output.write(model + "--" + str(manual_associations[model]) + "\n")
        return manual_associations[model]

    elif cmd == '3':
        manual_output.write(model + "--" + "None" + "\n")
        return None
    return None

def connect():
    try:
        conn = mysql.connector.connect(host='localhost',
                                       port=3306,
                                       database='fitts',
                                       user='fittspython',
                                       password='fitts')
        if conn.is_connected():
            print('Connected to the Fitts database')
    except Error as e:
        print(e)
        return None
    finally:
        return conn


def query_with_fetchone(conn, query, multi):
    rows = []
    if conn is None:
        print "Can't fulfil the query: connection is not established"
        return rows
    try:
        cursor = conn.cursor()
        cursor.execute(query,multi=multi)
        row = cursor.fetchone()
        while row is not None:
            rows.append(row)
            row = cursor.fetchone()
        conn.commit()
    except Error as e:
        print(e)
    finally:
        cursor.close()
        return rows

def create_table_diagonal_query():
    query  = " CREATE TABLE IF NOT EXISTS `fitts`.`Diagonals` (                                         "
    query += "     `User` int(11) NOT NULL,                                                             "
    query += "     `RatioMmPerPixW` FLOAT NOT NULL,                                                     "
    query += "     `RatioMmPerPixH` FLOAT NOT NULL,                                                     "
    query += "     `RealDiagonal` FLOAT NOT NULL,                                                     "
    query += "     `Diagonal` FLOAT NOT NULL                                                            "
    query += " ) ENGINE=InnoDB DEFAULT CHARSET=latin1;                                                  "
    query += " ALTER TABLE `fitts`.`Diagonals` ADD PRIMARY KEY (`User`);                                "
    query += " ALTER TABLE `fitts`.`Diagonals` ADD FOREIGN KEY (`User`) REFERENCES `fitts`.Users(`ID`); "
    return query

def insert_diagonal_query(u_id, ratio_w, ratio_h, real_diag, diagonal):
    query  = " INSERT INTO `Diagonals`(         "
    query += "     `User`, `RatioMmPerPixW`,    "
    query += "     `RatioMmPerPixH`,    "
    query += "     `RealDiagonal`, `Diagonal` "
    query += " ) VALUES (                       "
    query += "      "+str(u_id)+",              "
    query += "      "+str(ratio_w)+",           "
    query += "      "+str(ratio_h)+",           "
    query += "      "+str(real_diag)+",         "
    query += "      "+str(diagonal)+"           "
    query += " )                                "
    return query

if __name__ == '__main__':
    print "Connecting to DB..."
    conn = connect()
    print "  -> OK"

    query_with_fetchone(conn, create_table_diagonal_query(), True)

    entries = []
    #  0     1      2            3         4            5              6               7        8                   9           
    # `ID`, `Age`, `Handiness`, `Gender`, `Expertise`, `ScreenWidth`, `ScreenHeight`, `Model`, `DevicePixelRatio`, `Eligibility`
    query = "SELECT * FROM Users;"
    rows = query_with_fetchone(conn, query, False)
    print query
    for row in rows:
        short_model = row[7].split('--')[0] + " / " + row[7].split('--')[1]
        device = matchDevice(general_path,row[7],row[5]*row[8],row[6]*row[8])
        if device is not None:
            ratio_w = device['w'] / (row[5] * row[8])
            ratio_h = device['h'] / (row[6] * row[8])
            real_diag = device['d']
            diagonal = round(real_diag/25.4 * 2) / 2 # round to nearest 0.5
            entries.append((row[0], ratio_w, ratio_h, real_diag, diagonal))

    for u_id, ratio_w, ratio_h, real_diag, diagonal in entries:
        query = insert_diagonal_query(u_id, ratio_w, ratio_h, real_diag, diagonal)
        print query
        query_with_fetchone(conn, query, False)

    if conn is not None:
        conn.close()
