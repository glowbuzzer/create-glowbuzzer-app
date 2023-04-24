import {join} from "path";
import {readFileSync, writeFileSync, rmSync, renameSync} from "fs";

function read_json_file(filename) {
    return JSON.parse(readFileSync(filename).toString());

}

export function process_project(name, gbr_version, versioned_dependencies) {
    function project_file(filename) {
        return join(name, filename);
    }

    const versions=versioned_dependencies.dependencies;
    const pkg=read_json_file(project_file("package.src.json"));
    const dependencies=read_json_file(project_file("dependencies.json"));

    for (const [key, value] of Object.entries(dependencies)) {
        if (value === "detect") {
            dependencies[key]=versions[key] || gbr_version;
        }
    }
    pkg.dependencies=dependencies;
    pkg.name=name;

    writeFileSync(project_file("package.json"), JSON.stringify(pkg, null, 2));
    rmSync(project_file( "package.src.json"));

    const vite_config = project_file("vite.config.ts");
    const ts_config = project_file("tsconfig.json");

    rmSync(vite_config);
    rmSync(ts_config);

    renameSync(project_file("vite.config.src.ts"), vite_config);
    renameSync(project_file("tsconfig.src.json"), ts_config);
}