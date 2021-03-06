#!/usr/bin/env node

var lib = require('./lib'),
    env = require('./env'),
    cliparse = require("cliparse"),
    R = require('ramda'),
    process = require('process'),
    pkgJson = require('../package.json'),
    parsers = cliparse.parsers;

function lsRemote() {
    lib.getReleases().then(function (releases) {
        console.log('Available releases of Purescript: ');
        R.map(function (v) {
            console.log('\t', v);
        }, releases);
    });
}

function ls() {
    lib.getInstalledVersions().then(function (versions) {
        if (versions.length > 0) {
            console.log('Installed versions of Purescript');
            R.map(function (v) {
                console.log('\t', v);
            }, R.reverse(versions));
        } else {
            console.log('No installed version of Purescript found');
        }
    });
}

function latest() {
    lib.getLatestRelease().then(function (release) {
        console.log('Latest version of Purescript available:', release);
    });
}

function install(params) {
    env.createPSVMEnv();

    var version = params.args[0];

    lib.getInstalledVersions()
        .then(R.contains(version))
        .then(function (isVersionInstalled) {
            if (isVersionInstalled) {
                console.log('Version ' + version + ' is already installed');
            } else {
                lib.installVersion(version)
                    .catch(function (err) {
                        console.error(err);

                        process.exit(1);
                    });
            }
        });
}

function use(params) {
    var version = params.args[0];

    console.log('Switching to Purescript :', version);

    lib.use(version);
}

function current() {
    lib.getCurrentVersion()
        .then(function (version) {
            console.log('Current version of Purescript: ', version);
        }).catch(function (err) {
            if (err.code === 127) {
                console.error('No versions of psc are installed.');
                console.error('You can install the latest version by running : psvm install-latest');
                console.error('List all the installed versions by running : psvm ls');
                console.error('Select a version after installing it by running : psvm use <VERSION>');

                process.exit(127);
            } else {
                console.log(err.toString());
            }
        });
}

function installLatest() {
    env.createPSVMEnv();
    lib.getLatestRelease().then(lib.installVersion);
}

function uninstall(params) {
    env.createPSVMEnv();
    var version = params.args[0];

    lib.uninstallVersion(version);
}

var cliParser = cliparse.cli({
    name: "psvm",
    description: "Purescript version manager",
    version: pkgJson.version,
    commands: [
        cliparse.command(
            "ls-remote", {
                description: "List releases available on the Purescript repo",
                args: [],
                options: []
            },
            lsRemote),

        cliparse.command(
            "latest", {
                description: "Print the latest available version of Purescript",
                args: [],
                options: []
            },
            latest),

        cliparse.command(
            "install", {
                description: "Install a specific version of Purescript",
                args: [cliparse.argument("version", {
                    description: "version to install"
                })],
                options: []
            },
            install),

        cliparse.command(
            "use", {
                description: "Use the specified installed version of Purescript",
                args: [cliparse.argument("version", {
                    description: "version to use"
                })],
                options: []
            },
            use),

        cliparse.command(
            "ls", {
                description: "List installed versions of Purescript",
                args: [],
                options: []
            },
            ls),

        cliparse.command(
            "current", {
                description: "Output the current version used of Purescript",
                args: [],
                options: []
            },
            current),

        cliparse.command(
            "install-latest", {
                description: "Install the latest version of Purescript",
                args: [],
                options: []
            },
            installLatest),

        cliparse.command(
            "uninstall", {
                description: "Uninstall a specific version of Purescript",
                args: [cliparse.argument("version", {
                    description: "version to uninstall"
                })],
                options: []
            },
            uninstall)
    ]
});

cliparse.parse(cliParser);
