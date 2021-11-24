import * as Transpiler from "@abaplint/transpiler";
import * as fs from "fs";
import * as path from "path";
import { execSync, spawnSync } from 'child_process'

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

function run() {
  execSync(`cp ${inputDir}/* ${outputDir}`, {
    stdio: 'pipe',
  });

  let config: ITranspilerConfig = {
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

  fs.writeFileSync(outputDir + "/abap_transpile.json", JSON.stringify(config, null, 2));

  execSync(`cp open-abap/src/unit/*.clas.abap ${outputDir}`, {
    stdio: 'pipe',
  });

  const output: IOutput = {
    version: 1,
    status: "pass",
  }

  const COMPILE_RESULT = "_compile.txt";
  try {
    execSync(`npx abap_transpile > ` + COMPILE_RESULT, {
      stdio: 'pipe',
      cwd: outputDir});
  } catch (error) {
    output.status = "error";
    output.message = fs.readFileSync(path.join(outputDir, COMPILE_RESULT), "utf-8");
  }

  if (output.status === "pass") {
    execSync(`npm link @abaplint/runtime`, {
      stdio: 'pipe',
      cwd: outputDir });

    const RUN_RESULT = "foobar.txt";
    try {
      execSync(`node compiled/index.mjs > ` + RUN_RESULT, {
        stdio: 'pipe',
        cwd: outputDir});
    } catch (error) {
      output.status = "fail";
      output.message = fs.readFileSync(path.join(outputDir, RUN_RESULT), "utf-8");
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(output));
}

run();