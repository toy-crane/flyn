/// <reference types="bun" />

// Metro turns the stylesheet into a side effect; TypeScript needs to be told.
declare module "*.css" {}
