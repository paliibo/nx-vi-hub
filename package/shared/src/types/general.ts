import { initContract } from "@ts-rest/core";

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
export type ContractInstance = ReturnType<typeof initContract>;

export type ObjectValues<T extends object> = T[keyof T];
