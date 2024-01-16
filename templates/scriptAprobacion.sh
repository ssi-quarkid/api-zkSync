#!/bin/bash
if (( $SCA > 0 )) || (( $SAST > 0 )); then
   if (( $DAST > 0 )); then
       curl -u $userjira:$passjira -X POST -H "Content-Type:application/json" --data '{"transition":{"id":"'$transicionrechazo'"},"fields":{"resolution":{"id":"'$resolution'"},"customfield_12204":{"id":"'$motivoAmbos'"}}}' https://asijira.buenosaires.gob.ar:443/rest/api/2/issue/$ID/transitions
   else
       curl -u $userjira:$passjira -X POST -H "Content-Type:application/json" --data '{"transition":{"id":"'$transicionrechazo'"},"fields":{"resolution":{"id":"'$resolution'"},"customfield_12204":{"id":"'$motivoEstatico'"}}}' https://asijira.buenosaires.gob.ar:443/rest/api/2/issue/$ID/transitions
   fi
else
   if (( $DAST > 0 )); then   
       curl -u $userjira:$passjira -X POST -H "Content-Type:application/json" --data '{"transition":{"id":"'$transicionrechazo'"},"fields":{"resolution":{"id":"'$resolution'"},"customfield_12204":{"id":"'$motivoDinamico'"}}}' https://asijira.buenosaires.gob.ar:443/rest/api/2/issue/$ID/transitions
   else
       curl -u $userjira:$passjira -X POST -H "Content-Type:application/json" --data '{"transition":{"id":"'$transicionok'"}}' https://asijira.buenosaires.gob.ar:443/rest/api/2/issue/$ID/transitions
   fi
fi