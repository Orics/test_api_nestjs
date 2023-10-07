import * as mongoose from 'mongoose';

export const mongoDBProviders = [
  {
    provide: 'MONGO_PROVIDER',
    useFactory: async () => {
      const connection = await mongoose
        .connect(
          'mongodb+srv://nguyenngockhai25:1011f337@cluster0.wti07js.mongodb.net/?retryWrites=true&w=majority',
        )
        .then((connection) => {
          console.log('[Mongodb] connect success');
          return connection;
        })
        .catch((err) => {
          console.error('[Mongodb] connect failed', err.message);
        });
      return connection;
    },
  },
];
