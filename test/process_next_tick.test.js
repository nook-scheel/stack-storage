'use strict';

const Storage = require('..');
const { promisify } = require('util');
const compose = require('koa-compose');

const nextTick = promisify(process.nextTick);

describe('process.nextTick', function() {
  it('should save the variable depending on the context', async function() {
    const arr = [];

    const middleware = compose([
      async (ctx, next) => {
        process.storage = new Storage([[ ctx.name, ctx.value ]]);

        await nextTick();

        await next();
      },
      async ctx => {
        const value = process.storage.get(ctx.name);

        arr.push(value);
      },
    ]);

    await Promise.all([
      middleware({ name: 'foo', value: 'bar' }),
      middleware({ name: 'bar', value: 'baz' }),
      middleware({ name: 'baz', value: 'foo' }),
    ]);

    console.assert(arr.includes('bar'));
    console.assert(arr.includes('baz'));
    console.assert(arr.includes('foo'));
  });
});

