
              import { ApiPathOptions } from '../../../common/docs/docs.entity';
              
              module.exports = {"/auth/register":{"post":{"tags":["Auth"],"description":"action desccription","operationId":"register","summary":"register","parameters":[],"requestBody":{"content":{"application/json":{"schema":{"properties":{"email":{"minLength":1,"maxLength":255,"type":"string","format":"email"},"password":{"minLength":6,"maxLength":20,"type":"string"},"roleId":{"format":"uuid","type":"string"}},"type":"object","required":["email","password","roleId"]}}}}}}} as ApiPathOptions;
            