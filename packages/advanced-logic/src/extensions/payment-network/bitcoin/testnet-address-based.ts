import {
  Extension as ExtensionTypes,
  Identity as IdentityTypes,
  RequestLogic as RequestLogicTypes,
} from '@requestnetwork/types';

const walletAddressValidator = require('wallet-address-validator');

import BitcoinAddressBased from './address-based';

const BITCOIN_NETWORK = 'testnet';

/**
 * Implementation of the payment network to pay in BTC based on the addresses ON THE BITCOIN TESTNET
 * This payment network MUST BE USED ONLY for TEST PURPOSE. it MUST NEVER BE USED for real request.
 * With this extension one request can have two dedicated bitcoin addresses (one for payment and one for refund)
 * Every bitcoin transaction that reaches these addresses will be interpreted as payment or refund.
 * Important: the addresses must be exclusive to the request
 */
const bitcoinAddressBasedManager: ExtensionTypes.PnBitcoinAddressBased.IBitcoinAddressBased = {
  applyActionToExtension,
  createAddPaymentAddressAction,
  createAddRefundAddressAction,
  createCreationAction,
  isValidAddress,
};

/**
 * Creates the extensionsData to create the extension Bitcoin based on the addresses
 *
 * @param extensions extensions parameters to create
 *
 * @returns IExtensionCreationAction the extensionsData to be stored in the request
 */
function createCreationAction(
  creationParameters: ExtensionTypes.PnBitcoinAddressBased.ICreationParameters,
): ExtensionTypes.IAction {
  if (creationParameters.paymentAddress && !isValidAddress(creationParameters.paymentAddress)) {
    throw Error('paymentAddress is not a valid bitcoin address');
  }

  if (creationParameters.refundAddress && !isValidAddress(creationParameters.refundAddress)) {
    throw Error('refundAddress is not a valid bitcoin address');
  }

  return BitcoinAddressBased.createCreationAction(
    ExtensionTypes.ID.PAYMENT_NETWORK_TESTNET_BITCOIN_ADDRESS_BASED,
    creationParameters,
  );
}

/**
 * Creates the extensionsData to add a payment address
 *
 * @param extensions extensions parameters to create
 *
 * @returns IAction the extensionsData to be stored in the request
 */
function createAddPaymentAddressAction(
  addPaymentAddressParameters: ExtensionTypes.PnBitcoinAddressBased.IAddPaymentAddressParameters,
): ExtensionTypes.IAction {
  if (
    addPaymentAddressParameters.paymentAddress &&
    !isValidAddress(addPaymentAddressParameters.paymentAddress)
  ) {
    throw Error('paymentAddress is not a valid bitcoin address');
  }

  return BitcoinAddressBased.createAddPaymentAddressAction(
    ExtensionTypes.ID.PAYMENT_NETWORK_TESTNET_BITCOIN_ADDRESS_BASED,
    addPaymentAddressParameters,
  );
}

/**
 * Creates the extensionsData to add a refund address
 *
 * @param extensions extensions parameters to create
 *
 * @returns IAction the extensionsData to be stored in the request
 */
function createAddRefundAddressAction(
  addRefundAddressParameters: ExtensionTypes.PnBitcoinAddressBased.IAddRefundAddressParameters,
): ExtensionTypes.IAction {
  if (
    addRefundAddressParameters.refundAddress &&
    !isValidAddress(addRefundAddressParameters.refundAddress)
  ) {
    throw Error('refundAddress is not a valid bitcoin address');
  }

  return BitcoinAddressBased.createAddRefundAddressAction(
    ExtensionTypes.ID.PAYMENT_NETWORK_TESTNET_BITCOIN_ADDRESS_BASED,
    addRefundAddressParameters,
  );
}

/**
 * Applies the extension action to the request
 * Is called to interpret the extensions data when applying the transaction
 *
 * @param extensionsState previous state of the extensions
 * @param extensionAction action to apply
 * @param requestState request state read-only
 * @param actionSigner identity of the signer
 *
 * @returns state of the request updated
 */
function applyActionToExtension(
  extensionsState: RequestLogicTypes.IExtensionStates,
  extensionAction: ExtensionTypes.IAction,
  requestState: RequestLogicTypes.IRequest,
  actionSigner: IdentityTypes.IIdentity,
  timestamp: number,
): RequestLogicTypes.IExtensionStates {
  return BitcoinAddressBased.applyActionToExtension(
    extensionsState,
    extensionAction,
    requestState,
    actionSigner,
    timestamp,
  );
}

/**
 * Check if a bitcoin address is valid
 *
 * @param address address to check
 * @returns true if address is valid
 */
function isValidAddress(address: string): boolean {
  return walletAddressValidator.validate(address, 'bitcoin', BITCOIN_NETWORK);
}

export default bitcoinAddressBasedManager;
