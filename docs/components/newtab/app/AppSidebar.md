# AppSidebar.vue

**Path**: `components/newtab/app/AppSidebar.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [navigateLink](#navigatelink) | function | ❌ | `event, navigateFn, tab` |
| [hoverHandler](#hoverhandler) | function | ❌ | `{}` |
| [injectElementSelector](#injectelementselector) | function | ✅ | `` |
| [handleSignOut](#handlesignout) | function | ✅ | `` |

## Detailed Description

### <a id="navigatelink"></a>navigateLink

- **Type**: `function`
- **Parameters**: `event, navigateFn, tab`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function navigateLink(event, navigateFn, tab) {
  event.preventDefault();

  if (tab.id === 'log') {
    emitter.emit('ui:logs', { show: true });
  } else {
    navigateFn();
  }
}
```

---

### <a id="hoverhandler"></a>hoverHandler

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function hoverHandler({ target }) {
  showHoverIndicator.value = true;
  hoverIndicator.value.style.transform = `translate(-50%, ${target.offsetTop}px)`;
}
```

---

### <a id="injectelementselector"></a>injectElementSelector

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function injectElementSelector() {
  try {
    const [tab] = await browser.tabs.query({ active: true, url: '*://*/*' });
    if (!tab) {
      toast.error(t('home.elementSelector.noAccess'));
      return;
    }

    await initElementSelector();
  } catch (error) {
    console.error(error);
  }
}
```

---

### <a id="handlesignout"></a>handleSignOut

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleSignOut() {
  try {
    await signOut();
    // 登出成功后,路由守卫会自动重定向到登录页
    toast.success(t('auth.signOutSuccess', '退出登录成功'));
  } catch (error) {
    console.error('Sign out error:', error);
    toast.error(t('auth.signOutFailed', '退出登录失败'));
  }
}
```

---

