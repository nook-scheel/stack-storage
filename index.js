'use strict';

/**
 * Module dependencies.
 */

const asyncHooks = require('async_hooks');

/**
 * Variables.
 */

const pairing = new Map();
const stack = [];

/**
 * Initialize async hook
 */

const asyncHook = asyncHooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {
    if (process.storage !== null && process.storage !== undefined) {
      pairing.set(asyncId, process.storage);
      resource.storage = process.storage;

      if (resource.promise instanceof Promise) {
        resource.promise.storage = process.storage;
      }
    }
  },

  before(asyncId) {
    const current = pairing.get(asyncId);

    if (current !== undefined) {
      current.enter();
    }
  },

  after(asyncId) {
    const current = pairing.get(asyncId);

    if (current !== undefined) {
      current.exit();
    }
  },

  destroy(asyncId) {
    pairing.delete(asyncId);
  },
});

/**
 * Storage.
 */

class Storage extends Map {
  constructor(...args) {
    super(...args);

    asyncHook.enable();
  }

  enter() {
    process.storage = this;
    stack.push(this);
  }

  exit() {
    const index = stack.lastIndexOf(this);

    if (index === -1) {
      return;
    }

    stack.splice(index);

    process.storage = stack[stack.length - 1];
  }
}

module.exports = Storage;

