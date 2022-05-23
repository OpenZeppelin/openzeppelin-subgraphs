import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Pausable,
} from '../../generated/schema'

import {
	fetchAccount,
} from './account'

export function fetchPausable(address: Address): Pausable {
	let contract       = new Pausable(address)
	contract.asAccount = address

	let account        = fetchAccount(address)
	account.asPausable = address
	account.save()

	return contract
}
