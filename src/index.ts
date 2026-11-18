import type { UnknownTypesEnum } from "@abaplint/transpiler";
import type * as Cli from "@abaplint/transpiler-cli";
import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process'
import { tmpdir } from "os";

const slug = process.argv[2];
const inputDir = process.argv[3];
const outputDir = process.argv[4];
const outputFile = process.argv[5];

interface IOutputTest {
  name: string,
  status: "pass" | "fail" | "error",
  message: string,
  output?: string,
  test_code?: string,
}

interface IOutput {
  version: number,
  status: "pass" | "fail" | "error",
  message?: string,
  tests: IOutputTest[],
}

// **************************************

const output: IOutput = {
  version: 2,
  status: "pass",
  tests: [],
}

class Runner {
  private readonly tmpDir: string;

  public constructor() {
    this.tmpDir = fs.mkdtempSync(path.join(tmpdir(), 'exercism-abap-runner-'));
  }

  public run() {
    this.initialize();
    this.syntaxAndDownport();
    if (output.status === "pass") {
      this.transpile();
    }
    if (output.status === "pass") {
      this.link();
      this.executeTests();
    }
    if (output.status === "pass") {
      this.readJsonResult();
    }
    fs.writeFileSync(outputFile, JSON.stringify(output));
  }

  private readJsonResult() {
    const list = JSON.parse(fs.readFileSync(path.join(this.tmpDir, "compiled", "output.json"), "utf-8"));
    for (const t of list) {
      if (t.status !== "SUCCESS") {
        output.status = "fail";
      }
      if (t.console && t.console !== "") {
        output.tests.push({
          name: t.method_name,
          status: t.status === "SUCCESS" ? "pass" : "fail",
          output: t.console,
          message: t.message});
      } else {
        output.tests.push({
          name: t.method_name,
          status: t.status === "SUCCESS" ? "pass" : "fail",
          message: t.message});
      }
    }
  }

  private syntaxAndDownport() {
    const LINT_RESULT = "_abaplint.txt";
    // The build writes this file with src/abaplint_config.ts.
    fs.copyFileSync(path.join(__dirname, "..", "abaplint.json"), path.join(this.tmpDir, "abaplint.json"));
    const start = Date.now();
    try {
      execSync(`abaplint --fix > ` + LINT_RESULT, {
        stdio: 'pipe',
        cwd: this.tmpDir});
    } catch (error) {
      output.status = "error";
      output.message = fs.readFileSync(path.join(this.tmpDir, LINT_RESULT), "utf-8");
      output.message = output.message.replace(/, \d+ file\(s\) analyzed\nFixes applied/, "");
    }
    const end = Date.now();
    console.log("syntaxAndDownport: " + (end - start) + "ms");
  }

  private initialize() {
    const config: Cli.ITranspilerConfig = {
      input_folder: ".",
      input_filter: [],
      output_folder: "compiled",
      write_source_map: false,
      write_unit_tests: true,
      options: {
        ignoreSyntaxCheck: false,
        addFilenames: true,
        addCommonJS: true,
        unknownTypes: "runtimeError" as UnknownTypesEnum,
      }
    }

    const start = Date.now();
    fs.writeFileSync(path.join(this.tmpDir, "abap_transpile.json"), JSON.stringify(config, null, 2));
    execSync(`cp ${inputDir}/*.abap ${this.tmpDir}`, {stdio: 'pipe'});
    fs.mkdirSync(`${this.tmpDir}/deps`);

    execSync(`cp extra/* ${this.tmpDir}/deps/`, {stdio: 'pipe'});

    execSync(`cp open-abap-core/src/unit/*.clas*.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/exceptions/* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/rtti/* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/abap/abap.type.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/abap/cl_abap_char_utilities.clas.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/cl_message_helper.clas.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/abap/math/cl_abap_math.clas.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap-core/src/kernel/kernel_internal_name.clas.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});

    // DDIC, avoid copying transparent database table artifacts
    execSync(`cp -r open-abap-core/src/ddic/dtel/timestamp* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/dtel/sy* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/dtel/int1* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/dtel/sotr_conc* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/doma/char30* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/_deprecated/dtel/char30* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/ttyp/string_table* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/structures/scx* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap-core/src/ddic/structures/x031l* ${this.tmpDir}/deps/`, {stdio: 'pipe'});

    execSync(`cp open-abap-core/src/classrun/*.intf.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`rm ${this.tmpDir}/deps/*.testclasses.*`, {stdio: 'pipe'});
    const end = Date.now();
    console.log("initialize: " + (end - start) + "ms");
  }

  private transpile() {
    const start = Date.now();
    const COMPILE_RESULT = "_compile_result.txt";
    try {
      execSync(`abap_transpile > ` + COMPILE_RESULT, {
        stdio: 'pipe',
        cwd: this.tmpDir});
    } catch (error) {
      output.status = "error";
      output.message = fs.readFileSync(path.join(this.tmpDir, COMPILE_RESULT), "utf-8");
      output.message = output.message.split("at Transpiler.validate")[0];
      output.message = output.message.trim();
    }
    const end = Date.now();
    console.log("transpile: " + (end - start) + "ms");
  }

  // Makes @abaplint/runtime importable from the compiled tests by symlinking
  // node_modules/@abaplint/runtime to the globally installed package, which is
  // what `npm link @abaplint/runtime` did. Creating the symlink directly is
  // faster: npm took about 5.7s per run, because after linking, its update
  // check waited about 5s for a DNS lookup that can't succeed without a
  // network, and starting npm itself took about 0.6s. If there is no global
  // install (as when running the tests outside Docker), the runner's own copy
  // of the package is used instead.
  private link() {
    const start = Date.now();
    const globalRuntime = path.join(path.dirname(process.execPath), "..", "lib", "node_modules", "@abaplint", "runtime");
    const runtime = fs.existsSync(globalRuntime)
      ? globalRuntime
      : path.dirname(require.resolve("@abaplint/runtime/package.json"));
    fs.mkdirSync(path.join(this.tmpDir, "node_modules", "@abaplint"), {recursive: true});
    fs.symlinkSync(runtime, path.join(this.tmpDir, "node_modules", "@abaplint", "runtime"));
    const end = Date.now();
    console.log("link: " + (end - start) + "ms");
  }

  private executeTests() {
    const start = Date.now();
    const RUN_RESULT = "_run_result.txt";

    try {
      execSync(`node compiled/_unit_open.mjs > ` + RUN_RESULT, {
        stdio: 'pipe',
        cwd: this.tmpDir});
    } catch (error) {
      output.status = "error";
      output.message = fs.readFileSync(path.join(this.tmpDir, RUN_RESULT), "utf-8");
      if (output.message.includes("Error: ASSERT failed")) {
        output.message = output.message.split("Error: ASSERT failed")[0] + "Error: ASSERT failed";
      }
      output.message = output.message.trim();
      if (output.message === "") {
        // @ts-ignore
        output.message = error.toString();
        if (output.message?.includes("SyntaxError:")) {
          output.message = output.message.split("\n").filter(e => e.includes("SyntaxError:")).join("").trim();
        }
      }
    }
    const end = Date.now();
    console.log("executeTests: " + (end - start) + "ms");
  }
}

new Runner().run();