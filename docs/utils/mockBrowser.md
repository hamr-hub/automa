# mockBrowser.js

**Path**: `utils/mockBrowser.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getManifest](#getmanifest) | object_property_method | ❌ | `` |
| [getURL](#geturl) | object_property_method | ❌ | `path` |
| [getContexts](#getcontexts) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [sendMessage](#sendmessage) | object_property_method | ❌ | `` |
| [createDocument](#createdocument) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [create](#create) | object_property_method | ❌ | `` |
| [clear](#clear) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [create](#create) | object_property_method | ❌ | `` |
| [removeAll](#removeall) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [create](#create) | object_property_method | ❌ | `` |
| [removeAll](#removeall) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [get](#get) | object_property_method | ❌ | `keys` |
| [set](#set) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [remove](#remove) | object_property_method | ❌ | `` |
| [get](#get) | object_property_method | ❌ | `` |
| [set](#set) | object_property_method | ❌ | `` |
| [query](#query) | object_property_method | ❌ | `` |
| [create](#create) | object_property_method | ❌ | `` |
| [update](#update) | object_property_method | ❌ | `` |
| [remove](#remove) | object_property_method | ❌ | `` |
| [sendMessage](#sendmessage) | object_property_method | ❌ | `` |
| [get](#get) | object_property_method | ❌ | `` |
| [group](#group) | object_property_method | ❌ | `` |
| [reload](#reload) | object_property_method | ❌ | `` |
| [goBack](#goback) | object_property_method | ❌ | `` |
| [goForward](#goforward) | object_property_method | ❌ | `` |
| [setZoom](#setzoom) | object_property_method | ❌ | `` |
| [captureTab](#capturetab) | object_property_method | ❌ | `` |
| [captureVisibleTab](#capturevisibletab) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [getCurrent](#getcurrent) | object_property_method | ❌ | `` |
| [update](#update) | object_property_method | ❌ | `` |
| [get](#get) | object_property_method | ❌ | `` |
| [create](#create) | object_property_method | ❌ | `` |
| [getAll](#getall) | object_property_method | ❌ | `` |
| [remove](#remove) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [setBadgeText](#setbadgetext) | object_property_method | ❌ | `` |
| [setBadgeBackgroundColor](#setbadgebackgroundcolor) | object_property_method | ❌ | `` |
| [getMessage](#getmessage) | object_property_method | ❌ | `key` |
| [getUILanguage](#getuilanguage) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [getAllFrames](#getallframes) | object_property_method | ❌ | `` |
| [clear](#clear) | object_property_method | ❌ | `` |
| [set](#set) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [detach](#detach) | object_property_method | ❌ | `` |
| [attach](#attach) | object_property_method | ❌ | `` |
| [sendCommand](#sendcommand) | object_property_method | ❌ | `` |
| [contains](#contains) | object_property_method | ❌ | `` |
| [request](#request) | object_property_method | ❌ | `` |
| [get](#get) | object_property_method | ❌ | `` |
| [getAll](#getall) | object_property_method | ❌ | `` |
| [remove](#remove) | object_property_method | ❌ | `` |
| [set](#set) | object_property_method | ❌ | `` |
| [search](#search) | object_property_method | ❌ | `` |
| [download](#download) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [create](#create) | object_property_method | ❌ | `` |
| [addListener](#addlistener) | object_property_method | ❌ | `` |
| [isAllowedFileSchemeAccess](#isallowedfileschemeaccess) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="getmanifest"></a>getManifest

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getManifest: () => ({ version: '1.29.12' })
```

---

### <a id="geturl"></a>getURL

- **Type**: `object_property_method`
- **Parameters**: `path`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getURL: (path) => path
```

---

### <a id="getcontexts"></a>getContexts

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getContexts: () => Promise.resolve([])
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="sendmessage"></a>sendMessage

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
sendMessage: () => Promise.resolve({})
```

---

### <a id="createdocument"></a>createDocument

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
createDocument: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: () => {}
```

---

### <a id="clear"></a>clear

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
clear: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: () => {}
```

---

### <a id="removeall"></a>removeAll

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
removeAll: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: () => {}
```

---

### <a id="removeall"></a>removeAll

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
removeAll: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="get"></a>get

- **Type**: `object_property_method`
- **Parameters**: `keys`
- **Description**: *No description provided.*

**Implementation**:
```javascript
get: (keys) => {
        const data = {
          isFirstTime: false,
          workflowStates: {},
          isRecording: false,
        };
        if (typeof keys === 'string') return Promise.resolve({ [keys]: data[keys] });
        return Promise.resolve(data);
      }
```

---

### <a id="set"></a>set

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
set: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="remove"></a>remove

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
remove: () => Promise.resolve()
```

---

### <a id="get"></a>get

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get: () => Promise.resolve({})
```

---

### <a id="set"></a>set

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
set: () => Promise.resolve()
```

---

### <a id="query"></a>query

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
query: () => Promise.resolve([{ id: 1, windowId: 1 }])
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: () => Promise.resolve({ id: 2 })
```

---

### <a id="update"></a>update

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
update: () => Promise.resolve()
```

---

### <a id="remove"></a>remove

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
remove: () => Promise.resolve()
```

---

### <a id="sendmessage"></a>sendMessage

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
sendMessage: () => Promise.resolve()
```

---

### <a id="get"></a>get

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get: () => Promise.resolve({})
```

---

### <a id="group"></a>group

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
group: () => Promise.resolve()
```

---

### <a id="reload"></a>reload

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**:

Mock chrome.tabs.group

**Implementation**:
```javascript
reload: () => Promise.resolve()
```

---

### <a id="goback"></a>goBack

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
goBack: () => Promise.resolve()
```

---

### <a id="goforward"></a>goForward

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
goForward: () => Promise.resolve()
```

---

### <a id="setzoom"></a>setZoom

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
setZoom: () => Promise.resolve()
```

---

### <a id="capturetab"></a>captureTab

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
captureTab: () => Promise.resolve('')
```

---

### <a id="capturevisibletab"></a>captureVisibleTab

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
captureVisibleTab: () => Promise.resolve('')
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="getcurrent"></a>getCurrent

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getCurrent: () => Promise.resolve({ type: 'popup', id: 1 })
```

---

### <a id="update"></a>update

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
update: () => Promise.resolve()
```

---

### <a id="get"></a>get

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get: () => Promise.resolve({})
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: () => Promise.resolve({})
```

---

### <a id="getall"></a>getAll

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getAll: () => Promise.resolve([])
```

---

### <a id="remove"></a>remove

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
remove: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="setbadgetext"></a>setBadgeText

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
setBadgeText: () => Promise.resolve()
```

---

### <a id="setbadgebackgroundcolor"></a>setBadgeBackgroundColor

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
setBadgeBackgroundColor: () => Promise.resolve()
```

---

### <a id="getmessage"></a>getMessage

- **Type**: `object_property_method`
- **Parameters**: `key`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getMessage: (key) => key
```

---

### <a id="getuilanguage"></a>getUILanguage

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getUILanguage: () => 'en'
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="getallframes"></a>getAllFrames

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getAllFrames: () => Promise.resolve([])
```

---

### <a id="clear"></a>clear

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
clear: () => Promise.resolve()
```

---

### <a id="set"></a>set

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
set: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="detach"></a>detach

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
detach: () => Promise.resolve()
```

---

### <a id="attach"></a>attach

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
attach: () => Promise.resolve()
```

---

### <a id="sendcommand"></a>sendCommand

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
sendCommand: () => Promise.resolve()
```

---

### <a id="contains"></a>contains

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
contains: () => Promise.resolve(true)
```

---

### <a id="request"></a>request

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
request: () => Promise.resolve(true)
```

---

### <a id="get"></a>get

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get: () => Promise.resolve({})
```

---

### <a id="getall"></a>getAll

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getAll: () => Promise.resolve([])
```

---

### <a id="remove"></a>remove

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
remove: () => Promise.resolve()
```

---

### <a id="set"></a>set

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
set: () => Promise.resolve()
```

---

### <a id="search"></a>search

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
search: () => Promise.resolve([])
```

---

### <a id="download"></a>download

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
download: () => Promise.resolve(1)
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: () => Promise.resolve()
```

---

### <a id="addlistener"></a>addListener

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
addListener: () => {}
```

---

### <a id="isallowedfileschemeaccess"></a>isAllowedFileSchemeAccess

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
isAllowedFileSchemeAccess: () => Promise.resolve(false)
```

---

