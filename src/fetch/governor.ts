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
	fetchAccount
} from './account'

export function fetchGovernor(address: Address): Governor {
	let account  = fetchAccount(address)
	let contract = Governor.load(account.id)

	if (contract == null) {
		contract           = new Governor(account.id)
		contract.asAccount = account.id
		account.asGovernor = account.id
		contract.save()
		account.save()
	}

	return contract as Governor
}

export function fetchProposal(contract: Governor, proposalId: BigInt): Proposal {
	let id       = contract.id.concat('/').concat(proposalId.toHex())
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
	}

	return proposalSupport as ProposalSupport
}

export function fetchVoteReceipt(proposal: Proposal, voter: Address): VoteReceipt {
	let account = fetchAccount(voter)
	let id      = proposal.id.concat('/').concat(account.id)
	let receipt = VoteReceipt.load(id)

	if (receipt == null) {
		receipt          = new VoteReceipt(id)
		receipt.proposal = proposal.id
		receipt.voter    = account.id

		account.save()
	}

	return receipt as VoteReceipt
}
