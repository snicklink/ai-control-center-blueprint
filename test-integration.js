#!/usr/bin/env node

/**
 * AI Control Center Blueprint Integration Test
 * 
 * This script tests the complete integration of all blueprint components
 * to ensure everything works together as expected.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Directory not found: ${dirPath}`, 'red');
    return false;
  }
}

function checkPackageJson(packagePath, expectedDependencies) {
  if (!fs.existsSync(packagePath)) {
    log(`❌ Package.json not found: ${packagePath}`, 'red');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    let allDepsFound = true;

    expectedDependencies.forEach(dep => {
      const found = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      if (found) {
        log(`  ✅ ${dep}: ${found}`, 'green');
      } else {
        log(`  ❌ Missing dependency: ${dep}`, 'red');
        allDepsFound = false;
      }
    });

    return allDepsFound;
  } catch (error) {
    log(`❌ Error reading package.json: ${error.message}`, 'red');
    return false;
  }
}

function testBlueprintStructure() {
  log('\n🏗️  Testing Blueprint Structure', 'cyan');
  log('================================', 'cyan');

  const baseDir = process.cwd();
  let allPassed = true;

  // Core directories
  const coreDirectories = [
    'packages',
    'packages/react-components',
    'packages/backend-templates',
    'packages/backend-templates/python-openrouter',
    'packages/backend-templates/python-replicate',
    'examples',
    'examples/react-vite',
    'examples/nextjs',
    'examples/python-flask',
    'docs',
    'docs/installation',
    'cli'
  ];

  coreDirectories.forEach(dir => {
    if (!checkDirectory(path.join(baseDir, dir), `Directory: ${dir}`)) {
      allPassed = false;
    }
  });

  // Core files
  const coreFiles = [
    'README.md',
    'docs/quick-start.md',
    'docs/installation/openrouter-setup.md',
    'docs/installation/replicate-setup.md',
    'cli/setup.js',
    'cli/package.json'
  ];

  coreFiles.forEach(file => {
    if (!checkFile(path.join(baseDir, file), `File: ${file}`)) {
      allPassed = false;
    }
  });

  return allPassed;
}

function testReactComponents() {
  log('\n⚛️  Testing React Components', 'cyan');
  log('=============================', 'cyan');

  const componentDir = path.join(process.cwd(), 'packages/react-components');
  let allPassed = true;

  // Check component files
  const componentFiles = [
    'package.json',
    'src/components/AIControlCenter.tsx',
    'src/index.ts',
    'tsconfig.json'
  ];

  componentFiles.forEach(file => {
    if (!checkFile(path.join(componentDir, file), `React component: ${file}`)) {
      allPassed = false;
    }
  });

  // Check package.json dependencies
  const expectedDeps = ['react', 'react-dom', 'lucide-react'];
  if (!checkPackageJson(path.join(componentDir, 'package.json'), expectedDeps)) {
    allPassed = false;
  }

  return allPassed;
}

function testBackendTemplates() {
  log('\n🔧 Testing Backend Templates', 'cyan');
  log('=============================', 'cyan');

  let allPassed = true;

  // OpenRouter template
  const openrouterDir = path.join(process.cwd(), 'packages/backend-templates/python-openrouter');
  const openrouterFiles = ['openrouter_service.py', 'requirements.txt', '.env.example'];
  
  openrouterFiles.forEach(file => {
    if (!checkFile(path.join(openrouterDir, file), `OpenRouter: ${file}`)) {
      allPassed = false;
    }
  });

  // Replicate template
  const replicateDir = path.join(process.cwd(), 'packages/backend-templates/python-replicate');
  const replicateFiles = ['replicate_service.py', 'requirements.txt', '.env.example'];
  
  replicateFiles.forEach(file => {
    if (!checkFile(path.join(replicateDir, file), `Replicate: ${file}`)) {
      allPassed = false;
    }
  });

  return allPassed;
}

function testExamples() {
  log('\n📚 Testing Examples', 'cyan');
  log('===================', 'cyan');

  let allPassed = true;

  // React Vite example
  const reactViteDir = path.join(process.cwd(), 'examples/react-vite');
  const reactViteFiles = ['package.json', 'src/App.tsx', 'vite.config.ts'];
  
  reactViteFiles.forEach(file => {
    if (!checkFile(path.join(reactViteDir, file), `React Vite: ${file}`)) {
      allPassed = false;
    }
  });

  // Next.js example
  const nextjsDir = path.join(process.cwd(), 'examples/nextjs');
  const nextjsFiles = ['package.json', 'pages/index.tsx'];
  
  nextjsFiles.forEach(file => {
    if (!checkFile(path.join(nextjsDir, file), `Next.js: ${file}`)) {
      allPassed = false;
    }
  });

  // Python Flask example
  const flaskDir = path.join(process.cwd(), 'examples/python-flask');
  const flaskFiles = ['app.py', 'requirements.txt'];
  
  flaskFiles.forEach(file => {
    if (!checkFile(path.join(flaskDir, file), `Flask: ${file}`)) {
      allPassed = false;
    }
  });

  return allPassed;
}

function testDocumentation() {
  log('\n📖 Testing Documentation', 'cyan');
  log('=========================', 'cyan');

  const docsDir = path.join(process.cwd(), 'docs');
  let allPassed = true;

  const docFiles = [
    'quick-start.md',
    'installation/openrouter-setup.md',
    'installation/replicate-setup.md'
  ];

  docFiles.forEach(file => {
    if (!checkFile(path.join(docsDir, file), `Documentation: ${file}`)) {
      allPassed = false;
    }
  });

  // Check documentation content
  const quickStartPath = path.join(docsDir, 'quick-start.md');
  if (fs.existsSync(quickStartPath)) {
    const content = fs.readFileSync(quickStartPath, 'utf8');
    if (content.includes('OpenRouter') && content.includes('Replicate')) {
      log('✅ Quick start guide includes required services', 'green');
    } else {
      log('❌ Quick start guide missing service references', 'red');
      allPassed = false;
    }
  }

  return allPassed;
}

function testCLI() {
  log('\n🖥️  Testing CLI Tool', 'cyan');
  log('===================', 'cyan');

  const cliDir = path.join(process.cwd(), 'cli');
  let allPassed = true;

  const cliFiles = ['setup.js', 'package.json'];
  
  cliFiles.forEach(file => {
    if (!checkFile(path.join(cliDir, file), `CLI: ${file}`)) {
      allPassed = false;
    }
  });

  // Check if setup.js is executable
  const setupPath = path.join(cliDir, 'setup.js');
  if (fs.existsSync(setupPath)) {
    const content = fs.readFileSync(setupPath, 'utf8');
    if (content.startsWith('#!/usr/bin/env node')) {
      log('✅ CLI setup.js has correct shebang', 'green');
    } else {
      log('❌ CLI setup.js missing shebang', 'red');
      allPassed = false;
    }
  }

  return allPassed;
}

function testIntegration() {
  log('\n🔗 Testing Integration', 'cyan');
  log('======================', 'cyan');

  let allPassed = true;

  // Check if React components reference correct backend services
  const appPath = path.join(process.cwd(), 'examples/react-vite/src/App.tsx');
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    if (content.includes('http://localhost:5004')) {
      log('✅ React app references OpenRouter service port', 'green');
    } else {
      log('❌ React app missing OpenRouter service reference', 'red');
      allPassed = false;
    }

    if (content.includes('anthropic/claude-3-haiku')) {
      log('✅ React app uses recommended model', 'green');
    } else {
      log('❌ React app missing recommended model', 'red');
      allPassed = false;
    }
  }

  // Check if backend services use correct models
  const openrouterPath = path.join(process.cwd(), 'packages/backend-templates/python-openrouter/openrouter_service.py');
  if (fs.existsSync(openrouterPath)) {
    const content = fs.readFileSync(openrouterPath, 'utf8');
    
    if (content.includes('anthropic/claude-3-haiku')) {
      log('✅ OpenRouter service includes recommended model', 'green');
    } else {
      log('❌ OpenRouter service missing recommended model', 'red');
      allPassed = false;
    }
  }

  return allPassed;
}

function generateReport(results) {
  log('\n📊 Integration Test Report', 'bright');
  log('==========================', 'bright');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;

  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');

  if (failedTests === 0) {
    log('\n🎉 All tests passed! The AI Control Center Blueprint is ready for use.', 'green');
    log('You can now run the CLI tool to create new projects:', 'green');
    log('  cd cli && node setup.js', 'yellow');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above before using the blueprint.', 'red');
  }

  return failedTests === 0;
}

// Main test execution
async function main() {
  log('🧪 AI Control Center Blueprint Integration Test', 'bright');
  log('===============================================', 'bright');

  const results = {
    'Blueprint Structure': testBlueprintStructure(),
    'React Components': testReactComponents(),
    'Backend Templates': testBackendTemplates(),
    'Examples': testExamples(),
    'Documentation': testDocumentation(),
    'CLI Tool': testCLI(),
    'Integration': testIntegration()
  };

  const allPassed = generateReport(results);
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };