# Excel Export & Detailed Logging Feature

## Overview
This feature allows users to export detailed workflow execution logs to Excel (.xlsx) format. It captures every step of the workflow execution, including timestamps, status, input/output data, and error messages.

## Features

### 1. Detailed Logging
The system records the following for each workflow step:
- **Timestamp**: Exact time of execution (DD MMM YYYY HH:mm:ss).
- **Status**: Success, Failure, or other states.
- **Name**: Name of the block executed.
- **Description**: Description of the step.
- **Message**: Any log message or error details.
- **Data**: Context data (inputs, outputs, variables) in JSON format.

### 2. Excel Export
- **Format**: Native Excel (.xlsx) file.
- **Structure**: Flat table with columns: Timestamp, Status, Name, Description, Message, Data.
- **Data Integrity**: Complex data objects are stringified to ensure they fit into a single cell while preserving information.

### 3. Filtering & Search
- **Search Bar**: The existing search bar in the Logs tab now supports filtering by:
  - Block Name
  - Description
  - **Status** (e.g., "error", "success")
  - **Date/Time** (e.g., "14 Jan 2026")
- **Export Scope**: The Excel export respects the current filter. If you filter logs by "error", the exported Excel file will only contain error logs.

## How to Use

1. **Run a Workflow**: Execute any workflow (e.g., Amazon Scraper).
2. **View Logs**: Go to the **Logs** tab of the workflow.
3. **Filter (Optional)**:
   - Type "error" to see failed steps.
   - Type a date (e.g., "2026") to see logs from that year.
4. **Export**:
   - Click the **Export** button (Download icon).
   - Select **Excel** from the dropdown menu.
   - The file will be downloaded automatically.

## Implementation Details
- **Frontend**: Modified `src/components/newtab/logs/LogsHistory.vue`.
- **Library**: Uses `xlsx` (SheetJS) for reliable Excel generation.
- **Filtering**: Enhanced `filteredLog` computed property to include status and timestamp checks.

## Verification
To verify the feature:
1. Run the Amazon JP workflow.
2. Open the Logs page.
3. Verify that all steps (Navigate, Loop, Extract) are listed.
4. Type "Navigate" in the search bar.
5. Click Export -> Excel.
6. Open the downloaded file and confirm it only contains "Navigate" steps.
