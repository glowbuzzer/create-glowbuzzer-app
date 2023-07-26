#!/usr/bin/env node

import {existsSync} from "fs";
import degit from 'degit';
import inquirer from "inquirer";
import {process_project} from "./src/process.mjs";
import axios from "axios";

const [, , ...args] = process.argv;
const noversion = args.includes("--noversion");
const force = args.includes("--force");

noversion && console.log("Using latest development version of GBR");
force && console.log("Force overwrite existing project enabled");

function package_fetch_url(version) {
    return `https://cdn.jsdelivr.net/gh/glowbuzzer/gbr@${version}/package.json`;
}

const questions = [
    {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: 'my-glowbuzzer-app',
    },
];

const answers = await inquirer.prompt(questions);

// don't overwrite an existing project
if (existsSync(answers.projectName) && !force) {
    console.log("Error: directory '" + answers.projectName + "' already exists");
    process.exit(1)
}

async function fetch(url) {
    const response = await axios.get(url, {
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': 'application/json'
        }
    });
    return response.data;
}

async function versions() {
    if (noversion) {
        console.log("Creating project using latest development template and alpha GBR version ... please wait")
        return ["alpha", "main"]
    } else {
        const {version}=await fetch(package_fetch_url("main"));
        console.log(`Creating project using GBR version '${version}' ... please wait`);
        return [version, "v"+version];
    }
}

try {
    // fetch package.json from gbr repository in order to determine current release version
    const [npm_version, github_version] = await versions();

    const templateRepo = `glowbuzzer/gbr/template#${github_version}`;

    console.log("- Fetching GBR template");
    const emitter = degit(templateRepo, {cache: false, force: true});
    await emitter.clone(answers.projectName);

    // fetch the specific version of the package.json from the GBR repository,
    // so that we can update dependencies to specific versions used by the main project
    console.log("- Updating dependency versions");
    const versioned = await fetch(package_fetch_url(github_version));
    process_project(answers.projectName, npm_version, versioned);

    console.log(`\nYour Glowbuzzer React project has been created in '${answers.projectName}'\n`);
    console.log("To get started:\n    cd " + answers.projectName + "\n    npm install\n    npm start\n");
} catch (e) {
    console.log("Error: " + e.message);
}
