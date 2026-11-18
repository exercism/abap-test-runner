// Writes the abaplint configuration used by every run to dist/abaplint.json.
// The build runs this once, so the runner only has to copy the file. Building
// the configuration at run time meant loading @abaplint/transpiler and
// @abaplint/core, which took about 0.8s per run.
import * as Transpiler from "@abaplint/transpiler";
import * as fs from "fs";
import * as path from "path";

const abaplintConfig = Transpiler.config;
abaplintConfig.rules["avoid_use"] = {
  "skipQuickFix": true,
  "break": true
};
abaplintConfig.rules["implement_methods"] = false; // this will be caught later by the transpiler
abaplintConfig.rules["downport"] = true;           // https://rules.abaplint.org/downport/
abaplintConfig.rules["definitions_top"] = true;    // https://rules.abaplint.org/definitions_top/
fs.writeFileSync(path.join(__dirname, "..", "abaplint.json"), JSON.stringify(abaplintConfig, null, 2));
