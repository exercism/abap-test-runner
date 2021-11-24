import * as Transpiler from "@abaplint/transpiler";
import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process'

const slug = process.argv[2];
const inputDir = process.argv[3];
const outputDir = process.argv[4];
const outputFile = process.argv[5];

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
    input_folder: outputDir,
    input_filter: [],
    output_folder: outputDir,
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

  console.dir(outputDir);
  fs.writeFileSync(outputDir + "/abap_transpile.json", JSON.stringify(config, null, 2));

  execSync(`cp open-abap/src/unit/*.clas.abap ${outputDir}`, {
    stdio: 'pipe',
  });

  const resCompile = execSync(`npx abap_transpile > ${outputDir}/_compile.txt`, {
    stdio: 'pipe',
    cwd: outputDir
  });
  console.dir(resCompile.toString());

  execSync(`npm link @abaplint/runtime`, {
    stdio: 'pipe',
    cwd: outputDir
  });

  const resRun = execSync(`node index.mjs > foobar.txt`, {
    stdio: 'pipe',
    cwd: outputDir
  });
//  console.dir(resRun.toString());

  fs.writeFileSync(outputFile, `{"version": 1, "status": "pass"}`);
}

run();