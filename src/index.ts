import * as Transpiler from "@abaplint/transpiler";
import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process'

const inputDir = process.argv[2];
const outputDir = process.argv[3];
const outputFile = process.argv[4];

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
  let config: ITranspilerConfig = {
    input_folder: ".",
    input_filter: [],
    output_folder: outputDir,
    lib: "https://github.com/open-abap/open-abap",
    write_source_map: true,
    write_unit_tests: true,
    options: {
      ignoreSyntaxCheck: false,
      addFilenames: true,
      addCommonJS: true,
      unknownTypes: "runtimeError",
    }
  }

  fs.writeFileSync(inputDir + "/abap_transpile.json", JSON.stringify(config, null, 2));

  const resCompile = execSync(`npx abap_transpile > ${outputDir}/_compile.txt`, {
    stdio: 'pipe',
    cwd: inputDir
  });

  const resRun = execSync(`node index.mjs`, {
    stdio: 'pipe',
    cwd: outputDir
  });

  fs.writeFileSync(outputFile, `{"version": 1, "status": "pass"}`);
}

run();