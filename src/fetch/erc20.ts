import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Account,
	ERC20Contract,
	ERC20Balance,
	ERC20Approval,
} from '../../generated/schema'

import {
	IERC20,
} from '../../generated/erc20/IERC20'

import {
	decimals,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount
} from './account'

export function fetchERC20(address: Address): ERC20Contract {
	let account  = fetchAccount(address)
	let contract = ERC20Contract.load(account.id)

	if (contract == null) {
		let endpoint              = IERC20.bind(address)
		let name                  = endpoint.try_name()
		let symbol                = endpoint.try_symbol()
		let decimals              = endpoint.try_decimals()
		contract                  = new ERC20Contract(account.id)

		// Common
		contract.name        = name.reverted     ? null : name.value
		contract.symbol      = symbol.reverted   ? null : symbol.value
		contract.decimals    = decimals.reverted ? 18   : decimals.value
		contract.totalSupply = fetchERC20Balance(contract as ERC20Contract, null).id
		contract.asAccount   = account.id
		account.asERC20      = contract.id
		contract.save()
		account.save()
	}

	return contract as ERC20Contract
}

export function fetchERC20Balance(contract: ERC20Contract, account: Account | null): ERC20Balance {
	let id      = contract.id.concat('/').concat(account ? account.id : 'totalSupply')
	let balance = ERC20Balance.load(id)

	if (balance == null) {
		balance                 = new ERC20Balance(id)
		let value               = new decimals.Value(id.concat('/balance'), contract.decimals)
		balance.contract        = contract.id
		balance.account         = account ? account.id : null
		balance.value           = value.id
		balance.valueExact      = value.exact
		balance.save()
	}
	return balance as ERC20Balance
}

export function fetchERC20Approval(contract: ERC20Contract, owner: Account, spender: Account): ERC20Approval {
	let id       = contract.id.concat('/').concat(owner.id).concat('/').concat(spender.id)
	let approval = ERC20Approval.load(id)

	if (approval == null) {
		approval                = new ERC20Approval(id)
		let value               = new decimals.Value(id.concat('/approval'), contract.decimals)
		approval.contract       = contract.id
		approval.owner          = owner.id
		approval.spender        = spender.id
		approval.value          = value.id
		approval.valueExact     = value.exact
	}
	return approval as ERC20Approval
}
