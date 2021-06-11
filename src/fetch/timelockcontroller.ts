import {
	Address,
	BigInt,
	Bytes,
} from '@graphprotocol/graph-ts'

import {
	TimelockController,
	TimelockControllerOperation,
	TimelockControllerCall,
} from '../../generated/schema'

import {
	fetchAccount
} from './account'

export function fetchTimelockController(address: Address): TimelockController {
	let account  = fetchAccount(address)
	let contract = TimelockController.load(account.id)

	if (contract == null) {
		contract                     = new TimelockController(account.id)
		contract.asAccount           = account.id
		contract.save()
		account.asTimelockController = account.id
		account.save()
	}

	return contract as TimelockController
}


export function fetchTimelockControllerOperation(contract: TimelockController, opid: Bytes): TimelockControllerOperation {
	let id        = contract.id.concat('/').concat(opid.toHex())
	let operation = TimelockControllerOperation.load(id)

	if (operation == null) {
		operation          = new TimelockControllerOperation(id)
		operation.contract = contract.id
	}
	return operation as TimelockControllerOperation
}


export function fetchTimelockControllerCall(operation: TimelockControllerOperation, index: BigInt): TimelockControllerCall {
	let id   = operation.id.concat('/').concat(index.toString())
	let call = TimelockControllerCall.load(id)

	if (call == null) {
		call           = new TimelockControllerCall(id)
		call.operation = operation.id
	}
	return call as TimelockControllerCall
}
