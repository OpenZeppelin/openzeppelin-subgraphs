#!/usr/bin/env bash

set -xo errexit

config=$1

subgraph=$(jq -r '.output' $config)
npx graph-compiler --config ${config} --include src/datasources --export-schema --export-subgraph
npx graph codegen ${subgraph}subgraph.yaml

jq -cr '.deploy[].type+" "+.deploy[].name' $config | while read endpoint;
do
  npx graph deploy --product ${endpoint} ${subgraph}subgraph.yaml
done