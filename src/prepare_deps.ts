// Copies the open-abap dependencies to deps/ and runs abaplint --fix on them
// once, when the Docker image is built. abaplint downports one of these files
// (cl_abap_objectdescr) for open-abap. When that happened on every run, it
// made abaplint parse the file again and run all its rules a second time,
// which took about 0.5s. The runner copies the fixed files from deps/, so
// abaplint finds nothing to fix in them.
import * as fs from "fs";
import * as path from "path";
import { execSync } from 'child_process'
import { copyDeps } from "./deps";

const target = path.join(__dirname, "..", "..", "deps");
fs.rmSync(target, {recursive: true, force: true});
fs.mkdirSync(target);
copyDeps(target);
fs.copyFileSync(path.join(__dirname, "..", "abaplint.json"), path.join(target, "abaplint.json"));
execSync(`abaplint --fix`, {stdio: 'inherit', cwd: target});
fs.rmSync(path.join(target, "abaplint.json"));
