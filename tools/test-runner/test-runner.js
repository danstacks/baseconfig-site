const { chromium } = require('playwright');
const fetch = require('node-fetch');
const { Client, GatewayIntentBits } = require('discord.js');

const CONFIG = {
  baseUrl: 'https://baseconfig.tech',
  tools: [
    { name: 'infra-planner', path: '/tools/infra-planner/' },
    { name: 'storage-calculator', path: '/tools/storage-calculator/' }
  ],
  ollama: {
    url: 'http://172.16.31.242:11434/v1/chat/completions',
    model: 'llama3.1:70b-instruct-q4_K_M'
  },
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID || '1476661066145595435'
  }
};

class WebsiteTester {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    if (this.browser) await this.browser.close();
  }

  async testTool(tool) {
    const page = await this.browser.newPage();
    const url = `${CONFIG.baseUrl}${tool.path}`;
    const testResult = {
      tool: tool.name,
      url,
      timestamp: new Date().toISOString(),
      tests: [],
      screenshots: [],
      errors: [],
      accessibility: [],
      performance: {},
      interactions: [],
      suggestions: []
    };

    try {
      console.log(`\n🧪 Testing: ${tool.name}`);
      console.log(`   URL: ${url}`);

      // 1. Page Load Test
      const startTime = Date.now();
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const loadTime = Date.now() - startTime;
      
      testResult.performance.loadTime = loadTime;
      testResult.tests.push({
        name: 'Page Load',
        passed: response.ok(),
        details: `Status: ${response.status()}, Load time: ${loadTime}ms`
      });

      // 2. Screenshot initial state
      const screenshot = await page.screenshot({ fullPage: true });
      testResult.screenshots.push({
        name: 'initial-state',
        data: screenshot.toString('base64')
      });

      // 3. Check for JavaScript errors
      page.on('pageerror', error => {
        testResult.errors.push({ type: 'js-error', message: error.message });
      });

      page.on('console', msg => {
        if (msg.type() === 'error') {
          testResult.errors.push({ type: 'console-error', message: msg.text() });
        }
      });

      // 4. Get page structure
      const pageStructure = await page.evaluate(() => {
        const getStructure = (el, depth = 0) => {
          if (depth > 3) return null;
          const children = Array.from(el.children).slice(0, 10).map(c => getStructure(c, depth + 1)).filter(Boolean);
          return {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            classes: el.className ? el.className.split(' ').slice(0, 5) : [],
            text: el.innerText?.slice(0, 100) || null,
            children: children.length ? children : null
          };
        };
        return getStructure(document.body);
      });
      testResult.pageStructure = pageStructure;

      // 5. Find and test interactive elements
      const interactiveElements = await page.evaluate(() => {
        const elements = [];
        
        // Buttons
        document.querySelectorAll('button').forEach((btn, i) => {
          elements.push({
            type: 'button',
            index: i,
            text: btn.innerText?.slice(0, 50),
            id: btn.id,
            disabled: btn.disabled,
            visible: btn.offsetParent !== null
          });
        });

        // Inputs
        document.querySelectorAll('input, select, textarea').forEach((input, i) => {
          elements.push({
            type: input.tagName.toLowerCase(),
            inputType: input.type,
            index: i,
            id: input.id,
            name: input.name,
            placeholder: input.placeholder,
            value: input.value,
            required: input.required,
            visible: input.offsetParent !== null
          });
        });

        // Links
        document.querySelectorAll('a[href]').forEach((link, i) => {
          elements.push({
            type: 'link',
            index: i,
            text: link.innerText?.slice(0, 50),
            href: link.href,
            visible: link.offsetParent !== null
          });
        });

        return elements;
      });
      testResult.interactiveElements = interactiveElements;

      // 6. Test form interactions
      const inputs = await page.$$('input[type="number"], input[type="text"], select');
      for (const input of inputs.slice(0, 10)) {
        try {
          const inputInfo = await input.evaluate(el => ({
            id: el.id,
            type: el.type || el.tagName.toLowerCase(),
            name: el.name
          }));

          if (inputInfo.type === 'number') {
            const originalValue = await input.inputValue();
            await input.fill('1000');
            await page.waitForTimeout(500);
            const newValue = await input.inputValue();
            
            testResult.interactions.push({
              element: inputInfo.id || inputInfo.name,
              action: 'fill number',
              originalValue,
              newValue,
              success: newValue === '1000'
            });

            // Reset
            await input.fill(originalValue);
          } else if (inputInfo.type === 'select') {
            const options = await input.evaluate(el => 
              Array.from(el.options).map(o => ({ value: o.value, text: o.text }))
            );
            if (options.length > 1) {
              await input.selectOption(options[1].value);
              testResult.interactions.push({
                element: inputInfo.id || inputInfo.name,
                action: 'select option',
                options: options.slice(0, 5),
                selected: options[1].value,
                success: true
              });
            }
          }
        } catch (e) {
          testResult.interactions.push({
            element: 'unknown',
            action: 'interaction failed',
            error: e.message
          });
        }
      }

      // 7. Test button clicks
      const buttons = await page.$$('button:not([disabled])');
      for (const button of buttons.slice(0, 5)) {
        try {
          const btnInfo = await button.evaluate(el => ({
            text: el.innerText?.slice(0, 30),
            id: el.id
          }));

          if (btnInfo.text && !btnInfo.text.includes('Skip')) {
            await button.click();
            await page.waitForTimeout(500);
            
            testResult.interactions.push({
              element: btnInfo.id || btnInfo.text,
              action: 'click',
              success: true
            });
          }
        } catch (e) {
          // Button might have navigated or closed modal
        }
      }

      // 8. Screenshot after interactions
      const afterScreenshot = await page.screenshot({ fullPage: true });
      testResult.screenshots.push({
        name: 'after-interactions',
        data: afterScreenshot.toString('base64')
      });

      // 9. Accessibility checks
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];
        
        // Check images without alt
        document.querySelectorAll('img:not([alt])').forEach(img => {
          issues.push({ type: 'missing-alt', element: img.src });
        });

        // Check buttons without text
        document.querySelectorAll('button').forEach(btn => {
          if (!btn.innerText?.trim() && !btn.getAttribute('aria-label')) {
            issues.push({ type: 'button-no-label', element: btn.outerHTML.slice(0, 100) });
          }
        });

        // Check inputs without labels
        document.querySelectorAll('input, select, textarea').forEach(input => {
          const id = input.id;
          if (id && !document.querySelector(`label[for="${id}"]`)) {
            const hasAriaLabel = input.getAttribute('aria-label');
            if (!hasAriaLabel) {
              issues.push({ type: 'input-no-label', element: id || input.name });
            }
          }
        });

        // Check color contrast (basic)
        document.querySelectorAll('*').forEach(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bg = style.backgroundColor;
          if (color === bg && el.innerText?.trim()) {
            issues.push({ type: 'low-contrast', element: el.innerText.slice(0, 50) });
          }
        });

        return issues.slice(0, 20);
      });
      testResult.accessibility = accessibilityIssues;

      // 10. Mobile responsiveness test
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      const mobileScreenshot = await page.screenshot({ fullPage: true });
      testResult.screenshots.push({
        name: 'mobile-view',
        data: mobileScreenshot.toString('base64')
      });

      const mobileOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      testResult.tests.push({
        name: 'Mobile Responsiveness',
        passed: !mobileOverflow,
        details: mobileOverflow ? 'Horizontal scroll detected on mobile' : 'No horizontal overflow'
      });

      console.log(`   ✅ Tests completed: ${testResult.tests.length}`);
      console.log(`   📝 Interactions tested: ${testResult.interactions.length}`);
      console.log(`   ⚠️  Errors found: ${testResult.errors.length}`);
      console.log(`   ♿ Accessibility issues: ${testResult.accessibility.length}`);

    } catch (error) {
      testResult.errors.push({ type: 'test-error', message: error.message });
      console.log(`   ❌ Test error: ${error.message}`);
    } finally {
      await page.close();
    }

    this.results.push(testResult);
    return testResult;
  }

  async analyzeWithAI(testResult) {
    console.log(`\n🤖 Analyzing ${testResult.tool} with AI...`);

    const prompt = `You are a senior QA engineer and UX expert. Analyze this automated test report for a web tool and provide actionable feedback.

## Tool: ${testResult.tool}
## URL: ${testResult.url}

## Test Results:
${testResult.tests.map(t => `- ${t.name}: ${t.passed ? '✅ PASS' : '❌ FAIL'} - ${t.details}`).join('\n')}

## Performance:
- Page load time: ${testResult.performance.loadTime}ms

## JavaScript Errors:
${testResult.errors.length ? testResult.errors.map(e => `- ${e.type}: ${e.message}`).join('\n') : 'None detected'}

## Interactive Elements Found:
- Buttons: ${testResult.interactiveElements?.filter(e => e.type === 'button').length || 0}
- Inputs: ${testResult.interactiveElements?.filter(e => ['input', 'select', 'textarea'].includes(e.type)).length || 0}
- Links: ${testResult.interactiveElements?.filter(e => e.type === 'link').length || 0}

## Interaction Tests:
${testResult.interactions.map(i => `- ${i.element}: ${i.action} - ${i.success ? 'OK' : 'FAILED'}`).join('\n')}

## Accessibility Issues:
${testResult.accessibility.length ? testResult.accessibility.map(a => `- ${a.type}: ${a.element}`).join('\n') : 'None detected'}

Based on this analysis, provide:
1. **Critical Issues** - Things that must be fixed
2. **UX Improvements** - Ways to improve user experience
3. **Feature Suggestions** - New features that would add value
4. **Performance Recommendations** - Ways to improve speed/efficiency
5. **Accessibility Fixes** - How to make it more accessible

Be specific and actionable. Reference actual elements from the test data.`;

    try {
      const response = await fetch(CONFIG.ollama.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: CONFIG.ollama.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const analysis = data.choices?.[0]?.message?.content || 'Analysis failed';
      testResult.aiAnalysis = analysis;
      console.log(`   ✅ AI analysis complete`);
      return analysis;
    } catch (error) {
      console.log(`   ❌ AI analysis failed: ${error.message}`);
      testResult.aiAnalysis = `Analysis failed: ${error.message}`;
      return null;
    }
  }

  generateReport() {
    let report = `# 🧪 Automated Test Report\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    for (const result of this.results) {
      report += `---\n## ${result.tool}\n`;
      report += `**URL:** ${result.url}\n\n`;

      report += `### Test Results\n`;
      for (const test of result.tests) {
        report += `- ${test.passed ? '✅' : '❌'} **${test.name}**: ${test.details}\n`;
      }

      report += `\n### Performance\n`;
      report += `- Load time: ${result.performance.loadTime}ms\n`;

      if (result.errors.length) {
        report += `\n### ⚠️ Errors\n`;
        for (const error of result.errors) {
          report += `- ${error.type}: ${error.message}\n`;
        }
      }

      if (result.accessibility.length) {
        report += `\n### ♿ Accessibility Issues\n`;
        for (const issue of result.accessibility.slice(0, 10)) {
          report += `- ${issue.type}: ${issue.element}\n`;
        }
      }

      if (result.aiAnalysis) {
        report += `\n### 🤖 AI Analysis\n${result.aiAnalysis}\n`;
      }
    }

    return report;
  }
}

async function sendToDiscord(report) {
  if (!CONFIG.discord.token) {
    console.log('\n⚠️  No Discord token - skipping Discord notification');
    console.log('Set DISCORD_BOT_TOKEN environment variable to enable');
    return;
  }

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  try {
    await client.login(CONFIG.discord.token);
    const channel = await client.channels.fetch(CONFIG.discord.channelId);
    
    // Split report into chunks if too long
    const chunks = report.match(/[\s\S]{1,1900}/g) || [report];
    for (const chunk of chunks) {
      await channel.send(chunk);
    }
    
    console.log('✅ Report sent to Discord');
    await client.destroy();
  } catch (error) {
    console.log(`❌ Discord send failed: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 BaseConfig Automated Test Runner\n');
  console.log('=' .repeat(50));

  const args = process.argv.slice(2);
  const toolArg = args.find(a => a.startsWith('--tool='));
  const specificTool = toolArg ? toolArg.split('=')[1] : null;

  const tester = new WebsiteTester();
  await tester.init();

  const toolsToTest = specificTool 
    ? CONFIG.tools.filter(t => t.name === specificTool)
    : CONFIG.tools;

  for (const tool of toolsToTest) {
    const result = await tester.testTool(tool);
    await tester.analyzeWithAI(result);
  }

  await tester.close();

  const report = tester.generateReport();
  
  // Save report to file
  const fs = require('fs');
  const reportPath = `./test-report-${Date.now()}.md`;
  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 Report saved to: ${reportPath}`);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log(report);

  // Send to Discord
  await sendToDiscord(report);
}

main().catch(console.error);
