import { Converter } from './converter.util';

export class ResponseOne<T = any> {
  result = 'success';
  data?: Partial<T>;
  status: number;
  constructor(data?: T, entityClass?: new () => Partial<T>, status = 200) {
    this.status = status;
    this.result = 'success';
    if (entityClass) {
      this.data = Converter.fit<T>(data, entityClass);
    } else {
      this.data = data;
    }
  }
}

export class ResponseList<T = any> {
  result = 'success';
  data?: Partial<T>[];
  status: number;
  constructor(datas?: T[], entityClass?: new () => Partial<T>, status = 200) {
    this.status = status;
    this.result = 'success';
    if (entityClass) {
      this.data = datas.map((record) => Converter.fit<T>(record, entityClass));
    } else {
      this.data = datas;
    }
  }
}

export class ResponseListWithPagination<T = any> {
  result: 'success';
  data: {
    records: Partial<T>[];
    pagination: any;
  };
  status: number;

  constructor(
    data: {
      records: Partial<T>[];
      pagination: any;
    },
    entityClass?: new () => Partial<T>,
    status = 200,
  ) {
    this.status = status;
    this.result = 'success';
    if (entityClass) {
      this.data = {
        records: data.records.map((record) =>
          Converter.fit<Partial<T>>(record, entityClass),
        ),
        pagination: data.pagination,
      };
    } else {
      this.data = data;
    }
  }
}

export class ResponseEmpty {
  result = 'success';
  status: number;
  constructor() {
    this.status = 204;
    this.result = 'success';
  }
}

export type Pagination = {
  prevPage?: number;
  currentPage: number;
  nextPage?: number;
  pages: number[];
  totalPage: number;
  limit: number;
};
