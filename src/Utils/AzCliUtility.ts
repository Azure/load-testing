import { execFile } from "child_process";

export async function execAz(cmdArguments: string[]): Promise<any> {
    const azCmd = process.platform === "win32" ? "az.cmd" : "az";
    return new Promise<any>((resolve, reject) => {
        execFile(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8", shell : true }, (error:any, stdout:any) => {
            if (error) {
                return reject(error);
            }
            try {
                return resolve(JSON.parse(stdout));
            } catch (err:any) {
                const msg =
                    `An error occurred while parsing the output "${stdout}", of ` +
                    `the cmd az "${cmdArguments}": ${err.message}.`;
                return reject(new Error(msg));
            }
        });
    });
}