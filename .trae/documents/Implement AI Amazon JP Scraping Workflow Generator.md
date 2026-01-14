I will implement the AI-powered Amazon Japan product scraping workflow generator by enhancing the existing LangGraph service and workflow generator.

### 1. Enhance LangGraph Service (`src/services/ai/LangGraphService.js`)
*   **Prompt Engineering**: Update the `inputProcessingNode` system prompt to specifically handle "List-Detail" scraping patterns.
    *   Add explicit instructions: "Use `LOOP_ELEMENTS` for product lists, `CLICK` to open details, `EXTRACT` for data, and `GO_BACK` to return."
    *   Add Amazon-specific context: Instruct the AI to look for Amazon's typical DOM structures (e.g., `s-result-item`, `data-asin`) if `pageContext` is missing or generic.
*   **State Management**: Ensure `pageContext` is correctly prioritized when generating selectors.

### 2. Update Workflow Generator (`src/services/ai/WorkflowGenerator.js`)
*   **New Block Support**: Add support for `GO_BACK` and `CLOSE_TAB` actions in `blockTypeMap` and `createNodeData`.
*   **Loop Logic**: Verify and refine the `loopStack` logic to ensure nested actions (Click -> Extract -> Go Back) are correctly connected within the `loop-elements` block scope.
*   **Excel Export**: Map `EXPORT` type `excel` to Automa's `export-data` block with `csv` or `xlsx` format (depending on Automa's internal capability, usually CSV/JSON is standard, will map to `csv` as "Excel compatible").

### 3. Improve Context Acquisition (`src/services/ai/LangGraphAgent.js`)
*   **Target Tab Detection**: Modify `getPageContext` to intelligently find the target Amazon tab.
    *   If the current tab is the Automa extension page, search for an active or recent `amazon.co.jp` tab to retrieve the DOM context.
    *   This ensures the AI has the actual page structure to analyze even if the user is in the Automa dashboard.

### 4. Verification
*   **Test Case**: Simulate a request "Scrape Amazon JP product details" and verify:
    1.  AI identifies product links.
    2.  Generates a `loop-elements` block.
    3.  Generates `event-click` -> `get-text` -> `go-back` sequence.
    4.  Generates `export-data` block.
    5.  The resulting JSON is valid Automa workflow format.

No major UI changes are required as the existing `AIWorkflowGenerator.vue` already supports the interaction model.
