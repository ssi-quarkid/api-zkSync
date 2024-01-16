"use strict";
/*
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var starknet_1 = require("starknet");
var common_1 = require("@extrimian-sidetree/common");
var core_1 = require("@extrimian-sidetree/core");
var getAccounts = function (account) {
    return new Promise(function (resolve, reject) {
        if (!account.address)
            reject("no account address");
        resolve([account.address]);
    });
};
;
var eventLogToSidetreeTransaction = function (log) {
    var hash_low = log.data[0];
    var hash_high = log.data[1];
    var transactionNumber = Number.parseInt(log.data[2]);
    var numberOfOperation = Number.parseInt(log.data[3]);
    var anchorFileHash = uint256toHex(hash_low, hash_high);
    var coreIndexFileUri = common_1.Encoder.bufferToBase58(Buffer.from('1220' + anchorFileHash.replace('0x', ''), 'hex'));
    var anchorObject = {
        coreIndexFileUri: coreIndexFileUri,
        numberOfOperations: numberOfOperation,
    };
    var anchorString = core_1.AnchoredDataSerializer.serialize(anchorObject);
    return {
        transactionNumber: transactionNumber,
        transactionTime: log.block_number,
        transactionTimeHash: log.block_hash,
        anchorString: anchorString,
        transactionFeePaid: 0,
        normalizedTransactionFee: 0,
        writer: 'writer',
    };
};
var getBlock = function (provider, blockHashOrBlockNumber) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, provider.getBlock(blockHashOrBlockNumber)];
    });
}); };
var getBlockchainTime = function (provider, blockHashOrBlockNumber) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var block;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getBlock(provider, blockHashOrBlockNumber)];
            case 1:
                block = _a.sent();
                if (block) {
                    return [2 /*return*/, block.block_number];
                }
                return [2 /*return*/, null];
        }
    });
}); };
var extendSidetreeTransactionWithTimestamp = function (provider, txns) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2 /*return*/, Promise.all(txns.map(function (txn) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                var timestamp;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getBlockchainTime(provider, txn.transactionTime)];
                        case 1:
                            timestamp = _a.sent();
                            if (typeof timestamp === 'number') {
                                return [2 /*return*/, tslib_1.__assign(tslib_1.__assign({}, txn), { transactionTimestamp: timestamp })];
                            }
                            return [2 /*return*/, txn];
                    }
                });
            }); }))];
    });
}); };
//get max fee from the estimated fee as a string
function getMaxFee(overall_fee) {
    var overHeadPercent = Math.round((1 + 0.5) * 100);
    return starknet_1.number.toFelt(starknet_1.number.toBN(overall_fee).mul(starknet_1.number.toBN(overHeadPercent)).div(starknet_1.number.toBN(100)));
}
function hexToUint256(num) {
    var bn = starknet_1.number.toBN(num, 'hex');
    var uint = starknet_1.uint256.bnToUint256(bn);
    return uint;
}
function uint256toHex(low, high) {
    return starknet_1.number.toHex(starknet_1.uint256.uint256ToBN({ low: low, high: high }));
}
exports.default = {
    eventLogToSidetreeTransaction: eventLogToSidetreeTransaction,
    extendSidetreeTransactionWithTimestamp: extendSidetreeTransactionWithTimestamp,
    getAccounts: getAccounts,
    getBlock: getBlock,
    getBlockchainTime: getBlockchainTime,
    getMaxFee: getMaxFee,
    hexToUint256: hexToUint256,
    uint256toHex: uint256toHex
};
//# sourceMappingURL=utils.js.map