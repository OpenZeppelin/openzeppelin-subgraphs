import {
	Address,
	BigInt,
	Bytes,
} from '@graphprotocol/graph-ts'

import {
	Timelock,
	TimelockOperation,
	TimelockCall,
} from '../../generated/schema'

import {
	fetchAccount
} from './account'

export function fetchTimelock(address: Address): Timelock {
	let account  = fetchAccount(address)
	let contract = Timelock.load(account.id)

	if (contract == null) {
		contract           = new Timelock(account.id)
		contract.asAccount = account.id
		account.asTimelock = account.id
		contract.save()
		account.save()
	}

	return contract as Timelock
}

export function fetchTimelockOperation(contract: Timelock, opid: Bytes): TimelockOperation {
	let id        = contract.id.concat('/').concat(opid.toHex())
	let operation = TimelockOperation.load(id)

	if (operation == null) {
		operation          = new TimelockOperation(id)
		operation.contract = contract.id
	}

	return operation as TimelockOperation
}

export function fetchTimelockCall(operation: TimelockOperation, index: BigInt): TimelockCall {
	let id   = operation.id.concat('/').concat(index.toString())
	let call = TimelockCall.load(id)

	if (call == null) {
		call           = new TimelockCall(id)
		call.operation = operation.id
	}

	return call as TimelockCall
}
