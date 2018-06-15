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


def import_muc_ods(path, port=None):
  # Connect MongoDB
  client = mongohelp.connect_mongodb(port)
  db = mongohelp.get_db(client)

  data_collection = mongohelp.get_ods_collection(db)
  ods_collection = mongohelp.get_data_collection(db)

  # Load Json Data
  with open(os.path.join(path, 'dataset_proc.csv')) as file:
      reader = csv.DictReader(file, delimiter='\t')
      for row in reader:
          with open(os.path.join(path, row['dataset'])) as file:
              data = json.load(file)

              recordTemplate = mongohelp.RecordTemplate(name=data["name"],
                                                        description=data["description"],
                                                        url_csv=data["url_csv"],
                                                        license_id=data["license_id"],
                                                        license_title=data["license_title"],
                                                        license_url=data["license_url"],
                                                        author=data["author"],
                                                        author_email=data["author_email"],
                                                        maintainer=data["maintainer"],
                                                        maintainer_email=data["maintainer_email"],
                                                        metadata_created=data["metadata_created"],
                                                        metadata_modified=data["metadata_modified"])

              locationMapping = mongohelp.LocationRecordMapping(latitude=row['latitude'], longitude=row['longitude'], district=row['district'])
              valueMapping = mongohelp.ValueRecordMapping(value_description=row['value_description'], value=row['key_value'])

              ods_id = mongohelp.insert_ods_header(db, recordTemplate)
              mongohelp.insert_dataset(db, ods_id, locationMapping, valueMapping, data['data'])
              #print "data ", data['name']