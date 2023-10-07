import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import 'reflect-metadata';
import * as _ from 'lodash';
import { TestService } from './test.pg.service';
import {
  TestCreateRequestProps,
  TestCreateResponseProps,
  TestGetByIdResponseProps,
  TestGetListRequestProps,
  TestGetListResponseProps,
  TestUpdateRequestProps,
  TestUpdateResponseProps,
  TestDeleteRequestProps,
  TestDeleteResponseProps,
} from './test.dto';
import { Filter, GetQuery } from '../../common/utils/request.util';
import {
  ResponseEmpty,
  ResponseOne,
  ResponseListWithPagination,
  ResponseList,
} from '../../common/utils/response.util';
import {
  InternalServerErrorResponse,
  NotFoundErrorResponse,
  InvalidErrorResponse,
} from '../../common/utils/errors.util';
import {
  Identity,
  UseAuthPermissions,
} from '../../common/guards/guard.decorator';
import { AuthIdentity } from '../auth/auth.dto';
import { Test } from '../test/test.pg.entity';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  @UseAuthPermissions([['TEST', 'CREATE']])
  async create(
    @Body() data: TestCreateRequestProps,
    @Identity() identity: AuthIdentity,
  ) {
    const errors = await this.testService.checkUniqueConstraint(data);
    if (errors && errors.length > 0) {
      throw new InvalidErrorResponse(errors);
    }
    const test = await this.testService
      .create({
        ...data,
        createdBy: identity?.id,
      })
      .catch((err) => {
        throw new InternalServerErrorResponse('Error create test', err);
      });
    return new ResponseOne(test, TestCreateResponseProps, 201);
  }

  @Get()
  @UseAuthPermissions([['TEST', 'GET_LIST']])
  async getList(
    @Query() query: GetQuery<TestGetListRequestProps>,
    @Identity() identity: AuthIdentity,
  ) {
    const filter: Filter<Test> = {
      type: 'AND',
      filters: [
        {
          property: 'createdBy',
          operator: 'eq',
          value: identity.id,
        },
      ],
    };
    const result = await this.testService
      .getList(query, { filter })
      .catch((err) => {
        throw new InternalServerErrorResponse('Error get list tests', err);
      });
    return new ResponseListWithPagination(result, TestGetListResponseProps, 200);
  }

  @Get('/:id')
  @UseAuthPermissions([['TEST', 'GET_DETAIL']])
  async getOne(@Param('id') id: string, @Identity() identity: AuthIdentity) {
    const test = await this.testService
      .getOne(id, { relations: true })
      .catch((err) => {
        throw new InternalServerErrorResponse('Error get test', err);
      });
    if (test) {
      return new ResponseOne(test, TestGetByIdResponseProps, 200);
    } else {
      return new ResponseEmpty();
    }
  }

  @Put('/:id')
  @UseAuthPermissions([['TEST', 'UPDATE']])
  async update(
    @Param('id') id: string,
    @Body() data: TestUpdateRequestProps,
    @Identity() identity: AuthIdentity,
  ) {
    const existed = await this.testService.checkExistById(id).catch((err) => {
      throw new InternalServerErrorResponse('Error check test id', err);
    });
    if (!existed) {
      throw new NotFoundErrorResponse('test');
    }
    const errors = await this.testService.checkUniqueConstraint(data, id);
    if (errors && errors.length > 0) {
      throw new InvalidErrorResponse(errors);
    }
    const result = await this.testService
      .updateById(id, { ...data, updatedBy: identity?.id })
      .catch((err) => {
        throw new InternalServerErrorResponse('Error update test', err);
      });
    return new ResponseOne(result, TestUpdateResponseProps, 200);
  }

  @Delete('/:id')
  @UseAuthPermissions([['TEST', 'DELETE']])
  async deleteOne(@Param('id') id: string, @Identity() identity: AuthIdentity) {
    const existed = await this.testService.checkExistById(id).catch((err) => {
      throw new InternalServerErrorResponse('Error check test id', err);
    });
    if (!existed) {
      throw new NotFoundErrorResponse('test');
    }
    const result = await this.testService.updateById(id, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: identity?.id,
    });
    return new ResponseOne(result, TestDeleteResponseProps, 200);
  }

  @Delete()
  @UseAuthPermissions([['TEST', 'DELETE']])
  async deleteList(
    @Body() data: TestDeleteRequestProps,
    @Identity() identity: AuthIdentity,
  ) {
    const { ids } = data;
    const result = await this.testService.updateList(ids, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: identity?.id,
    });
    return new ResponseList(result, TestDeleteResponseProps, 200);
  }
}
