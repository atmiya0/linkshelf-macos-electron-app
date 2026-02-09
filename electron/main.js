// Simple entry point that loads the TypeScript file using ts-node
require('ts-node').register({
  project: require('path').join(__dirname, '../tsconfig.electron.json'),
  transpileOnly: true,
});

// Load the TypeScript main file
require('./main.ts');
