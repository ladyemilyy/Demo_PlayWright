import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';

interface TestSummary {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  failures: { title: string; error: string }[];
}

class SlackReporter implements Reporter {
  private summary: TestSummary = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: 0,
    failures: [],
  };
  private startTime: number = Date.now();

  onBegin(_config: FullConfig, suite: Suite): void {
    this.summary.total = suite.allTests().length;
    this.startTime = Date.now();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') {
      this.summary.passed++;
    } else if (result.status === 'failed' || result.status === 'timedOut') {
      this.summary.failed++;
      this.summary.failures.push({
        title: test.titlePath().join(' > '),
        error: result.error?.message?.split('\n')[0] ?? 'Unknown error',
      });
    } else if (result.status === 'skipped') {
      this.summary.skipped++;
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('[SlackReporter] SLACK_WEBHOOK_URL is not set — skipping notification.');
      return;
    }

    this.summary.duration = Math.round((Date.now() - this.startTime) / 1000);

    const status = result.status === 'passed' ? '✅ Passed' : '❌ Failed';
    const lines: string[] = [
      `*Playwright Test Run: ${status}*`,
      `Total: ${this.summary.total} | ✅ ${this.summary.passed} | ❌ ${this.summary.failed} | ⏭ ${this.summary.skipped}`,
      `Duration: ${this.summary.duration}s`,
    ];

    if (this.summary.failures.length > 0) {
      lines.push('\n*Failed Tests:*');
      for (const f of this.summary.failures) {
        lines.push(`• ${f.title}\n  _${f.error}_`);
      }
    }

    const payload = { text: lines.join('\n') };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error(`[SlackReporter] Failed to send notification: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('[SlackReporter] Error sending Slack notification:', err);
    }
  }
}

export default SlackReporter;
