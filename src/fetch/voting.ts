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
	fetchAccount
} from './account'

export function fetchVoting(address: Address): VotingContract {
	let account        = fetchAccount(address)
	let contract       = new VotingContract(account.id)
	contract.asAccount = account.id
	account.asVoting   = account.id
	contract.save()
	account.save()

	return contract as VotingContract
}

export function fetchDelegation(contract: VotingContract, account: Account): VoteDelegation {
	let delegation       = new VoteDelegation(contract.id.concat('/').concat(account.id))
	delegation.contract  = contract.id
	delegation.delegator = account.id

	return delegation as VoteDelegation
}

export function fetchWeight(contract: VotingContract, account: Account): VoteWeight {
	let weight      = new VoteWeight(contract.id.concat('/').concat(account.id))
	weight.contract = contract.id
	weight.account  = account.id

	return weight as VoteWeight
}
