import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Account,
	ERC721Contract,
	ERC721Token,
	ERC721Operator,
    Naut,
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


export function fetchNaut(token: ERC721Token): Naut {
    let naut = Naut.load(token.id)

	if (naut != null) {
		return naut as Naut;
	}

	naut = new Naut(token.id)
	naut.token = token.id
	// Default state is 0
	naut.state = new BigInt(0)

	// Make sure inverse mapping is set too
	token.asNaut = naut.id
	token.save()
	
    return naut as Naut;
}
