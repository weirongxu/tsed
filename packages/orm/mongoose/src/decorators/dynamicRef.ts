import {StoreMerge, Type, useDecorators} from "@tsed/core";
import {Description, Example, lazyRef, OneOf, Property, string} from "@tsed/schema";
import {Schema as MongooseSchema} from "mongoose";
import {MONGOOSE_SCHEMA} from "../constants/constants";

/**
 * Define a property as mongoose reference to other Model (decorated with @Model).
 *
 * ### Example
 *
 * ```typescript
 * @Model()
 * class FooModel {
 *
 *    @DynamicRef('type')
 *    field: DynamicRef<OtherFooModel | OtherModel>
 *
 *    @Enum(['OtherFooModel', 'OtherModel'])
 *    type: string
 * }
 *
 * @Model()
 * class OtherFooModel {
 * }
 *
 * @Model()
 * class OtherModel {
 * }
 * ```
 *
 * @param refPath
 * @returns {Function}
 * @decorator
 * @mongoose
 * @property
 */
export function DynamicRef(refPath: string, ...types: Type<any>[]): PropertyDecorator {
  return useDecorators(
    Property(Object),
    Example("5ce7ad3028890bd71749d477"),
    Description("Mongoose Ref ObjectId"),
    StoreMerge(MONGOOSE_SCHEMA, {
      type: MongooseSchema.Types.ObjectId,
      refPath
    }),
    OneOf(string().example("5ce7ad3028890bd71749d477").description("Mongoose Ref ObjectId"), ...types)
  ) as PropertyDecorator;
}

export type DynamicRef<T> = T | string;
