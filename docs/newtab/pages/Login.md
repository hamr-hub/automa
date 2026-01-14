# Login.vue

**Path**: `newtab/pages/Login.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [handleLogin](#handlelogin) | function | ✅ | `` |
| [handleRegister](#handleregister) | function | ✅ | `` |

## Detailed Description

### <a id="handlelogin"></a>handleLogin

- **Type**: `function`
- **Parameters**: ``
- **Description**:

Login handler

**Implementation**:
```javascript
async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    await supabaseClient.signInWithPassword(form.value.email, form.value.password);
    
    // Login successful, redirect to main page
    router.push('/');
  } catch (err) {
    console.error('Login error:', err);
    error.value = err.message || t('auth.loginFailed', '登录失败，请检查邮箱和密码');
  } finally {
    loading.value = false;
  }
// ...
```

---

### <a id="handleregister"></a>handleRegister

- **Type**: `function`
- **Parameters**: ``
- **Description**:

Register handler

**Implementation**:
```javascript
async function handleRegister() {
  registerLoading.value = true;
  registerError.value = '';

  // Validate passwords match
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = t('auth.passwordMismatch', '两次输入的密码不一致');
    registerLoading.value = false;
    return;
  }

  try {
    await supabaseClient.signUp(
      registerForm.value.email,
      registerForm.value.password
// ...
```

---

