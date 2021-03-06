import 'mocha';

import { RequestLogic as Types, Transaction as TransactionTypes } from '@requestnetwork/types';

import Utils from '@requestnetwork/utils';

import { RequestLogic } from '../src/index';
import * as TestData from './unit/utils/test-data-generator';

import Version from '../src/version';

const CURRENT_VERSION = Version.currentVersion;

const chai = require('chai');
const spies = require('chai-spies');
const expect = chai.expect;

chai.use(spies);

const createParams = {
  currency: Types.CURRENCY.ETH,
  expectedAmount: TestData.arbitraryExpectedAmount,
  payee: TestData.payeeRaw.identity,
  payer: TestData.payerRaw.identity,
  timestamp: 1544426030,
};
const unsignedAction: Types.IUnsignedAction = {
  name: Types.ACTION_NAME.CREATE,
  parameters: createParams,
  version: CURRENT_VERSION,
};
const requestId = Utils.crypto.normalizeKeccak256Hash(unsignedAction);
const action = Utils.signature.sign(unsignedAction, TestData.payeeRaw.signatureParams);

const fakeTxHash = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

const fakeMetaTransactionManager = {
  meta: { storageDataId: 'fakeDataId' },
  result: { topics: [fakeTxHash] },
};
const fakeTransactionManager: TransactionTypes.ITransactionManager = {
  getChannelsByTopic: chai.spy(),
  getTransactionsByChannelId: chai.spy(),
  persistTransaction: chai.spy.returns(fakeMetaTransactionManager),
};

/* tslint:disable:no-unused-expression */
describe('index', () => {
  describe('createRequest', () => {
    it('cannot createRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);

      try {
        await requestLogic.createRequest(createParams, TestData.payeeRaw.identity);
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });

    it('can createRequest', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager, TestData.fakeSignatureProvider);
      const ret = await requestLogic.createRequest(createParams, TestData.payeeRaw.identity);

      expect(ret.result, 'ret.result is wrong').to.be.deep.equal({ requestId });
      expect(ret.meta, 'ret.meta is wrong').to.be.deep.equal({
        transactionManagerMeta: fakeMetaTransactionManager.meta,
      });

      expect(fakeTransactionManager.persistTransaction).to.have.been.called.with(
        JSON.stringify(action),
        requestId,
      );
    });

    it('cannot createRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);

      try {
        await requestLogic.createRequest(createParams, TestData.payeeRaw.identity);
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });
  });

  describe('acceptRequest', () => {
    it('can acceptRequest', async () => {
      const acceptParams = {
        requestId,
      };
      const requestLogic = new RequestLogic(fakeTransactionManager, TestData.fakeSignatureProvider);
      const ret = await requestLogic.acceptRequest(acceptParams, TestData.payerRaw.identity);

      expect(ret.result, 'ret.result is wrong').to.be.undefined;
      expect(ret.meta).to.be.deep.equal({
        transactionManagerMeta: fakeMetaTransactionManager.meta,
      });

      const data = {
        name: Types.ACTION_NAME.ACCEPT,
        parameters: acceptParams,
        version: CURRENT_VERSION,
      };
      const actionExpected = TestData.fakeSignatureProvider.sign(data, TestData.payerRaw.identity);

      expect(fakeTransactionManager.persistTransaction).to.have.been.called.with(
        JSON.stringify(actionExpected),
        requestId,
      );
    });
    it('cannot acceptRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);
      const acceptParams = {
        requestId,
      };

      try {
        await requestLogic.acceptRequest(acceptParams, TestData.payeeRaw.identity);
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });
  });

  describe('cancelRequest', () => {
    it('can cancelRequest', async () => {
      const cancelRequest = {
        requestId,
      };
      const requestLogic = new RequestLogic(fakeTransactionManager, TestData.fakeSignatureProvider);
      const ret = await requestLogic.cancelRequest(cancelRequest, TestData.payeeRaw.identity);
      expect(ret.result, 'ret.result is wrong').to.be.undefined;
      expect(ret.meta).to.be.deep.equal({
        transactionManagerMeta: fakeMetaTransactionManager.meta,
      });

      const data = {
        name: Types.ACTION_NAME.CANCEL,
        parameters: cancelRequest,
        version: CURRENT_VERSION,
      };
      const actionExpected = TestData.fakeSignatureProvider.sign(data, TestData.payeeRaw.identity);

      expect(fakeTransactionManager.persistTransaction).to.have.been.called.with(
        JSON.stringify(actionExpected),
        requestId,
      );
    });
    it('cannot cancelRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);
      const cancelParams = {
        requestId,
      };

      try {
        await requestLogic.cancelRequest(cancelParams, TestData.payeeRaw.identity);
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });
  });

  describe('increaseExpectedAmountRequest', () => {
    it('can increaseExpectedAmountRequest', async () => {
      const increaseRequest = {
        deltaAmount: '1000',
        requestId,
      };
      const requestLogic = new RequestLogic(fakeTransactionManager, TestData.fakeSignatureProvider);

      const ret = await requestLogic.increaseExpectedAmountRequest(
        increaseRequest,
        TestData.payerRaw.identity,
      );
      expect(ret.result, 'ret.result is wrong').to.be.undefined;
      expect(ret.meta).to.be.deep.equal({
        transactionManagerMeta: fakeMetaTransactionManager.meta,
      });

      const data = {
        name: Types.ACTION_NAME.INCREASE_EXPECTED_AMOUNT,
        parameters: increaseRequest,
        version: CURRENT_VERSION,
      };
      const actionExpected = TestData.fakeSignatureProvider.sign(data, TestData.payerRaw.identity);

      expect(fakeTransactionManager.persistTransaction).to.have.been.called.with(
        JSON.stringify(actionExpected),
        requestId,
      );
    });
    it('cannot increaseExpectedAmountRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);
      const increaseRequest = {
        deltaAmount: '1000',
        requestId,
      };

      try {
        await requestLogic.increaseExpectedAmountRequest(
          increaseRequest,
          TestData.payeeRaw.identity,
        );
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });
  });

  describe('reduceExpectedAmountRequest', () => {
    it('can reduceExpectedAmountRequest', async () => {
      const reduceRequest = {
        deltaAmount: '1000',
        requestId,
      };
      const requestLogic = new RequestLogic(fakeTransactionManager, TestData.fakeSignatureProvider);

      const ret = await requestLogic.reduceExpectedAmountRequest(
        reduceRequest,
        TestData.payeeRaw.identity,
      );
      expect(ret.result, 'ret.result is wrong').to.be.undefined;
      expect(ret.meta).to.be.deep.equal({
        transactionManagerMeta: fakeMetaTransactionManager.meta,
      });

      const data = {
        name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
        parameters: reduceRequest,
        version: CURRENT_VERSION,
      };
      const actionExpected = TestData.fakeSignatureProvider.sign(data, TestData.payeeRaw.identity);

      expect(fakeTransactionManager.persistTransaction).to.have.been.called.with(
        JSON.stringify(actionExpected),
        requestId,
      );
    });
    it('cannot reduceExpectedAmountRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);
      const reduceRequest = {
        deltaAmount: '1000',
        requestId,
      };

      try {
        await requestLogic.reduceExpectedAmountRequest(reduceRequest, TestData.payeeRaw.identity);
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });
  });

  describe('addExtensionsDataRequest', () => {
    it('can addExtensionsDataRequest', async () => {
      const addExtRequest = {
        extensionsData: TestData.oneExtension,
        requestId,
      };
      const requestLogic = new RequestLogic(fakeTransactionManager, TestData.fakeSignatureProvider);

      const ret = await requestLogic.addExtensionsDataRequest(
        addExtRequest,
        TestData.payeeRaw.identity,
      );
      expect(ret.result, 'ret.result is wrong').to.be.undefined;
      expect(ret.meta).to.be.deep.equal({
        transactionManagerMeta: fakeMetaTransactionManager.meta,
      });

      const data = {
        name: Types.ACTION_NAME.ADD_EXTENSIONS_DATA,
        parameters: addExtRequest,
        version: CURRENT_VERSION,
      };
      const actionExpected = TestData.fakeSignatureProvider.sign(data, TestData.payeeRaw.identity);

      expect(fakeTransactionManager.persistTransaction).to.have.been.called.with(
        JSON.stringify(actionExpected),
        requestId,
      );
    });
    it('cannot addExtensionsDataRequest without signature provider', async () => {
      const requestLogic = new RequestLogic(fakeTransactionManager);
      const addExtRequest = {
        extensionsData: TestData.oneExtension,
        requestId,
      };

      try {
        await requestLogic.addExtensionsDataRequest(addExtRequest, TestData.payeeRaw.identity);
        expect(false, 'must have thrown').to.be.true;
      } catch (e) {
        expect(e.message, 'wrong exception').to.equal(
          'You must give a signature provider to create actions',
        );
      }
    });
  });

  describe('getRequestFromId', () => {
    it('can getRequestFromId', async () => {
      const actionCreate: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.CREATE,
          parameters: {
            currency: Types.CURRENCY.ETH,
            expectedAmount: '123400000000000000',
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            timestamp: 1544426030,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const actionAccept: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.ACCEPT,
          parameters: {
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payerRaw.signatureParams,
      );

      const rxReduce: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
          parameters: {
            deltaAmount: '1000',
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const meta = {};
      const listActions: Promise<TransactionTypes.IReturnGetTransactions> = Promise.resolve({
        meta,
        result: {
          transactions: [
            {
              timestamp: 1,
              transaction: { data: JSON.stringify(actionCreate) },
            },
            {
              timestamp: 2,
              transaction: { data: JSON.stringify(actionAccept) },
            },
            {
              timestamp: 3,
              transaction: { data: JSON.stringify(rxReduce) },
            },
          ],
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: chai.spy(),
        getTransactionsByChannelId: (): Promise<TransactionTypes.IReturnGetTransactions> =>
          listActions,
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const request = await requestLogic.getRequestFromId(requestId);

      expect(request, 'request result is wrong').to.deep.equal({
        meta: {
          ignoredTransactions: [],
          transactionManagerMeta: meta,
        },
        result: {
          request: {
            creator: TestData.payeeRaw.identity,
            currency: Types.CURRENCY.ETH,
            events: [
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.CREATE,
                parameters: {
                  expectedAmount: '123400000000000000',
                  extensionsDataLength: 0,
                  isSignedRequest: false,
                },
                timestamp: 1,
              },
              {
                actionSigner: TestData.payerRaw.identity,
                name: Types.ACTION_NAME.ACCEPT,
                parameters: {
                  extensionsDataLength: 0,
                },
                timestamp: 2,
              },
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
                parameters: {
                  deltaAmount: '1000',
                  extensionsDataLength: 0,
                },
                timestamp: 3,
              },
            ],
            expectedAmount: '123399999999999000',
            extensions: {},
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            requestId,
            state: Types.STATE.ACCEPTED,
            timestamp: 1544426030,
            version: CURRENT_VERSION,
          },
        },
      });
    });

    it('can getRequestFromId ignore the same transactions even with different case', async () => {
      const actionCreate: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.CREATE,
          parameters: {
            currency: Types.CURRENCY.ETH,
            expectedAmount: '123400000000000000',
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            timestamp: 1544426030,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const actionAccept: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.ACCEPT,
          parameters: {
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payerRaw.signatureParams,
      );

      const actionReduce: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
          parameters: {
            deltaAmount: '1000',
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const actionReduce2: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
          parameters: {
            deltaAmount: '1000',
            requestId: requestId.toUpperCase(),
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const meta = {};
      const listActions: Promise<TransactionTypes.IReturnGetTransactions> = Promise.resolve({
        meta,
        result: {
          transactions: [
            {
              timestamp: 1,
              transaction: { data: JSON.stringify(actionCreate) },
            },
            {
              timestamp: 2,
              transaction: { data: JSON.stringify(actionAccept) },
            },
            {
              timestamp: 3,
              transaction: { data: JSON.stringify(actionReduce) },
            },
            {
              timestamp: 4,
              transaction: { data: JSON.stringify(actionReduce2) },
            },
          ],
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: chai.spy(),
        getTransactionsByChannelId: (): Promise<TransactionTypes.IReturnGetTransactions> =>
          listActions,
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const request = await requestLogic.getRequestFromId(requestId);

      expect(request, 'request result is wrong').to.deep.equal({
        meta: {
          ignoredTransactions: [{ action: actionReduce2, timestamp: 4 }],
          transactionManagerMeta: meta,
        },
        result: {
          request: {
            creator: TestData.payeeRaw.identity,
            currency: Types.CURRENCY.ETH,
            events: [
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.CREATE,
                parameters: {
                  expectedAmount: '123400000000000000',
                  extensionsDataLength: 0,
                  isSignedRequest: false,
                },
                timestamp: 1,
              },
              {
                actionSigner: TestData.payerRaw.identity,
                name: Types.ACTION_NAME.ACCEPT,
                parameters: {
                  extensionsDataLength: 0,
                },
                timestamp: 2,
              },
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
                parameters: {
                  deltaAmount: '1000',
                  extensionsDataLength: 0,
                },
                timestamp: 3,
              },
            ],
            expectedAmount: '123399999999999000',
            extensions: {},
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            requestId,
            state: Types.STATE.ACCEPTED,
            timestamp: 1544426030,
            version: CURRENT_VERSION,
          },
        },
      });
    });

    it('can getRequestFromId do not ignore the same transactions if different nonces', async () => {
      const actionCreate: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.CREATE,
          parameters: {
            currency: Types.CURRENCY.ETH,
            expectedAmount: '123400000000000000',
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            timestamp: 1544426030,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const actionAccept: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.ACCEPT,
          parameters: {
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payerRaw.signatureParams,
      );

      const actionReduce: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
          parameters: {
            deltaAmount: '1000',
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const actionReduce2: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
          parameters: {
            deltaAmount: '1000',
            nonce: 1,
            requestId: requestId.toUpperCase(),
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const meta = {};
      const listActions: Promise<TransactionTypes.IReturnGetTransactions> = Promise.resolve({
        meta,
        result: {
          transactions: [
            {
              timestamp: 1,
              transaction: { data: JSON.stringify(actionCreate) },
            },
            {
              timestamp: 2,
              transaction: { data: JSON.stringify(actionAccept) },
            },
            {
              timestamp: 3,
              transaction: { data: JSON.stringify(actionReduce) },
            },
            {
              timestamp: 4,
              transaction: { data: JSON.stringify(actionReduce2) },
            },
          ],
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: chai.spy(),
        getTransactionsByChannelId: (): Promise<TransactionTypes.IReturnGetTransactions> =>
          listActions,
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const request = await requestLogic.getRequestFromId(requestId);

      expect(request, 'request result is wrong').to.deep.equal({
        meta: {
          ignoredTransactions: [],
          transactionManagerMeta: meta,
        },
        result: {
          request: {
            creator: TestData.payeeRaw.identity,
            currency: Types.CURRENCY.ETH,
            events: [
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.CREATE,
                parameters: {
                  expectedAmount: '123400000000000000',
                  extensionsDataLength: 0,
                  isSignedRequest: false,
                },
                timestamp: 1,
              },
              {
                actionSigner: TestData.payerRaw.identity,
                name: Types.ACTION_NAME.ACCEPT,
                parameters: {
                  extensionsDataLength: 0,
                },
                timestamp: 2,
              },
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
                parameters: {
                  deltaAmount: '1000',
                  extensionsDataLength: 0,
                },
                timestamp: 3,
              },
              {
                actionSigner: TestData.payeeRaw.identity,
                name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
                parameters: {
                  deltaAmount: '1000',
                  extensionsDataLength: 0,
                },
                timestamp: 4,
              },
            ],
            expectedAmount: '123399999999998000',
            extensions: {},
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            requestId,
            state: Types.STATE.ACCEPTED,
            timestamp: 1544426030,
            version: CURRENT_VERSION,
          },
        },
      });
    });

    it('should ignored the corrupted data (not parsable JSON)', async () => {
      const listActions: Promise<TransactionTypes.IReturnGetTransactions> = Promise.resolve({
        meta: {},
        result: {
          transactions: [
            {
              timestamp: 2,
              transaction: { data: '{NOT parsable}' },
            },
          ],
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: chai.spy(),
        getTransactionsByChannelId: (): Promise<TransactionTypes.IReturnGetTransactions> =>
          listActions,
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const request = await requestLogic.getRequestFromId(requestId);
      expect(request.result.request, 'request should be null').to.be.null;
    });

    it('should ignored the corrupted data (e.g: wrong properties)', async () => {
      const actionCreateCorrupted: any = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.CREATE,
          parameters: {
            currency: Types.CURRENCY.ETH,
            expectedAmount: 'NOT A NUMBER',
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            timestamp: 1544426030,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const listActions: Promise<TransactionTypes.IReturnGetTransactions> = Promise.resolve({
        meta: {},
        result: {
          transactions: [
            {
              timestamp: 2,
              transaction: { data: JSON.stringify(actionCreateCorrupted) },
            },
          ],
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: chai.spy(),
        getTransactionsByChannelId: (): Promise<TransactionTypes.IReturnGetTransactions> =>
          listActions,
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const request = await requestLogic.getRequestFromId(requestId);
      expect(
        request.meta.ignoredTransactions && request.meta.ignoredTransactions.length,
      ).to.be.equal(1);
      expect(
        request.meta.ignoredTransactions && request.meta.ignoredTransactions[0],
      ).to.be.deep.equal(actionCreateCorrupted);
      expect(request.result.request, 'request should be null').to.be.null;
    });
  });

  describe('getRequestsByTopic', () => {
    it('can getRequestsByTopic', async () => {
      const unsignedActionCreation = {
        name: Types.ACTION_NAME.CREATE,
        parameters: {
          currency: Types.CURRENCY.ETH,
          expectedAmount: '123400000000000000',
          payee: TestData.payeeRaw.identity,
          payer: TestData.payerRaw.identity,
          timestamp: 1544426030,
        },
        version: CURRENT_VERSION,
      };
      const actionCreate: Types.IAction = Utils.signature.sign(
        unsignedActionCreation,
        TestData.payeeRaw.signatureParams,
      );
      const newRequestId = Utils.crypto.normalizeKeccak256Hash(unsignedActionCreation);

      const actionAccept: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.ACCEPT,
          parameters: {
            requestId: newRequestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payerRaw.signatureParams,
      );

      const rxReduce: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.REDUCE_EXPECTED_AMOUNT,
          parameters: {
            deltaAmount: '1000',
            requestId: newRequestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const unsignedActionCreation2 = {
        name: Types.ACTION_NAME.CREATE,
        parameters: {
          currency: Types.CURRENCY.BTC,
          expectedAmount: '10',
          payee: TestData.payeeRaw.identity,
          payer: TestData.payerRaw.identity,
          timestamp: 1544411111,
        },
        version: CURRENT_VERSION,
      };
      const actionCreate2: Types.IAction = Utils.signature.sign(
        unsignedActionCreation2,
        TestData.payeeRaw.signatureParams,
      );
      const newRequestId2 = Utils.crypto.normalizeKeccak256Hash(unsignedActionCreation2);

      const actionCancel2: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.CANCEL,
          parameters: {
            requestId: newRequestId2,
          },
          version: CURRENT_VERSION,
        },
        TestData.payerRaw.signatureParams,
      );

      const unsignedActionCreation3 = {
        name: Types.ACTION_NAME.CREATE,
        parameters: {
          currency: Types.CURRENCY.BTC,
          expectedAmount: '666',
          payee: TestData.payeeRaw.identity,
          payer: TestData.payerRaw.identity,
          timestamp: 1544433333,
        },
        version: CURRENT_VERSION,
      };
      const actionCreate3: Types.IAction = Utils.signature.sign(
        unsignedActionCreation3,
        TestData.payeeRaw.signatureParams,
      );
      const newRequestId3 = Utils.crypto.normalizeKeccak256Hash(unsignedActionCreation3);

      const meta = {
        dataAccessMeta: { [requestId]: [], [newRequestId2]: [], [newRequestId3]: [] },
      };
      const listAllActions: Promise<
        TransactionTypes.IReturnGetTransactionsByChannels
      > = Promise.resolve({
        meta,
        result: {
          transactions: {
            [requestId]: [
              {
                timestamp: 0,
                transaction: { data: JSON.stringify(actionCreate) },
              },
              {
                timestamp: 2,
                transaction: { data: JSON.stringify(actionAccept) },
              },
              {
                timestamp: 3,
                transaction: { data: JSON.stringify(rxReduce) },
              },
            ],
            [newRequestId2]: [
              {
                timestamp: 1,
                transaction: { data: JSON.stringify(actionCreate2) },
              },
              {
                timestamp: 2,
                transaction: { data: JSON.stringify(actionCancel2) },
              },
            ],
            [newRequestId3]: [
              {
                timestamp: 4,
                transaction: { data: JSON.stringify(actionCreate3) },
              },
            ],
          },
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: (): Promise<TransactionTypes.IReturnGetTransactionsByChannels> => {
          return listAllActions;
        },
        getTransactionsByChannelId: chai.spy(),
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const requests = await requestLogic.getRequestsByTopic('fakeTopicForAll');

      expect(requests.result.requests.length, 'requests result is wrong').to.equal(3);
    });

    it('should ignore the transaction none parsable and the rejected action', async () => {
      const actionCreate: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.CREATE,
          parameters: {
            currency: Types.CURRENCY.ETH,
            expectedAmount: '123400000000000000',
            payee: TestData.payeeRaw.identity,
            payer: TestData.payerRaw.identity,
            timestamp: 1544426030,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const acceptNotValid: Types.IAction = Utils.signature.sign(
        {
          name: Types.ACTION_NAME.ACCEPT,
          parameters: {
            requestId,
          },
          version: CURRENT_VERSION,
        },
        TestData.payeeRaw.signatureParams,
      );

      const meta = {
        dataAccessMeta: { [requestId]: [] },
      };
      const listActions: Promise<
        TransactionTypes.IReturnGetTransactionsByChannels
      > = Promise.resolve({
        meta,
        result: {
          transactions: {
            [requestId]: [
              {
                timestamp: 2,
                transaction: { data: JSON.stringify(actionCreate) },
              },
              {
                timestamp: 2,
                transaction: { data: 'Not a json' },
              },
              {
                timestamp: 2,
                transaction: { data: JSON.stringify(acceptNotValid) },
              },
            ],
          },
        },
      });

      const fakeTransactionManagerGet: TransactionTypes.ITransactionManager = {
        getChannelsByTopic: (): Promise<TransactionTypes.IReturnGetTransactionsByChannels> => {
          return listActions;
        },
        getTransactionsByChannelId: chai.spy(),
        persistTransaction: chai.spy(),
      };
      const requestLogic = new RequestLogic(
        fakeTransactionManagerGet,
        TestData.fakeSignatureProvider,
      );

      const requests = await requestLogic.getRequestsByTopic('fakeTopicForAll');

      expect(requests.result.requests.length, 'requests result is wrong').to.equal(1);
    });
  });
});
