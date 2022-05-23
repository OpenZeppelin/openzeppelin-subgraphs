import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Account,
} from '../../generated/schema'

export function fetchAccount(address: Address): Account {
	let account = new Account(address)
	account.save()
	return account
}
