const decoded = btoa("Hello");
console.log(decoded); // SGVsbG8=
console.log(atob(decoded)); // Hello

console.log(btoa("Hello😊")); // err:  [InvalidCharacterError]: Invalid character
