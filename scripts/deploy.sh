#!/usr/bin/env bash

set -xo errexit

# Default is to deploy all live configs
configs=$@
: ${configs:=configs/live/**/*.json}

for config in $configs;
do
  subgraph=$(jq -r '.output' $config)
  npx graph-compiler --config ${config} --include src/datasources --export-schema --export-subgraph
  npx graph codegen ${subgraph}subgraph.yaml

  jq -cr '.deploy[].type+" "+.deploy[].name' $config | while read endpoint;
  do
    npx graph deploy --product ${endpoint} ${subgraph}subgraph.yaml
  done
done
