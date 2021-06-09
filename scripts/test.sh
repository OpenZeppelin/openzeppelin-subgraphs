# #!/usr/bin/env bash

function test() {
  modules=("$@")

  mkdir -p generated
  tmp=`mktemp -p generated`

  {
    printf '{'
    printf '"output": "%s",' "../$tmp"
    printf '"chain": "%s",' "mainnet"
    printf '"datasources": ['
    {
      for module in "${modules[@]}";
      do
        printf '{"address": "0x0000000000000000000000000000000000000000", "module": "%s"},' "`basename $module .yaml`"
      done
    } | sed '$s/,$//'
    printf ']'
    printf '}'
  } | jq > $tmp

  node scripts/generator.js --path $tmp --export-subgraph --export-schema
  npx graph codegen $tmp.subgraph.yaml
  npx graph build $tmp.subgraph.yaml

  rm $tmp $tmp.schema.graphql $tmp.subgraph.yaml
}





shopt -s nullglob
modules=(src/datasources/*.yaml)

for module in "${modules[@]}";
do
  echo "Test module `basename $module .yaml`"
  test $module
done;

echo "Test all modules"
test "${modules[@]}"
