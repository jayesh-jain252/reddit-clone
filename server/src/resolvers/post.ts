import { Post } from "../entities/Post";
import { Resolver, Query, Ctx, Arg, Int, Mutation } from "type-graphql";
import { MyContext } from "../types";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { emFork }: MyContext): Promise<Post[]> {
    return emFork.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { emFork }: MyContext
  ): Promise<Post | null> {
    return emFork.findOne(Post, { id });
  }

  @Mutation(() => Post, { nullable: true })
  async createPost(
    @Arg("title") title: string,
    @Ctx() { emFork }: MyContext
  ): Promise<Post | null> {
    const post = emFork.create(Post, { title });
    await emFork.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() { emFork }: MyContext
  ): Promise<Post | null> {
    const post = await emFork.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await emFork.persistAndFlush(post);
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { emFork }: MyContext
  ): Promise<boolean> {
    try {
      await emFork.nativeDelete(Post, { id });
    } catch {
      return false;
    }

    return true;
  }
}
