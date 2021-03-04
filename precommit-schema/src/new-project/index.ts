import { normalize } from '@angular-devkit/core';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { apply, chain, externalSchematic, mergeWith, move, Rule, SchematicContext, Tree, url } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType, removePackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { devDependencies } from './devDependencies';
import { dependencies } from './dependencies';

export interface dependencyProperties { listDependencies: { [key: string]: string }, typeDependency: NodeDependencyType };
export function generateNewProject(_options: any): Rule {
    const name = dasherize(_options.name);

    return (tree: Tree, _context: SchematicContext) => {
        const filesConfiguration = apply(url('./files/FilesConfiguration'), [
            move(normalize(`${name}/`))
        ]);

        const filesVsCode = apply(url('./files/filesVsCode'), [
            move(normalize(`${name}/.vscode`))
        ]);

        tree.create(`${name}/.eslintignore`, `
        node_modules
        dist
        src/main.ts
        src/polyfills.ts
        `)

        const dependenciesArray: dependencyProperties[] = [
            { listDependencies: devDependencies, typeDependency: NodeDependencyType.Dev },
            { listDependencies: dependencies, typeDependency: NodeDependencyType.Default }
        ]


        const rule = chain([
            generateRepo(name),
            mergeWith(filesConfiguration),
            mergeWith(filesVsCode),
            addDependencies(name, dependenciesArray),
            updatePackageJson(name),
            updateAngularJson(name)
        ])

        return rule(tree, _context) as Rule;
    }
}

function addDependencies(name: string, dependenciesArray: dependencyProperties[]): Rule {
    return (host: Tree, _context: SchematicContext) => {
        const dependenciesToRemove = ["codelyzer", 'protractor'];
        dependenciesArray.map(dependenciesList => {

            for (let pkg in dependenciesList.listDependencies) {
                const nodeDependency: NodeDependency = _nodeDependencyFactory(
                    pkg, dependenciesList.listDependencies[pkg], dependenciesList.typeDependency);

                addPackageJsonDependency(host, nodeDependency, `${name}/package.json`);
            }
        })

        dependenciesToRemove.map(nameDependency => {
            removePackageJsonDependency(host, nameDependency, `${name}/package.json`)
        })

        _context.addTask(new NodePackageInstallTask());
    };
}

function _nodeDependencyFactory(packageName: string, version: string, dependencyType: NodeDependencyType): NodeDependency {
    return {
        type: dependencyType,
        name: packageName,
        version: version,
        overwrite: true
    };
}


function generateRepo(name: string): Rule {
    return externalSchematic('@schematics/angular', 'ng-new', {
        name,
        version: '11.2.1',
        directory: name,
        routing: true,
        style: 'scss',
        inlineStyle: false,
        inlineTemplate: false,
    });
}
function updatePackageJson(name: string): Rule {
    return (tree: Tree, _: SchematicContext): Tree => {
        const path = `/${name}/package.json`;
        const file = tree.read(path);
        const json = JSON.parse(file!.toString());

        json.scripts = {
            ...json.scripts,
            lint: 'ng lint',
        };

        json.husky = {
            'hooks': {
                'pre-commit': 'lint-staged --relative',
            }
        };

        json["lint-staged"] = {
            '*.{js,ts}': [
                'eslint --fix'
            ]
        }

        tree.overwrite(path, JSON.stringify(json, null, 2));
        return tree;
    }
}
function updateAngularJson(name: string): Rule {
    return (tree: Tree, _: SchematicContext): Tree => {
        const path = `/${name}/angular.json`;
        const file = tree.read(path);
        const json = JSON.parse(file!.toString());

        json.projects[name].architect.lint = {
            'builder': '@angular-eslint/builder:lint',
            'options': {
                'eslintConfig': '.eslintrc.js',
                'tsConfig': [
                    'tsconfig.app.json',
                    'tsconfig.spec.json',
                    'e2e/tsconfig.json'
                ],
                'exclude': [
                    '**/node_modules/**'
                ]
            }
        };

        tree.overwrite(path, JSON.stringify(json, null, 2));
        return tree;
    }
}
