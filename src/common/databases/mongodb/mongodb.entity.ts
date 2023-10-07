/* eslint-disable @typescript-eslint/no-unused-vars */
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class MongoBaseEntity {
  @Prop({ type: mongoose.Schema.Types.Date, default: new Date() })
  public createdAt!: Date;

  @Prop({ type: mongoose.Schema.Types.Date, default: new Date() })
  public updatedAt!: Date;

  @Prop({ type: mongoose.Schema.Types.Date })
  public deletedAt!: Date;

  @Prop({ type: mongoose.Schema.ObjectId })
  public cupdatedBy!: string;

  @Prop({ type: mongoose.Schema.ObjectId })
  public createdBy!: string;

  @Prop({ type: mongoose.Schema.ObjectId })
  public deletedBy!: string;
}
