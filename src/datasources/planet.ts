import {
	ERC721Transfer, Planet,
} from '../../generated/schema'

import {
	Approval       as ApprovalEvent,
	ApprovalForAll as ApprovalForAllEvent,
	Transfer       as TransferEvent,
} from '../../generated/erc721/IERC721'

import {
	DataLock as DataLockEvent,
	DataUnlock as DataUnlockEvent,
	DefaultStateUpdate as DefaultStateUpdateEvent,
	OverrideStateUpdate as OverrideStateUpdateEvent,
	SetData as SetDataEvent
} from '../../generated/planet/Planet'

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

import { handleApproval, handleTransfer } from './erc721'
import { fetchPlanet } from '../fetch/planet'
import { BigInt } from '@graphprotocol/graph-ts'

export function handlePlanetTransfer(event: TransferEvent): void {
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

export function handlePlanetApproval(event: ApprovalEvent): void {
	handleApproval(event)

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

export function handlePlanetDataLock(event: DataLockEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) {
		return;
	}

	let token = fetchERC721Token(contract, event.params.id)
	if (token == null) {
		return;
	}

	let planet = fetchPlanet(token);
	planet.locked = true;
	planet.save();
}

export function handlePlanetDataUnlock(event: DataUnlockEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) {
		return;
	}

	let token = fetchERC721Token(contract, event.params.id)
	if (token == null) {
		return;
	}

	let planet = fetchPlanet(token);
	planet.locked = false;
	planet.save();
	
}

export function handlePlanetDefaultStateUpdate(event: DefaultStateUpdateEvent): void {
	// If we start from 0 and go to totalSupply, not every Planet will be covered
  	// because some planets do not exist between 0..totalSupply. Therefore
  	// we will keep track of how many Planets we have actually modified.
  	// When seen == totalSupply, we know we have updated every Planet.

	let planetContract = Planet.bind(event.address);
	let totalSupply = planetContract.totalSupply;
	let defaultState = planetContract.defaultState;
  
	let contract = fetchERC721(event.address)
	if (contract == null) {
		return;
	}
	let cur = 0;
	let seen = 0;
	while (true) {
		let planet = Planet.load(cur.toString());
		if (!planet) {
			cur += 1;
			continue;
		}
		if (!planet.enabled) {
			planet.state = BigInt.fromString(defaultState);
			planet.save();
		}
		cur += 1;
		seen += 1;
		if (seen.toString() == totalSupply.toString()) {
			break;
		}
	}
}

export function handlePlanetOverrideStateUpdate(event: OverrideStateUpdateEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) {
		return;
	}

	let token = fetchERC721Token(contract, event.params.tokenId)
	if (token == null) {
		return;
	}

	let planet = fetchPlanet(token);
	planet.enabled = event.params.enabled;
	
	if (planet.enabled) {
		planet.state = event.params.state;
	}

	planet.save();
	
}

export function handlePlanetSetData(event: SetDataEvent): void {
	let contract = fetchERC721(event.address)
	if (contract == null) {
		return;
	}

	let token = fetchERC721Token(contract, event.params.id)
	if (token == null) {
		return;
	}

	let planet = fetchPlanet(token);
	planet.name = event.params.name;
	planet.description = event.params.description;
	planet.save();
}