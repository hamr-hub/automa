# Test Defects Report

## 1. Defect Summary
During the execution of the End-to-End test suite, the following defects were identified in the test environment (Chromium + Automa Extension Build):

### 1.1 Workflow Persistence Failure
- **Description**: Workflows created in the automated session are not being saved successfully. The "Save" action (via button or Ctrl+S) does not trigger the "Workflow saved" confirmation, and the workflow does not appear in the dashboard subsequently.
- **Impact**: Critical. Prevents verification of workflow execution and lifecycle management in E2E tests.
- **Possible Cause**: 
  - `Control+s` shortcut might be intercepted or ignored in the headless/test browser context.
  - "Save" button visibility relies on specific viewport size or UI state that might be inconsistent in the test runner.
  - Extension storage (IndexedDB) might be failing to initialize or write in the persistent context launched by Playwright.

### 1.2 Logs Modal Accessibility
- **Description**: The Logs modal does not open or populate correctly when triggered via the sidebar.
- **Impact**: High. Prevents verification of workflow execution history.
- **Root Cause**: The expected `.ui-modal` class was changed to `.modal-ui__content-container` (Fixed in test script), but the modal content remains empty ("Items out of 0"), likely due to the workflow not running or not saving.

### 1.3 Drag and Drop Instability
- **Description**: Dragging blocks (e.g., "Delay") from the sidebar to the canvas fails occasionally or requires precise coordinate tuning.
- **Impact**: Medium. Flaky tests for complex workflow construction.

## 2. Recommendations
1.  **Investigate Storage**: Verify if the extension has proper permissions and storage access in the Playwright persistent context.
2.  **Robust Selectors**: Add `data-testid` attributes to critical UI elements (Save button, Sidebar items, Modal) to reduce reliance on fragile CSS selectors or text.
3.  **Mocking**: Consider mocking the storage layer for UI tests if E2E persistence proves unreliable.
