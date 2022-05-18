#!/usr/bin/env bash

set -xo errexit

# MAINNET
CONFIG=configs/live/mainnet/admin.json   SUBGRAPH=generated/live/mainnet/admin.subgraph.yaml   NAME=amxx/access-control       bash scripts/deploy.sh
CONFIG=configs/live/mainnet/eip721.json  SUBGRAPH=generated/live/mainnet/eip721.subgraph.yaml  NAME=amxx/eip721-subgraph      bash scripts/deploy.sh
CONFIG=configs/live/mainnet/eip1155.json SUBGRAPH=generated/live/mainnet/eip1155.subgraph.yaml NAME=amxx/eip1155-subgraph     bash scripts/deploy.sh
CONFIG=configs/live/mainnet/nfts.json    SUBGRAPH=generated/live/mainnet/nfts.subgraph.yaml    NAME=amxx/nft-mainnet          bash scripts/deploy.sh

# BSC
CONFIG=configs/live/bsc/admin.json       SUBGRAPH=generated/live/bsc/admin.subgraph.yaml       NAME=amxx/access-control-bsc   bash scripts/deploy.sh
CONFIG=configs/live/bsc/nfts.json        SUBGRAPH=generated/live/bsc/nfts.subgraph.yaml        NAME=amxx/nft-bsc              bash scripts/deploy.sh

# MATIC
CONFIG=configs/live/matic/admin.json     SUBGRAPH=generated/live/matic/admin.subgraph.yaml     NAME=amxx/access-control-matic bash scripts/deploy.sh
CONFIG=configs/live/matic/nfts.json      SUBGRAPH=generated/live/matic/nfts.subgraph.yaml      NAME=amxx/nft-matic            bash scripts/deploy.sh

# # XDAI
CONFIG=configs/live/xdai/admin.json      SUBGRAPH=generated/live/xdai/admin.subgraph.yaml      NAME=amxx/access-control-xdai  bash scripts/deploy.sh
CONFIG=configs/live/xdai/nfts.json       SUBGRAPH=generated/live/xdai/nfts.subgraph.yaml       NAME=amxx/nft-xdai             bash scripts/deploy.sh
