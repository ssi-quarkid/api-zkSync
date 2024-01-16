#!/bin/bash
missed=$(awk -F"," '{x+=$4}END{print x}' ./jacoco.csv)
covered=$(awk -F"," '{x+=$5}END{print x}' ./jacoco.csv)
total=$(($missed+$covered))
sum1=$(($missed*100))
sum2=$(echo "scale=2; $sum1/$total" | bc)
sum3=$(echo "scale=3; 100-$sum2" | bc)
porcentaje=$(echo $sum3 | nawk '{printf("%d\n", $1 * 1)}')
echo "El porcentaje de cobertura de tests unitarios es de: $porcentaje"
echo $porcentaje >> porcentaje.txt