import path from 'path';
import { resultFolder, resultZipFileName } from './UtilModels';
import * as fs from 'fs';
import { Readable } from 'stream';

export async function uploadFileToResultsFolder(response:any, fileName : string = resultZipFileName) {
    try {
        const filePath = path.join(resultFolder, fileName);
        const file: NodeJS.WritableStream = fs.createWriteStream(filePath);
        
        return new Promise((resolve, reject) => {
            file.on("error", (err) => reject(err));
            const stream = response.message.pipe(file);
            stream.on("close", () => {
                try { resolve(filePath); } catch (err) {
                    reject(err);
                }
            });
        });
    }
    catch(err:any) {
        err.message = "Error in fetching the results of the testRun";
        throw new Error(err);
    }
}

export function deleteFile(foldername:string) 
{
    if (fs.existsSync(foldername)) 
    {
        fs.readdirSync(foldername).forEach((file, index) => {
            const curPath = path.join(foldername, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFile(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(foldername);
    }
}

export function uploadFileData(filepath: string) {
    try
    {
        let filedata : Buffer = fs.readFileSync(filepath);
        const readable = new Readable();
        readable._read = () => {};
        readable.push(filedata);
        readable.push(null);
        return readable;
    }
    catch(err:any) {
        err.message = "File not found "+ filepath;
        throw new Error(err.message);
    }
}