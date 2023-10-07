import { globSync } from 'glob';
import * as path from 'path';
import * as _ from 'lodash';
import * as fs from 'fs';
import { GENERAL_CONFIG } from '../configs/general.config';
import {
  _defaultSchemas,
  _defaultSecuritySchemes,
  getControllerDescription,
} from './docs.service';
import { OnModuleInit } from '@nestjs/common';
import {
  ApiActionMethod,
  ApiActionOptions,
  ApiControllerTagOptions,
} from './docs.entity';

export class ApiDocumentModule implements OnModuleInit {
  onModuleInit() {
    if (GENERAL_CONFIG.ENABLE_AUTO_GENERATE_DOCUMENT) {
      ApiDocumentModule.generate();
    }
    ApiDocumentModule.load();
  }

  static load() {
    const sumaryDocs = globSync('src/modules/**/docs/_.doc.ts', {
      ignore: 'node_modules/**',
    })
      .map((file) => {
        return {
          filepath: file,
          content: require(path.join(path.resolve(), file)),
        };
      })
      .filter((doc) => doc && doc.content);

    const detailDocs = globSync('src/modules/**/docs/*.doc.ts', {
      ignore: ['node_modules/**', '**/_.doc.ts'],
    })
      .map((file) => {
        return {
          filepath: file,
          content: require(path.join(path.resolve(), file)),
        };
      })
      .filter((doc) => doc && doc.content);

    const tags = [];
    for (const sumaryDoc of sumaryDocs) {
      tags.push(sumaryDoc.content);
    }
    for (const detailDoc of detailDocs) {
      const moduleName = detailDoc.filepath.split(path.sep).slice(0, -2).pop();
      const existed = tags.some(
        (tag) =>
          moduleName.toLocaleUpperCase() === tag.name.toLocaleUpperCase(),
      );
      if (!existed) {
        tags.push({
          name: moduleName,
        });
      }
    }

    const paths = {};
    for (const detailDoc of detailDocs) {
      const moduleName = detailDoc.filepath.split(path.sep).slice(0, -2).pop();
      const sumaryDoc = sumaryDocs.find(
        (sumaryDoc) =>
          sumaryDoc.filepath.split(path.sep).slice(0, -2).pop() === moduleName,
      );
      const tag = sumaryDoc ? sumaryDoc.content.name : moduleName;
      _.merge(paths, _.omit(detailDoc.content, ['actionName']));
    }

    const document = {
      openapi: '3.0.0',
      info: {
        title: 'API document',
        version: 'v1',
      },
      servers: [
        {
          url: `${GENERAL_CONFIG.APP_URL}/${GENERAL_CONFIG.APP_PREFIX_ENDPOINT}`,
        },
      ],
      tags: tags,
      paths: paths,
      components: {
        schemas: {
          ..._defaultSchemas(),
        },
        securitySchemes: {
          ..._defaultSecuritySchemes(),
        },
      },
      definitions: {
        ..._defaultSchemas(),
      },
    };

    const docFolderPath = path.join(
      path.resolve(),
      GENERAL_CONFIG.DOCS_LOCATION.FOLDER_PATH,
    );
    if (!fs.existsSync(docFolderPath)) {
      fs.mkdirSync(docFolderPath);
    }
    fs.writeFileSync(
      path.join(docFolderPath, 'apidoc.json'),
      JSON.stringify(document),
    );
  }

  static generate() {
    console.log('[API Document] generating from decorators...');
    const ctrlPaths = globSync('src/modules/**/*.controller.ts', {
      ignore: 'node_modules/**',
    });
    for (const ctrlPath of ctrlPaths) {
      const ctrlModule = require(path.join(path.resolve(), ctrlPath));
      const ctrlClasses = Object.keys(ctrlModule)
        .map((ctrlName) => ctrlModule[ctrlName])
        .filter(
          (ctrlClass) =>
            ctrlClass.name.endsWith('Controller') && ctrlClass.CONTROLLER_ID,
        );
      if (ctrlClasses.length > 1) {
        throw new Error(
          `Api docuemt generator do not support mutiple classes controller in one file. File error: ${path.join(
            path.resolve(),
            ctrlPath,
          )}`,
        );
      }
      const ctrlClass = ctrlClasses.at(0);
      const tag: ApiControllerTagOptions = {};
      const paths: Record<string, ApiActionOptions> = {};

      const desccription = getControllerDescription(ctrlClass);
      _.merge(tag, desccription.tag);
      _.merge(paths, desccription.paths);

      const filePath = path.join(
        path.resolve(),
        path.dirname(ctrlPath),
        'docs/_.doc.ts',
      );
      if (
        !GENERAL_CONFIG.ENABLE_OVERWRITE_DOCUMENT_FILE &&
        fs.existsSync(filePath)
      ) {
        break;
      }
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath));
      }
      fs.writeFileSync(
        filePath,
        `
          import { ApiControllerTagOptions } from '../../../common/docs/docs.entity';

          module.exports = ${JSON.stringify(tag)} as ApiControllerTagOptions
        `,
      );

      for (const [pathName, pathObject] of Object.entries(paths)) {
        for (const [methodName, methodObject] of Object.entries(pathObject)) {
          const actionObject: ApiActionOptions = methodObject;
          const filePath = path.join(
            path.resolve(),
            path.dirname(ctrlPath),
            `docs/${actionObject.operationId}.doc.ts`,
          );
          if (
            !GENERAL_CONFIG.ENABLE_OVERWRITE_DOCUMENT_FILE &&
            fs.existsSync(filePath)
          ) {
            break;
          }
          if (!fs.existsSync(path.dirname(filePath))) {
            fs.mkdirSync(path.dirname(filePath));
          }
          fs.writeFileSync(
            filePath,
            `
              import { ApiPathOptions } from '../../../common/docs/docs.entity';
              
              module.exports = ${JSON.stringify({
                [pathName]: {
                  [methodName]: actionObject,
                },
              })} as ApiPathOptions;
            `,
          );
        }
      }
    }
    console.log('[API Document] generate completed!');
  }
}
