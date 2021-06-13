import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Account,
	ERC1155Contract,
	ERC1155Token,
	ERC1155Balance,
	ERC1155Operator,
} from '../../generated/schema'

import {
	decimals,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

export function fetchERC1155(address: Address): ERC1155Contract {
	let account        = fetchAccount(address)
	let contract       = new ERC1155Contract(account.id)
	contract.asAccount = account.id
	account.asERC1155  = contract.id
	contract.save()
	account.save()

	return contract
}

export function fetchERC1155Token(contract: ERC1155Contract, identifier: BigInt): ERC1155Token {
	let id = contract.id.concat('/').concat(identifier.toHex())
	let token = ERC1155Token.load(id)

	if (token == null) {
		token                  = new ERC1155Token(id)
		let totalSupply        = new decimals.Value(id.concat('/totalSupply'))
		token.contract         = contract.id
		token.identifier       = identifier
		token.totalSupply      = totalSupply.id
		token.totalSupplyExact = totalSupply.exact
	}
	return token as ERC1155Token
}

export function fetchERC1155Balance(token: ERC1155Token, account: Account): ERC1155Balance {
	let id = token.id.concat('/').concat(account.id)
	let balance = ERC1155Balance.load(id)

	if (balance == null) {
		balance            = new ERC1155Balance(id)
		let value          = new decimals.Value(id.concat('/balance'))
		balance.contract   = token.contract
		balance.token      = token.id
		balance.account    = account.id
		balance.value      = value.id
		balance.valueExact = value.exact
	}
	return balance as ERC1155Balance
}

export function fetchERC721Operator(contract: ERC1155Contract, owner: Account, operator: Account): ERC1155Operator {
	let id = contract.id.concat('/').concat(owner.id).concat('/').concat(operator.id)
	let op = ERC1155Operator.load(id)

	if (op == null) {
		op          = new ERC1155Operator(id)
		op.contract = contract.id
		op.owner    = owner.id
		op.operator = operator.id
	}
	return op as ERC1155Operator
}
