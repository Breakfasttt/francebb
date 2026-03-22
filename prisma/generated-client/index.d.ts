
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model VerificationToken
 * 
 */
export type VerificationToken = $Result.DefaultSelection<Prisma.$VerificationTokenPayload>
/**
 * Model Tournament
 * 
 */
export type Tournament = $Result.DefaultSelection<Prisma.$TournamentPayload>
/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Forum
 * 
 */
export type Forum = $Result.DefaultSelection<Prisma.$ForumPayload>
/**
 * Model Topic
 * 
 */
export type Topic = $Result.DefaultSelection<Prisma.$TopicPayload>
/**
 * Model Post
 * 
 */
export type Post = $Result.DefaultSelection<Prisma.$PostPayload>
/**
 * Model Pm
 * 
 */
export type Pm = $Result.DefaultSelection<Prisma.$PmPayload>
/**
 * Model TopicView
 * 
 */
export type TopicView = $Result.DefaultSelection<Prisma.$TopicViewPayload>
/**
 * Model Mention
 * 
 */
export type Mention = $Result.DefaultSelection<Prisma.$MentionPayload>
/**
 * Model PostReaction
 * 
 */
export type PostReaction = $Result.DefaultSelection<Prisma.$PostReactionPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Accounts
 * const accounts = await prisma.account.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Accounts
   * const accounts = await prisma.account.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.verificationToken`: Exposes CRUD operations for the **VerificationToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VerificationTokens
    * const verificationTokens = await prisma.verificationToken.findMany()
    * ```
    */
  get verificationToken(): Prisma.VerificationTokenDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tournament`: Exposes CRUD operations for the **Tournament** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tournaments
    * const tournaments = await prisma.tournament.findMany()
    * ```
    */
  get tournament(): Prisma.TournamentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.forum`: Exposes CRUD operations for the **Forum** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Forums
    * const forums = await prisma.forum.findMany()
    * ```
    */
  get forum(): Prisma.ForumDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.topic`: Exposes CRUD operations for the **Topic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Topics
    * const topics = await prisma.topic.findMany()
    * ```
    */
  get topic(): Prisma.TopicDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.post`: Exposes CRUD operations for the **Post** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Posts
    * const posts = await prisma.post.findMany()
    * ```
    */
  get post(): Prisma.PostDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pm`: Exposes CRUD operations for the **Pm** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pms
    * const pms = await prisma.pm.findMany()
    * ```
    */
  get pm(): Prisma.PmDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.topicView`: Exposes CRUD operations for the **TopicView** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TopicViews
    * const topicViews = await prisma.topicView.findMany()
    * ```
    */
  get topicView(): Prisma.TopicViewDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mention`: Exposes CRUD operations for the **Mention** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Mentions
    * const mentions = await prisma.mention.findMany()
    * ```
    */
  get mention(): Prisma.MentionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.postReaction`: Exposes CRUD operations for the **PostReaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PostReactions
    * const postReactions = await prisma.postReaction.findMany()
    * ```
    */
  get postReaction(): Prisma.PostReactionDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.5.0
   * Query Engine version: 280c870be64f457428992c43c1f6d557fab6e29e
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Account: 'Account',
    Session: 'Session',
    User: 'User',
    VerificationToken: 'VerificationToken',
    Tournament: 'Tournament',
    Category: 'Category',
    Forum: 'Forum',
    Topic: 'Topic',
    Post: 'Post',
    Pm: 'Pm',
    TopicView: 'TopicView',
    Mention: 'Mention',
    PostReaction: 'PostReaction'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "account" | "session" | "user" | "verificationToken" | "tournament" | "category" | "forum" | "topic" | "post" | "pm" | "topicView" | "mention" | "postReaction"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      VerificationToken: {
        payload: Prisma.$VerificationTokenPayload<ExtArgs>
        fields: Prisma.VerificationTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VerificationTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VerificationTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findFirst: {
            args: Prisma.VerificationTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VerificationTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          findMany: {
            args: Prisma.VerificationTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          create: {
            args: Prisma.VerificationTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          createMany: {
            args: Prisma.VerificationTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VerificationTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          delete: {
            args: Prisma.VerificationTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          update: {
            args: Prisma.VerificationTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          deleteMany: {
            args: Prisma.VerificationTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VerificationTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VerificationTokenUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>[]
          }
          upsert: {
            args: Prisma.VerificationTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VerificationTokenPayload>
          }
          aggregate: {
            args: Prisma.VerificationTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVerificationToken>
          }
          groupBy: {
            args: Prisma.VerificationTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.VerificationTokenCountArgs<ExtArgs>
            result: $Utils.Optional<VerificationTokenCountAggregateOutputType> | number
          }
        }
      }
      Tournament: {
        payload: Prisma.$TournamentPayload<ExtArgs>
        fields: Prisma.TournamentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TournamentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TournamentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>
          }
          findFirst: {
            args: Prisma.TournamentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TournamentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>
          }
          findMany: {
            args: Prisma.TournamentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>[]
          }
          create: {
            args: Prisma.TournamentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>
          }
          createMany: {
            args: Prisma.TournamentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TournamentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>[]
          }
          delete: {
            args: Prisma.TournamentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>
          }
          update: {
            args: Prisma.TournamentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>
          }
          deleteMany: {
            args: Prisma.TournamentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TournamentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TournamentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>[]
          }
          upsert: {
            args: Prisma.TournamentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TournamentPayload>
          }
          aggregate: {
            args: Prisma.TournamentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTournament>
          }
          groupBy: {
            args: Prisma.TournamentGroupByArgs<ExtArgs>
            result: $Utils.Optional<TournamentGroupByOutputType>[]
          }
          count: {
            args: Prisma.TournamentCountArgs<ExtArgs>
            result: $Utils.Optional<TournamentCountAggregateOutputType> | number
          }
        }
      }
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      Forum: {
        payload: Prisma.$ForumPayload<ExtArgs>
        fields: Prisma.ForumFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ForumFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ForumFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>
          }
          findFirst: {
            args: Prisma.ForumFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ForumFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>
          }
          findMany: {
            args: Prisma.ForumFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>[]
          }
          create: {
            args: Prisma.ForumCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>
          }
          createMany: {
            args: Prisma.ForumCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ForumCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>[]
          }
          delete: {
            args: Prisma.ForumDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>
          }
          update: {
            args: Prisma.ForumUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>
          }
          deleteMany: {
            args: Prisma.ForumDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ForumUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ForumUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>[]
          }
          upsert: {
            args: Prisma.ForumUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ForumPayload>
          }
          aggregate: {
            args: Prisma.ForumAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateForum>
          }
          groupBy: {
            args: Prisma.ForumGroupByArgs<ExtArgs>
            result: $Utils.Optional<ForumGroupByOutputType>[]
          }
          count: {
            args: Prisma.ForumCountArgs<ExtArgs>
            result: $Utils.Optional<ForumCountAggregateOutputType> | number
          }
        }
      }
      Topic: {
        payload: Prisma.$TopicPayload<ExtArgs>
        fields: Prisma.TopicFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TopicFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TopicFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>
          }
          findFirst: {
            args: Prisma.TopicFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TopicFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>
          }
          findMany: {
            args: Prisma.TopicFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>[]
          }
          create: {
            args: Prisma.TopicCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>
          }
          createMany: {
            args: Prisma.TopicCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TopicCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>[]
          }
          delete: {
            args: Prisma.TopicDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>
          }
          update: {
            args: Prisma.TopicUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>
          }
          deleteMany: {
            args: Prisma.TopicDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TopicUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TopicUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>[]
          }
          upsert: {
            args: Prisma.TopicUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicPayload>
          }
          aggregate: {
            args: Prisma.TopicAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTopic>
          }
          groupBy: {
            args: Prisma.TopicGroupByArgs<ExtArgs>
            result: $Utils.Optional<TopicGroupByOutputType>[]
          }
          count: {
            args: Prisma.TopicCountArgs<ExtArgs>
            result: $Utils.Optional<TopicCountAggregateOutputType> | number
          }
        }
      }
      Post: {
        payload: Prisma.$PostPayload<ExtArgs>
        fields: Prisma.PostFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findFirst: {
            args: Prisma.PostFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          findMany: {
            args: Prisma.PostFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          create: {
            args: Prisma.PostCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          createMany: {
            args: Prisma.PostCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PostCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          delete: {
            args: Prisma.PostDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          update: {
            args: Prisma.PostUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          deleteMany: {
            args: Prisma.PostDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PostUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>[]
          }
          upsert: {
            args: Prisma.PostUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostPayload>
          }
          aggregate: {
            args: Prisma.PostAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePost>
          }
          groupBy: {
            args: Prisma.PostGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostCountArgs<ExtArgs>
            result: $Utils.Optional<PostCountAggregateOutputType> | number
          }
        }
      }
      Pm: {
        payload: Prisma.$PmPayload<ExtArgs>
        fields: Prisma.PmFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PmFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PmFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>
          }
          findFirst: {
            args: Prisma.PmFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PmFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>
          }
          findMany: {
            args: Prisma.PmFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>[]
          }
          create: {
            args: Prisma.PmCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>
          }
          createMany: {
            args: Prisma.PmCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PmCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>[]
          }
          delete: {
            args: Prisma.PmDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>
          }
          update: {
            args: Prisma.PmUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>
          }
          deleteMany: {
            args: Prisma.PmDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PmUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PmUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>[]
          }
          upsert: {
            args: Prisma.PmUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PmPayload>
          }
          aggregate: {
            args: Prisma.PmAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePm>
          }
          groupBy: {
            args: Prisma.PmGroupByArgs<ExtArgs>
            result: $Utils.Optional<PmGroupByOutputType>[]
          }
          count: {
            args: Prisma.PmCountArgs<ExtArgs>
            result: $Utils.Optional<PmCountAggregateOutputType> | number
          }
        }
      }
      TopicView: {
        payload: Prisma.$TopicViewPayload<ExtArgs>
        fields: Prisma.TopicViewFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TopicViewFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TopicViewFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>
          }
          findFirst: {
            args: Prisma.TopicViewFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TopicViewFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>
          }
          findMany: {
            args: Prisma.TopicViewFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>[]
          }
          create: {
            args: Prisma.TopicViewCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>
          }
          createMany: {
            args: Prisma.TopicViewCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TopicViewCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>[]
          }
          delete: {
            args: Prisma.TopicViewDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>
          }
          update: {
            args: Prisma.TopicViewUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>
          }
          deleteMany: {
            args: Prisma.TopicViewDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TopicViewUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TopicViewUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>[]
          }
          upsert: {
            args: Prisma.TopicViewUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TopicViewPayload>
          }
          aggregate: {
            args: Prisma.TopicViewAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTopicView>
          }
          groupBy: {
            args: Prisma.TopicViewGroupByArgs<ExtArgs>
            result: $Utils.Optional<TopicViewGroupByOutputType>[]
          }
          count: {
            args: Prisma.TopicViewCountArgs<ExtArgs>
            result: $Utils.Optional<TopicViewCountAggregateOutputType> | number
          }
        }
      }
      Mention: {
        payload: Prisma.$MentionPayload<ExtArgs>
        fields: Prisma.MentionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MentionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MentionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>
          }
          findFirst: {
            args: Prisma.MentionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MentionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>
          }
          findMany: {
            args: Prisma.MentionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>[]
          }
          create: {
            args: Prisma.MentionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>
          }
          createMany: {
            args: Prisma.MentionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MentionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>[]
          }
          delete: {
            args: Prisma.MentionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>
          }
          update: {
            args: Prisma.MentionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>
          }
          deleteMany: {
            args: Prisma.MentionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MentionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MentionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>[]
          }
          upsert: {
            args: Prisma.MentionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MentionPayload>
          }
          aggregate: {
            args: Prisma.MentionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMention>
          }
          groupBy: {
            args: Prisma.MentionGroupByArgs<ExtArgs>
            result: $Utils.Optional<MentionGroupByOutputType>[]
          }
          count: {
            args: Prisma.MentionCountArgs<ExtArgs>
            result: $Utils.Optional<MentionCountAggregateOutputType> | number
          }
        }
      }
      PostReaction: {
        payload: Prisma.$PostReactionPayload<ExtArgs>
        fields: Prisma.PostReactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PostReactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PostReactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>
          }
          findFirst: {
            args: Prisma.PostReactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PostReactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>
          }
          findMany: {
            args: Prisma.PostReactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>[]
          }
          create: {
            args: Prisma.PostReactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>
          }
          createMany: {
            args: Prisma.PostReactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PostReactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>[]
          }
          delete: {
            args: Prisma.PostReactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>
          }
          update: {
            args: Prisma.PostReactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>
          }
          deleteMany: {
            args: Prisma.PostReactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PostReactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PostReactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>[]
          }
          upsert: {
            args: Prisma.PostReactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PostReactionPayload>
          }
          aggregate: {
            args: Prisma.PostReactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePostReaction>
          }
          groupBy: {
            args: Prisma.PostReactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<PostReactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.PostReactionCountArgs<ExtArgs>
            result: $Utils.Optional<PostReactionCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    account?: AccountOmit
    session?: SessionOmit
    user?: UserOmit
    verificationToken?: VerificationTokenOmit
    tournament?: TournamentOmit
    category?: CategoryOmit
    forum?: ForumOmit
    topic?: TopicOmit
    post?: PostOmit
    pm?: PmOmit
    topicView?: TopicViewOmit
    mention?: MentionOmit
    postReaction?: PostReactionOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    accounts: number
    sessions: number
    tournaments: number
    topics: number
    posts: number
    sentMessages: number
    receivedMessages: number
    topicViews: number
    mentionsMade: number
    mentionsReceived: number
    moderatedPosts: number
    postReactions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | UserCountOutputTypeCountAccountsArgs
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    tournaments?: boolean | UserCountOutputTypeCountTournamentsArgs
    topics?: boolean | UserCountOutputTypeCountTopicsArgs
    posts?: boolean | UserCountOutputTypeCountPostsArgs
    sentMessages?: boolean | UserCountOutputTypeCountSentMessagesArgs
    receivedMessages?: boolean | UserCountOutputTypeCountReceivedMessagesArgs
    topicViews?: boolean | UserCountOutputTypeCountTopicViewsArgs
    mentionsMade?: boolean | UserCountOutputTypeCountMentionsMadeArgs
    mentionsReceived?: boolean | UserCountOutputTypeCountMentionsReceivedArgs
    moderatedPosts?: boolean | UserCountOutputTypeCountModeratedPostsArgs
    postReactions?: boolean | UserCountOutputTypeCountPostReactionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAccountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTournamentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TournamentWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTopicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSentMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PmWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountReceivedMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PmWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTopicViewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicViewWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMentionsMadeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MentionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMentionsReceivedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MentionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountModeratedPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPostReactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostReactionWhereInput
  }


  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    forums: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    forums?: boolean | CategoryCountOutputTypeCountForumsArgs
  }

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountForumsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ForumWhereInput
  }


  /**
   * Count Type ForumCountOutputType
   */

  export type ForumCountOutputType = {
    subForums: number
    topics: number
  }

  export type ForumCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    subForums?: boolean | ForumCountOutputTypeCountSubForumsArgs
    topics?: boolean | ForumCountOutputTypeCountTopicsArgs
  }

  // Custom InputTypes
  /**
   * ForumCountOutputType without action
   */
  export type ForumCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ForumCountOutputType
     */
    select?: ForumCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ForumCountOutputType without action
   */
  export type ForumCountOutputTypeCountSubForumsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ForumWhereInput
  }

  /**
   * ForumCountOutputType without action
   */
  export type ForumCountOutputTypeCountTopicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicWhereInput
  }


  /**
   * Count Type TopicCountOutputType
   */

  export type TopicCountOutputType = {
    posts: number
    topicViews: number
  }

  export type TopicCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    posts?: boolean | TopicCountOutputTypeCountPostsArgs
    topicViews?: boolean | TopicCountOutputTypeCountTopicViewsArgs
  }

  // Custom InputTypes
  /**
   * TopicCountOutputType without action
   */
  export type TopicCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicCountOutputType
     */
    select?: TopicCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TopicCountOutputType without action
   */
  export type TopicCountOutputTypeCountPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
  }

  /**
   * TopicCountOutputType without action
   */
  export type TopicCountOutputTypeCountTopicViewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicViewWhereInput
  }


  /**
   * Count Type PostCountOutputType
   */

  export type PostCountOutputType = {
    mentions: number
    reactions: number
  }

  export type PostCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mentions?: boolean | PostCountOutputTypeCountMentionsArgs
    reactions?: boolean | PostCountOutputTypeCountReactionsArgs
  }

  // Custom InputTypes
  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostCountOutputType
     */
    select?: PostCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountMentionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MentionWhereInput
  }

  /**
   * PostCountOutputType without action
   */
  export type PostCountOutputTypeCountReactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostReactionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountAvgAggregateOutputType = {
    expires_at: number | null
  }

  export type AccountSumAggregateOutputType = {
    expires_at: number | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    type: string | null
    provider: string | null
    providerAccountId: string | null
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    userId: number
    type: number
    provider: number
    providerAccountId: number
    refresh_token: number
    access_token: number
    expires_at: number
    token_type: number
    scope: number
    id_token: number
    session_state: number
    _all: number
  }


  export type AccountAvgAggregateInputType = {
    expires_at?: true
  }

  export type AccountSumAggregateInputType = {
    expires_at?: true
  }

  export type AccountMinAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    userId?: true
    type?: true
    provider?: true
    providerAccountId?: true
    refresh_token?: true
    access_token?: true
    expires_at?: true
    token_type?: true
    scope?: true
    id_token?: true
    session_state?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AccountAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AccountSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _avg?: AccountAvgAggregateInputType
    _sum?: AccountSumAggregateInputType
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
    _count: AccountCountAggregateOutputType | null
    _avg: AccountAvgAggregateOutputType | null
    _sum: AccountSumAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    userId?: boolean
    type?: boolean
    provider?: boolean
    providerAccountId?: boolean
    refresh_token?: boolean
    access_token?: boolean
    expires_at?: boolean
    token_type?: boolean
    scope?: boolean
    id_token?: boolean
    session_state?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "type" | "provider" | "providerAccountId" | "refresh_token" | "access_token" | "expires_at" | "token_type" | "scope" | "id_token" | "session_state", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      type: string
      provider: string
      providerAccountId: string
      refresh_token: string | null
      access_token: string | null
      expires_at: number | null
      token_type: string | null
      scope: string | null
      id_token: string | null
      session_state: string | null
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly userId: FieldRef<"Account", 'String'>
    readonly type: FieldRef<"Account", 'String'>
    readonly provider: FieldRef<"Account", 'String'>
    readonly providerAccountId: FieldRef<"Account", 'String'>
    readonly refresh_token: FieldRef<"Account", 'String'>
    readonly access_token: FieldRef<"Account", 'String'>
    readonly expires_at: FieldRef<"Account", 'Int'>
    readonly token_type: FieldRef<"Account", 'String'>
    readonly scope: FieldRef<"Account", 'String'>
    readonly id_token: FieldRef<"Account", 'String'>
    readonly session_state: FieldRef<"Account", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    sessionToken: number
    userId: number
    expires: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    sessionToken: string
    userId: string
    expires: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionToken" | "userId" | "expires", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionToken: string
      userId: string
      expires: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly sessionToken: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly expires: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    role: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    role: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    emailVerified: number
    image: number
    role: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    role?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    role?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    emailVerified?: true
    image?: true
    role?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string | null
    email: string | null
    emailVerified: Date | null
    image: string | null
    role: string
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    role?: boolean
    accounts?: boolean | User$accountsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    tournaments?: boolean | User$tournamentsArgs<ExtArgs>
    topics?: boolean | User$topicsArgs<ExtArgs>
    posts?: boolean | User$postsArgs<ExtArgs>
    sentMessages?: boolean | User$sentMessagesArgs<ExtArgs>
    receivedMessages?: boolean | User$receivedMessagesArgs<ExtArgs>
    topicViews?: boolean | User$topicViewsArgs<ExtArgs>
    mentionsMade?: boolean | User$mentionsMadeArgs<ExtArgs>
    mentionsReceived?: boolean | User$mentionsReceivedArgs<ExtArgs>
    moderatedPosts?: boolean | User$moderatedPostsArgs<ExtArgs>
    postReactions?: boolean | User$postReactionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    role?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    role?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    emailVerified?: boolean
    image?: boolean
    role?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "emailVerified" | "image" | "role", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    accounts?: boolean | User$accountsArgs<ExtArgs>
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    tournaments?: boolean | User$tournamentsArgs<ExtArgs>
    topics?: boolean | User$topicsArgs<ExtArgs>
    posts?: boolean | User$postsArgs<ExtArgs>
    sentMessages?: boolean | User$sentMessagesArgs<ExtArgs>
    receivedMessages?: boolean | User$receivedMessagesArgs<ExtArgs>
    topicViews?: boolean | User$topicViewsArgs<ExtArgs>
    mentionsMade?: boolean | User$mentionsMadeArgs<ExtArgs>
    mentionsReceived?: boolean | User$mentionsReceivedArgs<ExtArgs>
    moderatedPosts?: boolean | User$moderatedPostsArgs<ExtArgs>
    postReactions?: boolean | User$postReactionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      accounts: Prisma.$AccountPayload<ExtArgs>[]
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      tournaments: Prisma.$TournamentPayload<ExtArgs>[]
      topics: Prisma.$TopicPayload<ExtArgs>[]
      posts: Prisma.$PostPayload<ExtArgs>[]
      sentMessages: Prisma.$PmPayload<ExtArgs>[]
      receivedMessages: Prisma.$PmPayload<ExtArgs>[]
      topicViews: Prisma.$TopicViewPayload<ExtArgs>[]
      mentionsMade: Prisma.$MentionPayload<ExtArgs>[]
      mentionsReceived: Prisma.$MentionPayload<ExtArgs>[]
      moderatedPosts: Prisma.$PostPayload<ExtArgs>[]
      postReactions: Prisma.$PostReactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string | null
      email: string | null
      emailVerified: Date | null
      image: string | null
      role: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    accounts<T extends User$accountsArgs<ExtArgs> = {}>(args?: Subset<T, User$accountsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    tournaments<T extends User$tournamentsArgs<ExtArgs> = {}>(args?: Subset<T, User$tournamentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    topics<T extends User$topicsArgs<ExtArgs> = {}>(args?: Subset<T, User$topicsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    posts<T extends User$postsArgs<ExtArgs> = {}>(args?: Subset<T, User$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    sentMessages<T extends User$sentMessagesArgs<ExtArgs> = {}>(args?: Subset<T, User$sentMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    receivedMessages<T extends User$receivedMessagesArgs<ExtArgs> = {}>(args?: Subset<T, User$receivedMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    topicViews<T extends User$topicViewsArgs<ExtArgs> = {}>(args?: Subset<T, User$topicViewsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    mentionsMade<T extends User$mentionsMadeArgs<ExtArgs> = {}>(args?: Subset<T, User$mentionsMadeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    mentionsReceived<T extends User$mentionsReceivedArgs<ExtArgs> = {}>(args?: Subset<T, User$mentionsReceivedArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    moderatedPosts<T extends User$moderatedPostsArgs<ExtArgs> = {}>(args?: Subset<T, User$moderatedPostsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    postReactions<T extends User$postReactionsArgs<ExtArgs> = {}>(args?: Subset<T, User$postReactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly emailVerified: FieldRef<"User", 'DateTime'>
    readonly image: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data?: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.accounts
   */
  export type User$accountsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    cursor?: AccountWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User.tournaments
   */
  export type User$tournamentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    where?: TournamentWhereInput
    orderBy?: TournamentOrderByWithRelationInput | TournamentOrderByWithRelationInput[]
    cursor?: TournamentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TournamentScalarFieldEnum | TournamentScalarFieldEnum[]
  }

  /**
   * User.topics
   */
  export type User$topicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    where?: TopicWhereInput
    orderBy?: TopicOrderByWithRelationInput | TopicOrderByWithRelationInput[]
    cursor?: TopicWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TopicScalarFieldEnum | TopicScalarFieldEnum[]
  }

  /**
   * User.posts
   */
  export type User$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * User.sentMessages
   */
  export type User$sentMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    where?: PmWhereInput
    orderBy?: PmOrderByWithRelationInput | PmOrderByWithRelationInput[]
    cursor?: PmWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PmScalarFieldEnum | PmScalarFieldEnum[]
  }

  /**
   * User.receivedMessages
   */
  export type User$receivedMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    where?: PmWhereInput
    orderBy?: PmOrderByWithRelationInput | PmOrderByWithRelationInput[]
    cursor?: PmWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PmScalarFieldEnum | PmScalarFieldEnum[]
  }

  /**
   * User.topicViews
   */
  export type User$topicViewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    where?: TopicViewWhereInput
    orderBy?: TopicViewOrderByWithRelationInput | TopicViewOrderByWithRelationInput[]
    cursor?: TopicViewWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TopicViewScalarFieldEnum | TopicViewScalarFieldEnum[]
  }

  /**
   * User.mentionsMade
   */
  export type User$mentionsMadeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    where?: MentionWhereInput
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    cursor?: MentionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MentionScalarFieldEnum | MentionScalarFieldEnum[]
  }

  /**
   * User.mentionsReceived
   */
  export type User$mentionsReceivedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    where?: MentionWhereInput
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    cursor?: MentionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MentionScalarFieldEnum | MentionScalarFieldEnum[]
  }

  /**
   * User.moderatedPosts
   */
  export type User$moderatedPostsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * User.postReactions
   */
  export type User$postReactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    where?: PostReactionWhereInput
    orderBy?: PostReactionOrderByWithRelationInput | PostReactionOrderByWithRelationInput[]
    cursor?: PostReactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostReactionScalarFieldEnum | PostReactionScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model VerificationToken
   */

  export type AggregateVerificationToken = {
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  export type VerificationTokenMinAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenMaxAggregateOutputType = {
    identifier: string | null
    token: string | null
    expires: Date | null
  }

  export type VerificationTokenCountAggregateOutputType = {
    identifier: number
    token: number
    expires: number
    _all: number
  }


  export type VerificationTokenMinAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenMaxAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
  }

  export type VerificationTokenCountAggregateInputType = {
    identifier?: true
    token?: true
    expires?: true
    _all?: true
  }

  export type VerificationTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationToken to aggregate.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VerificationTokens
    **/
    _count?: true | VerificationTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VerificationTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type GetVerificationTokenAggregateType<T extends VerificationTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateVerificationToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVerificationToken[P]>
      : GetScalarType<T[P], AggregateVerificationToken[P]>
  }




  export type VerificationTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VerificationTokenWhereInput
    orderBy?: VerificationTokenOrderByWithAggregationInput | VerificationTokenOrderByWithAggregationInput[]
    by: VerificationTokenScalarFieldEnum[] | VerificationTokenScalarFieldEnum
    having?: VerificationTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VerificationTokenCountAggregateInputType | true
    _min?: VerificationTokenMinAggregateInputType
    _max?: VerificationTokenMaxAggregateInputType
  }

  export type VerificationTokenGroupByOutputType = {
    identifier: string
    token: string
    expires: Date
    _count: VerificationTokenCountAggregateOutputType | null
    _min: VerificationTokenMinAggregateOutputType | null
    _max: VerificationTokenMaxAggregateOutputType | null
  }

  type GetVerificationTokenGroupByPayload<T extends VerificationTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VerificationTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VerificationTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
            : GetScalarType<T[P], VerificationTokenGroupByOutputType[P]>
        }
      >
    >


  export type VerificationTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }, ExtArgs["result"]["verificationToken"]>

  export type VerificationTokenSelectScalar = {
    identifier?: boolean
    token?: boolean
    expires?: boolean
  }

  export type VerificationTokenOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"identifier" | "token" | "expires", ExtArgs["result"]["verificationToken"]>

  export type $VerificationTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VerificationToken"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      identifier: string
      token: string
      expires: Date
    }, ExtArgs["result"]["verificationToken"]>
    composites: {}
  }

  type VerificationTokenGetPayload<S extends boolean | null | undefined | VerificationTokenDefaultArgs> = $Result.GetResult<Prisma.$VerificationTokenPayload, S>

  type VerificationTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VerificationTokenFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VerificationTokenCountAggregateInputType | true
    }

  export interface VerificationTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VerificationToken'], meta: { name: 'VerificationToken' } }
    /**
     * Find zero or one VerificationToken that matches the filter.
     * @param {VerificationTokenFindUniqueArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationTokenFindUniqueArgs>(args: SelectSubset<T, VerificationTokenFindUniqueArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VerificationToken that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationTokenFindUniqueOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, VerificationTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationTokenFindFirstArgs>(args?: SelectSubset<T, VerificationTokenFindFirstArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VerificationToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindFirstOrThrowArgs} args - Arguments to find a VerificationToken
     * @example
     * // Get one VerificationToken
     * const verificationToken = await prisma.verificationToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, VerificationTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VerificationTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany()
     * 
     * // Get first 10 VerificationTokens
     * const verificationTokens = await prisma.verificationToken.findMany({ take: 10 })
     * 
     * // Only select the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.findMany({ select: { identifier: true } })
     * 
     */
    findMany<T extends VerificationTokenFindManyArgs>(args?: SelectSubset<T, VerificationTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VerificationToken.
     * @param {VerificationTokenCreateArgs} args - Arguments to create a VerificationToken.
     * @example
     * // Create one VerificationToken
     * const VerificationToken = await prisma.verificationToken.create({
     *   data: {
     *     // ... data to create a VerificationToken
     *   }
     * })
     * 
     */
    create<T extends VerificationTokenCreateArgs>(args: SelectSubset<T, VerificationTokenCreateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VerificationTokens.
     * @param {VerificationTokenCreateManyArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VerificationTokenCreateManyArgs>(args?: SelectSubset<T, VerificationTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VerificationTokens and returns the data saved in the database.
     * @param {VerificationTokenCreateManyAndReturnArgs} args - Arguments to create many VerificationTokens.
     * @example
     * // Create many VerificationTokens
     * const verificationToken = await prisma.verificationToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.createManyAndReturn({
     *   select: { identifier: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VerificationTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, VerificationTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VerificationToken.
     * @param {VerificationTokenDeleteArgs} args - Arguments to delete one VerificationToken.
     * @example
     * // Delete one VerificationToken
     * const VerificationToken = await prisma.verificationToken.delete({
     *   where: {
     *     // ... filter to delete one VerificationToken
     *   }
     * })
     * 
     */
    delete<T extends VerificationTokenDeleteArgs>(args: SelectSubset<T, VerificationTokenDeleteArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VerificationToken.
     * @param {VerificationTokenUpdateArgs} args - Arguments to update one VerificationToken.
     * @example
     * // Update one VerificationToken
     * const verificationToken = await prisma.verificationToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VerificationTokenUpdateArgs>(args: SelectSubset<T, VerificationTokenUpdateArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VerificationTokens.
     * @param {VerificationTokenDeleteManyArgs} args - Arguments to filter VerificationTokens to delete.
     * @example
     * // Delete a few VerificationTokens
     * const { count } = await prisma.verificationToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VerificationTokenDeleteManyArgs>(args?: SelectSubset<T, VerificationTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VerificationTokenUpdateManyArgs>(args: SelectSubset<T, VerificationTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VerificationTokens and returns the data updated in the database.
     * @param {VerificationTokenUpdateManyAndReturnArgs} args - Arguments to update many VerificationTokens.
     * @example
     * // Update many VerificationTokens
     * const verificationToken = await prisma.verificationToken.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VerificationTokens and only return the `identifier`
     * const verificationTokenWithIdentifierOnly = await prisma.verificationToken.updateManyAndReturn({
     *   select: { identifier: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VerificationTokenUpdateManyAndReturnArgs>(args: SelectSubset<T, VerificationTokenUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VerificationToken.
     * @param {VerificationTokenUpsertArgs} args - Arguments to update or create a VerificationToken.
     * @example
     * // Update or create a VerificationToken
     * const verificationToken = await prisma.verificationToken.upsert({
     *   create: {
     *     // ... data to create a VerificationToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationToken we want to update
     *   }
     * })
     */
    upsert<T extends VerificationTokenUpsertArgs>(args: SelectSubset<T, VerificationTokenUpsertArgs<ExtArgs>>): Prisma__VerificationTokenClient<$Result.GetResult<Prisma.$VerificationTokenPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VerificationTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenCountArgs} args - Arguments to filter VerificationTokens to count.
     * @example
     * // Count the number of VerificationTokens
     * const count = await prisma.verificationToken.count({
     *   where: {
     *     // ... the filter for the VerificationTokens we want to count
     *   }
     * })
    **/
    count<T extends VerificationTokenCountArgs>(
      args?: Subset<T, VerificationTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VerificationTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VerificationTokenAggregateArgs>(args: Subset<T, VerificationTokenAggregateArgs>): Prisma.PrismaPromise<GetVerificationTokenAggregateType<T>>

    /**
     * Group by VerificationToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VerificationTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VerificationTokenGroupByArgs['orderBy'] }
        : { orderBy?: VerificationTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VerificationTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VerificationToken model
   */
  readonly fields: VerificationTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VerificationToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VerificationTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VerificationToken model
   */
  interface VerificationTokenFieldRefs {
    readonly identifier: FieldRef<"VerificationToken", 'String'>
    readonly token: FieldRef<"VerificationToken", 'String'>
    readonly expires: FieldRef<"VerificationToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VerificationToken findUnique
   */
  export type VerificationTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findUniqueOrThrow
   */
  export type VerificationTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken findFirst
   */
  export type VerificationTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findFirstOrThrow
   */
  export type VerificationTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationToken to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken findMany
   */
  export type VerificationTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter, which VerificationTokens to fetch.
     */
    where?: VerificationTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VerificationTokens to fetch.
     */
    orderBy?: VerificationTokenOrderByWithRelationInput | VerificationTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VerificationTokens.
     */
    cursor?: VerificationTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VerificationTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VerificationTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VerificationTokens.
     */
    distinct?: VerificationTokenScalarFieldEnum | VerificationTokenScalarFieldEnum[]
  }

  /**
   * VerificationToken create
   */
  export type VerificationTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to create a VerificationToken.
     */
    data: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
  }

  /**
   * VerificationToken createMany
   */
  export type VerificationTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
  }

  /**
   * VerificationToken createManyAndReturn
   */
  export type VerificationTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to create many VerificationTokens.
     */
    data: VerificationTokenCreateManyInput | VerificationTokenCreateManyInput[]
  }

  /**
   * VerificationToken update
   */
  export type VerificationTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data needed to update a VerificationToken.
     */
    data: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
    /**
     * Choose, which VerificationToken to update.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken updateMany
   */
  export type VerificationTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken updateManyAndReturn
   */
  export type VerificationTokenUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The data used to update VerificationTokens.
     */
    data: XOR<VerificationTokenUpdateManyMutationInput, VerificationTokenUncheckedUpdateManyInput>
    /**
     * Filter which VerificationTokens to update
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to update.
     */
    limit?: number
  }

  /**
   * VerificationToken upsert
   */
  export type VerificationTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * The filter to search for the VerificationToken to update in case it exists.
     */
    where: VerificationTokenWhereUniqueInput
    /**
     * In case the VerificationToken found by the `where` argument doesn't exist, create a new VerificationToken with this data.
     */
    create: XOR<VerificationTokenCreateInput, VerificationTokenUncheckedCreateInput>
    /**
     * In case the VerificationToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VerificationTokenUpdateInput, VerificationTokenUncheckedUpdateInput>
  }

  /**
   * VerificationToken delete
   */
  export type VerificationTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
    /**
     * Filter which VerificationToken to delete.
     */
    where: VerificationTokenWhereUniqueInput
  }

  /**
   * VerificationToken deleteMany
   */
  export type VerificationTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationTokens to delete
     */
    where?: VerificationTokenWhereInput
    /**
     * Limit how many VerificationTokens to delete.
     */
    limit?: number
  }

  /**
   * VerificationToken without action
   */
  export type VerificationTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationToken
     */
    select?: VerificationTokenSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VerificationToken
     */
    omit?: VerificationTokenOmit<ExtArgs> | null
  }


  /**
   * Model Tournament
   */

  export type AggregateTournament = {
    _count: TournamentCountAggregateOutputType | null
    _avg: TournamentAvgAggregateOutputType | null
    _sum: TournamentSumAggregateOutputType | null
    _min: TournamentMinAggregateOutputType | null
    _max: TournamentMaxAggregateOutputType | null
  }

  export type TournamentAvgAggregateOutputType = {
    maxParticipants: number | null
    currentParticipants: number | null
    preRegistered: number | null
    totalMatches: number | null
    price: number | null
  }

  export type TournamentSumAggregateOutputType = {
    maxParticipants: number | null
    currentParticipants: number | null
    preRegistered: number | null
    totalMatches: number | null
    price: number | null
  }

  export type TournamentMinAggregateOutputType = {
    id: string | null
    name: string | null
    date: Date | null
    location: string | null
    ville: string | null
    departement: string | null
    region: string | null
    description: string | null
    maxParticipants: number | null
    currentParticipants: number | null
    preRegistered: number | null
    days: string | null
    totalMatches: number | null
    price: number | null
    structure: string | null
    lodgingAtVenue: boolean | null
    ruleset: string | null
    mealsIncluded: boolean | null
    fridayArrival: boolean | null
    gameEdition: string | null
    organizerId: string | null
  }

  export type TournamentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    date: Date | null
    location: string | null
    ville: string | null
    departement: string | null
    region: string | null
    description: string | null
    maxParticipants: number | null
    currentParticipants: number | null
    preRegistered: number | null
    days: string | null
    totalMatches: number | null
    price: number | null
    structure: string | null
    lodgingAtVenue: boolean | null
    ruleset: string | null
    mealsIncluded: boolean | null
    fridayArrival: boolean | null
    gameEdition: string | null
    organizerId: string | null
  }

  export type TournamentCountAggregateOutputType = {
    id: number
    name: number
    date: number
    location: number
    ville: number
    departement: number
    region: number
    description: number
    maxParticipants: number
    currentParticipants: number
    preRegistered: number
    days: number
    totalMatches: number
    price: number
    structure: number
    lodgingAtVenue: number
    ruleset: number
    mealsIncluded: number
    fridayArrival: number
    gameEdition: number
    organizerId: number
    _all: number
  }


  export type TournamentAvgAggregateInputType = {
    maxParticipants?: true
    currentParticipants?: true
    preRegistered?: true
    totalMatches?: true
    price?: true
  }

  export type TournamentSumAggregateInputType = {
    maxParticipants?: true
    currentParticipants?: true
    preRegistered?: true
    totalMatches?: true
    price?: true
  }

  export type TournamentMinAggregateInputType = {
    id?: true
    name?: true
    date?: true
    location?: true
    ville?: true
    departement?: true
    region?: true
    description?: true
    maxParticipants?: true
    currentParticipants?: true
    preRegistered?: true
    days?: true
    totalMatches?: true
    price?: true
    structure?: true
    lodgingAtVenue?: true
    ruleset?: true
    mealsIncluded?: true
    fridayArrival?: true
    gameEdition?: true
    organizerId?: true
  }

  export type TournamentMaxAggregateInputType = {
    id?: true
    name?: true
    date?: true
    location?: true
    ville?: true
    departement?: true
    region?: true
    description?: true
    maxParticipants?: true
    currentParticipants?: true
    preRegistered?: true
    days?: true
    totalMatches?: true
    price?: true
    structure?: true
    lodgingAtVenue?: true
    ruleset?: true
    mealsIncluded?: true
    fridayArrival?: true
    gameEdition?: true
    organizerId?: true
  }

  export type TournamentCountAggregateInputType = {
    id?: true
    name?: true
    date?: true
    location?: true
    ville?: true
    departement?: true
    region?: true
    description?: true
    maxParticipants?: true
    currentParticipants?: true
    preRegistered?: true
    days?: true
    totalMatches?: true
    price?: true
    structure?: true
    lodgingAtVenue?: true
    ruleset?: true
    mealsIncluded?: true
    fridayArrival?: true
    gameEdition?: true
    organizerId?: true
    _all?: true
  }

  export type TournamentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tournament to aggregate.
     */
    where?: TournamentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tournaments to fetch.
     */
    orderBy?: TournamentOrderByWithRelationInput | TournamentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TournamentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tournaments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tournaments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tournaments
    **/
    _count?: true | TournamentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TournamentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TournamentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TournamentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TournamentMaxAggregateInputType
  }

  export type GetTournamentAggregateType<T extends TournamentAggregateArgs> = {
        [P in keyof T & keyof AggregateTournament]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTournament[P]>
      : GetScalarType<T[P], AggregateTournament[P]>
  }




  export type TournamentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TournamentWhereInput
    orderBy?: TournamentOrderByWithAggregationInput | TournamentOrderByWithAggregationInput[]
    by: TournamentScalarFieldEnum[] | TournamentScalarFieldEnum
    having?: TournamentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TournamentCountAggregateInputType | true
    _avg?: TournamentAvgAggregateInputType
    _sum?: TournamentSumAggregateInputType
    _min?: TournamentMinAggregateInputType
    _max?: TournamentMaxAggregateInputType
  }

  export type TournamentGroupByOutputType = {
    id: string
    name: string
    date: Date
    location: string
    ville: string | null
    departement: string | null
    region: string | null
    description: string | null
    maxParticipants: number | null
    currentParticipants: number
    preRegistered: number
    days: string | null
    totalMatches: number | null
    price: number | null
    structure: string | null
    lodgingAtVenue: boolean
    ruleset: string | null
    mealsIncluded: boolean
    fridayArrival: boolean
    gameEdition: string | null
    organizerId: string
    _count: TournamentCountAggregateOutputType | null
    _avg: TournamentAvgAggregateOutputType | null
    _sum: TournamentSumAggregateOutputType | null
    _min: TournamentMinAggregateOutputType | null
    _max: TournamentMaxAggregateOutputType | null
  }

  type GetTournamentGroupByPayload<T extends TournamentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TournamentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TournamentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TournamentGroupByOutputType[P]>
            : GetScalarType<T[P], TournamentGroupByOutputType[P]>
        }
      >
    >


  export type TournamentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    date?: boolean
    location?: boolean
    ville?: boolean
    departement?: boolean
    region?: boolean
    description?: boolean
    maxParticipants?: boolean
    currentParticipants?: boolean
    preRegistered?: boolean
    days?: boolean
    totalMatches?: boolean
    price?: boolean
    structure?: boolean
    lodgingAtVenue?: boolean
    ruleset?: boolean
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: boolean
    organizerId?: boolean
    organizer?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tournament"]>

  export type TournamentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    date?: boolean
    location?: boolean
    ville?: boolean
    departement?: boolean
    region?: boolean
    description?: boolean
    maxParticipants?: boolean
    currentParticipants?: boolean
    preRegistered?: boolean
    days?: boolean
    totalMatches?: boolean
    price?: boolean
    structure?: boolean
    lodgingAtVenue?: boolean
    ruleset?: boolean
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: boolean
    organizerId?: boolean
    organizer?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tournament"]>

  export type TournamentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    date?: boolean
    location?: boolean
    ville?: boolean
    departement?: boolean
    region?: boolean
    description?: boolean
    maxParticipants?: boolean
    currentParticipants?: boolean
    preRegistered?: boolean
    days?: boolean
    totalMatches?: boolean
    price?: boolean
    structure?: boolean
    lodgingAtVenue?: boolean
    ruleset?: boolean
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: boolean
    organizerId?: boolean
    organizer?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tournament"]>

  export type TournamentSelectScalar = {
    id?: boolean
    name?: boolean
    date?: boolean
    location?: boolean
    ville?: boolean
    departement?: boolean
    region?: boolean
    description?: boolean
    maxParticipants?: boolean
    currentParticipants?: boolean
    preRegistered?: boolean
    days?: boolean
    totalMatches?: boolean
    price?: boolean
    structure?: boolean
    lodgingAtVenue?: boolean
    ruleset?: boolean
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: boolean
    organizerId?: boolean
  }

  export type TournamentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "date" | "location" | "ville" | "departement" | "region" | "description" | "maxParticipants" | "currentParticipants" | "preRegistered" | "days" | "totalMatches" | "price" | "structure" | "lodgingAtVenue" | "ruleset" | "mealsIncluded" | "fridayArrival" | "gameEdition" | "organizerId", ExtArgs["result"]["tournament"]>
  export type TournamentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organizer?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TournamentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organizer?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TournamentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    organizer?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TournamentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tournament"
    objects: {
      organizer: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      date: Date
      location: string
      ville: string | null
      departement: string | null
      region: string | null
      description: string | null
      maxParticipants: number | null
      currentParticipants: number
      preRegistered: number
      days: string | null
      totalMatches: number | null
      price: number | null
      structure: string | null
      lodgingAtVenue: boolean
      ruleset: string | null
      mealsIncluded: boolean
      fridayArrival: boolean
      gameEdition: string | null
      organizerId: string
    }, ExtArgs["result"]["tournament"]>
    composites: {}
  }

  type TournamentGetPayload<S extends boolean | null | undefined | TournamentDefaultArgs> = $Result.GetResult<Prisma.$TournamentPayload, S>

  type TournamentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TournamentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TournamentCountAggregateInputType | true
    }

  export interface TournamentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tournament'], meta: { name: 'Tournament' } }
    /**
     * Find zero or one Tournament that matches the filter.
     * @param {TournamentFindUniqueArgs} args - Arguments to find a Tournament
     * @example
     * // Get one Tournament
     * const tournament = await prisma.tournament.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TournamentFindUniqueArgs>(args: SelectSubset<T, TournamentFindUniqueArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tournament that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TournamentFindUniqueOrThrowArgs} args - Arguments to find a Tournament
     * @example
     * // Get one Tournament
     * const tournament = await prisma.tournament.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TournamentFindUniqueOrThrowArgs>(args: SelectSubset<T, TournamentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tournament that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentFindFirstArgs} args - Arguments to find a Tournament
     * @example
     * // Get one Tournament
     * const tournament = await prisma.tournament.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TournamentFindFirstArgs>(args?: SelectSubset<T, TournamentFindFirstArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tournament that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentFindFirstOrThrowArgs} args - Arguments to find a Tournament
     * @example
     * // Get one Tournament
     * const tournament = await prisma.tournament.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TournamentFindFirstOrThrowArgs>(args?: SelectSubset<T, TournamentFindFirstOrThrowArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tournaments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tournaments
     * const tournaments = await prisma.tournament.findMany()
     * 
     * // Get first 10 Tournaments
     * const tournaments = await prisma.tournament.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tournamentWithIdOnly = await prisma.tournament.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TournamentFindManyArgs>(args?: SelectSubset<T, TournamentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tournament.
     * @param {TournamentCreateArgs} args - Arguments to create a Tournament.
     * @example
     * // Create one Tournament
     * const Tournament = await prisma.tournament.create({
     *   data: {
     *     // ... data to create a Tournament
     *   }
     * })
     * 
     */
    create<T extends TournamentCreateArgs>(args: SelectSubset<T, TournamentCreateArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tournaments.
     * @param {TournamentCreateManyArgs} args - Arguments to create many Tournaments.
     * @example
     * // Create many Tournaments
     * const tournament = await prisma.tournament.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TournamentCreateManyArgs>(args?: SelectSubset<T, TournamentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tournaments and returns the data saved in the database.
     * @param {TournamentCreateManyAndReturnArgs} args - Arguments to create many Tournaments.
     * @example
     * // Create many Tournaments
     * const tournament = await prisma.tournament.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tournaments and only return the `id`
     * const tournamentWithIdOnly = await prisma.tournament.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TournamentCreateManyAndReturnArgs>(args?: SelectSubset<T, TournamentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tournament.
     * @param {TournamentDeleteArgs} args - Arguments to delete one Tournament.
     * @example
     * // Delete one Tournament
     * const Tournament = await prisma.tournament.delete({
     *   where: {
     *     // ... filter to delete one Tournament
     *   }
     * })
     * 
     */
    delete<T extends TournamentDeleteArgs>(args: SelectSubset<T, TournamentDeleteArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tournament.
     * @param {TournamentUpdateArgs} args - Arguments to update one Tournament.
     * @example
     * // Update one Tournament
     * const tournament = await prisma.tournament.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TournamentUpdateArgs>(args: SelectSubset<T, TournamentUpdateArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tournaments.
     * @param {TournamentDeleteManyArgs} args - Arguments to filter Tournaments to delete.
     * @example
     * // Delete a few Tournaments
     * const { count } = await prisma.tournament.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TournamentDeleteManyArgs>(args?: SelectSubset<T, TournamentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tournaments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tournaments
     * const tournament = await prisma.tournament.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TournamentUpdateManyArgs>(args: SelectSubset<T, TournamentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tournaments and returns the data updated in the database.
     * @param {TournamentUpdateManyAndReturnArgs} args - Arguments to update many Tournaments.
     * @example
     * // Update many Tournaments
     * const tournament = await prisma.tournament.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tournaments and only return the `id`
     * const tournamentWithIdOnly = await prisma.tournament.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TournamentUpdateManyAndReturnArgs>(args: SelectSubset<T, TournamentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tournament.
     * @param {TournamentUpsertArgs} args - Arguments to update or create a Tournament.
     * @example
     * // Update or create a Tournament
     * const tournament = await prisma.tournament.upsert({
     *   create: {
     *     // ... data to create a Tournament
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tournament we want to update
     *   }
     * })
     */
    upsert<T extends TournamentUpsertArgs>(args: SelectSubset<T, TournamentUpsertArgs<ExtArgs>>): Prisma__TournamentClient<$Result.GetResult<Prisma.$TournamentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tournaments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentCountArgs} args - Arguments to filter Tournaments to count.
     * @example
     * // Count the number of Tournaments
     * const count = await prisma.tournament.count({
     *   where: {
     *     // ... the filter for the Tournaments we want to count
     *   }
     * })
    **/
    count<T extends TournamentCountArgs>(
      args?: Subset<T, TournamentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TournamentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tournament.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TournamentAggregateArgs>(args: Subset<T, TournamentAggregateArgs>): Prisma.PrismaPromise<GetTournamentAggregateType<T>>

    /**
     * Group by Tournament.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TournamentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TournamentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TournamentGroupByArgs['orderBy'] }
        : { orderBy?: TournamentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TournamentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTournamentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tournament model
   */
  readonly fields: TournamentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tournament.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TournamentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    organizer<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tournament model
   */
  interface TournamentFieldRefs {
    readonly id: FieldRef<"Tournament", 'String'>
    readonly name: FieldRef<"Tournament", 'String'>
    readonly date: FieldRef<"Tournament", 'DateTime'>
    readonly location: FieldRef<"Tournament", 'String'>
    readonly ville: FieldRef<"Tournament", 'String'>
    readonly departement: FieldRef<"Tournament", 'String'>
    readonly region: FieldRef<"Tournament", 'String'>
    readonly description: FieldRef<"Tournament", 'String'>
    readonly maxParticipants: FieldRef<"Tournament", 'Int'>
    readonly currentParticipants: FieldRef<"Tournament", 'Int'>
    readonly preRegistered: FieldRef<"Tournament", 'Int'>
    readonly days: FieldRef<"Tournament", 'String'>
    readonly totalMatches: FieldRef<"Tournament", 'Int'>
    readonly price: FieldRef<"Tournament", 'Float'>
    readonly structure: FieldRef<"Tournament", 'String'>
    readonly lodgingAtVenue: FieldRef<"Tournament", 'Boolean'>
    readonly ruleset: FieldRef<"Tournament", 'String'>
    readonly mealsIncluded: FieldRef<"Tournament", 'Boolean'>
    readonly fridayArrival: FieldRef<"Tournament", 'Boolean'>
    readonly gameEdition: FieldRef<"Tournament", 'String'>
    readonly organizerId: FieldRef<"Tournament", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Tournament findUnique
   */
  export type TournamentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * Filter, which Tournament to fetch.
     */
    where: TournamentWhereUniqueInput
  }

  /**
   * Tournament findUniqueOrThrow
   */
  export type TournamentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * Filter, which Tournament to fetch.
     */
    where: TournamentWhereUniqueInput
  }

  /**
   * Tournament findFirst
   */
  export type TournamentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * Filter, which Tournament to fetch.
     */
    where?: TournamentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tournaments to fetch.
     */
    orderBy?: TournamentOrderByWithRelationInput | TournamentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tournaments.
     */
    cursor?: TournamentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tournaments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tournaments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tournaments.
     */
    distinct?: TournamentScalarFieldEnum | TournamentScalarFieldEnum[]
  }

  /**
   * Tournament findFirstOrThrow
   */
  export type TournamentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * Filter, which Tournament to fetch.
     */
    where?: TournamentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tournaments to fetch.
     */
    orderBy?: TournamentOrderByWithRelationInput | TournamentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tournaments.
     */
    cursor?: TournamentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tournaments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tournaments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tournaments.
     */
    distinct?: TournamentScalarFieldEnum | TournamentScalarFieldEnum[]
  }

  /**
   * Tournament findMany
   */
  export type TournamentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * Filter, which Tournaments to fetch.
     */
    where?: TournamentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tournaments to fetch.
     */
    orderBy?: TournamentOrderByWithRelationInput | TournamentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tournaments.
     */
    cursor?: TournamentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tournaments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tournaments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tournaments.
     */
    distinct?: TournamentScalarFieldEnum | TournamentScalarFieldEnum[]
  }

  /**
   * Tournament create
   */
  export type TournamentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * The data needed to create a Tournament.
     */
    data: XOR<TournamentCreateInput, TournamentUncheckedCreateInput>
  }

  /**
   * Tournament createMany
   */
  export type TournamentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tournaments.
     */
    data: TournamentCreateManyInput | TournamentCreateManyInput[]
  }

  /**
   * Tournament createManyAndReturn
   */
  export type TournamentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * The data used to create many Tournaments.
     */
    data: TournamentCreateManyInput | TournamentCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tournament update
   */
  export type TournamentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * The data needed to update a Tournament.
     */
    data: XOR<TournamentUpdateInput, TournamentUncheckedUpdateInput>
    /**
     * Choose, which Tournament to update.
     */
    where: TournamentWhereUniqueInput
  }

  /**
   * Tournament updateMany
   */
  export type TournamentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tournaments.
     */
    data: XOR<TournamentUpdateManyMutationInput, TournamentUncheckedUpdateManyInput>
    /**
     * Filter which Tournaments to update
     */
    where?: TournamentWhereInput
    /**
     * Limit how many Tournaments to update.
     */
    limit?: number
  }

  /**
   * Tournament updateManyAndReturn
   */
  export type TournamentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * The data used to update Tournaments.
     */
    data: XOR<TournamentUpdateManyMutationInput, TournamentUncheckedUpdateManyInput>
    /**
     * Filter which Tournaments to update
     */
    where?: TournamentWhereInput
    /**
     * Limit how many Tournaments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Tournament upsert
   */
  export type TournamentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * The filter to search for the Tournament to update in case it exists.
     */
    where: TournamentWhereUniqueInput
    /**
     * In case the Tournament found by the `where` argument doesn't exist, create a new Tournament with this data.
     */
    create: XOR<TournamentCreateInput, TournamentUncheckedCreateInput>
    /**
     * In case the Tournament was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TournamentUpdateInput, TournamentUncheckedUpdateInput>
  }

  /**
   * Tournament delete
   */
  export type TournamentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
    /**
     * Filter which Tournament to delete.
     */
    where: TournamentWhereUniqueInput
  }

  /**
   * Tournament deleteMany
   */
  export type TournamentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tournaments to delete
     */
    where?: TournamentWhereInput
    /**
     * Limit how many Tournaments to delete.
     */
    limit?: number
  }

  /**
   * Tournament without action
   */
  export type TournamentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tournament
     */
    select?: TournamentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tournament
     */
    omit?: TournamentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TournamentInclude<ExtArgs> | null
  }


  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    order: number | null
  }

  export type CategorySumAggregateOutputType = {
    order: number | null
  }

  export type CategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    order: number | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    order: number | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    name: number
    description: number
    order: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    order?: true
  }

  export type CategorySumAggregateInputType = {
    order?: true
  }

  export type CategoryMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    order?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    order?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    order?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: string
    name: string
    description: string | null
    order: number
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
    forums?: boolean | Category$forumsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
  }, ExtArgs["result"]["category"]>

  export type CategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
  }, ExtArgs["result"]["category"]>

  export type CategorySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
  }

  export type CategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "order", ExtArgs["result"]["category"]>
  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    forums?: boolean | Category$forumsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      forums: Prisma.$ForumPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      order: number
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoryCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories and returns the data updated in the database.
     * @param {CategoryUpdateManyAndReturnArgs} args - Arguments to update many Categories.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, CategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    forums<T extends Category$forumsArgs<ExtArgs> = {}>(args?: Subset<T, Category$forumsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'String'>
    readonly name: FieldRef<"Category", 'String'>
    readonly description: FieldRef<"Category", 'String'>
    readonly order: FieldRef<"Category", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
  }

  /**
   * Category createManyAndReturn
   */
  export type CategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category updateManyAndReturn
   */
  export type CategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to delete.
     */
    limit?: number
  }

  /**
   * Category.forums
   */
  export type Category$forumsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    where?: ForumWhereInput
    orderBy?: ForumOrderByWithRelationInput | ForumOrderByWithRelationInput[]
    cursor?: ForumWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ForumScalarFieldEnum | ForumScalarFieldEnum[]
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
  }


  /**
   * Model Forum
   */

  export type AggregateForum = {
    _count: ForumCountAggregateOutputType | null
    _avg: ForumAvgAggregateOutputType | null
    _sum: ForumSumAggregateOutputType | null
    _min: ForumMinAggregateOutputType | null
    _max: ForumMaxAggregateOutputType | null
  }

  export type ForumAvgAggregateOutputType = {
    order: number | null
  }

  export type ForumSumAggregateOutputType = {
    order: number | null
  }

  export type ForumMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    order: number | null
    categoryId: string | null
    parentForumId: string | null
  }

  export type ForumMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    order: number | null
    categoryId: string | null
    parentForumId: string | null
  }

  export type ForumCountAggregateOutputType = {
    id: number
    name: number
    description: number
    order: number
    categoryId: number
    parentForumId: number
    _all: number
  }


  export type ForumAvgAggregateInputType = {
    order?: true
  }

  export type ForumSumAggregateInputType = {
    order?: true
  }

  export type ForumMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    order?: true
    categoryId?: true
    parentForumId?: true
  }

  export type ForumMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    order?: true
    categoryId?: true
    parentForumId?: true
  }

  export type ForumCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    order?: true
    categoryId?: true
    parentForumId?: true
    _all?: true
  }

  export type ForumAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Forum to aggregate.
     */
    where?: ForumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Forums to fetch.
     */
    orderBy?: ForumOrderByWithRelationInput | ForumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ForumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Forums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Forums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Forums
    **/
    _count?: true | ForumCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ForumAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ForumSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ForumMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ForumMaxAggregateInputType
  }

  export type GetForumAggregateType<T extends ForumAggregateArgs> = {
        [P in keyof T & keyof AggregateForum]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateForum[P]>
      : GetScalarType<T[P], AggregateForum[P]>
  }




  export type ForumGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ForumWhereInput
    orderBy?: ForumOrderByWithAggregationInput | ForumOrderByWithAggregationInput[]
    by: ForumScalarFieldEnum[] | ForumScalarFieldEnum
    having?: ForumScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ForumCountAggregateInputType | true
    _avg?: ForumAvgAggregateInputType
    _sum?: ForumSumAggregateInputType
    _min?: ForumMinAggregateInputType
    _max?: ForumMaxAggregateInputType
  }

  export type ForumGroupByOutputType = {
    id: string
    name: string
    description: string | null
    order: number
    categoryId: string | null
    parentForumId: string | null
    _count: ForumCountAggregateOutputType | null
    _avg: ForumAvgAggregateOutputType | null
    _sum: ForumSumAggregateOutputType | null
    _min: ForumMinAggregateOutputType | null
    _max: ForumMaxAggregateOutputType | null
  }

  type GetForumGroupByPayload<T extends ForumGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ForumGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ForumGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ForumGroupByOutputType[P]>
            : GetScalarType<T[P], ForumGroupByOutputType[P]>
        }
      >
    >


  export type ForumSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
    categoryId?: boolean
    parentForumId?: boolean
    category?: boolean | Forum$categoryArgs<ExtArgs>
    parentForum?: boolean | Forum$parentForumArgs<ExtArgs>
    subForums?: boolean | Forum$subForumsArgs<ExtArgs>
    topics?: boolean | Forum$topicsArgs<ExtArgs>
    _count?: boolean | ForumCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["forum"]>

  export type ForumSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
    categoryId?: boolean
    parentForumId?: boolean
    category?: boolean | Forum$categoryArgs<ExtArgs>
    parentForum?: boolean | Forum$parentForumArgs<ExtArgs>
  }, ExtArgs["result"]["forum"]>

  export type ForumSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
    categoryId?: boolean
    parentForumId?: boolean
    category?: boolean | Forum$categoryArgs<ExtArgs>
    parentForum?: boolean | Forum$parentForumArgs<ExtArgs>
  }, ExtArgs["result"]["forum"]>

  export type ForumSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    order?: boolean
    categoryId?: boolean
    parentForumId?: boolean
  }

  export type ForumOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "order" | "categoryId" | "parentForumId", ExtArgs["result"]["forum"]>
  export type ForumInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Forum$categoryArgs<ExtArgs>
    parentForum?: boolean | Forum$parentForumArgs<ExtArgs>
    subForums?: boolean | Forum$subForumsArgs<ExtArgs>
    topics?: boolean | Forum$topicsArgs<ExtArgs>
    _count?: boolean | ForumCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ForumIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Forum$categoryArgs<ExtArgs>
    parentForum?: boolean | Forum$parentForumArgs<ExtArgs>
  }
  export type ForumIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Forum$categoryArgs<ExtArgs>
    parentForum?: boolean | Forum$parentForumArgs<ExtArgs>
  }

  export type $ForumPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Forum"
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null
      parentForum: Prisma.$ForumPayload<ExtArgs> | null
      subForums: Prisma.$ForumPayload<ExtArgs>[]
      topics: Prisma.$TopicPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      order: number
      categoryId: string | null
      parentForumId: string | null
    }, ExtArgs["result"]["forum"]>
    composites: {}
  }

  type ForumGetPayload<S extends boolean | null | undefined | ForumDefaultArgs> = $Result.GetResult<Prisma.$ForumPayload, S>

  type ForumCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ForumFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ForumCountAggregateInputType | true
    }

  export interface ForumDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Forum'], meta: { name: 'Forum' } }
    /**
     * Find zero or one Forum that matches the filter.
     * @param {ForumFindUniqueArgs} args - Arguments to find a Forum
     * @example
     * // Get one Forum
     * const forum = await prisma.forum.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ForumFindUniqueArgs>(args: SelectSubset<T, ForumFindUniqueArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Forum that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ForumFindUniqueOrThrowArgs} args - Arguments to find a Forum
     * @example
     * // Get one Forum
     * const forum = await prisma.forum.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ForumFindUniqueOrThrowArgs>(args: SelectSubset<T, ForumFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Forum that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumFindFirstArgs} args - Arguments to find a Forum
     * @example
     * // Get one Forum
     * const forum = await prisma.forum.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ForumFindFirstArgs>(args?: SelectSubset<T, ForumFindFirstArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Forum that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumFindFirstOrThrowArgs} args - Arguments to find a Forum
     * @example
     * // Get one Forum
     * const forum = await prisma.forum.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ForumFindFirstOrThrowArgs>(args?: SelectSubset<T, ForumFindFirstOrThrowArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Forums that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Forums
     * const forums = await prisma.forum.findMany()
     * 
     * // Get first 10 Forums
     * const forums = await prisma.forum.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const forumWithIdOnly = await prisma.forum.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ForumFindManyArgs>(args?: SelectSubset<T, ForumFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Forum.
     * @param {ForumCreateArgs} args - Arguments to create a Forum.
     * @example
     * // Create one Forum
     * const Forum = await prisma.forum.create({
     *   data: {
     *     // ... data to create a Forum
     *   }
     * })
     * 
     */
    create<T extends ForumCreateArgs>(args: SelectSubset<T, ForumCreateArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Forums.
     * @param {ForumCreateManyArgs} args - Arguments to create many Forums.
     * @example
     * // Create many Forums
     * const forum = await prisma.forum.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ForumCreateManyArgs>(args?: SelectSubset<T, ForumCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Forums and returns the data saved in the database.
     * @param {ForumCreateManyAndReturnArgs} args - Arguments to create many Forums.
     * @example
     * // Create many Forums
     * const forum = await prisma.forum.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Forums and only return the `id`
     * const forumWithIdOnly = await prisma.forum.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ForumCreateManyAndReturnArgs>(args?: SelectSubset<T, ForumCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Forum.
     * @param {ForumDeleteArgs} args - Arguments to delete one Forum.
     * @example
     * // Delete one Forum
     * const Forum = await prisma.forum.delete({
     *   where: {
     *     // ... filter to delete one Forum
     *   }
     * })
     * 
     */
    delete<T extends ForumDeleteArgs>(args: SelectSubset<T, ForumDeleteArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Forum.
     * @param {ForumUpdateArgs} args - Arguments to update one Forum.
     * @example
     * // Update one Forum
     * const forum = await prisma.forum.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ForumUpdateArgs>(args: SelectSubset<T, ForumUpdateArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Forums.
     * @param {ForumDeleteManyArgs} args - Arguments to filter Forums to delete.
     * @example
     * // Delete a few Forums
     * const { count } = await prisma.forum.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ForumDeleteManyArgs>(args?: SelectSubset<T, ForumDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Forums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Forums
     * const forum = await prisma.forum.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ForumUpdateManyArgs>(args: SelectSubset<T, ForumUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Forums and returns the data updated in the database.
     * @param {ForumUpdateManyAndReturnArgs} args - Arguments to update many Forums.
     * @example
     * // Update many Forums
     * const forum = await prisma.forum.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Forums and only return the `id`
     * const forumWithIdOnly = await prisma.forum.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ForumUpdateManyAndReturnArgs>(args: SelectSubset<T, ForumUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Forum.
     * @param {ForumUpsertArgs} args - Arguments to update or create a Forum.
     * @example
     * // Update or create a Forum
     * const forum = await prisma.forum.upsert({
     *   create: {
     *     // ... data to create a Forum
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Forum we want to update
     *   }
     * })
     */
    upsert<T extends ForumUpsertArgs>(args: SelectSubset<T, ForumUpsertArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Forums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumCountArgs} args - Arguments to filter Forums to count.
     * @example
     * // Count the number of Forums
     * const count = await prisma.forum.count({
     *   where: {
     *     // ... the filter for the Forums we want to count
     *   }
     * })
    **/
    count<T extends ForumCountArgs>(
      args?: Subset<T, ForumCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ForumCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Forum.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ForumAggregateArgs>(args: Subset<T, ForumAggregateArgs>): Prisma.PrismaPromise<GetForumAggregateType<T>>

    /**
     * Group by Forum.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ForumGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ForumGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ForumGroupByArgs['orderBy'] }
        : { orderBy?: ForumGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ForumGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetForumGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Forum model
   */
  readonly fields: ForumFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Forum.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ForumClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends Forum$categoryArgs<ExtArgs> = {}>(args?: Subset<T, Forum$categoryArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    parentForum<T extends Forum$parentForumArgs<ExtArgs> = {}>(args?: Subset<T, Forum$parentForumArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    subForums<T extends Forum$subForumsArgs<ExtArgs> = {}>(args?: Subset<T, Forum$subForumsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    topics<T extends Forum$topicsArgs<ExtArgs> = {}>(args?: Subset<T, Forum$topicsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Forum model
   */
  interface ForumFieldRefs {
    readonly id: FieldRef<"Forum", 'String'>
    readonly name: FieldRef<"Forum", 'String'>
    readonly description: FieldRef<"Forum", 'String'>
    readonly order: FieldRef<"Forum", 'Int'>
    readonly categoryId: FieldRef<"Forum", 'String'>
    readonly parentForumId: FieldRef<"Forum", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Forum findUnique
   */
  export type ForumFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * Filter, which Forum to fetch.
     */
    where: ForumWhereUniqueInput
  }

  /**
   * Forum findUniqueOrThrow
   */
  export type ForumFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * Filter, which Forum to fetch.
     */
    where: ForumWhereUniqueInput
  }

  /**
   * Forum findFirst
   */
  export type ForumFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * Filter, which Forum to fetch.
     */
    where?: ForumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Forums to fetch.
     */
    orderBy?: ForumOrderByWithRelationInput | ForumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Forums.
     */
    cursor?: ForumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Forums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Forums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Forums.
     */
    distinct?: ForumScalarFieldEnum | ForumScalarFieldEnum[]
  }

  /**
   * Forum findFirstOrThrow
   */
  export type ForumFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * Filter, which Forum to fetch.
     */
    where?: ForumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Forums to fetch.
     */
    orderBy?: ForumOrderByWithRelationInput | ForumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Forums.
     */
    cursor?: ForumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Forums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Forums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Forums.
     */
    distinct?: ForumScalarFieldEnum | ForumScalarFieldEnum[]
  }

  /**
   * Forum findMany
   */
  export type ForumFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * Filter, which Forums to fetch.
     */
    where?: ForumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Forums to fetch.
     */
    orderBy?: ForumOrderByWithRelationInput | ForumOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Forums.
     */
    cursor?: ForumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Forums from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Forums.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Forums.
     */
    distinct?: ForumScalarFieldEnum | ForumScalarFieldEnum[]
  }

  /**
   * Forum create
   */
  export type ForumCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * The data needed to create a Forum.
     */
    data: XOR<ForumCreateInput, ForumUncheckedCreateInput>
  }

  /**
   * Forum createMany
   */
  export type ForumCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Forums.
     */
    data: ForumCreateManyInput | ForumCreateManyInput[]
  }

  /**
   * Forum createManyAndReturn
   */
  export type ForumCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * The data used to create many Forums.
     */
    data: ForumCreateManyInput | ForumCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Forum update
   */
  export type ForumUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * The data needed to update a Forum.
     */
    data: XOR<ForumUpdateInput, ForumUncheckedUpdateInput>
    /**
     * Choose, which Forum to update.
     */
    where: ForumWhereUniqueInput
  }

  /**
   * Forum updateMany
   */
  export type ForumUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Forums.
     */
    data: XOR<ForumUpdateManyMutationInput, ForumUncheckedUpdateManyInput>
    /**
     * Filter which Forums to update
     */
    where?: ForumWhereInput
    /**
     * Limit how many Forums to update.
     */
    limit?: number
  }

  /**
   * Forum updateManyAndReturn
   */
  export type ForumUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * The data used to update Forums.
     */
    data: XOR<ForumUpdateManyMutationInput, ForumUncheckedUpdateManyInput>
    /**
     * Filter which Forums to update
     */
    where?: ForumWhereInput
    /**
     * Limit how many Forums to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Forum upsert
   */
  export type ForumUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * The filter to search for the Forum to update in case it exists.
     */
    where: ForumWhereUniqueInput
    /**
     * In case the Forum found by the `where` argument doesn't exist, create a new Forum with this data.
     */
    create: XOR<ForumCreateInput, ForumUncheckedCreateInput>
    /**
     * In case the Forum was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ForumUpdateInput, ForumUncheckedUpdateInput>
  }

  /**
   * Forum delete
   */
  export type ForumDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    /**
     * Filter which Forum to delete.
     */
    where: ForumWhereUniqueInput
  }

  /**
   * Forum deleteMany
   */
  export type ForumDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Forums to delete
     */
    where?: ForumWhereInput
    /**
     * Limit how many Forums to delete.
     */
    limit?: number
  }

  /**
   * Forum.category
   */
  export type Forum$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
  }

  /**
   * Forum.parentForum
   */
  export type Forum$parentForumArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    where?: ForumWhereInput
  }

  /**
   * Forum.subForums
   */
  export type Forum$subForumsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
    where?: ForumWhereInput
    orderBy?: ForumOrderByWithRelationInput | ForumOrderByWithRelationInput[]
    cursor?: ForumWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ForumScalarFieldEnum | ForumScalarFieldEnum[]
  }

  /**
   * Forum.topics
   */
  export type Forum$topicsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    where?: TopicWhereInput
    orderBy?: TopicOrderByWithRelationInput | TopicOrderByWithRelationInput[]
    cursor?: TopicWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TopicScalarFieldEnum | TopicScalarFieldEnum[]
  }

  /**
   * Forum without action
   */
  export type ForumDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Forum
     */
    select?: ForumSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Forum
     */
    omit?: ForumOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ForumInclude<ExtArgs> | null
  }


  /**
   * Model Topic
   */

  export type AggregateTopic = {
    _count: TopicCountAggregateOutputType | null
    _avg: TopicAvgAggregateOutputType | null
    _sum: TopicSumAggregateOutputType | null
    _min: TopicMinAggregateOutputType | null
    _max: TopicMaxAggregateOutputType | null
  }

  export type TopicAvgAggregateOutputType = {
    views: number | null
  }

  export type TopicSumAggregateOutputType = {
    views: number | null
  }

  export type TopicMinAggregateOutputType = {
    id: string | null
    title: string | null
    isLocked: boolean | null
    isSticky: boolean | null
    isArchived: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    views: number | null
    forumId: string | null
    authorId: string | null
  }

  export type TopicMaxAggregateOutputType = {
    id: string | null
    title: string | null
    isLocked: boolean | null
    isSticky: boolean | null
    isArchived: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    views: number | null
    forumId: string | null
    authorId: string | null
  }

  export type TopicCountAggregateOutputType = {
    id: number
    title: number
    isLocked: number
    isSticky: number
    isArchived: number
    createdAt: number
    updatedAt: number
    views: number
    forumId: number
    authorId: number
    _all: number
  }


  export type TopicAvgAggregateInputType = {
    views?: true
  }

  export type TopicSumAggregateInputType = {
    views?: true
  }

  export type TopicMinAggregateInputType = {
    id?: true
    title?: true
    isLocked?: true
    isSticky?: true
    isArchived?: true
    createdAt?: true
    updatedAt?: true
    views?: true
    forumId?: true
    authorId?: true
  }

  export type TopicMaxAggregateInputType = {
    id?: true
    title?: true
    isLocked?: true
    isSticky?: true
    isArchived?: true
    createdAt?: true
    updatedAt?: true
    views?: true
    forumId?: true
    authorId?: true
  }

  export type TopicCountAggregateInputType = {
    id?: true
    title?: true
    isLocked?: true
    isSticky?: true
    isArchived?: true
    createdAt?: true
    updatedAt?: true
    views?: true
    forumId?: true
    authorId?: true
    _all?: true
  }

  export type TopicAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Topic to aggregate.
     */
    where?: TopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Topics to fetch.
     */
    orderBy?: TopicOrderByWithRelationInput | TopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Topics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Topics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Topics
    **/
    _count?: true | TopicCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TopicAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TopicSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TopicMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TopicMaxAggregateInputType
  }

  export type GetTopicAggregateType<T extends TopicAggregateArgs> = {
        [P in keyof T & keyof AggregateTopic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTopic[P]>
      : GetScalarType<T[P], AggregateTopic[P]>
  }




  export type TopicGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicWhereInput
    orderBy?: TopicOrderByWithAggregationInput | TopicOrderByWithAggregationInput[]
    by: TopicScalarFieldEnum[] | TopicScalarFieldEnum
    having?: TopicScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TopicCountAggregateInputType | true
    _avg?: TopicAvgAggregateInputType
    _sum?: TopicSumAggregateInputType
    _min?: TopicMinAggregateInputType
    _max?: TopicMaxAggregateInputType
  }

  export type TopicGroupByOutputType = {
    id: string
    title: string
    isLocked: boolean
    isSticky: boolean
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
    views: number
    forumId: string
    authorId: string
    _count: TopicCountAggregateOutputType | null
    _avg: TopicAvgAggregateOutputType | null
    _sum: TopicSumAggregateOutputType | null
    _min: TopicMinAggregateOutputType | null
    _max: TopicMaxAggregateOutputType | null
  }

  type GetTopicGroupByPayload<T extends TopicGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TopicGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TopicGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TopicGroupByOutputType[P]>
            : GetScalarType<T[P], TopicGroupByOutputType[P]>
        }
      >
    >


  export type TopicSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    views?: boolean
    forumId?: boolean
    authorId?: boolean
    forum?: boolean | ForumDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    posts?: boolean | Topic$postsArgs<ExtArgs>
    topicViews?: boolean | Topic$topicViewsArgs<ExtArgs>
    _count?: boolean | TopicCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topic"]>

  export type TopicSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    views?: boolean
    forumId?: boolean
    authorId?: boolean
    forum?: boolean | ForumDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topic"]>

  export type TopicSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    views?: boolean
    forumId?: boolean
    authorId?: boolean
    forum?: boolean | ForumDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topic"]>

  export type TopicSelectScalar = {
    id?: boolean
    title?: boolean
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    views?: boolean
    forumId?: boolean
    authorId?: boolean
  }

  export type TopicOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "isLocked" | "isSticky" | "isArchived" | "createdAt" | "updatedAt" | "views" | "forumId" | "authorId", ExtArgs["result"]["topic"]>
  export type TopicInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    forum?: boolean | ForumDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    posts?: boolean | Topic$postsArgs<ExtArgs>
    topicViews?: boolean | Topic$topicViewsArgs<ExtArgs>
    _count?: boolean | TopicCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TopicIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    forum?: boolean | ForumDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type TopicIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    forum?: boolean | ForumDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $TopicPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Topic"
    objects: {
      forum: Prisma.$ForumPayload<ExtArgs>
      author: Prisma.$UserPayload<ExtArgs>
      posts: Prisma.$PostPayload<ExtArgs>[]
      topicViews: Prisma.$TopicViewPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      isLocked: boolean
      isSticky: boolean
      isArchived: boolean
      createdAt: Date
      updatedAt: Date
      views: number
      forumId: string
      authorId: string
    }, ExtArgs["result"]["topic"]>
    composites: {}
  }

  type TopicGetPayload<S extends boolean | null | undefined | TopicDefaultArgs> = $Result.GetResult<Prisma.$TopicPayload, S>

  type TopicCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TopicFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TopicCountAggregateInputType | true
    }

  export interface TopicDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Topic'], meta: { name: 'Topic' } }
    /**
     * Find zero or one Topic that matches the filter.
     * @param {TopicFindUniqueArgs} args - Arguments to find a Topic
     * @example
     * // Get one Topic
     * const topic = await prisma.topic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TopicFindUniqueArgs>(args: SelectSubset<T, TopicFindUniqueArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Topic that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TopicFindUniqueOrThrowArgs} args - Arguments to find a Topic
     * @example
     * // Get one Topic
     * const topic = await prisma.topic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TopicFindUniqueOrThrowArgs>(args: SelectSubset<T, TopicFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Topic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicFindFirstArgs} args - Arguments to find a Topic
     * @example
     * // Get one Topic
     * const topic = await prisma.topic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TopicFindFirstArgs>(args?: SelectSubset<T, TopicFindFirstArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Topic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicFindFirstOrThrowArgs} args - Arguments to find a Topic
     * @example
     * // Get one Topic
     * const topic = await prisma.topic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TopicFindFirstOrThrowArgs>(args?: SelectSubset<T, TopicFindFirstOrThrowArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Topics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Topics
     * const topics = await prisma.topic.findMany()
     * 
     * // Get first 10 Topics
     * const topics = await prisma.topic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const topicWithIdOnly = await prisma.topic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TopicFindManyArgs>(args?: SelectSubset<T, TopicFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Topic.
     * @param {TopicCreateArgs} args - Arguments to create a Topic.
     * @example
     * // Create one Topic
     * const Topic = await prisma.topic.create({
     *   data: {
     *     // ... data to create a Topic
     *   }
     * })
     * 
     */
    create<T extends TopicCreateArgs>(args: SelectSubset<T, TopicCreateArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Topics.
     * @param {TopicCreateManyArgs} args - Arguments to create many Topics.
     * @example
     * // Create many Topics
     * const topic = await prisma.topic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TopicCreateManyArgs>(args?: SelectSubset<T, TopicCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Topics and returns the data saved in the database.
     * @param {TopicCreateManyAndReturnArgs} args - Arguments to create many Topics.
     * @example
     * // Create many Topics
     * const topic = await prisma.topic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Topics and only return the `id`
     * const topicWithIdOnly = await prisma.topic.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TopicCreateManyAndReturnArgs>(args?: SelectSubset<T, TopicCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Topic.
     * @param {TopicDeleteArgs} args - Arguments to delete one Topic.
     * @example
     * // Delete one Topic
     * const Topic = await prisma.topic.delete({
     *   where: {
     *     // ... filter to delete one Topic
     *   }
     * })
     * 
     */
    delete<T extends TopicDeleteArgs>(args: SelectSubset<T, TopicDeleteArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Topic.
     * @param {TopicUpdateArgs} args - Arguments to update one Topic.
     * @example
     * // Update one Topic
     * const topic = await prisma.topic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TopicUpdateArgs>(args: SelectSubset<T, TopicUpdateArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Topics.
     * @param {TopicDeleteManyArgs} args - Arguments to filter Topics to delete.
     * @example
     * // Delete a few Topics
     * const { count } = await prisma.topic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TopicDeleteManyArgs>(args?: SelectSubset<T, TopicDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Topics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Topics
     * const topic = await prisma.topic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TopicUpdateManyArgs>(args: SelectSubset<T, TopicUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Topics and returns the data updated in the database.
     * @param {TopicUpdateManyAndReturnArgs} args - Arguments to update many Topics.
     * @example
     * // Update many Topics
     * const topic = await prisma.topic.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Topics and only return the `id`
     * const topicWithIdOnly = await prisma.topic.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TopicUpdateManyAndReturnArgs>(args: SelectSubset<T, TopicUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Topic.
     * @param {TopicUpsertArgs} args - Arguments to update or create a Topic.
     * @example
     * // Update or create a Topic
     * const topic = await prisma.topic.upsert({
     *   create: {
     *     // ... data to create a Topic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Topic we want to update
     *   }
     * })
     */
    upsert<T extends TopicUpsertArgs>(args: SelectSubset<T, TopicUpsertArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Topics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicCountArgs} args - Arguments to filter Topics to count.
     * @example
     * // Count the number of Topics
     * const count = await prisma.topic.count({
     *   where: {
     *     // ... the filter for the Topics we want to count
     *   }
     * })
    **/
    count<T extends TopicCountArgs>(
      args?: Subset<T, TopicCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TopicCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Topic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TopicAggregateArgs>(args: Subset<T, TopicAggregateArgs>): Prisma.PrismaPromise<GetTopicAggregateType<T>>

    /**
     * Group by Topic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TopicGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TopicGroupByArgs['orderBy'] }
        : { orderBy?: TopicGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TopicGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTopicGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Topic model
   */
  readonly fields: TopicFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Topic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TopicClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    forum<T extends ForumDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ForumDefaultArgs<ExtArgs>>): Prisma__ForumClient<$Result.GetResult<Prisma.$ForumPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    posts<T extends Topic$postsArgs<ExtArgs> = {}>(args?: Subset<T, Topic$postsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    topicViews<T extends Topic$topicViewsArgs<ExtArgs> = {}>(args?: Subset<T, Topic$topicViewsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Topic model
   */
  interface TopicFieldRefs {
    readonly id: FieldRef<"Topic", 'String'>
    readonly title: FieldRef<"Topic", 'String'>
    readonly isLocked: FieldRef<"Topic", 'Boolean'>
    readonly isSticky: FieldRef<"Topic", 'Boolean'>
    readonly isArchived: FieldRef<"Topic", 'Boolean'>
    readonly createdAt: FieldRef<"Topic", 'DateTime'>
    readonly updatedAt: FieldRef<"Topic", 'DateTime'>
    readonly views: FieldRef<"Topic", 'Int'>
    readonly forumId: FieldRef<"Topic", 'String'>
    readonly authorId: FieldRef<"Topic", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Topic findUnique
   */
  export type TopicFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * Filter, which Topic to fetch.
     */
    where: TopicWhereUniqueInput
  }

  /**
   * Topic findUniqueOrThrow
   */
  export type TopicFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * Filter, which Topic to fetch.
     */
    where: TopicWhereUniqueInput
  }

  /**
   * Topic findFirst
   */
  export type TopicFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * Filter, which Topic to fetch.
     */
    where?: TopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Topics to fetch.
     */
    orderBy?: TopicOrderByWithRelationInput | TopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Topics.
     */
    cursor?: TopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Topics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Topics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Topics.
     */
    distinct?: TopicScalarFieldEnum | TopicScalarFieldEnum[]
  }

  /**
   * Topic findFirstOrThrow
   */
  export type TopicFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * Filter, which Topic to fetch.
     */
    where?: TopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Topics to fetch.
     */
    orderBy?: TopicOrderByWithRelationInput | TopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Topics.
     */
    cursor?: TopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Topics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Topics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Topics.
     */
    distinct?: TopicScalarFieldEnum | TopicScalarFieldEnum[]
  }

  /**
   * Topic findMany
   */
  export type TopicFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * Filter, which Topics to fetch.
     */
    where?: TopicWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Topics to fetch.
     */
    orderBy?: TopicOrderByWithRelationInput | TopicOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Topics.
     */
    cursor?: TopicWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Topics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Topics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Topics.
     */
    distinct?: TopicScalarFieldEnum | TopicScalarFieldEnum[]
  }

  /**
   * Topic create
   */
  export type TopicCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * The data needed to create a Topic.
     */
    data: XOR<TopicCreateInput, TopicUncheckedCreateInput>
  }

  /**
   * Topic createMany
   */
  export type TopicCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Topics.
     */
    data: TopicCreateManyInput | TopicCreateManyInput[]
  }

  /**
   * Topic createManyAndReturn
   */
  export type TopicCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * The data used to create many Topics.
     */
    data: TopicCreateManyInput | TopicCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Topic update
   */
  export type TopicUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * The data needed to update a Topic.
     */
    data: XOR<TopicUpdateInput, TopicUncheckedUpdateInput>
    /**
     * Choose, which Topic to update.
     */
    where: TopicWhereUniqueInput
  }

  /**
   * Topic updateMany
   */
  export type TopicUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Topics.
     */
    data: XOR<TopicUpdateManyMutationInput, TopicUncheckedUpdateManyInput>
    /**
     * Filter which Topics to update
     */
    where?: TopicWhereInput
    /**
     * Limit how many Topics to update.
     */
    limit?: number
  }

  /**
   * Topic updateManyAndReturn
   */
  export type TopicUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * The data used to update Topics.
     */
    data: XOR<TopicUpdateManyMutationInput, TopicUncheckedUpdateManyInput>
    /**
     * Filter which Topics to update
     */
    where?: TopicWhereInput
    /**
     * Limit how many Topics to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Topic upsert
   */
  export type TopicUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * The filter to search for the Topic to update in case it exists.
     */
    where: TopicWhereUniqueInput
    /**
     * In case the Topic found by the `where` argument doesn't exist, create a new Topic with this data.
     */
    create: XOR<TopicCreateInput, TopicUncheckedCreateInput>
    /**
     * In case the Topic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TopicUpdateInput, TopicUncheckedUpdateInput>
  }

  /**
   * Topic delete
   */
  export type TopicDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
    /**
     * Filter which Topic to delete.
     */
    where: TopicWhereUniqueInput
  }

  /**
   * Topic deleteMany
   */
  export type TopicDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Topics to delete
     */
    where?: TopicWhereInput
    /**
     * Limit how many Topics to delete.
     */
    limit?: number
  }

  /**
   * Topic.posts
   */
  export type Topic$postsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    where?: PostWhereInput
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    cursor?: PostWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Topic.topicViews
   */
  export type Topic$topicViewsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    where?: TopicViewWhereInput
    orderBy?: TopicViewOrderByWithRelationInput | TopicViewOrderByWithRelationInput[]
    cursor?: TopicViewWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TopicViewScalarFieldEnum | TopicViewScalarFieldEnum[]
  }

  /**
   * Topic without action
   */
  export type TopicDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Topic
     */
    select?: TopicSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Topic
     */
    omit?: TopicOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicInclude<ExtArgs> | null
  }


  /**
   * Model Post
   */

  export type AggregatePost = {
    _count: PostCountAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  export type PostMinAggregateOutputType = {
    id: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    topicId: string | null
    authorId: string | null
    isModerated: boolean | null
    moderationReason: string | null
    moderatedBy: string | null
    isDeleted: boolean | null
  }

  export type PostMaxAggregateOutputType = {
    id: string | null
    content: string | null
    createdAt: Date | null
    updatedAt: Date | null
    topicId: string | null
    authorId: string | null
    isModerated: boolean | null
    moderationReason: string | null
    moderatedBy: string | null
    isDeleted: boolean | null
  }

  export type PostCountAggregateOutputType = {
    id: number
    content: number
    createdAt: number
    updatedAt: number
    topicId: number
    authorId: number
    isModerated: number
    moderationReason: number
    moderatedBy: number
    isDeleted: number
    _all: number
  }


  export type PostMinAggregateInputType = {
    id?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    topicId?: true
    authorId?: true
    isModerated?: true
    moderationReason?: true
    moderatedBy?: true
    isDeleted?: true
  }

  export type PostMaxAggregateInputType = {
    id?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    topicId?: true
    authorId?: true
    isModerated?: true
    moderationReason?: true
    moderatedBy?: true
    isDeleted?: true
  }

  export type PostCountAggregateInputType = {
    id?: true
    content?: true
    createdAt?: true
    updatedAt?: true
    topicId?: true
    authorId?: true
    isModerated?: true
    moderationReason?: true
    moderatedBy?: true
    isDeleted?: true
    _all?: true
  }

  export type PostAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Post to aggregate.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Posts
    **/
    _count?: true | PostCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostMaxAggregateInputType
  }

  export type GetPostAggregateType<T extends PostAggregateArgs> = {
        [P in keyof T & keyof AggregatePost]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePost[P]>
      : GetScalarType<T[P], AggregatePost[P]>
  }




  export type PostGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostWhereInput
    orderBy?: PostOrderByWithAggregationInput | PostOrderByWithAggregationInput[]
    by: PostScalarFieldEnum[] | PostScalarFieldEnum
    having?: PostScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostCountAggregateInputType | true
    _min?: PostMinAggregateInputType
    _max?: PostMaxAggregateInputType
  }

  export type PostGroupByOutputType = {
    id: string
    content: string
    createdAt: Date
    updatedAt: Date
    topicId: string
    authorId: string
    isModerated: boolean
    moderationReason: string | null
    moderatedBy: string | null
    isDeleted: boolean
    _count: PostCountAggregateOutputType | null
    _min: PostMinAggregateOutputType | null
    _max: PostMaxAggregateOutputType | null
  }

  type GetPostGroupByPayload<T extends PostGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostGroupByOutputType[P]>
            : GetScalarType<T[P], PostGroupByOutputType[P]>
        }
      >
    >


  export type PostSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    topicId?: boolean
    authorId?: boolean
    isModerated?: boolean
    moderationReason?: boolean
    moderatedBy?: boolean
    isDeleted?: boolean
    topic?: boolean | TopicDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    mentions?: boolean | Post$mentionsArgs<ExtArgs>
    moderator?: boolean | Post$moderatorArgs<ExtArgs>
    reactions?: boolean | Post$reactionsArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    topicId?: boolean
    authorId?: boolean
    isModerated?: boolean
    moderationReason?: boolean
    moderatedBy?: boolean
    isDeleted?: boolean
    topic?: boolean | TopicDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    moderator?: boolean | Post$moderatorArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    topicId?: boolean
    authorId?: boolean
    isModerated?: boolean
    moderationReason?: boolean
    moderatedBy?: boolean
    isDeleted?: boolean
    topic?: boolean | TopicDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    moderator?: boolean | Post$moderatorArgs<ExtArgs>
  }, ExtArgs["result"]["post"]>

  export type PostSelectScalar = {
    id?: boolean
    content?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    topicId?: boolean
    authorId?: boolean
    isModerated?: boolean
    moderationReason?: boolean
    moderatedBy?: boolean
    isDeleted?: boolean
  }

  export type PostOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "content" | "createdAt" | "updatedAt" | "topicId" | "authorId" | "isModerated" | "moderationReason" | "moderatedBy" | "isDeleted", ExtArgs["result"]["post"]>
  export type PostInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topic?: boolean | TopicDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    mentions?: boolean | Post$mentionsArgs<ExtArgs>
    moderator?: boolean | Post$moderatorArgs<ExtArgs>
    reactions?: boolean | Post$reactionsArgs<ExtArgs>
    _count?: boolean | PostCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PostIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topic?: boolean | TopicDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    moderator?: boolean | Post$moderatorArgs<ExtArgs>
  }
  export type PostIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    topic?: boolean | TopicDefaultArgs<ExtArgs>
    author?: boolean | UserDefaultArgs<ExtArgs>
    moderator?: boolean | Post$moderatorArgs<ExtArgs>
  }

  export type $PostPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Post"
    objects: {
      topic: Prisma.$TopicPayload<ExtArgs>
      author: Prisma.$UserPayload<ExtArgs>
      mentions: Prisma.$MentionPayload<ExtArgs>[]
      moderator: Prisma.$UserPayload<ExtArgs> | null
      reactions: Prisma.$PostReactionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      content: string
      createdAt: Date
      updatedAt: Date
      topicId: string
      authorId: string
      isModerated: boolean
      moderationReason: string | null
      moderatedBy: string | null
      isDeleted: boolean
    }, ExtArgs["result"]["post"]>
    composites: {}
  }

  type PostGetPayload<S extends boolean | null | undefined | PostDefaultArgs> = $Result.GetResult<Prisma.$PostPayload, S>

  type PostCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostCountAggregateInputType | true
    }

  export interface PostDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Post'], meta: { name: 'Post' } }
    /**
     * Find zero or one Post that matches the filter.
     * @param {PostFindUniqueArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostFindUniqueArgs>(args: SelectSubset<T, PostFindUniqueArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Post that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostFindUniqueOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostFindUniqueOrThrowArgs>(args: SelectSubset<T, PostFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostFindFirstArgs>(args?: SelectSubset<T, PostFindFirstArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Post that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindFirstOrThrowArgs} args - Arguments to find a Post
     * @example
     * // Get one Post
     * const post = await prisma.post.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostFindFirstOrThrowArgs>(args?: SelectSubset<T, PostFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Posts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Posts
     * const posts = await prisma.post.findMany()
     * 
     * // Get first 10 Posts
     * const posts = await prisma.post.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postWithIdOnly = await prisma.post.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostFindManyArgs>(args?: SelectSubset<T, PostFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Post.
     * @param {PostCreateArgs} args - Arguments to create a Post.
     * @example
     * // Create one Post
     * const Post = await prisma.post.create({
     *   data: {
     *     // ... data to create a Post
     *   }
     * })
     * 
     */
    create<T extends PostCreateArgs>(args: SelectSubset<T, PostCreateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Posts.
     * @param {PostCreateManyArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostCreateManyArgs>(args?: SelectSubset<T, PostCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Posts and returns the data saved in the database.
     * @param {PostCreateManyAndReturnArgs} args - Arguments to create many Posts.
     * @example
     * // Create many Posts
     * const post = await prisma.post.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PostCreateManyAndReturnArgs>(args?: SelectSubset<T, PostCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Post.
     * @param {PostDeleteArgs} args - Arguments to delete one Post.
     * @example
     * // Delete one Post
     * const Post = await prisma.post.delete({
     *   where: {
     *     // ... filter to delete one Post
     *   }
     * })
     * 
     */
    delete<T extends PostDeleteArgs>(args: SelectSubset<T, PostDeleteArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Post.
     * @param {PostUpdateArgs} args - Arguments to update one Post.
     * @example
     * // Update one Post
     * const post = await prisma.post.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostUpdateArgs>(args: SelectSubset<T, PostUpdateArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Posts.
     * @param {PostDeleteManyArgs} args - Arguments to filter Posts to delete.
     * @example
     * // Delete a few Posts
     * const { count } = await prisma.post.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostDeleteManyArgs>(args?: SelectSubset<T, PostDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostUpdateManyArgs>(args: SelectSubset<T, PostUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Posts and returns the data updated in the database.
     * @param {PostUpdateManyAndReturnArgs} args - Arguments to update many Posts.
     * @example
     * // Update many Posts
     * const post = await prisma.post.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Posts and only return the `id`
     * const postWithIdOnly = await prisma.post.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PostUpdateManyAndReturnArgs>(args: SelectSubset<T, PostUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Post.
     * @param {PostUpsertArgs} args - Arguments to update or create a Post.
     * @example
     * // Update or create a Post
     * const post = await prisma.post.upsert({
     *   create: {
     *     // ... data to create a Post
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Post we want to update
     *   }
     * })
     */
    upsert<T extends PostUpsertArgs>(args: SelectSubset<T, PostUpsertArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Posts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostCountArgs} args - Arguments to filter Posts to count.
     * @example
     * // Count the number of Posts
     * const count = await prisma.post.count({
     *   where: {
     *     // ... the filter for the Posts we want to count
     *   }
     * })
    **/
    count<T extends PostCountArgs>(
      args?: Subset<T, PostCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostAggregateArgs>(args: Subset<T, PostAggregateArgs>): Prisma.PrismaPromise<GetPostAggregateType<T>>

    /**
     * Group by Post.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostGroupByArgs['orderBy'] }
        : { orderBy?: PostGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Post model
   */
  readonly fields: PostFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Post.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    topic<T extends TopicDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TopicDefaultArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    author<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    mentions<T extends Post$mentionsArgs<ExtArgs> = {}>(args?: Subset<T, Post$mentionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    moderator<T extends Post$moderatorArgs<ExtArgs> = {}>(args?: Subset<T, Post$moderatorArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    reactions<T extends Post$reactionsArgs<ExtArgs> = {}>(args?: Subset<T, Post$reactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Post model
   */
  interface PostFieldRefs {
    readonly id: FieldRef<"Post", 'String'>
    readonly content: FieldRef<"Post", 'String'>
    readonly createdAt: FieldRef<"Post", 'DateTime'>
    readonly updatedAt: FieldRef<"Post", 'DateTime'>
    readonly topicId: FieldRef<"Post", 'String'>
    readonly authorId: FieldRef<"Post", 'String'>
    readonly isModerated: FieldRef<"Post", 'Boolean'>
    readonly moderationReason: FieldRef<"Post", 'String'>
    readonly moderatedBy: FieldRef<"Post", 'String'>
    readonly isDeleted: FieldRef<"Post", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Post findUnique
   */
  export type PostFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findUniqueOrThrow
   */
  export type PostFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post findFirst
   */
  export type PostFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findFirstOrThrow
   */
  export type PostFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Post to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post findMany
   */
  export type PostFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter, which Posts to fetch.
     */
    where?: PostWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Posts to fetch.
     */
    orderBy?: PostOrderByWithRelationInput | PostOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Posts.
     */
    cursor?: PostWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Posts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Posts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Posts.
     */
    distinct?: PostScalarFieldEnum | PostScalarFieldEnum[]
  }

  /**
   * Post create
   */
  export type PostCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to create a Post.
     */
    data: XOR<PostCreateInput, PostUncheckedCreateInput>
  }

  /**
   * Post createMany
   */
  export type PostCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
  }

  /**
   * Post createManyAndReturn
   */
  export type PostCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to create many Posts.
     */
    data: PostCreateManyInput | PostCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post update
   */
  export type PostUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The data needed to update a Post.
     */
    data: XOR<PostUpdateInput, PostUncheckedUpdateInput>
    /**
     * Choose, which Post to update.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post updateMany
   */
  export type PostUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
  }

  /**
   * Post updateManyAndReturn
   */
  export type PostUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * The data used to update Posts.
     */
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyInput>
    /**
     * Filter which Posts to update
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Post upsert
   */
  export type PostUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * The filter to search for the Post to update in case it exists.
     */
    where: PostWhereUniqueInput
    /**
     * In case the Post found by the `where` argument doesn't exist, create a new Post with this data.
     */
    create: XOR<PostCreateInput, PostUncheckedCreateInput>
    /**
     * In case the Post was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostUpdateInput, PostUncheckedUpdateInput>
  }

  /**
   * Post delete
   */
  export type PostDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
    /**
     * Filter which Post to delete.
     */
    where: PostWhereUniqueInput
  }

  /**
   * Post deleteMany
   */
  export type PostDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Posts to delete
     */
    where?: PostWhereInput
    /**
     * Limit how many Posts to delete.
     */
    limit?: number
  }

  /**
   * Post.mentions
   */
  export type Post$mentionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    where?: MentionWhereInput
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    cursor?: MentionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MentionScalarFieldEnum | MentionScalarFieldEnum[]
  }

  /**
   * Post.moderator
   */
  export type Post$moderatorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Post.reactions
   */
  export type Post$reactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    where?: PostReactionWhereInput
    orderBy?: PostReactionOrderByWithRelationInput | PostReactionOrderByWithRelationInput[]
    cursor?: PostReactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PostReactionScalarFieldEnum | PostReactionScalarFieldEnum[]
  }

  /**
   * Post without action
   */
  export type PostDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Post
     */
    select?: PostSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Post
     */
    omit?: PostOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostInclude<ExtArgs> | null
  }


  /**
   * Model Pm
   */

  export type AggregatePm = {
    _count: PmCountAggregateOutputType | null
    _min: PmMinAggregateOutputType | null
    _max: PmMaxAggregateOutputType | null
  }

  export type PmMinAggregateOutputType = {
    id: string | null
    senderId: string | null
    receiverId: string | null
    subject: string | null
    content: string | null
    createdAt: Date | null
    readAt: Date | null
  }

  export type PmMaxAggregateOutputType = {
    id: string | null
    senderId: string | null
    receiverId: string | null
    subject: string | null
    content: string | null
    createdAt: Date | null
    readAt: Date | null
  }

  export type PmCountAggregateOutputType = {
    id: number
    senderId: number
    receiverId: number
    subject: number
    content: number
    createdAt: number
    readAt: number
    _all: number
  }


  export type PmMinAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    subject?: true
    content?: true
    createdAt?: true
    readAt?: true
  }

  export type PmMaxAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    subject?: true
    content?: true
    createdAt?: true
    readAt?: true
  }

  export type PmCountAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    subject?: true
    content?: true
    createdAt?: true
    readAt?: true
    _all?: true
  }

  export type PmAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pm to aggregate.
     */
    where?: PmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pms to fetch.
     */
    orderBy?: PmOrderByWithRelationInput | PmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pms
    **/
    _count?: true | PmCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PmMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PmMaxAggregateInputType
  }

  export type GetPmAggregateType<T extends PmAggregateArgs> = {
        [P in keyof T & keyof AggregatePm]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePm[P]>
      : GetScalarType<T[P], AggregatePm[P]>
  }




  export type PmGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PmWhereInput
    orderBy?: PmOrderByWithAggregationInput | PmOrderByWithAggregationInput[]
    by: PmScalarFieldEnum[] | PmScalarFieldEnum
    having?: PmScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PmCountAggregateInputType | true
    _min?: PmMinAggregateInputType
    _max?: PmMaxAggregateInputType
  }

  export type PmGroupByOutputType = {
    id: string
    senderId: string
    receiverId: string
    subject: string
    content: string
    createdAt: Date
    readAt: Date | null
    _count: PmCountAggregateOutputType | null
    _min: PmMinAggregateOutputType | null
    _max: PmMaxAggregateOutputType | null
  }

  type GetPmGroupByPayload<T extends PmGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PmGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PmGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PmGroupByOutputType[P]>
            : GetScalarType<T[P], PmGroupByOutputType[P]>
        }
      >
    >


  export type PmSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    subject?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pm"]>

  export type PmSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    subject?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pm"]>

  export type PmSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    subject?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pm"]>

  export type PmSelectScalar = {
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    subject?: boolean
    content?: boolean
    createdAt?: boolean
    readAt?: boolean
  }

  export type PmOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "senderId" | "receiverId" | "subject" | "content" | "createdAt" | "readAt", ExtArgs["result"]["pm"]>
  export type PmInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PmIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PmIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sender?: boolean | UserDefaultArgs<ExtArgs>
    receiver?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PmPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pm"
    objects: {
      sender: Prisma.$UserPayload<ExtArgs>
      receiver: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      senderId: string
      receiverId: string
      subject: string
      content: string
      createdAt: Date
      readAt: Date | null
    }, ExtArgs["result"]["pm"]>
    composites: {}
  }

  type PmGetPayload<S extends boolean | null | undefined | PmDefaultArgs> = $Result.GetResult<Prisma.$PmPayload, S>

  type PmCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PmFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PmCountAggregateInputType | true
    }

  export interface PmDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pm'], meta: { name: 'Pm' } }
    /**
     * Find zero or one Pm that matches the filter.
     * @param {PmFindUniqueArgs} args - Arguments to find a Pm
     * @example
     * // Get one Pm
     * const pm = await prisma.pm.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PmFindUniqueArgs>(args: SelectSubset<T, PmFindUniqueArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Pm that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PmFindUniqueOrThrowArgs} args - Arguments to find a Pm
     * @example
     * // Get one Pm
     * const pm = await prisma.pm.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PmFindUniqueOrThrowArgs>(args: SelectSubset<T, PmFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pm that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmFindFirstArgs} args - Arguments to find a Pm
     * @example
     * // Get one Pm
     * const pm = await prisma.pm.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PmFindFirstArgs>(args?: SelectSubset<T, PmFindFirstArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Pm that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmFindFirstOrThrowArgs} args - Arguments to find a Pm
     * @example
     * // Get one Pm
     * const pm = await prisma.pm.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PmFindFirstOrThrowArgs>(args?: SelectSubset<T, PmFindFirstOrThrowArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Pms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pms
     * const pms = await prisma.pm.findMany()
     * 
     * // Get first 10 Pms
     * const pms = await prisma.pm.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pmWithIdOnly = await prisma.pm.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PmFindManyArgs>(args?: SelectSubset<T, PmFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Pm.
     * @param {PmCreateArgs} args - Arguments to create a Pm.
     * @example
     * // Create one Pm
     * const Pm = await prisma.pm.create({
     *   data: {
     *     // ... data to create a Pm
     *   }
     * })
     * 
     */
    create<T extends PmCreateArgs>(args: SelectSubset<T, PmCreateArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Pms.
     * @param {PmCreateManyArgs} args - Arguments to create many Pms.
     * @example
     * // Create many Pms
     * const pm = await prisma.pm.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PmCreateManyArgs>(args?: SelectSubset<T, PmCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pms and returns the data saved in the database.
     * @param {PmCreateManyAndReturnArgs} args - Arguments to create many Pms.
     * @example
     * // Create many Pms
     * const pm = await prisma.pm.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pms and only return the `id`
     * const pmWithIdOnly = await prisma.pm.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PmCreateManyAndReturnArgs>(args?: SelectSubset<T, PmCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Pm.
     * @param {PmDeleteArgs} args - Arguments to delete one Pm.
     * @example
     * // Delete one Pm
     * const Pm = await prisma.pm.delete({
     *   where: {
     *     // ... filter to delete one Pm
     *   }
     * })
     * 
     */
    delete<T extends PmDeleteArgs>(args: SelectSubset<T, PmDeleteArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Pm.
     * @param {PmUpdateArgs} args - Arguments to update one Pm.
     * @example
     * // Update one Pm
     * const pm = await prisma.pm.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PmUpdateArgs>(args: SelectSubset<T, PmUpdateArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Pms.
     * @param {PmDeleteManyArgs} args - Arguments to filter Pms to delete.
     * @example
     * // Delete a few Pms
     * const { count } = await prisma.pm.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PmDeleteManyArgs>(args?: SelectSubset<T, PmDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pms
     * const pm = await prisma.pm.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PmUpdateManyArgs>(args: SelectSubset<T, PmUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pms and returns the data updated in the database.
     * @param {PmUpdateManyAndReturnArgs} args - Arguments to update many Pms.
     * @example
     * // Update many Pms
     * const pm = await prisma.pm.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Pms and only return the `id`
     * const pmWithIdOnly = await prisma.pm.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PmUpdateManyAndReturnArgs>(args: SelectSubset<T, PmUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Pm.
     * @param {PmUpsertArgs} args - Arguments to update or create a Pm.
     * @example
     * // Update or create a Pm
     * const pm = await prisma.pm.upsert({
     *   create: {
     *     // ... data to create a Pm
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pm we want to update
     *   }
     * })
     */
    upsert<T extends PmUpsertArgs>(args: SelectSubset<T, PmUpsertArgs<ExtArgs>>): Prisma__PmClient<$Result.GetResult<Prisma.$PmPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Pms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmCountArgs} args - Arguments to filter Pms to count.
     * @example
     * // Count the number of Pms
     * const count = await prisma.pm.count({
     *   where: {
     *     // ... the filter for the Pms we want to count
     *   }
     * })
    **/
    count<T extends PmCountArgs>(
      args?: Subset<T, PmCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PmCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PmAggregateArgs>(args: Subset<T, PmAggregateArgs>): Prisma.PrismaPromise<GetPmAggregateType<T>>

    /**
     * Group by Pm.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PmGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PmGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PmGroupByArgs['orderBy'] }
        : { orderBy?: PmGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PmGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPmGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pm model
   */
  readonly fields: PmFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pm.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PmClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sender<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    receiver<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Pm model
   */
  interface PmFieldRefs {
    readonly id: FieldRef<"Pm", 'String'>
    readonly senderId: FieldRef<"Pm", 'String'>
    readonly receiverId: FieldRef<"Pm", 'String'>
    readonly subject: FieldRef<"Pm", 'String'>
    readonly content: FieldRef<"Pm", 'String'>
    readonly createdAt: FieldRef<"Pm", 'DateTime'>
    readonly readAt: FieldRef<"Pm", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Pm findUnique
   */
  export type PmFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * Filter, which Pm to fetch.
     */
    where: PmWhereUniqueInput
  }

  /**
   * Pm findUniqueOrThrow
   */
  export type PmFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * Filter, which Pm to fetch.
     */
    where: PmWhereUniqueInput
  }

  /**
   * Pm findFirst
   */
  export type PmFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * Filter, which Pm to fetch.
     */
    where?: PmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pms to fetch.
     */
    orderBy?: PmOrderByWithRelationInput | PmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pms.
     */
    cursor?: PmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pms.
     */
    distinct?: PmScalarFieldEnum | PmScalarFieldEnum[]
  }

  /**
   * Pm findFirstOrThrow
   */
  export type PmFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * Filter, which Pm to fetch.
     */
    where?: PmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pms to fetch.
     */
    orderBy?: PmOrderByWithRelationInput | PmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pms.
     */
    cursor?: PmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pms.
     */
    distinct?: PmScalarFieldEnum | PmScalarFieldEnum[]
  }

  /**
   * Pm findMany
   */
  export type PmFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * Filter, which Pms to fetch.
     */
    where?: PmWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pms to fetch.
     */
    orderBy?: PmOrderByWithRelationInput | PmOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pms.
     */
    cursor?: PmWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pms.
     */
    distinct?: PmScalarFieldEnum | PmScalarFieldEnum[]
  }

  /**
   * Pm create
   */
  export type PmCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * The data needed to create a Pm.
     */
    data: XOR<PmCreateInput, PmUncheckedCreateInput>
  }

  /**
   * Pm createMany
   */
  export type PmCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pms.
     */
    data: PmCreateManyInput | PmCreateManyInput[]
  }

  /**
   * Pm createManyAndReturn
   */
  export type PmCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * The data used to create many Pms.
     */
    data: PmCreateManyInput | PmCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pm update
   */
  export type PmUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * The data needed to update a Pm.
     */
    data: XOR<PmUpdateInput, PmUncheckedUpdateInput>
    /**
     * Choose, which Pm to update.
     */
    where: PmWhereUniqueInput
  }

  /**
   * Pm updateMany
   */
  export type PmUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pms.
     */
    data: XOR<PmUpdateManyMutationInput, PmUncheckedUpdateManyInput>
    /**
     * Filter which Pms to update
     */
    where?: PmWhereInput
    /**
     * Limit how many Pms to update.
     */
    limit?: number
  }

  /**
   * Pm updateManyAndReturn
   */
  export type PmUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * The data used to update Pms.
     */
    data: XOR<PmUpdateManyMutationInput, PmUncheckedUpdateManyInput>
    /**
     * Filter which Pms to update
     */
    where?: PmWhereInput
    /**
     * Limit how many Pms to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pm upsert
   */
  export type PmUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * The filter to search for the Pm to update in case it exists.
     */
    where: PmWhereUniqueInput
    /**
     * In case the Pm found by the `where` argument doesn't exist, create a new Pm with this data.
     */
    create: XOR<PmCreateInput, PmUncheckedCreateInput>
    /**
     * In case the Pm was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PmUpdateInput, PmUncheckedUpdateInput>
  }

  /**
   * Pm delete
   */
  export type PmDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
    /**
     * Filter which Pm to delete.
     */
    where: PmWhereUniqueInput
  }

  /**
   * Pm deleteMany
   */
  export type PmDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pms to delete
     */
    where?: PmWhereInput
    /**
     * Limit how many Pms to delete.
     */
    limit?: number
  }

  /**
   * Pm without action
   */
  export type PmDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pm
     */
    select?: PmSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Pm
     */
    omit?: PmOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PmInclude<ExtArgs> | null
  }


  /**
   * Model TopicView
   */

  export type AggregateTopicView = {
    _count: TopicViewCountAggregateOutputType | null
    _min: TopicViewMinAggregateOutputType | null
    _max: TopicViewMaxAggregateOutputType | null
  }

  export type TopicViewMinAggregateOutputType = {
    userId: string | null
    topicId: string | null
    lastViewedAt: Date | null
    lastPostId: string | null
  }

  export type TopicViewMaxAggregateOutputType = {
    userId: string | null
    topicId: string | null
    lastViewedAt: Date | null
    lastPostId: string | null
  }

  export type TopicViewCountAggregateOutputType = {
    userId: number
    topicId: number
    lastViewedAt: number
    lastPostId: number
    _all: number
  }


  export type TopicViewMinAggregateInputType = {
    userId?: true
    topicId?: true
    lastViewedAt?: true
    lastPostId?: true
  }

  export type TopicViewMaxAggregateInputType = {
    userId?: true
    topicId?: true
    lastViewedAt?: true
    lastPostId?: true
  }

  export type TopicViewCountAggregateInputType = {
    userId?: true
    topicId?: true
    lastViewedAt?: true
    lastPostId?: true
    _all?: true
  }

  export type TopicViewAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TopicView to aggregate.
     */
    where?: TopicViewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicViews to fetch.
     */
    orderBy?: TopicViewOrderByWithRelationInput | TopicViewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TopicViewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicViews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicViews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TopicViews
    **/
    _count?: true | TopicViewCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TopicViewMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TopicViewMaxAggregateInputType
  }

  export type GetTopicViewAggregateType<T extends TopicViewAggregateArgs> = {
        [P in keyof T & keyof AggregateTopicView]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTopicView[P]>
      : GetScalarType<T[P], AggregateTopicView[P]>
  }




  export type TopicViewGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TopicViewWhereInput
    orderBy?: TopicViewOrderByWithAggregationInput | TopicViewOrderByWithAggregationInput[]
    by: TopicViewScalarFieldEnum[] | TopicViewScalarFieldEnum
    having?: TopicViewScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TopicViewCountAggregateInputType | true
    _min?: TopicViewMinAggregateInputType
    _max?: TopicViewMaxAggregateInputType
  }

  export type TopicViewGroupByOutputType = {
    userId: string
    topicId: string
    lastViewedAt: Date
    lastPostId: string | null
    _count: TopicViewCountAggregateOutputType | null
    _min: TopicViewMinAggregateOutputType | null
    _max: TopicViewMaxAggregateOutputType | null
  }

  type GetTopicViewGroupByPayload<T extends TopicViewGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TopicViewGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TopicViewGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TopicViewGroupByOutputType[P]>
            : GetScalarType<T[P], TopicViewGroupByOutputType[P]>
        }
      >
    >


  export type TopicViewSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    topicId?: boolean
    lastViewedAt?: boolean
    lastPostId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    topic?: boolean | TopicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topicView"]>

  export type TopicViewSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    topicId?: boolean
    lastViewedAt?: boolean
    lastPostId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    topic?: boolean | TopicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topicView"]>

  export type TopicViewSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    userId?: boolean
    topicId?: boolean
    lastViewedAt?: boolean
    lastPostId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    topic?: boolean | TopicDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["topicView"]>

  export type TopicViewSelectScalar = {
    userId?: boolean
    topicId?: boolean
    lastViewedAt?: boolean
    lastPostId?: boolean
  }

  export type TopicViewOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"userId" | "topicId" | "lastViewedAt" | "lastPostId", ExtArgs["result"]["topicView"]>
  export type TopicViewInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    topic?: boolean | TopicDefaultArgs<ExtArgs>
  }
  export type TopicViewIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    topic?: boolean | TopicDefaultArgs<ExtArgs>
  }
  export type TopicViewIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    topic?: boolean | TopicDefaultArgs<ExtArgs>
  }

  export type $TopicViewPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TopicView"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      topic: Prisma.$TopicPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      userId: string
      topicId: string
      lastViewedAt: Date
      lastPostId: string | null
    }, ExtArgs["result"]["topicView"]>
    composites: {}
  }

  type TopicViewGetPayload<S extends boolean | null | undefined | TopicViewDefaultArgs> = $Result.GetResult<Prisma.$TopicViewPayload, S>

  type TopicViewCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TopicViewFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TopicViewCountAggregateInputType | true
    }

  export interface TopicViewDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TopicView'], meta: { name: 'TopicView' } }
    /**
     * Find zero or one TopicView that matches the filter.
     * @param {TopicViewFindUniqueArgs} args - Arguments to find a TopicView
     * @example
     * // Get one TopicView
     * const topicView = await prisma.topicView.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TopicViewFindUniqueArgs>(args: SelectSubset<T, TopicViewFindUniqueArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TopicView that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TopicViewFindUniqueOrThrowArgs} args - Arguments to find a TopicView
     * @example
     * // Get one TopicView
     * const topicView = await prisma.topicView.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TopicViewFindUniqueOrThrowArgs>(args: SelectSubset<T, TopicViewFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TopicView that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewFindFirstArgs} args - Arguments to find a TopicView
     * @example
     * // Get one TopicView
     * const topicView = await prisma.topicView.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TopicViewFindFirstArgs>(args?: SelectSubset<T, TopicViewFindFirstArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TopicView that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewFindFirstOrThrowArgs} args - Arguments to find a TopicView
     * @example
     * // Get one TopicView
     * const topicView = await prisma.topicView.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TopicViewFindFirstOrThrowArgs>(args?: SelectSubset<T, TopicViewFindFirstOrThrowArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TopicViews that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TopicViews
     * const topicViews = await prisma.topicView.findMany()
     * 
     * // Get first 10 TopicViews
     * const topicViews = await prisma.topicView.findMany({ take: 10 })
     * 
     * // Only select the `userId`
     * const topicViewWithUserIdOnly = await prisma.topicView.findMany({ select: { userId: true } })
     * 
     */
    findMany<T extends TopicViewFindManyArgs>(args?: SelectSubset<T, TopicViewFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TopicView.
     * @param {TopicViewCreateArgs} args - Arguments to create a TopicView.
     * @example
     * // Create one TopicView
     * const TopicView = await prisma.topicView.create({
     *   data: {
     *     // ... data to create a TopicView
     *   }
     * })
     * 
     */
    create<T extends TopicViewCreateArgs>(args: SelectSubset<T, TopicViewCreateArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TopicViews.
     * @param {TopicViewCreateManyArgs} args - Arguments to create many TopicViews.
     * @example
     * // Create many TopicViews
     * const topicView = await prisma.topicView.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TopicViewCreateManyArgs>(args?: SelectSubset<T, TopicViewCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TopicViews and returns the data saved in the database.
     * @param {TopicViewCreateManyAndReturnArgs} args - Arguments to create many TopicViews.
     * @example
     * // Create many TopicViews
     * const topicView = await prisma.topicView.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TopicViews and only return the `userId`
     * const topicViewWithUserIdOnly = await prisma.topicView.createManyAndReturn({
     *   select: { userId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TopicViewCreateManyAndReturnArgs>(args?: SelectSubset<T, TopicViewCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TopicView.
     * @param {TopicViewDeleteArgs} args - Arguments to delete one TopicView.
     * @example
     * // Delete one TopicView
     * const TopicView = await prisma.topicView.delete({
     *   where: {
     *     // ... filter to delete one TopicView
     *   }
     * })
     * 
     */
    delete<T extends TopicViewDeleteArgs>(args: SelectSubset<T, TopicViewDeleteArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TopicView.
     * @param {TopicViewUpdateArgs} args - Arguments to update one TopicView.
     * @example
     * // Update one TopicView
     * const topicView = await prisma.topicView.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TopicViewUpdateArgs>(args: SelectSubset<T, TopicViewUpdateArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TopicViews.
     * @param {TopicViewDeleteManyArgs} args - Arguments to filter TopicViews to delete.
     * @example
     * // Delete a few TopicViews
     * const { count } = await prisma.topicView.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TopicViewDeleteManyArgs>(args?: SelectSubset<T, TopicViewDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TopicViews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TopicViews
     * const topicView = await prisma.topicView.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TopicViewUpdateManyArgs>(args: SelectSubset<T, TopicViewUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TopicViews and returns the data updated in the database.
     * @param {TopicViewUpdateManyAndReturnArgs} args - Arguments to update many TopicViews.
     * @example
     * // Update many TopicViews
     * const topicView = await prisma.topicView.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TopicViews and only return the `userId`
     * const topicViewWithUserIdOnly = await prisma.topicView.updateManyAndReturn({
     *   select: { userId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TopicViewUpdateManyAndReturnArgs>(args: SelectSubset<T, TopicViewUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TopicView.
     * @param {TopicViewUpsertArgs} args - Arguments to update or create a TopicView.
     * @example
     * // Update or create a TopicView
     * const topicView = await prisma.topicView.upsert({
     *   create: {
     *     // ... data to create a TopicView
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TopicView we want to update
     *   }
     * })
     */
    upsert<T extends TopicViewUpsertArgs>(args: SelectSubset<T, TopicViewUpsertArgs<ExtArgs>>): Prisma__TopicViewClient<$Result.GetResult<Prisma.$TopicViewPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TopicViews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewCountArgs} args - Arguments to filter TopicViews to count.
     * @example
     * // Count the number of TopicViews
     * const count = await prisma.topicView.count({
     *   where: {
     *     // ... the filter for the TopicViews we want to count
     *   }
     * })
    **/
    count<T extends TopicViewCountArgs>(
      args?: Subset<T, TopicViewCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TopicViewCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TopicView.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TopicViewAggregateArgs>(args: Subset<T, TopicViewAggregateArgs>): Prisma.PrismaPromise<GetTopicViewAggregateType<T>>

    /**
     * Group by TopicView.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TopicViewGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TopicViewGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TopicViewGroupByArgs['orderBy'] }
        : { orderBy?: TopicViewGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TopicViewGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTopicViewGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TopicView model
   */
  readonly fields: TopicViewFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TopicView.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TopicViewClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    topic<T extends TopicDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TopicDefaultArgs<ExtArgs>>): Prisma__TopicClient<$Result.GetResult<Prisma.$TopicPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TopicView model
   */
  interface TopicViewFieldRefs {
    readonly userId: FieldRef<"TopicView", 'String'>
    readonly topicId: FieldRef<"TopicView", 'String'>
    readonly lastViewedAt: FieldRef<"TopicView", 'DateTime'>
    readonly lastPostId: FieldRef<"TopicView", 'String'>
  }
    

  // Custom InputTypes
  /**
   * TopicView findUnique
   */
  export type TopicViewFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * Filter, which TopicView to fetch.
     */
    where: TopicViewWhereUniqueInput
  }

  /**
   * TopicView findUniqueOrThrow
   */
  export type TopicViewFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * Filter, which TopicView to fetch.
     */
    where: TopicViewWhereUniqueInput
  }

  /**
   * TopicView findFirst
   */
  export type TopicViewFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * Filter, which TopicView to fetch.
     */
    where?: TopicViewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicViews to fetch.
     */
    orderBy?: TopicViewOrderByWithRelationInput | TopicViewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TopicViews.
     */
    cursor?: TopicViewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicViews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicViews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TopicViews.
     */
    distinct?: TopicViewScalarFieldEnum | TopicViewScalarFieldEnum[]
  }

  /**
   * TopicView findFirstOrThrow
   */
  export type TopicViewFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * Filter, which TopicView to fetch.
     */
    where?: TopicViewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicViews to fetch.
     */
    orderBy?: TopicViewOrderByWithRelationInput | TopicViewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TopicViews.
     */
    cursor?: TopicViewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicViews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicViews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TopicViews.
     */
    distinct?: TopicViewScalarFieldEnum | TopicViewScalarFieldEnum[]
  }

  /**
   * TopicView findMany
   */
  export type TopicViewFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * Filter, which TopicViews to fetch.
     */
    where?: TopicViewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TopicViews to fetch.
     */
    orderBy?: TopicViewOrderByWithRelationInput | TopicViewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TopicViews.
     */
    cursor?: TopicViewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TopicViews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TopicViews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TopicViews.
     */
    distinct?: TopicViewScalarFieldEnum | TopicViewScalarFieldEnum[]
  }

  /**
   * TopicView create
   */
  export type TopicViewCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * The data needed to create a TopicView.
     */
    data: XOR<TopicViewCreateInput, TopicViewUncheckedCreateInput>
  }

  /**
   * TopicView createMany
   */
  export type TopicViewCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TopicViews.
     */
    data: TopicViewCreateManyInput | TopicViewCreateManyInput[]
  }

  /**
   * TopicView createManyAndReturn
   */
  export type TopicViewCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * The data used to create many TopicViews.
     */
    data: TopicViewCreateManyInput | TopicViewCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TopicView update
   */
  export type TopicViewUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * The data needed to update a TopicView.
     */
    data: XOR<TopicViewUpdateInput, TopicViewUncheckedUpdateInput>
    /**
     * Choose, which TopicView to update.
     */
    where: TopicViewWhereUniqueInput
  }

  /**
   * TopicView updateMany
   */
  export type TopicViewUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TopicViews.
     */
    data: XOR<TopicViewUpdateManyMutationInput, TopicViewUncheckedUpdateManyInput>
    /**
     * Filter which TopicViews to update
     */
    where?: TopicViewWhereInput
    /**
     * Limit how many TopicViews to update.
     */
    limit?: number
  }

  /**
   * TopicView updateManyAndReturn
   */
  export type TopicViewUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * The data used to update TopicViews.
     */
    data: XOR<TopicViewUpdateManyMutationInput, TopicViewUncheckedUpdateManyInput>
    /**
     * Filter which TopicViews to update
     */
    where?: TopicViewWhereInput
    /**
     * Limit how many TopicViews to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TopicView upsert
   */
  export type TopicViewUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * The filter to search for the TopicView to update in case it exists.
     */
    where: TopicViewWhereUniqueInput
    /**
     * In case the TopicView found by the `where` argument doesn't exist, create a new TopicView with this data.
     */
    create: XOR<TopicViewCreateInput, TopicViewUncheckedCreateInput>
    /**
     * In case the TopicView was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TopicViewUpdateInput, TopicViewUncheckedUpdateInput>
  }

  /**
   * TopicView delete
   */
  export type TopicViewDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
    /**
     * Filter which TopicView to delete.
     */
    where: TopicViewWhereUniqueInput
  }

  /**
   * TopicView deleteMany
   */
  export type TopicViewDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TopicViews to delete
     */
    where?: TopicViewWhereInput
    /**
     * Limit how many TopicViews to delete.
     */
    limit?: number
  }

  /**
   * TopicView without action
   */
  export type TopicViewDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TopicView
     */
    select?: TopicViewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TopicView
     */
    omit?: TopicViewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TopicViewInclude<ExtArgs> | null
  }


  /**
   * Model Mention
   */

  export type AggregateMention = {
    _count: MentionCountAggregateOutputType | null
    _min: MentionMinAggregateOutputType | null
    _max: MentionMaxAggregateOutputType | null
  }

  export type MentionMinAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    postId: string | null
    mentionerId: string | null
    mentionedUserId: string | null
    readAt: Date | null
  }

  export type MentionMaxAggregateOutputType = {
    id: string | null
    createdAt: Date | null
    postId: string | null
    mentionerId: string | null
    mentionedUserId: string | null
    readAt: Date | null
  }

  export type MentionCountAggregateOutputType = {
    id: number
    createdAt: number
    postId: number
    mentionerId: number
    mentionedUserId: number
    readAt: number
    _all: number
  }


  export type MentionMinAggregateInputType = {
    id?: true
    createdAt?: true
    postId?: true
    mentionerId?: true
    mentionedUserId?: true
    readAt?: true
  }

  export type MentionMaxAggregateInputType = {
    id?: true
    createdAt?: true
    postId?: true
    mentionerId?: true
    mentionedUserId?: true
    readAt?: true
  }

  export type MentionCountAggregateInputType = {
    id?: true
    createdAt?: true
    postId?: true
    mentionerId?: true
    mentionedUserId?: true
    readAt?: true
    _all?: true
  }

  export type MentionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Mention to aggregate.
     */
    where?: MentionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mentions to fetch.
     */
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MentionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mentions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mentions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Mentions
    **/
    _count?: true | MentionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MentionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MentionMaxAggregateInputType
  }

  export type GetMentionAggregateType<T extends MentionAggregateArgs> = {
        [P in keyof T & keyof AggregateMention]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMention[P]>
      : GetScalarType<T[P], AggregateMention[P]>
  }




  export type MentionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MentionWhereInput
    orderBy?: MentionOrderByWithAggregationInput | MentionOrderByWithAggregationInput[]
    by: MentionScalarFieldEnum[] | MentionScalarFieldEnum
    having?: MentionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MentionCountAggregateInputType | true
    _min?: MentionMinAggregateInputType
    _max?: MentionMaxAggregateInputType
  }

  export type MentionGroupByOutputType = {
    id: string
    createdAt: Date
    postId: string
    mentionerId: string
    mentionedUserId: string
    readAt: Date | null
    _count: MentionCountAggregateOutputType | null
    _min: MentionMinAggregateOutputType | null
    _max: MentionMaxAggregateOutputType | null
  }

  type GetMentionGroupByPayload<T extends MentionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MentionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MentionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MentionGroupByOutputType[P]>
            : GetScalarType<T[P], MentionGroupByOutputType[P]>
        }
      >
    >


  export type MentionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    postId?: boolean
    mentionerId?: boolean
    mentionedUserId?: boolean
    readAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    mentioner?: boolean | UserDefaultArgs<ExtArgs>
    mentionedUser?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mention"]>

  export type MentionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    postId?: boolean
    mentionerId?: boolean
    mentionedUserId?: boolean
    readAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    mentioner?: boolean | UserDefaultArgs<ExtArgs>
    mentionedUser?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mention"]>

  export type MentionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    createdAt?: boolean
    postId?: boolean
    mentionerId?: boolean
    mentionedUserId?: boolean
    readAt?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    mentioner?: boolean | UserDefaultArgs<ExtArgs>
    mentionedUser?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mention"]>

  export type MentionSelectScalar = {
    id?: boolean
    createdAt?: boolean
    postId?: boolean
    mentionerId?: boolean
    mentionedUserId?: boolean
    readAt?: boolean
  }

  export type MentionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "createdAt" | "postId" | "mentionerId" | "mentionedUserId" | "readAt", ExtArgs["result"]["mention"]>
  export type MentionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    mentioner?: boolean | UserDefaultArgs<ExtArgs>
    mentionedUser?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MentionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    mentioner?: boolean | UserDefaultArgs<ExtArgs>
    mentionedUser?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MentionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    mentioner?: boolean | UserDefaultArgs<ExtArgs>
    mentionedUser?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MentionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Mention"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
      mentioner: Prisma.$UserPayload<ExtArgs>
      mentionedUser: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      createdAt: Date
      postId: string
      mentionerId: string
      mentionedUserId: string
      readAt: Date | null
    }, ExtArgs["result"]["mention"]>
    composites: {}
  }

  type MentionGetPayload<S extends boolean | null | undefined | MentionDefaultArgs> = $Result.GetResult<Prisma.$MentionPayload, S>

  type MentionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MentionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MentionCountAggregateInputType | true
    }

  export interface MentionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Mention'], meta: { name: 'Mention' } }
    /**
     * Find zero or one Mention that matches the filter.
     * @param {MentionFindUniqueArgs} args - Arguments to find a Mention
     * @example
     * // Get one Mention
     * const mention = await prisma.mention.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MentionFindUniqueArgs>(args: SelectSubset<T, MentionFindUniqueArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Mention that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MentionFindUniqueOrThrowArgs} args - Arguments to find a Mention
     * @example
     * // Get one Mention
     * const mention = await prisma.mention.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MentionFindUniqueOrThrowArgs>(args: SelectSubset<T, MentionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Mention that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionFindFirstArgs} args - Arguments to find a Mention
     * @example
     * // Get one Mention
     * const mention = await prisma.mention.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MentionFindFirstArgs>(args?: SelectSubset<T, MentionFindFirstArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Mention that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionFindFirstOrThrowArgs} args - Arguments to find a Mention
     * @example
     * // Get one Mention
     * const mention = await prisma.mention.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MentionFindFirstOrThrowArgs>(args?: SelectSubset<T, MentionFindFirstOrThrowArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Mentions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Mentions
     * const mentions = await prisma.mention.findMany()
     * 
     * // Get first 10 Mentions
     * const mentions = await prisma.mention.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mentionWithIdOnly = await prisma.mention.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MentionFindManyArgs>(args?: SelectSubset<T, MentionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Mention.
     * @param {MentionCreateArgs} args - Arguments to create a Mention.
     * @example
     * // Create one Mention
     * const Mention = await prisma.mention.create({
     *   data: {
     *     // ... data to create a Mention
     *   }
     * })
     * 
     */
    create<T extends MentionCreateArgs>(args: SelectSubset<T, MentionCreateArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Mentions.
     * @param {MentionCreateManyArgs} args - Arguments to create many Mentions.
     * @example
     * // Create many Mentions
     * const mention = await prisma.mention.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MentionCreateManyArgs>(args?: SelectSubset<T, MentionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Mentions and returns the data saved in the database.
     * @param {MentionCreateManyAndReturnArgs} args - Arguments to create many Mentions.
     * @example
     * // Create many Mentions
     * const mention = await prisma.mention.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Mentions and only return the `id`
     * const mentionWithIdOnly = await prisma.mention.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MentionCreateManyAndReturnArgs>(args?: SelectSubset<T, MentionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Mention.
     * @param {MentionDeleteArgs} args - Arguments to delete one Mention.
     * @example
     * // Delete one Mention
     * const Mention = await prisma.mention.delete({
     *   where: {
     *     // ... filter to delete one Mention
     *   }
     * })
     * 
     */
    delete<T extends MentionDeleteArgs>(args: SelectSubset<T, MentionDeleteArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Mention.
     * @param {MentionUpdateArgs} args - Arguments to update one Mention.
     * @example
     * // Update one Mention
     * const mention = await prisma.mention.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MentionUpdateArgs>(args: SelectSubset<T, MentionUpdateArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Mentions.
     * @param {MentionDeleteManyArgs} args - Arguments to filter Mentions to delete.
     * @example
     * // Delete a few Mentions
     * const { count } = await prisma.mention.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MentionDeleteManyArgs>(args?: SelectSubset<T, MentionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Mentions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Mentions
     * const mention = await prisma.mention.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MentionUpdateManyArgs>(args: SelectSubset<T, MentionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Mentions and returns the data updated in the database.
     * @param {MentionUpdateManyAndReturnArgs} args - Arguments to update many Mentions.
     * @example
     * // Update many Mentions
     * const mention = await prisma.mention.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Mentions and only return the `id`
     * const mentionWithIdOnly = await prisma.mention.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MentionUpdateManyAndReturnArgs>(args: SelectSubset<T, MentionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Mention.
     * @param {MentionUpsertArgs} args - Arguments to update or create a Mention.
     * @example
     * // Update or create a Mention
     * const mention = await prisma.mention.upsert({
     *   create: {
     *     // ... data to create a Mention
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Mention we want to update
     *   }
     * })
     */
    upsert<T extends MentionUpsertArgs>(args: SelectSubset<T, MentionUpsertArgs<ExtArgs>>): Prisma__MentionClient<$Result.GetResult<Prisma.$MentionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Mentions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionCountArgs} args - Arguments to filter Mentions to count.
     * @example
     * // Count the number of Mentions
     * const count = await prisma.mention.count({
     *   where: {
     *     // ... the filter for the Mentions we want to count
     *   }
     * })
    **/
    count<T extends MentionCountArgs>(
      args?: Subset<T, MentionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MentionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Mention.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MentionAggregateArgs>(args: Subset<T, MentionAggregateArgs>): Prisma.PrismaPromise<GetMentionAggregateType<T>>

    /**
     * Group by Mention.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MentionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MentionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MentionGroupByArgs['orderBy'] }
        : { orderBy?: MentionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MentionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMentionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Mention model
   */
  readonly fields: MentionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Mention.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MentionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    mentioner<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    mentionedUser<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Mention model
   */
  interface MentionFieldRefs {
    readonly id: FieldRef<"Mention", 'String'>
    readonly createdAt: FieldRef<"Mention", 'DateTime'>
    readonly postId: FieldRef<"Mention", 'String'>
    readonly mentionerId: FieldRef<"Mention", 'String'>
    readonly mentionedUserId: FieldRef<"Mention", 'String'>
    readonly readAt: FieldRef<"Mention", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Mention findUnique
   */
  export type MentionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * Filter, which Mention to fetch.
     */
    where: MentionWhereUniqueInput
  }

  /**
   * Mention findUniqueOrThrow
   */
  export type MentionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * Filter, which Mention to fetch.
     */
    where: MentionWhereUniqueInput
  }

  /**
   * Mention findFirst
   */
  export type MentionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * Filter, which Mention to fetch.
     */
    where?: MentionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mentions to fetch.
     */
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Mentions.
     */
    cursor?: MentionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mentions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mentions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Mentions.
     */
    distinct?: MentionScalarFieldEnum | MentionScalarFieldEnum[]
  }

  /**
   * Mention findFirstOrThrow
   */
  export type MentionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * Filter, which Mention to fetch.
     */
    where?: MentionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mentions to fetch.
     */
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Mentions.
     */
    cursor?: MentionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mentions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mentions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Mentions.
     */
    distinct?: MentionScalarFieldEnum | MentionScalarFieldEnum[]
  }

  /**
   * Mention findMany
   */
  export type MentionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * Filter, which Mentions to fetch.
     */
    where?: MentionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Mentions to fetch.
     */
    orderBy?: MentionOrderByWithRelationInput | MentionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Mentions.
     */
    cursor?: MentionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Mentions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Mentions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Mentions.
     */
    distinct?: MentionScalarFieldEnum | MentionScalarFieldEnum[]
  }

  /**
   * Mention create
   */
  export type MentionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * The data needed to create a Mention.
     */
    data: XOR<MentionCreateInput, MentionUncheckedCreateInput>
  }

  /**
   * Mention createMany
   */
  export type MentionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Mentions.
     */
    data: MentionCreateManyInput | MentionCreateManyInput[]
  }

  /**
   * Mention createManyAndReturn
   */
  export type MentionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * The data used to create many Mentions.
     */
    data: MentionCreateManyInput | MentionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Mention update
   */
  export type MentionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * The data needed to update a Mention.
     */
    data: XOR<MentionUpdateInput, MentionUncheckedUpdateInput>
    /**
     * Choose, which Mention to update.
     */
    where: MentionWhereUniqueInput
  }

  /**
   * Mention updateMany
   */
  export type MentionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Mentions.
     */
    data: XOR<MentionUpdateManyMutationInput, MentionUncheckedUpdateManyInput>
    /**
     * Filter which Mentions to update
     */
    where?: MentionWhereInput
    /**
     * Limit how many Mentions to update.
     */
    limit?: number
  }

  /**
   * Mention updateManyAndReturn
   */
  export type MentionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * The data used to update Mentions.
     */
    data: XOR<MentionUpdateManyMutationInput, MentionUncheckedUpdateManyInput>
    /**
     * Filter which Mentions to update
     */
    where?: MentionWhereInput
    /**
     * Limit how many Mentions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Mention upsert
   */
  export type MentionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * The filter to search for the Mention to update in case it exists.
     */
    where: MentionWhereUniqueInput
    /**
     * In case the Mention found by the `where` argument doesn't exist, create a new Mention with this data.
     */
    create: XOR<MentionCreateInput, MentionUncheckedCreateInput>
    /**
     * In case the Mention was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MentionUpdateInput, MentionUncheckedUpdateInput>
  }

  /**
   * Mention delete
   */
  export type MentionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
    /**
     * Filter which Mention to delete.
     */
    where: MentionWhereUniqueInput
  }

  /**
   * Mention deleteMany
   */
  export type MentionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Mentions to delete
     */
    where?: MentionWhereInput
    /**
     * Limit how many Mentions to delete.
     */
    limit?: number
  }

  /**
   * Mention without action
   */
  export type MentionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Mention
     */
    select?: MentionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Mention
     */
    omit?: MentionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MentionInclude<ExtArgs> | null
  }


  /**
   * Model PostReaction
   */

  export type AggregatePostReaction = {
    _count: PostReactionCountAggregateOutputType | null
    _min: PostReactionMinAggregateOutputType | null
    _max: PostReactionMaxAggregateOutputType | null
  }

  export type PostReactionMinAggregateOutputType = {
    id: string | null
    emoji: string | null
    createdAt: Date | null
    postId: string | null
    userId: string | null
  }

  export type PostReactionMaxAggregateOutputType = {
    id: string | null
    emoji: string | null
    createdAt: Date | null
    postId: string | null
    userId: string | null
  }

  export type PostReactionCountAggregateOutputType = {
    id: number
    emoji: number
    createdAt: number
    postId: number
    userId: number
    _all: number
  }


  export type PostReactionMinAggregateInputType = {
    id?: true
    emoji?: true
    createdAt?: true
    postId?: true
    userId?: true
  }

  export type PostReactionMaxAggregateInputType = {
    id?: true
    emoji?: true
    createdAt?: true
    postId?: true
    userId?: true
  }

  export type PostReactionCountAggregateInputType = {
    id?: true
    emoji?: true
    createdAt?: true
    postId?: true
    userId?: true
    _all?: true
  }

  export type PostReactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PostReaction to aggregate.
     */
    where?: PostReactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostReactions to fetch.
     */
    orderBy?: PostReactionOrderByWithRelationInput | PostReactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PostReactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostReactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostReactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PostReactions
    **/
    _count?: true | PostReactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PostReactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PostReactionMaxAggregateInputType
  }

  export type GetPostReactionAggregateType<T extends PostReactionAggregateArgs> = {
        [P in keyof T & keyof AggregatePostReaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePostReaction[P]>
      : GetScalarType<T[P], AggregatePostReaction[P]>
  }




  export type PostReactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PostReactionWhereInput
    orderBy?: PostReactionOrderByWithAggregationInput | PostReactionOrderByWithAggregationInput[]
    by: PostReactionScalarFieldEnum[] | PostReactionScalarFieldEnum
    having?: PostReactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PostReactionCountAggregateInputType | true
    _min?: PostReactionMinAggregateInputType
    _max?: PostReactionMaxAggregateInputType
  }

  export type PostReactionGroupByOutputType = {
    id: string
    emoji: string
    createdAt: Date
    postId: string
    userId: string
    _count: PostReactionCountAggregateOutputType | null
    _min: PostReactionMinAggregateOutputType | null
    _max: PostReactionMaxAggregateOutputType | null
  }

  type GetPostReactionGroupByPayload<T extends PostReactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PostReactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PostReactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PostReactionGroupByOutputType[P]>
            : GetScalarType<T[P], PostReactionGroupByOutputType[P]>
        }
      >
    >


  export type PostReactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    emoji?: boolean
    createdAt?: boolean
    postId?: boolean
    userId?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["postReaction"]>

  export type PostReactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    emoji?: boolean
    createdAt?: boolean
    postId?: boolean
    userId?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["postReaction"]>

  export type PostReactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    emoji?: boolean
    createdAt?: boolean
    postId?: boolean
    userId?: boolean
    post?: boolean | PostDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["postReaction"]>

  export type PostReactionSelectScalar = {
    id?: boolean
    emoji?: boolean
    createdAt?: boolean
    postId?: boolean
    userId?: boolean
  }

  export type PostReactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "emoji" | "createdAt" | "postId" | "userId", ExtArgs["result"]["postReaction"]>
  export type PostReactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PostReactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PostReactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    post?: boolean | PostDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PostReactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PostReaction"
    objects: {
      post: Prisma.$PostPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      emoji: string
      createdAt: Date
      postId: string
      userId: string
    }, ExtArgs["result"]["postReaction"]>
    composites: {}
  }

  type PostReactionGetPayload<S extends boolean | null | undefined | PostReactionDefaultArgs> = $Result.GetResult<Prisma.$PostReactionPayload, S>

  type PostReactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PostReactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PostReactionCountAggregateInputType | true
    }

  export interface PostReactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PostReaction'], meta: { name: 'PostReaction' } }
    /**
     * Find zero or one PostReaction that matches the filter.
     * @param {PostReactionFindUniqueArgs} args - Arguments to find a PostReaction
     * @example
     * // Get one PostReaction
     * const postReaction = await prisma.postReaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PostReactionFindUniqueArgs>(args: SelectSubset<T, PostReactionFindUniqueArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PostReaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PostReactionFindUniqueOrThrowArgs} args - Arguments to find a PostReaction
     * @example
     * // Get one PostReaction
     * const postReaction = await prisma.postReaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PostReactionFindUniqueOrThrowArgs>(args: SelectSubset<T, PostReactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PostReaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionFindFirstArgs} args - Arguments to find a PostReaction
     * @example
     * // Get one PostReaction
     * const postReaction = await prisma.postReaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PostReactionFindFirstArgs>(args?: SelectSubset<T, PostReactionFindFirstArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PostReaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionFindFirstOrThrowArgs} args - Arguments to find a PostReaction
     * @example
     * // Get one PostReaction
     * const postReaction = await prisma.postReaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PostReactionFindFirstOrThrowArgs>(args?: SelectSubset<T, PostReactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PostReactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PostReactions
     * const postReactions = await prisma.postReaction.findMany()
     * 
     * // Get first 10 PostReactions
     * const postReactions = await prisma.postReaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const postReactionWithIdOnly = await prisma.postReaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PostReactionFindManyArgs>(args?: SelectSubset<T, PostReactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PostReaction.
     * @param {PostReactionCreateArgs} args - Arguments to create a PostReaction.
     * @example
     * // Create one PostReaction
     * const PostReaction = await prisma.postReaction.create({
     *   data: {
     *     // ... data to create a PostReaction
     *   }
     * })
     * 
     */
    create<T extends PostReactionCreateArgs>(args: SelectSubset<T, PostReactionCreateArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PostReactions.
     * @param {PostReactionCreateManyArgs} args - Arguments to create many PostReactions.
     * @example
     * // Create many PostReactions
     * const postReaction = await prisma.postReaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PostReactionCreateManyArgs>(args?: SelectSubset<T, PostReactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PostReactions and returns the data saved in the database.
     * @param {PostReactionCreateManyAndReturnArgs} args - Arguments to create many PostReactions.
     * @example
     * // Create many PostReactions
     * const postReaction = await prisma.postReaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PostReactions and only return the `id`
     * const postReactionWithIdOnly = await prisma.postReaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PostReactionCreateManyAndReturnArgs>(args?: SelectSubset<T, PostReactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PostReaction.
     * @param {PostReactionDeleteArgs} args - Arguments to delete one PostReaction.
     * @example
     * // Delete one PostReaction
     * const PostReaction = await prisma.postReaction.delete({
     *   where: {
     *     // ... filter to delete one PostReaction
     *   }
     * })
     * 
     */
    delete<T extends PostReactionDeleteArgs>(args: SelectSubset<T, PostReactionDeleteArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PostReaction.
     * @param {PostReactionUpdateArgs} args - Arguments to update one PostReaction.
     * @example
     * // Update one PostReaction
     * const postReaction = await prisma.postReaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PostReactionUpdateArgs>(args: SelectSubset<T, PostReactionUpdateArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PostReactions.
     * @param {PostReactionDeleteManyArgs} args - Arguments to filter PostReactions to delete.
     * @example
     * // Delete a few PostReactions
     * const { count } = await prisma.postReaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PostReactionDeleteManyArgs>(args?: SelectSubset<T, PostReactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PostReactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PostReactions
     * const postReaction = await prisma.postReaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PostReactionUpdateManyArgs>(args: SelectSubset<T, PostReactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PostReactions and returns the data updated in the database.
     * @param {PostReactionUpdateManyAndReturnArgs} args - Arguments to update many PostReactions.
     * @example
     * // Update many PostReactions
     * const postReaction = await prisma.postReaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PostReactions and only return the `id`
     * const postReactionWithIdOnly = await prisma.postReaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PostReactionUpdateManyAndReturnArgs>(args: SelectSubset<T, PostReactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PostReaction.
     * @param {PostReactionUpsertArgs} args - Arguments to update or create a PostReaction.
     * @example
     * // Update or create a PostReaction
     * const postReaction = await prisma.postReaction.upsert({
     *   create: {
     *     // ... data to create a PostReaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PostReaction we want to update
     *   }
     * })
     */
    upsert<T extends PostReactionUpsertArgs>(args: SelectSubset<T, PostReactionUpsertArgs<ExtArgs>>): Prisma__PostReactionClient<$Result.GetResult<Prisma.$PostReactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PostReactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionCountArgs} args - Arguments to filter PostReactions to count.
     * @example
     * // Count the number of PostReactions
     * const count = await prisma.postReaction.count({
     *   where: {
     *     // ... the filter for the PostReactions we want to count
     *   }
     * })
    **/
    count<T extends PostReactionCountArgs>(
      args?: Subset<T, PostReactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PostReactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PostReaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PostReactionAggregateArgs>(args: Subset<T, PostReactionAggregateArgs>): Prisma.PrismaPromise<GetPostReactionAggregateType<T>>

    /**
     * Group by PostReaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PostReactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PostReactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PostReactionGroupByArgs['orderBy'] }
        : { orderBy?: PostReactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PostReactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPostReactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PostReaction model
   */
  readonly fields: PostReactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PostReaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PostReactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    post<T extends PostDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PostDefaultArgs<ExtArgs>>): Prisma__PostClient<$Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PostReaction model
   */
  interface PostReactionFieldRefs {
    readonly id: FieldRef<"PostReaction", 'String'>
    readonly emoji: FieldRef<"PostReaction", 'String'>
    readonly createdAt: FieldRef<"PostReaction", 'DateTime'>
    readonly postId: FieldRef<"PostReaction", 'String'>
    readonly userId: FieldRef<"PostReaction", 'String'>
  }
    

  // Custom InputTypes
  /**
   * PostReaction findUnique
   */
  export type PostReactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * Filter, which PostReaction to fetch.
     */
    where: PostReactionWhereUniqueInput
  }

  /**
   * PostReaction findUniqueOrThrow
   */
  export type PostReactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * Filter, which PostReaction to fetch.
     */
    where: PostReactionWhereUniqueInput
  }

  /**
   * PostReaction findFirst
   */
  export type PostReactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * Filter, which PostReaction to fetch.
     */
    where?: PostReactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostReactions to fetch.
     */
    orderBy?: PostReactionOrderByWithRelationInput | PostReactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PostReactions.
     */
    cursor?: PostReactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostReactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostReactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostReactions.
     */
    distinct?: PostReactionScalarFieldEnum | PostReactionScalarFieldEnum[]
  }

  /**
   * PostReaction findFirstOrThrow
   */
  export type PostReactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * Filter, which PostReaction to fetch.
     */
    where?: PostReactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostReactions to fetch.
     */
    orderBy?: PostReactionOrderByWithRelationInput | PostReactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PostReactions.
     */
    cursor?: PostReactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostReactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostReactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostReactions.
     */
    distinct?: PostReactionScalarFieldEnum | PostReactionScalarFieldEnum[]
  }

  /**
   * PostReaction findMany
   */
  export type PostReactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * Filter, which PostReactions to fetch.
     */
    where?: PostReactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PostReactions to fetch.
     */
    orderBy?: PostReactionOrderByWithRelationInput | PostReactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PostReactions.
     */
    cursor?: PostReactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PostReactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PostReactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PostReactions.
     */
    distinct?: PostReactionScalarFieldEnum | PostReactionScalarFieldEnum[]
  }

  /**
   * PostReaction create
   */
  export type PostReactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * The data needed to create a PostReaction.
     */
    data: XOR<PostReactionCreateInput, PostReactionUncheckedCreateInput>
  }

  /**
   * PostReaction createMany
   */
  export type PostReactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PostReactions.
     */
    data: PostReactionCreateManyInput | PostReactionCreateManyInput[]
  }

  /**
   * PostReaction createManyAndReturn
   */
  export type PostReactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * The data used to create many PostReactions.
     */
    data: PostReactionCreateManyInput | PostReactionCreateManyInput[]
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PostReaction update
   */
  export type PostReactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * The data needed to update a PostReaction.
     */
    data: XOR<PostReactionUpdateInput, PostReactionUncheckedUpdateInput>
    /**
     * Choose, which PostReaction to update.
     */
    where: PostReactionWhereUniqueInput
  }

  /**
   * PostReaction updateMany
   */
  export type PostReactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PostReactions.
     */
    data: XOR<PostReactionUpdateManyMutationInput, PostReactionUncheckedUpdateManyInput>
    /**
     * Filter which PostReactions to update
     */
    where?: PostReactionWhereInput
    /**
     * Limit how many PostReactions to update.
     */
    limit?: number
  }

  /**
   * PostReaction updateManyAndReturn
   */
  export type PostReactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * The data used to update PostReactions.
     */
    data: XOR<PostReactionUpdateManyMutationInput, PostReactionUncheckedUpdateManyInput>
    /**
     * Filter which PostReactions to update
     */
    where?: PostReactionWhereInput
    /**
     * Limit how many PostReactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PostReaction upsert
   */
  export type PostReactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * The filter to search for the PostReaction to update in case it exists.
     */
    where: PostReactionWhereUniqueInput
    /**
     * In case the PostReaction found by the `where` argument doesn't exist, create a new PostReaction with this data.
     */
    create: XOR<PostReactionCreateInput, PostReactionUncheckedCreateInput>
    /**
     * In case the PostReaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PostReactionUpdateInput, PostReactionUncheckedUpdateInput>
  }

  /**
   * PostReaction delete
   */
  export type PostReactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
    /**
     * Filter which PostReaction to delete.
     */
    where: PostReactionWhereUniqueInput
  }

  /**
   * PostReaction deleteMany
   */
  export type PostReactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PostReactions to delete
     */
    where?: PostReactionWhereInput
    /**
     * Limit how many PostReactions to delete.
     */
    limit?: number
  }

  /**
   * PostReaction without action
   */
  export type PostReactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PostReaction
     */
    select?: PostReactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PostReaction
     */
    omit?: PostReactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PostReactionInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AccountScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    type: 'type',
    provider: 'provider',
    providerAccountId: 'providerAccountId',
    refresh_token: 'refresh_token',
    access_token: 'access_token',
    expires_at: 'expires_at',
    token_type: 'token_type',
    scope: 'scope',
    id_token: 'id_token',
    session_state: 'session_state'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    sessionToken: 'sessionToken',
    userId: 'userId',
    expires: 'expires'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    emailVerified: 'emailVerified',
    image: 'image',
    role: 'role'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const VerificationTokenScalarFieldEnum: {
    identifier: 'identifier',
    token: 'token',
    expires: 'expires'
  };

  export type VerificationTokenScalarFieldEnum = (typeof VerificationTokenScalarFieldEnum)[keyof typeof VerificationTokenScalarFieldEnum]


  export const TournamentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    date: 'date',
    location: 'location',
    ville: 'ville',
    departement: 'departement',
    region: 'region',
    description: 'description',
    maxParticipants: 'maxParticipants',
    currentParticipants: 'currentParticipants',
    preRegistered: 'preRegistered',
    days: 'days',
    totalMatches: 'totalMatches',
    price: 'price',
    structure: 'structure',
    lodgingAtVenue: 'lodgingAtVenue',
    ruleset: 'ruleset',
    mealsIncluded: 'mealsIncluded',
    fridayArrival: 'fridayArrival',
    gameEdition: 'gameEdition',
    organizerId: 'organizerId'
  };

  export type TournamentScalarFieldEnum = (typeof TournamentScalarFieldEnum)[keyof typeof TournamentScalarFieldEnum]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    order: 'order'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const ForumScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    order: 'order',
    categoryId: 'categoryId',
    parentForumId: 'parentForumId'
  };

  export type ForumScalarFieldEnum = (typeof ForumScalarFieldEnum)[keyof typeof ForumScalarFieldEnum]


  export const TopicScalarFieldEnum: {
    id: 'id',
    title: 'title',
    isLocked: 'isLocked',
    isSticky: 'isSticky',
    isArchived: 'isArchived',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    views: 'views',
    forumId: 'forumId',
    authorId: 'authorId'
  };

  export type TopicScalarFieldEnum = (typeof TopicScalarFieldEnum)[keyof typeof TopicScalarFieldEnum]


  export const PostScalarFieldEnum: {
    id: 'id',
    content: 'content',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    topicId: 'topicId',
    authorId: 'authorId',
    isModerated: 'isModerated',
    moderationReason: 'moderationReason',
    moderatedBy: 'moderatedBy',
    isDeleted: 'isDeleted'
  };

  export type PostScalarFieldEnum = (typeof PostScalarFieldEnum)[keyof typeof PostScalarFieldEnum]


  export const PmScalarFieldEnum: {
    id: 'id',
    senderId: 'senderId',
    receiverId: 'receiverId',
    subject: 'subject',
    content: 'content',
    createdAt: 'createdAt',
    readAt: 'readAt'
  };

  export type PmScalarFieldEnum = (typeof PmScalarFieldEnum)[keyof typeof PmScalarFieldEnum]


  export const TopicViewScalarFieldEnum: {
    userId: 'userId',
    topicId: 'topicId',
    lastViewedAt: 'lastViewedAt',
    lastPostId: 'lastPostId'
  };

  export type TopicViewScalarFieldEnum = (typeof TopicViewScalarFieldEnum)[keyof typeof TopicViewScalarFieldEnum]


  export const MentionScalarFieldEnum: {
    id: 'id',
    createdAt: 'createdAt',
    postId: 'postId',
    mentionerId: 'mentionerId',
    mentionedUserId: 'mentionedUserId',
    readAt: 'readAt'
  };

  export type MentionScalarFieldEnum = (typeof MentionScalarFieldEnum)[keyof typeof MentionScalarFieldEnum]


  export const PostReactionScalarFieldEnum: {
    id: 'id',
    emoji: 'emoji',
    createdAt: 'createdAt',
    postId: 'postId',
    userId: 'userId'
  };

  export type PostReactionScalarFieldEnum = (typeof PostReactionScalarFieldEnum)[keyof typeof PostReactionScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    provider_providerAccountId?: AccountProviderProviderAccountIdCompoundUniqueInput
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "provider_providerAccountId">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrderInput | SortOrder
    access_token?: SortOrderInput | SortOrder
    expires_at?: SortOrderInput | SortOrder
    token_type?: SortOrderInput | SortOrder
    scope?: SortOrderInput | SortOrder
    id_token?: SortOrderInput | SortOrder
    session_state?: SortOrderInput | SortOrder
    _count?: AccountCountOrderByAggregateInput
    _avg?: AccountAvgOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
    _sum?: AccountSumOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    userId?: StringWithAggregatesFilter<"Account"> | string
    type?: StringWithAggregatesFilter<"Account"> | string
    provider?: StringWithAggregatesFilter<"Account"> | string
    providerAccountId?: StringWithAggregatesFilter<"Account"> | string
    refresh_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    access_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    expires_at?: IntNullableWithAggregatesFilter<"Account"> | number | null
    token_type?: StringNullableWithAggregatesFilter<"Account"> | string | null
    scope?: StringNullableWithAggregatesFilter<"Account"> | string | null
    id_token?: StringNullableWithAggregatesFilter<"Account"> | string | null
    session_state?: StringNullableWithAggregatesFilter<"Account"> | string | null
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionToken?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "sessionToken">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    sessionToken?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    expires?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    email?: StringNullableFilter<"User"> | string | null
    emailVerified?: DateTimeNullableFilter<"User"> | Date | string | null
    image?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
    tournaments?: TournamentListRelationFilter
    topics?: TopicListRelationFilter
    posts?: PostListRelationFilter
    sentMessages?: PmListRelationFilter
    receivedMessages?: PmListRelationFilter
    topicViews?: TopicViewListRelationFilter
    mentionsMade?: MentionListRelationFilter
    mentionsReceived?: MentionListRelationFilter
    moderatedPosts?: PostListRelationFilter
    postReactions?: PostReactionListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    role?: SortOrder
    accounts?: AccountOrderByRelationAggregateInput
    sessions?: SessionOrderByRelationAggregateInput
    tournaments?: TournamentOrderByRelationAggregateInput
    topics?: TopicOrderByRelationAggregateInput
    posts?: PostOrderByRelationAggregateInput
    sentMessages?: PmOrderByRelationAggregateInput
    receivedMessages?: PmOrderByRelationAggregateInput
    topicViews?: TopicViewOrderByRelationAggregateInput
    mentionsMade?: MentionOrderByRelationAggregateInput
    mentionsReceived?: MentionOrderByRelationAggregateInput
    moderatedPosts?: PostOrderByRelationAggregateInput
    postReactions?: PostReactionOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    emailVerified?: DateTimeNullableFilter<"User"> | Date | string | null
    image?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    accounts?: AccountListRelationFilter
    sessions?: SessionListRelationFilter
    tournaments?: TournamentListRelationFilter
    topics?: TopicListRelationFilter
    posts?: PostListRelationFilter
    sentMessages?: PmListRelationFilter
    receivedMessages?: PmListRelationFilter
    topicViews?: TopicViewListRelationFilter
    mentionsMade?: MentionListRelationFilter
    mentionsReceived?: MentionListRelationFilter
    moderatedPosts?: PostListRelationFilter
    postReactions?: PostReactionListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    emailVerified?: SortOrderInput | SortOrder
    image?: SortOrderInput | SortOrder
    role?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringNullableWithAggregatesFilter<"User"> | string | null
    emailVerified?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    image?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
  }

  export type VerificationTokenWhereInput = {
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    token?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }

  export type VerificationTokenOrderByWithRelationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenWhereUniqueInput = Prisma.AtLeast<{
    token?: string
    identifier_token?: VerificationTokenIdentifierTokenCompoundUniqueInput
    AND?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    OR?: VerificationTokenWhereInput[]
    NOT?: VerificationTokenWhereInput | VerificationTokenWhereInput[]
    identifier?: StringFilter<"VerificationToken"> | string
    expires?: DateTimeFilter<"VerificationToken"> | Date | string
  }, "token" | "identifier_token">

  export type VerificationTokenOrderByWithAggregationInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
    _count?: VerificationTokenCountOrderByAggregateInput
    _max?: VerificationTokenMaxOrderByAggregateInput
    _min?: VerificationTokenMinOrderByAggregateInput
  }

  export type VerificationTokenScalarWhereWithAggregatesInput = {
    AND?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    OR?: VerificationTokenScalarWhereWithAggregatesInput[]
    NOT?: VerificationTokenScalarWhereWithAggregatesInput | VerificationTokenScalarWhereWithAggregatesInput[]
    identifier?: StringWithAggregatesFilter<"VerificationToken"> | string
    token?: StringWithAggregatesFilter<"VerificationToken"> | string
    expires?: DateTimeWithAggregatesFilter<"VerificationToken"> | Date | string
  }

  export type TournamentWhereInput = {
    AND?: TournamentWhereInput | TournamentWhereInput[]
    OR?: TournamentWhereInput[]
    NOT?: TournamentWhereInput | TournamentWhereInput[]
    id?: StringFilter<"Tournament"> | string
    name?: StringFilter<"Tournament"> | string
    date?: DateTimeFilter<"Tournament"> | Date | string
    location?: StringFilter<"Tournament"> | string
    ville?: StringNullableFilter<"Tournament"> | string | null
    departement?: StringNullableFilter<"Tournament"> | string | null
    region?: StringNullableFilter<"Tournament"> | string | null
    description?: StringNullableFilter<"Tournament"> | string | null
    maxParticipants?: IntNullableFilter<"Tournament"> | number | null
    currentParticipants?: IntFilter<"Tournament"> | number
    preRegistered?: IntFilter<"Tournament"> | number
    days?: StringNullableFilter<"Tournament"> | string | null
    totalMatches?: IntNullableFilter<"Tournament"> | number | null
    price?: FloatNullableFilter<"Tournament"> | number | null
    structure?: StringNullableFilter<"Tournament"> | string | null
    lodgingAtVenue?: BoolFilter<"Tournament"> | boolean
    ruleset?: StringNullableFilter<"Tournament"> | string | null
    mealsIncluded?: BoolFilter<"Tournament"> | boolean
    fridayArrival?: BoolFilter<"Tournament"> | boolean
    gameEdition?: StringNullableFilter<"Tournament"> | string | null
    organizerId?: StringFilter<"Tournament"> | string
    organizer?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type TournamentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    date?: SortOrder
    location?: SortOrder
    ville?: SortOrderInput | SortOrder
    departement?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    maxParticipants?: SortOrderInput | SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    days?: SortOrderInput | SortOrder
    totalMatches?: SortOrderInput | SortOrder
    price?: SortOrderInput | SortOrder
    structure?: SortOrderInput | SortOrder
    lodgingAtVenue?: SortOrder
    ruleset?: SortOrderInput | SortOrder
    mealsIncluded?: SortOrder
    fridayArrival?: SortOrder
    gameEdition?: SortOrderInput | SortOrder
    organizerId?: SortOrder
    organizer?: UserOrderByWithRelationInput
  }

  export type TournamentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TournamentWhereInput | TournamentWhereInput[]
    OR?: TournamentWhereInput[]
    NOT?: TournamentWhereInput | TournamentWhereInput[]
    name?: StringFilter<"Tournament"> | string
    date?: DateTimeFilter<"Tournament"> | Date | string
    location?: StringFilter<"Tournament"> | string
    ville?: StringNullableFilter<"Tournament"> | string | null
    departement?: StringNullableFilter<"Tournament"> | string | null
    region?: StringNullableFilter<"Tournament"> | string | null
    description?: StringNullableFilter<"Tournament"> | string | null
    maxParticipants?: IntNullableFilter<"Tournament"> | number | null
    currentParticipants?: IntFilter<"Tournament"> | number
    preRegistered?: IntFilter<"Tournament"> | number
    days?: StringNullableFilter<"Tournament"> | string | null
    totalMatches?: IntNullableFilter<"Tournament"> | number | null
    price?: FloatNullableFilter<"Tournament"> | number | null
    structure?: StringNullableFilter<"Tournament"> | string | null
    lodgingAtVenue?: BoolFilter<"Tournament"> | boolean
    ruleset?: StringNullableFilter<"Tournament"> | string | null
    mealsIncluded?: BoolFilter<"Tournament"> | boolean
    fridayArrival?: BoolFilter<"Tournament"> | boolean
    gameEdition?: StringNullableFilter<"Tournament"> | string | null
    organizerId?: StringFilter<"Tournament"> | string
    organizer?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type TournamentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    date?: SortOrder
    location?: SortOrder
    ville?: SortOrderInput | SortOrder
    departement?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    maxParticipants?: SortOrderInput | SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    days?: SortOrderInput | SortOrder
    totalMatches?: SortOrderInput | SortOrder
    price?: SortOrderInput | SortOrder
    structure?: SortOrderInput | SortOrder
    lodgingAtVenue?: SortOrder
    ruleset?: SortOrderInput | SortOrder
    mealsIncluded?: SortOrder
    fridayArrival?: SortOrder
    gameEdition?: SortOrderInput | SortOrder
    organizerId?: SortOrder
    _count?: TournamentCountOrderByAggregateInput
    _avg?: TournamentAvgOrderByAggregateInput
    _max?: TournamentMaxOrderByAggregateInput
    _min?: TournamentMinOrderByAggregateInput
    _sum?: TournamentSumOrderByAggregateInput
  }

  export type TournamentScalarWhereWithAggregatesInput = {
    AND?: TournamentScalarWhereWithAggregatesInput | TournamentScalarWhereWithAggregatesInput[]
    OR?: TournamentScalarWhereWithAggregatesInput[]
    NOT?: TournamentScalarWhereWithAggregatesInput | TournamentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tournament"> | string
    name?: StringWithAggregatesFilter<"Tournament"> | string
    date?: DateTimeWithAggregatesFilter<"Tournament"> | Date | string
    location?: StringWithAggregatesFilter<"Tournament"> | string
    ville?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    departement?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    region?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    description?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    maxParticipants?: IntNullableWithAggregatesFilter<"Tournament"> | number | null
    currentParticipants?: IntWithAggregatesFilter<"Tournament"> | number
    preRegistered?: IntWithAggregatesFilter<"Tournament"> | number
    days?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    totalMatches?: IntNullableWithAggregatesFilter<"Tournament"> | number | null
    price?: FloatNullableWithAggregatesFilter<"Tournament"> | number | null
    structure?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    lodgingAtVenue?: BoolWithAggregatesFilter<"Tournament"> | boolean
    ruleset?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    mealsIncluded?: BoolWithAggregatesFilter<"Tournament"> | boolean
    fridayArrival?: BoolWithAggregatesFilter<"Tournament"> | boolean
    gameEdition?: StringNullableWithAggregatesFilter<"Tournament"> | string | null
    organizerId?: StringWithAggregatesFilter<"Tournament"> | string
  }

  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: StringFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    description?: StringNullableFilter<"Category"> | string | null
    order?: IntFilter<"Category"> | number
    forums?: ForumListRelationFilter
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    order?: SortOrder
    forums?: ForumOrderByRelationAggregateInput
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    name?: StringFilter<"Category"> | string
    description?: StringNullableFilter<"Category"> | string | null
    order?: IntFilter<"Category"> | number
    forums?: ForumListRelationFilter
  }, "id">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    order?: SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _avg?: CategoryAvgOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
    _sum?: CategorySumOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Category"> | string
    name?: StringWithAggregatesFilter<"Category"> | string
    description?: StringNullableWithAggregatesFilter<"Category"> | string | null
    order?: IntWithAggregatesFilter<"Category"> | number
  }

  export type ForumWhereInput = {
    AND?: ForumWhereInput | ForumWhereInput[]
    OR?: ForumWhereInput[]
    NOT?: ForumWhereInput | ForumWhereInput[]
    id?: StringFilter<"Forum"> | string
    name?: StringFilter<"Forum"> | string
    description?: StringNullableFilter<"Forum"> | string | null
    order?: IntFilter<"Forum"> | number
    categoryId?: StringNullableFilter<"Forum"> | string | null
    parentForumId?: StringNullableFilter<"Forum"> | string | null
    category?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    parentForum?: XOR<ForumNullableScalarRelationFilter, ForumWhereInput> | null
    subForums?: ForumListRelationFilter
    topics?: TopicListRelationFilter
  }

  export type ForumOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    order?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    parentForumId?: SortOrderInput | SortOrder
    category?: CategoryOrderByWithRelationInput
    parentForum?: ForumOrderByWithRelationInput
    subForums?: ForumOrderByRelationAggregateInput
    topics?: TopicOrderByRelationAggregateInput
  }

  export type ForumWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ForumWhereInput | ForumWhereInput[]
    OR?: ForumWhereInput[]
    NOT?: ForumWhereInput | ForumWhereInput[]
    name?: StringFilter<"Forum"> | string
    description?: StringNullableFilter<"Forum"> | string | null
    order?: IntFilter<"Forum"> | number
    categoryId?: StringNullableFilter<"Forum"> | string | null
    parentForumId?: StringNullableFilter<"Forum"> | string | null
    category?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    parentForum?: XOR<ForumNullableScalarRelationFilter, ForumWhereInput> | null
    subForums?: ForumListRelationFilter
    topics?: TopicListRelationFilter
  }, "id">

  export type ForumOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    order?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    parentForumId?: SortOrderInput | SortOrder
    _count?: ForumCountOrderByAggregateInput
    _avg?: ForumAvgOrderByAggregateInput
    _max?: ForumMaxOrderByAggregateInput
    _min?: ForumMinOrderByAggregateInput
    _sum?: ForumSumOrderByAggregateInput
  }

  export type ForumScalarWhereWithAggregatesInput = {
    AND?: ForumScalarWhereWithAggregatesInput | ForumScalarWhereWithAggregatesInput[]
    OR?: ForumScalarWhereWithAggregatesInput[]
    NOT?: ForumScalarWhereWithAggregatesInput | ForumScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Forum"> | string
    name?: StringWithAggregatesFilter<"Forum"> | string
    description?: StringNullableWithAggregatesFilter<"Forum"> | string | null
    order?: IntWithAggregatesFilter<"Forum"> | number
    categoryId?: StringNullableWithAggregatesFilter<"Forum"> | string | null
    parentForumId?: StringNullableWithAggregatesFilter<"Forum"> | string | null
  }

  export type TopicWhereInput = {
    AND?: TopicWhereInput | TopicWhereInput[]
    OR?: TopicWhereInput[]
    NOT?: TopicWhereInput | TopicWhereInput[]
    id?: StringFilter<"Topic"> | string
    title?: StringFilter<"Topic"> | string
    isLocked?: BoolFilter<"Topic"> | boolean
    isSticky?: BoolFilter<"Topic"> | boolean
    isArchived?: BoolFilter<"Topic"> | boolean
    createdAt?: DateTimeFilter<"Topic"> | Date | string
    updatedAt?: DateTimeFilter<"Topic"> | Date | string
    views?: IntFilter<"Topic"> | number
    forumId?: StringFilter<"Topic"> | string
    authorId?: StringFilter<"Topic"> | string
    forum?: XOR<ForumScalarRelationFilter, ForumWhereInput>
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
    posts?: PostListRelationFilter
    topicViews?: TopicViewListRelationFilter
  }

  export type TopicOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    isLocked?: SortOrder
    isSticky?: SortOrder
    isArchived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    views?: SortOrder
    forumId?: SortOrder
    authorId?: SortOrder
    forum?: ForumOrderByWithRelationInput
    author?: UserOrderByWithRelationInput
    posts?: PostOrderByRelationAggregateInput
    topicViews?: TopicViewOrderByRelationAggregateInput
  }

  export type TopicWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TopicWhereInput | TopicWhereInput[]
    OR?: TopicWhereInput[]
    NOT?: TopicWhereInput | TopicWhereInput[]
    title?: StringFilter<"Topic"> | string
    isLocked?: BoolFilter<"Topic"> | boolean
    isSticky?: BoolFilter<"Topic"> | boolean
    isArchived?: BoolFilter<"Topic"> | boolean
    createdAt?: DateTimeFilter<"Topic"> | Date | string
    updatedAt?: DateTimeFilter<"Topic"> | Date | string
    views?: IntFilter<"Topic"> | number
    forumId?: StringFilter<"Topic"> | string
    authorId?: StringFilter<"Topic"> | string
    forum?: XOR<ForumScalarRelationFilter, ForumWhereInput>
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
    posts?: PostListRelationFilter
    topicViews?: TopicViewListRelationFilter
  }, "id">

  export type TopicOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    isLocked?: SortOrder
    isSticky?: SortOrder
    isArchived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    views?: SortOrder
    forumId?: SortOrder
    authorId?: SortOrder
    _count?: TopicCountOrderByAggregateInput
    _avg?: TopicAvgOrderByAggregateInput
    _max?: TopicMaxOrderByAggregateInput
    _min?: TopicMinOrderByAggregateInput
    _sum?: TopicSumOrderByAggregateInput
  }

  export type TopicScalarWhereWithAggregatesInput = {
    AND?: TopicScalarWhereWithAggregatesInput | TopicScalarWhereWithAggregatesInput[]
    OR?: TopicScalarWhereWithAggregatesInput[]
    NOT?: TopicScalarWhereWithAggregatesInput | TopicScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Topic"> | string
    title?: StringWithAggregatesFilter<"Topic"> | string
    isLocked?: BoolWithAggregatesFilter<"Topic"> | boolean
    isSticky?: BoolWithAggregatesFilter<"Topic"> | boolean
    isArchived?: BoolWithAggregatesFilter<"Topic"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Topic"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Topic"> | Date | string
    views?: IntWithAggregatesFilter<"Topic"> | number
    forumId?: StringWithAggregatesFilter<"Topic"> | string
    authorId?: StringWithAggregatesFilter<"Topic"> | string
  }

  export type PostWhereInput = {
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    id?: StringFilter<"Post"> | string
    content?: StringFilter<"Post"> | string
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    topicId?: StringFilter<"Post"> | string
    authorId?: StringFilter<"Post"> | string
    isModerated?: BoolFilter<"Post"> | boolean
    moderationReason?: StringNullableFilter<"Post"> | string | null
    moderatedBy?: StringNullableFilter<"Post"> | string | null
    isDeleted?: BoolFilter<"Post"> | boolean
    topic?: XOR<TopicScalarRelationFilter, TopicWhereInput>
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
    mentions?: MentionListRelationFilter
    moderator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    reactions?: PostReactionListRelationFilter
  }

  export type PostOrderByWithRelationInput = {
    id?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    topicId?: SortOrder
    authorId?: SortOrder
    isModerated?: SortOrder
    moderationReason?: SortOrderInput | SortOrder
    moderatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    topic?: TopicOrderByWithRelationInput
    author?: UserOrderByWithRelationInput
    mentions?: MentionOrderByRelationAggregateInput
    moderator?: UserOrderByWithRelationInput
    reactions?: PostReactionOrderByRelationAggregateInput
  }

  export type PostWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PostWhereInput | PostWhereInput[]
    OR?: PostWhereInput[]
    NOT?: PostWhereInput | PostWhereInput[]
    content?: StringFilter<"Post"> | string
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    topicId?: StringFilter<"Post"> | string
    authorId?: StringFilter<"Post"> | string
    isModerated?: BoolFilter<"Post"> | boolean
    moderationReason?: StringNullableFilter<"Post"> | string | null
    moderatedBy?: StringNullableFilter<"Post"> | string | null
    isDeleted?: BoolFilter<"Post"> | boolean
    topic?: XOR<TopicScalarRelationFilter, TopicWhereInput>
    author?: XOR<UserScalarRelationFilter, UserWhereInput>
    mentions?: MentionListRelationFilter
    moderator?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
    reactions?: PostReactionListRelationFilter
  }, "id">

  export type PostOrderByWithAggregationInput = {
    id?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    topicId?: SortOrder
    authorId?: SortOrder
    isModerated?: SortOrder
    moderationReason?: SortOrderInput | SortOrder
    moderatedBy?: SortOrderInput | SortOrder
    isDeleted?: SortOrder
    _count?: PostCountOrderByAggregateInput
    _max?: PostMaxOrderByAggregateInput
    _min?: PostMinOrderByAggregateInput
  }

  export type PostScalarWhereWithAggregatesInput = {
    AND?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    OR?: PostScalarWhereWithAggregatesInput[]
    NOT?: PostScalarWhereWithAggregatesInput | PostScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Post"> | string
    content?: StringWithAggregatesFilter<"Post"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Post"> | Date | string
    topicId?: StringWithAggregatesFilter<"Post"> | string
    authorId?: StringWithAggregatesFilter<"Post"> | string
    isModerated?: BoolWithAggregatesFilter<"Post"> | boolean
    moderationReason?: StringNullableWithAggregatesFilter<"Post"> | string | null
    moderatedBy?: StringNullableWithAggregatesFilter<"Post"> | string | null
    isDeleted?: BoolWithAggregatesFilter<"Post"> | boolean
  }

  export type PmWhereInput = {
    AND?: PmWhereInput | PmWhereInput[]
    OR?: PmWhereInput[]
    NOT?: PmWhereInput | PmWhereInput[]
    id?: StringFilter<"Pm"> | string
    senderId?: StringFilter<"Pm"> | string
    receiverId?: StringFilter<"Pm"> | string
    subject?: StringFilter<"Pm"> | string
    content?: StringFilter<"Pm"> | string
    createdAt?: DateTimeFilter<"Pm"> | Date | string
    readAt?: DateTimeNullableFilter<"Pm"> | Date | string | null
    sender?: XOR<UserScalarRelationFilter, UserWhereInput>
    receiver?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PmOrderByWithRelationInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrderInput | SortOrder
    sender?: UserOrderByWithRelationInput
    receiver?: UserOrderByWithRelationInput
  }

  export type PmWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PmWhereInput | PmWhereInput[]
    OR?: PmWhereInput[]
    NOT?: PmWhereInput | PmWhereInput[]
    senderId?: StringFilter<"Pm"> | string
    receiverId?: StringFilter<"Pm"> | string
    subject?: StringFilter<"Pm"> | string
    content?: StringFilter<"Pm"> | string
    createdAt?: DateTimeFilter<"Pm"> | Date | string
    readAt?: DateTimeNullableFilter<"Pm"> | Date | string | null
    sender?: XOR<UserScalarRelationFilter, UserWhereInput>
    receiver?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type PmOrderByWithAggregationInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrderInput | SortOrder
    _count?: PmCountOrderByAggregateInput
    _max?: PmMaxOrderByAggregateInput
    _min?: PmMinOrderByAggregateInput
  }

  export type PmScalarWhereWithAggregatesInput = {
    AND?: PmScalarWhereWithAggregatesInput | PmScalarWhereWithAggregatesInput[]
    OR?: PmScalarWhereWithAggregatesInput[]
    NOT?: PmScalarWhereWithAggregatesInput | PmScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Pm"> | string
    senderId?: StringWithAggregatesFilter<"Pm"> | string
    receiverId?: StringWithAggregatesFilter<"Pm"> | string
    subject?: StringWithAggregatesFilter<"Pm"> | string
    content?: StringWithAggregatesFilter<"Pm"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Pm"> | Date | string
    readAt?: DateTimeNullableWithAggregatesFilter<"Pm"> | Date | string | null
  }

  export type TopicViewWhereInput = {
    AND?: TopicViewWhereInput | TopicViewWhereInput[]
    OR?: TopicViewWhereInput[]
    NOT?: TopicViewWhereInput | TopicViewWhereInput[]
    userId?: StringFilter<"TopicView"> | string
    topicId?: StringFilter<"TopicView"> | string
    lastViewedAt?: DateTimeFilter<"TopicView"> | Date | string
    lastPostId?: StringNullableFilter<"TopicView"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    topic?: XOR<TopicScalarRelationFilter, TopicWhereInput>
  }

  export type TopicViewOrderByWithRelationInput = {
    userId?: SortOrder
    topicId?: SortOrder
    lastViewedAt?: SortOrder
    lastPostId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    topic?: TopicOrderByWithRelationInput
  }

  export type TopicViewWhereUniqueInput = Prisma.AtLeast<{
    userId_topicId?: TopicViewUserIdTopicIdCompoundUniqueInput
    AND?: TopicViewWhereInput | TopicViewWhereInput[]
    OR?: TopicViewWhereInput[]
    NOT?: TopicViewWhereInput | TopicViewWhereInput[]
    userId?: StringFilter<"TopicView"> | string
    topicId?: StringFilter<"TopicView"> | string
    lastViewedAt?: DateTimeFilter<"TopicView"> | Date | string
    lastPostId?: StringNullableFilter<"TopicView"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    topic?: XOR<TopicScalarRelationFilter, TopicWhereInput>
  }, "userId_topicId">

  export type TopicViewOrderByWithAggregationInput = {
    userId?: SortOrder
    topicId?: SortOrder
    lastViewedAt?: SortOrder
    lastPostId?: SortOrderInput | SortOrder
    _count?: TopicViewCountOrderByAggregateInput
    _max?: TopicViewMaxOrderByAggregateInput
    _min?: TopicViewMinOrderByAggregateInput
  }

  export type TopicViewScalarWhereWithAggregatesInput = {
    AND?: TopicViewScalarWhereWithAggregatesInput | TopicViewScalarWhereWithAggregatesInput[]
    OR?: TopicViewScalarWhereWithAggregatesInput[]
    NOT?: TopicViewScalarWhereWithAggregatesInput | TopicViewScalarWhereWithAggregatesInput[]
    userId?: StringWithAggregatesFilter<"TopicView"> | string
    topicId?: StringWithAggregatesFilter<"TopicView"> | string
    lastViewedAt?: DateTimeWithAggregatesFilter<"TopicView"> | Date | string
    lastPostId?: StringNullableWithAggregatesFilter<"TopicView"> | string | null
  }

  export type MentionWhereInput = {
    AND?: MentionWhereInput | MentionWhereInput[]
    OR?: MentionWhereInput[]
    NOT?: MentionWhereInput | MentionWhereInput[]
    id?: StringFilter<"Mention"> | string
    createdAt?: DateTimeFilter<"Mention"> | Date | string
    postId?: StringFilter<"Mention"> | string
    mentionerId?: StringFilter<"Mention"> | string
    mentionedUserId?: StringFilter<"Mention"> | string
    readAt?: DateTimeNullableFilter<"Mention"> | Date | string | null
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    mentioner?: XOR<UserScalarRelationFilter, UserWhereInput>
    mentionedUser?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type MentionOrderByWithRelationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    mentionerId?: SortOrder
    mentionedUserId?: SortOrder
    readAt?: SortOrderInput | SortOrder
    post?: PostOrderByWithRelationInput
    mentioner?: UserOrderByWithRelationInput
    mentionedUser?: UserOrderByWithRelationInput
  }

  export type MentionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    postId_mentionedUserId?: MentionPostIdMentionedUserIdCompoundUniqueInput
    AND?: MentionWhereInput | MentionWhereInput[]
    OR?: MentionWhereInput[]
    NOT?: MentionWhereInput | MentionWhereInput[]
    createdAt?: DateTimeFilter<"Mention"> | Date | string
    postId?: StringFilter<"Mention"> | string
    mentionerId?: StringFilter<"Mention"> | string
    mentionedUserId?: StringFilter<"Mention"> | string
    readAt?: DateTimeNullableFilter<"Mention"> | Date | string | null
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    mentioner?: XOR<UserScalarRelationFilter, UserWhereInput>
    mentionedUser?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "postId_mentionedUserId">

  export type MentionOrderByWithAggregationInput = {
    id?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    mentionerId?: SortOrder
    mentionedUserId?: SortOrder
    readAt?: SortOrderInput | SortOrder
    _count?: MentionCountOrderByAggregateInput
    _max?: MentionMaxOrderByAggregateInput
    _min?: MentionMinOrderByAggregateInput
  }

  export type MentionScalarWhereWithAggregatesInput = {
    AND?: MentionScalarWhereWithAggregatesInput | MentionScalarWhereWithAggregatesInput[]
    OR?: MentionScalarWhereWithAggregatesInput[]
    NOT?: MentionScalarWhereWithAggregatesInput | MentionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Mention"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Mention"> | Date | string
    postId?: StringWithAggregatesFilter<"Mention"> | string
    mentionerId?: StringWithAggregatesFilter<"Mention"> | string
    mentionedUserId?: StringWithAggregatesFilter<"Mention"> | string
    readAt?: DateTimeNullableWithAggregatesFilter<"Mention"> | Date | string | null
  }

  export type PostReactionWhereInput = {
    AND?: PostReactionWhereInput | PostReactionWhereInput[]
    OR?: PostReactionWhereInput[]
    NOT?: PostReactionWhereInput | PostReactionWhereInput[]
    id?: StringFilter<"PostReaction"> | string
    emoji?: StringFilter<"PostReaction"> | string
    createdAt?: DateTimeFilter<"PostReaction"> | Date | string
    postId?: StringFilter<"PostReaction"> | string
    userId?: StringFilter<"PostReaction"> | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type PostReactionOrderByWithRelationInput = {
    id?: SortOrder
    emoji?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    userId?: SortOrder
    post?: PostOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type PostReactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    postId_userId_emoji?: PostReactionPostIdUserIdEmojiCompoundUniqueInput
    AND?: PostReactionWhereInput | PostReactionWhereInput[]
    OR?: PostReactionWhereInput[]
    NOT?: PostReactionWhereInput | PostReactionWhereInput[]
    emoji?: StringFilter<"PostReaction"> | string
    createdAt?: DateTimeFilter<"PostReaction"> | Date | string
    postId?: StringFilter<"PostReaction"> | string
    userId?: StringFilter<"PostReaction"> | string
    post?: XOR<PostScalarRelationFilter, PostWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "postId_userId_emoji">

  export type PostReactionOrderByWithAggregationInput = {
    id?: SortOrder
    emoji?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    userId?: SortOrder
    _count?: PostReactionCountOrderByAggregateInput
    _max?: PostReactionMaxOrderByAggregateInput
    _min?: PostReactionMinOrderByAggregateInput
  }

  export type PostReactionScalarWhereWithAggregatesInput = {
    AND?: PostReactionScalarWhereWithAggregatesInput | PostReactionScalarWhereWithAggregatesInput[]
    OR?: PostReactionScalarWhereWithAggregatesInput[]
    NOT?: PostReactionScalarWhereWithAggregatesInput | PostReactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PostReaction"> | string
    emoji?: StringWithAggregatesFilter<"PostReaction"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PostReaction"> | Date | string
    postId?: StringWithAggregatesFilter<"PostReaction"> | string
    userId?: StringWithAggregatesFilter<"PostReaction"> | string
  }

  export type AccountCreateInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
    user: UserCreateNestedOneWithoutAccountsInput
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutAccountsNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountCreateManyInput = {
    id?: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionCreateInput = {
    id?: string
    sessionToken: string
    expires: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
  }

  export type VerificationTokenCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUncheckedCreateInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenCreateManyInput = {
    identifier: string
    token: string
    expires: Date | string
  }

  export type VerificationTokenUpdateManyMutationInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VerificationTokenUncheckedUpdateManyInput = {
    identifier?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TournamentCreateInput = {
    id?: string
    name: string
    date: Date | string
    location: string
    ville?: string | null
    departement?: string | null
    region?: string | null
    description?: string | null
    maxParticipants?: number | null
    currentParticipants?: number
    preRegistered?: number
    days?: string | null
    totalMatches?: number | null
    price?: number | null
    structure?: string | null
    lodgingAtVenue?: boolean
    ruleset?: string | null
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: string | null
    organizer: UserCreateNestedOneWithoutTournamentsInput
  }

  export type TournamentUncheckedCreateInput = {
    id?: string
    name: string
    date: Date | string
    location: string
    ville?: string | null
    departement?: string | null
    region?: string | null
    description?: string | null
    maxParticipants?: number | null
    currentParticipants?: number
    preRegistered?: number
    days?: string | null
    totalMatches?: number | null
    price?: number | null
    structure?: string | null
    lodgingAtVenue?: boolean
    ruleset?: string | null
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: string | null
    organizerId: string
  }

  export type TournamentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
    organizer?: UserUpdateOneRequiredWithoutTournamentsNestedInput
  }

  export type TournamentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
    organizerId?: StringFieldUpdateOperationsInput | string
  }

  export type TournamentCreateManyInput = {
    id?: string
    name: string
    date: Date | string
    location: string
    ville?: string | null
    departement?: string | null
    region?: string | null
    description?: string | null
    maxParticipants?: number | null
    currentParticipants?: number
    preRegistered?: number
    days?: string | null
    totalMatches?: number | null
    price?: number | null
    structure?: string | null
    lodgingAtVenue?: boolean
    ruleset?: string | null
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: string | null
    organizerId: string
  }

  export type TournamentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TournamentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
    organizerId?: StringFieldUpdateOperationsInput | string
  }

  export type CategoryCreateInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    forums?: ForumCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    forums?: ForumUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    forums?: ForumUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    forums?: ForumUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
  }

  export type CategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type CategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ForumCreateInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    category?: CategoryCreateNestedOneWithoutForumsInput
    parentForum?: ForumCreateNestedOneWithoutSubForumsInput
    subForums?: ForumCreateNestedManyWithoutParentForumInput
    topics?: TopicCreateNestedManyWithoutForumInput
  }

  export type ForumUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    categoryId?: string | null
    parentForumId?: string | null
    subForums?: ForumUncheckedCreateNestedManyWithoutParentForumInput
    topics?: TopicUncheckedCreateNestedManyWithoutForumInput
  }

  export type ForumUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    category?: CategoryUpdateOneWithoutForumsNestedInput
    parentForum?: ForumUpdateOneWithoutSubForumsNestedInput
    subForums?: ForumUpdateManyWithoutParentForumNestedInput
    topics?: TopicUpdateManyWithoutForumNestedInput
  }

  export type ForumUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    parentForumId?: NullableStringFieldUpdateOperationsInput | string | null
    subForums?: ForumUncheckedUpdateManyWithoutParentForumNestedInput
    topics?: TopicUncheckedUpdateManyWithoutForumNestedInput
  }

  export type ForumCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    categoryId?: string | null
    parentForumId?: string | null
  }

  export type ForumUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ForumUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    parentForumId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicCreateInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forum: ForumCreateNestedOneWithoutTopicsInput
    author: UserCreateNestedOneWithoutTopicsInput
    posts?: PostCreateNestedManyWithoutTopicInput
    topicViews?: TopicViewCreateNestedManyWithoutTopicInput
  }

  export type TopicUncheckedCreateInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forumId: string
    authorId: string
    posts?: PostUncheckedCreateNestedManyWithoutTopicInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TopicUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forum?: ForumUpdateOneRequiredWithoutTopicsNestedInput
    author?: UserUpdateOneRequiredWithoutTopicsNestedInput
    posts?: PostUpdateManyWithoutTopicNestedInput
    topicViews?: TopicViewUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forumId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    posts?: PostUncheckedUpdateManyWithoutTopicNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type TopicCreateManyInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forumId: string
    authorId: string
  }

  export type TopicUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
  }

  export type TopicUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forumId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type PostCreateInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    topic: TopicCreateNestedOneWithoutPostsInput
    author: UserCreateNestedOneWithoutPostsInput
    mentions?: MentionCreateNestedManyWithoutPostInput
    moderator?: UserCreateNestedOneWithoutModeratedPostsInput
    reactions?: PostReactionCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
    mentions?: MentionUncheckedCreateNestedManyWithoutPostInput
    reactions?: PostReactionUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    topic?: TopicUpdateOneRequiredWithoutPostsNestedInput
    author?: UserUpdateOneRequiredWithoutPostsNestedInput
    mentions?: MentionUpdateManyWithoutPostNestedInput
    moderator?: UserUpdateOneWithoutModeratedPostsNestedInput
    reactions?: PostReactionUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    mentions?: MentionUncheckedUpdateManyWithoutPostNestedInput
    reactions?: PostReactionUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostCreateManyInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
  }

  export type PostUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PostUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PmCreateInput = {
    id?: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
    sender: UserCreateNestedOneWithoutSentMessagesInput
    receiver: UserCreateNestedOneWithoutReceivedMessagesInput
  }

  export type PmUncheckedCreateInput = {
    id?: string
    senderId: string
    receiverId: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type PmUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sender?: UserUpdateOneRequiredWithoutSentMessagesNestedInput
    receiver?: UserUpdateOneRequiredWithoutReceivedMessagesNestedInput
  }

  export type PmUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    receiverId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PmCreateManyInput = {
    id?: string
    senderId: string
    receiverId: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type PmUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PmUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    receiverId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TopicViewCreateInput = {
    lastViewedAt?: Date | string
    lastPostId?: string | null
    user: UserCreateNestedOneWithoutTopicViewsInput
    topic: TopicCreateNestedOneWithoutTopicViewsInput
  }

  export type TopicViewUncheckedCreateInput = {
    userId: string
    topicId: string
    lastViewedAt?: Date | string
    lastPostId?: string | null
  }

  export type TopicViewUpdateInput = {
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutTopicViewsNestedInput
    topic?: TopicUpdateOneRequiredWithoutTopicViewsNestedInput
  }

  export type TopicViewUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    topicId?: StringFieldUpdateOperationsInput | string
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicViewCreateManyInput = {
    userId: string
    topicId: string
    lastViewedAt?: Date | string
    lastPostId?: string | null
  }

  export type TopicViewUpdateManyMutationInput = {
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicViewUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    topicId?: StringFieldUpdateOperationsInput | string
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MentionCreateInput = {
    id?: string
    createdAt?: Date | string
    readAt?: Date | string | null
    post: PostCreateNestedOneWithoutMentionsInput
    mentioner: UserCreateNestedOneWithoutMentionsMadeInput
    mentionedUser: UserCreateNestedOneWithoutMentionsReceivedInput
  }

  export type MentionUncheckedCreateInput = {
    id?: string
    createdAt?: Date | string
    postId: string
    mentionerId: string
    mentionedUserId: string
    readAt?: Date | string | null
  }

  export type MentionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    post?: PostUpdateOneRequiredWithoutMentionsNestedInput
    mentioner?: UserUpdateOneRequiredWithoutMentionsMadeNestedInput
    mentionedUser?: UserUpdateOneRequiredWithoutMentionsReceivedNestedInput
  }

  export type MentionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    mentionerId?: StringFieldUpdateOperationsInput | string
    mentionedUserId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MentionCreateManyInput = {
    id?: string
    createdAt?: Date | string
    postId: string
    mentionerId: string
    mentionedUserId: string
    readAt?: Date | string | null
  }

  export type MentionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MentionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    mentionerId?: StringFieldUpdateOperationsInput | string
    mentionedUserId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PostReactionCreateInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutReactionsInput
    user: UserCreateNestedOneWithoutPostReactionsInput
  }

  export type PostReactionUncheckedCreateInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    postId: string
    userId: string
  }

  export type PostReactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutReactionsNestedInput
    user?: UserUpdateOneRequiredWithoutPostReactionsNestedInput
  }

  export type PostReactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type PostReactionCreateManyInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    postId: string
    userId: string
  }

  export type PostReactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PostReactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AccountProviderProviderAccountIdCompoundUniqueInput = {
    provider: string
    providerAccountId: string
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
  }

  export type AccountAvgOrderByAggregateInput = {
    expires_at?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    type?: SortOrder
    provider?: SortOrder
    providerAccountId?: SortOrder
    refresh_token?: SortOrder
    access_token?: SortOrder
    expires_at?: SortOrder
    token_type?: SortOrder
    scope?: SortOrder
    id_token?: SortOrder
    session_state?: SortOrder
  }

  export type AccountSumOrderByAggregateInput = {
    expires_at?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type AccountListRelationFilter = {
    every?: AccountWhereInput
    some?: AccountWhereInput
    none?: AccountWhereInput
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type TournamentListRelationFilter = {
    every?: TournamentWhereInput
    some?: TournamentWhereInput
    none?: TournamentWhereInput
  }

  export type TopicListRelationFilter = {
    every?: TopicWhereInput
    some?: TopicWhereInput
    none?: TopicWhereInput
  }

  export type PostListRelationFilter = {
    every?: PostWhereInput
    some?: PostWhereInput
    none?: PostWhereInput
  }

  export type PmListRelationFilter = {
    every?: PmWhereInput
    some?: PmWhereInput
    none?: PmWhereInput
  }

  export type TopicViewListRelationFilter = {
    every?: TopicViewWhereInput
    some?: TopicViewWhereInput
    none?: TopicViewWhereInput
  }

  export type MentionListRelationFilter = {
    every?: MentionWhereInput
    some?: MentionWhereInput
    none?: MentionWhereInput
  }

  export type PostReactionListRelationFilter = {
    every?: PostReactionWhereInput
    some?: PostReactionWhereInput
    none?: PostReactionWhereInput
  }

  export type AccountOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TournamentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TopicOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PmOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TopicViewOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MentionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PostReactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    role?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    role?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    emailVerified?: SortOrder
    image?: SortOrder
    role?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type VerificationTokenIdentifierTokenCompoundUniqueInput = {
    identifier: string
    token: string
  }

  export type VerificationTokenCountOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMaxOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type VerificationTokenMinOrderByAggregateInput = {
    identifier?: SortOrder
    token?: SortOrder
    expires?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TournamentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    date?: SortOrder
    location?: SortOrder
    ville?: SortOrder
    departement?: SortOrder
    region?: SortOrder
    description?: SortOrder
    maxParticipants?: SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    days?: SortOrder
    totalMatches?: SortOrder
    price?: SortOrder
    structure?: SortOrder
    lodgingAtVenue?: SortOrder
    ruleset?: SortOrder
    mealsIncluded?: SortOrder
    fridayArrival?: SortOrder
    gameEdition?: SortOrder
    organizerId?: SortOrder
  }

  export type TournamentAvgOrderByAggregateInput = {
    maxParticipants?: SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    totalMatches?: SortOrder
    price?: SortOrder
  }

  export type TournamentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    date?: SortOrder
    location?: SortOrder
    ville?: SortOrder
    departement?: SortOrder
    region?: SortOrder
    description?: SortOrder
    maxParticipants?: SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    days?: SortOrder
    totalMatches?: SortOrder
    price?: SortOrder
    structure?: SortOrder
    lodgingAtVenue?: SortOrder
    ruleset?: SortOrder
    mealsIncluded?: SortOrder
    fridayArrival?: SortOrder
    gameEdition?: SortOrder
    organizerId?: SortOrder
  }

  export type TournamentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    date?: SortOrder
    location?: SortOrder
    ville?: SortOrder
    departement?: SortOrder
    region?: SortOrder
    description?: SortOrder
    maxParticipants?: SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    days?: SortOrder
    totalMatches?: SortOrder
    price?: SortOrder
    structure?: SortOrder
    lodgingAtVenue?: SortOrder
    ruleset?: SortOrder
    mealsIncluded?: SortOrder
    fridayArrival?: SortOrder
    gameEdition?: SortOrder
    organizerId?: SortOrder
  }

  export type TournamentSumOrderByAggregateInput = {
    maxParticipants?: SortOrder
    currentParticipants?: SortOrder
    preRegistered?: SortOrder
    totalMatches?: SortOrder
    price?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ForumListRelationFilter = {
    every?: ForumWhereInput
    some?: ForumWhereInput
    none?: ForumWhereInput
  }

  export type ForumOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    order?: SortOrder
  }

  export type CategoryAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    order?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    order?: SortOrder
  }

  export type CategorySumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type CategoryNullableScalarRelationFilter = {
    is?: CategoryWhereInput | null
    isNot?: CategoryWhereInput | null
  }

  export type ForumNullableScalarRelationFilter = {
    is?: ForumWhereInput | null
    isNot?: ForumWhereInput | null
  }

  export type ForumCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    order?: SortOrder
    categoryId?: SortOrder
    parentForumId?: SortOrder
  }

  export type ForumAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ForumMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    order?: SortOrder
    categoryId?: SortOrder
    parentForumId?: SortOrder
  }

  export type ForumMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    order?: SortOrder
    categoryId?: SortOrder
    parentForumId?: SortOrder
  }

  export type ForumSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type ForumScalarRelationFilter = {
    is?: ForumWhereInput
    isNot?: ForumWhereInput
  }

  export type TopicCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    isLocked?: SortOrder
    isSticky?: SortOrder
    isArchived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    views?: SortOrder
    forumId?: SortOrder
    authorId?: SortOrder
  }

  export type TopicAvgOrderByAggregateInput = {
    views?: SortOrder
  }

  export type TopicMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    isLocked?: SortOrder
    isSticky?: SortOrder
    isArchived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    views?: SortOrder
    forumId?: SortOrder
    authorId?: SortOrder
  }

  export type TopicMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    isLocked?: SortOrder
    isSticky?: SortOrder
    isArchived?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    views?: SortOrder
    forumId?: SortOrder
    authorId?: SortOrder
  }

  export type TopicSumOrderByAggregateInput = {
    views?: SortOrder
  }

  export type TopicScalarRelationFilter = {
    is?: TopicWhereInput
    isNot?: TopicWhereInput
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type PostCountOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    topicId?: SortOrder
    authorId?: SortOrder
    isModerated?: SortOrder
    moderationReason?: SortOrder
    moderatedBy?: SortOrder
    isDeleted?: SortOrder
  }

  export type PostMaxOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    topicId?: SortOrder
    authorId?: SortOrder
    isModerated?: SortOrder
    moderationReason?: SortOrder
    moderatedBy?: SortOrder
    isDeleted?: SortOrder
  }

  export type PostMinOrderByAggregateInput = {
    id?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    topicId?: SortOrder
    authorId?: SortOrder
    isModerated?: SortOrder
    moderationReason?: SortOrder
    moderatedBy?: SortOrder
    isDeleted?: SortOrder
  }

  export type PmCountOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrder
  }

  export type PmMaxOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrder
  }

  export type PmMinOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    subject?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    readAt?: SortOrder
  }

  export type TopicViewUserIdTopicIdCompoundUniqueInput = {
    userId: string
    topicId: string
  }

  export type TopicViewCountOrderByAggregateInput = {
    userId?: SortOrder
    topicId?: SortOrder
    lastViewedAt?: SortOrder
    lastPostId?: SortOrder
  }

  export type TopicViewMaxOrderByAggregateInput = {
    userId?: SortOrder
    topicId?: SortOrder
    lastViewedAt?: SortOrder
    lastPostId?: SortOrder
  }

  export type TopicViewMinOrderByAggregateInput = {
    userId?: SortOrder
    topicId?: SortOrder
    lastViewedAt?: SortOrder
    lastPostId?: SortOrder
  }

  export type PostScalarRelationFilter = {
    is?: PostWhereInput
    isNot?: PostWhereInput
  }

  export type MentionPostIdMentionedUserIdCompoundUniqueInput = {
    postId: string
    mentionedUserId: string
  }

  export type MentionCountOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    mentionerId?: SortOrder
    mentionedUserId?: SortOrder
    readAt?: SortOrder
  }

  export type MentionMaxOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    mentionerId?: SortOrder
    mentionedUserId?: SortOrder
    readAt?: SortOrder
  }

  export type MentionMinOrderByAggregateInput = {
    id?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    mentionerId?: SortOrder
    mentionedUserId?: SortOrder
    readAt?: SortOrder
  }

  export type PostReactionPostIdUserIdEmojiCompoundUniqueInput = {
    postId: string
    userId: string
    emoji: string
  }

  export type PostReactionCountOrderByAggregateInput = {
    id?: SortOrder
    emoji?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    userId?: SortOrder
  }

  export type PostReactionMaxOrderByAggregateInput = {
    id?: SortOrder
    emoji?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    userId?: SortOrder
  }

  export type PostReactionMinOrderByAggregateInput = {
    id?: SortOrder
    emoji?: SortOrder
    createdAt?: SortOrder
    postId?: SortOrder
    userId?: SortOrder
  }

  export type UserCreateNestedOneWithoutAccountsInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    connect?: UserWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutAccountsNestedInput = {
    create?: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAccountsInput
    upsert?: UserUpsertWithoutAccountsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAccountsInput, UserUpdateWithoutAccountsInput>, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type AccountCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type TournamentCreateNestedManyWithoutOrganizerInput = {
    create?: XOR<TournamentCreateWithoutOrganizerInput, TournamentUncheckedCreateWithoutOrganizerInput> | TournamentCreateWithoutOrganizerInput[] | TournamentUncheckedCreateWithoutOrganizerInput[]
    connectOrCreate?: TournamentCreateOrConnectWithoutOrganizerInput | TournamentCreateOrConnectWithoutOrganizerInput[]
    createMany?: TournamentCreateManyOrganizerInputEnvelope
    connect?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
  }

  export type TopicCreateNestedManyWithoutAuthorInput = {
    create?: XOR<TopicCreateWithoutAuthorInput, TopicUncheckedCreateWithoutAuthorInput> | TopicCreateWithoutAuthorInput[] | TopicUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutAuthorInput | TopicCreateOrConnectWithoutAuthorInput[]
    createMany?: TopicCreateManyAuthorInputEnvelope
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
  }

  export type PostCreateNestedManyWithoutAuthorInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PmCreateNestedManyWithoutSenderInput = {
    create?: XOR<PmCreateWithoutSenderInput, PmUncheckedCreateWithoutSenderInput> | PmCreateWithoutSenderInput[] | PmUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: PmCreateOrConnectWithoutSenderInput | PmCreateOrConnectWithoutSenderInput[]
    createMany?: PmCreateManySenderInputEnvelope
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
  }

  export type PmCreateNestedManyWithoutReceiverInput = {
    create?: XOR<PmCreateWithoutReceiverInput, PmUncheckedCreateWithoutReceiverInput> | PmCreateWithoutReceiverInput[] | PmUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: PmCreateOrConnectWithoutReceiverInput | PmCreateOrConnectWithoutReceiverInput[]
    createMany?: PmCreateManyReceiverInputEnvelope
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
  }

  export type TopicViewCreateNestedManyWithoutUserInput = {
    create?: XOR<TopicViewCreateWithoutUserInput, TopicViewUncheckedCreateWithoutUserInput> | TopicViewCreateWithoutUserInput[] | TopicViewUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutUserInput | TopicViewCreateOrConnectWithoutUserInput[]
    createMany?: TopicViewCreateManyUserInputEnvelope
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
  }

  export type MentionCreateNestedManyWithoutMentionerInput = {
    create?: XOR<MentionCreateWithoutMentionerInput, MentionUncheckedCreateWithoutMentionerInput> | MentionCreateWithoutMentionerInput[] | MentionUncheckedCreateWithoutMentionerInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionerInput | MentionCreateOrConnectWithoutMentionerInput[]
    createMany?: MentionCreateManyMentionerInputEnvelope
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
  }

  export type MentionCreateNestedManyWithoutMentionedUserInput = {
    create?: XOR<MentionCreateWithoutMentionedUserInput, MentionUncheckedCreateWithoutMentionedUserInput> | MentionCreateWithoutMentionedUserInput[] | MentionUncheckedCreateWithoutMentionedUserInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionedUserInput | MentionCreateOrConnectWithoutMentionedUserInput[]
    createMany?: MentionCreateManyMentionedUserInputEnvelope
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
  }

  export type PostCreateNestedManyWithoutModeratorInput = {
    create?: XOR<PostCreateWithoutModeratorInput, PostUncheckedCreateWithoutModeratorInput> | PostCreateWithoutModeratorInput[] | PostUncheckedCreateWithoutModeratorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutModeratorInput | PostCreateOrConnectWithoutModeratorInput[]
    createMany?: PostCreateManyModeratorInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PostReactionCreateNestedManyWithoutUserInput = {
    create?: XOR<PostReactionCreateWithoutUserInput, PostReactionUncheckedCreateWithoutUserInput> | PostReactionCreateWithoutUserInput[] | PostReactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutUserInput | PostReactionCreateOrConnectWithoutUserInput[]
    createMany?: PostReactionCreateManyUserInputEnvelope
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
  }

  export type AccountUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type TournamentUncheckedCreateNestedManyWithoutOrganizerInput = {
    create?: XOR<TournamentCreateWithoutOrganizerInput, TournamentUncheckedCreateWithoutOrganizerInput> | TournamentCreateWithoutOrganizerInput[] | TournamentUncheckedCreateWithoutOrganizerInput[]
    connectOrCreate?: TournamentCreateOrConnectWithoutOrganizerInput | TournamentCreateOrConnectWithoutOrganizerInput[]
    createMany?: TournamentCreateManyOrganizerInputEnvelope
    connect?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
  }

  export type TopicUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<TopicCreateWithoutAuthorInput, TopicUncheckedCreateWithoutAuthorInput> | TopicCreateWithoutAuthorInput[] | TopicUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutAuthorInput | TopicCreateOrConnectWithoutAuthorInput[]
    createMany?: TopicCreateManyAuthorInputEnvelope
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PmUncheckedCreateNestedManyWithoutSenderInput = {
    create?: XOR<PmCreateWithoutSenderInput, PmUncheckedCreateWithoutSenderInput> | PmCreateWithoutSenderInput[] | PmUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: PmCreateOrConnectWithoutSenderInput | PmCreateOrConnectWithoutSenderInput[]
    createMany?: PmCreateManySenderInputEnvelope
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
  }

  export type PmUncheckedCreateNestedManyWithoutReceiverInput = {
    create?: XOR<PmCreateWithoutReceiverInput, PmUncheckedCreateWithoutReceiverInput> | PmCreateWithoutReceiverInput[] | PmUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: PmCreateOrConnectWithoutReceiverInput | PmCreateOrConnectWithoutReceiverInput[]
    createMany?: PmCreateManyReceiverInputEnvelope
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
  }

  export type TopicViewUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<TopicViewCreateWithoutUserInput, TopicViewUncheckedCreateWithoutUserInput> | TopicViewCreateWithoutUserInput[] | TopicViewUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutUserInput | TopicViewCreateOrConnectWithoutUserInput[]
    createMany?: TopicViewCreateManyUserInputEnvelope
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
  }

  export type MentionUncheckedCreateNestedManyWithoutMentionerInput = {
    create?: XOR<MentionCreateWithoutMentionerInput, MentionUncheckedCreateWithoutMentionerInput> | MentionCreateWithoutMentionerInput[] | MentionUncheckedCreateWithoutMentionerInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionerInput | MentionCreateOrConnectWithoutMentionerInput[]
    createMany?: MentionCreateManyMentionerInputEnvelope
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
  }

  export type MentionUncheckedCreateNestedManyWithoutMentionedUserInput = {
    create?: XOR<MentionCreateWithoutMentionedUserInput, MentionUncheckedCreateWithoutMentionedUserInput> | MentionCreateWithoutMentionedUserInput[] | MentionUncheckedCreateWithoutMentionedUserInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionedUserInput | MentionCreateOrConnectWithoutMentionedUserInput[]
    createMany?: MentionCreateManyMentionedUserInputEnvelope
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutModeratorInput = {
    create?: XOR<PostCreateWithoutModeratorInput, PostUncheckedCreateWithoutModeratorInput> | PostCreateWithoutModeratorInput[] | PostUncheckedCreateWithoutModeratorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutModeratorInput | PostCreateOrConnectWithoutModeratorInput[]
    createMany?: PostCreateManyModeratorInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type PostReactionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PostReactionCreateWithoutUserInput, PostReactionUncheckedCreateWithoutUserInput> | PostReactionCreateWithoutUserInput[] | PostReactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutUserInput | PostReactionCreateOrConnectWithoutUserInput[]
    createMany?: PostReactionCreateManyUserInputEnvelope
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type AccountUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type TournamentUpdateManyWithoutOrganizerNestedInput = {
    create?: XOR<TournamentCreateWithoutOrganizerInput, TournamentUncheckedCreateWithoutOrganizerInput> | TournamentCreateWithoutOrganizerInput[] | TournamentUncheckedCreateWithoutOrganizerInput[]
    connectOrCreate?: TournamentCreateOrConnectWithoutOrganizerInput | TournamentCreateOrConnectWithoutOrganizerInput[]
    upsert?: TournamentUpsertWithWhereUniqueWithoutOrganizerInput | TournamentUpsertWithWhereUniqueWithoutOrganizerInput[]
    createMany?: TournamentCreateManyOrganizerInputEnvelope
    set?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    disconnect?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    delete?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    connect?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    update?: TournamentUpdateWithWhereUniqueWithoutOrganizerInput | TournamentUpdateWithWhereUniqueWithoutOrganizerInput[]
    updateMany?: TournamentUpdateManyWithWhereWithoutOrganizerInput | TournamentUpdateManyWithWhereWithoutOrganizerInput[]
    deleteMany?: TournamentScalarWhereInput | TournamentScalarWhereInput[]
  }

  export type TopicUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<TopicCreateWithoutAuthorInput, TopicUncheckedCreateWithoutAuthorInput> | TopicCreateWithoutAuthorInput[] | TopicUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutAuthorInput | TopicCreateOrConnectWithoutAuthorInput[]
    upsert?: TopicUpsertWithWhereUniqueWithoutAuthorInput | TopicUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: TopicCreateManyAuthorInputEnvelope
    set?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    disconnect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    delete?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    update?: TopicUpdateWithWhereUniqueWithoutAuthorInput | TopicUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: TopicUpdateManyWithWhereWithoutAuthorInput | TopicUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: TopicScalarWhereInput | TopicScalarWhereInput[]
  }

  export type PostUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutAuthorInput | PostUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutAuthorInput | PostUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: PostUpdateManyWithWhereWithoutAuthorInput | PostUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PmUpdateManyWithoutSenderNestedInput = {
    create?: XOR<PmCreateWithoutSenderInput, PmUncheckedCreateWithoutSenderInput> | PmCreateWithoutSenderInput[] | PmUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: PmCreateOrConnectWithoutSenderInput | PmCreateOrConnectWithoutSenderInput[]
    upsert?: PmUpsertWithWhereUniqueWithoutSenderInput | PmUpsertWithWhereUniqueWithoutSenderInput[]
    createMany?: PmCreateManySenderInputEnvelope
    set?: PmWhereUniqueInput | PmWhereUniqueInput[]
    disconnect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    delete?: PmWhereUniqueInput | PmWhereUniqueInput[]
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    update?: PmUpdateWithWhereUniqueWithoutSenderInput | PmUpdateWithWhereUniqueWithoutSenderInput[]
    updateMany?: PmUpdateManyWithWhereWithoutSenderInput | PmUpdateManyWithWhereWithoutSenderInput[]
    deleteMany?: PmScalarWhereInput | PmScalarWhereInput[]
  }

  export type PmUpdateManyWithoutReceiverNestedInput = {
    create?: XOR<PmCreateWithoutReceiverInput, PmUncheckedCreateWithoutReceiverInput> | PmCreateWithoutReceiverInput[] | PmUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: PmCreateOrConnectWithoutReceiverInput | PmCreateOrConnectWithoutReceiverInput[]
    upsert?: PmUpsertWithWhereUniqueWithoutReceiverInput | PmUpsertWithWhereUniqueWithoutReceiverInput[]
    createMany?: PmCreateManyReceiverInputEnvelope
    set?: PmWhereUniqueInput | PmWhereUniqueInput[]
    disconnect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    delete?: PmWhereUniqueInput | PmWhereUniqueInput[]
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    update?: PmUpdateWithWhereUniqueWithoutReceiverInput | PmUpdateWithWhereUniqueWithoutReceiverInput[]
    updateMany?: PmUpdateManyWithWhereWithoutReceiverInput | PmUpdateManyWithWhereWithoutReceiverInput[]
    deleteMany?: PmScalarWhereInput | PmScalarWhereInput[]
  }

  export type TopicViewUpdateManyWithoutUserNestedInput = {
    create?: XOR<TopicViewCreateWithoutUserInput, TopicViewUncheckedCreateWithoutUserInput> | TopicViewCreateWithoutUserInput[] | TopicViewUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutUserInput | TopicViewCreateOrConnectWithoutUserInput[]
    upsert?: TopicViewUpsertWithWhereUniqueWithoutUserInput | TopicViewUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TopicViewCreateManyUserInputEnvelope
    set?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    disconnect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    delete?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    update?: TopicViewUpdateWithWhereUniqueWithoutUserInput | TopicViewUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TopicViewUpdateManyWithWhereWithoutUserInput | TopicViewUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TopicViewScalarWhereInput | TopicViewScalarWhereInput[]
  }

  export type MentionUpdateManyWithoutMentionerNestedInput = {
    create?: XOR<MentionCreateWithoutMentionerInput, MentionUncheckedCreateWithoutMentionerInput> | MentionCreateWithoutMentionerInput[] | MentionUncheckedCreateWithoutMentionerInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionerInput | MentionCreateOrConnectWithoutMentionerInput[]
    upsert?: MentionUpsertWithWhereUniqueWithoutMentionerInput | MentionUpsertWithWhereUniqueWithoutMentionerInput[]
    createMany?: MentionCreateManyMentionerInputEnvelope
    set?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    disconnect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    delete?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    update?: MentionUpdateWithWhereUniqueWithoutMentionerInput | MentionUpdateWithWhereUniqueWithoutMentionerInput[]
    updateMany?: MentionUpdateManyWithWhereWithoutMentionerInput | MentionUpdateManyWithWhereWithoutMentionerInput[]
    deleteMany?: MentionScalarWhereInput | MentionScalarWhereInput[]
  }

  export type MentionUpdateManyWithoutMentionedUserNestedInput = {
    create?: XOR<MentionCreateWithoutMentionedUserInput, MentionUncheckedCreateWithoutMentionedUserInput> | MentionCreateWithoutMentionedUserInput[] | MentionUncheckedCreateWithoutMentionedUserInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionedUserInput | MentionCreateOrConnectWithoutMentionedUserInput[]
    upsert?: MentionUpsertWithWhereUniqueWithoutMentionedUserInput | MentionUpsertWithWhereUniqueWithoutMentionedUserInput[]
    createMany?: MentionCreateManyMentionedUserInputEnvelope
    set?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    disconnect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    delete?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    update?: MentionUpdateWithWhereUniqueWithoutMentionedUserInput | MentionUpdateWithWhereUniqueWithoutMentionedUserInput[]
    updateMany?: MentionUpdateManyWithWhereWithoutMentionedUserInput | MentionUpdateManyWithWhereWithoutMentionedUserInput[]
    deleteMany?: MentionScalarWhereInput | MentionScalarWhereInput[]
  }

  export type PostUpdateManyWithoutModeratorNestedInput = {
    create?: XOR<PostCreateWithoutModeratorInput, PostUncheckedCreateWithoutModeratorInput> | PostCreateWithoutModeratorInput[] | PostUncheckedCreateWithoutModeratorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutModeratorInput | PostCreateOrConnectWithoutModeratorInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutModeratorInput | PostUpsertWithWhereUniqueWithoutModeratorInput[]
    createMany?: PostCreateManyModeratorInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutModeratorInput | PostUpdateWithWhereUniqueWithoutModeratorInput[]
    updateMany?: PostUpdateManyWithWhereWithoutModeratorInput | PostUpdateManyWithWhereWithoutModeratorInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PostReactionUpdateManyWithoutUserNestedInput = {
    create?: XOR<PostReactionCreateWithoutUserInput, PostReactionUncheckedCreateWithoutUserInput> | PostReactionCreateWithoutUserInput[] | PostReactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutUserInput | PostReactionCreateOrConnectWithoutUserInput[]
    upsert?: PostReactionUpsertWithWhereUniqueWithoutUserInput | PostReactionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PostReactionCreateManyUserInputEnvelope
    set?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    disconnect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    delete?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    update?: PostReactionUpdateWithWhereUniqueWithoutUserInput | PostReactionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PostReactionUpdateManyWithWhereWithoutUserInput | PostReactionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PostReactionScalarWhereInput | PostReactionScalarWhereInput[]
  }

  export type AccountUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput> | AccountCreateWithoutUserInput[] | AccountUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AccountCreateOrConnectWithoutUserInput | AccountCreateOrConnectWithoutUserInput[]
    upsert?: AccountUpsertWithWhereUniqueWithoutUserInput | AccountUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AccountCreateManyUserInputEnvelope
    set?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    disconnect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    delete?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    connect?: AccountWhereUniqueInput | AccountWhereUniqueInput[]
    update?: AccountUpdateWithWhereUniqueWithoutUserInput | AccountUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AccountUpdateManyWithWhereWithoutUserInput | AccountUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AccountScalarWhereInput | AccountScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type TournamentUncheckedUpdateManyWithoutOrganizerNestedInput = {
    create?: XOR<TournamentCreateWithoutOrganizerInput, TournamentUncheckedCreateWithoutOrganizerInput> | TournamentCreateWithoutOrganizerInput[] | TournamentUncheckedCreateWithoutOrganizerInput[]
    connectOrCreate?: TournamentCreateOrConnectWithoutOrganizerInput | TournamentCreateOrConnectWithoutOrganizerInput[]
    upsert?: TournamentUpsertWithWhereUniqueWithoutOrganizerInput | TournamentUpsertWithWhereUniqueWithoutOrganizerInput[]
    createMany?: TournamentCreateManyOrganizerInputEnvelope
    set?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    disconnect?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    delete?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    connect?: TournamentWhereUniqueInput | TournamentWhereUniqueInput[]
    update?: TournamentUpdateWithWhereUniqueWithoutOrganizerInput | TournamentUpdateWithWhereUniqueWithoutOrganizerInput[]
    updateMany?: TournamentUpdateManyWithWhereWithoutOrganizerInput | TournamentUpdateManyWithWhereWithoutOrganizerInput[]
    deleteMany?: TournamentScalarWhereInput | TournamentScalarWhereInput[]
  }

  export type TopicUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<TopicCreateWithoutAuthorInput, TopicUncheckedCreateWithoutAuthorInput> | TopicCreateWithoutAuthorInput[] | TopicUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutAuthorInput | TopicCreateOrConnectWithoutAuthorInput[]
    upsert?: TopicUpsertWithWhereUniqueWithoutAuthorInput | TopicUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: TopicCreateManyAuthorInputEnvelope
    set?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    disconnect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    delete?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    update?: TopicUpdateWithWhereUniqueWithoutAuthorInput | TopicUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: TopicUpdateManyWithWhereWithoutAuthorInput | TopicUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: TopicScalarWhereInput | TopicScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput> | PostCreateWithoutAuthorInput[] | PostUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutAuthorInput | PostCreateOrConnectWithoutAuthorInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutAuthorInput | PostUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: PostCreateManyAuthorInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutAuthorInput | PostUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: PostUpdateManyWithWhereWithoutAuthorInput | PostUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PmUncheckedUpdateManyWithoutSenderNestedInput = {
    create?: XOR<PmCreateWithoutSenderInput, PmUncheckedCreateWithoutSenderInput> | PmCreateWithoutSenderInput[] | PmUncheckedCreateWithoutSenderInput[]
    connectOrCreate?: PmCreateOrConnectWithoutSenderInput | PmCreateOrConnectWithoutSenderInput[]
    upsert?: PmUpsertWithWhereUniqueWithoutSenderInput | PmUpsertWithWhereUniqueWithoutSenderInput[]
    createMany?: PmCreateManySenderInputEnvelope
    set?: PmWhereUniqueInput | PmWhereUniqueInput[]
    disconnect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    delete?: PmWhereUniqueInput | PmWhereUniqueInput[]
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    update?: PmUpdateWithWhereUniqueWithoutSenderInput | PmUpdateWithWhereUniqueWithoutSenderInput[]
    updateMany?: PmUpdateManyWithWhereWithoutSenderInput | PmUpdateManyWithWhereWithoutSenderInput[]
    deleteMany?: PmScalarWhereInput | PmScalarWhereInput[]
  }

  export type PmUncheckedUpdateManyWithoutReceiverNestedInput = {
    create?: XOR<PmCreateWithoutReceiverInput, PmUncheckedCreateWithoutReceiverInput> | PmCreateWithoutReceiverInput[] | PmUncheckedCreateWithoutReceiverInput[]
    connectOrCreate?: PmCreateOrConnectWithoutReceiverInput | PmCreateOrConnectWithoutReceiverInput[]
    upsert?: PmUpsertWithWhereUniqueWithoutReceiverInput | PmUpsertWithWhereUniqueWithoutReceiverInput[]
    createMany?: PmCreateManyReceiverInputEnvelope
    set?: PmWhereUniqueInput | PmWhereUniqueInput[]
    disconnect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    delete?: PmWhereUniqueInput | PmWhereUniqueInput[]
    connect?: PmWhereUniqueInput | PmWhereUniqueInput[]
    update?: PmUpdateWithWhereUniqueWithoutReceiverInput | PmUpdateWithWhereUniqueWithoutReceiverInput[]
    updateMany?: PmUpdateManyWithWhereWithoutReceiverInput | PmUpdateManyWithWhereWithoutReceiverInput[]
    deleteMany?: PmScalarWhereInput | PmScalarWhereInput[]
  }

  export type TopicViewUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<TopicViewCreateWithoutUserInput, TopicViewUncheckedCreateWithoutUserInput> | TopicViewCreateWithoutUserInput[] | TopicViewUncheckedCreateWithoutUserInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutUserInput | TopicViewCreateOrConnectWithoutUserInput[]
    upsert?: TopicViewUpsertWithWhereUniqueWithoutUserInput | TopicViewUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: TopicViewCreateManyUserInputEnvelope
    set?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    disconnect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    delete?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    update?: TopicViewUpdateWithWhereUniqueWithoutUserInput | TopicViewUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: TopicViewUpdateManyWithWhereWithoutUserInput | TopicViewUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: TopicViewScalarWhereInput | TopicViewScalarWhereInput[]
  }

  export type MentionUncheckedUpdateManyWithoutMentionerNestedInput = {
    create?: XOR<MentionCreateWithoutMentionerInput, MentionUncheckedCreateWithoutMentionerInput> | MentionCreateWithoutMentionerInput[] | MentionUncheckedCreateWithoutMentionerInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionerInput | MentionCreateOrConnectWithoutMentionerInput[]
    upsert?: MentionUpsertWithWhereUniqueWithoutMentionerInput | MentionUpsertWithWhereUniqueWithoutMentionerInput[]
    createMany?: MentionCreateManyMentionerInputEnvelope
    set?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    disconnect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    delete?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    update?: MentionUpdateWithWhereUniqueWithoutMentionerInput | MentionUpdateWithWhereUniqueWithoutMentionerInput[]
    updateMany?: MentionUpdateManyWithWhereWithoutMentionerInput | MentionUpdateManyWithWhereWithoutMentionerInput[]
    deleteMany?: MentionScalarWhereInput | MentionScalarWhereInput[]
  }

  export type MentionUncheckedUpdateManyWithoutMentionedUserNestedInput = {
    create?: XOR<MentionCreateWithoutMentionedUserInput, MentionUncheckedCreateWithoutMentionedUserInput> | MentionCreateWithoutMentionedUserInput[] | MentionUncheckedCreateWithoutMentionedUserInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutMentionedUserInput | MentionCreateOrConnectWithoutMentionedUserInput[]
    upsert?: MentionUpsertWithWhereUniqueWithoutMentionedUserInput | MentionUpsertWithWhereUniqueWithoutMentionedUserInput[]
    createMany?: MentionCreateManyMentionedUserInputEnvelope
    set?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    disconnect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    delete?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    update?: MentionUpdateWithWhereUniqueWithoutMentionedUserInput | MentionUpdateWithWhereUniqueWithoutMentionedUserInput[]
    updateMany?: MentionUpdateManyWithWhereWithoutMentionedUserInput | MentionUpdateManyWithWhereWithoutMentionedUserInput[]
    deleteMany?: MentionScalarWhereInput | MentionScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutModeratorNestedInput = {
    create?: XOR<PostCreateWithoutModeratorInput, PostUncheckedCreateWithoutModeratorInput> | PostCreateWithoutModeratorInput[] | PostUncheckedCreateWithoutModeratorInput[]
    connectOrCreate?: PostCreateOrConnectWithoutModeratorInput | PostCreateOrConnectWithoutModeratorInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutModeratorInput | PostUpsertWithWhereUniqueWithoutModeratorInput[]
    createMany?: PostCreateManyModeratorInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutModeratorInput | PostUpdateWithWhereUniqueWithoutModeratorInput[]
    updateMany?: PostUpdateManyWithWhereWithoutModeratorInput | PostUpdateManyWithWhereWithoutModeratorInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type PostReactionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PostReactionCreateWithoutUserInput, PostReactionUncheckedCreateWithoutUserInput> | PostReactionCreateWithoutUserInput[] | PostReactionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutUserInput | PostReactionCreateOrConnectWithoutUserInput[]
    upsert?: PostReactionUpsertWithWhereUniqueWithoutUserInput | PostReactionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PostReactionCreateManyUserInputEnvelope
    set?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    disconnect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    delete?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    update?: PostReactionUpdateWithWhereUniqueWithoutUserInput | PostReactionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PostReactionUpdateManyWithWhereWithoutUserInput | PostReactionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PostReactionScalarWhereInput | PostReactionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutTournamentsInput = {
    create?: XOR<UserCreateWithoutTournamentsInput, UserUncheckedCreateWithoutTournamentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTournamentsInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type UserUpdateOneRequiredWithoutTournamentsNestedInput = {
    create?: XOR<UserCreateWithoutTournamentsInput, UserUncheckedCreateWithoutTournamentsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTournamentsInput
    upsert?: UserUpsertWithoutTournamentsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTournamentsInput, UserUpdateWithoutTournamentsInput>, UserUncheckedUpdateWithoutTournamentsInput>
  }

  export type ForumCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ForumCreateWithoutCategoryInput, ForumUncheckedCreateWithoutCategoryInput> | ForumCreateWithoutCategoryInput[] | ForumUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutCategoryInput | ForumCreateOrConnectWithoutCategoryInput[]
    createMany?: ForumCreateManyCategoryInputEnvelope
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
  }

  export type ForumUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ForumCreateWithoutCategoryInput, ForumUncheckedCreateWithoutCategoryInput> | ForumCreateWithoutCategoryInput[] | ForumUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutCategoryInput | ForumCreateOrConnectWithoutCategoryInput[]
    createMany?: ForumCreateManyCategoryInputEnvelope
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
  }

  export type ForumUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ForumCreateWithoutCategoryInput, ForumUncheckedCreateWithoutCategoryInput> | ForumCreateWithoutCategoryInput[] | ForumUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutCategoryInput | ForumCreateOrConnectWithoutCategoryInput[]
    upsert?: ForumUpsertWithWhereUniqueWithoutCategoryInput | ForumUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ForumCreateManyCategoryInputEnvelope
    set?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    disconnect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    delete?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    update?: ForumUpdateWithWhereUniqueWithoutCategoryInput | ForumUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ForumUpdateManyWithWhereWithoutCategoryInput | ForumUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ForumScalarWhereInput | ForumScalarWhereInput[]
  }

  export type ForumUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ForumCreateWithoutCategoryInput, ForumUncheckedCreateWithoutCategoryInput> | ForumCreateWithoutCategoryInput[] | ForumUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutCategoryInput | ForumCreateOrConnectWithoutCategoryInput[]
    upsert?: ForumUpsertWithWhereUniqueWithoutCategoryInput | ForumUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ForumCreateManyCategoryInputEnvelope
    set?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    disconnect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    delete?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    update?: ForumUpdateWithWhereUniqueWithoutCategoryInput | ForumUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ForumUpdateManyWithWhereWithoutCategoryInput | ForumUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ForumScalarWhereInput | ForumScalarWhereInput[]
  }

  export type CategoryCreateNestedOneWithoutForumsInput = {
    create?: XOR<CategoryCreateWithoutForumsInput, CategoryUncheckedCreateWithoutForumsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutForumsInput
    connect?: CategoryWhereUniqueInput
  }

  export type ForumCreateNestedOneWithoutSubForumsInput = {
    create?: XOR<ForumCreateWithoutSubForumsInput, ForumUncheckedCreateWithoutSubForumsInput>
    connectOrCreate?: ForumCreateOrConnectWithoutSubForumsInput
    connect?: ForumWhereUniqueInput
  }

  export type ForumCreateNestedManyWithoutParentForumInput = {
    create?: XOR<ForumCreateWithoutParentForumInput, ForumUncheckedCreateWithoutParentForumInput> | ForumCreateWithoutParentForumInput[] | ForumUncheckedCreateWithoutParentForumInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutParentForumInput | ForumCreateOrConnectWithoutParentForumInput[]
    createMany?: ForumCreateManyParentForumInputEnvelope
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
  }

  export type TopicCreateNestedManyWithoutForumInput = {
    create?: XOR<TopicCreateWithoutForumInput, TopicUncheckedCreateWithoutForumInput> | TopicCreateWithoutForumInput[] | TopicUncheckedCreateWithoutForumInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutForumInput | TopicCreateOrConnectWithoutForumInput[]
    createMany?: TopicCreateManyForumInputEnvelope
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
  }

  export type ForumUncheckedCreateNestedManyWithoutParentForumInput = {
    create?: XOR<ForumCreateWithoutParentForumInput, ForumUncheckedCreateWithoutParentForumInput> | ForumCreateWithoutParentForumInput[] | ForumUncheckedCreateWithoutParentForumInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutParentForumInput | ForumCreateOrConnectWithoutParentForumInput[]
    createMany?: ForumCreateManyParentForumInputEnvelope
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
  }

  export type TopicUncheckedCreateNestedManyWithoutForumInput = {
    create?: XOR<TopicCreateWithoutForumInput, TopicUncheckedCreateWithoutForumInput> | TopicCreateWithoutForumInput[] | TopicUncheckedCreateWithoutForumInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutForumInput | TopicCreateOrConnectWithoutForumInput[]
    createMany?: TopicCreateManyForumInputEnvelope
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
  }

  export type CategoryUpdateOneWithoutForumsNestedInput = {
    create?: XOR<CategoryCreateWithoutForumsInput, CategoryUncheckedCreateWithoutForumsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutForumsInput
    upsert?: CategoryUpsertWithoutForumsInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutForumsInput, CategoryUpdateWithoutForumsInput>, CategoryUncheckedUpdateWithoutForumsInput>
  }

  export type ForumUpdateOneWithoutSubForumsNestedInput = {
    create?: XOR<ForumCreateWithoutSubForumsInput, ForumUncheckedCreateWithoutSubForumsInput>
    connectOrCreate?: ForumCreateOrConnectWithoutSubForumsInput
    upsert?: ForumUpsertWithoutSubForumsInput
    disconnect?: ForumWhereInput | boolean
    delete?: ForumWhereInput | boolean
    connect?: ForumWhereUniqueInput
    update?: XOR<XOR<ForumUpdateToOneWithWhereWithoutSubForumsInput, ForumUpdateWithoutSubForumsInput>, ForumUncheckedUpdateWithoutSubForumsInput>
  }

  export type ForumUpdateManyWithoutParentForumNestedInput = {
    create?: XOR<ForumCreateWithoutParentForumInput, ForumUncheckedCreateWithoutParentForumInput> | ForumCreateWithoutParentForumInput[] | ForumUncheckedCreateWithoutParentForumInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutParentForumInput | ForumCreateOrConnectWithoutParentForumInput[]
    upsert?: ForumUpsertWithWhereUniqueWithoutParentForumInput | ForumUpsertWithWhereUniqueWithoutParentForumInput[]
    createMany?: ForumCreateManyParentForumInputEnvelope
    set?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    disconnect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    delete?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    update?: ForumUpdateWithWhereUniqueWithoutParentForumInput | ForumUpdateWithWhereUniqueWithoutParentForumInput[]
    updateMany?: ForumUpdateManyWithWhereWithoutParentForumInput | ForumUpdateManyWithWhereWithoutParentForumInput[]
    deleteMany?: ForumScalarWhereInput | ForumScalarWhereInput[]
  }

  export type TopicUpdateManyWithoutForumNestedInput = {
    create?: XOR<TopicCreateWithoutForumInput, TopicUncheckedCreateWithoutForumInput> | TopicCreateWithoutForumInput[] | TopicUncheckedCreateWithoutForumInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutForumInput | TopicCreateOrConnectWithoutForumInput[]
    upsert?: TopicUpsertWithWhereUniqueWithoutForumInput | TopicUpsertWithWhereUniqueWithoutForumInput[]
    createMany?: TopicCreateManyForumInputEnvelope
    set?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    disconnect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    delete?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    update?: TopicUpdateWithWhereUniqueWithoutForumInput | TopicUpdateWithWhereUniqueWithoutForumInput[]
    updateMany?: TopicUpdateManyWithWhereWithoutForumInput | TopicUpdateManyWithWhereWithoutForumInput[]
    deleteMany?: TopicScalarWhereInput | TopicScalarWhereInput[]
  }

  export type ForumUncheckedUpdateManyWithoutParentForumNestedInput = {
    create?: XOR<ForumCreateWithoutParentForumInput, ForumUncheckedCreateWithoutParentForumInput> | ForumCreateWithoutParentForumInput[] | ForumUncheckedCreateWithoutParentForumInput[]
    connectOrCreate?: ForumCreateOrConnectWithoutParentForumInput | ForumCreateOrConnectWithoutParentForumInput[]
    upsert?: ForumUpsertWithWhereUniqueWithoutParentForumInput | ForumUpsertWithWhereUniqueWithoutParentForumInput[]
    createMany?: ForumCreateManyParentForumInputEnvelope
    set?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    disconnect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    delete?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    connect?: ForumWhereUniqueInput | ForumWhereUniqueInput[]
    update?: ForumUpdateWithWhereUniqueWithoutParentForumInput | ForumUpdateWithWhereUniqueWithoutParentForumInput[]
    updateMany?: ForumUpdateManyWithWhereWithoutParentForumInput | ForumUpdateManyWithWhereWithoutParentForumInput[]
    deleteMany?: ForumScalarWhereInput | ForumScalarWhereInput[]
  }

  export type TopicUncheckedUpdateManyWithoutForumNestedInput = {
    create?: XOR<TopicCreateWithoutForumInput, TopicUncheckedCreateWithoutForumInput> | TopicCreateWithoutForumInput[] | TopicUncheckedCreateWithoutForumInput[]
    connectOrCreate?: TopicCreateOrConnectWithoutForumInput | TopicCreateOrConnectWithoutForumInput[]
    upsert?: TopicUpsertWithWhereUniqueWithoutForumInput | TopicUpsertWithWhereUniqueWithoutForumInput[]
    createMany?: TopicCreateManyForumInputEnvelope
    set?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    disconnect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    delete?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    connect?: TopicWhereUniqueInput | TopicWhereUniqueInput[]
    update?: TopicUpdateWithWhereUniqueWithoutForumInput | TopicUpdateWithWhereUniqueWithoutForumInput[]
    updateMany?: TopicUpdateManyWithWhereWithoutForumInput | TopicUpdateManyWithWhereWithoutForumInput[]
    deleteMany?: TopicScalarWhereInput | TopicScalarWhereInput[]
  }

  export type ForumCreateNestedOneWithoutTopicsInput = {
    create?: XOR<ForumCreateWithoutTopicsInput, ForumUncheckedCreateWithoutTopicsInput>
    connectOrCreate?: ForumCreateOrConnectWithoutTopicsInput
    connect?: ForumWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutTopicsInput = {
    create?: XOR<UserCreateWithoutTopicsInput, UserUncheckedCreateWithoutTopicsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTopicsInput
    connect?: UserWhereUniqueInput
  }

  export type PostCreateNestedManyWithoutTopicInput = {
    create?: XOR<PostCreateWithoutTopicInput, PostUncheckedCreateWithoutTopicInput> | PostCreateWithoutTopicInput[] | PostUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTopicInput | PostCreateOrConnectWithoutTopicInput[]
    createMany?: PostCreateManyTopicInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type TopicViewCreateNestedManyWithoutTopicInput = {
    create?: XOR<TopicViewCreateWithoutTopicInput, TopicViewUncheckedCreateWithoutTopicInput> | TopicViewCreateWithoutTopicInput[] | TopicViewUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutTopicInput | TopicViewCreateOrConnectWithoutTopicInput[]
    createMany?: TopicViewCreateManyTopicInputEnvelope
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
  }

  export type PostUncheckedCreateNestedManyWithoutTopicInput = {
    create?: XOR<PostCreateWithoutTopicInput, PostUncheckedCreateWithoutTopicInput> | PostCreateWithoutTopicInput[] | PostUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTopicInput | PostCreateOrConnectWithoutTopicInput[]
    createMany?: PostCreateManyTopicInputEnvelope
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
  }

  export type TopicViewUncheckedCreateNestedManyWithoutTopicInput = {
    create?: XOR<TopicViewCreateWithoutTopicInput, TopicViewUncheckedCreateWithoutTopicInput> | TopicViewCreateWithoutTopicInput[] | TopicViewUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutTopicInput | TopicViewCreateOrConnectWithoutTopicInput[]
    createMany?: TopicViewCreateManyTopicInputEnvelope
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
  }

  export type ForumUpdateOneRequiredWithoutTopicsNestedInput = {
    create?: XOR<ForumCreateWithoutTopicsInput, ForumUncheckedCreateWithoutTopicsInput>
    connectOrCreate?: ForumCreateOrConnectWithoutTopicsInput
    upsert?: ForumUpsertWithoutTopicsInput
    connect?: ForumWhereUniqueInput
    update?: XOR<XOR<ForumUpdateToOneWithWhereWithoutTopicsInput, ForumUpdateWithoutTopicsInput>, ForumUncheckedUpdateWithoutTopicsInput>
  }

  export type UserUpdateOneRequiredWithoutTopicsNestedInput = {
    create?: XOR<UserCreateWithoutTopicsInput, UserUncheckedCreateWithoutTopicsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTopicsInput
    upsert?: UserUpsertWithoutTopicsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTopicsInput, UserUpdateWithoutTopicsInput>, UserUncheckedUpdateWithoutTopicsInput>
  }

  export type PostUpdateManyWithoutTopicNestedInput = {
    create?: XOR<PostCreateWithoutTopicInput, PostUncheckedCreateWithoutTopicInput> | PostCreateWithoutTopicInput[] | PostUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTopicInput | PostCreateOrConnectWithoutTopicInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutTopicInput | PostUpsertWithWhereUniqueWithoutTopicInput[]
    createMany?: PostCreateManyTopicInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutTopicInput | PostUpdateWithWhereUniqueWithoutTopicInput[]
    updateMany?: PostUpdateManyWithWhereWithoutTopicInput | PostUpdateManyWithWhereWithoutTopicInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type TopicViewUpdateManyWithoutTopicNestedInput = {
    create?: XOR<TopicViewCreateWithoutTopicInput, TopicViewUncheckedCreateWithoutTopicInput> | TopicViewCreateWithoutTopicInput[] | TopicViewUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutTopicInput | TopicViewCreateOrConnectWithoutTopicInput[]
    upsert?: TopicViewUpsertWithWhereUniqueWithoutTopicInput | TopicViewUpsertWithWhereUniqueWithoutTopicInput[]
    createMany?: TopicViewCreateManyTopicInputEnvelope
    set?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    disconnect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    delete?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    update?: TopicViewUpdateWithWhereUniqueWithoutTopicInput | TopicViewUpdateWithWhereUniqueWithoutTopicInput[]
    updateMany?: TopicViewUpdateManyWithWhereWithoutTopicInput | TopicViewUpdateManyWithWhereWithoutTopicInput[]
    deleteMany?: TopicViewScalarWhereInput | TopicViewScalarWhereInput[]
  }

  export type PostUncheckedUpdateManyWithoutTopicNestedInput = {
    create?: XOR<PostCreateWithoutTopicInput, PostUncheckedCreateWithoutTopicInput> | PostCreateWithoutTopicInput[] | PostUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: PostCreateOrConnectWithoutTopicInput | PostCreateOrConnectWithoutTopicInput[]
    upsert?: PostUpsertWithWhereUniqueWithoutTopicInput | PostUpsertWithWhereUniqueWithoutTopicInput[]
    createMany?: PostCreateManyTopicInputEnvelope
    set?: PostWhereUniqueInput | PostWhereUniqueInput[]
    disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    delete?: PostWhereUniqueInput | PostWhereUniqueInput[]
    connect?: PostWhereUniqueInput | PostWhereUniqueInput[]
    update?: PostUpdateWithWhereUniqueWithoutTopicInput | PostUpdateWithWhereUniqueWithoutTopicInput[]
    updateMany?: PostUpdateManyWithWhereWithoutTopicInput | PostUpdateManyWithWhereWithoutTopicInput[]
    deleteMany?: PostScalarWhereInput | PostScalarWhereInput[]
  }

  export type TopicViewUncheckedUpdateManyWithoutTopicNestedInput = {
    create?: XOR<TopicViewCreateWithoutTopicInput, TopicViewUncheckedCreateWithoutTopicInput> | TopicViewCreateWithoutTopicInput[] | TopicViewUncheckedCreateWithoutTopicInput[]
    connectOrCreate?: TopicViewCreateOrConnectWithoutTopicInput | TopicViewCreateOrConnectWithoutTopicInput[]
    upsert?: TopicViewUpsertWithWhereUniqueWithoutTopicInput | TopicViewUpsertWithWhereUniqueWithoutTopicInput[]
    createMany?: TopicViewCreateManyTopicInputEnvelope
    set?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    disconnect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    delete?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    connect?: TopicViewWhereUniqueInput | TopicViewWhereUniqueInput[]
    update?: TopicViewUpdateWithWhereUniqueWithoutTopicInput | TopicViewUpdateWithWhereUniqueWithoutTopicInput[]
    updateMany?: TopicViewUpdateManyWithWhereWithoutTopicInput | TopicViewUpdateManyWithWhereWithoutTopicInput[]
    deleteMany?: TopicViewScalarWhereInput | TopicViewScalarWhereInput[]
  }

  export type TopicCreateNestedOneWithoutPostsInput = {
    create?: XOR<TopicCreateWithoutPostsInput, TopicUncheckedCreateWithoutPostsInput>
    connectOrCreate?: TopicCreateOrConnectWithoutPostsInput
    connect?: TopicWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutPostsInput = {
    create?: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostsInput
    connect?: UserWhereUniqueInput
  }

  export type MentionCreateNestedManyWithoutPostInput = {
    create?: XOR<MentionCreateWithoutPostInput, MentionUncheckedCreateWithoutPostInput> | MentionCreateWithoutPostInput[] | MentionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutPostInput | MentionCreateOrConnectWithoutPostInput[]
    createMany?: MentionCreateManyPostInputEnvelope
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutModeratedPostsInput = {
    create?: XOR<UserCreateWithoutModeratedPostsInput, UserUncheckedCreateWithoutModeratedPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutModeratedPostsInput
    connect?: UserWhereUniqueInput
  }

  export type PostReactionCreateNestedManyWithoutPostInput = {
    create?: XOR<PostReactionCreateWithoutPostInput, PostReactionUncheckedCreateWithoutPostInput> | PostReactionCreateWithoutPostInput[] | PostReactionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutPostInput | PostReactionCreateOrConnectWithoutPostInput[]
    createMany?: PostReactionCreateManyPostInputEnvelope
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
  }

  export type MentionUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<MentionCreateWithoutPostInput, MentionUncheckedCreateWithoutPostInput> | MentionCreateWithoutPostInput[] | MentionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutPostInput | MentionCreateOrConnectWithoutPostInput[]
    createMany?: MentionCreateManyPostInputEnvelope
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
  }

  export type PostReactionUncheckedCreateNestedManyWithoutPostInput = {
    create?: XOR<PostReactionCreateWithoutPostInput, PostReactionUncheckedCreateWithoutPostInput> | PostReactionCreateWithoutPostInput[] | PostReactionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutPostInput | PostReactionCreateOrConnectWithoutPostInput[]
    createMany?: PostReactionCreateManyPostInputEnvelope
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
  }

  export type TopicUpdateOneRequiredWithoutPostsNestedInput = {
    create?: XOR<TopicCreateWithoutPostsInput, TopicUncheckedCreateWithoutPostsInput>
    connectOrCreate?: TopicCreateOrConnectWithoutPostsInput
    upsert?: TopicUpsertWithoutPostsInput
    connect?: TopicWhereUniqueInput
    update?: XOR<XOR<TopicUpdateToOneWithWhereWithoutPostsInput, TopicUpdateWithoutPostsInput>, TopicUncheckedUpdateWithoutPostsInput>
  }

  export type UserUpdateOneRequiredWithoutPostsNestedInput = {
    create?: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostsInput
    upsert?: UserUpsertWithoutPostsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPostsInput, UserUpdateWithoutPostsInput>, UserUncheckedUpdateWithoutPostsInput>
  }

  export type MentionUpdateManyWithoutPostNestedInput = {
    create?: XOR<MentionCreateWithoutPostInput, MentionUncheckedCreateWithoutPostInput> | MentionCreateWithoutPostInput[] | MentionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutPostInput | MentionCreateOrConnectWithoutPostInput[]
    upsert?: MentionUpsertWithWhereUniqueWithoutPostInput | MentionUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: MentionCreateManyPostInputEnvelope
    set?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    disconnect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    delete?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    update?: MentionUpdateWithWhereUniqueWithoutPostInput | MentionUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: MentionUpdateManyWithWhereWithoutPostInput | MentionUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: MentionScalarWhereInput | MentionScalarWhereInput[]
  }

  export type UserUpdateOneWithoutModeratedPostsNestedInput = {
    create?: XOR<UserCreateWithoutModeratedPostsInput, UserUncheckedCreateWithoutModeratedPostsInput>
    connectOrCreate?: UserCreateOrConnectWithoutModeratedPostsInput
    upsert?: UserUpsertWithoutModeratedPostsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutModeratedPostsInput, UserUpdateWithoutModeratedPostsInput>, UserUncheckedUpdateWithoutModeratedPostsInput>
  }

  export type PostReactionUpdateManyWithoutPostNestedInput = {
    create?: XOR<PostReactionCreateWithoutPostInput, PostReactionUncheckedCreateWithoutPostInput> | PostReactionCreateWithoutPostInput[] | PostReactionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutPostInput | PostReactionCreateOrConnectWithoutPostInput[]
    upsert?: PostReactionUpsertWithWhereUniqueWithoutPostInput | PostReactionUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: PostReactionCreateManyPostInputEnvelope
    set?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    disconnect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    delete?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    update?: PostReactionUpdateWithWhereUniqueWithoutPostInput | PostReactionUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: PostReactionUpdateManyWithWhereWithoutPostInput | PostReactionUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: PostReactionScalarWhereInput | PostReactionScalarWhereInput[]
  }

  export type MentionUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<MentionCreateWithoutPostInput, MentionUncheckedCreateWithoutPostInput> | MentionCreateWithoutPostInput[] | MentionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: MentionCreateOrConnectWithoutPostInput | MentionCreateOrConnectWithoutPostInput[]
    upsert?: MentionUpsertWithWhereUniqueWithoutPostInput | MentionUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: MentionCreateManyPostInputEnvelope
    set?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    disconnect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    delete?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    connect?: MentionWhereUniqueInput | MentionWhereUniqueInput[]
    update?: MentionUpdateWithWhereUniqueWithoutPostInput | MentionUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: MentionUpdateManyWithWhereWithoutPostInput | MentionUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: MentionScalarWhereInput | MentionScalarWhereInput[]
  }

  export type PostReactionUncheckedUpdateManyWithoutPostNestedInput = {
    create?: XOR<PostReactionCreateWithoutPostInput, PostReactionUncheckedCreateWithoutPostInput> | PostReactionCreateWithoutPostInput[] | PostReactionUncheckedCreateWithoutPostInput[]
    connectOrCreate?: PostReactionCreateOrConnectWithoutPostInput | PostReactionCreateOrConnectWithoutPostInput[]
    upsert?: PostReactionUpsertWithWhereUniqueWithoutPostInput | PostReactionUpsertWithWhereUniqueWithoutPostInput[]
    createMany?: PostReactionCreateManyPostInputEnvelope
    set?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    disconnect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    delete?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    connect?: PostReactionWhereUniqueInput | PostReactionWhereUniqueInput[]
    update?: PostReactionUpdateWithWhereUniqueWithoutPostInput | PostReactionUpdateWithWhereUniqueWithoutPostInput[]
    updateMany?: PostReactionUpdateManyWithWhereWithoutPostInput | PostReactionUpdateManyWithWhereWithoutPostInput[]
    deleteMany?: PostReactionScalarWhereInput | PostReactionScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSentMessagesInput = {
    create?: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSentMessagesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutReceivedMessagesInput = {
    create?: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceivedMessagesInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSentMessagesNestedInput = {
    create?: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSentMessagesInput
    upsert?: UserUpsertWithoutSentMessagesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSentMessagesInput, UserUpdateWithoutSentMessagesInput>, UserUncheckedUpdateWithoutSentMessagesInput>
  }

  export type UserUpdateOneRequiredWithoutReceivedMessagesNestedInput = {
    create?: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
    connectOrCreate?: UserCreateOrConnectWithoutReceivedMessagesInput
    upsert?: UserUpsertWithoutReceivedMessagesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutReceivedMessagesInput, UserUpdateWithoutReceivedMessagesInput>, UserUncheckedUpdateWithoutReceivedMessagesInput>
  }

  export type UserCreateNestedOneWithoutTopicViewsInput = {
    create?: XOR<UserCreateWithoutTopicViewsInput, UserUncheckedCreateWithoutTopicViewsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTopicViewsInput
    connect?: UserWhereUniqueInput
  }

  export type TopicCreateNestedOneWithoutTopicViewsInput = {
    create?: XOR<TopicCreateWithoutTopicViewsInput, TopicUncheckedCreateWithoutTopicViewsInput>
    connectOrCreate?: TopicCreateOrConnectWithoutTopicViewsInput
    connect?: TopicWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTopicViewsNestedInput = {
    create?: XOR<UserCreateWithoutTopicViewsInput, UserUncheckedCreateWithoutTopicViewsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTopicViewsInput
    upsert?: UserUpsertWithoutTopicViewsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTopicViewsInput, UserUpdateWithoutTopicViewsInput>, UserUncheckedUpdateWithoutTopicViewsInput>
  }

  export type TopicUpdateOneRequiredWithoutTopicViewsNestedInput = {
    create?: XOR<TopicCreateWithoutTopicViewsInput, TopicUncheckedCreateWithoutTopicViewsInput>
    connectOrCreate?: TopicCreateOrConnectWithoutTopicViewsInput
    upsert?: TopicUpsertWithoutTopicViewsInput
    connect?: TopicWhereUniqueInput
    update?: XOR<XOR<TopicUpdateToOneWithWhereWithoutTopicViewsInput, TopicUpdateWithoutTopicViewsInput>, TopicUncheckedUpdateWithoutTopicViewsInput>
  }

  export type PostCreateNestedOneWithoutMentionsInput = {
    create?: XOR<PostCreateWithoutMentionsInput, PostUncheckedCreateWithoutMentionsInput>
    connectOrCreate?: PostCreateOrConnectWithoutMentionsInput
    connect?: PostWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMentionsMadeInput = {
    create?: XOR<UserCreateWithoutMentionsMadeInput, UserUncheckedCreateWithoutMentionsMadeInput>
    connectOrCreate?: UserCreateOrConnectWithoutMentionsMadeInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutMentionsReceivedInput = {
    create?: XOR<UserCreateWithoutMentionsReceivedInput, UserUncheckedCreateWithoutMentionsReceivedInput>
    connectOrCreate?: UserCreateOrConnectWithoutMentionsReceivedInput
    connect?: UserWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutMentionsNestedInput = {
    create?: XOR<PostCreateWithoutMentionsInput, PostUncheckedCreateWithoutMentionsInput>
    connectOrCreate?: PostCreateOrConnectWithoutMentionsInput
    upsert?: PostUpsertWithoutMentionsInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutMentionsInput, PostUpdateWithoutMentionsInput>, PostUncheckedUpdateWithoutMentionsInput>
  }

  export type UserUpdateOneRequiredWithoutMentionsMadeNestedInput = {
    create?: XOR<UserCreateWithoutMentionsMadeInput, UserUncheckedCreateWithoutMentionsMadeInput>
    connectOrCreate?: UserCreateOrConnectWithoutMentionsMadeInput
    upsert?: UserUpsertWithoutMentionsMadeInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMentionsMadeInput, UserUpdateWithoutMentionsMadeInput>, UserUncheckedUpdateWithoutMentionsMadeInput>
  }

  export type UserUpdateOneRequiredWithoutMentionsReceivedNestedInput = {
    create?: XOR<UserCreateWithoutMentionsReceivedInput, UserUncheckedCreateWithoutMentionsReceivedInput>
    connectOrCreate?: UserCreateOrConnectWithoutMentionsReceivedInput
    upsert?: UserUpsertWithoutMentionsReceivedInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMentionsReceivedInput, UserUpdateWithoutMentionsReceivedInput>, UserUncheckedUpdateWithoutMentionsReceivedInput>
  }

  export type PostCreateNestedOneWithoutReactionsInput = {
    create?: XOR<PostCreateWithoutReactionsInput, PostUncheckedCreateWithoutReactionsInput>
    connectOrCreate?: PostCreateOrConnectWithoutReactionsInput
    connect?: PostWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutPostReactionsInput = {
    create?: XOR<UserCreateWithoutPostReactionsInput, UserUncheckedCreateWithoutPostReactionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostReactionsInput
    connect?: UserWhereUniqueInput
  }

  export type PostUpdateOneRequiredWithoutReactionsNestedInput = {
    create?: XOR<PostCreateWithoutReactionsInput, PostUncheckedCreateWithoutReactionsInput>
    connectOrCreate?: PostCreateOrConnectWithoutReactionsInput
    upsert?: PostUpsertWithoutReactionsInput
    connect?: PostWhereUniqueInput
    update?: XOR<XOR<PostUpdateToOneWithWhereWithoutReactionsInput, PostUpdateWithoutReactionsInput>, PostUncheckedUpdateWithoutReactionsInput>
  }

  export type UserUpdateOneRequiredWithoutPostReactionsNestedInput = {
    create?: XOR<UserCreateWithoutPostReactionsInput, UserUncheckedCreateWithoutPostReactionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPostReactionsInput
    upsert?: UserUpsertWithoutPostReactionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPostReactionsInput, UserUpdateWithoutPostReactionsInput>, UserUncheckedUpdateWithoutPostReactionsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type UserCreateWithoutAccountsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAccountsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAccountsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
  }

  export type UserUpsertWithoutAccountsInput = {
    update: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
    create: XOR<UserCreateWithoutAccountsInput, UserUncheckedCreateWithoutAccountsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAccountsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAccountsInput, UserUncheckedUpdateWithoutAccountsInput>
  }

  export type UserUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAccountsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AccountCreateWithoutUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountUncheckedCreateWithoutUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type AccountCreateOrConnectWithoutUserInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountCreateManyUserInputEnvelope = {
    data: AccountCreateManyUserInput | AccountCreateManyUserInput[]
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
  }

  export type TournamentCreateWithoutOrganizerInput = {
    id?: string
    name: string
    date: Date | string
    location: string
    ville?: string | null
    departement?: string | null
    region?: string | null
    description?: string | null
    maxParticipants?: number | null
    currentParticipants?: number
    preRegistered?: number
    days?: string | null
    totalMatches?: number | null
    price?: number | null
    structure?: string | null
    lodgingAtVenue?: boolean
    ruleset?: string | null
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: string | null
  }

  export type TournamentUncheckedCreateWithoutOrganizerInput = {
    id?: string
    name: string
    date: Date | string
    location: string
    ville?: string | null
    departement?: string | null
    region?: string | null
    description?: string | null
    maxParticipants?: number | null
    currentParticipants?: number
    preRegistered?: number
    days?: string | null
    totalMatches?: number | null
    price?: number | null
    structure?: string | null
    lodgingAtVenue?: boolean
    ruleset?: string | null
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: string | null
  }

  export type TournamentCreateOrConnectWithoutOrganizerInput = {
    where: TournamentWhereUniqueInput
    create: XOR<TournamentCreateWithoutOrganizerInput, TournamentUncheckedCreateWithoutOrganizerInput>
  }

  export type TournamentCreateManyOrganizerInputEnvelope = {
    data: TournamentCreateManyOrganizerInput | TournamentCreateManyOrganizerInput[]
  }

  export type TopicCreateWithoutAuthorInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forum: ForumCreateNestedOneWithoutTopicsInput
    posts?: PostCreateNestedManyWithoutTopicInput
    topicViews?: TopicViewCreateNestedManyWithoutTopicInput
  }

  export type TopicUncheckedCreateWithoutAuthorInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forumId: string
    posts?: PostUncheckedCreateNestedManyWithoutTopicInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TopicCreateOrConnectWithoutAuthorInput = {
    where: TopicWhereUniqueInput
    create: XOR<TopicCreateWithoutAuthorInput, TopicUncheckedCreateWithoutAuthorInput>
  }

  export type TopicCreateManyAuthorInputEnvelope = {
    data: TopicCreateManyAuthorInput | TopicCreateManyAuthorInput[]
  }

  export type PostCreateWithoutAuthorInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    topic: TopicCreateNestedOneWithoutPostsInput
    mentions?: MentionCreateNestedManyWithoutPostInput
    moderator?: UserCreateNestedOneWithoutModeratedPostsInput
    reactions?: PostReactionCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutAuthorInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
    mentions?: MentionUncheckedCreateNestedManyWithoutPostInput
    reactions?: PostReactionUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutAuthorInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput>
  }

  export type PostCreateManyAuthorInputEnvelope = {
    data: PostCreateManyAuthorInput | PostCreateManyAuthorInput[]
  }

  export type PmCreateWithoutSenderInput = {
    id?: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
    receiver: UserCreateNestedOneWithoutReceivedMessagesInput
  }

  export type PmUncheckedCreateWithoutSenderInput = {
    id?: string
    receiverId: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type PmCreateOrConnectWithoutSenderInput = {
    where: PmWhereUniqueInput
    create: XOR<PmCreateWithoutSenderInput, PmUncheckedCreateWithoutSenderInput>
  }

  export type PmCreateManySenderInputEnvelope = {
    data: PmCreateManySenderInput | PmCreateManySenderInput[]
  }

  export type PmCreateWithoutReceiverInput = {
    id?: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
    sender: UserCreateNestedOneWithoutSentMessagesInput
  }

  export type PmUncheckedCreateWithoutReceiverInput = {
    id?: string
    senderId: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type PmCreateOrConnectWithoutReceiverInput = {
    where: PmWhereUniqueInput
    create: XOR<PmCreateWithoutReceiverInput, PmUncheckedCreateWithoutReceiverInput>
  }

  export type PmCreateManyReceiverInputEnvelope = {
    data: PmCreateManyReceiverInput | PmCreateManyReceiverInput[]
  }

  export type TopicViewCreateWithoutUserInput = {
    lastViewedAt?: Date | string
    lastPostId?: string | null
    topic: TopicCreateNestedOneWithoutTopicViewsInput
  }

  export type TopicViewUncheckedCreateWithoutUserInput = {
    topicId: string
    lastViewedAt?: Date | string
    lastPostId?: string | null
  }

  export type TopicViewCreateOrConnectWithoutUserInput = {
    where: TopicViewWhereUniqueInput
    create: XOR<TopicViewCreateWithoutUserInput, TopicViewUncheckedCreateWithoutUserInput>
  }

  export type TopicViewCreateManyUserInputEnvelope = {
    data: TopicViewCreateManyUserInput | TopicViewCreateManyUserInput[]
  }

  export type MentionCreateWithoutMentionerInput = {
    id?: string
    createdAt?: Date | string
    readAt?: Date | string | null
    post: PostCreateNestedOneWithoutMentionsInput
    mentionedUser: UserCreateNestedOneWithoutMentionsReceivedInput
  }

  export type MentionUncheckedCreateWithoutMentionerInput = {
    id?: string
    createdAt?: Date | string
    postId: string
    mentionedUserId: string
    readAt?: Date | string | null
  }

  export type MentionCreateOrConnectWithoutMentionerInput = {
    where: MentionWhereUniqueInput
    create: XOR<MentionCreateWithoutMentionerInput, MentionUncheckedCreateWithoutMentionerInput>
  }

  export type MentionCreateManyMentionerInputEnvelope = {
    data: MentionCreateManyMentionerInput | MentionCreateManyMentionerInput[]
  }

  export type MentionCreateWithoutMentionedUserInput = {
    id?: string
    createdAt?: Date | string
    readAt?: Date | string | null
    post: PostCreateNestedOneWithoutMentionsInput
    mentioner: UserCreateNestedOneWithoutMentionsMadeInput
  }

  export type MentionUncheckedCreateWithoutMentionedUserInput = {
    id?: string
    createdAt?: Date | string
    postId: string
    mentionerId: string
    readAt?: Date | string | null
  }

  export type MentionCreateOrConnectWithoutMentionedUserInput = {
    where: MentionWhereUniqueInput
    create: XOR<MentionCreateWithoutMentionedUserInput, MentionUncheckedCreateWithoutMentionedUserInput>
  }

  export type MentionCreateManyMentionedUserInputEnvelope = {
    data: MentionCreateManyMentionedUserInput | MentionCreateManyMentionedUserInput[]
  }

  export type PostCreateWithoutModeratorInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    topic: TopicCreateNestedOneWithoutPostsInput
    author: UserCreateNestedOneWithoutPostsInput
    mentions?: MentionCreateNestedManyWithoutPostInput
    reactions?: PostReactionCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutModeratorInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    mentions?: MentionUncheckedCreateNestedManyWithoutPostInput
    reactions?: PostReactionUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutModeratorInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutModeratorInput, PostUncheckedCreateWithoutModeratorInput>
  }

  export type PostCreateManyModeratorInputEnvelope = {
    data: PostCreateManyModeratorInput | PostCreateManyModeratorInput[]
  }

  export type PostReactionCreateWithoutUserInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    post: PostCreateNestedOneWithoutReactionsInput
  }

  export type PostReactionUncheckedCreateWithoutUserInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    postId: string
  }

  export type PostReactionCreateOrConnectWithoutUserInput = {
    where: PostReactionWhereUniqueInput
    create: XOR<PostReactionCreateWithoutUserInput, PostReactionUncheckedCreateWithoutUserInput>
  }

  export type PostReactionCreateManyUserInputEnvelope = {
    data: PostReactionCreateManyUserInput | PostReactionCreateManyUserInput[]
  }

  export type AccountUpsertWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    update: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
    create: XOR<AccountCreateWithoutUserInput, AccountUncheckedCreateWithoutUserInput>
  }

  export type AccountUpdateWithWhereUniqueWithoutUserInput = {
    where: AccountWhereUniqueInput
    data: XOR<AccountUpdateWithoutUserInput, AccountUncheckedUpdateWithoutUserInput>
  }

  export type AccountUpdateManyWithWhereWithoutUserInput = {
    where: AccountScalarWhereInput
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyWithoutUserInput>
  }

  export type AccountScalarWhereInput = {
    AND?: AccountScalarWhereInput | AccountScalarWhereInput[]
    OR?: AccountScalarWhereInput[]
    NOT?: AccountScalarWhereInput | AccountScalarWhereInput[]
    id?: StringFilter<"Account"> | string
    userId?: StringFilter<"Account"> | string
    type?: StringFilter<"Account"> | string
    provider?: StringFilter<"Account"> | string
    providerAccountId?: StringFilter<"Account"> | string
    refresh_token?: StringNullableFilter<"Account"> | string | null
    access_token?: StringNullableFilter<"Account"> | string | null
    expires_at?: IntNullableFilter<"Account"> | number | null
    token_type?: StringNullableFilter<"Account"> | string | null
    scope?: StringNullableFilter<"Account"> | string | null
    id_token?: StringNullableFilter<"Account"> | string | null
    session_state?: StringNullableFilter<"Account"> | string | null
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
  }

  export type TournamentUpsertWithWhereUniqueWithoutOrganizerInput = {
    where: TournamentWhereUniqueInput
    update: XOR<TournamentUpdateWithoutOrganizerInput, TournamentUncheckedUpdateWithoutOrganizerInput>
    create: XOR<TournamentCreateWithoutOrganizerInput, TournamentUncheckedCreateWithoutOrganizerInput>
  }

  export type TournamentUpdateWithWhereUniqueWithoutOrganizerInput = {
    where: TournamentWhereUniqueInput
    data: XOR<TournamentUpdateWithoutOrganizerInput, TournamentUncheckedUpdateWithoutOrganizerInput>
  }

  export type TournamentUpdateManyWithWhereWithoutOrganizerInput = {
    where: TournamentScalarWhereInput
    data: XOR<TournamentUpdateManyMutationInput, TournamentUncheckedUpdateManyWithoutOrganizerInput>
  }

  export type TournamentScalarWhereInput = {
    AND?: TournamentScalarWhereInput | TournamentScalarWhereInput[]
    OR?: TournamentScalarWhereInput[]
    NOT?: TournamentScalarWhereInput | TournamentScalarWhereInput[]
    id?: StringFilter<"Tournament"> | string
    name?: StringFilter<"Tournament"> | string
    date?: DateTimeFilter<"Tournament"> | Date | string
    location?: StringFilter<"Tournament"> | string
    ville?: StringNullableFilter<"Tournament"> | string | null
    departement?: StringNullableFilter<"Tournament"> | string | null
    region?: StringNullableFilter<"Tournament"> | string | null
    description?: StringNullableFilter<"Tournament"> | string | null
    maxParticipants?: IntNullableFilter<"Tournament"> | number | null
    currentParticipants?: IntFilter<"Tournament"> | number
    preRegistered?: IntFilter<"Tournament"> | number
    days?: StringNullableFilter<"Tournament"> | string | null
    totalMatches?: IntNullableFilter<"Tournament"> | number | null
    price?: FloatNullableFilter<"Tournament"> | number | null
    structure?: StringNullableFilter<"Tournament"> | string | null
    lodgingAtVenue?: BoolFilter<"Tournament"> | boolean
    ruleset?: StringNullableFilter<"Tournament"> | string | null
    mealsIncluded?: BoolFilter<"Tournament"> | boolean
    fridayArrival?: BoolFilter<"Tournament"> | boolean
    gameEdition?: StringNullableFilter<"Tournament"> | string | null
    organizerId?: StringFilter<"Tournament"> | string
  }

  export type TopicUpsertWithWhereUniqueWithoutAuthorInput = {
    where: TopicWhereUniqueInput
    update: XOR<TopicUpdateWithoutAuthorInput, TopicUncheckedUpdateWithoutAuthorInput>
    create: XOR<TopicCreateWithoutAuthorInput, TopicUncheckedCreateWithoutAuthorInput>
  }

  export type TopicUpdateWithWhereUniqueWithoutAuthorInput = {
    where: TopicWhereUniqueInput
    data: XOR<TopicUpdateWithoutAuthorInput, TopicUncheckedUpdateWithoutAuthorInput>
  }

  export type TopicUpdateManyWithWhereWithoutAuthorInput = {
    where: TopicScalarWhereInput
    data: XOR<TopicUpdateManyMutationInput, TopicUncheckedUpdateManyWithoutAuthorInput>
  }

  export type TopicScalarWhereInput = {
    AND?: TopicScalarWhereInput | TopicScalarWhereInput[]
    OR?: TopicScalarWhereInput[]
    NOT?: TopicScalarWhereInput | TopicScalarWhereInput[]
    id?: StringFilter<"Topic"> | string
    title?: StringFilter<"Topic"> | string
    isLocked?: BoolFilter<"Topic"> | boolean
    isSticky?: BoolFilter<"Topic"> | boolean
    isArchived?: BoolFilter<"Topic"> | boolean
    createdAt?: DateTimeFilter<"Topic"> | Date | string
    updatedAt?: DateTimeFilter<"Topic"> | Date | string
    views?: IntFilter<"Topic"> | number
    forumId?: StringFilter<"Topic"> | string
    authorId?: StringFilter<"Topic"> | string
  }

  export type PostUpsertWithWhereUniqueWithoutAuthorInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutAuthorInput, PostUncheckedUpdateWithoutAuthorInput>
    create: XOR<PostCreateWithoutAuthorInput, PostUncheckedCreateWithoutAuthorInput>
  }

  export type PostUpdateWithWhereUniqueWithoutAuthorInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutAuthorInput, PostUncheckedUpdateWithoutAuthorInput>
  }

  export type PostUpdateManyWithWhereWithoutAuthorInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutAuthorInput>
  }

  export type PostScalarWhereInput = {
    AND?: PostScalarWhereInput | PostScalarWhereInput[]
    OR?: PostScalarWhereInput[]
    NOT?: PostScalarWhereInput | PostScalarWhereInput[]
    id?: StringFilter<"Post"> | string
    content?: StringFilter<"Post"> | string
    createdAt?: DateTimeFilter<"Post"> | Date | string
    updatedAt?: DateTimeFilter<"Post"> | Date | string
    topicId?: StringFilter<"Post"> | string
    authorId?: StringFilter<"Post"> | string
    isModerated?: BoolFilter<"Post"> | boolean
    moderationReason?: StringNullableFilter<"Post"> | string | null
    moderatedBy?: StringNullableFilter<"Post"> | string | null
    isDeleted?: BoolFilter<"Post"> | boolean
  }

  export type PmUpsertWithWhereUniqueWithoutSenderInput = {
    where: PmWhereUniqueInput
    update: XOR<PmUpdateWithoutSenderInput, PmUncheckedUpdateWithoutSenderInput>
    create: XOR<PmCreateWithoutSenderInput, PmUncheckedCreateWithoutSenderInput>
  }

  export type PmUpdateWithWhereUniqueWithoutSenderInput = {
    where: PmWhereUniqueInput
    data: XOR<PmUpdateWithoutSenderInput, PmUncheckedUpdateWithoutSenderInput>
  }

  export type PmUpdateManyWithWhereWithoutSenderInput = {
    where: PmScalarWhereInput
    data: XOR<PmUpdateManyMutationInput, PmUncheckedUpdateManyWithoutSenderInput>
  }

  export type PmScalarWhereInput = {
    AND?: PmScalarWhereInput | PmScalarWhereInput[]
    OR?: PmScalarWhereInput[]
    NOT?: PmScalarWhereInput | PmScalarWhereInput[]
    id?: StringFilter<"Pm"> | string
    senderId?: StringFilter<"Pm"> | string
    receiverId?: StringFilter<"Pm"> | string
    subject?: StringFilter<"Pm"> | string
    content?: StringFilter<"Pm"> | string
    createdAt?: DateTimeFilter<"Pm"> | Date | string
    readAt?: DateTimeNullableFilter<"Pm"> | Date | string | null
  }

  export type PmUpsertWithWhereUniqueWithoutReceiverInput = {
    where: PmWhereUniqueInput
    update: XOR<PmUpdateWithoutReceiverInput, PmUncheckedUpdateWithoutReceiverInput>
    create: XOR<PmCreateWithoutReceiverInput, PmUncheckedCreateWithoutReceiverInput>
  }

  export type PmUpdateWithWhereUniqueWithoutReceiverInput = {
    where: PmWhereUniqueInput
    data: XOR<PmUpdateWithoutReceiverInput, PmUncheckedUpdateWithoutReceiverInput>
  }

  export type PmUpdateManyWithWhereWithoutReceiverInput = {
    where: PmScalarWhereInput
    data: XOR<PmUpdateManyMutationInput, PmUncheckedUpdateManyWithoutReceiverInput>
  }

  export type TopicViewUpsertWithWhereUniqueWithoutUserInput = {
    where: TopicViewWhereUniqueInput
    update: XOR<TopicViewUpdateWithoutUserInput, TopicViewUncheckedUpdateWithoutUserInput>
    create: XOR<TopicViewCreateWithoutUserInput, TopicViewUncheckedCreateWithoutUserInput>
  }

  export type TopicViewUpdateWithWhereUniqueWithoutUserInput = {
    where: TopicViewWhereUniqueInput
    data: XOR<TopicViewUpdateWithoutUserInput, TopicViewUncheckedUpdateWithoutUserInput>
  }

  export type TopicViewUpdateManyWithWhereWithoutUserInput = {
    where: TopicViewScalarWhereInput
    data: XOR<TopicViewUpdateManyMutationInput, TopicViewUncheckedUpdateManyWithoutUserInput>
  }

  export type TopicViewScalarWhereInput = {
    AND?: TopicViewScalarWhereInput | TopicViewScalarWhereInput[]
    OR?: TopicViewScalarWhereInput[]
    NOT?: TopicViewScalarWhereInput | TopicViewScalarWhereInput[]
    userId?: StringFilter<"TopicView"> | string
    topicId?: StringFilter<"TopicView"> | string
    lastViewedAt?: DateTimeFilter<"TopicView"> | Date | string
    lastPostId?: StringNullableFilter<"TopicView"> | string | null
  }

  export type MentionUpsertWithWhereUniqueWithoutMentionerInput = {
    where: MentionWhereUniqueInput
    update: XOR<MentionUpdateWithoutMentionerInput, MentionUncheckedUpdateWithoutMentionerInput>
    create: XOR<MentionCreateWithoutMentionerInput, MentionUncheckedCreateWithoutMentionerInput>
  }

  export type MentionUpdateWithWhereUniqueWithoutMentionerInput = {
    where: MentionWhereUniqueInput
    data: XOR<MentionUpdateWithoutMentionerInput, MentionUncheckedUpdateWithoutMentionerInput>
  }

  export type MentionUpdateManyWithWhereWithoutMentionerInput = {
    where: MentionScalarWhereInput
    data: XOR<MentionUpdateManyMutationInput, MentionUncheckedUpdateManyWithoutMentionerInput>
  }

  export type MentionScalarWhereInput = {
    AND?: MentionScalarWhereInput | MentionScalarWhereInput[]
    OR?: MentionScalarWhereInput[]
    NOT?: MentionScalarWhereInput | MentionScalarWhereInput[]
    id?: StringFilter<"Mention"> | string
    createdAt?: DateTimeFilter<"Mention"> | Date | string
    postId?: StringFilter<"Mention"> | string
    mentionerId?: StringFilter<"Mention"> | string
    mentionedUserId?: StringFilter<"Mention"> | string
    readAt?: DateTimeNullableFilter<"Mention"> | Date | string | null
  }

  export type MentionUpsertWithWhereUniqueWithoutMentionedUserInput = {
    where: MentionWhereUniqueInput
    update: XOR<MentionUpdateWithoutMentionedUserInput, MentionUncheckedUpdateWithoutMentionedUserInput>
    create: XOR<MentionCreateWithoutMentionedUserInput, MentionUncheckedCreateWithoutMentionedUserInput>
  }

  export type MentionUpdateWithWhereUniqueWithoutMentionedUserInput = {
    where: MentionWhereUniqueInput
    data: XOR<MentionUpdateWithoutMentionedUserInput, MentionUncheckedUpdateWithoutMentionedUserInput>
  }

  export type MentionUpdateManyWithWhereWithoutMentionedUserInput = {
    where: MentionScalarWhereInput
    data: XOR<MentionUpdateManyMutationInput, MentionUncheckedUpdateManyWithoutMentionedUserInput>
  }

  export type PostUpsertWithWhereUniqueWithoutModeratorInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutModeratorInput, PostUncheckedUpdateWithoutModeratorInput>
    create: XOR<PostCreateWithoutModeratorInput, PostUncheckedCreateWithoutModeratorInput>
  }

  export type PostUpdateWithWhereUniqueWithoutModeratorInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutModeratorInput, PostUncheckedUpdateWithoutModeratorInput>
  }

  export type PostUpdateManyWithWhereWithoutModeratorInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutModeratorInput>
  }

  export type PostReactionUpsertWithWhereUniqueWithoutUserInput = {
    where: PostReactionWhereUniqueInput
    update: XOR<PostReactionUpdateWithoutUserInput, PostReactionUncheckedUpdateWithoutUserInput>
    create: XOR<PostReactionCreateWithoutUserInput, PostReactionUncheckedCreateWithoutUserInput>
  }

  export type PostReactionUpdateWithWhereUniqueWithoutUserInput = {
    where: PostReactionWhereUniqueInput
    data: XOR<PostReactionUpdateWithoutUserInput, PostReactionUncheckedUpdateWithoutUserInput>
  }

  export type PostReactionUpdateManyWithWhereWithoutUserInput = {
    where: PostReactionScalarWhereInput
    data: XOR<PostReactionUpdateManyMutationInput, PostReactionUncheckedUpdateManyWithoutUserInput>
  }

  export type PostReactionScalarWhereInput = {
    AND?: PostReactionScalarWhereInput | PostReactionScalarWhereInput[]
    OR?: PostReactionScalarWhereInput[]
    NOT?: PostReactionScalarWhereInput | PostReactionScalarWhereInput[]
    id?: StringFilter<"PostReaction"> | string
    emoji?: StringFilter<"PostReaction"> | string
    createdAt?: DateTimeFilter<"PostReaction"> | Date | string
    postId?: StringFilter<"PostReaction"> | string
    userId?: StringFilter<"PostReaction"> | string
  }

  export type UserCreateWithoutTournamentsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTournamentsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTournamentsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTournamentsInput, UserUncheckedCreateWithoutTournamentsInput>
  }

  export type UserUpsertWithoutTournamentsInput = {
    update: XOR<UserUpdateWithoutTournamentsInput, UserUncheckedUpdateWithoutTournamentsInput>
    create: XOR<UserCreateWithoutTournamentsInput, UserUncheckedCreateWithoutTournamentsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTournamentsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTournamentsInput, UserUncheckedUpdateWithoutTournamentsInput>
  }

  export type UserUpdateWithoutTournamentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTournamentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ForumCreateWithoutCategoryInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    parentForum?: ForumCreateNestedOneWithoutSubForumsInput
    subForums?: ForumCreateNestedManyWithoutParentForumInput
    topics?: TopicCreateNestedManyWithoutForumInput
  }

  export type ForumUncheckedCreateWithoutCategoryInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    parentForumId?: string | null
    subForums?: ForumUncheckedCreateNestedManyWithoutParentForumInput
    topics?: TopicUncheckedCreateNestedManyWithoutForumInput
  }

  export type ForumCreateOrConnectWithoutCategoryInput = {
    where: ForumWhereUniqueInput
    create: XOR<ForumCreateWithoutCategoryInput, ForumUncheckedCreateWithoutCategoryInput>
  }

  export type ForumCreateManyCategoryInputEnvelope = {
    data: ForumCreateManyCategoryInput | ForumCreateManyCategoryInput[]
  }

  export type ForumUpsertWithWhereUniqueWithoutCategoryInput = {
    where: ForumWhereUniqueInput
    update: XOR<ForumUpdateWithoutCategoryInput, ForumUncheckedUpdateWithoutCategoryInput>
    create: XOR<ForumCreateWithoutCategoryInput, ForumUncheckedCreateWithoutCategoryInput>
  }

  export type ForumUpdateWithWhereUniqueWithoutCategoryInput = {
    where: ForumWhereUniqueInput
    data: XOR<ForumUpdateWithoutCategoryInput, ForumUncheckedUpdateWithoutCategoryInput>
  }

  export type ForumUpdateManyWithWhereWithoutCategoryInput = {
    where: ForumScalarWhereInput
    data: XOR<ForumUpdateManyMutationInput, ForumUncheckedUpdateManyWithoutCategoryInput>
  }

  export type ForumScalarWhereInput = {
    AND?: ForumScalarWhereInput | ForumScalarWhereInput[]
    OR?: ForumScalarWhereInput[]
    NOT?: ForumScalarWhereInput | ForumScalarWhereInput[]
    id?: StringFilter<"Forum"> | string
    name?: StringFilter<"Forum"> | string
    description?: StringNullableFilter<"Forum"> | string | null
    order?: IntFilter<"Forum"> | number
    categoryId?: StringNullableFilter<"Forum"> | string | null
    parentForumId?: StringNullableFilter<"Forum"> | string | null
  }

  export type CategoryCreateWithoutForumsInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
  }

  export type CategoryUncheckedCreateWithoutForumsInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
  }

  export type CategoryCreateOrConnectWithoutForumsInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutForumsInput, CategoryUncheckedCreateWithoutForumsInput>
  }

  export type ForumCreateWithoutSubForumsInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    category?: CategoryCreateNestedOneWithoutForumsInput
    parentForum?: ForumCreateNestedOneWithoutSubForumsInput
    topics?: TopicCreateNestedManyWithoutForumInput
  }

  export type ForumUncheckedCreateWithoutSubForumsInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    categoryId?: string | null
    parentForumId?: string | null
    topics?: TopicUncheckedCreateNestedManyWithoutForumInput
  }

  export type ForumCreateOrConnectWithoutSubForumsInput = {
    where: ForumWhereUniqueInput
    create: XOR<ForumCreateWithoutSubForumsInput, ForumUncheckedCreateWithoutSubForumsInput>
  }

  export type ForumCreateWithoutParentForumInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    category?: CategoryCreateNestedOneWithoutForumsInput
    subForums?: ForumCreateNestedManyWithoutParentForumInput
    topics?: TopicCreateNestedManyWithoutForumInput
  }

  export type ForumUncheckedCreateWithoutParentForumInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    categoryId?: string | null
    subForums?: ForumUncheckedCreateNestedManyWithoutParentForumInput
    topics?: TopicUncheckedCreateNestedManyWithoutForumInput
  }

  export type ForumCreateOrConnectWithoutParentForumInput = {
    where: ForumWhereUniqueInput
    create: XOR<ForumCreateWithoutParentForumInput, ForumUncheckedCreateWithoutParentForumInput>
  }

  export type ForumCreateManyParentForumInputEnvelope = {
    data: ForumCreateManyParentForumInput | ForumCreateManyParentForumInput[]
  }

  export type TopicCreateWithoutForumInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    author: UserCreateNestedOneWithoutTopicsInput
    posts?: PostCreateNestedManyWithoutTopicInput
    topicViews?: TopicViewCreateNestedManyWithoutTopicInput
  }

  export type TopicUncheckedCreateWithoutForumInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    authorId: string
    posts?: PostUncheckedCreateNestedManyWithoutTopicInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TopicCreateOrConnectWithoutForumInput = {
    where: TopicWhereUniqueInput
    create: XOR<TopicCreateWithoutForumInput, TopicUncheckedCreateWithoutForumInput>
  }

  export type TopicCreateManyForumInputEnvelope = {
    data: TopicCreateManyForumInput | TopicCreateManyForumInput[]
  }

  export type CategoryUpsertWithoutForumsInput = {
    update: XOR<CategoryUpdateWithoutForumsInput, CategoryUncheckedUpdateWithoutForumsInput>
    create: XOR<CategoryCreateWithoutForumsInput, CategoryUncheckedCreateWithoutForumsInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutForumsInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutForumsInput, CategoryUncheckedUpdateWithoutForumsInput>
  }

  export type CategoryUpdateWithoutForumsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type CategoryUncheckedUpdateWithoutForumsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
  }

  export type ForumUpsertWithoutSubForumsInput = {
    update: XOR<ForumUpdateWithoutSubForumsInput, ForumUncheckedUpdateWithoutSubForumsInput>
    create: XOR<ForumCreateWithoutSubForumsInput, ForumUncheckedCreateWithoutSubForumsInput>
    where?: ForumWhereInput
  }

  export type ForumUpdateToOneWithWhereWithoutSubForumsInput = {
    where?: ForumWhereInput
    data: XOR<ForumUpdateWithoutSubForumsInput, ForumUncheckedUpdateWithoutSubForumsInput>
  }

  export type ForumUpdateWithoutSubForumsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    category?: CategoryUpdateOneWithoutForumsNestedInput
    parentForum?: ForumUpdateOneWithoutSubForumsNestedInput
    topics?: TopicUpdateManyWithoutForumNestedInput
  }

  export type ForumUncheckedUpdateWithoutSubForumsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    parentForumId?: NullableStringFieldUpdateOperationsInput | string | null
    topics?: TopicUncheckedUpdateManyWithoutForumNestedInput
  }

  export type ForumUpsertWithWhereUniqueWithoutParentForumInput = {
    where: ForumWhereUniqueInput
    update: XOR<ForumUpdateWithoutParentForumInput, ForumUncheckedUpdateWithoutParentForumInput>
    create: XOR<ForumCreateWithoutParentForumInput, ForumUncheckedCreateWithoutParentForumInput>
  }

  export type ForumUpdateWithWhereUniqueWithoutParentForumInput = {
    where: ForumWhereUniqueInput
    data: XOR<ForumUpdateWithoutParentForumInput, ForumUncheckedUpdateWithoutParentForumInput>
  }

  export type ForumUpdateManyWithWhereWithoutParentForumInput = {
    where: ForumScalarWhereInput
    data: XOR<ForumUpdateManyMutationInput, ForumUncheckedUpdateManyWithoutParentForumInput>
  }

  export type TopicUpsertWithWhereUniqueWithoutForumInput = {
    where: TopicWhereUniqueInput
    update: XOR<TopicUpdateWithoutForumInput, TopicUncheckedUpdateWithoutForumInput>
    create: XOR<TopicCreateWithoutForumInput, TopicUncheckedCreateWithoutForumInput>
  }

  export type TopicUpdateWithWhereUniqueWithoutForumInput = {
    where: TopicWhereUniqueInput
    data: XOR<TopicUpdateWithoutForumInput, TopicUncheckedUpdateWithoutForumInput>
  }

  export type TopicUpdateManyWithWhereWithoutForumInput = {
    where: TopicScalarWhereInput
    data: XOR<TopicUpdateManyMutationInput, TopicUncheckedUpdateManyWithoutForumInput>
  }

  export type ForumCreateWithoutTopicsInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    category?: CategoryCreateNestedOneWithoutForumsInput
    parentForum?: ForumCreateNestedOneWithoutSubForumsInput
    subForums?: ForumCreateNestedManyWithoutParentForumInput
  }

  export type ForumUncheckedCreateWithoutTopicsInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    categoryId?: string | null
    parentForumId?: string | null
    subForums?: ForumUncheckedCreateNestedManyWithoutParentForumInput
  }

  export type ForumCreateOrConnectWithoutTopicsInput = {
    where: ForumWhereUniqueInput
    create: XOR<ForumCreateWithoutTopicsInput, ForumUncheckedCreateWithoutTopicsInput>
  }

  export type UserCreateWithoutTopicsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTopicsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTopicsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTopicsInput, UserUncheckedCreateWithoutTopicsInput>
  }

  export type PostCreateWithoutTopicInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    author: UserCreateNestedOneWithoutPostsInput
    mentions?: MentionCreateNestedManyWithoutPostInput
    moderator?: UserCreateNestedOneWithoutModeratedPostsInput
    reactions?: PostReactionCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutTopicInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
    mentions?: MentionUncheckedCreateNestedManyWithoutPostInput
    reactions?: PostReactionUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutTopicInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutTopicInput, PostUncheckedCreateWithoutTopicInput>
  }

  export type PostCreateManyTopicInputEnvelope = {
    data: PostCreateManyTopicInput | PostCreateManyTopicInput[]
  }

  export type TopicViewCreateWithoutTopicInput = {
    lastViewedAt?: Date | string
    lastPostId?: string | null
    user: UserCreateNestedOneWithoutTopicViewsInput
  }

  export type TopicViewUncheckedCreateWithoutTopicInput = {
    userId: string
    lastViewedAt?: Date | string
    lastPostId?: string | null
  }

  export type TopicViewCreateOrConnectWithoutTopicInput = {
    where: TopicViewWhereUniqueInput
    create: XOR<TopicViewCreateWithoutTopicInput, TopicViewUncheckedCreateWithoutTopicInput>
  }

  export type TopicViewCreateManyTopicInputEnvelope = {
    data: TopicViewCreateManyTopicInput | TopicViewCreateManyTopicInput[]
  }

  export type ForumUpsertWithoutTopicsInput = {
    update: XOR<ForumUpdateWithoutTopicsInput, ForumUncheckedUpdateWithoutTopicsInput>
    create: XOR<ForumCreateWithoutTopicsInput, ForumUncheckedCreateWithoutTopicsInput>
    where?: ForumWhereInput
  }

  export type ForumUpdateToOneWithWhereWithoutTopicsInput = {
    where?: ForumWhereInput
    data: XOR<ForumUpdateWithoutTopicsInput, ForumUncheckedUpdateWithoutTopicsInput>
  }

  export type ForumUpdateWithoutTopicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    category?: CategoryUpdateOneWithoutForumsNestedInput
    parentForum?: ForumUpdateOneWithoutSubForumsNestedInput
    subForums?: ForumUpdateManyWithoutParentForumNestedInput
  }

  export type ForumUncheckedUpdateWithoutTopicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    parentForumId?: NullableStringFieldUpdateOperationsInput | string | null
    subForums?: ForumUncheckedUpdateManyWithoutParentForumNestedInput
  }

  export type UserUpsertWithoutTopicsInput = {
    update: XOR<UserUpdateWithoutTopicsInput, UserUncheckedUpdateWithoutTopicsInput>
    create: XOR<UserCreateWithoutTopicsInput, UserUncheckedCreateWithoutTopicsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTopicsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTopicsInput, UserUncheckedUpdateWithoutTopicsInput>
  }

  export type UserUpdateWithoutTopicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTopicsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PostUpsertWithWhereUniqueWithoutTopicInput = {
    where: PostWhereUniqueInput
    update: XOR<PostUpdateWithoutTopicInput, PostUncheckedUpdateWithoutTopicInput>
    create: XOR<PostCreateWithoutTopicInput, PostUncheckedCreateWithoutTopicInput>
  }

  export type PostUpdateWithWhereUniqueWithoutTopicInput = {
    where: PostWhereUniqueInput
    data: XOR<PostUpdateWithoutTopicInput, PostUncheckedUpdateWithoutTopicInput>
  }

  export type PostUpdateManyWithWhereWithoutTopicInput = {
    where: PostScalarWhereInput
    data: XOR<PostUpdateManyMutationInput, PostUncheckedUpdateManyWithoutTopicInput>
  }

  export type TopicViewUpsertWithWhereUniqueWithoutTopicInput = {
    where: TopicViewWhereUniqueInput
    update: XOR<TopicViewUpdateWithoutTopicInput, TopicViewUncheckedUpdateWithoutTopicInput>
    create: XOR<TopicViewCreateWithoutTopicInput, TopicViewUncheckedCreateWithoutTopicInput>
  }

  export type TopicViewUpdateWithWhereUniqueWithoutTopicInput = {
    where: TopicViewWhereUniqueInput
    data: XOR<TopicViewUpdateWithoutTopicInput, TopicViewUncheckedUpdateWithoutTopicInput>
  }

  export type TopicViewUpdateManyWithWhereWithoutTopicInput = {
    where: TopicViewScalarWhereInput
    data: XOR<TopicViewUpdateManyMutationInput, TopicViewUncheckedUpdateManyWithoutTopicInput>
  }

  export type TopicCreateWithoutPostsInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forum: ForumCreateNestedOneWithoutTopicsInput
    author: UserCreateNestedOneWithoutTopicsInput
    topicViews?: TopicViewCreateNestedManyWithoutTopicInput
  }

  export type TopicUncheckedCreateWithoutPostsInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forumId: string
    authorId: string
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TopicCreateOrConnectWithoutPostsInput = {
    where: TopicWhereUniqueInput
    create: XOR<TopicCreateWithoutPostsInput, TopicUncheckedCreateWithoutPostsInput>
  }

  export type UserCreateWithoutPostsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPostsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPostsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
  }

  export type MentionCreateWithoutPostInput = {
    id?: string
    createdAt?: Date | string
    readAt?: Date | string | null
    mentioner: UserCreateNestedOneWithoutMentionsMadeInput
    mentionedUser: UserCreateNestedOneWithoutMentionsReceivedInput
  }

  export type MentionUncheckedCreateWithoutPostInput = {
    id?: string
    createdAt?: Date | string
    mentionerId: string
    mentionedUserId: string
    readAt?: Date | string | null
  }

  export type MentionCreateOrConnectWithoutPostInput = {
    where: MentionWhereUniqueInput
    create: XOR<MentionCreateWithoutPostInput, MentionUncheckedCreateWithoutPostInput>
  }

  export type MentionCreateManyPostInputEnvelope = {
    data: MentionCreateManyPostInput | MentionCreateManyPostInput[]
  }

  export type UserCreateWithoutModeratedPostsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutModeratedPostsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutModeratedPostsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutModeratedPostsInput, UserUncheckedCreateWithoutModeratedPostsInput>
  }

  export type PostReactionCreateWithoutPostInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPostReactionsInput
  }

  export type PostReactionUncheckedCreateWithoutPostInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    userId: string
  }

  export type PostReactionCreateOrConnectWithoutPostInput = {
    where: PostReactionWhereUniqueInput
    create: XOR<PostReactionCreateWithoutPostInput, PostReactionUncheckedCreateWithoutPostInput>
  }

  export type PostReactionCreateManyPostInputEnvelope = {
    data: PostReactionCreateManyPostInput | PostReactionCreateManyPostInput[]
  }

  export type TopicUpsertWithoutPostsInput = {
    update: XOR<TopicUpdateWithoutPostsInput, TopicUncheckedUpdateWithoutPostsInput>
    create: XOR<TopicCreateWithoutPostsInput, TopicUncheckedCreateWithoutPostsInput>
    where?: TopicWhereInput
  }

  export type TopicUpdateToOneWithWhereWithoutPostsInput = {
    where?: TopicWhereInput
    data: XOR<TopicUpdateWithoutPostsInput, TopicUncheckedUpdateWithoutPostsInput>
  }

  export type TopicUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forum?: ForumUpdateOneRequiredWithoutTopicsNestedInput
    author?: UserUpdateOneRequiredWithoutTopicsNestedInput
    topicViews?: TopicViewUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forumId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    topicViews?: TopicViewUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type UserUpsertWithoutPostsInput = {
    update: XOR<UserUpdateWithoutPostsInput, UserUncheckedUpdateWithoutPostsInput>
    create: XOR<UserCreateWithoutPostsInput, UserUncheckedCreateWithoutPostsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPostsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPostsInput, UserUncheckedUpdateWithoutPostsInput>
  }

  export type UserUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type MentionUpsertWithWhereUniqueWithoutPostInput = {
    where: MentionWhereUniqueInput
    update: XOR<MentionUpdateWithoutPostInput, MentionUncheckedUpdateWithoutPostInput>
    create: XOR<MentionCreateWithoutPostInput, MentionUncheckedCreateWithoutPostInput>
  }

  export type MentionUpdateWithWhereUniqueWithoutPostInput = {
    where: MentionWhereUniqueInput
    data: XOR<MentionUpdateWithoutPostInput, MentionUncheckedUpdateWithoutPostInput>
  }

  export type MentionUpdateManyWithWhereWithoutPostInput = {
    where: MentionScalarWhereInput
    data: XOR<MentionUpdateManyMutationInput, MentionUncheckedUpdateManyWithoutPostInput>
  }

  export type UserUpsertWithoutModeratedPostsInput = {
    update: XOR<UserUpdateWithoutModeratedPostsInput, UserUncheckedUpdateWithoutModeratedPostsInput>
    create: XOR<UserCreateWithoutModeratedPostsInput, UserUncheckedCreateWithoutModeratedPostsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutModeratedPostsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutModeratedPostsInput, UserUncheckedUpdateWithoutModeratedPostsInput>
  }

  export type UserUpdateWithoutModeratedPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutModeratedPostsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PostReactionUpsertWithWhereUniqueWithoutPostInput = {
    where: PostReactionWhereUniqueInput
    update: XOR<PostReactionUpdateWithoutPostInput, PostReactionUncheckedUpdateWithoutPostInput>
    create: XOR<PostReactionCreateWithoutPostInput, PostReactionUncheckedCreateWithoutPostInput>
  }

  export type PostReactionUpdateWithWhereUniqueWithoutPostInput = {
    where: PostReactionWhereUniqueInput
    data: XOR<PostReactionUpdateWithoutPostInput, PostReactionUncheckedUpdateWithoutPostInput>
  }

  export type PostReactionUpdateManyWithWhereWithoutPostInput = {
    where: PostReactionScalarWhereInput
    data: XOR<PostReactionUpdateManyMutationInput, PostReactionUncheckedUpdateManyWithoutPostInput>
  }

  export type UserCreateWithoutSentMessagesInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSentMessagesInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSentMessagesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
  }

  export type UserCreateWithoutReceivedMessagesInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutReceivedMessagesInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutReceivedMessagesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
  }

  export type UserUpsertWithoutSentMessagesInput = {
    update: XOR<UserUpdateWithoutSentMessagesInput, UserUncheckedUpdateWithoutSentMessagesInput>
    create: XOR<UserCreateWithoutSentMessagesInput, UserUncheckedCreateWithoutSentMessagesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSentMessagesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSentMessagesInput, UserUncheckedUpdateWithoutSentMessagesInput>
  }

  export type UserUpdateWithoutSentMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSentMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutReceivedMessagesInput = {
    update: XOR<UserUpdateWithoutReceivedMessagesInput, UserUncheckedUpdateWithoutReceivedMessagesInput>
    create: XOR<UserCreateWithoutReceivedMessagesInput, UserUncheckedCreateWithoutReceivedMessagesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutReceivedMessagesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutReceivedMessagesInput, UserUncheckedUpdateWithoutReceivedMessagesInput>
  }

  export type UserUpdateWithoutReceivedMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutReceivedMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutTopicViewsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTopicViewsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTopicViewsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTopicViewsInput, UserUncheckedCreateWithoutTopicViewsInput>
  }

  export type TopicCreateWithoutTopicViewsInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forum: ForumCreateNestedOneWithoutTopicsInput
    author: UserCreateNestedOneWithoutTopicsInput
    posts?: PostCreateNestedManyWithoutTopicInput
  }

  export type TopicUncheckedCreateWithoutTopicViewsInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forumId: string
    authorId: string
    posts?: PostUncheckedCreateNestedManyWithoutTopicInput
  }

  export type TopicCreateOrConnectWithoutTopicViewsInput = {
    where: TopicWhereUniqueInput
    create: XOR<TopicCreateWithoutTopicViewsInput, TopicUncheckedCreateWithoutTopicViewsInput>
  }

  export type UserUpsertWithoutTopicViewsInput = {
    update: XOR<UserUpdateWithoutTopicViewsInput, UserUncheckedUpdateWithoutTopicViewsInput>
    create: XOR<UserCreateWithoutTopicViewsInput, UserUncheckedCreateWithoutTopicViewsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTopicViewsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTopicViewsInput, UserUncheckedUpdateWithoutTopicViewsInput>
  }

  export type UserUpdateWithoutTopicViewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTopicViewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TopicUpsertWithoutTopicViewsInput = {
    update: XOR<TopicUpdateWithoutTopicViewsInput, TopicUncheckedUpdateWithoutTopicViewsInput>
    create: XOR<TopicCreateWithoutTopicViewsInput, TopicUncheckedCreateWithoutTopicViewsInput>
    where?: TopicWhereInput
  }

  export type TopicUpdateToOneWithWhereWithoutTopicViewsInput = {
    where?: TopicWhereInput
    data: XOR<TopicUpdateWithoutTopicViewsInput, TopicUncheckedUpdateWithoutTopicViewsInput>
  }

  export type TopicUpdateWithoutTopicViewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forum?: ForumUpdateOneRequiredWithoutTopicsNestedInput
    author?: UserUpdateOneRequiredWithoutTopicsNestedInput
    posts?: PostUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateWithoutTopicViewsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forumId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    posts?: PostUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type PostCreateWithoutMentionsInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    topic: TopicCreateNestedOneWithoutPostsInput
    author: UserCreateNestedOneWithoutPostsInput
    moderator?: UserCreateNestedOneWithoutModeratedPostsInput
    reactions?: PostReactionCreateNestedManyWithoutPostInput
  }

  export type PostUncheckedCreateWithoutMentionsInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
    reactions?: PostReactionUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutMentionsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutMentionsInput, PostUncheckedCreateWithoutMentionsInput>
  }

  export type UserCreateWithoutMentionsMadeInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMentionsMadeInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMentionsMadeInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMentionsMadeInput, UserUncheckedCreateWithoutMentionsMadeInput>
  }

  export type UserCreateWithoutMentionsReceivedInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMentionsReceivedInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
    postReactions?: PostReactionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMentionsReceivedInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMentionsReceivedInput, UserUncheckedCreateWithoutMentionsReceivedInput>
  }

  export type PostUpsertWithoutMentionsInput = {
    update: XOR<PostUpdateWithoutMentionsInput, PostUncheckedUpdateWithoutMentionsInput>
    create: XOR<PostCreateWithoutMentionsInput, PostUncheckedCreateWithoutMentionsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutMentionsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutMentionsInput, PostUncheckedUpdateWithoutMentionsInput>
  }

  export type PostUpdateWithoutMentionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    topic?: TopicUpdateOneRequiredWithoutPostsNestedInput
    author?: UserUpdateOneRequiredWithoutPostsNestedInput
    moderator?: UserUpdateOneWithoutModeratedPostsNestedInput
    reactions?: PostReactionUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutMentionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    reactions?: PostReactionUncheckedUpdateManyWithoutPostNestedInput
  }

  export type UserUpsertWithoutMentionsMadeInput = {
    update: XOR<UserUpdateWithoutMentionsMadeInput, UserUncheckedUpdateWithoutMentionsMadeInput>
    create: XOR<UserCreateWithoutMentionsMadeInput, UserUncheckedCreateWithoutMentionsMadeInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMentionsMadeInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMentionsMadeInput, UserUncheckedUpdateWithoutMentionsMadeInput>
  }

  export type UserUpdateWithoutMentionsMadeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMentionsMadeInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithoutMentionsReceivedInput = {
    update: XOR<UserUpdateWithoutMentionsReceivedInput, UserUncheckedUpdateWithoutMentionsReceivedInput>
    create: XOR<UserCreateWithoutMentionsReceivedInput, UserUncheckedCreateWithoutMentionsReceivedInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMentionsReceivedInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMentionsReceivedInput, UserUncheckedUpdateWithoutMentionsReceivedInput>
  }

  export type UserUpdateWithoutMentionsReceivedInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMentionsReceivedInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
    postReactions?: PostReactionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PostCreateWithoutReactionsInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
    topic: TopicCreateNestedOneWithoutPostsInput
    author: UserCreateNestedOneWithoutPostsInput
    mentions?: MentionCreateNestedManyWithoutPostInput
    moderator?: UserCreateNestedOneWithoutModeratedPostsInput
  }

  export type PostUncheckedCreateWithoutReactionsInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
    mentions?: MentionUncheckedCreateNestedManyWithoutPostInput
  }

  export type PostCreateOrConnectWithoutReactionsInput = {
    where: PostWhereUniqueInput
    create: XOR<PostCreateWithoutReactionsInput, PostUncheckedCreateWithoutReactionsInput>
  }

  export type UserCreateWithoutPostReactionsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountCreateNestedManyWithoutUserInput
    sessions?: SessionCreateNestedManyWithoutUserInput
    tournaments?: TournamentCreateNestedManyWithoutOrganizerInput
    topics?: TopicCreateNestedManyWithoutAuthorInput
    posts?: PostCreateNestedManyWithoutAuthorInput
    sentMessages?: PmCreateNestedManyWithoutSenderInput
    receivedMessages?: PmCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewCreateNestedManyWithoutUserInput
    mentionsMade?: MentionCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostCreateNestedManyWithoutModeratorInput
  }

  export type UserUncheckedCreateWithoutPostReactionsInput = {
    id?: string
    name?: string | null
    email?: string | null
    emailVerified?: Date | string | null
    image?: string | null
    role?: string
    accounts?: AccountUncheckedCreateNestedManyWithoutUserInput
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    tournaments?: TournamentUncheckedCreateNestedManyWithoutOrganizerInput
    topics?: TopicUncheckedCreateNestedManyWithoutAuthorInput
    posts?: PostUncheckedCreateNestedManyWithoutAuthorInput
    sentMessages?: PmUncheckedCreateNestedManyWithoutSenderInput
    receivedMessages?: PmUncheckedCreateNestedManyWithoutReceiverInput
    topicViews?: TopicViewUncheckedCreateNestedManyWithoutUserInput
    mentionsMade?: MentionUncheckedCreateNestedManyWithoutMentionerInput
    mentionsReceived?: MentionUncheckedCreateNestedManyWithoutMentionedUserInput
    moderatedPosts?: PostUncheckedCreateNestedManyWithoutModeratorInput
  }

  export type UserCreateOrConnectWithoutPostReactionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPostReactionsInput, UserUncheckedCreateWithoutPostReactionsInput>
  }

  export type PostUpsertWithoutReactionsInput = {
    update: XOR<PostUpdateWithoutReactionsInput, PostUncheckedUpdateWithoutReactionsInput>
    create: XOR<PostCreateWithoutReactionsInput, PostUncheckedCreateWithoutReactionsInput>
    where?: PostWhereInput
  }

  export type PostUpdateToOneWithWhereWithoutReactionsInput = {
    where?: PostWhereInput
    data: XOR<PostUpdateWithoutReactionsInput, PostUncheckedUpdateWithoutReactionsInput>
  }

  export type PostUpdateWithoutReactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    topic?: TopicUpdateOneRequiredWithoutPostsNestedInput
    author?: UserUpdateOneRequiredWithoutPostsNestedInput
    mentions?: MentionUpdateManyWithoutPostNestedInput
    moderator?: UserUpdateOneWithoutModeratedPostsNestedInput
  }

  export type PostUncheckedUpdateWithoutReactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    mentions?: MentionUncheckedUpdateManyWithoutPostNestedInput
  }

  export type UserUpsertWithoutPostReactionsInput = {
    update: XOR<UserUpdateWithoutPostReactionsInput, UserUncheckedUpdateWithoutPostReactionsInput>
    create: XOR<UserCreateWithoutPostReactionsInput, UserUncheckedCreateWithoutPostReactionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPostReactionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPostReactionsInput, UserUncheckedUpdateWithoutPostReactionsInput>
  }

  export type UserUpdateWithoutPostReactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUpdateManyWithoutUserNestedInput
    sessions?: SessionUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUpdateManyWithoutAuthorNestedInput
    posts?: PostUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUpdateManyWithoutModeratorNestedInput
  }

  export type UserUncheckedUpdateWithoutPostReactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    emailVerified?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    image?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    accounts?: AccountUncheckedUpdateManyWithoutUserNestedInput
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    tournaments?: TournamentUncheckedUpdateManyWithoutOrganizerNestedInput
    topics?: TopicUncheckedUpdateManyWithoutAuthorNestedInput
    posts?: PostUncheckedUpdateManyWithoutAuthorNestedInput
    sentMessages?: PmUncheckedUpdateManyWithoutSenderNestedInput
    receivedMessages?: PmUncheckedUpdateManyWithoutReceiverNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutUserNestedInput
    mentionsMade?: MentionUncheckedUpdateManyWithoutMentionerNestedInput
    mentionsReceived?: MentionUncheckedUpdateManyWithoutMentionedUserNestedInput
    moderatedPosts?: PostUncheckedUpdateManyWithoutModeratorNestedInput
  }

  export type AccountCreateManyUserInput = {
    id?: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string | null
    access_token?: string | null
    expires_at?: number | null
    token_type?: string | null
    scope?: string | null
    id_token?: string | null
    session_state?: string | null
  }

  export type SessionCreateManyUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type TournamentCreateManyOrganizerInput = {
    id?: string
    name: string
    date: Date | string
    location: string
    ville?: string | null
    departement?: string | null
    region?: string | null
    description?: string | null
    maxParticipants?: number | null
    currentParticipants?: number
    preRegistered?: number
    days?: string | null
    totalMatches?: number | null
    price?: number | null
    structure?: string | null
    lodgingAtVenue?: boolean
    ruleset?: string | null
    mealsIncluded?: boolean
    fridayArrival?: boolean
    gameEdition?: string | null
  }

  export type TopicCreateManyAuthorInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    forumId: string
  }

  export type PostCreateManyAuthorInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
  }

  export type PmCreateManySenderInput = {
    id?: string
    receiverId: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type PmCreateManyReceiverInput = {
    id?: string
    senderId: string
    subject: string
    content: string
    createdAt?: Date | string
    readAt?: Date | string | null
  }

  export type TopicViewCreateManyUserInput = {
    topicId: string
    lastViewedAt?: Date | string
    lastPostId?: string | null
  }

  export type MentionCreateManyMentionerInput = {
    id?: string
    createdAt?: Date | string
    postId: string
    mentionedUserId: string
    readAt?: Date | string | null
  }

  export type MentionCreateManyMentionedUserInput = {
    id?: string
    createdAt?: Date | string
    postId: string
    mentionerId: string
    readAt?: Date | string | null
  }

  export type PostCreateManyModeratorInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    topicId: string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    isDeleted?: boolean
  }

  export type PostReactionCreateManyUserInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    postId: string
  }

  export type AccountUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AccountUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerAccountId?: StringFieldUpdateOperationsInput | string
    refresh_token?: NullableStringFieldUpdateOperationsInput | string | null
    access_token?: NullableStringFieldUpdateOperationsInput | string | null
    expires_at?: NullableIntFieldUpdateOperationsInput | number | null
    token_type?: NullableStringFieldUpdateOperationsInput | string | null
    scope?: NullableStringFieldUpdateOperationsInput | string | null
    id_token?: NullableStringFieldUpdateOperationsInput | string | null
    session_state?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TournamentUpdateWithoutOrganizerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TournamentUncheckedUpdateWithoutOrganizerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TournamentUncheckedUpdateManyWithoutOrganizerInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    location?: StringFieldUpdateOperationsInput | string
    ville?: NullableStringFieldUpdateOperationsInput | string | null
    departement?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    maxParticipants?: NullableIntFieldUpdateOperationsInput | number | null
    currentParticipants?: IntFieldUpdateOperationsInput | number
    preRegistered?: IntFieldUpdateOperationsInput | number
    days?: NullableStringFieldUpdateOperationsInput | string | null
    totalMatches?: NullableIntFieldUpdateOperationsInput | number | null
    price?: NullableFloatFieldUpdateOperationsInput | number | null
    structure?: NullableStringFieldUpdateOperationsInput | string | null
    lodgingAtVenue?: BoolFieldUpdateOperationsInput | boolean
    ruleset?: NullableStringFieldUpdateOperationsInput | string | null
    mealsIncluded?: BoolFieldUpdateOperationsInput | boolean
    fridayArrival?: BoolFieldUpdateOperationsInput | boolean
    gameEdition?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forum?: ForumUpdateOneRequiredWithoutTopicsNestedInput
    posts?: PostUpdateManyWithoutTopicNestedInput
    topicViews?: TopicViewUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forumId?: StringFieldUpdateOperationsInput | string
    posts?: PostUncheckedUpdateManyWithoutTopicNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateManyWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    forumId?: StringFieldUpdateOperationsInput | string
  }

  export type PostUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    topic?: TopicUpdateOneRequiredWithoutPostsNestedInput
    mentions?: MentionUpdateManyWithoutPostNestedInput
    moderator?: UserUpdateOneWithoutModeratedPostsNestedInput
    reactions?: PostReactionUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    mentions?: MentionUncheckedUpdateManyWithoutPostNestedInput
    reactions?: PostReactionUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutAuthorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PmUpdateWithoutSenderInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    receiver?: UserUpdateOneRequiredWithoutReceivedMessagesNestedInput
  }

  export type PmUncheckedUpdateWithoutSenderInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiverId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PmUncheckedUpdateManyWithoutSenderInput = {
    id?: StringFieldUpdateOperationsInput | string
    receiverId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PmUpdateWithoutReceiverInput = {
    id?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sender?: UserUpdateOneRequiredWithoutSentMessagesNestedInput
  }

  export type PmUncheckedUpdateWithoutReceiverInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PmUncheckedUpdateManyWithoutReceiverInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TopicViewUpdateWithoutUserInput = {
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
    topic?: TopicUpdateOneRequiredWithoutTopicViewsNestedInput
  }

  export type TopicViewUncheckedUpdateWithoutUserInput = {
    topicId?: StringFieldUpdateOperationsInput | string
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicViewUncheckedUpdateManyWithoutUserInput = {
    topicId?: StringFieldUpdateOperationsInput | string
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MentionUpdateWithoutMentionerInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    post?: PostUpdateOneRequiredWithoutMentionsNestedInput
    mentionedUser?: UserUpdateOneRequiredWithoutMentionsReceivedNestedInput
  }

  export type MentionUncheckedUpdateWithoutMentionerInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    mentionedUserId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MentionUncheckedUpdateManyWithoutMentionerInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    mentionedUserId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MentionUpdateWithoutMentionedUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    post?: PostUpdateOneRequiredWithoutMentionsNestedInput
    mentioner?: UserUpdateOneRequiredWithoutMentionsMadeNestedInput
  }

  export type MentionUncheckedUpdateWithoutMentionedUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    mentionerId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MentionUncheckedUpdateManyWithoutMentionedUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
    mentionerId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PostUpdateWithoutModeratorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    topic?: TopicUpdateOneRequiredWithoutPostsNestedInput
    author?: UserUpdateOneRequiredWithoutPostsNestedInput
    mentions?: MentionUpdateManyWithoutPostNestedInput
    reactions?: PostReactionUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutModeratorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    mentions?: MentionUncheckedUpdateManyWithoutPostNestedInput
    reactions?: PostReactionUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutModeratorInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    topicId?: StringFieldUpdateOperationsInput | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PostReactionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    post?: PostUpdateOneRequiredWithoutReactionsNestedInput
  }

  export type PostReactionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
  }

  export type PostReactionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    postId?: StringFieldUpdateOperationsInput | string
  }

  export type ForumCreateManyCategoryInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    parentForumId?: string | null
  }

  export type ForumUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    parentForum?: ForumUpdateOneWithoutSubForumsNestedInput
    subForums?: ForumUpdateManyWithoutParentForumNestedInput
    topics?: TopicUpdateManyWithoutForumNestedInput
  }

  export type ForumUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    parentForumId?: NullableStringFieldUpdateOperationsInput | string | null
    subForums?: ForumUncheckedUpdateManyWithoutParentForumNestedInput
    topics?: TopicUncheckedUpdateManyWithoutForumNestedInput
  }

  export type ForumUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    parentForumId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ForumCreateManyParentForumInput = {
    id?: string
    name: string
    description?: string | null
    order?: number
    categoryId?: string | null
  }

  export type TopicCreateManyForumInput = {
    id?: string
    title: string
    isLocked?: boolean
    isSticky?: boolean
    isArchived?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    views?: number
    authorId: string
  }

  export type ForumUpdateWithoutParentForumInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    category?: CategoryUpdateOneWithoutForumsNestedInput
    subForums?: ForumUpdateManyWithoutParentForumNestedInput
    topics?: TopicUpdateManyWithoutForumNestedInput
  }

  export type ForumUncheckedUpdateWithoutParentForumInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    subForums?: ForumUncheckedUpdateManyWithoutParentForumNestedInput
    topics?: TopicUncheckedUpdateManyWithoutForumNestedInput
  }

  export type ForumUncheckedUpdateManyWithoutParentForumInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    order?: IntFieldUpdateOperationsInput | number
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicUpdateWithoutForumInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    author?: UserUpdateOneRequiredWithoutTopicsNestedInput
    posts?: PostUpdateManyWithoutTopicNestedInput
    topicViews?: TopicViewUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateWithoutForumInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
    posts?: PostUncheckedUpdateManyWithoutTopicNestedInput
    topicViews?: TopicViewUncheckedUpdateManyWithoutTopicNestedInput
  }

  export type TopicUncheckedUpdateManyWithoutForumInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    isLocked?: BoolFieldUpdateOperationsInput | boolean
    isSticky?: BoolFieldUpdateOperationsInput | boolean
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    views?: IntFieldUpdateOperationsInput | number
    authorId?: StringFieldUpdateOperationsInput | string
  }

  export type PostCreateManyTopicInput = {
    id?: string
    content: string
    createdAt?: Date | string
    updatedAt?: Date | string
    authorId: string
    isModerated?: boolean
    moderationReason?: string | null
    moderatedBy?: string | null
    isDeleted?: boolean
  }

  export type TopicViewCreateManyTopicInput = {
    userId: string
    lastViewedAt?: Date | string
    lastPostId?: string | null
  }

  export type PostUpdateWithoutTopicInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    author?: UserUpdateOneRequiredWithoutPostsNestedInput
    mentions?: MentionUpdateManyWithoutPostNestedInput
    moderator?: UserUpdateOneWithoutModeratedPostsNestedInput
    reactions?: PostReactionUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateWithoutTopicInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
    mentions?: MentionUncheckedUpdateManyWithoutPostNestedInput
    reactions?: PostReactionUncheckedUpdateManyWithoutPostNestedInput
  }

  export type PostUncheckedUpdateManyWithoutTopicInput = {
    id?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    authorId?: StringFieldUpdateOperationsInput | string
    isModerated?: BoolFieldUpdateOperationsInput | boolean
    moderationReason?: NullableStringFieldUpdateOperationsInput | string | null
    moderatedBy?: NullableStringFieldUpdateOperationsInput | string | null
    isDeleted?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TopicViewUpdateWithoutTopicInput = {
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutTopicViewsNestedInput
  }

  export type TopicViewUncheckedUpdateWithoutTopicInput = {
    userId?: StringFieldUpdateOperationsInput | string
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TopicViewUncheckedUpdateManyWithoutTopicInput = {
    userId?: StringFieldUpdateOperationsInput | string
    lastViewedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastPostId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MentionCreateManyPostInput = {
    id?: string
    createdAt?: Date | string
    mentionerId: string
    mentionedUserId: string
    readAt?: Date | string | null
  }

  export type PostReactionCreateManyPostInput = {
    id?: string
    emoji: string
    createdAt?: Date | string
    userId: string
  }

  export type MentionUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    mentioner?: UserUpdateOneRequiredWithoutMentionsMadeNestedInput
    mentionedUser?: UserUpdateOneRequiredWithoutMentionsReceivedNestedInput
  }

  export type MentionUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mentionerId?: StringFieldUpdateOperationsInput | string
    mentionedUserId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type MentionUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mentionerId?: StringFieldUpdateOperationsInput | string
    mentionedUserId?: StringFieldUpdateOperationsInput | string
    readAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PostReactionUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPostReactionsNestedInput
  }

  export type PostReactionUncheckedUpdateWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type PostReactionUncheckedUpdateManyWithoutPostInput = {
    id?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userId?: StringFieldUpdateOperationsInput | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}