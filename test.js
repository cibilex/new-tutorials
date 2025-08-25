writeName("cibilex"); // cibilex
function writeName(name) {
  console.log(name);
}

// Option 1: Move the function before usage
var writeAge = (age) => console.log(age);
console.log(writeAge);

// Option 2: Or use function declaration instead of var
// function writeAge(age) {
//   console.log(age);
// }
