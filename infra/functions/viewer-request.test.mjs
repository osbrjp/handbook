// Run with: node --test infra/functions/*.test.mjs
//
// The function file is what Terraform uploads, so the test loads that exact
// source and substitutes the placeholders the same way templatefile does. The
// redirect is compiled in or out, so both variants are built and tested.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const CANONICAL = 'handbook.osbrjp.com';
const WORKER = 'osbr-handbook.osbrjp.workers.dev';
const DISTRIBUTION = 'd111111abcdef8.cloudfront.net';

const source = readFileSync(new URL('./viewer-request.js', import.meta.url), 'utf8');

const build = (redirectToCanonical) => {
  const rendered = source
    .replaceAll('${canonical_host}', CANONICAL)
    .replaceAll('${worker_host}', WORKER)
    .replaceAll('${redirect_to_canonical}', String(redirectToCanonical));

  const context = vm.createContext({});
  vm.runInContext(`${rendered}\nglobalThis.handler = handler;`, context);
  return context.handler;
};

const afterCutover = build(true);
const beforeCutover = build(false);

const requestOn = (host, options = {}) => ({
  request: {
    method: options.method ?? 'GET',
    uri: options.uri ?? '/',
    querystring: options.querystring ?? {},
    headers: {
      ...(host === null ? {} : { host: { value: host } }),
      ...(options.origin ? { origin: { value: options.origin } } : {}),
    },
    cookies: {},
  },
});

// 1. Rewriting Origin — without this every editor write 403s on checkOrigin.

test('translates the public origin to the one the Worker sees', () => {
  const event = requestOn(DISTRIBUTION, {
    method: 'POST',
    origin: `https://${CANONICAL}`,
  });

  const result = afterCutover(event);

  assert.equal(result, event.request);
  assert.equal(result.headers.origin.value, `https://${WORKER}`);
});

test('rewrites Origin before the cutover too, not only after it', () => {
  const event = requestOn(DISTRIBUTION, {
    method: 'POST',
    origin: `https://${CANONICAL}`,
  });

  assert.equal(beforeCutover(event).headers.origin.value, `https://${WORKER}`);
});

test('leaves a cross-site Origin untouched so checkOrigin still rejects it', () => {
  const event = requestOn(CANONICAL, { method: 'POST', origin: 'https://evil.com' });

  assert.equal(afterCutover(event).headers.origin.value, 'https://evil.com');
});

test('leaves a request with no Origin header alone', () => {
  const event = requestOn(CANONICAL, { method: 'POST' });

  assert.equal(afterCutover(event).headers.origin, undefined);
});

// 2. Canonical host redirect — only once DNS points at the distribution.

test('does not redirect before the cutover, so the CloudFront domain is testable', () => {
  const event = requestOn(DISTRIBUTION, { uri: '/what-is-handbook' });

  assert.equal(beforeCutover(event), event.request);
});

test('redirects the distribution domain once the cutover is on', () => {
  const result = afterCutover(requestOn(DISTRIBUTION, { uri: '/what-is-handbook' }));

  assert.equal(result.statusCode, 301);
  assert.equal(result.headers.location.value, `https://${CANONICAL}/what-is-handbook`);
});

test('passes a request on the canonical host straight through', () => {
  const event = requestOn(CANONICAL, { uri: '/what-is-handbook' });

  assert.equal(afterCutover(event), event.request);
});

test('passes through when the request carries no host header', () => {
  const event = requestOn(null);

  assert.equal(afterCutover(event), event.request);
});

test('never redirects a write, which would drop the request body', () => {
  const event = requestOn(DISTRIBUTION, { method: 'POST', uri: '/api/auth/login' });

  assert.equal(afterCutover(event), event.request);
});

test('keeps the query string when redirecting', () => {
  const result = afterCutover(
    requestOn(DISTRIBUTION, {
      uri: '/api/auth/callback',
      querystring: { code: { value: 'abc123' }, state: { value: 'xyz' } },
    }),
  );

  assert.equal(
    result.headers.location.value,
    `https://${CANONICAL}/api/auth/callback?code=abc123&state=xyz`,
  );
});

test('keeps every value of a repeated query parameter', () => {
  const result = afterCutover(
    requestOn(DISTRIBUTION, {
      uri: '/search',
      querystring: { tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }] } },
    }),
  );

  assert.equal(result.headers.location.value, `https://${CANONICAL}/search?tag=a&tag=b`);
});

// 3. Sanitising what reaches the Location header.

test('encodes control characters in a query value instead of emitting them raw', () => {
  const result = afterCutover(
    requestOn(DISTRIBUTION, { querystring: { next: { value: '/a\r\nX-Injected: 1' } } }),
  );

  assert.doesNotMatch(result.headers.location.value, /[\r\n]/);
  assert.equal(
    result.headers.location.value,
    `https://${CANONICAL}/?next=/a%0D%0AX-Injected:%201`,
  );
});

test('encodes control characters in the path as well as the query', () => {
  const result = afterCutover(requestOn(DISTRIBUTION, { uri: '/a\nb' }));

  assert.doesNotMatch(result.headers.location.value, /[\r\n]/);
  assert.equal(result.headers.location.value, `https://${CANONICAL}/a%0Ab`);
});

test('encodes a fragment marker so it cannot truncate the redirect target', () => {
  const result = afterCutover(
    requestOn(DISTRIBUTION, { querystring: { next: { value: 'a#b' } } }),
  );

  assert.equal(result.headers.location.value, `https://${CANONICAL}/?next=a%23b`);
});

test('encodes delimiters so a value cannot smuggle in another parameter', () => {
  const result = afterCutover(
    requestOn(DISTRIBUTION, { querystring: { next: { value: 'a&admin=1' } } }),
  );

  assert.equal(result.headers.location.value, `https://${CANONICAL}/?next=a%26admin%3D1`);
});

test('leaves an already percent-encoded value alone rather than double-encoding it', () => {
  const result = afterCutover(
    requestOn(DISTRIBUTION, {
      uri: '/api/auth/callback',
      querystring: { code: { value: 'abc%2Fdef%20ghi' } },
    }),
  );

  assert.equal(
    result.headers.location.value,
    `https://${CANONICAL}/api/auth/callback?code=abc%2Fdef%20ghi`,
  );
});

test('encodes an unsafe character in the parameter name too', () => {
  const result = afterCutover(requestOn(DISTRIBUTION, { querystring: { 'a b': { value: 'c' } } }));

  assert.equal(result.headers.location.value, `https://${CANONICAL}/?a%20b=c`);
});

test('ignores inherited properties when walking the query string', () => {
  const querystring = Object.create({ inherited: { value: 'leaked' } });
  querystring.real = { value: 'kept' };

  const result = afterCutover(requestOn(DISTRIBUTION, { querystring }));

  assert.equal(result.headers.location.value, `https://${CANONICAL}/?real=kept`);
});
