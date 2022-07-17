const core = require('@actions/core');
const github = require('@actions/github');
const ghExec = require('@actions/exec');
const { spawn } = require("child_process");

const PHPBaseURL = "https://www.php.net/distributions/";
const PHPExt     = ".tar.gz";

console.log("info:", process.argv);
if (process.argv.length > 2 && process.argv[2] == "local") {
  local();
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
    const phpVersion = core.getInput('version');
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
    "./scripts/build-php.sh", 
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
    "./scripts/build-php.sh",
    url,
    version
  ]);
}
