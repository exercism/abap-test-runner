import { spawnSync } from 'child_process'
import { join, resolve } from 'path'
/*
import { lstat, mkdtempSync, readFileSync, unlink } from 'fs'
import { tmpdir } from 'os'
*/

const root = resolve(__dirname, '..');
const fixtures = resolve(__dirname, 'fixtures');
const bin = resolve(root, 'bin');
const run = resolve(bin, 'run.sh');

describe('abap-test-runner', async () => {
  it('passing solution', async () => {
    const res = spawnSync('bash', [run, 'hello-world', join(fixtures, 'hello-world', 'pass')], {
      stdio: 'pipe',
      cwd: root,
    });
    console.dir(res);

  });
});