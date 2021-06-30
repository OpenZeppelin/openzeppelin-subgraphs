#!/usr/bin/env bash

npx graph-compiler                                      \
  --config ${CONFIG:-configs/sample.json}               \
  --include src/datasources                             \
  --export-subgraph                                     \
  --export-schema                                       &&

npx graph codegen                                       \
  ${SUBGRAPH:-generated/sample.subgraph.yaml}           &&

npx graph build                                         \
  ${SUBGRAPH:-generated/sample.subgraph.yaml}           &&

npx graph deploy                                        \
  --ipfs ${IPFSNODE:-https://api.thegraph.com/ipfs/}    \
  --node ${GRAPHNODE:-https://api.thegraph.com/deploy/} \
  ${NAME:-amxx/sandbox}                                 \
  ${SUBGRAPH:-generated/sample.subgraph.yaml}           &&

echo 'done.'
