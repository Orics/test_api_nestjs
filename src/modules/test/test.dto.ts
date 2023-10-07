import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { Test } from './test.pg.entity';

// ========= Create ========= //
export class TestCreateRequestProps implements Partial<Test> {
  @IsNotEmpty()
  @Length(1, 255)
  name?: string = undefined;

  @IsOptional()
  @Length(1, 255)
  description?: string = undefined;
}
export class TestCreateResponseProps implements Partial<Test> {
  id?: string = undefined;

  name?: string = undefined;

  description: string = undefined;
}
// ========= GetById ========= //
export class TestGetByIdResponseProps implements Partial<Test> {
  id: string = undefined;

  name?: string = undefined;

  description?: string = undefined;

  createdAt?: Date = undefined;

  createdBy?: string = undefined;

  updatedAt?: Date = undefined;

  updatedBy?: string = undefined;
}

// ========= GetList ========= //
export class TestGetListRequestProps implements Partial<Test> {
  name?: string = undefined;

  description?: string = undefined;

  createdAt?: Date = undefined;
}
export class TestGetListResponseProps implements Partial<Test> {
  id: string = undefined;

  name?: string = undefined;

  description?: string = undefined;

  createdAt?: Date = undefined;
}

// ========= Updtate ========= //
export class TestUpdateRequestProps implements Partial<Test> {
  @IsNotEmpty()
  @Length(1, 255)
  name?: string = undefined;

  @IsOptional()
  @Length(1, 255)
  description?: string = undefined;
}
export class TestUpdateResponseProps implements Partial<Test> {
  id?: string = undefined;

  name?: string = undefined;

  description?: string = undefined;

  email: string = undefined;
}

// ========= Delete ========= //
export class TestDeleteRequestProps {
  @IsString({
    each: true,
  })
  ids: string[] = undefined;
}

export class TestDeleteResponseProps implements Partial<Test> {
  id?: string = undefined;

  deleted?: boolean = undefined;

  deletedBy?: string = undefined;
}
