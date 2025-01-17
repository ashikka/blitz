import {z} from "zod"
import {formatZodErrors, validateZodSchema} from "./index"

const validateSchema = (schema: any, input: any) => {
  const result = schema.safeParse(input)
  if (result.success) throw new Error("Schema should not return success")
  return result.error.format()
}

const Schema = z.object({
  test: z.string(),
})

describe("formatZodErrors", () => {
  it("formats the zod error", () => {
    expect(formatZodErrors(validateSchema(Schema, {}))).toEqual({
      test: "Required",
    })
  })

  const NestedSchema = z.object({
    test: z.string(),
    nested: z.object({
      foo: z.string(),
      test: z.string(),
    }),
  })

  it("formats the nested zod error", () => {
    expect(
      formatZodErrors(validateSchema(NestedSchema, {test: "yo", nested: {foo: "yo"}})),
    ).toEqual({
      nested: {test: "Required"},
    })
  })

  const DoubleNestedSchema = z.object({
    test: z.string(),
    nested: z.object({
      test: z.string(),
      doubleNested: z.object({
        test: z.string(),
      }),
    }),
  })

  it("formats 2 levels nested zod error", () => {
    expect(
      formatZodErrors(
        validateSchema(DoubleNestedSchema, {
          nested: {doubleNested: {}},
        }),
      ),
    ).toEqual({
      test: "Required",
      nested: {test: "Required", doubleNested: {test: "Required"}},
    })
  })
})

describe("validateZodSchema", () => {
  it("passes validation", () => {
    expect(validateZodSchema(Schema)({test: "test"})).toEqual({})
  })

  it("fails validation", () => {
    expect(validateZodSchema(Schema)({})).toEqual({test: "Required"})
  })
})
