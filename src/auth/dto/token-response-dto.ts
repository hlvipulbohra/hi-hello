import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenResponseDTO {
  @Field()
  email: string;

  @Field()
  token: string;
}
