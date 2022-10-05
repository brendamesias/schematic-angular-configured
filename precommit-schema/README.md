#Build and publish custom schematics

### 1. run npm rum build command instead
### 2.Now we could run npm publish but let’s run npm pack instead which will give us precommit-lint-prettier-new-project-1.0.0.tgz file which we can copy to some Angular CLI workspace project.
### 3. Then, in the target Angular CLI workspace we can run npm i --no-save precommit-lint-prettier-new-project-1.0.0.tgz which will install our package into that project.
### 4. The last step is to run schematics by referencing package name instead of the path to local schematics project. We can run ng g @precommit-lint-prettier/new-project
 
