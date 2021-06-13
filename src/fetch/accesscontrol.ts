import {
	Address,
	Bytes,
} from '@graphprotocol/graph-ts'

import {
	AccessControl,
	Role,
} from '../../generated/schema'

import {
	fetchAccount,
} from './account'

export function fetchAccessControl(address: Address) : AccessControl {
	let account             = fetchAccount(address)
	let contract            = new AccessControl(account.id)
	contract.asAccount      = account.id
	account.asAccessControl = account.id
	contract.save()
	account.save()

	return contract
}

export function fetchRole(id: Bytes) : Role {
	let role = new Role(id.toHex())
	role.save()
	return role
}
