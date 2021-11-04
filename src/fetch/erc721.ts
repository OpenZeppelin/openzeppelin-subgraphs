import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Account,
	ERC721Contract,
	ERC721Token,
	ERC721Operator,
} from '../../generated/schema'

import {
	IERC721,
} from '../../generated/erc721/IERC721'

import {
	constants,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount
} from './account'

import {
	supportsInterface,
} from './erc165'

export function fetchERC721(address: Address): ERC721Contract | null {
	let erc721           = IERC721.bind(address)

	let account          = fetchAccount(address)
	let detectionId      = account.id.concat('/erc721detection')
	let detectionAccount = Account.load(detectionId)

	if (detectionAccount == null) {
		detectionAccount = new Account(detectionId)
		let introspection_01ffc9a7 = supportsInterface(erc721, '01ffc9a7') // ERC165
		let introspection_80ac58cd = supportsInterface(erc721, '80ac58cd') // ERC721
		let introspection_00000000 = supportsInterface(erc721, '00000000', false)
		let isERC721               = introspection_01ffc9a7 && introspection_80ac58cd && introspection_00000000
		detectionAccount.asERC721  = isERC721 ? account.id : null
		detectionAccount.save()
	}

	if (detectionAccount.asERC721 != null) {
		let contract = ERC721Contract.load(account.id)

		if (contract == null) {
			contract                  = new ERC721Contract(account.id)
			let try_name              = erc721.try_name()
			let try_symbol            = erc721.try_symbol()
			contract.name             = try_name.reverted   ? '' : try_name.value
			contract.symbol           = try_symbol.reverted ? '' : try_symbol.value
			contract.supportsMetadata = supportsInterface(erc721, '5b5e139f') // ERC721Metadata
			contract.asAccount        = account.id
			account.asERC721          = account.id
			contract.save()
			account.save()
		}
		return contract as ERC721Contract
	}

	return null;
}

export function fetchERC721Token(contract: ERC721Contract, identifier: BigInt): ERC721Token {
	let id = contract.id.concat('/').concat(identifier.toHex())
	let token = ERC721Token.load(id)

	if (token == null) {
		token            = new ERC721Token(id)
		token.contract   = contract.id
		token.identifier = identifier
		token.approval   = fetchAccount(Address.fromString(constants.ADDRESS_ZERO)).id

		if (contract.supportsMetadata) {
			let erc721       = IERC721.bind(Address.fromString(contract.id))
			let try_tokenURI = erc721.try_tokenURI(identifier)
			token.uri        = try_tokenURI.reverted ? '' : try_tokenURI.value
		}
	}

	return token as ERC721Token
}

export function fetchERC721Operator(contract: ERC721Contract, owner: Account, operator: Account): ERC721Operator {
	let id = contract.id.concat('/').concat(owner.id).concat('/').concat(operator.id)
	let op = ERC721Operator.load(id)

	if (op == null) {
		op          = new ERC721Operator(id)
		op.contract = contract.id
		op.owner    = owner.id
		op.operator = operator.id
	}

	return op as ERC721Operator
}
