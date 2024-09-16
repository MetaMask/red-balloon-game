// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { DelegationStruct } from "@codefi/delegator-core-viem";

const customJsonb = <TData>(name: string) =>
  customType<{ data: TData; driverData: string }>({
    dataType() {
      return "jsonb";
    },
    fromDriver(value: string): TData {
      return JSON.parse(value, (k, v) => {
        if (k === "salt" && typeof v === "string") {
          try {
            return BigInt(v);
          } catch (e) {
            return v;
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return v;
        }
      }) as TData;
    },
    toDriver(value: TData): string {
      return JSON.stringify(
        value,
        (_, v) => (typeof v === "bigint" ? v.toString() : v) as string,
        2,
      );
    },
  })(name);

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `rb_${name}`);

/**
 * Keeps track of all registered users and their wallet addresses.
 */
export const users = createTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  walletAddress: text("wallet_address").$type<`0x${string}`>(),
});

/**
 * Keeps track of which balloons a user currently holds, i.e., which specific delegations
 * they are holding onto (best offers for each balloon).
 */
export const userBalloons = createTable(
  "user_balloon",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    balloonId: uuid("balloon_id")
      .references(() => balloons.id)
      .notNull(),
    delegationId: uuid("delegation_id")
      .references(() => delegations.id)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.balloonId] }),
    userIdIdx: index("user_balloon_user_id_idx").on(t.userId),
    balloonIdIdx: index("user_balloon_balloon_id_idx").on(t.balloonId),
  }),
);

export const userBalloonsRelations = relations(userBalloons, ({ one }) => ({
  user: one(users, {
    fields: [userBalloons.userId],
    references: [users.id],
  }),
  balloon: one(balloons, {
    fields: [userBalloons.balloonId],
    references: [balloons.id],
  }),
  delegation: one(delegations, {
    fields: [userBalloons.delegationId],
    references: [delegations.id],
  }),
}));

export type WinnerEntry = {
  username: string;
  avatarUrl: string;
  prize: number;
};

/**
 * Keeps track of all balloons in the game, their index (for UI purposes), their initial offer
 * to be printed on the balloon QR code, and the PK to their EOA so we can redelegate to users
 * who scan the balloon QR code.
 */
export const balloons = createTable("balloon", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  index: integer("index").notNull().unique(),
  offerId: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  pk: text("pk").$type<`0x${string}`>().notNull(),
  winningChain: customJsonb<WinnerEntry[]>("winning_chain"),
});

/**
 * Keeps track of all delegations that have been created.
 */
export const delegations = createTable(
  "delegation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    delegation: customJsonb<DelegationStruct>("delegation").notNull(),
    authority: text("authority").notNull().$type<`0x${string}`>(),
    hash: text("hash").notNull().unique().$type<`0x${string}`>(),
    commission: real("commission").notNull(),
    totalCommission: real("total_commission").notNull(),
    hops: integer("hops").notNull(),
    balloonId: uuid("balloon_id")
      .references(() => balloons.id)
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    offerId: uuid("offer_id")
      .references(() => offers.id)
      .notNull(),
  },
  (t) => ({
    hashIndex: index("delegation_hash_idx").on(t.hash),
    offerIdIndex: index("offer_id_idx").on(t.offerId),
  }),
);

export const delegationRelations = relations(delegations, ({ one }) => ({
  user: one(users, {
    fields: [delegations.userId],
    references: [users.id],
  }),
  offer: one(offers, {
    fields: [delegations.offerId],
    references: [offers.id],
  }),
  balloon: one(balloons, {
    fields: [delegations.balloonId],
    references: [balloons.id],
  }),
}));

/**
 * Keeps track of all offers created in the game. An offer may contain 1 or multiple
 * delegations assiciated with it.
 */
export const offers = createTable("offer", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  isValid: boolean("is_valid").notNull().default(true),
});

/**
 * Keeps track of every delegation transaction made during the game, i.e.,
 * every  time a user scans a QR code we'll register here what delegations they
 * received and whether they were accepted or not.
 * This will be used for analytical purposes.
 */
export const transactions = createTable("transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id)
    .notNull(),
  recipientId: uuid("recipient_id")
    .references(() => users.id)
    .notNull(),
  offerId: uuid("offer_id")
    .references(() => offers.id)
    .notNull(),
  delegationId: uuid("delegation_id")
    .references(() => delegations.id)
    .notNull(),
  accepted: boolean("accepted").notNull(),
});

export const transactionRelations = relations(transactions, ({ one }) => ({
  delegation: one(delegations, {
    fields: [transactions.delegationId],
    references: [delegations.id],
  }),
}));

export const winners = createTable("winner", {
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  prize: real("prize").notNull(),
  winner: boolean("winner").notNull().default(false),
  receiptHash: text("receipt_hash").$type<`0x${string}`>(),
});

export const winnersRelations = relations(winners, ({ one }) => ({
  user: one(users, {
    fields: [winners.userId],
    references: [users.id],
  }),
}));
