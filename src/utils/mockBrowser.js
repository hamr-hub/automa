const browser = {
  runtime: {
    getManifest: () => ({ version: '1.29.12' }),
    getURL: (path) => path,
    onMessage: { addListener: () => {} },
    sendMessage: () => Promise.resolve({}),
  },
  storage: {
    local: {
      get: (keys) => {
        const data = {
          isFirstTime: false,
          workflowStates: {},
          isRecording: false,
        };
        if (typeof keys === 'string') return Promise.resolve({ [keys]: data[keys] });
        return Promise.resolve(data);
      },
      set: () => Promise.resolve(),
      onChanged: { addListener: () => {} },
      remove: () => Promise.resolve(),
    },
    sync: {
      get: () => Promise.resolve({}),
      set: () => Promise.resolve(),
    },
  },
  tabs: {
    query: () => Promise.resolve([{ id: 1, windowId: 1 }]),
    create: () => Promise.resolve({ id: 2 }),
    update: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    sendMessage: () => Promise.resolve(),
    get: () => Promise.resolve({}),
    group: () => Promise.resolve(), // Mock chrome.tabs.group
    reload: () => Promise.resolve(),
    goBack: () => Promise.resolve(),
    goForward: () => Promise.resolve(),
    setZoom: () => Promise.resolve(),
    captureTab: () => Promise.resolve(''),
    captureVisibleTab: () => Promise.resolve(''),
    onRemoved: { addListener: () => {} },
  },
  windows: {
    getCurrent: () => Promise.resolve({ type: 'popup', id: 1 }),
    update: () => Promise.resolve(),
    get: () => Promise.resolve({}),
    create: () => Promise.resolve({}),
    getAll: () => Promise.resolve([]),
    remove: () => Promise.resolve(),
    onRemoved: { addListener: () => {} },
  },
  action: {
    setBadgeText: () => Promise.resolve(),
    setBadgeBackgroundColor: () => Promise.resolve(),
  },
  i18n: {
    getMessage: (key) => key,
    getUILanguage: () => 'en',
  },
  webNavigation: {
    onCreatedNavigationTarget: { addListener: () => {} },
    onErrorOccurred: { addListener: () => {} },
    getAllFrames: () => Promise.resolve([]),
  },
  proxy: {
    settings: {
      clear: () => Promise.resolve(),
      set: () => Promise.resolve(),
    },
  },
  debugger: {
    onEvent: { addListener: () => {} },
    detach: () => Promise.resolve(),
    attach: () => Promise.resolve(),
    sendCommand: () => Promise.resolve(),
  },
  permissions: {
    contains: () => Promise.resolve(true),
    request: () => Promise.resolve(true),
  },
  cookies: {
    get: () => Promise.resolve({}),
    getAll: () => Promise.resolve([]),
    remove: () => Promise.resolve(),
    set: () => Promise.resolve(),
  },
  downloads: {
    search: () => Promise.resolve([]),
    download: () => Promise.resolve(1),
    onCreated: { addListener: () => {} },
    onChanged: { addListener: () => {} },
    onDeterminingFilename: { addListener: () => {} },
  },
  notifications: {
    create: () => Promise.resolve(),
  },
  extension: {
    isAllowedFileSchemeAccess: () => Promise.resolve(false),
  },
};

// Mock global chrome object
if (typeof window !== 'undefined') {
  window.chrome = browser;
}

export default browser;
