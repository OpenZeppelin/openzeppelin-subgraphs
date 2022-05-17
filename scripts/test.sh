#!/usr/bin/env bash

shopt -s nullglob
modules=(src/datasources/*.yaml)

function test() {
  modules=("$@")

  mkdir -p generated
  tmp=`mktemp -up generated tmp.XXXXXXXXXX`

  {
    printf '{'
    printf '"output": "%s",' "$tmp."
    printf '"datasources": ['
    printf '{'
    printf '"module": ['
    {
      for module in "${modules[@]}";
      do
        printf '"%s",' "`basename $module .yaml`"
      done
    } | sed '$s/,$//'
    printf ']'
    printf '}'
    printf ']'
    printf '}'
  } | jq . > $tmp.json

  npx graph-compiler --config $tmp --include src/datasources --export-subgraph --export-schema || exit $?
  npx graph codegen $tmp.subgraph.yaml || exit $?
  npx graph build $tmp.subgraph.yaml || exit $?

  rm $tmp.json $tmp.schema.graphql $tmp.subgraph.yaml ${tmp/generated/build}.schema.graphql
}


if [ $# -eq 0 ];
then
  for module in ${modules[@]};
  do
      echo "Test module `basename $module .yaml`"
      test $module
    done;

    echo "Test all modules"
    test ${modules[@]}
else
  test $@
fi
