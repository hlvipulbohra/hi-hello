import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  @Field()
  name: string;

  @Prop({ type: String, required: true, index: true })
  @Field()
  email: string;

  @Prop({ type: String, required: true, select: false })
  @Field()
  password: string;

  @Prop({ type: String, default: '' })
  @Field()
  about: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre('save', async function (next: any) {
  try {
    // check if the user has changed the password
    if (!this.isModified('password')) {
      return next();
    }

    // hash the password and then save in the db
    const saltRounds = 11;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    this.updatedAt = new Date();
    return next();
  } catch (err) {
    return next(err);
  }
});
