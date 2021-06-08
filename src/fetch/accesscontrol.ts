import {
	Address,
	Bytes,
} from '@graphprotocol/graph-ts'

import {
	AccessControl,
	Role,
} from '../../generated/schema'

export function fetchAccessControl(address: Address) : AccessControl {
	let contract = new AccessControl(address.toHex())
	contract.save()
	return contract
}

export function fetchRole(id: Bytes) : Role {
	let role = new Role(id.toHex())
	role.save()
	return role
}
