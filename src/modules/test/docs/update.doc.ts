
              import { ApiPathOptions } from '../../../common/docs/docs.entity';
              
              module.exports = {"/tests/:id":{"delete":{"tags":["Test"],"description":"action desccription","operationId":"update","summary":"update","security":[{"BearerAuth":[]}],"parameters":[{"in":"path","name":"id","description":"paramester description","required":false,"schema":{"type":"string"}}],"requestBody":{"content":{"application/json":{"schema":{"properties":{"name":{"minLength":1,"maxLength":255,"type":"string"},"description":{"minLength":1,"maxLength":255,"type":"string"}},"type":"object","required":["name"]}}}}}}} as ApiPathOptions;
            