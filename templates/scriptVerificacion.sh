#!/bin/bash
curl -u $userjira:$passjira -X GET https://asijira.buenosaires.gob.ar/rest/api/2/project/$project >> output.txt
string=$(cat output.txt)
if [[ $string == *"errors"* ]]; then
     exit 1
fi
jq '.key' output.txt >> key.txt
sed -i 's/"//g' key.txt
export KEY=$(cat key.txt)
if [[ $ID =~ ^($KEY-)+[0-9]+$ ]]; then
     exit 0
else
     exit 1
fi