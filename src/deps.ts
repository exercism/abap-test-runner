import { execSync } from 'child_process'

// Copies the open-abap files that every solution depends on into target.
export function copyDeps(target: string) {
  execSync(`cp extra/* ${target}/`, {stdio: 'pipe'});

  execSync(`cp open-abap-core/src/unit/*.clas*.abap ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/exceptions/* ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/rtti/* ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/abap/abap.type.abap ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/abap/cl_abap_char_utilities.clas.abap ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/cl_message_helper.clas.abap ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/abap/math/cl_abap_math.clas.abap ${target}/`, {stdio: 'pipe'});
  execSync(`cp open-abap-core/src/kernel/kernel_internal_name.clas.abap ${target}/`, {stdio: 'pipe'});

  // DDIC, avoid copying transparent database table artifacts
  execSync(`cp -r open-abap-core/src/ddic/dtel/timestamp* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/dtel/sy* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/dtel/int1* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/dtel/sotr_conc* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/doma/char30* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/_deprecated/dtel/char30* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/ttyp/string_table* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/structures/scx* ${target}/`, {stdio: 'pipe'});
  execSync(`cp -r open-abap-core/src/ddic/structures/x031l* ${target}/`, {stdio: 'pipe'});

  execSync(`cp open-abap-core/src/classrun/*.intf.abap ${target}/`, {stdio: 'pipe'});
  execSync(`rm ${target}/*.testclasses.*`, {stdio: 'pipe'});
}
