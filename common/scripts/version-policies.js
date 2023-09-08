
const fs = require('fs')
const path = require('path')
const parseVersion = require('./parse-version');
const PRERELEASE = 'prerelease';
const MINOR = 'minor';
const MAJOR = 'major';
const PATCH = 'patch';
const NEXT_BUMPMS = [PRERELEASE, PATCH, MINOR, MAJOR];
const setJsonFileByKey = require('./set-json-file');


const parseNextBumpFromVersion = (
  versionString
) => {
  const res = parseVersion(versionString);

  if (res) {  
    if (res.patch === 0) {
      return res.minor == 0 ? MAJOR : MINOR;
    }

    return PATCH
  }

  console.error(`can parse nextBump from version: ${versionString}`)
  process.exit(1);
}

const writeNextBump = (
  nextBump,
) => {
  const filePath = path.join(__dirname, '../config/rush/version-policies.json');
  let fileContent = fs.readFileSync(filePath).toString()
  const json = JSON.parse(fileContent);
  const curNextBump = json[0].nextBump

  if (nextBump !== curNextBump) {
    fileContent = setJsonFileByKey(fileContent, json, ['0', 'nextBump'], nextBump);

    fs.writeFileSync(path.join(__dirname, '../config/rush/version-policies.json'), fileContent)
  }
}

const readNextBumpFromChanges = () => {
  const changeRoots = [
    path.join(__dirname, '../changes/@visactor/vutils'),
    path.join(__dirname, '../changes/@visactor/vdataset'),
    path.join(__dirname, '../changes/@visactor/vscale')
  ];

  const changeType = [];

  changeRoots.forEach(rootPath => {
    try {
      const filenames = fs.readdirSync(rootPath);
      console.log(filenames)
  
      if (filenames && filenames.length) {
  
        filenames.forEach(fileName => {
          const json = JSON.parse(fs.readFileSync(path.join(rootPath, fileName)).toString());
  
          if (json.changes && json.changes.length) {
            json.changes.forEach(change => {
              if (change.type && !changeType.includes(change.type)) {
                changeType.push(change.type);
              }
            })
          }
        });
      }
    } catch (e) {
    }
  })
  
  return changeType.includes(MAJOR) ? MAJOR : changeType.includes(MINOR) ? MINOR : PATCH;
}

const checkAndUpdateNextBump = (version) => {
  let nextBump = PATCH;

   if (version && NEXT_BUMPMS.includes(version)) {
    nextBump = version;
  } else if (version) {
    nextBump = parseNextBumpFromVersion(version);
  } else {
    nextBump = readNextBumpFromChanges();
  }
  writeNextBump(nextBump);

  return nextBump;
}

module.exports = checkAndUpdateNextBump;