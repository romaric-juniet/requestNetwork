import * as ContentData from './extensions/content-data-types';
import * as PnAnyDeclarativeBased from './extensions/pn-any-declarative-types';
import * as PnBitcoinAddressBased from './extensions/pn-bitcoin-address-based-types';
import * as Identity from './identity-types';
import * as RequestLogic from './request-logic-types';

export { ContentData, PnAnyDeclarativeBased, PnBitcoinAddressBased };

/** Extension interface is extended by the extensions implementation */
export interface IExtension {
  applyActionToExtension: (
    extensionsState: RequestLogic.IExtensionStates,
    extensionAction: IAction,
    requestState: RequestLogic.IRequest,
    actionSigner: Identity.IIdentity,
    timestamp: number,
  ) => RequestLogic.IExtensionStates;
}

/** Extensions state in advanced logic */
export interface IState {
  type: TYPE;
  id: ID;
  version: string;
  events: IEvent[];
  values: any;
}

/** Creation action object */
export interface IAction {
  action: string;
  id: ID;
  parameters?: any;
  version?: string;
}

/** extension event object */
export interface IEvent {
  name: string;
  parameters: any;
  timestamp: number;
}

/** Identification of extensions handled by this implementation */
export enum ID {
  CONTENT_DATA = 'content-data',
  PAYMENT_NETWORK_BITCOIN_ADDRESS_BASED = 'pn-bitcoin-address-based',
  PAYMENT_NETWORK_TESTNET_BITCOIN_ADDRESS_BASED = 'pn-testnet-bitcoin-address-based',
  PAYMENT_NETWORK_ANY_DECLARATIVE = 'pn-any-declarative',
}

/** Type of extensions */
export enum TYPE {
  CONTENT_DATA = 'content-data',
  PAYMENT_NETWORK = 'payment-network',
}
