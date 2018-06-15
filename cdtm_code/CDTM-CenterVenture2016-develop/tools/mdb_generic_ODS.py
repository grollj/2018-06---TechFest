#### https://www.opengov-muenchen.de/api/action/package_create

#!/usr/bin/env python
import urllib2
import urllib
import json
import csv
import pprint
import argparse
import errno
import os

import io

import mongodb_helpers as mongohelp
import helpers as helpers


def valid_number_in_range(min_value, max_value):
    while True:
        try:
            inp = int(raw_input('Pick a number in range ' + str(min_value) + '-' + str(max_value) + ": "))
        except ValueError: # just catch the exceptions you know!
            print 'That\'s not a number!'
        else:
            if min_value <= inp <= max_value: # this is faster
                break
            else:
                print 'Out of range. Try again'

    return inp


def selector(target, rawlist):
    num = range(len(rawlist))
    pair_list = zip(num, rawlist) + [(num[-1]+1, "UNDEFINED")]

    print "Select original value to be assigned to: ", helpers.bc.FAIL,  target, helpers.bc.ENDC
    for pair in pair_list:
        print pair[0], ":", pair[1]

    selection = valid_number_in_range(num[0], len(pair_list) - 1)
    return pair_list[selection][1]


def config_LocationMapping(rawDict):
    possibleOptions = rawDict["data"][0].keys()

    print helpers.bc.OKGREEN, "Setting Up Location Record Mapping...", helpers.bc.ENDC
    locMapDict = {}
    for field in mongohelp.LocationRecordMapping._fields:
        locMapDict[field] = selector(field, possibleOptions)
    return mongohelp.LocationRecordMapping(**locMapDict)


def config_ValueMapping(rawDict):
    possibleOptions = rawDict["data"][0].keys()

    print helpers.bc.OKGREEN, "Setting Up Value Record Mapping...", helpers.bc.ENDC
    valueMapDict = {}
    for field in mongohelp.ValueRecordMapping._fields:
        valueMapDict[field] = selector(field, possibleOptions)
    return mongohelp.ValueRecordMapping(**valueMapDict)


def import_ods(path, port=None):
    # Load Json Data
    with open(os.path.join(path, "cfg.json")) as file:
        cfg = json.load(file)

    # Mappings and Record Data Template
    recordTemplate = mongohelp.RecordTemplate(**cfg['recordTemplate'])
    locationMapping = mongohelp.LocationRecordMapping(**cfg['locationMapping'])
    valueMapping = mongohelp.ValueRecordMapping(**cfg['valueMapping'])


    with open(os.path.join(path, "ods.csv")) as file:
        reader = csv.DictReader(file, delimiter='\t')
        title = reader.fieldnames
        # print title
        csv_rows = []
        for row in reader:
            csv_rows.extend([{title[i]:row[title[i]] for i in range(len(title))}])


    # Connect DB
    client = mongohelp.connect_mongodb(port)
    db = mongohelp.get_db(client)

    data_collection = mongohelp.get_ods_collection(db)
    ods_collection = mongohelp.get_data_collection(db)

    ods_id = mongohelp.insert_ods_header(db, recordTemplate)
    mongohelp.insert_dataset(db, ods_id, locationMapping, valueMapping, csv_rows)