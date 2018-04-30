'use strict';

const Storage = require('..');
const { promisify } = require('util');
const compose = require('koa-compose');

const sleep = promisify(setTimeout);

describe('setTimeout', function() {
  it('should save the variable depending on the context', async function() {
    const arr = [];

    const middleware = compose([
      async (ctx, next) => {
        process.storage = new Storage([[ ctx.name, ctx.value ]]);

        await sleep(ctx.delay);

        await next();
      },
      async ctx => {
        const value = process.storage.get(ctx.name);

        arr.push(value);
      },
    ]);

    await Promise.all([
      middleware({ name: 'foo', value: 'bar', delay: 50 }),
      middleware({ name: 'bar', value: 'baz', delay: 61 }),
      middleware({ name: 'baz', value: 'foo', delay: 60 }),
    ]);

    console.assert(arr.includes('bar'));
    console.assert(arr.includes('baz'));
    console.assert(arr.includes('foo'));
  });
});

