"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarkNetLedger = void 0;
var tslib_1 = require("tslib");
var common_1 = require("@extrimian-sidetree/common");
var starknet_1 = require("starknet");
var utils_1 = tslib_1.__importDefault(require("./utils"));
var sidetree_compiled_json_1 = tslib_1.__importDefault(require("./abi/sidetree_compiled.json"));
var StarknetEvents_1 = require("./StarknetEvents");
var core_1 = require("@extrimian-sidetree/core");
var StarkNetLedger = /** @class */ (function () {
    function StarkNetLedger(account, provider, starkNetNodeUrl, contractAddress, logger) {
        var _this = this;
        this.account = account;
        this.provider = provider;
        this.starkNetNodeUrl = starkNetNodeUrl;
        this.contractAddress = contractAddress;
        this.cachedBlockchainTime = { hash: '', time: 0 };
        this.from = '';
        this.networkId = 0;
        this.maxGasFee = 10 * 1000 * 1000 * 1000 * 1000;
        this._getTransactions = function (fromBlock, toBlock, sinceTransaction, options) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var contract, logs, txns;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAnchorContract()];
                    case 1:
                        contract = _a.sent();
                        return [4 /*yield*/, this.getPastEvents({
                                address: contract.address,
                                fromBlock: fromBlock,
                                toBlock: toBlock,
                            }, sinceTransaction)];
                    case 2:
                        logs = _a.sent();
                        txns = logs.map(function (log) {
                            return utils_1.default.eventLogToSidetreeTransaction(log);
                        });
                        if (options && options.omitTimestamp) {
                            return [2 /*return*/, txns];
                        }
                        return [2 /*return*/, utils_1.default.extendSidetreeTransactionWithTimestamp(this.provider, txns)];
                }
            });
        }); };
        this.extendSidetreeTransactionWithTimestamp = function (transactions) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, utils_1.default.extendSidetreeTransactionWithTimestamp(this.provider, transactions)];
            });
        }); };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.write = function (anchorString, _fee) {
            if (_fee === void 0) { _fee = 0; }
            return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var contract, anchorObject, coreIndexFileUri, numberOfOperations, buffer, anchorHash, anchorHashUint256, anchor_low, anchor_high, call, feeEstimate, maxFee, fee, txn, err_1, errr, error;
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.getAnchorContract()];
                        case 1:
                            contract = _b.sent();
                            anchorObject = core_1.AnchoredDataSerializer.deserialize(anchorString);
                            coreIndexFileUri = anchorObject.coreIndexFileUri, numberOfOperations = anchorObject.numberOfOperations;
                            buffer = common_1.Encoder.base58ToBuffer(coreIndexFileUri);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            anchorHash = buffer.toString('hex').substring(4);
                            anchorHashUint256 = utils_1.default.hexToUint256(anchorHash);
                            anchor_low = anchorHashUint256.low;
                            anchor_high = anchorHashUint256.high;
                            _a = {};
                            return [4 /*yield*/, this.getAnchorContract()];
                        case 3:
                            call = (_a.contractAddress = (_b.sent()).address,
                                _a.entrypoint = "anchor_hash",
                                _a.calldata = [starknet_1.number.toFelt(anchor_low), starknet_1.number.toFelt(anchor_high), starknet_1.number.toFelt(numberOfOperations)],
                                _a);
                            return [4 /*yield*/, this.account.estimateFee(call)];
                        case 4:
                            feeEstimate = _b.sent();
                            maxFee = this.maxGasFee.toString();
                            fee = feeEstimate;
                            maxFee = utils_1.default.getMaxFee(fee.suggestedMaxFee);
                            return [4 /*yield*/, this.account.execute(call, [sidetree_compiled_json_1.default.abi], { "maxFee": maxFee })];
                        case 5:
                            txn = _b.sent();
                            this.logger.info("Starknet transaction successful: ".concat(txn.transaction_hash));
                            return [3 /*break*/, 7];
                        case 6:
                            err_1 = _b.sent();
                            errr = err_1;
                            console.log(errr);
                            error = err_1;
                            this.logger.error(error.message);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        this.logger = logger || console;
        this.contractAddress = contractAddress;
        this.anchorContract = new starknet_1.Contract(sidetree_compiled_json_1.default.abi, contractAddress, account);
        this.account = account;
        this.provider = provider;
        this.eventResolver = new StarknetEvents_1.StarkNetEventResolver(starkNetNodeUrl);
    }
    StarkNetLedger.prototype.getAnchorContract = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.contractAddress) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.anchorContract];
                }
            });
        });
    };
    StarkNetLedger.prototype.initialize = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info("Using Starknet contract at address ".concat(this.contractAddress));
                        return [4 /*yield*/, this.getLatestTime()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(StarkNetLedger.prototype, "approximateTime", {
        get: function () {
            return this.cachedBlockchainTime;
        },
        enumerable: false,
        configurable: true
    });
    StarkNetLedger.prototype.getPastEvents = function (params, sinceTransaction) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var events, is_last_page, sinceTransactionFound, res, idx, event_1, transactionNum;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params.page_number = 0;
                        params.page_size = 1024;
                        events = [];
                        sinceTransactionFound = true;
                        if (sinceTransaction !== undefined) {
                            sinceTransactionFound = false;
                        }
                        _a.label = 1;
                    case 1:
                        if (!!is_last_page) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.eventResolver.getEvents(params)];
                    case 2:
                        res = _a.sent();
                        if (res.result) {
                            if (sinceTransactionFound) {
                                events.push.apply(events, tslib_1.__spreadArray([], tslib_1.__read(res.result.events), false));
                            }
                            else {
                                for (idx = 0; idx < res.result.events.length; idx++) {
                                    event_1 = res.result.events[idx];
                                    if (!sinceTransactionFound) {
                                        transactionNum = parseInt(starknet_1.number.hexToDecimalString(event_1.data[2]));
                                        if (transactionNum > sinceTransaction) {
                                            sinceTransactionFound = true;
                                            events.push(event_1);
                                        }
                                    }
                                    else {
                                        events.push(event_1);
                                    }
                                }
                            }
                            is_last_page = res.result.is_last_page;
                            params.page_number++;
                        }
                        else {
                            if (res.error)
                                this.logger.log("Error getting the events ".concat(res.error.message));
                            else
                                this.logger.log("Error getting the events unknown");
                            return [2 /*return*/, []];
                        }
                        return [3 /*break*/, 1];
                    case 3:
                        this.logger.log("found ".concat(events.length, " events related to the contract"));
                        return [2 /*return*/, events];
                }
            });
        });
    };
    StarkNetLedger.prototype.getLatestTime = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var block, blockchainTime;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.provider.getBlock('latest')];
                    case 1:
                        block = _a.sent();
                        blockchainTime = {
                            time: block.block_number,
                            hash: block.block_hash,
                        };
                        this.cachedBlockchainTime = blockchainTime;
                        return [2 /*return*/, blockchainTime];
                }
            });
        });
    };
    StarkNetLedger.prototype.read = function (sinceTransactionNumber, transactionTimeHash) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var transactions, options, block;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            omitTimestamp: true,
                        };
                        if (!(sinceTransactionNumber !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._getTransactions(0, undefined, sinceTransactionNumber, options)];
                    case 1:
                        transactions = _a.sent();
                        return [3 /*break*/, 9];
                    case 2:
                        if (!transactionTimeHash) return [3 /*break*/, 7];
                        return [4 /*yield*/, utils_1.default.getBlock(this.provider, transactionTimeHash)];
                    case 3:
                        block = _a.sent();
                        if (!(block && block.block_number)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this._getTransactions(block.block_number, block.block_number, undefined, options)];
                    case 4:
                        transactions = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        transactions = [];
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this._getTransactions(0, undefined, undefined, options)];
                    case 8:
                        transactions = _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, {
                            moreTransactions: false,
                            transactions: transactions
                        }];
                }
            });
        });
    };
    StarkNetLedger.prototype.getFirstValidTransaction = function (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve(undefined)];
            });
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    StarkNetLedger.prototype.getFee = function (_transactionTime) {
        return Promise.resolve(0);
    };
    StarkNetLedger.prototype.getValueTimeLock = function (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lockIdentifier) {
        return Promise.resolve(undefined);
    };
    StarkNetLedger.prototype.getWriterValueTimeLock = function () {
        return Promise.resolve(undefined);
    };
    StarkNetLedger.prototype.getServiceVersion = function () {
        return Promise.resolve({
            name: 'starknet',
            version: 1,
        });
    };
    return StarkNetLedger;
}());
exports.StarkNetLedger = StarkNetLedger;
//# sourceMappingURL=StarknetLedger.js.map