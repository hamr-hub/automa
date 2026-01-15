# Automa E2E Test Plan & Cases

## 1. Test Objectives
To verify the core functionality of Automa, ensuring that users can create, edit, execute, and manage workflows effectively. The tests aim to cover critical business paths including UI interaction, logic control (loops/conditions), data handling, and browser automation.

## 2. Test Environment
- **OS**: Windows (as per current environment)
- **Browser**: Chromium (via Playwright)
- **Extension**: Automa (Build version)
- **Framework**: Playwright

## 3. Test Scenarios & Cases

### 3.1 Dashboard & Navigation
- **Goal**: Ensure the application loads and navigation works.
- **Preconditions**: Extension is installed.
- **Steps**:
  1. Open Extension Dashboard.
  2. Verify Title and Sidebar.
  3. Navigate to "Workflows", "AI Generator", "Settings", "Logs".
- **Expected Result**: All pages load correctly with expected elements.

### 3.2 Workflow Management (CRUD)
- **Goal**: Verify creation, editing, and deletion of workflows.
- **Preconditions**: Dashboard is open.
- **Steps**:
  1. Click "New Workflow".
  2. Enter Name and Description.
  3. Save.
  4. Edit the workflow name.
  5. Delete the workflow.
- **Expected Result**: Workflow is created, updated, and removed from the list.

### 3.3 Core Automation Features
#### 3.3.1 Logic & Flow Control (Conditions)
- **Goal**: Verify conditional branching works.
- **Steps**:
  1. Create a workflow.
  2. Add "Trigger" -> "Conditions" -> "Log Data" (True path) / "Log Data" (False path).
  3. Configure Condition to be True.
  4. Execute.
- **Expected Result**: The "True" path block is executed.

#### 3.3.2 Looping (Loop Data/Elements)
- **Goal**: Verify looping capability.
- **Steps**:
  1. Create a workflow.
  2. Add "Loop Data" with a static array `[1, 2]`.
  3. Add "Log Data" inside the loop.
  4. Execute.
- **Expected Result**: "Log Data" is executed twice.

#### 3.3.3 DOM Interaction (Click, Type, Get Text)
- **Goal**: Verify interaction with web pages.
- **Steps**:
  1. Create a workflow.
  2. Add "New Tab" (open a test page).
  3. Add "Forms" (type into input).
  4. Add "Click Element" (click a button).
  5. Add "Get Text" (verify result).
  6. Execute.
- **Expected Result**: Actions are performed on the page and text is retrieved correctly.

### 3.4 Data & Variables
- **Goal**: Verify variable usage.
- **Steps**:
  1. Create a workflow.
  2. Add "JavaScript Code" to set a variable.
  3. Add "Log Data" to print the variable.
  4. Execute.
- **Expected Result**: The variable value is printed in logs.

### 3.5 AI Features
- **Goal**: Verify AI Generator input.
- **Steps**:
  1. Go to AI Generator.
  2. Input a prompt.
  3. Click Send.
- **Expected Result**: Request is sent (UI feedback).

## 4. Defect Tracking
- Defects will be recorded in `TEST_DEFECTS.md` if any failures occur during automation.

## 5. Reporting
- Playwright HTML Report will be generated at `playwright-report/index.html`.
- A summary `TEST_SUMMARY.md` will be provided after execution.
