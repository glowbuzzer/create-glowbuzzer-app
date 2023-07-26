#!/usr/bin/env node

import {existsSync} from "fs";
import degit from 'degit';
import inquirer from "inquirer";
import {process_project} from "./src/process.mjs";
import axios from "axios";

const [, , arg] = process.argv;
const noversion = arg === "--noversion";

function make_url(version) {
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
if (existsSync(answers.projectName)) {
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

try {
    // fetch package.json from gbr repository in order to determine current release version
    const gbr = await fetch(make_url("master"));
    const version = gbr.version;

    console.log(`Creating project using GBR version ${version} ... please wait`);

    const templateRepo = noversion ? "glowbuzzer/gbr/template" : `glowbuzzer/gbr/template#v${version}`;

    console.log("- Fetching GBR template");
    const emitter = degit(templateRepo, {cache: false, force: true});
    await emitter.clone(answers.projectName);

    // fetch the specific version of the package.json from the GBR repository,
    // so that we can update dependencies to specific versions used by the main project
    console.log("- Updating dependency versions");
    const versioned = await fetch(make_url(version));
    process_project(answers.projectName, version, versioned);

    console.log(`\nYour Glowbuzzer React project has been created in '${answers.projectName}'\n`);
    console.log("To get started:\n    cd " + answers.projectName + "\n    npm install\n    npm start\n");
} catch (e) {
    console.log("Error: " + e.message);
}
