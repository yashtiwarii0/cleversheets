import { spawn } from 'child_process';
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
  red: '\x1b[31m',
};

// Print banner
console.log(`${colors.magenta}
=======================================
      STARTING CLEVERSHEETS APP      
=======================================
${colors.reset}`);

// Start backend server
console.log(`${colors.cyan}Starting backend server...${colors.reset}`);
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  shell: true,
  stdio: 'pipe',
});

// Start frontend server
console.log(`${colors.cyan}Starting frontend server...${colors.reset}`);
const clientProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  shell: true,
  stdio: 'pipe',
});

// Handle backend output
serverProcess.stdout.on('data', (data) => {
  console.log(`${colors.green}[SERVER] ${colors.reset}${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`${colors.red}[SERVER ERROR] ${colors.reset}${data.toString().trim()}`);
});

// Handle frontend output
clientProcess.stdout.on('data', (data) => {
  console.log(`${colors.blue}[CLIENT] ${colors.reset}${data.toString().trim()}`);
});

clientProcess.stderr.on('data', (data) => {
  console.error(`${colors.red}[CLIENT ERROR] ${colors.reset}${data.toString().trim()}`);
});

// Handle process exit
function cleanup() {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (clientProcess) {
    clientProcess.kill();
  }
  console.log(`${colors.yellow}\nShutting down CleverSheets...${colors.reset}`);
  process.exit(0);
}

// Handle termination signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Log startup message
console.log(`${colors.green}\nCleverSheets is starting up!${colors.reset}`);
console.log(`${colors.yellow}Press Ctrl+C to stop the application${colors.reset}`);