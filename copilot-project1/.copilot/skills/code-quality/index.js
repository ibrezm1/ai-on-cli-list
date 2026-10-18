#!/usr/bin/env node
// .copilot/skills/code-quality/index.js

import { Command } from 'commander';
import { execa } from 'execa';

const program = new Command();

program
  .name('code-quality')
  .description('Run code quality checks')
  .version('1.0.0');

async function run(cmd, args, opts = {}) {
  console.log(`🔧 ${cmd} ${args.join(' ')}`);
  try {
    await execa(cmd, args, { stdio: 'inherit', ...opts });
    console.log(`✅ ${cmd} passed`);
  } catch (e) {
    console.error(`❌ ${cmd} failed`);
    process.exit(1);
  }
}

program
  .command('check')
  .description('Run all quality checks')
  .option('-f, --fix', 'Auto-fix lint issues')
  .action(async (opts) => {
    await run('npm', ['run', 'lint', ...(opts.fix ? ['--', '--fix'] : [])]);
    await run('npm', ['run', 'typecheck']);
    await run('npm', ['test']);
    console.log('🎉 All checks passed!');
  });

program
  .command('lint')
  .description('Run ESLint')
  .option('-f, --fix', 'Auto-fix issues')
  .action(async (opts) => {
    await run('npx', ['eslint', 'src/**/*.ts', ...(opts.fix ? ['--fix'] : [])]);
  });

program
  .command('typecheck')
  .description('Run TypeScript type checking')
  .action(async () => {
    await run('npx', ['tsc', '--noEmit']);
  });

program
  .command('test')
  .description('Run test suite')
  .option('-w, --watch', 'Watch mode')
  .option('-c, --coverage', 'Coverage report')
  .action(async (opts) => {
    const args = ['test'];
    if (opts.watch) args.push('--watch');
    if (opts.coverage) args.push('--coverage');
    await run('npm', args);
  });

program.parse();