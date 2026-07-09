"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileData = exports.deleteFile = exports.uploadFileToResultsFolder = void 0;
const path_1 = __importDefault(require("path"));
const UtilModels_1 = require("./../models/UtilModels");
const fs = __importStar(require("fs"));
const stream_1 = require("stream");
function uploadFileToResultsFolder(response_1) {
    return __awaiter(this, arguments, void 0, function* (response, fileName = UtilModels_1.resultZipFileName) {
        try {
            const filePath = path_1.default.join(UtilModels_1.resultFolder, fileName);
            const file = fs.createWriteStream(filePath);
            return new Promise((resolve, reject) => {
                file.on("error", (err) => reject(err));
                const stream = response.message.pipe(file);
                stream.on("close", () => {
                    try {
                        resolve(filePath);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            });
        }
        catch (err) {
            err.message = "Error in fetching the results of the testRun";
            throw new Error(err);
        }
    });
}
exports.uploadFileToResultsFolder = uploadFileToResultsFolder;
function deleteFile(foldername) {
    if (fs.existsSync(foldername)) {
        fs.readdirSync(foldername).forEach((file, index) => {
            const curPath = path_1.default.join(foldername, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFile(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(foldername);
    }
}
exports.deleteFile = deleteFile;
function uploadFileData(filepath) {
    try {
        let filedata = fs.readFileSync(filepath);
        const readable = new stream_1.Readable();
        readable._read = () => { };
        readable.push(filedata);
        readable.push(null);
        return readable;
    }
    catch (err) {
        err.message = "File not found " + filepath;
        throw new Error(err.message);
    }
}
exports.uploadFileData = uploadFileData;
