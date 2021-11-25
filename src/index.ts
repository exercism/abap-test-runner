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

const COMPILE_RESULT = "_compile_result.txt";
const RUN_RESULT = "_run_result.txt";

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
    this.transpile();
    if (output.status === "pass") {
      this.executeTests();
    }
    fs.writeFileSync(outputFile, JSON.stringify(output));
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

    fs.writeFileSync(path.join(this.tmpDir, "abap_transpile.json"), JSON.stringify(config, null, 2));
    execSync(`cp ${inputDir}/*.abap ${this.tmpDir}`, {stdio: 'pipe'});
    fs.mkdirSync(`${this.tmpDir}/deps`);
    execSync(`cp open-abap/src/unit/*.clas.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
    execSync(`cp open-abap/src/classrun/*.intf.abap ${this.tmpDir}/deps/`, {stdio: 'pipe'});
  }

  private transpile() {
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
  }

  private executeTests() {
    execSync(`npm link @abaplint/runtime`, {
      stdio: 'pipe',
      cwd: this.tmpDir });

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
  }
}

new Runner().run();