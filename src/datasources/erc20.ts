import {
	ERC20Transfer,
} from '../../generated/schema'

import {
	Transfer as TransferEvent,
	Approval as ApprovalEvent,
} from '../../generated/erc20/IERC20'

import {
	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchERC20,
	fetchERC20Balance,
	fetchERC20Approval,
} from '../fetch/erc20'

export function handleTransfer(event: TransferEvent): void {
	let contract = fetchERC20(event.address)
	let from     = fetchAccount(event.params.from)
	let to       = fetchAccount(event.params.to)

	let ev         = new ERC20Transfer(events.id(event))
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.from        = from.id
	ev.to          = to.id
	ev.value       = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact  = event.params.value

	if (from.id != constants.ADDRESS_ZERO) {
		let balance        = fetchERC20Balance(contract, from)
		let value          = new decimals.Value(balance.value)
		value.decrement(event.params.value)
		balance.valueExact = value.exact
		balance.save()

		ev.fromBalance = balance.id;
	}

	if (to.id != constants.ADDRESS_ZERO) {
		let balance = fetchERC20Balance(contract, to)
		let value = new decimals.Value(balance.value)
		value.increment(event.params.value)
		balance.valueExact = value.exact
		balance.save()

		ev.toBalance = balance.id;
	}
	ev.save()
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC20(event.address)

	let owner           = fetchAccount(event.params.owner)
	let spender         = fetchAccount(event.params.spender)
	let approval        = fetchERC20Approval(contract, owner, spender)
	let value           = new decimals.Value(approval.value)
	value.set(event.params.value)
	approval.valueExact = value.exact
	approval.save()

	// let ev         = new ERC20ApprovalEvent(events.id(event))
	// ev.transaction = transactions.log(event).id
	// ev.timestamp   = event.block.timestamp
	// ev.token       = token.id
	// ev.owner       = owner.id
	// ev.spender     = spender.id
	// ev.approval    = approval.id
	// ev.value       = value.value
	// ev.save()
}
