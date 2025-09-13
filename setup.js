import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function to execute commands
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`${colors.blue}Running: ${colors.yellow}${command}${colors.reset}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`${colors.red}Failed to execute: ${command}${colors.reset}`);
    return false;
  }
}

// Create server directory if it doesn't exist
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.log(`${colors.yellow}Server directory not found. Creating...${colors.reset}`);
  fs.mkdirSync(serverDir, { recursive: true });
}

// Main setup function
async function setup() {
  console.log(`${colors.magenta}=== Setting up CleverSheets ===${colors.reset}`);
  
  // Install frontend dependencies
  console.log(`${colors.cyan}\nInstalling frontend dependencies...${colors.reset}`);
  if (!runCommand('npm install')) {
    console.error(`${colors.red}Failed to install frontend dependencies.${colors.reset}`);
    process.exit(1);
  }
  
  // Install backend dependencies
  console.log(`${colors.cyan}\nInstalling backend dependencies...${colors.reset}`);
  if (!runCommand('npm install', serverDir)) {
    console.error(`${colors.red}Failed to install backend dependencies.${colors.reset}`);
    process.exit(1);
  }
  
  console.log(`${colors.green}\n=== Setup completed successfully ===${colors.reset}`);
  console.log(`${colors.green}To start the application, run: ${colors.yellow}npm start${colors.reset}`);
}

// Run setup
setup();