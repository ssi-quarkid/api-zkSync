"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarkNetEventResolver = void 0;
var tslib_1 = require("tslib");
var axios_1 = tslib_1.__importDefault(require("axios"));
var StarkNetEventResolver = /** @class */ (function () {
    function StarkNetEventResolver(starkNetNodeUrl) {
        this.starkNetNodeUrl = starkNetNodeUrl;
    }
    StarkNetEventResolver.prototype.getEvents = function (params) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var body, res;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = {
                            "jsonrpc": "2.0",
                            "method": "starknet_getEvents",
                            "params": [params],
                            "id": 2
                        };
                        return [4 /*yield*/, axios_1.default.post(this.starkNetNodeUrl, body)];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data];
                }
            });
        });
    };
    return StarkNetEventResolver;
}());
exports.StarkNetEventResolver = StarkNetEventResolver;
//# sourceMappingURL=StarknetEvents.js.map