/**
 * This is simple module for adding/removing some custom methods for each JS function
 * Main usage is to add/remove custom logs to every file by given directory
 */
const path      = require('path');
const chalk     = require('chalk');
const prompt    = require('prompt');
const fs        = require('fs');
const readline  = require('readline');
const commander = require('commander');

//helpers
const HELPER = require('./helper');

/**
 * STD Output
 * @type {{ARG_DIR_NOT_SPECIFIED: string, FS_DIR_NOT_ACCESSIBLE: string}}
 */
const OUTPUT_MESSAGE = {
  ARG_DIR_NOT_SPECIFIED: `Directory ${chalk.green("--dir")} is required argument.\nPlease look at ${chalk.green("--help")} command to see available options`,
  FS_DIR_NOT_ACCESSIBLE: `Directory is not accessible! Please verify path`,
  ARG_ACTION_NOT_SPECIFIED: `Method ${chalk.green("--method")} is required argument. \nPlease look at ${chalk.green("--help")} command to see available options`,
  ARG_ACTION_NOT_CORRECT: `This method is not correct. Only "add"/"remove" is available.`,
  ARG_KEY_NOT_SPECIFIED: `This method key is not specified.\nLook into any updated file and check your custom method [methodName]("[filename] > [caller] :: START") // methodKey: [methodKey]`
};

//command line arguments
commander
.version('1.0.0')
.option('--dir <path>', 'Directory where logs will be added')
.option('--method <method>', 'Method to be done ("add" for adding methods/logs or "remove" for previously added methods/logs)')
.option('--methodName <method_name>', 'Method name. For example: "console.log", "LogHelper.log", etc')
.option('--methodKey <method_key>', 'Method key. This is required if you want to remove all previously added methods via this component.\n' +
  'To find it, look into any updated file and check your custom method [methodName]("[filename] > [caller] :: START") // methodKey: [methodKey]')
.parse(process.argv);

//checking if directory is provided via arguments
if (!commander.dir) {
  console.log(OUTPUT_MESSAGE.ARG_DIR_NOT_SPECIFIED);
  process.exit(1);
}

//checking if directory is accessible
fs.access(commander.dir, (error) => {
  if (error){
    console.log(OUTPUT_MESSAGE.FS_DIR_NOT_ACCESSIBLE);
    process.exit(1);
  }
});

//checking if action is provided via arguments
if (!commander.method) {
  console.log(OUTPUT_MESSAGE.ARG_ACTION_NOT_SPECIFIED);
  process.exit(1);
}

//checking if action is add or remove
if (commander.method !== 'add' && commander.method !== 'remove'){
  console.log(OUTPUT_MESSAGE.ARG_ACTION_NOT_CORRECT);
  process.exit(1);
}

//if user want to remove message, check for keys
if (commander.method === 'remove' && !commander.methodKey){
  console.log(OUTPUT_MESSAGE.ARG_KEY_NOT_SPECIFIED);
  process.exit(1);
}

//checking the method key from cli arguments, if no - generate one
const methodKey = commander.methodKey || Math.random().toString(36).substring(6).toUpperCase();

const methodName = commander.methodName || 'console.log';

const removeMethodFromFile = async function (dirPath, fileName, key) {
  if (!key){
    return console.log('removeMethodFromFile :: key is not provided');
  }

  const strToSearch = `// methodKey: [${key}]`;

  //checking if filename is given as absolute path
  const file = fs.lstatSync(fileName).isFile() ? fileName : `${dirPath}/${fileName}`;

  //open file for reading
  let fileRead = fs.createReadStream(file);

  //create unique temporary file name and make it as path
  const tmpFileSplitByExt = file.split('.');
  const tmpFileWriteName = `${tmpFileSplitByExt[0]}_${Math.floor(Math.random()*1000000)}.${tmpFileSplitByExt[tmpFileSplitByExt.length -1]}`;

  //create empty temporary file
  fs.openSync(tmpFileWriteName, 'w');

  //open temporary file for wrinting
  let fileWrite = fs.createWriteStream(tmpFileWriteName, { flags: 'r+', defaultEncoding: 'utf8' });

  const rl = readline.createInterface({
    input: fileRead,
  });

  rl.on('line', function (line) {
    //put all lines, expect with key
    if (line.indexOf(strToSearch) === -1) {
      fileWrite.write(line + '\n');
    }
  });

  const testArr = file.split('/');
  const test = testArr[testArr.length - 1];

  fileRead.on('close', function(){
    console.log('read closed', test);

    setTimeout(function(){
      fileWrite.close();

      //remove original file
      fs.unlinkSync(file);

      //rename
      fs.rename(tmpFileWriteName, file, function(err) {
        if ( err ) console.log('ERROR: ' + err);
      });

    }, 2000);

  });
};

/**
 * Adding custom methods/logs to file
 * @param dirPath
 * @param fileName
 */
const addMethodInFile = async function(dirPath, fileName){
  //checking if filename is given as absolute path
  const file = fs.lstatSync(fileName).isFile() ? fileName : `${dirPath}/${fileName}`;

  //we are working only with js files
  if (file.indexOf('.js') > -1) {
    //open file for reading
    let fileRead = fs.createReadStream(file);

    //create unique temporary file name and make it as path
    const tmpFileSplitByExt = file.split('.');
    const tmpFileWriteName = `${tmpFileSplitByExt[0]}_${Math.floor(Math.random()*1000000)}.${tmpFileSplitByExt[tmpFileSplitByExt.length -1]}`;

    //create empty temporary file
    fs.openSync(tmpFileWriteName, 'w');

    //open temporary file for wrinting
    let fileWrite = fs.createWriteStream(tmpFileWriteName, { flags: 'r+', defaultEncoding: 'utf8' });

    const rl = readline.createInterface({
      input: fileRead,
    });

    rl.on('line', function (line) {

      fileWrite.write(line + '\n');

      if(HELPER.isJSFunction(line)){
        const fnName = HELPER.getJSFunctionName(line);
        const fileNameArr = file.split('/');
        const fileName = fileNameArr[fileNameArr.length - 1];
        const whiteSpacesBefore = (function(){
          let str = '';
          for (let i = 0; i< line.length; i++){
            if (line[i] === ' '){
              str += ' ';
            } else {
              return str + '  ';
            }
          }
          return str + '  ';
        })();
        const consoleMessage = `${whiteSpacesBefore}${methodName}('${fileName} > ${fnName} :: START'); // methodKey: [${methodKey}]\n`;
        fileWrite.write(consoleMessage);
      }
    });

    const testArr = file.split('/');
    const test = testArr[testArr.length - 1];

    fileRead.on('close', function(){
      console.log('File proceeded :: ', test);

      setTimeout(function(){
        fileWrite.close();

        //remove original file
        fs.unlinkSync(file);

        //rename
        fs.rename(tmpFileWriteName, file, function(err) {
          if ( err ) console.log('ERROR: ' + err);
        });

      }, 2000);

    });
  }
};

/**
 * Main method for adding methods/logs into given directory files
 */
const methodAdd = function(){
  fs.access(commander.dir, (error) => {
    if (!error){
      console.log('Going to proceed through', chalk.blue(commander.dir), 'directory');

      const files = HELPER.directoryWalk(commander.dir);

      for (let i = 0; i < files.length; i++){
        addMethodInFile(commander.dir, files[i]);
      }
    } else {
      console.log(OUTPUT_MESSAGE.FS_DIR_NOT_ACCESSIBLE);
    }
  });
};

/**
 * Main method for removing methods/logs from given directory
 */
const methodRemove = function(){
  fs.access(commander.dir, (error) => {
    if (!error){
      console.log('Going to proceed through', chalk.blue(commander.dir), 'directory');

      const files = HELPER.directoryWalk(commander.dir);

      for (let i = 0; i < files.length; i++){
        removeMethodFromFile(commander.dir, files[i], commander.methodKey);
      }
    } else {
      console.log(OUTPUT_MESSAGE.FS_DIR_NOT_ACCESSIBLE);
    }
  });
};

switch (commander.method) {
  case 'add':
    methodAdd();
    break;
  case 'remove':
    methodRemove();
    break;
  default:
    console.log('Can not proceed with this method');
    break;
}