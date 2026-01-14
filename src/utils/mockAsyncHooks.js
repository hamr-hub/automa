export class AsyncLocalStorage {
  constructor() {
    this.store = null;
  }

  getStore() {
    return this.store;
  }

  run(store, callback) {
    const oldStore = this.store;
    this.store = store;
    try {
      return callback();
    } finally {
      this.store = oldStore;
    }
  }

  exit(callback) {
    return callback();
  }

  enterWith(store) {
    this.store = store;
  }
}

export default {
  AsyncLocalStorage,
};
