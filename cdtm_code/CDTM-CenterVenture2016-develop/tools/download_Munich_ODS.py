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

# DON'T CHANGE
MUC_ODS_URL = 'https://www.opengov-muenchen.de/api/action/'


def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc:  # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise


def make_datastring(id_string):
    return urllib.quote(json.dumps({'id': id_string}))


def make_request(req, id_string):
    response = urllib2.urlopen(MUC_ODS_URL + req, make_datastring(id_string))
    assert response.code == 200

    return response


def get_results(req, id_string=""):
    res = make_request(req, id_string)
    response_dict = json.loads(res.read())
    assert response_dict['success'] is True
    return response_dict['result']


def create_group_folders(base_path):
    groups = get_results("group_list")
    for group in groups:
        mkdir_p(os.path.join(base_path, group))

    return groups


def get_group_packages(group):
    return get_results("group_show", id_string=group)


def get_package(group):
    return get_results("package_show", id_string=group)


def write_json(data, json_file, style=""):
    with open(json_file, "w") as f:
        if style == "pretty":
            f.write(json.dumps(data, indent=4, sort_keys=False, encoding="utf-8"))
        else:
            f.write(json.dumps(data))


def parse_csv_from_url(url):
    csv_rows = []
    response = urllib2.urlopen(url)
    data = response.read()
    try:
        dialect = csv.Sniffer().sniff(data[:1024])
        print "Dialect Found: ", dialect.delimiter
        reader = csv.DictReader(data.splitlines(), delimiter=dialect.delimiter)
        title = reader.fieldnames
        for row in reader:
            csv_rows.extend([{title[i]:row[title[i]] for i in range(len(title))}])

        return csv_rows
    except:
        print "fuck up..."
        return None


def download_muc_ods(path):
    # 1) Get all group_names and create subfolders to store json files
    groups = create_group_folders(path)

    # # 2) Iterate over all groups, and packages, and convert packages to json format with meta data
    for group in groups:
        for package in get_group_packages(group)["packages"]:
            package_info = get_package(package["name"])
            # pprint.pprint(package_info)


            data = package_info["resources"]

            for blob in data:
                if blob["format"] == "CSV":
                    csv_data = parse_csv_from_url(blob["url"])
                    if csv_data is not None:
                        info =  {
                                    'name': package_info['title'],
                                    'description': blob['description'],
                                    'url_csv': blob["url"],
                                    'license_id': package_info['license_id'],
                                    'license_title': package_info['license_title'],
                                    'license_url': package_info['license_url'],
                                    'author': package_info['author'],
                                    'author_email': package_info['author_email'],
                                    'maintainer': package_info['maintainer'],
                                    'maintainer_email': package_info['maintainer_email'],
                                    'metadata_created': package_info['metadata_created'],
                                    'metadata_modified': package_info['metadata_modified'],
                                    'data': None
                                }

                        info['data'] = csv_data
                        json_file = os.path.join(path, group, package["name"] + ".json")
                        print json_file
                        write_json(info, json_file, "pretty")

                        break # dont look further...yeaah hacky TODO