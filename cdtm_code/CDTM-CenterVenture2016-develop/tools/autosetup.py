#!/usr/bin/env python
import argparse
import os

import mongodb_helpers as mongohelp
import download_Munich_ODS as muc_ods_download
import mdb_Munich_ODS as muc_ods_import
import mdb_generic_ODS as muc_generic_import

# Command-Line Arguments
parser = argparse.ArgumentParser(description='ODS Autosetup')
parser.add_argument('--data', '-d', type=str, help='data folder', required=True)
parser.add_argument('--port', '-p', type=int, help='port of mongodb', required=True)

args = parser.parse_args()

# reset database
client = mongohelp.connect_mongodb(args.port)
mongohelp.reset_db(client)

# download munich
muc_ods_download.download_muc_ods(os.path.join(args.data, "munich-opendata"))
# post munich
muc_ods_import.import_muc_ods(os.path.join(args.data, "munich-opendata"), args.port)

# post lmu-wohnmiete
muc_generic_import.import_ods(os.path.join(args.data, "lmu-munich-mietspiegel2003"), args.port)

# post preproc foursquare
muc_generic_import.import_ods(os.path.join(args.data, "foursquare"), args.port)

# post parkhere foursquare
muc_generic_import.import_ods(os.path.join(args.data, "park_here_aidenbachstr"), args.port)