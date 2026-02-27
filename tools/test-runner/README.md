# BaseConfig Automated Test Runner

Automated testing for BaseConfig tools with AI-powered analysis and Discord reporting.

## Setup

```bash
cd tools/test-runner
npm install
npx playwright install chromium
```

## Usage

### Test all tools:
```bash
npm test
```

### Test specific tool:
```bash
npm run test:infra
npm run test:storage
```

### With Discord notifications:
```bash
DISCORD_BOT_TOKEN=your_token npm test
```

## What it tests

1. **Page Load** - Verifies the page loads successfully
2. **JavaScript Errors** - Catches any console errors
3. **Interactive Elements** - Finds and tests buttons, inputs, selects
4. **Form Interactions** - Fills inputs, selects options, clicks buttons
5. **Mobile Responsiveness** - Checks for horizontal overflow on mobile
6. **Accessibility** - Checks for missing alt tags, labels, contrast issues
7. **Performance** - Measures page load time

## AI Analysis

After testing, the results are sent to the local Ollama instance running Llama 3.1 70B for analysis. The AI provides:

- Critical issues to fix
- UX improvements
- Feature suggestions
- Performance recommendations
- Accessibility fixes

## Output

- Console summary
- Markdown report file (`test-report-{timestamp}.md`)
- Discord message (if token provided)
