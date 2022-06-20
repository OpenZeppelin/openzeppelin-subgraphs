import {
	TimelockOperationScheduled,
	TimelockOperationExecuted,
	TimelockOperationCancelled,
	TimelockMinDelayChange,
} from '../../generated/schema'

import {
	CallExecuted   as CallExecutedEvent,
	CallScheduled  as CallScheduledEvent,
	Cancelled      as CancelledEvent,
	MinDelayChange as MinDelayChangeEvent,
} from '../../generated/timelock/Timelock'

import {
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchTimelock,
	fetchTimelockOperation,
	fetchTimelockCall,
} from '../fetch/timelock'


export function handleCallScheduled(event: CallScheduledEvent): void {
	let contract          = fetchTimelock(event.address)
	let operation         = fetchTimelockOperation(contract, event.params.id)
	let call              = fetchTimelockCall(operation, event.params.index)
	let target            = fetchAccount(event.params.target)

	operation.status      = "SCHEDULED"
	operation.delay       = event.params.delay
	operation.timestamp   = event.block.timestamp.plus(event.params.delay)
	operation.predecessor = event.params.predecessor ? event.params.predecessor.toHex() : null
	operation.save()

	call.operation        = operation.id
	call.index            = event.params.index
	call.target           = target.id
	call.value            = decimals.toDecimals(event.params.value)
	call.data             = event.params.data
	call.save()

	let timelockOperationScheduledId = events.id(event)
	let ev                           = TimelockOperationScheduled.load(timelockOperationScheduledId)
	if (ev !== null)                 return
	ev                               = new TimelockOperationScheduled(timelockOperationScheduledId)
	ev.emitter                       = contract.id
	ev.transaction                   = transactions.log(event).id
	ev.timestamp                     = event.block.timestamp
	ev.contract                      = contract.id
	ev.operation                     = operation.id
	ev.call                          = call.id
	ev.save()
}

export function handleCallExecuted(event: CallExecutedEvent): void {
	let contract          = fetchTimelock(event.address)
	let operation         = fetchTimelockOperation(contract, event.params.id)
	let call              = fetchTimelockCall(operation, event.params.index)
	operation.status      = "EXECUTED"
	operation.save()

	let timelockOperationExecutedId = events.id(event)
	let ev                          = TimelockOperationExecuted.load(timelockOperationExecutedId)
	if (ev !== null)                return
	ev                              = new TimelockOperationExecuted(timelockOperationExecutedId)
	ev.emitter                      = contract.id
	ev.transaction                  = transactions.log(event).id
	ev.timestamp                    = event.block.timestamp
	ev.contract                     = contract.id
	ev.operation                    = operation.id
	ev.call                         = call.id
	ev.save()
}

export function handleCancelled(event: CancelledEvent): void {
	let contract          = fetchTimelock(event.address)
	let operation         = fetchTimelockOperation(contract, event.params.id)
	operation.status      = "CANCELED"
	operation.save()

	let timelockOperationCancelledId = events.id(event)
	let ev                           = TimelockOperationCancelled.load(timelockOperationCancelledId)
	if (ev !== null)                 return
	ev                               = new TimelockOperationCancelled(timelockOperationCancelledId)
	ev.emitter                       = contract.id
	ev.transaction                   = transactions.log(event).id
	ev.timestamp                     = event.block.timestamp
	ev.contract                      = contract.id
	ev.operation                     = operation.id
	ev.save()
}

export function handleMinDelayChange(event: MinDelayChangeEvent): void {
	let contract          = fetchTimelock(event.address)

	let timelockMinDelayChangeId = events.id(event)
	let ev                       = TimelockMinDelayChange.load(timelockMinDelayChangeId)
	if (ev !== null)             return
	ev                           = new TimelockMinDelayChange(timelockMinDelayChangeId)
	ev.emitter                   = contract.id
	ev.transaction               = transactions.log(event).id
	ev.timestamp                 = event.block.timestamp
	ev.contract                  = contract.id
	ev.delay                     = event.params.newDuration
	ev.save()
}
