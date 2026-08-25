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

function handler(event) {
  var request = event.request;
  var host = request.headers.host && request.headers.host.value;

  // Pass through when the host is already canonical, and when it is missing —
  // failing open here beats redirect-looping an oddly shaped request.
  if (!host || host === CANONICAL_HOST) {
    return request;
  }

  var pairs = [];
  for (var key in request.querystring) {
    var parameter = request.querystring[key];
    if (parameter.multiValue) {
      for (var i = 0; i < parameter.multiValue.length; i++) {
        pairs.push(key + '=' + parameter.multiValue[i].value);
      }
    } else {
      pairs.push(key + '=' + parameter.value);
    }
  }

  var query = pairs.length ? '?' + pairs.join('&') : '';

  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: 'https://' + CANONICAL_HOST + request.uri + query },
      'cache-control': { value: 'max-age=3600' }
    }
  };
}
