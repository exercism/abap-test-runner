import { spawnSync } from 'child_process';
import { join, resolve } from 'path';
import {expect} from "chai";
import * as fs from "fs";

const root = resolve(__dirname, '../..');
const fixtures = resolve(root, 'tests');
const bin = resolve(root, 'bin');
const run = resolve(bin, 'run.sh');
const output = join(root, 'output');
const outputFile = join(output, "results.json");

function readResult(): any {
  return JSON.parse(fs.readFileSync(outputFile, "utf-8"));
}

function checkExpected(expectedFile: string): void {
  const exp = fs.readFileSync(expectedFile, "utf-8");
  const act = fs.readFileSync(outputFile, "utf-8");
  expect(act).to.equal(exp);
}

function test(slug: string, expectedStatus: string) {
  const path = join(fixtures, slug);
  const res = spawnSync('bash', [run, slug, path, output], {cwd: root});
  expect(res.status).to.equal(0);
  checkExpected(join(path, "expected_results.json"));
  expect(readResult().status).to.equal(expectedStatus);
}

describe('abap-test-runner', async () => {
  it('simple, pass', async () => {
    test("simple-pass", "pass");
  });

  it('simple, fail', async () => {
    test("simple-fail", "fail");
  });

  it('simple, syntax error', async () => {
    test("simple-error", "error");
  });

  it('hello-world, pass', async () => {
    test("hello-world-pass", "pass");
  });

  it('simple-all-fail, fail', async () => {
    test("simple-all-fail", "fail");
  });

  it('simple-some-fail, fail', async () => {
    test("simple-some-fail", "fail");
  });
});