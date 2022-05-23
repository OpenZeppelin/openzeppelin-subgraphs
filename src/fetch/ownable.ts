import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Ownable,
} from '../../generated/schema'

import {
	fetchAccount,
} from './account'

export function fetchOwnable(address: Address): Ownable {
	let contract       = new Ownable(address)
	contract.asAccount = address

	let account        = fetchAccount(address)
	account.asOwnable  = address
	account.save()

	return contract
}
