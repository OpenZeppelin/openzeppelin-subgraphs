import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Ownable,
} from '../../generated/schema'

import {
	fetchAccount,
} from './account'

export function fetchOwnable(address: Address) : Ownable {
	let account        = fetchAccount(address)
	let contract       = new Ownable(account.id)
	contract.asAccount = account.id
	account.asOwnable  = account.id
	account.save()

	return contract
}
