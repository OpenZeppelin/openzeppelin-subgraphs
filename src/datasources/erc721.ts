import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	ERC721Transfer,
} from '../../generated/schema'

import {
	IERC721,
	Approval            as ApprovalEvent,
	ApprovalForAll      as ApprovalForAllEvent,
	Transfer            as TransferEvent,
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
	if (contract != null) {
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
}

export function handleConsecutiveTransfer(event: ConsecutiveTransfer): void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
		let from  = fetchAccount(event.params.fromAddress)
		let to    = fetchAccount(event.params.toAddress)

		for (let tokenId = event.params.fromTokenId.toU64(); tokenId <= event.params.toTokenId.toU64(); ++tokenId) {
			let token = fetchERC721Token(contract, BigInt.fromU64(tokenId))
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
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
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
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
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
}

export function handleMetadataUpdate(event: MetadataUpdateEvent) : void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
		let erc721       = IERC721.bind(Address.fromBytes(contract.id))

		let token        = fetchERC721Token(contract, event.params._tokenId)
		let try_tokenURI = erc721.try_tokenURI(event.params._tokenId)
		token.uri        = try_tokenURI.reverted ? '' : try_tokenURI.value
		token.save()
	}
}

export function handleBatchMetadataUpdate(event: BatchMetadataUpdateEvent) : void {
	let contract = fetchERC721(event.address)
	if (contract != null) {
		let erc721       = IERC721.bind(Address.fromBytes(contract.id))

		for (let tokenId = event.params._fromTokenId.toU64(); tokenId <= event.params._toTokenId.toU64(); ++tokenId) {
			let token        = fetchERC721Token(contract, BigInt.fromU64(tokenId))
			let try_tokenURI = erc721.try_tokenURI(BigInt.fromU64(tokenId))
			token.uri        = try_tokenURI.reverted ? '' : try_tokenURI.value
			token.save()
		}
	}
}
