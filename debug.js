// ========================= DEBUG SCRIPT =========================
// Tạo file debug.js để test từng phần

// 1. Tạo file debug-minimal.ts
console.log("Starting debug...");

try {
  console.log("Step 1: Basic imports");
  // Test từng import một
  // import { prisma } from './config/prisma';
  // console.log("Prisma imported successfully");

  // import redis from './config/redis';
  // console.log("Redis imported successfully");

  console.log("Step 2: Type imports");
  // import { PermissionAction, PermissionModule } from '@prisma/client';
  // console.log("Prisma types imported successfully");

  console.log("Debug completed successfully");
} catch (error) {
  console.error("Error in debug:", error);
}

// ========================= PACKAGE.JSON DEBUG SCRIPTS =========================
/*
Thêm vào package.json:

{
  "scripts": {
    "debug:syntax": "node --check src/index.ts",
    "debug:compile": "tsc --noEmit",
    "debug:minimal": "ts-node debug-minimal.ts",
    "debug:verbose": "DEBUG=* npm run dev",
    "debug:files": "find src -name '*.ts' -exec node --check {} \\;",
    "debug:deps": "npm ls typescript ts-node @types/node"
  }
}
*/

// ========================= STEP BY STEP DEBUG =========================

// Bước 1: Kiểm tra syntax của từng file
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function debugAllFiles() {
  console.log("🔍 Checking all TypeScript files for syntax errors...");
  
  function checkFile(filePath) {
    try {
      execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
      console.log(`✅ ${filePath} - OK`);
      return true;
    } catch (error) {
      console.error(`❌ ${filePath} - ERROR:`);
      console.error(error.stdout?.toString() || error.message);
      return false;
    }
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    const errors = [];
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        errors.push(...walkDir(filePath));
      } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
        if (!checkFile(filePath)) {
          errors.push(filePath);
        }
      }
    });
    
    return errors;
  }

  const errorFiles = walkDir('./src');
  
  if (errorFiles.length > 0) {
    console.log('\n🚨 Files with errors:');
    errorFiles.forEach(file => console.log(`  - ${file}`));
  } else {
    console.log('\n✅ All files passed syntax check');
  }
}

// ========================= BINARY SEARCH DEBUG =========================

// Bước 2: Binary search để tìm dòng code gây lỗi
function createMinimalTest() {
  const testContent = `
// Test 1: Basic syntax
console.log("Test 1 passed");

// Test 2: Modern syntax
const obj = { a: 1, b: 2 };
const { a = 0, b = 0 } = obj;
console.log("Test 2 passed", a, b);

// Test 3: Optional chaining (requires Node 14+)
const nested = { deep: { value: 42 } };
console.log("Test 3 passed", nested?.deep?.value ?? 'default');

// Test 4: Arrow functions
const arrow = (x) => x * 2;
console.log("Test 4 passed", arrow(5));

// Test 5: Async/await
async function testAsync() {
  return Promise.resolve("async works");
}
console.log("Test 5 passed");

// Test 6: Class syntax
class TestClass {
  private value = 42;
  
  getValue() {
    return this.value;
  }
}
console.log("Test 6 passed", new TestClass().getValue());

// Test 7: Import/Export (comment out initially)
// export const testExport = "export works";
console.log("Test 7 passed");

console.log("All syntax tests passed!");
`;

  fs.writeFileSync('syntax-test.ts', testContent);
  console.log('📝 Created syntax-test.ts - run: npx ts-node syntax-test.ts');
}

// ========================= ENVIRONMENT CHECK =========================

function checkEnvironment() {
  console.log("🔧 Environment Check:");
  
  try {
    const nodeVersion = process.version;
    console.log(`Node.js version: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 14) {
      console.warn("⚠️  Node.js < 14 may not support modern syntax");
    }
    
    const tsVersion = execSync('npx tsc --version', { encoding: 'utf8' });
    console.log(`TypeScript version: ${tsVersion.trim()}`);
    
    const tsNodeVersion = execSync('npx ts-node --version', { encoding: 'utf8' });
    console.log(`ts-node version: ${tsNodeVersion.trim()}`);
    
  } catch (error) {
    console.error("❌ Environment check failed:", error.message);
  }
}

// ========================= FILE ANALYSIS =========================

function analyzeFile(filePath) {
  console.log(`🔬 Analyzing ${filePath}:`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check for problematic patterns
  const problematicPatterns = [
    { pattern: /\?\?/, name: 'Nullish coalescing' },
    { pattern: /\?\./g, name: 'Optional chaining' },
    { pattern: /=\s*\{[^}]*\}\s*=/, name: 'Destructuring with defaults' },
    { pattern: /export\s+\{[^}]*\}\s*=/, name: 'Export assignment' },
    { pattern: /import.*=.*require/, name: 'Mixed import syntax' },
  ];
  
  problematicPatterns.forEach(({ pattern, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  ⚠️  Found ${name}: ${matches.length} occurrences`);
      
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          console.log(`    Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  });
}

// ========================= TSCONFIG VALIDATOR =========================

function validateTsConfig() {
  console.log("📋 Validating tsconfig.json:");
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    const recommendations = {
      target: ['ES2018', 'ES2019', 'ES2020'],
      module: ['commonjs'],
      moduleResolution: ['node'],
      esModuleInterop: [true],
      allowSyntheticDefaultImports: [true],
      skipLibCheck: [true]
    };
    
    Object.entries(recommendations).forEach(([key, recommended]) => {
      const current = tsconfig.compilerOptions?.[key];
      if (!recommended.includes(current)) {
        console.log(`  ⚠️  ${key}: current=${current}, recommended=${recommended.join(' or ')}`);
      } else {
        console.log(`  ✅ ${key}: ${current}`);
      }
    });
    
  } catch (error) {
    console.error("❌ tsconfig.json validation failed:", error.message);
  }
}

// ========================= MAIN DEBUG FUNCTION =========================

function runFullDebug() {
  console.log("🚀 Starting comprehensive debug...\n");
  
  console.log("=".repeat(50));
  checkEnvironment();
  
  console.log("\n" + "=".repeat(50));
  validateTsConfig();
  
  console.log("\n" + "=".repeat(50));
  createMinimalTest();
  
  console.log("\n" + "=".repeat(50));
  
  // Check specific files if they exist
  const filesToCheck = [
    'src/index.ts',
    'src/app.ts',
    'src/server.ts',
    'src/middlewares/auth.middleware.ts',
    'src/services/permission.service.ts'
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`\n📁 Checking ${file}:`);
      analyzeFile(file);
    }
  });
  
  console.log("\n" + "=".repeat(50));
  console.log("🔍 Running file syntax check...");
  // debugAllFiles(); // Uncomment if needed
  
  console.log("\n✨ Debug completed. Next steps:");
  console.log("1. Run: npx ts-node syntax-test.ts");
  console.log("2. Run: npm run debug:compile");
  console.log("3. Check the specific error files identified above");
}

// ========================= QUICK FIXES =========================

const quickFixes = {
  // Replace problematic syntax
  fixOptionalChaining: (content) => {
    return content.replace(/(\w+)\?\./g, '$1 && $1.');
  },
  
  fixNullishCoalescing: (content) => {
    return content.replace(/(\w+)\s*\?\?\s*(['"`\w]+)/g, '($1 !== null && $1 !== undefined ? $1 : $2)');
  },
  
  fixArrowFunctions: (content) => {
    return content.replace(/(\w+)\s*=>\s*\{/g, 'function($1) {');
  }
};

// Export for use
module.exports = {
  runFullDebug,
  checkEnvironment,
  validateTsConfig,
  analyzeFile,
  createMinimalTest,
  quickFixes
};

// ========================= USAGE INSTRUCTIONS =========================

/*
Cách sử dụng:

1. Tạo file debug.js với nội dung trên
2. Chạy: node debug.js
3. Hoặc chạy từng function:

   node -e "require('./debug.js').runFullDebug()"
   node -e "require('./debug.js').checkEnvironment()"
   node -e "require('./debug.js').analyzeFile('src/problematic-file.ts')"

4. Manual debug commands:
   
   # Check syntax of specific file
   node --check src/file.ts
   
   # Compile without emit to check errors
   npx tsc --noEmit
   
   # Check with ts-node directly
   npx ts-node --transpile-only src/file.ts
   
   # Enable verbose logging
   DEBUG=ts-node:* npx ts-node src/index.ts

5. Common fixes:
   
   # Downgrade target in tsconfig.json
   "target": "ES2018"
   
   # Add to package.json
   "type": "commonjs"
   
   # Update dependencies
   npm update typescript ts-node @types/node
*/