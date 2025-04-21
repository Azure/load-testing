"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execAz = void 0;
const child_process_1 = require("child_process");
function execAz(cmdArguments) {
    return __awaiter(this, void 0, void 0, function* () {
        const azCmd = process.platform === "win32" ? "az.cmd" : "az";
        return new Promise((resolve, reject) => {
            (0, child_process_1.execFile)(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8", shell: true }, (error, stdout) => {
                if (error) {
                    return reject(error);
                }
                try {
                    return resolve(JSON.parse(stdout));
                }
                catch (err) {
                    const msg = `An error occurred while parsing the output "${stdout}", of ` +
                        `the cmd az "${cmdArguments}": ${err.message}.`;
                    return reject(new Error(msg));
                }
            });
        });
    });
}
exports.execAz = execAz;
