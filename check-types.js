const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to recursively get all TypeScript files
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all TypeScript files
const tsFiles = getAllTsFiles('./app');

// Check each file for TypeScript errors
tsFiles.forEach(file => {
  try {
    console.log(`Checking ${file}...`);
    execSync(`npx tsc --noEmit ${file}`, { stdio: 'inherit' });
    console.log(`✅ ${file} - No errors`);
  } catch (error) {
    console.error(`❌ ${file} - Has errors`);
  }
});
