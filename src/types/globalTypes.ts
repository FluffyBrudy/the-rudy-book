import { Selectable } from "kysely";

export type ExpressUser = { id: string; username: string };
export type TableFieldSelection<T> = Partial<
  Record<keyof Selectable<T>, boolean>
>;
