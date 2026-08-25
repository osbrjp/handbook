// Run with: node --test infra/functions/*.test.mjs
//
// The function file is what Terraform uploads, so the test loads that exact
// source and substitutes the placeholder the same way templatefile does.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./canonical-host.js', import.meta.url), 'utf8')
  .replace('${canonical_host}', 'handbook.osbrjp.com');

const context = vm.createContext({});
vm.runInContext(`${source}\nglobalThis.handler = handler;`, context);
const { handler } = context;

const requestOn = (host, uri = '/', querystring = {}) => ({
  request: {
    method: 'GET',
    uri,
    querystring,
    headers: host === null ? {} : { host: { value: host } },
    cookies: {},
  },
});

test('passes a request on the canonical host straight through', () => {
  const event = requestOn('handbook.osbrjp.com', '/what-is-handbook');
  assert.equal(handler(event), event.request);
});

test('redirects the distribution domain to the canonical host', () => {
  const result = handler(requestOn('d111111abcdef8.cloudfront.net', '/what-is-handbook'));

  assert.equal(result.statusCode, 301);
  assert.equal(
    result.headers.location.value,
    'https://handbook.osbrjp.com/what-is-handbook',
  );
});

test('keeps the query string when redirecting', () => {
  const result = handler(
    requestOn('d111111abcdef8.cloudfront.net', '/api/auth/callback', {
      code: { value: 'abc123' },
      state: { value: 'xyz' },
    }),
  );

  assert.equal(
    result.headers.location.value,
    'https://handbook.osbrjp.com/api/auth/callback?code=abc123&state=xyz',
  );
});

test('keeps every value of a repeated query parameter', () => {
  const result = handler(
    requestOn('d111111abcdef8.cloudfront.net', '/search', {
      tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }] },
    }),
  );

  assert.equal(result.headers.location.value, 'https://handbook.osbrjp.com/search?tag=a&tag=b');
});

test('passes through when the request carries no host header', () => {
  const event = requestOn(null);
  assert.equal(handler(event), event.request);
});
