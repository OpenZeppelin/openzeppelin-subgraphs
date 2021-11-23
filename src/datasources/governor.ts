import {
	ProposalCreated,
	ProposalQueued,
	ProposalExecuted,
	ProposalCanceled,
	VoteCast,
} from '../../generated/schema'

import {
	Governor         as GovernorContract,
	ProposalCreated  as ProposalCreatedEvent,
	ProposalQueued   as ProposalQueuedEvent,
	ProposalExecuted as ProposalExecutedEvent,
	ProposalCanceled as ProposalCanceledEvent,
	VoteCast         as VoteCastEvent,
} from '../../generated/governor/Governor'

import {
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchGovernor,
	fetchProposal,
	fetchProposalCall,
	fetchProposalSupport,
	fetchVoteReceipt,
} from '../fetch/governor'

export function handleProposalCreated(event: ProposalCreatedEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal         = fetchProposal(governor, event.params.proposalId)
	proposal.proposer    = fetchAccount(event.params.proposer).id
	proposal.startBlock  = event.params.startBlock
	proposal.endBlock    = event.params.endBlock
	proposal.description = event.params.description
	proposal.save()

	let targets    = event.params.targets
	let values     = event.params.values
	let signatures = event.params.signatures
	let calldatas  = event.params.calldatas
	for (let i = 0; i < targets.length; ++i) {
		let call        = fetchProposalCall(proposal, i)
		call.target     = fetchAccount(targets[i]).id
		call.value      = decimals.toDecimals(values[i])
		call.signature  = signatures[i]
		call.calldata   = calldatas[i]
		call.save()
	}

	let ev         = new ProposalCreated(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = proposal.governor
	ev.proposal    = proposal.id
	ev.proposer    = proposal.proposer
	ev.save()
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
	let governor = fetchGovernor(event.address)

	let eta = GovernorContract.bind(event.address).proposalEta(event.params.proposalId)

	let proposal    = fetchProposal(governor, event.params.proposalId)
	proposal.queued = true
	proposal.eta    = eta
	proposal.save()

	let ev         = new ProposalQueued(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = governor.id
	ev.proposal    = proposal.id
	ev.eta         = eta
	ev.save()
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal      = fetchProposal(governor, event.params.proposalId)
	proposal.executed = true
	proposal.save()

	let ev         = new ProposalExecuted(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = governor.id
	ev.proposal    = proposal.id
	ev.save()
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal      = fetchProposal(governor, event.params.proposalId)
	proposal.canceled = true
	proposal.save()

	let ev         = new ProposalCanceled(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = governor.id
	ev.proposal    = proposal.id
	ev.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
	let governor = fetchGovernor(event.address)

	let proposal = fetchProposal(governor, event.params.proposalId)

	let support  = fetchProposalSupport(proposal, event.params.support)
	support.save()

	let receipt  = fetchVoteReceipt(proposal, event.params.voter)
	receipt.support = support.id
	receipt.weight  = event.params.weight
	receipt.reason  = event.params.reason
	receipt.save()

	let ev         = new VoteCast(events.id(event))
	ev.emitter     = governor.id
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.governor    = governor.id
	ev.proposal    = receipt.proposal
	ev.support     = receipt.support
	ev.receipt     = receipt.id
	ev.voter       = receipt.voter
	ev.save()
}
