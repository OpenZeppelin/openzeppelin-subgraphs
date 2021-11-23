import {
	OwnershipTransferred,
} from '../../generated/schema'

import {
	OwnershipTransferred as OwnershipTransferredEvent,
} from '../../generated/ownable/Ownable'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchOwnable,
} from '../fetch/ownable'

export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
	let contract = fetchOwnable(event.address)
	let owner    = fetchAccount(event.params.newOwner)

	contract.owner = owner.id
	contract.save()

	let ev         = new OwnershipTransferred(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.owner       = owner.id
	ev.save()
}
