#!/bin/bash
string=$(cat salida.txt)
if [[ $string == *"errors"* ]]; then
     exit 1
fi