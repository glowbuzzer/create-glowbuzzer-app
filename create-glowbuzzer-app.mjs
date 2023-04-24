#!/usr/bin/env node
import degit from 'degit';
import inquirer from "inquirer";
import {fetch} from "./src/fetch.mjs"
import {process_project} from "./src/process.mjs";

const [, , arg] = process.argv;
const noversion=arg === "--noversion";

const questions = [
    {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-glowbuzzer-app',
    },
];

const answers = await inquirer.prompt(questions);

// fetch package.json from gbr repository in order to determine current release version
const gbr= await fetch('https://raw.githubusercontent.com/glowbuzzer/gbr/master/package.json');
const version= gbr.version;

console.log(`Creating app using GBR version ${version} ... please wait`);

const templateRepo = noversion ? "glowbuzzer/gbr/template" : `glowbuzzer/gbr/template#v${version}`;

const emitter = degit(templateRepo, {cache: false, force: true});
await emitter.clone(answers.projectName);

// fetch the specific version of the package.json from the GBR repository,
// so that we can update dependencies to specific versions used by the main project
const versioned= await fetch(`https://raw.githubusercontent.com/glowbuzzer/gbr/v${version}/package.json`);

process_project(answers.projectName, version, versioned);

console.log(`\nYour Glowbuzzer app has been created in '${answers.projectName}'\n`);
console.log("To get started:\n    cd " + answers.projectName + "\n    npm install\n    npm start\n");
