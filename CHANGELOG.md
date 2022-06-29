# Changelog

### 0.1.8-5 (2022-07-29)
 * `AccessControl`: fix bug caused by duplicate write of immutable entity `AccessControl` ([#38](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/38))

### 0.1.8-4 (2022-07-24)
 * `AccessControl`: fix bug caused by duplicate write of immutable entity `Role` ([#36](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/36))
 * `ERC1155`: fix bug caused by duplicate write of immutable entity `ERC1155` ([#36](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/36))

### 0.1.8-3 (2022-07-16)
 * `ERC721`: reset approval on `Transfer` ([#33](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/33))

### 0.1.8-2
 * `Governor`: add handler for `VoteCastWithParams` events ([#31](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/31))
 * `Governor`: track total vote weight in `ProposalSupport` ([#31](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/31))

### 0.1.8-1 (2022-07-11)
 * `Governor`: improve indexing of proposal queeing ([#29](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/29))

### 0.1.8 (2022-05-18)
 * Update dependency to @graphprotocol/graph-cli version 0.29.x
 * Update dependency to @graphprotocol/graph-ts version 0.26.x
 * Update dependency to @amxx/graphprotocol-utils version 1.1.0
 * Use Bytes for some entities ID ([#25](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/25))
 * Make events and some other entites immutable
 * `Governor`: index the "counting mode" for OZ governors

### 0.1.7-1 (2022-01-27)
 * `Governor`: fix vulnerability to ill-formed ProposalCreated events

### 0.1.7 (2022-01-27)
 * `ERC1155`: fetch token uri on minting. ([#14](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/14))
 * `ERC1155`: fix vulnerability to ill-formed TransferBatch events ([#16](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/16))

### 0.1.6 (2021-11-23)
 * Include emmiter address (Account) to all Event objects
 * Update dependency to @amxx/graphprotocol-utils version 1.1.0-alpha.1
 * Update dependency to @graphprotocol/graph-cli and @graphprotocol/graph-ts version 0.24.x

### 0.1.5 (2021-11-04)
 * Update dependency to @graphprotocol/graph-cli and @graphprotocol/graph-ts version 0.23.x

### 0.1.4 (2021-10-04)
 * Module `Voting`

### 0.1.3 (2021-09-29)
 * Update datasources to apiVersion 0.0.5
 * Update dependency to support apiVersion 0.0.5
 * Fix nullability conflicts introduced by version 0.22 of graphprotocol's tooling

### 0.1.2 (2021-08-06)
 * Start `CHANGELOG.md`
 * Fix ERC721 fetching issue ([#5](https://github.com/OpenZeppelin/openzeppelin-subgraphs/pull/5))

### 0.1.1 (2021-08-06)
 * Module `Governor`: support `Governor` & `GovernorWithTimelock`

### 0.1.0 (2021-07-13)
 * Initial version of the packages
 * Module `AccessControl`
 * Module `ERC20`
 * Module `ERC721`
 * Module `ERC1155`
 * Module `ERC1967Upgrade`
 * Module `Ownable`
 * Module `Pausable`
 * Module `Timelock`
