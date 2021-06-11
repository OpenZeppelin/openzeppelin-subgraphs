import {
	TimelockControllerOperationScheduled,
	TimelockControllerOperationExecuted,
	TimelockControllerOperationCancelled,
	TimelockControllerMinDelayChange,
} from '../../generated/schema'
//
import {
	CallExecuted   as CallExecutedEvent,
	CallScheduled  as CallScheduledEvent,
	Cancelled      as CancelledEvent,
	MinDelayChange as MinDelayChangeEvent,
} from '../../generated/timelockcontroller/TimelockController'

import {
// 	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchTimelockController,
	fetchTimelockControllerOperation,
	fetchTimelockControllerCall,
} from '../fetch/timelockcontroller'


export function handleCallScheduled(event: CallScheduledEvent): void
{
	let contract          = fetchTimelockController(event.address)
	let operation         = fetchTimelockControllerOperation(contract, event.params.id)
	let call              = fetchTimelockControllerCall(operation, event.params.index)
	let target            = fetchAccount(event.params.target)

	operation.status      = "SCHEDULED"
	operation.delay       = event.params.delay
	operation.timestamp   = event.block.timestamp + event.params.delay
	operation.predecessor = event.params.predecessor ? event.params.predecessor.toHex() : null
	operation.save()

	call.operation        = operation.id
	call.index            = event.params.index
	call.target           = target.id
	call.value            = decimals.toDecimals(event.params.value)
	call.data             = event.params.data
	call.save()

	let ev                = new TimelockControllerOperationScheduled(events.id(event))
	ev.transaction        = transactions.log(event).id
	ev.timestamp          = event.block.timestamp
	ev.contract           = contract.id
	ev.operation          = operation.id
	ev.call               = call.id
	ev.save()
}

export function handleCallExecuted(event: CallExecutedEvent): void {
	let contract          = fetchTimelockController(event.address)
	let operation         = fetchTimelockControllerOperation(contract, event.params.id)
	let call              = fetchTimelockControllerCall(operation, event.params.index)
	operation.status      = "EXECUTED"
	operation.save()

	let ev                = new TimelockControllerOperationExecuted(events.id(event))
	ev.transaction        = transactions.log(event).id
	ev.timestamp          = event.block.timestamp
	ev.contract           = contract.id
	ev.operation          = operation.id
	ev.call               = call.id
	ev.save()
}

export function handleCancelled(event: CancelledEvent): void {
	let contract          = fetchTimelockController(event.address)
	let operation         = fetchTimelockControllerOperation(contract, event.params.id)
	operation.status      = "CANCELED"
	operation.save()

	let ev                = new TimelockControllerOperationCancelled(events.id(event))
	ev.transaction        = transactions.log(event).id
	ev.timestamp          = event.block.timestamp
	ev.contract           = contract.id
	ev.operation          = operation.id
	ev.save()
}

export function handleMinDelayChange(event: MinDelayChangeEvent): void {
	let contract          = fetchTimelockController(event.address)

	let ev                = new TimelockControllerMinDelayChange(events.id(event))
	ev.transaction        = transactions.log(event).id
	ev.timestamp          = event.block.timestamp
	ev.contract           = contract.id
	ev.delay              = event.params.newDuration
	ev.save()
}
