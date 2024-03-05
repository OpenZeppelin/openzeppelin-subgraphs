import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	ERC721Contract,
	ERC721Transfer,
} from '../../generated/schema'

import {
	IERC721,
	Approval       as ApprovalEvent,
	ApprovalForAll as ApprovalForAllEvent,
	Transfer       as TransferEvent,
} from '../../generated/erc721/IERC721'

import {
	ConsecutiveTransfer as ConsecutiveTransfer,
} from '../../generated/erc721-concecutive/IERC2309'

import {
	MetadataUpdate      as MetadataUpdateEvent,
	BatchMetadataUpdate as BatchMetadataUpdateEvent,
} from '../../generated/erc721-metadataupdate/IERC4906'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchERC721,
	fetchERC721Token,
	fetchERC721Operator,
} from '../fetch/erc721'

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) return

	let token = fetchERC721Token(contract, event.params.tokenId)
	let from  = fetchAccount(event.params.from)
	let to    = fetchAccount(event.params.to)

	token.owner    = to.id
	token.approval = fetchAccount(Address.zero()).id // implicit approval reset on transfer
	token.save()

	let ev         = new ERC721Transfer(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.token       = token.id
	ev.from        = from.id
	ev.to          = to.id
	ev.save()
}

export function handleConsecutiveTransfer(event: ConsecutiveTransfer): void {
	// Updates of blocks larger than 5000 tokens may DoS the subgraph, we skip them
	if (event.params.toTokenId.minus(event.params.fromTokenId) > BigInt.fromI32(5000)) return;

	let contract = fetchERC721(event.address)
	if (contract == null) return

	let from  = fetchAccount(event.params.fromAddress)
	let to    = fetchAccount(event.params.toAddress)
	let count = event.params.toTokenId.minus(event.params.fromTokenId).toI32(); // This is <=5000 so won't revert

	for (let index = 0; index <= count; ++index) {
		let tokenId    = event.params.fromTokenId.plus(BigInt.fromI32(index))
		let token      = fetchERC721Token(contract, tokenId)
		token.owner    = to.id
		token.approval = fetchAccount(Address.zero()).id // implicit approval reset on transfer
		token.save()

		let ev         = new ERC721Transfer(events.id(event).concat('-').concat(tokenId.toString()))
		ev.emitter     = contract.id
		ev.transaction = transactions.log(event).id
		ev.timestamp   = event.block.timestamp
		ev.contract    = contract.id
		ev.token       = token.id
		ev.from        = from.id
		ev.to          = to.id
		ev.save()
	}
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) return

	let token    = fetchERC721Token(contract, event.params.tokenId)
	let owner    = fetchAccount(event.params.owner)
	let approved = fetchAccount(event.params.approved)

	token.owner    = owner.id // this should not be necessary, owner changed is signaled by a transfer event
	token.approval = approved.id

	token.save()
	owner.save()
	approved.save()

	// let ev = new Approval(events.id(event))
	// ev.emitter     = contract.id
	// ev.transaction = transactions.log(event).id
	// ev.timestamp   = event.block.timestamp
	// ev.token       = token.id
	// ev.owner       = owner.id
	// ev.approved    = approved.id
	// ev.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) return

	let owner      = fetchAccount(event.params.owner)
	let operator   = fetchAccount(event.params.operator)
	let delegation = fetchERC721Operator(contract, owner, operator)

	delegation.approved = event.params.approved

	delegation.save()

	// 	let ev = new ApprovalForAll(events.id(event))
	// 	ev.emitter     = contract.id
	// 	ev.transaction = transactions.log(event).id
	// 	ev.timestamp   = event.block.timestamp
	// 	ev.delegation  = delegation.id
	// 	ev.owner       = owner.id
	// 	ev.operator    = operator.id
	// 	ev.approved    = event.params.approved
	// 	ev.save()
}

export function handleMetadataUpdate(event: MetadataUpdateEvent) : void {
	let contract = fetchERC721(event.address)
	if (contract == null) return

	if (contract.supportsMetadata) {
		_updateURI(contract, event.params._tokenId)
	} else {
		// add a warning ?
	}
}

export function handleBatchMetadataUpdate(event: BatchMetadataUpdateEvent) : void {
	let contract = fetchERC721(event.address)
	if (contract == null) return

	if (contract.supportsMetadata) {
		let fromTokenId = event.params._fromTokenId.toU64()
		let toTokenId   = event.params._toTokenId.toU64()
		// Updates of blocks larger than 5000 tokens may DoS the subgraph, we skip them
		if (toTokenId - fromTokenId <= 5000) {
			for (let tokenId = fromTokenId; tokenId <= toTokenId; ++tokenId) {
				_updateURI(contract, BigInt.fromU64(tokenId))
			}
		}
	} else {
		// add a warning ?
	}
}

function _updateURI(contract: ERC721Contract, tokenId: BigInt) : void {
	let erc721       = IERC721.bind(Address.fromBytes(contract.id))
	let token        = fetchERC721Token(contract, tokenId)
	let try_tokenURI = erc721.try_tokenURI(tokenId)
	token.uri        = try_tokenURI.reverted ? '' : try_tokenURI.value
	// If token was never minted (transfered) then the owner was set to 0 by default in `fetchERC721Token`
	// In that case we don't want to save to token to the database.
	if (token.owner != Address.zero()) {
		token.save()
	}
}
