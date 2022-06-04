# OpenZeppelin Subgraphs

## Introduction

This repo contains subgraph schema and templates to index the activity of OpenZeppelin Contracts. For each of the supported OpenZeppelin modules `x`, this repo provides:

- **Primitives to generate a graphql schema:** `src/datasource/x.gql.json`

  In order to allow composability, the schema are not defined in the graphql format but rather in a dedicated json format which is can be assembled and compiled to graphql using the `graph-compiler` tool from `@amxx/graphprotocol-utils`. Graphql version for each modules are also available in `generated/x.schema.graphql`

- **Template to generate a subgraph manifest:** `src/datasource/x.yaml`

  This file lists all the events that the datasources should listen to, and links that to the corresponding indexing logic. Similarly to the schema, the manifest can be generated procedurally from a JSON app description.

- **Indexing logic:** `src/datasources/x.ts` and (optionally) `src/fetch/x.ts`

  This is the core logic that processes the events and to index the onchain activity.

## Suported modules

- AccessControl
- ERC20
- ERC721
- ERC1155
- ERC1967Upgrade
- Governor
- Ownable
- Pausable
- Timelock

<!--
PaymentSplitter
ERC20Snapshot
ERC20Votes
ERC777
Escrow
-->

## Usage

To use OpenZeppelin Subgraphs, install them in your local project directory and follow the steps outlined in __How to build my app's subgraph__:

```sh
npm install @openzeppelin/subgraphs
```

## How to build my app's subgraph

In order to build your subgraph, the first step is to create a JSON file listing the modules you want to index. Examples of such config can be found in the `config` folder.

For example, `configs/sample.json` describes an app with 4 contracts, the first one is an `ERC20` with `AccessControl`, while the 3 others are `ERC721` registries.

```
{
  "output": "generated/sample.",
  "chain": "mainnet",
  "datasources": [
    { "address": "0xA3B26327482312f70E077aAba62336f7643e41E1", "startBlock": 11633151, "module": [ "erc20", "accesscontrol" ] },
    { "address": "0xB1C52075b276f87b1834919167312221d50c9D16", "startBlock":  9917641, "module": "erc721" },
    { "address": "0x799DAa22654128d0C64d5b79eac9283008158730", "startBlock":  9917642, "module": "erc721" },
    { "address": "0xC76A18c78B7e530A165c5683CB1aB134E21938B4", "startBlock":  9917639, "module": "erc721" }
  ]
}
```

It can be compiled by doing

```
npx graph-compiler \
  --config configs/sample.json \
  --include node_modules/@openzeppelin/subgraphs/src/datasources \
  --export-schema \
  --export-subgraph
```

This will create two files, `generated/sample.schema.graphql` and `generated/sample.subgraph.yaml` that can be used to build and deploy the corresponding subgraph.

Note: `startBlock` is optional but will improve your subgraph initial indexing speed.


## Live deployments

### Admin (Access Control + Ownable + ERC1967)

| Network | Config                                                                 | Queries (HTTP)                                                                                                                         | Subscriptions (WS)                                                                                                                 |
|---------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Mainnet | [configs/live/mainnet/admin.json](configs/live/mainnet/admin.json)     | [https://api.thegraph.com/subgraphs/name/amxx/access-control](https://api.thegraph.com/subgraphs/name/amxx/access-control)             | [wss://api.thegraph.com/subgraphs/name/amxx/access-control](wss://api.thegraph.com/subgraphs/name/amxx/access-control)             |
| BSC     | [configs/live/bsc/admin.json](configs/live/bsc/admin.json)             | [https://api.thegraph.com/subgraphs/name/amxx/access-control-bsc](https://api.thegraph.com/subgraphs/name/amxx/access-control-bsc)     | [wss://api.thegraph.com/subgraphs/name/amxx/access-control-bsc](wss://api.thegraph.com/subgraphs/name/amxx/access-control-bsc)     |
| Matic   | [configs/live/matic/admin.json](configs/live/matic/admin.json)         | [https://api.thegraph.com/subgraphs/name/amxx/access-control-matic](https://api.thegraph.com/subgraphs/name/amxx/access-control-matic) | [wss://api.thegraph.com/subgraphs/name/amxx/access-control-matic](wss://api.thegraph.com/subgraphs/name/amxx/access-control-matic) |
| XDai    | [configs/live/xdai/admin.json](configs/live/xdai/admin.json)           | [https://api.thegraph.com/subgraphs/name/amxx/access-control-xdai](https://api.thegraph.com/subgraphs/name/amxx/access-control-xdai)   | [wss://api.thegraph.com/subgraphs/name/amxx/access-control-xdai](wss://api.thegraph.com/subgraphs/name/amxx/access-control-xdai)   |

### NFTs (ERC721 + ERC1155)

| Network | Config                                                                 | Queries (HTTP)                                                                                                                         | Subscriptions (WS)                                                                                                                 |
|---------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Mainnet | [configs/live/mainnet/nfts.json](configs/live/mainnet/nfts.json)       | [https://api.thegraph.com/subgraphs/name/amxx/nft-mainnet](https://api.thegraph.com/subgraphs/name/amxx/nft-mainnet)                   | [wss://api.thegraph.com/subgraphs/name/amxx/nft-mainnet](wss://api.thegraph.com/subgraphs/name/amxx/nft-mainnet)                   |
| BSC     | [configs/live/bsc/nfts.json](configs/live/bsc/nfts.json)               | [https://api.thegraph.com/subgraphs/name/amxx/nft-bsc](https://api.thegraph.com/subgraphs/name/amxx/nft-bsc)                           | [wss://api.thegraph.com/subgraphs/name/amxx/nft-bsc](wss://api.thegraph.com/subgraphs/name/amxx/nft-bsc)                           |
| Matic   | [configs/live/matic/nfts.json](configs/live/matic/nfts.json)           | [https://api.thegraph.com/subgraphs/name/amxx/nft-matic](https://api.thegraph.com/subgraphs/name/amxx/nft-matic)                       | [wss://api.thegraph.com/subgraphs/name/amxx/nft-matic](wss://api.thegraph.com/subgraphs/name/amxx/nft-matic)                       |
| XDai    | [configs/live/xdai/nfts.json](configs/live/xdai/nfts.json)             | [https://api.thegraph.com/subgraphs/name/amxx/nft-xdai](https://api.thegraph.com/subgraphs/name/amxx/nft-xdai)                         | [wss://api.thegraph.com/subgraphs/name/amxx/nft-xdai](wss://api.thegraph.com/subgraphs/name/amxx/nft-xdai)                         |

### ERC721 only

| Network | Config                                                                 | Queries (HTTP)                                                                                                                         | Subscriptions (WS)                                                                                                                 |
|---------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Mainnet | [configs/live/mainnet/eip721.json](configs/live/mainnet/eip721.json)   | [https://api.thegraph.com/subgraphs/name/amxx/eip721-subgraph](https://api.thegraph.com/subgraphs/name/amxx/eip721-subgraph)           | [wss://api.thegraph.com/subgraphs/name/amxx/eip721-subgraph](wss://api.thegraph.com/subgraphs/name/amxx/eip721-subgraph)           |

### ERC1155 only

| Network | Config                                                                 | Queries (HTTP)                                                                                                                         | Subscriptions (WS)                                                                                                                 |
|---------|------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| Mainnet | [configs/live/mainnet/eip1155.json](configs/live/mainnet/eip1155.json) | [https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph](https://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph)         | [wss://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph](wss://api.thegraph.com/subgraphs/name/amxx/eip1155-subgraph)         |
