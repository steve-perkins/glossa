#!/usr/bin/env node
// Content authoring CLI — stub for Phase 5.
// Commands will be: validate, publish, migrate-seed
import { Command } from 'commander';

const program = new Command();

program
  .name('glossa-content')
  .description('Glossa content authoring CLI')
  .version('0.1.0');

program
  .command('validate <file>')
  .description('Validate a draft content JSON file against the Glossa schemas')
  .action((file: string) => {
    console.log(`Validating ${file}… (not yet implemented)`);
  });

program
  .command('publish <file>')
  .description('Publish a validated draft to the Glossa Postgres database')
  .action((file: string) => {
    console.log(`Publishing ${file}… (not yet implemented)`);
  });

program
  .command('migrate-seed')
  .description('Seed the database from content/seed/')
  .action(() => {
    console.log('Seeding… (not yet implemented)');
  });

program.parse();
