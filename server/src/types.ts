import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type MyContext = {
  emFork: EntityManager<IDatabaseDriver<Connection>>;
};
