- We cannot send emails with simple username and passwords anymore. [issue](https://stackoverflow.com/questions/45478293/username-and-password-not-accepted-when-using-nodemailer)
- HTTP : (Hyper Text Transfer Protocol) Hiper Metin Transferi Protokolü.
- HTTPS: (Hyper Text Transfer Protocol Secure) Hiper Metin Transferi Protokolü – Güvenli.
- SOAP:(Simple Object Access Protocol) Basit Nesne Erişim Protokolü. Dağıtık uygulamalarda
  ve web servislerinin haberleşmesinde kullanılmak üzere tasarlanan sunucu/istemci
  mantığına dayalı iletişim protokolüdür.
- SSL: (Secure Sockets Layer) Bilginin bütünlüğü ve gizliliği için, İnternet üzerinde iki taraf
  arasında oluşan trafiğin şifrelenerek, gizliliğinin ve bütünlüğünün korunmasını sağlayan bir
  protokoldür.
- https://notebooklm.google/?gad_source=1&gad_campaignid=22712476265&gbraid=0AAAAA-fwSsfRgUNpiw7Flfz7buQg-Gmuy&gclid=CjwKCAjw-svEBhB6EiwAEzSdrk8CtAxDVKaLJUbpSy9ka8RHeZFxck_qbxMlP-WC1FFCoIMX1UFHjhoCwzsQAvD_BwE

# TypeScript Type Guards

Type guards are like bouncers at a club - they check if something is allowed in and tell TypeScript "trust me, I know what type this is." They're especially useful when you have functions that can return multiple types.

## Simple Example

```typescript
// Basic function that can return success or error
function processTask(taskId: string): SuccessResponse | ErrorResponse {
  if (taskId === "bad") {
    return { type: "error", message: "Task failed" };
  }
  return { type: "success", data: "Task completed" };
}

// Type guard function
function isSuccessResponse(
  response: SuccessResponse | ErrorResponse
): response is SuccessResponse {
  return response.type === "success";
}

// Usage
const result = processTask("123");
if (isSuccessResponse(result)) {
  // TypeScript now knows result is SuccessResponse
  console.log(result.data); // ✅ Works
} else {
  // TypeScript knows result is ErrorResponse
  console.log(result.message); // ✅ Works
}
```

## Complex Example

Let's see both the correct and incorrect ways to handle type guards:

```typescript
// Complex response types
type BatchResponse =
  | { status: "success"; data: ProcessedItem[] }
  | { status: "partial"; data: ProcessedItem[]; errors: string[] }
  | { status: "error"; message: string };

// ❌ WRONG WAY: Without type guard
function isSuccessfulBatchWrong(response: BatchResponse): boolean {
  return response.status === "success";
}

// ✅ CORRECT WAY: With type guard
function isSuccessfulBatch(
  response: BatchResponse
): response is { status: "success"; data: ProcessedItem[] } {
  return response.status === "success";
}

// Usage examples
const batchResults: BatchResponse[] = [
  { status: "success", data: [{ id: 1, processed: true }] },
  {
    status: "partial",
    data: [{ id: 2, processed: true }],
    errors: ["Item 3 failed"],
  },
  { status: "error", message: "Batch failed" },
];

// Filter successful results and map their data
const successfulData = batchResults
  .filter(isSuccessfulBatch)
  .map((result) => result.data);
```

## The `is` Keyword

The `is` keyword in a type guard is like a contract with TypeScript. It says:

- "If this function returns true, the parameter is definitely of this type"
- It's a promise to TypeScript that you know what you're doing
- TypeScript will trust your judgment and provide proper type checking

https://semaphore.io/blog/test-driven-development
