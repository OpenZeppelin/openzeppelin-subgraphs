# #!/usr/bin/env bash
#
tmp=`mktemp -p generated`

# #######################################################################################################################
# #                                                    PREPARE JSON                                                     #
# #######################################################################################################################

shopt -s nullglob
filearray=(src/datasources/*.yaml)

{
  printf '{'
  printf '"output": "%s",' "../$tmp"
  printf '"chain": "%s",' "mainnet"
  printf '"datasources": ['
  {
    for filename in "${filearray[@]}";
    do
      printf '{"address": "0x0000000000000000000000000000000000000000", "module": "%s"},' "`basename $filename .yaml`"
    done
  } | sed '$s/,$//'
  printf ']'
  printf '}'
} | jq > $tmp

#######################################################################################################################
#                                                      RUN TESTS                                                      #
#######################################################################################################################
node scripts/generator.js --path $tmp --export-subgraph --export-schema
npx graph codegen $tmp.subgraph.yaml
npx graph build $tmp.subgraph.yaml

#######################################################################################################################
#                                                       CLEANUP                                                       #
#######################################################################################################################
rm $tmp $tmp.schema.graphql $tmp.subgraph.yaml
