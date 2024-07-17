If you use the @apollo/server with @as-integrations/fastify package with multiple GraphQL endpoints in a single application, make sure to enable the disableHealthCheck setting in the GraphQLModule configuration.
https://sabinadams.hashnode.dev/end-to-end-type-safety-what-why-and-how

1. end to end typing
2. apollo sandbox
3. schema first approach
4. mercurius vs apollo
5. generics: `https://docs.nestjs.com/graphql/resolvers#generics`
6. union types


__dirname: current directory
process.cwd(): root directory of the project.


when working with graphql resolveField,new ValidationPipe>whitelist option must be false cause it prevent to populate field.


Graphql is a query builder for APIs.
`npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql`


```ts
//app.module.ts
@Module({
  exports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'), // also can be true to save schema on the memory. 
      playground: true
    })
  ]
})
export class AppModule {}
```

async configuration:
```ts
@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvType, true>) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('MODE', { infer: true }) === Modes.DEV
      })
    }),
  ],
})
export class AppModule {}
```

Here are some options:
- **playground** :  determines whether use in-browser interactive graphql IDE,
- **autoSchemaFile**: determines file to save automatically created graphql schema.Can be set `true` to create graphql schema on the memory,
- **sortSchema**: true,
- **include**: [UserModule]


Now,let's create our model and resolvers.

```ts
// src/graphql/models/order.model.ts
@ObjectType()
export class Order { 
  @Field(() => Int) // refers to type number
  id: number

  @Field()
  address: string

  @Field()
  phone: string
}
```

While doesn't necessary to manually specified   string and boolean types, `number` type must used with `Int` or `Float`.Also `@Field` decorator takes some extra options:
- nullable: used to specify the member is nullable or not.When working with array,if array items can be null,`nullable:true` can be enough but if bot array and its items can be null `nullable:nullable: 'itemsAndList'` must be determined.
- description: used to write a description
- deprecationReason: used to mark as deprecated member.
  
Array types also must be manually denoted with Field.

as well as @Args decorator has these options,and has these extre options:
`defaultValue`: defines default value
`type`: defines type

```ts
// src/graphql/resolvers/order.resolver.ts
@Resolver(() => Order)
export class OrderResolver {
  @Query(() => [Order]) 
  getOrders() {
    return orders
  }

  @Query(() => Order, { nullable: true }) // We add nullable:false so that graphql doesn't throw err if any order not found
  findOrder(@Args('id', { type: () => Int }) id: number) { // { type: () => Int } added to validate parameter
    return orders.find(order => order.id === id)
  }
}
```

The last thing create a file called order.ts and add some mock orders.

```ts
//src/data/orders.ts
export const orders = [
  {
    id: 1,
    address: 'United States',
    phone: '0213212323'
  },
  {
    id: 2,
    address: 'United Kingdom',
    phone: '213123212'
  },
  {
    id: 3,
    address: 'Taiwan',
    phone: '021321232321'
  }
]
```

That's it,on http://localhost:3000/graphql you should see the  a playground page to test our resolvers.Also you may have awared that schema.graphql file created automatically.This file represents our raw graphql code.
So,let's make some requests :
```bash
query { 
getOrders{
  id
  address
}
}
```

the result must be:
```json
{
  "data": {
    "getOrders": [
      {
        "id": 1,
        "address": "United States"
      },
      {
        "id": 2,
        "address": "United Kingdom"
      },
      {
        "id": 3,
        "address": "Taiwan"
      }
    ]
  }
}
```

query 2:
```bash
query { 
findOrder(id:2){
  phone
}
}
```

result 2:
```json
{
  "data": {
    "findOrder": {
      "phone": "213123212"
    }
  }
}
```

That's it.Let's make an advanced example.Let's add order item strategy and try to get items data.To do that 
```ts
//src/graphql/models/oder-item.model.ts
@ObjectType()
export class OrderItem {
  @Field(() => Int)
  id: number

  @Field(() => Int)
  orderId: number

  @Field()
  title: string
}
```

```ts
// src/data/order-items.ts
export const orderItems = [
  {
    id: 21,
    orderId: 1,
    title: 'hi world'
  },
  {
    id: 22,
    orderId: 2,
    title: 'hi venus'
  },
  {
    id: 23,
    orderId: 23,
    title: 'hi saturn'
  }
]
```

```ts
// src/graphql/resolvers/order.resolver.ts
  @ResolveField(() => [OrderItem], { nullable: true, name: 'items' })
  getItems(@Parent() order: Order) {
    return orderItems.filter(item => item.orderId === order.id)
  }
```

That's it if we send a below request:
```bash
query { 
getOrders{
  phone
  items {id title}
}
}
```

the result will be:

```json
{
  "data": {
    "getOrders": [
      {
        "phone": "0213212323",
        "items": [
          {
            "id": 21,
            "title": "hi world"
          }
        ]
      },
      {
        "phone": "213123212",
        "items": [
          {
            "id": 22,
            "title": "hi venus"
          }
        ]
      },
      {
        "phone": "021321232321",
        "items": []
      }
    ]
  }
}
```


## Mutations

GraphQL does not provide different methods like REST APIs but there are two basic request type in GraphQL.standart query and mutations.With mutations we we can make changes with sent data.


```ts
// src/graphql/resolvers/order.resolver.ts
  @Mutation(() => Order)
  createOrder(
    @Args('address') address: string,
    @Args('phone', { nullable: true }) phone: string
  ) {
    const order: Order = {
      id: Math.floor(Math.random() * 10000),
      address,
      phone
    }
    orders.push(order)

    return order
  }
```

If we send below request:
```bash
mutation { 
createOrder(address:"China",phone:"092132122"){
  phone
  address
  id
  items {id title}
}
}
```

the result will be:
```json
{
  "data": {
    "createOrder": {
      "phone": "092132122",
      "address": "China",
      "id": 4039,
      "items": []
    }
  }
}
```

the better way is using inputTypes:
```ts
// src/graphql/inputs/create-order.input.ts

@InputType()
export class CreateOrderInput {
  @Field()
  address: string

  @Field({ nullable: true })
  phone?: string
}
```

Models and Args can inherite each other.
```ts
@ObjectType()
export class BaseModel {
  @Field(() => Int)
  id: number

  @Field()
  firstName: string
}

@ObjectType()
export class User extends BaseModel {
  @Field({ nullable: true })
  email: string

  @Field(type => Setting, { nullable: true })
  setting?: Setting
}
```

or args

```ts
@ArgsType()
export class BaseArgs {
  @Field()
  firstName: string
}

@ArgsType()
export class CreateUserArgs extends BaseArgs {
  @Field({ nullable: true })
  email: string
}
//
  @Mutation(() => User)
  createUser(@Args() args: CreateUserArgs) {
 // 
  }

```


`@Info`: information about execution state of query
`@Context`: used to contain per-request state.

## Types
scalar types in graphql are like JavaScript primitive values.They define the types of the fields that cannot be subdivided any further.
- **Int**: A signed 32‐bit integer.
- **Float**: A signed double-precision floating point value.
- **String**: UTF-8 character sequence
- **Boolean**: true or false
- **ID**: string unique idendifier.
- **Enumeration-enum**: used to restrict data with a specified values.
- 
```ts
registerEnumType(CommonTableStatuses, {
  name: 'CommonTableStatuses'
})
@ArgsType()
export class BaseArgs {
  @Field()
  firstName: string
}

@ArgsType()
export class CreateUserArgs extends BaseArgs {
  @Field({ nullable: true })
  email: string

  @Field(() => CommonTableStatuses)
  status: CommonTableStatuses
}
```
example request:
```ts
mutation {
  createUser(firstName:"cibilex",email:"l@l.com",status:DELETED){
    firstName
  }
}
```

**Aliases** : They allow us to rename field whatever we want to reuse a query or mutation.
```bash
mutation {
  first:createUser(firstName:"cibilex",email:"l@l.com",status:DELETED){
    firstName,
    email,
    id
  },
  second:createUser(firstName:"cibilex",email:"l2@l.com",status:DELETED){
    firstName,
    email,
    id
  }
}
```
first and second are aliases.

**fragments**: As you above example,we have written twice the same code for payload.To maintain code,below is a better way thanks to fragments.
```bash
mutation {
  first:createUser(firstName:"cibilex",email:"l@l.com",status:DELETED){
    ...Payload
  },
  second:createUser(firstName:"cibilex",email:"l@l.com",status:DELETED){
    ...Payload
  }
}

fragment Payload on User{
firstName email id
}
```

Also values can be used with requests:


**Directives**: are used to add extra features and generate complex requests.
- ***@include(if: Boolean)***: include if condition is true
- ***@skip(if: Boolean)***: ship if condition is true

Also custom directives can be generated.

- While query fields are executed in parallel, mutation fields run in series, one after the other.
- Each field on each type is backed by a function called the resolver which is provided by the GraphQL server developer. When a field is executed, the corresponding resolver is called to produce the next value.If a field produces a scalar value like a string or number, then the execution completes. However if a field produces an object value then the query will contain another selection of fields which apply to that object. This continues until scalar values are reached. GraphQL queries always end at scalar values.


GRAPHQL-REST API
- client sends HTTP request for both
- Server determines the payload in REST API while client can just ask for fields he needs in graphql
- in REST,accessible resources are described with a linear list of endpoints while Schemas are used in GraphQL.