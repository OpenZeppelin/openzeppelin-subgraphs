import {
	Address,
} from '@graphprotocol/graph-ts'

import {
	Account,
	VotingContract,
	VoteDelegation,
	VoteWeight,
} from '../../generated/schema'

import {
	constants,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount
} from './account'

export function fetchVoting(address: Address): VotingContract {
	let contract = VotingContract.load(address)

	if (contract == null) {
		contract             = new VotingContract(address)
		contract.asAccount   = address
		contract.totalWeight = fetchWeight(contract as VotingContract, null).id
		contract.save()

		let account          = fetchAccount(address)
		account.asVoting     = address
		account.save()
	}
	return contract as VotingContract
}

export function fetchWeight(contract: VotingContract, account: Account | null): VoteWeight {
	let id          = contract.id.toHex().concat('/').concat(account ? account.id.toHex() : 'total')
	let weight      = VoteWeight.load(id)

	if (weight == null) {
		weight          = new VoteWeight(id)
		weight.contract = contract.id
		weight.account  = account ? account.id : null
		weight.value    = constants.BIGINT_ZERO
		weight.save();
	}

	return weight as VoteWeight
}

export function fetchDelegation(contract: VotingContract, account: Account): VoteDelegation {
	let delegation       = new VoteDelegation(contract.id.toHex().concat('/').concat(account.id.toHex()))
	delegation.contract  = contract.id
	delegation.delegator = account.id

	return delegation as VoteDelegation
}
