stack-storage
=================

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/stack-storage.svg?style=flat
[npm-url]: https://npmjs.org/package/stack-storage
[travis-image]: https://img.shields.io/travis/nook-scheel/stack-storage.svg?style=flat
[travis-url]: https://travis-ci.org/nook-scheel/stack-storage
[codecov-image]: https://codecov.io/gh/nook-scheel/stack-storage/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/nook-scheel/stack-storage
[download-image]: https://img.shields.io/npm/dm/stack-storage.svg?style=flat-square
[download-url]: https://npmjs.org/package/stack-storage

an storage on `async_hooks`, hack callstack.

Mandatory use through the variable process.storage

## install

```bash
npm install stack-storage
```

## Usage

```js
const koa = require('koa')
const _ = require('lodash')
const uuid = require('uuid')
const { promisify } = require('util')
const Storage = require('stack-storage')

const sleep = promisify(setTimeout)

const app = new koa()

function log(...args) {
  const xRequestId = process.storage.get('x-request-id')

  console.log(xRequestId, ...args)
}

app.use((ctx, next) => {
  process.storage = new Storage([
    ['x-request-id', _.get(ctx.req.headers, 'x-request-id', `api:${uuid.v4()}`)],
  ])

  return next()
})

app.use(async (ctx, next) => {
  const { method, url } = ctx.request

  log('Incoming message', { method, url })

  await next()

  const { status, body } = ctx

  log('Server response', { status, body })
})

app.use(async (ctx) => {
  // Example async
  await sleep(500)

  ctx.body = 'Hello World'
})

app.listen(3000)
```

## License

[MIT](LICENSE)

