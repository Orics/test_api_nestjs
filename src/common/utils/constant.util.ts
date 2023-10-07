import {
  Between,
  Equal,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

export const FILTER_TYPE_MAP = {
  AND: 'AND',
  OR: 'OR',
};

export const SORT_ORDER_MAP = {
  ASC: 'ASC',
  DESC: 'DESC',
  asc: 'asc',
  desc: 'desc',
};

export const FILTER_OPERATOR_ARRAY = [
  'eq',
  'lt',
  'lte',
  'gt',
  'gte',
  'ne',
  'in',
  'like',
  'between',
];

export const POSTGRES_WHERE_OPERATOR_MAP = {
  eq: Equal,
  lt: LessThan,
  lte: LessThanOrEqual,
  gt: MoreThan,
  gte: MoreThanOrEqual,
  ne: Not,
  in: In,
  like: Like,
  between: Between,
};

export const PERMISSION_TARGET_MAP = {
  ROLE: 1,
  ACCOUNT: 2,
  TEST: 4,
};

export const PERMISSION_ACTION_MAP = {
  GET_LIST: 1,
  GET_DETAIL: 2,
  CREATE: 4,
  UPDATE: 8,
  DELETE: 16,
  MANAGE: 32,
};

export const CONTROLLER_ACTION_TYPE_MAP = {
  create: 'create',
  getList: 'getList',
  getOne: 'getOne',
  update: 'update',
  deleteOne: 'deleteOne',
  deleteList: 'deleteList',
};

export const GUARD_PERMISSIONS_DECORATOR_KEY = '_GUARD:PERMISSIONS';

export const DEFINE_TYPE_ENTITY_DECORATOR_KEY = '_DEFINE_TYPE:ENTITY';

export const DEFINE_TYPE_IS_ARRAY_DECORATOR_KEY = '_DEFINE_TYPE:IS_ARRAY';
