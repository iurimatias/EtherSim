----
## Warning: moved

EtherSim has been adopted by [EthereumJS](https://github.com/ethereumjs/) and subsequently refactored to what is now known as [TestRPC](https://github.com/ethereumjs/testrpc)

There is also a [fork](https://github.com/nexusdev/EtherSim) by the amazing guys at [NexusDev](https://github.com/nexusdev/) who did contribute upstream in a true open source spirit. However TestRPC is far better maintained these days and it's recommended devs use it.

What is EtherSim
======

[![Join the chat at https://gitter.im/iurimatias/embark-framework](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/iurimatias/embark-framework?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

EtherSim is a Limited Ethereum RPC simulator for testing and development purposes. EtherSim is used by the [Embark Framework](https://github.com/iurimatias/embark-framework) 1.x series

**warning**

Installation
======

```Bash
$ npm install -g ethersim
```

Usage - as a RPC Server
======

```Bash
$ ethersim
```

Usage - as a Lib
======

Setup

```Javascript
var EtherSim = require('ethersim');
var sim = new EtherSim.init();

var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(sim.provider);
```

Adding accounts

```Javascript
sim.createAccounts(10, function() {})
web3.eth.accounts //=> [..10..accounts..]
```

Set Balance

```Javascript
sim.setBalance(web3.eth.accounts[0], 123450000, function() {})
web3.eth.getBalance(web3.eth.accounts[0], function(err, balance) {console.log(balance.toNumber())}) //=> 123450000

// send ether from one account to another
web3.eth.sendTransaction({value: 1000, from: web3.eth.accounts[0], to: web3.eth.accounts[1], gasLimit: 10000},function() {console.log("transaction sent")})

// mine transaction
sim.mine()
```

Time Travel

```Javascript
web3.eth.getBlock('latest') // => current time

sim.jump("5 hours")
sim.mine();

web3.eth.getBlock('latest') // => will be 5 hours ahead
```

Start Over

```Javascript
sim.reset()
```

