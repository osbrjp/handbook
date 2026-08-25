// CloudFront viewer-request function. Terraform substitutes the three values.
//
// Two jobs, neither of which CloudFront configuration can do on its own.
//
// 1. Rewrite Origin, so the editor works at all.
//
//    Cloudflare's edge rejects any Host that is not the workers.dev hostname —
//    reads and writes both, before the Worker executes — so CloudFront has to
//    keep its default Host rewrite. That leaves the Worker seeing
//    workers.dev while the browser sends the public origin, and Astro's
//    security.checkOrigin (pinned on in the Worker's astro.config.mjs)
//    compares the Origin header against the URL the Worker actually received.
//    Every save, approve, reject and delete would 403.
//
//    The Host side cannot be fixed: Host is read-only in viewer-request
//    events. So the other side is. Only the one legitimate public origin is
//    translated — a cross-site POST carries its own Origin, is left untouched,
//    mismatches, and is still rejected. Measured and decided in POC.md,
//    "CHOSEN: CloudFront rewrites the Origin header" (2026-08-21).
//
// 2. Redirect to the canonical host, but only once DNS points here. A
//    distribution answers on its own *.cloudfront.net name as well as on the
//    alias, and CloudFront has no native host-based redirect. Before the
//    cutover the alias still resolves to GitHub Pages, so redirecting then
//    would make the distribution impossible to verify on its own domain.
//
// Runtime notes: no template literals (Terraform's templatefile would read
// them), ES5 syntax apart from padStart, and no request body access.

var CANONICAL_HOST = '${canonical_host}';
var PUBLIC_ORIGIN = 'https://${canonical_host}';
var WORKER_ORIGIN = 'https://${worker_host}';
var REDIRECT_TO_CANONICAL = ${redirect_to_canonical};

// Everything we put in the Location header goes through this: the path, and
// every query string name and value.
//
// It percent-encodes only characters that must never appear in a URL — control
// characters, and the delimiters that would otherwise let a value break out of
// the position it was written into ('#' truncating at a fragment, '&' and '='
// smuggling an extra parameter). It deliberately leaves '%' alone, so a value
// that arrived already encoded (an OAuth code, a signature) is passed through
// rather than double-encoded. That holds whichever way CloudFront hands us the
// value.
function escapeUnsafe(value) {
  return value.replace(/[\x00-\x20"#&<>=?\\^`{|}\x7F]/g, function (character) {
    return '%' + character.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
  });
}

function canonicalLocation(request) {
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

  return 'https://' + CANONICAL_HOST + escapeUnsafe(request.uri) + query;
}

function handler(event) {
  var request = event.request;

  if (request.headers.origin && request.headers.origin.value === PUBLIC_ORIGIN) {
    request.headers.origin = { value: WORKER_ORIGIN };
  }

  var host = request.headers.host && request.headers.host.value;

  // Fail open on a missing host rather than redirect-loop an oddly shaped
  // request. A redirect would also turn a POST into a GET and drop its body,
  // so only safe methods are ever sent to the canonical host.
  var shouldRedirect =
    REDIRECT_TO_CANONICAL &&
    host &&
    host !== CANONICAL_HOST &&
    (request.method === 'GET' || request.method === 'HEAD');

  if (!shouldRedirect) {
    return request;
  }

  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: {
      location: { value: canonicalLocation(request) },
      'cache-control': { value: 'max-age=3600' }
    }
  };
}
