module.exports = {
  optionalCallback: function (cb) {
      if (typeof(cb) == 'undefined') {
          return function (err, val) { return err ? err : val; }
      }
      return cb;
  }
};
