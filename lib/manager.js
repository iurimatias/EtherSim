var Blockchain = require('./blockchain.js');
var Compiler = require('./compiler.js');
var utils = require('ethereumjs-util');
var fs = require('fs');
var async = require('async');
var pkg = require('../package.json');

Manager = function () {
  this.blockchain = new Blockchain();
}

Manager.prototype.initialize = function(callback) {
  var self = this;
  // Add 10 accounts, for testing purposes.
  async.times(10, function(n, next) {
    self.blockchain.addAccount(next);
  }, callback);
};

Manager.prototype.mine = function() {
  this.blockchain.mine();
}

Manager.prototype.response = function(params, result) {
  return {"id":params.id,"jsonrpc":"2.0","result":result};
}

// Handle individual requests.

Manager.prototype.request = function(params, cb) {
  var fn = this[params.method];
  var args = params.params;
  args.push(cb);

  var result = fn.apply(this, args);
  return this.response(params, result);
}

Manager.prototype.eth_accounts = function(callback) {
  if (callback !== undefined) callback(null, this.blockchain.accountAddresses());
  return this.blockchain.accountAddresses();
};

Manager.prototype.eth_blockNumber = function(callback) {
  if (callback !== undefined) callback(null, this.blockchain.toHex(this.blockchain.blockNumber()));
  return this.blockchain.toHex(this.blockchain.blockNumber());
  ;
};

Manager.prototype.eth_coinbase = function(callback) {
  if (callback !== undefined) callback(null, this.blockchain.coinbase);
  return this.blockchain.coinbase;
};

Manager.prototype.eth_mining = function(callback) {
  if (callback !== undefined) callback(null, false);
  return false;
};

Manager.prototype.eth_hashrate = function(callback) {
  if (callback !== undefined) callback(null, '0x' + utils.intToHex(0));
  return '0x' + utils.intToHex(0);
};

Manager.prototype.eth_gasPrice = function(callback) {
  if (callback !== undefined) callback(null, '0x' + this.blockchain.gasPrice());
  return '0x' + this.blockchain.gasPrice();
};

Manager.prototype.eth_getBalance = function(address, block_number, callback) {
  if (callback !== undefined) this.blockchain.getBalance(address, callback);
  return "please use an async call";
};

Manager.prototype.eth_getCode = function(address, block_number, callback) {
  if (callback !== undefined) callback(null, this.blockchain.getCode(address));
  return this.blockchain.getCode(address);
};

Manager.prototype.eth_getBlockByNumber = function(block_number, include_transactions, callback) {
  if (callback !== undefined) callback(null, this.blockchain.getBlockByNumber(block_number));
  return this.blockchain.getBlockByNumber(block_number);
};

Manager.prototype.eth_getBlockByHash = function(tx_hash, include_transactions, callback) {
  if (callback !== undefined) callback(null, this.blockchain.getBlockByHash(tx_hash));
  return this.blockchain.getBlockByHash(tx_hash);
};

Manager.prototype.eth_getTransactionReceipt = function(tx_hash, callback) {
  if (callback !== undefined) callback(null, this.blockchain.getTransactionReceipt(tx_hash));
  return this.blockchain.getTransactionReceipt(tx_hash);
};

Manager.prototype.eth_getTransactionByHash = function(tx_hash, callback) {
  if (callback !== undefined) callback(null, this.blockchain.getTransactionByHash(tx_hash));
  return this.blockchain.getTransactionByHash(tx_hash);
}

Manager.prototype.eth_getTransactionCount = function(address, block_number, callback) {
  if (callback !== undefined) callback(null, this.blockchain.getTransactionCount(address, callback));
  return this.blockchain.getTransactionCount(address, callback);
}

Manager.prototype.eth_sendTransaction = function(tx_data, callback) {
  if (callback !== undefined) this.blockchain.queueTransaction(tx_data, callback);
  return this.blockchain.queueTransaction(tx_data);
};

Manager.prototype.eth_sendRawTransaction = function(rawTx, callback) {
  callback(new Error("eth_sendRawTransaction not implemented yet, but it will be soon"));
};

Manager.prototype.eth_call = function(tx_data, block_number, callback) {
  if (callback !== undefined) this.blockchain.queueCall(tx_data, callback);
  return this.blockchain.queueCall(tx_data, callback);
};

Manager.prototype.eth_newBlockFilter = function(callback) {
  var filter_id = utils.addHexPrefix(utils.intToHex(this.blockchain.latest_filter_id));
  this.blockchain.latest_filter_id += 1;
  callback(null, filter_id);
};

Manager.prototype.eth_getFilterChanges = function(filter_id, callback) {
  var blockHash = this.blockchain.latestBlock().hash().toString("hex");
  // Mine a block after each request to getFilterChanges so block filters work.
  this.blockchain.mine();
  callback(null, [blockHash]);
};

Manager.prototype.eth_uninstallFilter = function(filter_id, callback) {
  callback(null, true);
};

Manager.prototype.eth_getCompilers = function(callback) {
  callback(null, ["solidity"]);
}

Manager.prototype.eth_compileSolidity = function(code, callback) {
  var compiler = new Compiler();
  fs.writeFileSync("/tmp/solCompiler.sol", code);
  compiled = compiler.compile_solidity("/tmp/solCompiler.sol");
  if (callback !== undefined) callback(null, compiled);
  return compiled;
};

Manager.prototype.web3_clientVersion = function(callback) {
  if (callback !== undefined) callback(null, "EtherSim/v" + pkg.version + "/ethereum-js")
  return "EtherSim/v" + pkg.version + "/ethereum-js";
};

/* Functions for testing purposes only. */

Manager.prototype.evm_snapshot = function(callback) {
  callback(null, this.blockchain.snapshot());
};

Manager.prototype.evm_revert = function(snapshot_id, callback) {
  callback(null, this.blockchain.revert(snapshot_id));
};

module.exports = Manager;
