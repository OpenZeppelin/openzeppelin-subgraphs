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
    printf '{'
    printf '"module": ['
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
  } | jq . > ./configs/$name.json

  npx graph-compiler --config configs/$name.json --include src/datasources --export-schema --export-subgraph || exit $?
}


# Generate module-specific schema
for module in "${modules[@]}";
do
  generate `basename $module .yaml` $module
done;

# Generate complete schema and codegened logic
generate "all" "${modules[@]}"
npx graph codegen generated/all.subgraph.yaml || exit $?


# generate top-erc20.js
# node ./scripts/top-erc20.js > configs/top-erc20.json
# npx graph-compiler --config configs/top-erc20.json --include src/datasources --export-schema --export-subgraph
