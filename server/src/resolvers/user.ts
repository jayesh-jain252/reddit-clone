import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Resolver,
  Mutation,
  Arg,
  Field,
  InputType,
  Ctx,
  ObjectType,
} from "type-graphql";
const bcrypt = require("bcryptjs");

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { emFork }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2 ",
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 3",
          },
        ],
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(options.password, salt);
    const user = emFork.create(User, {
      username: options.username,
      password: hashedPassword,
    });
    try {
      await emFork.persistAndFlush(user);
    } catch (err) {
      //   duplicate username error
      if (err.code === "23505") {
        //|| err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "user already exists",
            },
          ],
        };
      }
      console.log("message: ", err.message);
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { emFork }: MyContext
  ): Promise<UserResponse> {
    const user = await emFork.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username does not exists",
          },
        ],
      };
    }
    const valid = await bcrypt.compare(options.password, user.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect username or password",
          },
        ],
      };
    }
    return { user };
  }
}
