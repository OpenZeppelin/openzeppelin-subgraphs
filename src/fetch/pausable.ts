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
	let account        = fetchAccount(address)
	let contract       = new Pausable(account.id)
	contract.asAccount = account.id
	account.asPausable = account.id
	account.save()

	return contract
}
