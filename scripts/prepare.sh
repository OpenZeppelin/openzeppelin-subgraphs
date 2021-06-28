#!/usr/bin/env bash

shopt -s nullglob
modules=(src/datasources/*.yaml)

function generate {
  name=$1
  shift

  mkdir -p configs
  mkdir -p generated

  {
    printf '{'
    printf '"output": "generated/%s.",' "$name"
    printf '"datasources": ['
    printf '{ "module": ['
    {
      for module in "$@";
      do
        printf '"%s",' "`basename $module .yaml`"
      done
    } | sed '$s/,$//'
    printf ']'
    printf '}'
    printf ']'
    printf '}'
  } | jq > ./configs/$name.json

  npx graph-compiler --config ./configs/$name.json --export-schema
}


# Generate module-specific schema
for module in "${modules[@]}";
do
  generate `basename $module .yaml` $module
done;

# Generate complete schema
generate "all" "${modules[@]}"

# generate top-erc20.js
node ./scripts/top-erc20.js > ./configs/top-erc20.js
npx graph-compiler --config ./configs/top-erc20.js --export-schema --export-subgraph
