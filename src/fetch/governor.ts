import {
	Address,
	BigInt,
} from '@graphprotocol/graph-ts'

import {
	Governor,
	Proposal,
	ProposalCall,
	ProposalSupport,
	VoteReceipt,
} from '../../generated/schema'


import {
	Governor as GovernorContract,
} from '../../generated/governor/Governor'

import {
	fetchAccount
} from './account'

import {
	constants,
} from '@amxx/graphprotocol-utils'

export function fetchGovernor(address: Address): Governor {
	let contract = Governor.load(address)

	if (contract == null) {
		const COUNTING_MODE = GovernorContract.bind(address).try_COUNTING_MODE();

		contract           = new Governor(address)
		contract.asAccount = address
		if (!COUNTING_MODE.reverted) {
			contract.mode = COUNTING_MODE.value
		}
		contract.save()

		let account        = fetchAccount(address)
		account.asGovernor = address
		account.save()
	}

	return contract as Governor
}

export function fetchProposal(contract: Governor, proposalId: BigInt): Proposal {
	let id       = contract.id.toHex().concat('/').concat(proposalId.toHex())
	let proposal = Proposal.load(id)

	if (proposal == null) {
		proposal            = new Proposal(id)
		proposal.governor   = contract.id
		proposal.proposalId = proposalId
		proposal.canceled   = false
		proposal.queued     = false
		proposal.executed   = false
	}

	return proposal as Proposal
}

export function fetchProposalCall(proposal: Proposal, index: i32): ProposalCall {
	let id           = proposal.id.concat('/').concat(index.toString())
	let proposalCall = ProposalCall.load(id)

	if (proposalCall == null) {
		proposalCall          = new ProposalCall(id)
		proposalCall.proposal = proposal.id
		proposalCall.index    = index
	}

	return proposalCall as ProposalCall
}

export function fetchProposalSupport(proposal: Proposal, support: i32): ProposalSupport {
	let id              = proposal.id.concat('/').concat(support.toString())
	let proposalSupport = ProposalSupport.load(id)

	if (proposalSupport == null) {
		proposalSupport          = new ProposalSupport(id)
		proposalSupport.proposal = proposal.id
		proposalSupport.support  = support
		proposalSupport.weight   = constants.BIGINT_ZERO
	}

	return proposalSupport as ProposalSupport
}

export function fetchVoteReceipt(proposal: Proposal, voter: Address): VoteReceipt {
	let id      = proposal.id.concat('/').concat(voter.toHex())
	let receipt = VoteReceipt.load(id)

	if (receipt == null) {
		receipt          = new VoteReceipt(id)
		receipt.proposal = proposal.id
		receipt.voter    = fetchAccount(voter).id
	}

	return receipt as VoteReceipt
}
