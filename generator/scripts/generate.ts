import * as changeCase from 'change-case';
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { config } from '../configs/configs';
import * as constant from '../../src/common/utils/constant.util';

const run = async () => {
  const name = await prompt("Enter the name. Ex: 'my-name': ");
  if (!name) {
    throw new Error("Missing parameter 'name'");
  }
  const names = await prompt("Enter the name in plural form. Ex: 'my-names': ");
  if (!names) {
    throw new Error("Missing parameter 'names'");
  }

  const NAME = {
    CLASS: changeCase.pascalCase(name), // MyMame
    VARIABLE: changeCase.camelCase(name), // myName
    SENTENCE: changeCase.sentenceCase(name), // My name
    WORD: changeCase.noCase(name), // my names
    CONSTANT: changeCase.constantCase(name), // MY_NAME
    CODE: changeCase.snakeCase(name), // my_name
    FILE: changeCase.paramCase(name), // my-name
  };

  const NAMES = {
    CLASS: changeCase.pascalCase(names), // MyMames
    VARIABLE: changeCase.camelCase(names), // myNames
    SENTENCE: changeCase.sentenceCase(names), // My names
    WORD: changeCase.noCase(names), // my names
    CONSTANT: changeCase.constantCase(names), // MY_NAMES
    CODE: changeCase.snakeCase(names), // my_names
    FILE: changeCase.paramCase(names), // my-names
  };

  console.info('What kind of database are you using ?');
  const choose = await promptOptions(['Postgres DB', 'Mongo DB']);
  let database: 'postgresdb' | 'mongodb' = 'postgresdb';
  if (choose == '0') {
    database = 'postgresdb';
  }
  if (choose == '1') {
    database = 'mongodb';
  }

  const templateFiles = fs.readdirSync(
    path.join(path.resolve(), '/generator/templates/', database),
  );

  if (!templateFiles || templateFiles.length == 0) {
    throw new Error(
      'Not found template files. Path: ' +
        path.join(path.resolve(), '/generator/templates/postgresdb'),
    );
  }

  for (const templateFile of templateFiles) {
    // read template file
    let templateText = fs.readFileSync(
      path.join(
        path.resolve(),
        '/generator/templates/postgresdb/' + templateFile,
      ),
      {
        encoding: 'utf8',
        flag: 'r',
      },
    );

    // replace text
    templateText = templateText.replace(/{{NAME.CLASS}}/g, NAME.CLASS);
    templateText = templateText.replace(/{{NAME.VARIABLE}}/g, NAME.VARIABLE);
    templateText = templateText.replace(/{{NAME.SENTENCE}}/g, NAME.SENTENCE);
    templateText = templateText.replace(/{{NAME.WORD}}/g, NAME.WORD);
    templateText = templateText.replace(/{{NAME.CONSTANT}}/g, NAME.CONSTANT);
    templateText = templateText.replace(/{{NAME.CODE}}/g, NAME.CODE);
    templateText = templateText.replace(/{{NAME.FILE}}/g, NAME.FILE);
    templateText = templateText.replace(/{{NAMES.CLASS}}/g, NAMES.CLASS);
    templateText = templateText.replace(/{{NAMES.VARIABLE}}/g, NAMES.VARIABLE);
    templateText = templateText.replace(/{{NAMES.SENTENCE}}/g, NAMES.SENTENCE);
    templateText = templateText.replace(/{{NAMES.WORD}}/g, NAMES.WORD);
    templateText = templateText.replace(/{{NAMES.CONSTANT}}/g, NAMES.CONSTANT);
    templateText = templateText.replace(/{{NAMES.CODE}}/g, NAMES.CODE);
    templateText = templateText.replace(/{{NAMES.FILE}}/g, NAMES.FILE);

    // save file
    const filepath = path.join(
      path.resolve(),
      config.paths.modules,
      NAME.FILE,
      `${NAME.FILE}.${path.parse(templateFile).name}.ts`,
    );

    if (fs.existsSync(filepath)) {
      console.info(filepath);
      await promptYesNo(
        'This file already existed. Do you want to overwrite that file ?',
      );
    }

    // create folder if not exist
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath));
    }
    fs.writeFileSync(filepath, templateText, {
      encoding: 'utf8',
      flag: 'w',
    });

    console.info('Created file: ', filepath);
  }

  addPermissionTaget(NAME.CONSTANT);

  addModuleToAppModule(`${NAME.CLASS}Module`, NAME.FILE);

  console.info('Generate completed !');
};

run().catch((err) => {
  err && console.error(err);
});

function prompt(question?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  question = question || 'Continute (Y/n) ? ';
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
      process.stdout.write('\x1B[1A\x1B[K');
      rl.close();
    });
  });
}

function promptOptions(options: string[]): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  for (const [i, option] of Object.entries(options)) {
    console.info(`[${i}]: ${option}`);
  }

  return new Promise((resolve, reject) => {
    rl.question('Enter your choose: > ', (answer) => {
      const choice = parseInt(answer.trim(), 10);
      if (isNaN(choice) || choice < 0 || choice >= options.length) {
        console.error('Please try again.');
        rl.close();
        promptOptions(options);
      } else {
        resolve(choice.toString());
        rl.close();
      }
    });
  });
}

function promptYesNo(question?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  question = question || 'Continute ? ';
  return new Promise((resolve, reject) => {
    rl.question(question + ' (Y/n) : ', (answer) => {
      answer = answer.trim().toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        resolve(answer.trim().toLowerCase());
      } else {
        reject();
      }
      process.stdout.write('\x1B[1A\x1B[K'); // Xóa dòng dự prompt trước đó
      rl.close();
    });
  });
}

function addPermissionTaget(targetKey: string) {
  const filepath = path.join(
    path.resolve(),
    '/src/common/utils/constant.util.ts',
  );

  if (!constant.PERMISSION_TARGET_MAP.hasOwnProperty(targetKey)) {
    const maxExistingValue = Math.max(
      ...Object.values(constant.PERMISSION_TARGET_MAP),
    );

    constant.PERMISSION_TARGET_MAP[targetKey] = maxExistingValue * 2;

    let updatedData = '';
    for (const key of Object.keys(constant)) {
      updatedData += `export const ${key} = ${JSON.stringify(
        constant[key],
        null,
        2,
      )};\n\n`;
    }

    fs.writeFileSync(filepath, updatedData, {
      encoding: 'utf8',
      flag: 'w',
    });

    formatFile(filepath);
  } else {
    console.warn(`${targetKey} already exists in PERMISSION_TARGET_MAP`);
  }
}

function addModuleToAppModule(className: string, fileName: string) {
  const filepath = path.join(path.resolve(), '/src/app.module.ts');

  let content = fs.readFileSync(filepath, {
    encoding: 'utf8',
    flag: 'r',
  });

  if (!content.includes(className)) {
    content = content.replace(
      `\n@Module({`,
      `import { ${className} } from './modules/${fileName}/${fileName}.module';\n\n@Module({`,
    );

    content = content.replace(
      `// custom modules`,
      `// custom modules\n${className},`,
    );

    fs.writeFileSync(filepath, content, {
      encoding: 'utf8',
      flag: 'w',
    });

    formatFile(filepath);
  } else {
    console.warn(`${className} already exists in AppModule.ts`);
  }
}

function formatFile(path: string) {
  console.info('Formating ... ', path);
  execSync(`eslint --fix "${path}"`, { stdio: 'inherit' });
}
