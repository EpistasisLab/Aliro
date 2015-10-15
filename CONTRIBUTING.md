# Contributing to FGLab/FGMachine

Thank you for getting involved with FGLab/FGMachine. Please review the following guidelines to make ease the contribution process.

## Submitting an Issue

Before submitting an issue, please check open and closed issues to see if it has already been reported. If it appears to be a new bug, please double check before submitting the issue. Provide plenty of information about the bug, and if possible outline a reproducible set of steps to reproduce the error. Feature request issues are also welcome.

## Submitting a Pull Request

[Fork](https://help.github.com/articles/fork-a-repo/) this repository, make sure it's [up-to-date](https://help.github.com/articles/syncing-a-fork/), and then submit a [pull request](https://help.github.com/articles/using-pull-requests/) once you've committed your changes. 

### Coding Recommendations

There are currently no set guidelines, but please try to abide by the following coding conventions for consistency:

- Indent with (2 space) tabs
- camelCase variable names
- Always use semicolons
- `"` for strings, with `'` used internally as necessary

### Commit Conventions
 
This project uses [AngularJS commit conventions](https://github.com/ajoslin/conventional-changelog/blob/master/conventions/angular.md). This provides not only an easily readable standard, but also allows the changelog and releases to be automated. Valid type prefixes and their explanations are available from the [AngularJS contributing guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#type). As a reminder, GitHub allows issues to be closed using [commit messages](https://help.github.com/articles/closing-issues-via-commit-messages/).

**Tip:** the `-m` flag can be used multiple times with `git commit` to write more descriptive messages, for example:

```sh
git commit -m "feat: add awesome new bar feature" -m "This new bar feature is funkalicious" -m "BREAKING CHANGE: This replaces the slightly less cool foo feature"
```

## Further Information

As the project evolves, this guidelines stand to change. For more details about issues and pull requests, please see the [Torch7 contributing guidlines](https://github.com/torch/nn/blob/master/CONTRIBUTING.md) for now.
