#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA=$DIR/../data
cd $DATA
echo 'Running from' $DATA
echo 'Downloading Foursquare ODS'
perl $DIR/gdown.pl https://docs.google.com/uc\?id\=0B-xsys_ULjoqRjl0SENEdlZaa0k\&export\=download $DATA/foursquare.zip
mkdir -p foursquare && cd foursquare && unzip ../foursquare.zip
echo 'done.... byeeeeeeee!'