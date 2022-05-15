import {
	ERC721Transfer,
} from '../../generated/schema'

import {
	Approval       as ApprovalEvent,
	ApprovalForAll as ApprovalForAllEvent,
	Transfer       as TransferEvent,
} from '../../generated/erc721/IERC721'

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

import {
	SetTokenStateCall
} from "../../generated/naut/ERC721MultiMetadata";
import { fetchNaut } from '../fetch/naut'

import { handleTransfer } from './erc721'

/// Called on every transfer to make sure there is always a Naut associated with a token
export function handleNautTransfer(event: TransferEvent): void {
	// call erc721's handletransfer in case we fire first
	handleTransfer(event)

	let contract = fetchERC721(event.address)
	if (contract == null) {
		return;
	}

	let token = fetchERC721Token(contract, event.params.tokenId)
	if (token == null) {
		return;
	}

	let naut = fetchNaut(token)
	naut.save()
}

export function handleSetTokenState(call: SetTokenStateCall): void {
	let contract = fetchERC721(call.to)

	if (contract == null) {
		return;
	}

	let token = fetchERC721Token(contract, call.inputs.token)

	if (token == null) {
		return;
	}

	let naut = fetchNaut(token)
	naut.state = call.inputs.state
	naut.save()	
}