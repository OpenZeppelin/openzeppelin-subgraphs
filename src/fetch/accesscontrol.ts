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
	let role = Role.load(id)

	if (role == null) {
		role = new Role(id)
		role.save()
	}

	return role as Role
}

export function fetchAccessControl(address: Address): AccessControl {
	let contract = AccessControl.load(address)

	if (contract == null) {
		contract              = new AccessControl(address)
		contract.asAccount    = address
		contract.save()
		
		let account             = fetchAccount(address)
		account.asAccessControl = address
		account.save()
	}

	return contract
}

export function fetchAccessControlRole(contract: AccessControl, role: Role): AccessControlRole {
	let id  = contract.id.toHex().concat('/').concat(role.id.toHex())
	let acr = AccessControlRole.load(id)

	if (acr == null) {
		acr          = new AccessControlRole(id)
		acr.contract = contract.id;
		acr.role     = role.id;
		acr.admin    = role.id == constants.BYTES32_ZERO
			? acr.id
			: fetchAccessControlRole(contract, fetchRole(constants.BYTES32_ZERO)).id
		acr.save()
	}

	return acr as AccessControlRole
}
