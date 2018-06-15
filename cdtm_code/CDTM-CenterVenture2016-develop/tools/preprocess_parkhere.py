#!/usr/bin/env python
import argparse
import os
import csv
import json
from progressbar import ProgressBar
from dateutil.parser import parse


def parse_timestamp(timestamp):
    return parse(timestamp, fuzzy=True)


# Command-Line Arguments
parser = argparse.ArgumentParser(description='Munich OpenData-Set Downloader')
parser.add_argument('--dataset_dir', '-d', type=str,
                    help='Folder of parkhere dataset', required=True)

args = parser.parse_args()
with open(os.path.join(args.dataset_dir, "dataset_raw.csv")) as file:
    reader = csv.reader(file, delimiter='\t')
    data = list(reader)

data[1:] = [[x[0], parse_timestamp(x[1])] for x in data[1:]]
with open(os.path.join(args.dataset_dir, "ods.csv"), 'w') as file:
    writer = csv.writer(file, delimiter='\t')
    writer.writerows(data)

# 3 Step: Save a pre-hacked config file straight out of python script... ;D
config = {
    "valueMapping":
    {
        "value_description": "Parkplatz Auslastung",
        "value": "auslastung"
    },
    "locationMapping":
    {
        "latitude": "-1",
        "longitude": "-1",
        "district": "-1"
    },
    "recordTemplate":
    {
        "name": "Park-Here Aidenbachstrassen Datensatz",
        "description": "Auslastung der Parkplaetze in der Aidenbachstrasse Muenchen.",
        "maintainer_email": "N/A",
        "maintainer": "N/A",
        "url_csv": "N/A",
        "metadata_created": "N/A",
        "metadata_modified": "N/A",
        "author": "ParkHere AG",
        "author_email": "N/A",
        "license_title": "N/A",
        "license_url": "N/A",
        "license_id": "N/A"
    }
}

with open(os.path.join(args.dataset_dir, "cfg.json"), 'w') as out:
    json.dump(config, out, indent=4)