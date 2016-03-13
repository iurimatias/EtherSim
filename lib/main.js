var Server = require('./server.js');
var Provider = require('./provider.js');
var Manager = require('./manager.js');
var argv = require('yargs').argv;

InitObject = function() {
  this.manager  = new Manager();
  this.provider = new Provider(this.manager);

  return this;
}

InitObject.prototype.createAccounts = function(num, cb) { this.manager.createAccounts(num, cb); }
InitObject.prototype.setBalance= function(address, balance, callback) { this.manager.ethersim_setBalance(address, balance, callback); }
InitObject.prototype.mine = function() { this.manager.mine();  }
InitObject.prototype.reset= function() { this.manager.reset(); }
InitObject.prototype.jump = function(seconds) { this.manager.jump(seconds);  }

EtherSim = {
  startServer: function() {
    Server.startServer(argv.p || argv.port);
  },

  Provider: Provider,
  Manager: Manager,

  init: InitObject,

  web3Provider: function() {
    var manager  = new this.Manager();
    var provider = new this.Provider(manager);

    return provider;
  }
}

module.exports = EtherSim;
