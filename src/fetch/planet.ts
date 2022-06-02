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
	Planet,
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


export function fetchPlanet(token: ERC721Token): Planet {
    let planet = Planet.load(token.id)

	if (planet != null) {
		return planet as Planet;
	}

	// Initialise parameters (just make them empty for now)
	planet = new Planet(token.id)
	planet.token = token.id

	planet.name = ""
	planet.description = ""
	planet.locked = false
	planet.enabled = false
	planet.state = new BigInt(0)

	// Make sure inverse mapping is set too
	token.asNaut = planet.id
	token.save()
	
    return planet as Planet;
}
