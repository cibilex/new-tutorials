- (People don't understand OOP)[https://blog.sigma-star.io/2024/01/people-dont-understand-oop/]
- (Modern Javascript)(https://javascript.info/private-protected-properties-methods)
# OOP

- OOP is a design model that organizes and structures code. Object-oriented programs are made up of objects.

- An object is a collection of state and procedures. An object bundles state (data) and procedures (methods/functions that act on that state). Objects can also encapsulate their state or procedures by means of public, private, or protected prefixes.

- Classes are not necessary for object-oriented programming. They are just an easy way to define objects. For example, we can also use constructor functions in JavaScript to create objects. Objects are the core of OOP, but classes are not. They are just a way to define objects. For example these definitions are the same.

    - ```js
      function Dog(name, age) {
          this.name = name;
          this.age = age;
          this.bark = function() {
              console.log("Woof! My name is " + this.name + " and I am " + this.age + " years old.");
          };
      }

      Dog.prototype.sleep = function() {
          console.log(this.name + " is sleeping.");
      }
      Dog.prototype.owner = "John";

      const dog1 = new Dog("Coco", 3);

      console.log(dog1.name); // Output: Coco
      dog1.bark(); // Output: Woof! My name is Coco and I am 3 years old.
      ```

    - ```ts
      class Dog {
          constructor(name, age) {
              this.name = name;
              this.age = age;
          }
          bark() {
              console.log("Woof! My name is " + this.name + " and I am " + this.age + " years old.");
          }
      }

      Dog.prototype.sleep = function() {
          console.log(this.name + " is sleeping.");
      }
      Dog.prototype.owner = "John";

      const dog1 = new Dog("Coco", 3);

      console.log(dog1.name); // Output: Coco
      dog1.bark(); // Output: Woof! My name is Coco and I am 3 years old.
      ```

## Key OOP Principles: Subtyping, Encapsulation, and Object Creation

Below is a comparison of prominent OOP languages and how they support key OOP principles.

| Language     | Objs | Obj Creation        | Encapsulation             | Subtyping                                  |
|--------------|------|---------------------|----------------------------|---------------------------------------------|
| JavaScript   | ✔️   | Classes / Prototypes| ✔️ (since ES2022)          | Inheritance / Duck typing                   |
| TypeScript   | ✔️   | Classes / Prototypes| ✔️                          | Inheritance / Structural typing / Duck typing |
| Python       | ✔️   | Classes              | ❌ (not on a language level)| Inheritance / Duck typing                   |
| Go           | ✔️   | Structs              | ✔️ (on package level)       | Structural typing                           |
| Rust         | ✔️   | Structs              | ✔️                          | Extension Traits / Nominal typing           |
