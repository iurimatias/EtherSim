var Blockchain = require('../lib/manager.js');
var Provider = require('../lib/provider.js');
var Web3 = require('web3');
var assert = require('assert');

describe('fastrpc.manager', function() {
  const TEST_ACCOUNTS = 10;
  var block, contractAddress, manager, web3;

  beforeEach(function(done) {
    manager = new Manager();
    web3 = new Web3(new Provider(manager));
    manager.createAccounts(TEST_ACCOUNTS, done);
  });

  describe("#request", function() {

    describe("eth_accounts", function() {
      it("should return list of addresses", function() {
        var accounts = web3.eth.accounts;
        assert.deepEqual(accounts.length, TEST_ACCOUNTS);
      });
    });

  describe("eth_blockNumber", function() {
    it("should return correct block number", function() {
      var number = web3.eth.blockNumber;
      assert.deepEqual(number, 0);

      manager.mine();

      var number = web3.eth.blockNumber;
      assert.deepEqual(number, 1);
    });
  });

  describe("eth_coinbase", function() {
    it("should return correct address", function() {
      var coinbase = web3.eth.coinbase;

      assert.deepEqual(coinbase, manager.blockchain.accountAddresses()[0]);
    });
  });

  describe("eth_mining", function() {
    it("should return correct address", function() {
      var mining = web3.eth.mining;

      assert.deepEqual(mining, false);
    });
  });

  describe("eth_hashrate", function() {
    it("should return hashrate", function() {
      var hashrate = web3.eth.hashrate;

      assert.deepEqual(hashrate, 0);
    });
  });

  describe("eth_gasPrice", function() {
    it("should return gas price", function() {
      var gasPrice = web3.eth.gasPrice;
      assert.deepEqual(gasPrice.toNumber(), '1');
    });
  });

  describe("eth_getBalance", function() {
    it("should return balance", function(done) {
      var balance = web3.eth.getBalance(web3.eth.accounts[0], function(err, result) {
        assert.deepEqual(result.toNumber(), 0);
        done();
      });
    });
  });

  describe("ethersim_setBalance", function() {
    it("should set the account balance", function(done) {
      var targetBalance = 5;
      var account = web3.eth.accounts[0];
      var checkBalance = function () {
        web3.eth.getBalance(account, function(err, result) {
          assert.deepEqual(result.toNumber(), targetBalance);
          done();
        });
      };
      manager.ethersim_setBalance(account, targetBalance, checkBalance);
    });
  });

  describe("eth_getStorageAt", function() {
    it("should return storage at a specific position"); //, function() {
  });

  describe("eth_getCode", function() {
    var account, transactionHash;
    var code = '0x60606040525b60646000600050819055505b60c280601e6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480632a1afcd914604b57806360fe47b114606a5780636d4ce63c14607b576049565b005b6054600450609a565b6040518082815260200191505060405180910390f35b607960048035906020015060a3565b005b608460045060b1565b6040518082815260200191505060405180910390f35b60006000505481565b806000600050819055505b50565b6000600060005054905060bf565b9056';

    beforeEach(function(done) {
      account = web3.eth.accounts[0];
      manager.ethersim_setBalance(account, 100000000, function () {
        web3.eth.sendTransaction({
          from: account,
          data: code
        }, function(err, result) {
          transactionHash = result;
          done();
        });
      });
    });

    it("should return code at a specific address", function() {
      var receipt = web3.eth.getTransactionReceipt(transactionHash);
      var result = web3.eth.getCode(receipt.contractAddress);

      assert.deepEqual(result, code);
    });
  });

  describe("eth_getBlockByNumber", function() {
    it("should return block given the block number", function() {
      block = manager.blockchain.blocks[0];
      var blockHash = web3.eth.getBlock(0);

      resultHash = {
        number: 0,
        hash: blockHash.hash,
        parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        nonce: '0x0',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        transactionsRoot: undefined,
        stateRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
        receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        miner: '0x0000000000000000000000000000000000000000',
        difficulty: { s: 1, e: 0, c: [ 0 ] },
        totalDifficulty: { s: 1, e: 0, c: [ 0 ] },
        extraData: '0x0',
        size: 1000,
        gasLimit: 3141592,
        gasUsed: 0,
        timestamp: blockHash.timestamp,
        transactions: [],
        uncles: []
      }

      assert.deepEqual(blockHash, resultHash);
    });
  });

  describe("eth_getBlockByHash", function() {
    it("should return block given the block hash", function() {
      block = manager.blockchain.blocks[0];
      block = web3.eth.getBlock(0);
      var blockHash = web3.eth.getBlock(block.hash);

      resultHash = {
        number: 0,
        hash: blockHash.hash,
        parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        nonce: '0x0',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        transactionsRoot: undefined,
        stateRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
        receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        miner: '0x0000000000000000000000000000000000000000',
        difficulty: { s: 1, e: 0, c: [ 0 ] },
        totalDifficulty: { s: 1, e: 0, c: [ 0 ] },
        extraData: '0x0',
        size: 1000,
        gasLimit: 3141592,
        gasUsed: 0,
        timestamp: blockHash.timestamp,
        transactions: [],
        uncles: []
      };

      assert.deepEqual(blockHash, resultHash);
    });
  });

  describe("eth_getBlockTransactionCountByNumber", function() {
    it("should return number of transactions in a given block"); //, function() {
  });

  describe("eth_getBlockTransactionCountByHash", function() {
    it("should return number of transactions in a given block"); //, function() {
  });

  describe("eth_getUncleByBlockNumberAndIndex", function() {
    it("should return uncles in a given block"); //, function() {
  });

  describe("eth_getUncleByBlockHashAndIndex", function() {
    it("should return uncles in a given block"); //, function() {
  });

  describe("eth_getTransactionByHash", function() {
    it("should return transaction"); //, function() {
  });

  describe("eth_getTransactionByBlockNumberAndIndex", function() {
    it("should return transaction"); //, function() {
  });

  describe("eth_getTransactionByBlockHashAndIndex", function() {
    it("should return transaction"); //, function() {
  });

  describe("eth_getTransactionReceipt", function() {
    var account, transactionHash;

    beforeEach(function(done) {
      account = web3.eth.accounts[0];
      manager.ethersim_setBalance(account, 100000000, done);
    });

    describe("contract creation", function() {
      beforeEach(function(done) {
        var code = '60606040525b60646000600050819055505b60c280601e6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480632a1afcd914604b57806360fe47b114606a5780636d4ce63c14607b576049565b005b6054600450609a565b6040518082815260200191505060405180910390f35b607960048035906020015060a3565b005b608460045060b1565b6040518082815260200191505060405180910390f35b60006000505481565b806000600050819055505b50565b6000600060005054905060bf565b9056';

        web3.eth.sendTransaction({
          from: account,
          data: code
        }, function(err, txHash) {
          transactionHash = txHash;
          done();
        });
      });

      it("should return receipt", function() {
        var receipt = web3.eth.getTransactionReceipt(transactionHash);
        assert(/^0x[a-f0-9]+$/.test(receipt.contractAddress));
      });

    });
  });

  describe("eth_getTransactionCount", function() {
    it("should return number of transactions sent from an address"); //, function() {
  });

  describe("eth_sendTransaction", function() {

    var account;

    beforeEach(function(done) {
      account = web3.eth.accounts[0];
      manager.ethersim_setBalance(account, 100000000, done);
    });

    describe("sending funds", function() {
      var transactionHash = "";

      beforeEach(function (done) {
        web3.eth.sendTransaction({
          from: account,
          to: web3.eth.accounts[1],
          value: 12345
        }, function(error, result) {
          transactionHash = result;
          done();
        });
      });

      it("should transfer funds", function(done) {
        web3.eth.getBalance(web3.eth.accounts[1], function(error, results) {
          assert.deepEqual(results.toNumber(), 12345);
          done();
        });
      });

      it("should return receipt", function() {
        var receipt = web3.eth.getTransactionReceipt(transactionHash);
        assert.deepEqual(receipt.transactionHash, transactionHash);
      });
    });
  });

  describe("contract creation", function() {
    var tokenSource, tokenCompiled;

    beforeEach(function() {
      tokenSource = 'contract token { mapping (address => uint) public coinBalanceOf; event CoinTransfer(address sender, address receiver, uint amount); function token(uint supply) { if (supply == 0) supply = 10000; coinBalanceOf[msg.sender] = supply; } function sendCoin(address receiver, uint amount) returns(bool sufficient) { if (coinBalanceOf[msg.sender] < amount) return false; coinBalanceOf[msg.sender] -= amount; coinBalanceOf[receiver] += amount; CoinTransfer(msg.sender, receiver, amount); return true; } }'

      tokenCompiled = web3.eth.compile.solidity(tokenSource)
    });

    it("should create contract correct", function(done) {
      var account = web3.eth.accounts[0];

      manager.ethersim_setBalance(account, 100000000, function () {
        var supply = 10000;
        var tokenContract = web3.eth.contract(tokenCompiled.token.info.abiDefinition);
        var token = tokenContract.new(supply, { from:account, data:tokenCompiled.token.code, gas: 1000000 }, function(e, contract) {
          if(!e) {
            if(!contract.address) {
              console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");
            } else {
              console.log("Contract mined! Address: " + contract.address);
            }
          }
          else {
            throw new Error("ERROR CREATING CONTRACT");
          }
          done();
        });
      });
    });
  });

    describe("eth_call", function() {
      var callResult;

      beforeEach(function(done) {
        var account = web3.eth.accounts[0];
        var code = '60606040525b60646000600050819055505b60c280601e6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480632a1afcd914604b57806360fe47b114606a5780636d4ce63c14607b576049565b005b6054600450609a565b6040518082815260200191505060405180910390f35b607960048035906020015060a3565b005b608460045060b1565b6040518082815260200191505060405180910390f35b60006000505481565b806000600050819055505b50565b6000600060005054905060bf565b9056';

        block = manager.blockchain.blocks[0];

        manager.ethersim_setBalance(account, 100000000, function () {
          web3.eth.sendTransaction({
            from: account,
            data: code

          }, function(error, txHash) {
            var receipt = web3.eth.getTransactionReceipt(txHash);

            web3.eth.call({
              from: account,
              data: '0x6d4ce63c',
              to: receipt.contractAddress

            }, function(error, _callResult) {
              callResult = _callResult;
              done();
            });
          });
        });
      });

      it("should return value", function() {
        assert.deepEqual(eval(callResult), 100);
      });
    });
  });
});

