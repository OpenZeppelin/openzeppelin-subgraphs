import {
	Paused,
} from '../../generated/schema'

import {
	Paused   as PausedEvent,
	Unpaused as UnpausedEvent,
} from '../../generated/pausable/Pausable'

import {
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchPausable,
} from '../fetch/pausable'

export function handlePaused(event: PausedEvent): void {
	let contract      = fetchPausable(event.address)
	contract.isPaused = true
	contract.save()

	let pausedId     = events.id(event)
	let ev           = Paused.load(pausedId)
	if (ev !== null) return
	ev               = new Paused(pausedId)
	ev.emitter       = contract.id
	ev.transaction   = transactions.log(event).id
	ev.timestamp     = event.block.timestamp
	ev.contract      = contract.id
	ev.isPaused      = true
	ev.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
	let contract      = fetchPausable(event.address)
	contract.isPaused = false
	contract.save()

	let pausedId      = events.id(event)
	let ev            = Paused.load(pausedId)
	if (ev !== null)  return
	ev                = new Paused(pausedId)
	ev.emitter        = contract.id
	ev.transaction    = transactions.log(event).id
	ev.timestamp      = event.block.timestamp
	ev.contract       = contract.id
	ev.isPaused       = false
	ev.save()
}
