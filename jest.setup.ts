/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input: any, init: any) {
      // no-op
    }
  } as any
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body?: any, init?: any) {
       // no-op
    }
  } as any
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
      constructor(init?: any) {}
      append() {}
      delete() {}
      get() { return null }
      has() { return false }
      set() {}
      forEach() {}
  } as any
}
