import {
	Address,
	Bytes,
} from '@graphprotocol/graph-ts'

import {
	Role,
	AccessControl,
	AccessControlRole,
} from '../../generated/schema'

import {
	fetchAccount,
} from './account'

import {
	constants,
} from '@amxx/graphprotocol-utils'

export function fetchRole(id: Bytes): Role {
	let role = new Role(id.toHex())
	role.save()
	return role
}

export function fetchAccessControl(address: Address): AccessControl {
	let account             = fetchAccount(address)
	let contract            = new AccessControl(account.id)
	contract.asAccount      = account.id
	account.asAccessControl = account.id
	contract.save()
	account.save()

	return contract
}

export function fetchAccessControlRole(contract: AccessControl, role: Role): AccessControlRole {
	let id  = contract.id.concat('/').concat(role.id)
	let acr = AccessControlRole.load(id)

	if (acr == null) {
		acr          = new AccessControlRole(id)
		acr.contract = contract.id;
		acr.role     = role.id;
		acr.admin    = role.id == constants.BYTES32_ZERO
			? acr.id
			: fetchAccessControlRole(contract, fetchRole(Bytes.fromHexString(constants.BYTES32_ZERO) as Bytes)).id
		acr.save()
	}

	return acr as AccessControlRole
}
