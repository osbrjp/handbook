// CloudFront viewer-request function. Terraform substitutes canonical_host.
//
// A distribution answers on its own *.cloudfront.net domain as well as on the
// alias, which leaves the handbook reachable at two addresses — bad for links,
// for search engines, and for a cookie scoped to one host. CloudFront has no
// native host-based redirect, so this is the one piece of edge logic we write.
//
// Runtime notes: no template literals (Terraform's templatefile would read
// them), ES5 syntax only, and no request body access.

var CANONICAL_HOST = '${canonical_host}';

// Everything we put in the Location header goes through this: the path, and
// every query string name and value.
//
// It percent-encodes only characters that must never appear in a URL — control
// characters above all, which are what would let a crafted request break out of
// the header. It deliberately leaves '%' alone, so a value that arrived already
// encoded (an OAuth code, a signature) is passed through rather than
// double-encoded. That holds whichever way CloudFront hands us the value.
function escapeUnsafe(value) {
  return value.replace(/[\x00-\x20"<>\\^`{|}\x7F]/g, function (character) {
    return '%' + character.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
  });
}

function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;

  // Pass through when the host is already canonical, and when it is missing —
  // failing open here beats redirect-looping an oddly shaped request.
  if (!host || host === CANONICAL_HOST) {
    return request;
  }

  var querystring = request.querystring;
  var pairs = [];

  for (var key in querystring) {
    if (!Object.prototype.hasOwnProperty.call(querystring, key)) {
      continue;
    }

    var parameter = querystring[key];
    var name = escapeUnsafe(key);

    if (parameter.multiValue) {
      for (var i = 0; i < parameter.multiValue.length; i++) {
        pairs.push(name + '=' + escapeUnsafe(parameter.multiValue[i].value));
      }
    } else {
      pairs.push(name + '=' + escapeUnsafe(parameter.value));
    }
  }

  var query = pairs.length ? '?' + pairs.join('&') : '';

  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: 'https://' + CANONICAL_HOST + escapeUnsafe(request.uri) + query },
      'cache-control': { value: 'max-age=3600' }
    }
  };
}
