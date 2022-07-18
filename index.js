/**
 * Copyright 2022 i4k (Tiago de Bem Natel de Moura)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const core = require('@actions/core');
const github = require('@actions/github');
const ghExec = require('@actions/exec');
const { spawn } = require("child_process");

const PHPBaseURL = "https://www.php.net/distributions/";
const PHPExt     = ".tar.gz";

if (process.argv.length > 2) {
  if (process.argv[2] == "local") {
    local();
  } else if (process.argv[2] == "direct-workflow") {
    ghBuild(process.argv[3]);
  }
} else {
  ghAction();
}

function local() {
  let version = "8.1.8";
  if (process.argv.length > 3) {
    version = process.argv[3];
  }

  cliBuild(version);
}

function ghAction() {
  try {
    let phpVersion = core.getInput('version');
    if (!phpVersion) {
      phpVersion = '8.1.8';
    }
    console.log(`Building PHP ${phpVersion}!`);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    ghBuild(phpVersion);

    core.setOutput("php_bin", "/usr/bin/php");

  } catch (error) {
    core.setFailed(error.message);
  }
}

function cliBuild(version) {
  const url = PHPBaseURL + "php-" + version + PHPExt;
  var child = spawn("bash", [
    "../scripts/build-php.sh", 
    url,
    version
  ]);

  child.stdout.on('data', function (data) {
    process.stdout.write(`${data}`);
  });

  child.stderr.on('data', function (data) {
    process.stderr.write(`${data}`);
  });

  child.on('close', function (code) {
    console.log('child process exited with code ' + code);
  });
}

async function ghBuild(version) {
  const url = PHPBaseURL + "php-" + version + PHPExt;
  await ghExec.exec("bash", [
    "../scripts/build-php.sh",
    url,
    version
  ]);
}
