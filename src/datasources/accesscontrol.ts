import { store } from '@graphprotocol/graph-ts'

import {
	AccessControlRole,
	AccessControlRoleMember,
	RoleAdminChanged,
	RoleGranted,
	RoleRevoked,
} from '../../generated/schema'

import {
	RoleAdminChanged as RoleAdminChangedEvent,
	RoleGranted      as RoleGrantedEvent,
	RoleRevoked      as RoleRevokedEvent,
} from '../../generated/accesscontrol/AccessControl'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchRole,
	fetchAccessControl,
	fetchAccessControlRole,
} from '../fetch/accesscontrol'

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
	let contract          = fetchAccessControl(event.address)
	let accesscontrolrole = fetchAccessControlRole(contract, fetchRole(event.params.role))
	let admin             = fetchAccessControlRole(contract, fetchRole(event.params.newAdminRole))
	let previous          = fetchAccessControlRole(contract, fetchRole(event.params.previousAdminRole))

	accesscontrolrole.admin = admin.id
	accesscontrolrole.save()

	let ev               = new RoleAdminChanged(events.id(event))
	ev.emitter           = contract.id
	ev.transaction       = transactions.log(event).id
	ev.timestamp         = event.block.timestamp
	ev.role              = accesscontrolrole.id
	ev.newAdminRole      = admin.id
	ev.previousAdminRole = previous.id
	ev.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
	let contract          = fetchAccessControl(event.address)
	let accesscontrolrole = fetchAccessControlRole(contract, fetchRole(event.params.role))
	let account           = fetchAccount(event.params.account)
	let sender            = fetchAccount(event.params.sender)

	let accesscontrolrolemember               = new AccessControlRoleMember(accesscontrolrole.id.concat('/').concat(account.id.toHex()))
	accesscontrolrolemember.accesscontrolrole = accesscontrolrole.id
	accesscontrolrolemember.account           = account.id
	accesscontrolrolemember.save()

	let ev         = new RoleGranted(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.role        = accesscontrolrole.id
	ev.account     = account.id
	ev.sender      = sender.id
	ev.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
	let contract          = fetchAccessControl(event.address)
	let accesscontrolrole = fetchAccessControlRole(contract, fetchRole(event.params.role))
	let account           = fetchAccount(event.params.account)
	let sender            = fetchAccount(event.params.sender)

	store.remove('AccessControlRoleMember', accesscontrolrole.id.concat('/').concat(account.id.toHex()))

	let ev         = new RoleRevoked(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.role        = accesscontrolrole.id
	ev.account     = account.id
	ev.sender      = sender.id
	ev.save()
}
