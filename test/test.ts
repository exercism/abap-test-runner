import { spawnSync } from 'child_process'
import { join, resolve } from 'path'

const root = resolve(__dirname, '../..');
const fixtures = resolve(root, 'test', 'fixtures');
const bin = resolve(root, 'bin');
const run = resolve(bin, 'run.sh');

describe('abap-test-runner', async () => {
  it('simple, pass', async () => {
    const slug = "simple";
    const path = join(fixtures, slug, 'pass');
    const output = join(root, 'output');
    const res = spawnSync('bash', [run, slug, path, output], {cwd: root});
  });
});