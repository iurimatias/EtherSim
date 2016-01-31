var assert = require('assert');
var utils = require('../lib/utils.js');

describe('utils.optionalCallback', function() {
  var expectedReturn = true;
  var expectedError = "Example error message";

  var exampleFunction = function (cb) {
    cb = utils.optionalCallback(cb);
    return cb(null, expectedReturn);
  };

  var errorFunction = function (cb) {
    cb = utils.optionalCallback(cb);
    return cb(expectedError);
  };

  it("should return callback arguments when no callback is supplied", function () {
    assert.equal(exampleFunction(), expectedReturn);
  });

  it("should not return callback arguments when a callback is supplied", function () {
    var noop = function () {};
    assert.equal(exampleFunction(noop), undefined);
  });

  it("should return callback errors when no callback is supplied", function () {
    assert.equal(errorFunction(), expectedError);
  });

  it("should not return callback errors when a callback is supplied", function () {
    var noop = function () {};
    assert.equal(errorFunction(noop), undefined);
  });

  it("should pass callback arguments to the given callback", function (done) {
    exampleFunction(function (err, res) {
      assert.equal(err, null);
      assert.equal(res, expectedReturn);
      done();
    });
  });

  it("should pass callback errors to the given callback", function (done) {
    errorFunction(function (err, _) {
      assert.equal(err, expectedError);
      done();
    });
  });
});
