var async = require('async');
var Blockchain = require('./blockchain.js');
var Compiler = require('./compiler.js');
var fs = require('fs');
var utils = require('ethereumjs-util');
var optionalCallback = require('./utils.js').optionalCallback;
var pkg = require('../package.json');
require('datejs');

Manager = function () {
  this.blockchain = new Blockchain();
}

Manager.prototype.createAccounts = function(initialAccounts, callback) {
  var self = this;
  // Add accounts for testing purposes.
  if (typeof(initialAccounts) == 'function') {
    return initialAccounts();
  }

  async.times(initialAccounts, function(n, next) {
    self.blockchain.addAccount(next);
  }, callback);
};

Manager.prototype.mine = function() {
  this.blockchain.mine();
}

Manager.prototype.reset = function() {
  this.blockchain = new Blockchain();
}

Manager.prototype.jump = function(text) {
  var seconds = (Date.parse(text) - Date.parse("now")) / 1000 | 0;
  this.blockchain.increaseTime(seconds);
}

Manager.prototype.response = function(params, result) {
  return {"id":params.id,"jsonrpc":"2.0","result":result};
}

// Handle individual requests.

Manager.prototype.request = function(params, cb) {
  if (Object.prototype.toString.call(params) === '[object Array]') {
    var results = [];
    for (var i=0; i < params.length; i+=1) {
      results.push(this.request(params[i]));
    }
    return cb(null, results);
  }

  var fn = this[params.method];
  var args = params.params || [];

  if (cb) {
    var that = this;
    args.push(function (err, res) {
      try {
        return cb(err, that.response(params, res));
      } catch (err) {
        if (err == ["TypeError: Cannot read property 'stopWatching' of undefined]"]) {
          // TODO: weird edge case when deploying embark tests
          return cb(err, null);
        }
        else {
          return cb(err, that.response(params, res));
        }
      }
    });
  }

  var result = fn.apply(this, args);

  return this.response(params, result);
};

Manager.prototype.eth_accounts = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.accountAddresses());
};

Manager.prototype.eth_blockNumber = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.toHex(this.blockchain.blockNumber()));
};

Manager.prototype.eth_coinbase = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.coinbase);
};

Manager.prototype.eth_mining = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, false);
};

Manager.prototype.eth_hashrate = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, '0x' + utils.intToHex(0));
};

Manager.prototype.eth_gasPrice = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, '0x' + this.blockchain.gasPrice());
};

Manager.prototype.eth_getBalance = function(address, block_number, callback) {
  if (callback !== undefined) this.blockchain.getBalance(address, callback);
  return "please use an async call";
};

Manager.prototype.ethersim_setBalance = function(address, balance, callback) {
  this.blockchain.setBalance(address, balance, callback);
};

Manager.prototype.eth_getCode = function(address, block_number, callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.getCode(address));
};

Manager.prototype.eth_getBlockByNumber = function(block_number, include_transactions, callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.getBlockByNumber(block_number));
};

Manager.prototype.eth_getBlockByHash = function(block_hash, include_transactions, callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.getBlockByHash(block_hash));
};

Manager.prototype.eth_getTransactionReceipt = function(tx_hash, callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.getTransactionReceipt(tx_hash));
};

Manager.prototype.eth_getTransactionByHash = function(tx_hash, callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.getTransactionByHash(tx_hash));
}

Manager.prototype.eth_getTransactionCount = function(address, block_number, callback) {
  callback = optionalCallback(callback);
  this.blockchain.getTransactionCount(address, callback);
}

Manager.prototype.eth_sendTransaction = function(tx_data, callback) {
  callback = optionalCallback(callback);
  this.blockchain.queueTransaction(tx_data, callback);
};

Manager.prototype.eth_sendRawTransaction = function(rawTx, callback) {
  callback = optionalCallback(callback);
  return callback(new Error("eth_sendRawTransaction not implemented yet, but it will be soon"));
};

Manager.prototype.eth_call = function(tx_data, block_number, callback) {
  callback = optionalCallback(callback);
  this.blockchain.queueCall(tx_data, callback);
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
  callback = optionalCallback(callback);
  return callback(null, [blockHash]);
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
  callback = optionalCallback(callback);
  return callback(null, compiled);
};

Manager.prototype.web3_clientVersion = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, "EtherSim/v" + pkg.version + "/ethereum-js")
};

/* Functions for testing purposes only. */

Manager.prototype.evm_snapshot = function(callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.snapshot());
};

Manager.prototype.evm_revert = function(snapshot_id, callback) {
  callback = optionalCallback(callback);
  return callback(null, this.blockchain.revert(snapshot_id));
};

module.exports = Manager;
