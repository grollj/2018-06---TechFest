#!/usr/bin/env python

from pymongo import MongoClient
from collections import namedtuple

DEFAULT_ADDRESS = 'localhost'
DEFAULT_PORT = 27017

DEFAULT_DB = 'aparata_db'
DEFAULT_ODS_COLLECTION = 'open_datasets'
DEFAULT_DATA_COLLECTION = 'open_datasets_data'

RecordTemplate = namedtuple('Record',
                            ['name',
                             'description',
                             'url_csv',
                             'license_id',
                             'license_title',
                             'license_url',
                             'author',
                             'author_email',
                             'maintainer',
                             'maintainer_email',
                             'metadata_created',
                             'metadata_modified'])


LocationRecordMapping = namedtuple('LocationRecordMapping', 'latitude, longitude, district')
ValueRecordMapping = namedtuple('ValueMapping', 'value_description, value')


def connect_mongodb(port=None):
    if port:
        client = MongoClient(DEFAULT_ADDRESS, port)
    else:
        client = MongoClient(DEFAULT_ADDRESS, DEFAULT_PORT)

    return client


def reset_db(client):
    client[DEFAULT_DB].drop_collection('open_datasets')
    client[DEFAULT_DB].drop_collection('open_datasets_data')


def get_db(client):
    return client[DEFAULT_DB]


def get_ods_collection(db):
    return db[DEFAULT_ODS_COLLECTION]


def get_data_collection(db):
    return db[DEFAULT_DATA_COLLECTION]


def insert_ods_header(db, recordTemplate):
    tmp = recordTemplate._asdict()
    return get_ods_collection(db).insert_one(tmp).inserted_id

def tryParse(value):
    try:
        return float(value)
    except ValueError:
        return value

def insert_dataset(db, ods_id, locationRecordMapping, valueRecordMapping, data):

    for blob in data:
        transformed_blob = { "ods_ref_id": ods_id }

        # Transform Location Data
        for target, original in locationRecordMapping._asdict().iteritems():
            value = blob.pop(original, None)
            if value:
                transformed_blob[target] = tryParse(value)

        # Transform Key Value Data
        for target, original in valueRecordMapping._asdict().iteritems():
            value = blob.pop(original, None)
            if value:
                transformed_blob[target] = tryParse(value)

        # Copy remaining values
        transformed_blob.update(blob)
        get_data_collection(db).insert_one(transformed_blob).inserted_id

    # The operation returns an InsertOneResult object, which includes an attribute inserted_id that contains the _id of the inserted document. 
    # Access the inserted_id attribute: result.inserted_id
