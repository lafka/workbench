const parseDecAddress = function(addr, radix) {
   const res = parseInt(addr, radix)

   return res >= 0 && res <= 0xFFFFFFFF ? res : NaN
}

const parseHexAddress = function(addr) {
    var
      sides = addr.split(/::+/),
      left = sides.slice(0, sides.length - 1)
                  .join(':')
                  .split(':')
                  .filter(x => '' !== x),
      right = sides[sides.length - 1]
                  .split(":")
                  .filter(x => '' !== x),
      results = ['0','0','0','0']

      if (left.length + right.length > 4) {
        return NaN;
      }

      var offset = right.length >= 0 ? 0 : results.length - left.length
      for (var i = 0; i < left.length; i++) {
        results[offset + i] = left[i]
      }

      var n = results.length
      for (var i = right.length - 1; i >= 0; i--) {
        results[--n] = right[i];
      }


      for (var n = 0; n < results.length; n++) {
        results[n] = parseInt(results[n], 16);

        if (isNaN(results[n]) || results[n] < 0 || results[n] > 0xff) {
          return NaN;
        }
      }

      return (results[0] << 24) + (results[1] << 16) + (results[2] << 8) + results[3];
  };

  const parseBinAddress = function(addr) {
    var parts = ["0", "0", "0", "0"]
      .concat(addr.split('.'))
      .filter( (x) => '' !== x )
      .slice(-4);

    for (var i = 0; i < parts.length; i++) {
      parts[i] = parseInt(parts[i], 10);

      if (isNaN(parts[i]) || results[n] < 0 || results[n] > 0xff) {
        return NaN;
      }
    }

    return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  };

  export const parse = function(addr) {
    if (!addr)
      return NaN
    addr = addr.toString();

    if (addr.match(/^[0-9]*$/)) {
      return parseDecAddress(addr, 10);
    } else if (addr.match(/^[0-9:a-fA-F]*$/)) {
      return parseHexAddress(addr);
    } else if (addr.match(/^[0-9.]*$/)) {
      return parseBinAddress(addr);
    } else if (addr.match(/^[0-9A-Z]*$/)) {
      return parseDecAddress(addr, 36);
    }
  };
