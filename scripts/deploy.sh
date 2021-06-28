# #!/usr/bin/env bash

npx generator                                           \
  --path ${CONFIG:-configs/sample.json}                 \
  --export-subgraph                                     \
  --export-schema                                       &

npx graph codegen                                       \
  ${SUBGRAPH:-generated/sample.subgraph.yaml}           &

npx graph deploy                                        \
  --ipfs ${IPFSNODE:-https://api.thegraph.com/ipfs/}    \
  --node ${GRAPHNODE:-https://api.thegraph.com/deploy/} \
  ${NAME:-amxx/sandbox}                                 \
  ${SUBGRAPH:-generated/sample.subgraph.yaml}           &

echo 'done.'
