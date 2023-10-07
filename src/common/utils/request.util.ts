import {
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import 'reflect-metadata';
import { FILTER_OPERATOR_ARRAY, FILTER_TYPE_MAP } from './constant.util';
import { Type } from 'class-transformer';

export class FilterItem<T = any> {
  @IsString()
  property: keyof T = undefined;

  @IsIn(FILTER_OPERATOR_ARRAY)
  operator: (typeof FILTER_OPERATOR_ARRAY)[number] = undefined;

  @IsOptional()
  value?: any = undefined;
}

export class Filter<T = any> {
  @IsEnum(FILTER_TYPE_MAP)
  type: 'AND' | 'OR' = undefined;

  @ValidateNested({ each: true })
  @Type(() => FilterItem)
  filters: FilterItem[] = undefined;
}

export class MixedFilter<T = any> {
  @IsEnum(FILTER_TYPE_MAP)
  type: 'AND' | 'OR' = undefined;

  @ValidateNested({
    each: true,
  })
  filters: (FilterItem<T> | Filter<T>)[] = undefined;
}

export class GetQuery<T = any> {
  @IsOptional()
  @ValidateNested()
  @Type(() => Filter)
  filter?: Filter<T> = undefined;

  @IsOptional()
  @IsString({ each: true })
  sorts?: string[] = undefined;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = undefined;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = undefined;
}

export class GetMixedQuery<T = any> {
  @IsOptional()
  filter?: MixedFilter<T> = undefined;

  @IsOptional()
  sorts?: string[] = undefined;

  @IsOptional()
  limit?: number = undefined;

  @IsOptional()
  page?: number = undefined;

  @IsString()
  search?: string = undefined;
}
