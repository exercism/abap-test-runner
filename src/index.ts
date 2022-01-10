import * as Transpiler from "@abaplint/transpiler";
import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process'
import { tmpdir } from "os";

const slug = process.argv[2];
const inputDir = process.argv[3];
const outputDir = process.argv[4];
const outputFile = process.argv[5];

interface IOutput {
  version: number,
  status: "pass" | "fail" | "error",
  message?: string,
}

export interface ITranspilerConfig {
  input_folder: string;
  /** list of regex, case insensitive, empty gives all files, positive list */
  input_filter: string[];
  output_folder: string;
  lib: string;
  write_unit_tests: boolean;
  write_source_map: boolean;
  options: Transpiler.ITranspilerOptions;
}

const output: IOutput = {
  version: 1,
  status: "pass",
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
    fs.writeFileSync(outputFile, JSON.stringify(output));
  }

  private syntaxAndDownport() {
    const LINT_RESULT = "_abaplint.txt";
    const abaplintConfig = Transpiler.config;
    abaplintConfig.rules["downport"] = true;        // https://rules.abaplint.org/downport/
    abaplintConfig.rules["definitions_top"] = true; // https://rules.abaplint.org/definitions_top/
    fs.writeFileSync(path.join(this.tmpDir, "abaplint.json"), JSON.stringify(abaplintConfig, null, 2));
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
    const config: ITranspilerConfig = {
      input_folder: ".",
      input_filter: [],
      output_folder: "compiled",
      lib: "",
      write_source_map: true,
      write_unit_tests: true,
      options: {
        ignoreSyntaxCheck: false,
        addFilenames: true,
        addCommonJS: true,
        unknownTypes: "runtimeError",
      }
    }

    const start = Date.now();
    fs.writeFileSync(path.join(this.tmpDir, "abap_transpile.json"), JSON.stringify(config, null, 2));
    execSync(`cp ${inputDir}/*.abap ${this.tmpDir}`, {stdio: 'pipe'});
    fs.mkdirSync(`${this.tmpDir}/deps`);
    execSync(`cp open-abap/src/unit/*.clas.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap/src/exceptions/* ${this.tmpDir}/deps/`, {stdio: 'pipe'});

    // DDIC, avoid copying transparent database table artifacts
    execSync(`cp -r open-abap/src/ddic/dtel/timestamp* ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp -r open-abap/src/ddic/ttyp/string_table* ${this.tmpDir}/deps/`, {stdio: 'pipe'});

    execSync(`cp open-abap/src/classrun/*.intf.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
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

  private link() {
    const RUN_RESULT = "_link_result.txt";
    const start = Date.now();
    execSync(`npm --loglevel verbose link @abaplint/runtime > ` + RUN_RESULT, {
      stdio: 'pipe',
      cwd: this.tmpDir });
    const end = Date.now();
    console.log("link: " + (end - start) + "ms");
    console.dir(fs.readFileSync(path.join(this.tmpDir, RUN_RESULT), "utf-8"));
  }
/*
  private getGlobalPath() {
    execSync(`npm root -g > _version.txt`, {
      stdio: 'pipe',
      cwd: this.tmpDir });
    const p = fs.readFileSync(path.join(this.tmpDir, "_version.txt"), "utf-8").trim();
    execSync(`cp -r ${p} ${this.tmpDir}`, {stdio: 'pipe'});
    return p;
  }
  */

  private executeTests() {
    const start = Date.now();
    const RUN_RESULT = "_run_result.txt";

    try {
      execSync(`node compiled/index.mjs > ` + RUN_RESULT, {
        stdio: 'pipe',
        cwd: this.tmpDir});
    } catch (error) {
      output.status = "fail";
      output.message = fs.readFileSync(path.join(this.tmpDir, RUN_RESULT), "utf-8");
      if (output.message.includes("Error: ASSERT failed")) {
        output.message = output.message.split("Error: ASSERT failed")[0] + "Error: ASSERT failed";
      }
      output.message = output.message.trim();
    }
    const end = Date.now();
    console.log("executeTests: " + (end - start) + "ms");
  }
}

new Runner().run();