#!/usr/bin/env node
/**
 * Automa E2E Test Runner
 * Runs comprehensive end-to-end tests for core functionality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m', // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m', // Reset
    };

    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    this.log(`Running: ${description}`, 'info');
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: 120000,
        cwd: path.join(__dirname, '..'),
      });
      this.log(`✓ ${description} completed`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`✗ ${description} failed`, 'error');
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async buildExtension() {
    this.log('Building extension...', 'info');
    const result = await this.runCommand('npm run build', 'Build extension');
    return result.success;
  }

  async runTests(testPattern = 'automa-core-functionality.spec.js') {
    this.log('Running E2E tests...', 'info');

    const testCommand = `npx playwright test tests/e2e/${testPattern} --reporter=list`;
    const result = await this.runCommand(testCommand, 'E2E Tests');

    return result;
  }

  generateReport() {
    const report = {
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        passRate: ((this.passedTests / this.totalTests) * 100).toFixed(2) + '%',
      },
      results: this.testResults,
      timestamp: new Date().toISOString(),
    };

    const reportPath = path.join(
      __dirname,
      'test-results',
      'core-functionality-report.json'
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Report saved to: ${reportPath}`, 'info');

    return report;
  }

  async run() {
    this.log('='.repeat(60), 'info');
    this.log('Automa E2E Test Suite', 'info');
    this.log('='.repeat(60), 'info');

    try {
      // Build extension first
      const buildSuccess = await this.buildExtension();
      if (!buildSuccess) {
        this.log('Build failed, cannot run tests', 'error');
        return false;
      }

      // Run tests
      const testResult = await this.runTests();

      this.log('\n' + '='.repeat(60), 'info');
      this.log('Test Execution Complete', 'info');
      this.log('='.repeat(60), 'info');

      return testResult.success;
    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Main execution
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = TestRunner;
