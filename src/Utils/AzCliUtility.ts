import { execFile } from "child_process";
import { AccountType, ControlPlaneTokenScope, DataPlaneTokenScope } from "../models/TaskParameters";

export async function getDPTokens(tokenScope: ControlPlaneTokenScope| DataPlaneTokenScope): Promise<any> {
    const cmdArguments = ["account", "get-access-token", "--resource"];
    cmdArguments.push(tokenScope);
    return execAz(cmdArguments);
}

export async function getAccounts(accountType: AccountType): Promise<any> {
    const cmdArguments = accountType === 'Subscription' ? ["account", "show"] : ["cloud", "show"];
    return execAz(cmdArguments);
}

async function execAz(cmdArguments: string[]): Promise<any> {
    const azCmd = process.platform === "win32" ? "az.cmd" : "az";
    return new Promise<any>((resolve, reject) => {
        execFile(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8", shell : process.platform === "win32" }, (error:any, stdout:any) => {
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
