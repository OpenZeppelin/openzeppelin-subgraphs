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
	fetchAccessControl,
	fetchRole,
} from '../fetch/accesscontrol'

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
	let contract = fetchAccessControl(event.address);
	let role     = fetchRole(event.params.role);
	let admin    = fetchRole(event.params.newAdminRole);
	let previous = fetchRole(event.params.previousAdminRole);

	let accesscontrolrole      = new AccessControlRole(contract.id.concat('/').concat(role.id));
	accesscontrolrole.contract = contract.id;
	accesscontrolrole.role     = role.id;
	accesscontrolrole.admin    = admin.id;
	accesscontrolrole.save()

	let ev               = new RoleAdminChanged(events.id(event));
	ev.transaction       = transactions.log(event).id;
	ev.timestamp         = event.block.timestamp;
	ev.role              = accesscontrolrole.id;
	ev.newAdminRole      = admin.id;
	ev.previousAdminRole = previous.id;
	ev.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
	let contract = fetchAccessControl(event.address);
	let role     = fetchRole(event.params.role);
	let account  = fetchAccount(event.params.account);
	let sender   = fetchAccount(event.params.sender);

	let accesscontrolrole      = new AccessControlRole(contract.id.concat('/').concat(role.id));
	accesscontrolrole.contract = contract.id;
	accesscontrolrole.role     = role.id;
	accesscontrolrole.save()

	let accesscontrolrolemember               = new AccessControlRoleMember(accesscontrolrole.id.concat('/').concat(account.id));
	accesscontrolrolemember.accesscontrolrole = accesscontrolrole.id
	accesscontrolrolemember.account           = account.id
	accesscontrolrolemember.save()

	let ev         = new RoleGranted(events.id(event));
	ev.transaction = transactions.log(event).id;
	ev.timestamp   = event.block.timestamp;
	ev.role        = accesscontrolrole.id;
	ev.account     = account.id;
	ev.sender      = sender.id;
	ev.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
	let contract = fetchAccessControl(event.address);
	let role     = fetchRole(event.params.role);
	let account  = fetchAccount(event.params.account);
	let sender   = fetchAccount(event.params.sender);

	let accesscontrolrole      = new AccessControlRole(contract.id.concat('/').concat(role.id));
	accesscontrolrole.contract = contract.id;
	accesscontrolrole.role     = role.id;
	accesscontrolrole.save()

	store.remove('AccessControlRoleMember', accesscontrolrole.id.concat('/').concat(account.id));

	let ev         = new RoleRevoked(events.id(event));
	ev.transaction = transactions.log(event).id;
	ev.timestamp   = event.block.timestamp;
	ev.role        = accesscontrolrole.id;
	ev.account     = account.id;
	ev.sender      = sender.id;
	ev.save()
}
