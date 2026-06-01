#!/usr/bin/env node

/**
 * Cypress Test Results Analyzer
 * Analyzes test results and generates actionable insights
 */

const fs = require('fs');
const path = require('path');

class TestAnalyzer {
  constructor() {
    this.insightsDir = path.join(process.cwd(), 'cypress', 'insights');
    this.memoriesDir = path.join(process.cwd(), '.windsurf', 'memories', 'test-results');
    this.results = null;
  }

  async analyze() {
    console.log('🔍 Analyzing Cypress test results...\n');

    // Load latest results
    this.loadLatestResults();

    if (!this.results) {
      console.log('❌ No test results found. Run tests first with: npm run test:learn');
      return;
    }

    // Generate analysis
    this.printSummary();
    this.printFailures();
    this.printFlakyTests();
    this.printSlowTests();
    this.printPatterns();
    this.printRecommendations();
    this.printHealthScore();

    // Generate HTML report
    this.generateHTMLReport();

    console.log('\n✅ Analysis complete!');
    console.log(`📊 View detailed report: cypress/insights/report.html`);
  }

  loadLatestResults() {
    const latestPath = path.join(this.insightsDir, 'latest.json');
    
    if (!fs.existsSync(latestPath)) {
      return;
    }

    this.results = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  }

  printSummary() {
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(50));
    console.log(`Total Tests:    ${this.results.stats.total}`);
    console.log(`✅ Passed:      ${this.results.stats.passes} (${this.results.insights.summary.passRate}%)`);
    console.log(`❌ Failed:      ${this.results.stats.failures}`);
    console.log(`⏭️  Skipped:     ${this.results.stats.skipped}`);
    console.log(`⚠️  Flaky:       ${this.results.flakyTests.length} (${this.results.insights.summary.flakinessRate}%)`);
    console.log(`⏱️  Avg Duration: ${this.results.insights.summary.avgDuration}ms`);
    console.log(`🕐 Total Time:  ${(this.results.duration / 1000).toFixed(2)}s`);
    console.log('');
  }

  printFailures() {
    if (this.results.failures.length === 0) {
      console.log('✅ No test failures!\n');
      return;
    }

    console.log('❌ FAILED TESTS');
    console.log('═'.repeat(50));
    
    this.results.failures.forEach((failure, index) => {
      console.log(`\n${index + 1}. ${failure.title}`);
      console.log(`   Spec: ${failure.spec}`);
      console.log(`   Error: ${failure.error?.substring(0, 150)}...`);
      
      const recommendation = this.getFailureRecommendation(failure);
      console.log(`   💡 Fix: ${recommendation}`);
    });
    
    console.log('');
  }

  printFlakyTests() {
    if (this.results.flakyTests.length === 0) {
      console.log('✅ No flaky tests detected!\n');
      return;
    }

    console.log('⚠️  FLAKY TESTS (Passed after retries)');
    console.log('═'.repeat(50));
    
    this.results.flakyTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.title}`);
      console.log(`   Spec: ${test.spec}`);
      console.log(`   Attempts: ${test.attempts?.length || 'N/A'}`);
      console.log(`   💡 Fix: Add proper waits and use cy.intercept() for API calls\n`);
    });
  }

  printSlowTests() {
    if (this.results.slowTests.length === 0) {
      console.log('✅ No slow tests detected!\n');
      return;
    }

    console.log('🐌 SLOW TESTS (>5 seconds)');
    console.log('═'.repeat(50));
    
    this.results.slowTests
      .sort((a, b) => b.duration - a.duration)
      .forEach((test, index) => {
        console.log(`${index + 1}. ${test.title}`);
        console.log(`   Duration: ${(test.duration / 1000).toFixed(2)}s`);
        console.log(`   Spec: ${test.spec}`);
        console.log(`   💡 Optimize: Use fixtures, mock slow APIs, reduce setup time\n`);
      });
  }

  printPatterns() {
    const patterns = this.results.insights.patterns;
    const hasPatterns = Object.values(patterns).some(p => p.length > 0);

    if (!hasPatterns) {
      console.log('✅ No failure patterns detected!\n');
      return;
    }

    console.log('🔍 FAILURE PATTERNS');
    console.log('═'.repeat(50));

    if (patterns.selectorIssues.length > 0) {
      console.log(`\n🎯 Selector Issues (${patterns.selectorIssues.length}):`);
      patterns.selectorIssues.slice(0, 3).forEach(issue => {
        console.log(`   - ${issue.test}`);
      });
      console.log(`   💡 Use data-testid attributes and proper waits`);
    }

    if (patterns.timingIssues.length > 0) {
      console.log(`\n⏱️  Timing Issues (${patterns.timingIssues.length}):`);
      patterns.timingIssues.slice(0, 3).forEach(issue => {
        console.log(`   - ${issue.test}`);
      });
      console.log(`   💡 Use cy.intercept() and cy.wait() instead of hard-coded waits`);
    }

    if (patterns.assertionErrors.length > 0) {
      console.log(`\n✓ Assertion Errors (${patterns.assertionErrors.length}):`);
      patterns.assertionErrors.slice(0, 3).forEach(issue => {
        console.log(`   - ${issue.test}`);
      });
      console.log(`   💡 Update assertions or fix implementation`);
    }

    if (patterns.networkErrors.length > 0) {
      console.log(`\n🌐 Network Errors (${patterns.networkErrors.length}):`);
      patterns.networkErrors.slice(0, 3).forEach(issue => {
        console.log(`   - ${issue.test}`);
      });
      console.log(`   💡 Use cy.intercept() to stub network calls`);
    }

    console.log('');
  }

  printRecommendations() {
    const recommendations = this.results.insights.recommendations;

    if (recommendations.length === 0) {
      console.log('✅ No recommendations - test suite is healthy!\n');
      return;
    }

    console.log('💡 RECOMMENDATIONS');
    console.log('═'.repeat(50));

    recommendations.forEach((rec, index) => {
      const icon = rec.type === 'critical' ? '🔴' : rec.type === 'warning' ? '🟡' : 'ℹ️';
      console.log(`\n${icon} ${rec.category.toUpperCase()}`);
      console.log(`   ${rec.message}`);
      console.log(`   Action: ${rec.action}`);
    });

    console.log('');
  }

  printHealthScore() {
    const passRate = parseFloat(this.results.insights.summary.passRate);
    const flakinessRate = parseFloat(this.results.insights.summary.flakinessRate);
    
    let healthScore = 100;
    let healthGrade = 'A+';
    let healthColor = '🟢';

    // Deduct points for failures
    healthScore -= (100 - passRate);

    // Deduct points for flakiness
    healthScore -= (flakinessRate * 5);

    // Deduct points for slow tests
    const slowTestPenalty = Math.min(this.results.slowTests.length * 2, 10);
    healthScore -= slowTestPenalty;

    healthScore = Math.max(0, healthScore);

    if (healthScore >= 95) {
      healthGrade = 'A+';
      healthColor = '🟢';
    } else if (healthScore >= 85) {
      healthGrade = 'A';
      healthColor = '🟢';
    } else if (healthScore >= 75) {
      healthGrade = 'B';
      healthColor = '🟡';
    } else if (healthScore >= 65) {
      healthGrade = 'C';
      healthColor = '🟠';
    } else {
      healthGrade = 'F';
      healthColor = '🔴';
    }

    console.log('🏥 TEST SUITE HEALTH');
    console.log('═'.repeat(50));
    console.log(`${healthColor} Overall Score: ${healthScore.toFixed(1)}/100 (Grade: ${healthGrade})`);
    console.log('');

    if (healthScore < 95) {
      console.log('📈 TO IMPROVE HEALTH:');
      if (passRate < 95) console.log('   • Fix failing tests');
      if (flakinessRate > 2) console.log('   • Stabilize flaky tests');
      if (this.results.slowTests.length > 0) console.log('   • Optimize slow tests');
      console.log('');
    }
  }

  getFailureRecommendation(failure) {
    const error = failure.error || '';

    if (error.includes('Timed out retrying')) {
      return 'Add proper wait: cy.get(selector, { timeout: 10000 }) or use cy.intercept()';
    }
    if (error.includes('expected to find element')) {
      return 'Verify selector. Use data-testid. Check element visibility.';
    }
    if (error.includes('AssertionError')) {
      return 'Update assertion or fix implementation';
    }
    if (error.includes('network') || error.includes('fetch')) {
      return 'Use cy.intercept() to stub network calls';
    }

    return 'Review error message and stack trace';
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cypress Test Results - ${new Date().toLocaleDateString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header h1 { color: #333; margin-bottom: 10px; }
    .header .date { color: #666; font-size: 14px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-card .label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: #333; }
    .stat-card.success .value { color: #0f9d58; }
    .stat-card.error .value { color: #db4437; }
    .stat-card.warning .value { color: #f4b400; }
    .section { background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .section h2 { color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #f0f0f0; }
    .test-item { padding: 15px; margin-bottom: 10px; background: #f9f9f9; border-radius: 4px; border-left: 4px solid #ddd; }
    .test-item.failed { border-left-color: #db4437; }
    .test-item.flaky { border-left-color: #f4b400; }
    .test-item.slow { border-left-color: #4285f4; }
    .test-item .title { font-weight: 600; color: #333; margin-bottom: 5px; }
    .test-item .spec { font-size: 12px; color: #666; margin-bottom: 5px; }
    .test-item .error { font-size: 13px; color: #666; background: white; padding: 10px; border-radius: 4px; margin: 10px 0; font-family: monospace; }
    .test-item .recommendation { font-size: 13px; color: #0f9d58; margin-top: 10px; }
    .recommendation::before { content: "💡 "; }
    .health-score { text-align: center; padding: 40px; }
    .health-score .score { font-size: 72px; font-weight: bold; margin-bottom: 10px; }
    .health-score .grade { font-size: 24px; color: #666; }
    .grade-a { color: #0f9d58; }
    .grade-b { color: #f4b400; }
    .grade-c { color: #ff9800; }
    .grade-f { color: #db4437; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🧪 Cypress Test Results</h1>
      <div class="date">${new Date().toLocaleString()}</div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="label">Total Tests</div>
        <div class="value">${this.results.stats.total}</div>
      </div>
      <div class="stat-card success">
        <div class="label">Passed</div>
        <div class="value">${this.results.stats.passes}</div>
      </div>
      <div class="stat-card error">
        <div class="label">Failed</div>
        <div class="value">${this.results.stats.failures}</div>
      </div>
      <div class="stat-card warning">
        <div class="label">Flaky</div>
        <div class="value">${this.results.flakyTests.length}</div>
      </div>
    </div>

    <div class="section">
      <div class="health-score">
        <div class="score grade-${this.getHealthGrade().toLowerCase()}">${this.getHealthScore().toFixed(0)}</div>
        <div class="grade">Health Score (Grade: ${this.getHealthGrade()})</div>
      </div>
    </div>

    ${this.generateFailuresHTML()}
    ${this.generateFlakyTestsHTML()}
    ${this.generateSlowTestsHTML()}
    ${this.generateRecommendationsHTML()}
  </div>
</body>
</html>
    `;

    fs.writeFileSync(path.join(this.insightsDir, 'report.html'), html);
  }

  getHealthScore() {
    const passRate = parseFloat(this.results.insights.summary.passRate);
    const flakinessRate = parseFloat(this.results.insights.summary.flakinessRate);
    
    let score = 100;
    score -= (100 - passRate);
    score -= (flakinessRate * 5);
    score -= Math.min(this.results.slowTests.length * 2, 10);
    
    return Math.max(0, score);
  }

  getHealthGrade() {
    const score = this.getHealthScore();
    if (score >= 95) return 'A';
    if (score >= 85) return 'B';
    if (score >= 75) return 'C';
    return 'F';
  }

  generateFailuresHTML() {
    if (this.results.failures.length === 0) return '';

    return `
      <div class="section">
        <h2>❌ Failed Tests (${this.results.failures.length})</h2>
        ${this.results.failures.map(f => `
          <div class="test-item failed">
            <div class="title">${f.title}</div>
            <div class="spec">Spec: ${f.spec}</div>
            <div class="error">${f.error || 'No error message'}</div>
            <div class="recommendation">${this.getFailureRecommendation(f)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateFlakyTestsHTML() {
    if (this.results.flakyTests.length === 0) return '';

    return `
      <div class="section">
        <h2>⚠️ Flaky Tests (${this.results.flakyTests.length})</h2>
        ${this.results.flakyTests.map(f => `
          <div class="test-item flaky">
            <div class="title">${f.title}</div>
            <div class="spec">Spec: ${f.spec}</div>
            <div class="recommendation">Add proper waits and use cy.intercept() for API calls</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateSlowTestsHTML() {
    if (this.results.slowTests.length === 0) return '';

    return `
      <div class="section">
        <h2>🐌 Slow Tests (${this.results.slowTests.length})</h2>
        ${this.results.slowTests.map(f => `
          <div class="test-item slow">
            <div class="title">${f.title}</div>
            <div class="spec">Spec: ${f.spec} | Duration: ${(f.duration / 1000).toFixed(2)}s</div>
            <div class="recommendation">Optimize setup, use fixtures, mock slow APIs</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateRecommendationsHTML() {
    if (this.results.insights.recommendations.length === 0) return '';

    return `
      <div class="section">
        <h2>💡 Recommendations</h2>
        ${this.results.insights.recommendations.map(r => `
          <div class="test-item">
            <div class="title">${r.category.toUpperCase()}</div>
            <div class="spec">${r.message}</div>
            <div class="recommendation">${r.action}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Run analyzer
const analyzer = new TestAnalyzer();
analyzer.analyze().catch(console.error);
