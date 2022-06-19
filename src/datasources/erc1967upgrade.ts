import {
	ERC1967AdminChanged,
	ERC1967BeaconUpgraded,
	ERC1967ImplementationUpgraded,
} from '../../generated/schema'

import {
	AdminChanged   as AdminChangedEvent,
	BeaconUpgraded as BeaconUpgradedEvent,
	Upgraded       as UpgradedEvent,
} from '../../generated/erc1967upgrade/ERC1967'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

export function handleAdminChanged(event: AdminChangedEvent): void {
	let contract          = fetchAccount(event.address)
	let implementation    = fetchAccount(event.params.newAdmin)
	contract.erc1967Admin = implementation.id
	contract.save()

	let ERC1967AdminChangedId = events.id(event)
	let ev                    = ERC1967AdminChanged.load(ERC1967AdminChangedId)
	if (ev !== null)          return
	ev                        = new ERC1967AdminChanged(ERC1967AdminChangedId)
	ev.emitter                = contract.id
	ev.transaction            = transactions.log(event).id
	ev.timestamp              = event.block.timestamp
	ev.admin                  = implementation.id
	ev.save()
}
export function handleBeaconUpgraded(event: BeaconUpgradedEvent): void {
	let contract           = fetchAccount(event.address)
	let beacon             = fetchAccount(event.params.beacon)
	contract.erc1967Beacon = beacon.id
	contract.save()

	let ERC1967BeaconUpgradedId = events.id(event)
	let ev                      = ERC1967BeaconUpgraded.load(ERC1967BeaconUpgradedId)
	if (ev !== null)            return
	ev                          = new ERC1967BeaconUpgraded(ERC1967BeaconUpgradedId)
	ev.emitter                  = contract.id
	ev.transaction              = transactions.log(event).id
	ev.timestamp                = event.block.timestamp
	ev.beacon                   = beacon.id
	ev.save()
}
export function handleUpgraded(event: UpgradedEvent): void {
	let contract                   = fetchAccount(event.address)
	let admin                      = fetchAccount(event.params.implementation)
	contract.erc1967Implementation = admin.id
	contract.save()

	let ERC1967ImplementationUpgradedId = events.id(event)
	let ev                              = ERC1967ImplementationUpgraded.load(ERC1967ImplementationUpgradedId)
	if (ev !== null)                    return
	ev                                  = new ERC1967ImplementationUpgraded(ERC1967ImplementationUpgradedId)
	ev.emitter                          = contract.id
	ev.transaction                      = transactions.log(event).id
	ev.timestamp                        = event.block.timestamp
	ev.implementation                   = admin.id
	ev.save()
}
