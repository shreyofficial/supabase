import { expect, test, beforeAll, afterAll } from 'vitest'
import pgMeta from '../src/index'
import { createTestDatabase, cleanupRoot } from './db/utils'

beforeAll(async () => {
  // Any global setup if needed
})

afterAll(async () => {
  await cleanupRoot()
})

const withTestDatabase = (
  name: string,
  fn: (db: Awaited<ReturnType<typeof createTestDatabase>>) => Promise<void>
) => {
  test(name, async () => {
    const db = await createTestDatabase()
    try {
      await fn(db)
    } finally {
      await db.cleanup()
    }
  })
}

withTestDatabase('list functions', async ({ executeQuery }) => {
  const { sql, zod } = await pgMeta.functions.list()
  const res = zod.parse(await executeQuery(sql))

  // Test for the 'add' function created in init.sql
  const addFunction = res.find(({ name }) => name === 'add')
  expect(addFunction).toMatchInlineSnapshot(
    { id: expect.any(Number) },
    `
    {
      "args": [
        {
          "has_default": false,
          "mode": "in",
          "name": "",
          "table_name": null,
          "type_id": 23,
        },
        {
          "has_default": false,
          "mode": "in",
          "name": "",
          "table_name": null,
          "type_id": 23,
        },
      ],
      "argument_types": "integer, integer",
      "behavior": "IMMUTABLE",
      "complete_statement": "CREATE OR REPLACE FUNCTION public.add(integer, integer)
     RETURNS integer
     LANGUAGE sql
     IMMUTABLE STRICT
    AS $function$select $1 + $2;$function$
    ",
      "config_params": null,
      "definition": "select $1 + $2;",
      "id": Any<Number>,
      "identity_argument_types": "integer, integer",
      "is_set_returning_function": false,
      "language": "sql",
      "name": "add",
      "return_table_name": null,
      "return_type": "integer",
      "return_type_id": 23,
      "return_type_relation_id": null,
      "returns_multiple_rows": false,
      "returns_set_of_table": false,
      "schema": "public",
      "security_definer": false,
    }
  `
  )
})

withTestDatabase(
  'list set-returning function with single object limit',
  async ({ executeQuery }) => {
    const { sql, zod } = await pgMeta.functions.list()
    const res = zod.parse(await executeQuery(sql))

    const singleRowFunction = res.find(({ name }) => name === 'get_user_audit_setof_single_row')
    expect(singleRowFunction).toMatchInlineSnapshot(
      { id: expect.any(Number) },
      `
      {
        "args": [
          {
            "has_default": false,
            "mode": "in",
            "name": "user_row",
            "table_name": "users",
            "type_id": 16395,
          },
        ],
        "argument_types": "user_row users",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION public.get_user_audit_setof_single_row(user_row users)
       RETURNS SETOF users_audit
       LANGUAGE sql
       STABLE ROWS 1
      AS $function$
        SELECT * FROM public.users_audit WHERE user_id = user_row.id;
      $function$
      ",
        "config_params": null,
        "definition": "
        SELECT * FROM public.users_audit WHERE user_id = user_row.id;
      ",
        "id": Any<Number>,
        "identity_argument_types": "user_row users",
        "is_set_returning_function": true,
        "language": "sql",
        "name": "get_user_audit_setof_single_row",
        "return_table_name": "users_audit",
        "return_type": "SETOF users_audit",
        "return_type_id": 16418,
        "return_type_relation_id": 16416,
        "returns_multiple_rows": false,
        "returns_set_of_table": true,
        "schema": "public",
        "security_definer": false,
      }
    `
    )
  }
)

withTestDatabase(
  'list set-returning function with multiples definitions',
  async ({ executeQuery }) => {
    const { sql, zod } = await pgMeta.functions.list()
    const res = zod.parse(await executeQuery(sql))

    const multipleRowsFunctions = res.filter(({ name }) => name === 'get_todos_setof_rows')
    expect(multipleRowsFunctions).toMatchInlineSnapshot(
      expect.arrayContaining(
        multipleRowsFunctions.map((func) => ({ ...func, id: expect.any(Number) }))
      ),
      `
    [
      {
        "args": [
          {
            "has_default": false,
            "mode": "in",
            "name": "user_row",
            "table_name": "users",
            "type_id": 16395,
          },
        ],
        "argument_types": "user_row users",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION public.get_todos_setof_rows(user_row users)
     RETURNS SETOF todos
     LANGUAGE sql
     STABLE
    AS $function$
      SELECT * FROM public.todos WHERE "user-id" = user_row.id;
    $function$
    ",
        "config_params": null,
        "definition": "
      SELECT * FROM public.todos WHERE "user-id" = user_row.id;
    ",
        "id": 16492,
        "identity_argument_types": "user_row users",
        "is_set_returning_function": true,
        "language": "sql",
        "name": "get_todos_setof_rows",
        "return_table_name": "todos",
        "return_type": "SETOF todos",
        "return_type_id": 16404,
        "return_type_relation_id": 16402,
        "returns_multiple_rows": true,
        "returns_set_of_table": true,
        "schema": "public",
        "security_definer": false,
      },
      {
        "args": [
          {
            "has_default": false,
            "mode": "in",
            "name": "todo_row",
            "table_name": "todos",
            "type_id": 16404,
          },
        ],
        "argument_types": "todo_row todos",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION public.get_todos_setof_rows(todo_row todos)
     RETURNS SETOF todos
     LANGUAGE sql
     STABLE
    AS $function$
      SELECT * FROM public.todos WHERE "user-id" = todo_row."user-id";
    $function$
    ",
        "config_params": null,
        "definition": "
      SELECT * FROM public.todos WHERE "user-id" = todo_row."user-id";
    ",
        "id": 16493,
        "identity_argument_types": "todo_row todos",
        "is_set_returning_function": true,
        "language": "sql",
        "name": "get_todos_setof_rows",
        "return_table_name": "todos",
        "return_type": "SETOF todos",
        "return_type_id": 16404,
        "return_type_relation_id": 16402,
        "returns_multiple_rows": true,
        "returns_set_of_table": true,
        "schema": "public",
        "security_definer": false,
      },
    ]
  `
    )
  }
)

withTestDatabase('list functions with included schemas', async ({ executeQuery }) => {
  const { sql, zod } = await pgMeta.functions.list({
    includedSchemas: ['public'],
  })
  const res = zod.parse(await executeQuery(sql))

  expect(res.length).toBeGreaterThan(0)
  res.forEach((func) => {
    expect(func.schema).toBe('public')
  })
})

withTestDatabase('list functions with excluded schemas', async ({ executeQuery }) => {
  const { sql, zod } = await pgMeta.functions.list({
    excludedSchemas: ['public'],
  })
  const res = zod.parse(await executeQuery(sql))

  res.forEach((func) => {
    expect(func.schema).not.toBe('public')
  })
})

withTestDatabase(
  'list functions with excluded schemas and include System Schemas',
  async ({ executeQuery }) => {
    const { sql, zod } = await pgMeta.functions.list({
      excludedSchemas: ['public'],
      includeSystemSchemas: true,
    })
    const res = zod.parse(await executeQuery(sql))

    expect(res.length).toBeGreaterThan(0)
    res.forEach((func) => {
      expect(func.schema).not.toBe('public')
    })
  }
)

withTestDatabase('retrieve, create, update, delete', async ({ executeQuery }) => {
  // Create function
  const { sql: createSql } = await pgMeta.functions.create({
    name: 'test_func',
    schema: 'public',
    args: ['a int2', 'b int2'],
    definition: 'select a + b',
    return_type: 'integer',
    language: 'sql',
    behavior: 'STABLE',
    security_definer: true,
    config_params: { search_path: 'hooks, auth', role: 'postgres' },
  })
  await executeQuery(createSql)

  // // Retrieve function
  const { sql: retrieveSql, zod: retrieveZod } = await pgMeta.functions.retrieve({
    name: 'test_func',
    schema: 'public',
    args: ['a int2', 'b int2'],
  })
  const retrieve = await executeQuery(retrieveSql)
  const res = retrieveZod.parse(retrieve[0])
  const functionId = res!.id
  expect({ data: res, error: null }).toMatchInlineSnapshot(
    { data: { id: expect.any(Number) } },
    `
    {
      "data": {
        "args": [
          {
            "has_default": false,
            "mode": "in",
            "name": "a",
            "table_name": null,
            "type_id": 21,
          },
          {
            "has_default": false,
            "mode": "in",
            "name": "b",
            "table_name": null,
            "type_id": 21,
          },
        ],
        "argument_types": "a smallint, b smallint",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION public.test_func(a smallint, b smallint)
     RETURNS integer
     LANGUAGE sql
     STABLE SECURITY DEFINER
     SET search_path TO 'hooks', 'auth'
     SET role TO 'postgres'
    AS $function$select a + b$function$
    ",
        "config_params": {
          "role": "postgres",
          "search_path": "hooks, auth",
        },
        "definition": "select a + b",
        "id": Any<Number>,
        "identity_argument_types": "a smallint, b smallint",
        "is_set_returning_function": false,
        "language": "sql",
        "name": "test_func",
        "return_table_name": null,
        "return_type": "integer",
        "return_type_id": 23,
        "return_type_relation_id": null,
        "returns_multiple_rows": false,
        "returns_set_of_table": false,
        "schema": "public",
        "security_definer": true,
      },
      "error": null,
    }
  `
  )
  // create test_schema to move the function into:
  const { sql: createSchemaSql } = await pgMeta.schemas.create({ name: 'test_schema' })
  await executeQuery(createSchemaSql)
  const { sql: updateSql } = await pgMeta.functions.update(res!, {
    name: 'test_func_renamed',
    schema: 'test_schema',
    definition: 'select b - a',
  })
  await executeQuery(updateSql)

  const { sql: retrieveRenamedSql } = await pgMeta.functions.retrieve({ id: functionId })
  const retrieveRenamed = await executeQuery(retrieveRenamedSql)
  const resUpdated = retrieveZod.parse(retrieveRenamed[0])
  expect({ data: resUpdated, error: null }).toMatchInlineSnapshot(
    { data: { id: expect.any(Number) } },
    `
    {
      "data": {
        "args": [
          {
            "has_default": false,
            "mode": "in",
            "name": "b",
            "table_name": null,
            "type_id": 21,
          },
          {
            "has_default": false,
            "mode": "in",
            "name": "a",
            "table_name": null,
            "type_id": 21,
          },
        ],
        "argument_types": "a smallint, b smallint",
        "behavior": "STABLE",
        "complete_statement": "CREATE OR REPLACE FUNCTION test_schema.test_func_renamed(a smallint, b smallint)
     RETURNS integer
     LANGUAGE sql
     STABLE SECURITY DEFINER
     SET role TO 'postgres'
     SET search_path TO 'hooks', 'auth'
    AS $function$select b - a$function$
    ",
        "config_params": {
          "role": "postgres",
          "search_path": "hooks, auth",
        },
        "definition": "select b - a",
        "id": Any<Number>,
        "identity_argument_types": "a smallint, b smallint",
        "is_set_returning_function": false,
        "language": "sql",
        "name": "test_func_renamed",
        "return_table_name": null,
        "return_type": "integer",
        "return_type_id": 23,
        "return_type_relation_id": null,
        "returns_multiple_rows": false,
        "returns_set_of_table": false,
        "schema": "test_schema",
        "security_definer": true,
      },
      "error": null,
    }
  `
  )

  // Remove function
  const { sql: removeSql } = await pgMeta.functions.remove(resUpdated!)
  await executeQuery(removeSql)
  // Verify function is removed
  const { sql: verifyRemoveSql } = await pgMeta.functions.retrieve({ id: functionId })
  const result = await executeQuery(verifyRemoveSql)
  expect(result).toHaveLength(0)
})

withTestDatabase('retrieve set-returning function', async ({ executeQuery }) => {
  // Retrieve function
  const { sql: retrieveSql, zod: retrieveZod } = await pgMeta.functions.retrieve({
    schema: 'public',
    name: 'function_returning_set_of_rows',
    args: [],
  })
  const retrieve = await executeQuery(retrieveSql)
  const res = retrieveZod.parse(retrieve[0])
  expect(res).toMatchInlineSnapshot(
    {
      id: expect.any(Number),
      return_type_id: expect.any(Number),
      return_type_relation_id: expect.any(Number),
    },
    `
    {
      "args": [],
      "argument_types": "",
      "behavior": "STABLE",
      "complete_statement": "CREATE OR REPLACE FUNCTION public.function_returning_set_of_rows()
     RETURNS SETOF users
     LANGUAGE sql
     STABLE
    AS $function$
      select * from public.users;
    $function$
    ",
      "config_params": null,
      "definition": "
      select * from public.users;
    ",
      "id": Any<Number>,
      "identity_argument_types": "",
      "is_set_returning_function": true,
      "language": "sql",
      "name": "function_returning_set_of_rows",
      "return_table_name": "users",
      "return_type": "SETOF users",
      "return_type_id": Any<Number>,
      "return_type_relation_id": Any<Number>,
      "returns_multiple_rows": true,
      "returns_set_of_table": true,
      "schema": "public",
      "security_definer": false,
    }
  `
  )
})

withTestDatabase('create function with various config_params values', async ({ executeQuery }) => {
  // Set initial application_name for consistent testing
  await executeQuery("SET application_name = 'current-app-name'")

  const { sql: createSql1 } = await pgMeta.functions.create({
    name: 'test_func_config_1',
    schema: 'public',
    definition: 'select 1',
    return_type: 'integer',
    language: 'sql',
    config_params: {
      search_path: '""', // Should become ''
      application_name: 'FROM CURRENT', // Special syntax: SET param FROM CURRENT
      work_mem: "'8MB'", // Regular syntax: SET param TO value
    },
  })
  await executeQuery(createSql1)

  // Verify the function was created correctly
  const { sql: retrieveSql1, zod: retrieveZod } = await pgMeta.functions.retrieve({
    name: 'test_func_config_1',
    schema: 'public',
    args: [],
  })
  const result1 = retrieveZod.parse((await executeQuery(retrieveSql1))[0])

  expect(result1).toBeDefined()
  expect(result1!.config_params).toEqual({
    search_path: '""',
    application_name: 'current-app-name',
    work_mem: '8MB',
  })

  // Clean up
  const { sql: removeSql1 } = await pgMeta.functions.remove(result1!)
  await executeQuery(removeSql1)
})
