#!/usr/bin/env python
import argparse
import os
import csv
import json
from progressbar import ProgressBar

# Munich    48.140973   11.542951

def valid_location(latitude, longitude):
    if 48.00 <= latitude <= 48.3 and 11.2 <= longitude <= 11.9:
        return True
    else:
        return False


# Command-Line Arguments
parser = argparse.ArgumentParser(description='Munich OpenData-Set Downloader')
parser.add_argument('--dataset_dir', '-d', type=str,
                    help='Folder of foursquare dataset', required=True)

args = parser.parse_args()



# 0: Load All Data into memory (should fit if 4 gig or ram available)
print "Loading POI data into memory... this might take a few seconds"
with open(os.path.join(args.dataset_dir, "dataset_TIST2015_POIs.txt")) as file:
    reader = csv.reader(file, delimiter='\t')
    poi_data = list(reader)

# 1 Step: Filter all Venue IDs by latitude and longitude
print "\tLength of unfiltered list:", len(poi_data)
poi_data = {x[0]: x[1:] for x in poi_data if valid_location(float(x[1]), float(x[2]))}
poi_keys = set(poi_data.keys())
print "\tLength of filtered list:", len(poi_data)

# 2 Step: Make new Checkins dataset based on selected Venue IDs
print "Loading checkin data into memory... this might take a few seconds or minutes"
with open(os.path.join(args.dataset_dir, "dataset_TIST2015_Checkins.txt")) as file, open(os.path.join(args.dataset_dir, "ods.csv"), 'w') as out:

    reader = csv.reader(file, delimiter='\t')
    writer = csv.writer(out, delimiter='\t')
    writer.writerow(["venue_id", "latitude", "longitude", "venue_type", "date"])
    for row in reader:
        if row[1] in poi_keys:
            writer.writerow([row[1]] + poi_data[row[1]][:-1] + [row[2]])

# 3 Step: Save a pre-hacked config file straight out of python script... ;D
config = {
    "valueMapping":
    {
        "value_description": "Venue ID",
        "value": "venue_id"
    },
    "locationMapping":
    {
        "latitude": "latitude",
        "longitude": "longitude",
        "district": "-1"
    },
    "recordTemplate":
    {
        "name": "Foursquare Checked-In Munich-Pruned",
        "description": "Foursquare checked-in data for munich only.",
        "maintainer_email": "N/A",
        "maintainer": "N/A",
        "url_csv": "N/A",
        "metadata_created": "N/A",
        "metadata_modified": "N/A",
        "author": "Yang, Dingqi and Zhang, Daqing and Chen, Longbiao and Qu, Bingqing",
        "author_email": "N/A",
        "license_title": "N/A",
        "license_url": "N/A",
        "license_id": "N/A"
    }
}

with open(os.path.join(args.dataset_dir, "cfg.json"), 'w') as out:
    json.dump(config, out, indent=4)