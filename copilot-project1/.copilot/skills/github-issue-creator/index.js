#!/usr/bin/env node
// .copilot/skills/github-issue-creator/index.js
// Skill entry point — invoked by Copilot CLI when skill commands are used

import { Command } from 'commander';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { Octokit } from '@octokit/rest';

const program = new Command();

program
  .name('github-issue-creator')
  .description('Create GitHub issues from TODO/FIXME comments')
  .version('1.0.0');

program
  .command('scan-todos')
  .description('Scan codebase for TODO/FIXME comments')
  .option('-p, --path <path>', 'Directory to scan', '.')
  .option('-d, --dry-run', 'Print issues without creating them', false)
  .action(async (options) => {
    const octokit = new Octokit({ auth: process.env.GH_TOKEN });
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'owner/repo').split('/');
    
    const files = await glob('**/*.{ts,tsx,js,jsx,py,go,rs}', { 
      cwd: options.path, 
      ignore: ['node_modules/**', 'dist/**', '.git/**'] 
    });

    const todos = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        const match = line.match(/\/\/\s*(TODO|FIXME|HACK|BUG):\s*(.+)/i);
        if (match) {
          todos.push({
            file,
            line: i + 1,
            type: match[1].toUpperCase(),
            text: match[2].trim()
          });
        }
      });
    }

    if (options.dryRun) {
      console.log(JSON.stringify(todos, null, 2));
      return;
    }

    for (const todo of todos) {
      const title = `[${todo.type}] ${todo.file}:${todo.line} — ${todo.text.slice(0, 60)}`;
      const body = `**File:** ${todo.file}:${todo.line}\n**Type:** ${todo.type}\n**Comment:** ${todo.text}`;
      
      await octokit.issues.create({
        owner,
        repo,
        title,
        body,
        labels: ['todo', todo.type.toLowerCase()]
      });
      console.log(`✅ Created issue: ${title}`);
    }
  });

program
  .command('create-issue')
  .description('Create a single GitHub issue')
  .requiredOption('-t, --title <title>', 'Issue title')
  .requiredOption('-b, --body <body>', 'Issue body')
  .option('-l, --labels <labels...>', 'Labels to apply', ['todo'])
  .action(async (options) => {
    const octokit = new Octokit({ auth: process.env.GH_TOKEN });
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'owner/repo').split('/');
    
    const { data } = await octokit.issues.create({
      owner,
      repo,
      title: options.title,
      body: options.body,
      labels: options.labels
    });
    console.log(`✅ Created issue #${data.number}: ${data.html_url}`);
  });

program.parse();