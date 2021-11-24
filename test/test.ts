import { spawnSync } from 'child_process';
import { join, resolve } from 'path';
import {expect} from "chai";
import * as fs from "fs";

const root = resolve(__dirname, '../..');
const fixtures = resolve(root, 'test', 'fixtures');
const bin = resolve(root, 'bin');
const run = resolve(bin, 'run.sh');
const output = join(root, 'output');
const outputFile = join(output, "results.json");

function readResult(): any {
  return JSON.parse(fs.readFileSync(outputFile, "utf-8"));
}

describe('abap-test-runner', async () => {
  it('simple, pass', async () => {
    const slug = "simple-pass";
    const path = join(fixtures, slug);
    const res = spawnSync('bash', [run, slug, path, output], {cwd: root});
    expect(res.status).to.equal(0);
    expect(readResult().status).to.equal("pass");
  });

  it('simple, fail', async () => {
    const slug = "simple-fail";
    const path = join(fixtures, slug);
    const res = spawnSync('bash', [run, slug, path, output], {cwd: root});
    expect(res.status).to.equal(0);
    expect(readResult().status).to.equal("fail");
  });
});