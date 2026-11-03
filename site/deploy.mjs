// The production deploy step on Cloudflare Workers Builds: the build trigger's deploy
// command is `npm run deploy:ci`. It runs `wrangler deploy`, and when Cloudflare's API
// fails for a moment (on 3 November 2026 a Pages CMS save was never published because
// the asset upload returned "An unknown error has occurred [code: 10013]"), it tries
// again after 20 and then 40 seconds before giving up.

import { spawnSync } from 'node:child_process';

const WAITS = [20, 40];

for (let attempt = 1; ; attempt++) {
  const { status, error } = spawnSync('npx', ['wrangler', 'deploy'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (status === 0) process.exit(0);
  const wait = WAITS[attempt - 1];
  if (wait === undefined) {
    console.error(`wrangler deploy failed ${attempt} times, giving up.`);
    process.exit(status || 1);
  }
  console.error(`wrangler deploy failed (attempt ${attempt}${error ? `: ${error.message}` : ''}), trying again in ${wait} seconds.`);
  await new Promise((resolve) => setTimeout(resolve, wait * 1000));
}
