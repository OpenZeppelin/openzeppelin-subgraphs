import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	ERC20Transfer,
} from '../../generated/schema'

import {
	Transfer as TransferEvent,
	Approval as ApprovalEvent,
} from '../../generated/erc20/IERC20'

import {
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
	let contract   = fetchERC20(event.address)
	let ev         = new ERC20Transfer(events.id(event))
	ev.emitter     = contract.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.contract    = contract.id
	ev.value       = decimals.toDecimals(event.params.value, contract.decimals)
	ev.valueExact  = event.params.value

	if (event.params.from == Address.zero()) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.plus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let from               = fetchAccount(event.params.from)
		let balance            = fetchERC20Balance(contract, from)
		balance.valueExact     = balance.valueExact.minus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.from                = from.id
		ev.fromBalance         = balance.id
	}

	if (event.params.to == Address.zero()) {
		let totalSupply        = fetchERC20Balance(contract, null)
		totalSupply.valueExact = totalSupply.valueExact.minus(event.params.value)
		totalSupply.value      = decimals.toDecimals(totalSupply.valueExact, contract.decimals)
		totalSupply.save()
	} else {
		let to                 = fetchAccount(event.params.to)
		let balance            = fetchERC20Balance(contract, to)
		balance.valueExact     = balance.valueExact.plus(event.params.value)
		balance.value          = decimals.toDecimals(balance.valueExact, contract.decimals)
		balance.save()

		ev.to                  = to.id
		ev.toBalance           = balance.id
	}
	ev.save()
}

export function handleApproval(event: ApprovalEvent): void {
	let contract = fetchERC20(event.address)

	let owner           = fetchAccount(event.params.owner)
	let spender         = fetchAccount(event.params.spender)
	let approval        = fetchERC20Approval(contract, owner, spender)
	approval.valueExact = event.params.value
	approval.value      = decimals.toDecimals(event.params.value, contract.decimals)
	approval.save()

	// let ev         = new ERC20ApprovalEvent(events.id(event))
	// ev.emitter     = contract.id
	// ev.transaction = transactions.log(event).id
	// ev.timestamp   = event.block.timestamp
	// ev.token       = token.id
	// ev.owner       = owner.id
	// ev.spender     = spender.id
	// ev.approval    = approval.id
	// ev.value       = value.value
	// ev.save()
}
