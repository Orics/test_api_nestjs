
              import { ApiPathOptions } from '../../../common/docs/docs.entity';
              
              module.exports = {"/tests/":{"post":{"tags":["Test"],"description":"action desccription","operationId":"create","summary":"create","security":[{"BearerAuth":[]}],"parameters":[],"requestBody":{"content":{"application/json":{"schema":{"properties":{"name":{"minLength":1,"maxLength":255,"type":"string"},"description":{"minLength":1,"maxLength":255,"type":"string"}},"type":"object","required":["name"]}}}}}}} as ApiPathOptions;
            