1. nest-cli(create project,create module,services ...)
2. nest with fastify
3. services,service with variable,controllers ,Decorators
4. modules,dynamic,moduleRef
5. nest/config
6. middlewares
7. built-in pipes,class-validator,class-transformers
8. exceptions,built in exceptions,custom exceptions,exception filter(handler)
9. encrypt vs hash vs dechipher


Not: Authentication

nest
https://www.youtube.com/watch?v=tC9llkCzvl8
https://www.youtube.com/watch?v=xzu3QXwo1BU&list=PL_cUvD4qzbkw-phjGK2qq0nQiGtjkwC9llkCzvl86gw1cKK
fireship

https://docs.nestjs.com/fundamentals/dynamic-modules#community-guidelines

https://docs.nestjs.com/fundamentals/injection-scopes

Global Prefix:
Application routes should start with api,with `setGlobalPrefix` can be achived easily to set global prefix.

```ts
app.setGlobalPrefix("api");
```

Also there is another feature we should use which is versioning.Nest provides four different types to add versioning but we'll merely talk about URI versioning.URI versionin sets a prefix for specified controllers.Also a default version can be declared.

```ts
app.setGlobalPrefix("api");
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: "1",
});
```

Due to above code,for example,if our route path is '/test',then will be `/api/v1/test`;

To change version of a controller,`version` option can be used.

```ts
@Controller({
  path: 'test',
  version: '2',
})
```

After that our path will be `/api/v2/test`

The last trick is to disable to create files when using @nestjs/cli.To instantiate it,when `nest ng co test` command runs,two folder will be created which are `test.controller.ts` and `test.controller.spec.ts`.To disable spec files and let it to create just controller file below configurations should be done.

```ts
// nest-cli.json
{
  "generateOptions": {
    "spec": false
  }
}

```

Middlewares
NestJS middlewares yapı olarak Express middlewareleri ile aynıdır.Handlerdan önce çalışırlar ve req,res objeleri üzerinde modify işlemi veya loglama gibi herhangi bir amaç için kullanılabilirler.
Middlewareler class veya fonksiyon olabilir ve req,res,next olmak üzere üç parametre alırlar.Class olarak kullanırken type desteği için `NestMiddleware` den implement edilebilir.

Fastify middlewareler için req,res değerlerinde raw hallerini sunar çünkü Wrapper işlemi middleware aşamasından sonra olur.Bu yüzden .send gibi methodlar middlewarelerde değil hooklarda(mesela preHandler) gibi aşamalarda kullanılabilir.
Middleware modüle eklemek için module classının içerisindeki use fonksiyonu kullanılır.use fonksiyonu consumer parametresini alır ve consumer.apply(Middleware) yöntemi ile module eklenir.

Bulunduğu module içerisindeki providerları veya global providerları inject edebilir.

```ts
///autheticate/authenticate.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { FastifyRequest, FastifyReply } from "fastify";
@Injectable()
export class AuthenticateMiddleware implements NestMiddleware {
  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    console.log("hi world from middleware");
    next();
  }
}

//app.module.ts
@Module({
  imports: [
    UserModule,
    Env.register({
      global: true,
    }),
  ],
  controllers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticateMiddleware).forRoutes("/user");
  }
}
```

Note: Expressten farklı olarak Fastify middleware içerisinde response döndürülemez.!!

`forRoutes` ile uygulanacak pathler veya `exclude` ile uygulanmayacak pathler belirtilebilir.Ayrıca forRoutes('/user') yazmak yerine forRoutes({ path: '/user', method: RequestMethod.GET }) gibi bir özelleştirme yapılarak sadece GET methodu içinde çalıştırılabilir.Her iki fonksiyounda rest parameter tipindedir yani istenildiği kadar parametre eklenebilir.

Ayrıca main.ts dosyasında app.use(middleware) ile global olarak eklenebilir.Functional middleware sadece global olarak kullanılabilir.Class versiyonunda .forRoutes('*') denilirse aynı anlama gelir.


```ts
///autheticate/authenticate.middleware.ts

import { FastifyRequest, FastifyReply } from "fastify";

export function AuthenticateMiddleware(
  req: FastifyRequest["raw"],
  res: FastifyReply["raw"],
  next: () => void
) {
  console.log("hi world from middleware");
  next();
}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    })
  );
  app.use(AuthenticateMiddleware);
  await app.listen(3000, "0.0.0.0");
}

bootstrap();
```

**Exception Filters**
They are responsible to handle unhandled exceptions accross the entire application.Default olarak
tüm hatalar InternalServerErrorException tarafından ele alınır aşağıdaki response verilir.

```ts
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

Bunun yerine Base Exception filter olan HttpException , HttpException'dan türetilmiş built-in exceptionları veya custom exceptionslar ile exceptionslar ele alınabilir.
HttpException(response: string | Record<string, any>, status: number): ilk parametre string verilirse
{
"statusCode": HttpCode,
"message": "given string"
}
şeklinde olurken obje verilirse objenin kendisi return edilir.Mesela aşağıdaki kod

```ts
  getUsers() {
    throw new HttpException(
      { status: HttpStatus.UNAUTHORIZED, content: 'Unauthorized' },
      HttpStatus.UNAUTHORIZED,
    );
  }
```

Aşağıdaki responsu döndürür.

```json
{
  "status": 401,
  "content": "Unauthorized"
}
```

Yukarıdaki kodu basitleştirmek için aşağıdaki gibi built-in Exceptionslar kullanılabilir.

```ts
throw new UnauthorizedException();
```

Ayrıca özel exceptionlar oluşturabiliriz aşağıdaki gibi

```ts
import { HttpException, HttpStatus } from "@nestjs/common";

export class CompletedException extends HttpException {
  constructor(msg: string = "Completed") {
    super(msg, HttpStatus.FORBIDDEN);
  }
}
```

Veya tüm durumlarda kullanabileceğimiz ortak bir exception handlerı kullanabiliriz.

```ts
// http-exception-filter.ts
import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();
    const content = exception.getResponse();
    const success = status < HttpStatus.BAD_REQUEST;
    response.status(status).send({
      message:
        typeof content == "string"
          ? content
          : "message" in content
          ? content.message
          : exception.message,
      success,
      timestamp: new Date().toISOString(),
    });
  }
}
```

Birkaç farklı kullanım yöntemi mevcuttur.

1. Kullanılacak yerlerde @UseFilters(exceptionFilter) ile import etmek:

```ts
  @UseFilters(HttpExceptionFilter)
  async getAll() {
    throw new UnauthorizedException();
  }
```

1. controller-scope olarak kullanma.

```ts
@UseFilters(HttpExceptionFilter)
@Controller({
  path: 'user',
})
```

1. global-scope olarak kullanma

```ts
//main.ts
app.useGlobalFilters(new HttpExceptionFilter());
```
4. Global-scope olarak kullanma vol2:app.module.ts>providers içine
```ts
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    }
```
Bu yöntemler hata ayıklamamızı inanılmaz derecede kolaylaştırır :))))

Pipes

pipelar temel olarak validasyon veya transformation için kullanılır.ParseIntPipe,ParseFloatPipe,ParseBoolPipe,ParseUUIDPipe ve pek çok built-in pipe mevcuttur ve gelen veriyi verify ederler eğer
istenen tipe dönüşebiliyor ise dönüşür yoksa exception fırlatır.

```ts
 @Get(':id')
  async getUser(@Param('id', ParseBoolPipe) id: number) {
    return 'hi world' + id;
  }
```

DefaultValuePipe değerin undefined veya null gelmesi durumunda default değeri kullanmak için kullanılır.

```ts
  @Get(':id')
  async getUser(
    @Query('id', new DefaultValuePipe(0), ParseIntPipe) id: number,
  ) {
    return 'hi world' + id;
  }
```

Peki Middlewareler varken neden Pipe kullanılır?
NestJS middlewareleri handlerlardan önce çalışır ancak handler ile birebir ilişkisi yoktur ve handlerdaki parametre ve parametrelerin typelarına erişimi yoktur.Bu yüzden Pipelar kullanılır.

Note: Hem class-validator hemde class-transformer ile çalışırken interface ve typeların yerine classları kullanmalıyız çünkü interface ve typelar compile-itme aşamasında silinirler.Ayrıca aynı nedenden dolayı import DTO yıu import ederken `import type { CreateInvoice }` değil,`import  { CreateInvoice }` import yapılmalı.
class-validator: classlar ile beraber kullanılan decoratorlar ile validasyon işlemleri yapmamızı sağlar.

`npm i class-validator class-transformer`
Nestjs built-in `ValidationPipe` ile class-validator ve class-transformer desteği sunar.Global olarak uygulamamıza ekleyelim

```ts
//main.ts
app.useGlobalPipes(new ValidationPipe()); //{} options
```

İlk örneği yapalım:

```ts
// dto/create-invoice.ts
import { IsInt, IsString, MinLength, Min } from 'class-validator';
export class CreateInvoice {
  @IsString()
  @MinLength(2)
  title: string;

  @IsInt()
  @Min(2000)
  year: number;
}


// invoice.controller.ts
  @Post()
  createInvoice(@Body() body: CreateInvoice) {
    const newInvoice = this.invoiceService.createInvoice(body);
    return newInvoice;
  }
```

aşağıdaki body ile istek atıldığında

```ts
{
    "title":"example title"
}
```

aşağıdaki yanıt döner

```ts
{
  "message": [
    "year must not be less than 2000",
    "year must be an integer number"
  ],
  "success": false,
  "timestamp": "2024-01-16T17:47:25.033Z"
}
```

Temel kullanım bu şekilde.Alabileceği seçeneklere bakalım  
disableErrorMessages: Hata mesajlarını iletmek yerine hep,`"message": "Bad Request"` mesajının dönmesini sağlar.  
enableDebugMessages: beklenmedik durumlarda consola loglama yapmasını sağlar.  
whitelist: Decorator ile herhangi bir validasyon işlemi eklenmeyen propertyleri response değerinde çıkartır.  
forbidNonWhitelisted: Decorator ile herhangi validasyon işlemi eklenmeyen bir property gelirse Exception fırlatır.`whitelist` ile beraber kullanılmalı.  
transform:true : istekte gelen vanilla js objesini classa dönüştürmek için kullanılır.Böylece classımızdaki fonksiyonlarla beraber bir class instance oluşur.

transformOptions: { enableImplicitConversion: true }: Gelen verilerin DTO(Data transfer Object,also known as input validation type) da belirtilen özelliğin tipine dönüşmesini sağlar.Bu özellik pek çok hatadan kaçınmamızı sağlar.  
transformOptions: { enableImplicitConversion: true } ve transform:true özelliği ile aşağıdaki faydalar sağlanır.

```ts

//create-invoice.dtp.ts
export class CreateInvoice {
  @IsNumber()
  year: number;

  writeYear() {
    console.log('hi world');
  }
}

//invoice.controller.ts
 @Post(':year')
  createInvoice(@Param() params: CreateInvoice) {
    params.writeYear(); // hi world
    console.log(typeof params.year) // number
    return params;
  }
```

Mapped Types:
Classlar ile validasyon ve transformation işlemlerini yaptığımız için ve değerlerin compile-time aşamasında silinmemesi için
TypeScriptin Utility typelarını kullanamayız.Bunların yerine NestJS bize built-in bazı Mapped typelar sunar.Açıklamalarını yapmayacağız çünkü TypeScriptteki utility type işleminin aynısını veriler üzerinde yaparlar.TypeScript serimizi okumadıysanız lütfen buraya tıklayarak göz atın.
Mapped types paketini indirmeliyiz. `npm i @nestjs/mapped-types`
1. PartialType >Partial
2. PickType>Pick
3. OmitType>Omit
4. IntersectionTpe: iki classı birleşiminden oluşan yeni bir class oluşturur.

Aşağıdaki gibi DTO tanımlamalarında yardımcı olurlar:

```ts
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";
import { PartialType, PickType } from "@nestjs/mapped-types";

export class CreateInvoiceDto {
  @IsString()
  @MinLength(4)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsInt()
  @Min(1950)
  @Max(2000)
  year: number;
}

export class UpdateInvoiceDto extends PartialType(
  PickType(CreateInvoiceDto, ["title", "description"])
) {}
```

### Validation nested objects

@ValidateNested decorator is used to validate nested objects or arrays.
@Type decorator is used to explicitly describe the type of an property.With nested objects all the we must use the @Type decorator because of TypeScript doesn't have enough good reflection abilities yet.
So let's make an example which validate arrays

```ts
export class PriceCell {
  @IsInt()
  @Min(1)
  price: number;

  @IsString()
  symbol: string;
}

export class CreateInvoiceDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(3)
  @ValidateNested()
  @Type(() => PriceCell)
  prices: PriceCell[];
}
```

## ArgumentsHost and ExecutionContext

ArgumentsHost: uygun contexti seçip handlera atanan verilere erişebilmek için kullanılır.Mesela HTTP contextinde req,res,next var iken websocketlerde clientlar bulunur.İlgili yerlerde işlemlerde yardımcı olması için guards,filters ve interseptorlarda parametre olarak verilir.Mesela Exception filtresi örneği yapalım:

```ts
const ctx = host.switchToHttp();
const response = ctx.getResponse<FastifyReply>();
const request = ctx.getRequest<FastifyRequest>();
```

ExecutionContext: ArgumentsHost dan extend edilmiştir ve güncel handler ve controllerların classlarına erişmek için kullanılır.Classlardan yeni instancelar oluşturmaz,oluşan instanceları kullandığı için kullanımına dikkat edilmeli.
ExecutionContext.getClass() : kullanılan controllerı temsil edere.
ExecutionContext.getHandler() :kullanılan handlerı temsil eder.

##Guards

Daha öncede bahsettiğimiz gibi middlewareler kendisinden sonra hangi fonksiyonun çalışacağını bilmedikleri için yetkilendirme için kullanılmaları kullanışlı değildir.Guardslar ExecutionContexte erişimleri vardır,bu nedenle yetkilendirme için kullanılırlar.
Guardlar controller-scoped,method-scoped veya global-scoped olabilirler.

Bir guardın return değeri false ise handlera erişilemez ve 403 hata kodu döner.

##Metadata  
Metadata genelde yetkilendirme için kullanılan ve controller veya handlera eklenebilen bilgilerdir.Bu bilgiler Guards veya Inteseptorlarda alınarak kullanılırlar.
`@SetMetaData(keyName,value)`  
`@UseGuards(guards)` : Controller veya handlerda kullanılacak Guardsları eklemek için kullanılır.

Mesela handlerları giriş gerektirme-gerektirmeme durumlarına göre metadatalar ekleyerek authorization işlemi için aşağıdaki gibi bir yöntem kullanabiliriz.

```ts
// auth.guard.ts

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const auth = this.reflector.get('auth', ctx.getHandler());
    console.log('auth', auth);

    return true;
  }
}

// invoice.controller.ts
  @Get()
  @SetMetadata('auth', true)
  @UseGuards(AuthGuard)
  getInvoices() {
    return this.invoiceService.getInvoices();
  }
```

Yukarıda gördüğünüz gibi AuthGuard isimli bir Guard oluşturduk ve GET /invoice routerına ekledik.SetMetadata('auth',true) ile {auth:false} gibi bir meta data eklemiş olduk.Bu router gelecek her istekte AuthGuard çalışır ve console 'true' false yazılır.

Yukarıda gördüğünüz gibi @SetMetadata('auth', true) kısmındaki 'auth' her yerde manual yazmak hem hamallık hemde type desteğinden yoksun.Bunun yerine Reflector classını kullanabiliriz.

```ts
//auth.decorator.ts
export const Auth = Reflector.createDecorator<boolean>();

// auth.guard.ts
const auth = this.reflector.get(Auth, ctx.getHandler());

// invoice.controller.ts
@Auth(true)

```

Gördüğünüz gibi hem daha basit,hemde typelar üzerinden gidildiği için hata yapılmasını engeller.

Reflector classı ayrıca 2 kullanışlı fonksiyon daha sunar
.getall(decorator,[]):her birini array indexi olarak döner.
.getAllAndOverride(Decorator, []): girilen değerleri teke indirir. Sondan başlar ve çalıştırır,başa gelirken ezer.
..reflector.getAllAndMerge(Decorator,[]): girilen değerlerin tamamını içeren bir array oluşturur.

Bir Guardı global olarak kullanmak için

```ts
// main.ts
app.useGlobalGuards(new AuthGuard(new Reflector()));
```

Bu yöntem ile global olarak eklenen guardlar NestJS modülleri ayağa kalktıktan sonra eklenir.Bu nedenle Dependecy Injectiona dahil edilmezler.Bu sorunu çözmek ve yukardaki yöntem yerine,herhangi bir module içerisine `provide:APP_GUARD` tokenı ile eklemek daha kullanışlıdır.

```ts
@Module({
  imports: [
    JwtModule.register({
      secret: 'hi world',
      global: true,
    }),
  ]}
```

a decorator is a higher-function that takes some information from the class used and do useful things with them.Decorators can be used for class,class properties,class functions and even parameters of a class function.
So let's instantiate;

```ts
//my-decorator.ts
export const MyDecorator = (constructor: typeof InvoiceController) =>
  console.log("hi world from my decorator", constructor.name); // hi world from my decorator InvoiceController

// invoice.controller.ts
@MyDecorator
@Controller("invoice")
export class InvoiceController {}
```

Basitçe Bir tane decorator kullandık.NestJS,bu decorator yaklaşımını kullanarak mükemmel bir çalışma ortamı sağlar.Her ihtiyacımız için sıfırdan decorator oluşturmak yerine NestJS Reflector,createParamDecorator gibi pek çok kullanışlı fonksiyon-class sağlar.
createParamDecorator fonksiyonu heryerde kullanabileceğimiz ve her seferinde req.user.id veya request.user diyerek bilgilerini extract etmek yerine bunu yapabilmemizi sağlayan bir fonksiyon yapalım.

```ts
//user.decorator.ts
export const User = createParamDecorator(
  (data: keyof UserT, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();
    return data ? request.user?.[data] : request.user;
  },
);

// invocei.controller.ts
  @Get()
  getInvoices(@User('id') id: UserT['id']) {
    console.log(id);
    return id;
  }


  // src>types>fastify.ts  extend fastify request ,add request.user type
import fastify from 'fastify';
declare module 'fastify' {
  export interface FastifyRequest {
    user?: { id: number; username: string };
  }
}

```

Moreover,multiple guards ana bir decorator içine toplanabilir.

```ts
// custom.decorator.ts
export const Custom = (auth: boolean) =>
  applyDecorators(
    HttpCode(HttpStatus.ACCEPTED),
    Auth(auth),
    UseGuards(AuthGuard),
  );

// invoice.controller.ts

  @Custom(true)
  getInvoices(@User('id') id: UserT['id']) {}
```

Note: Global olarak ekleyebildiğimiz itemları tekrar özetleyelim:  
app.use(NestMiddleware): Global olarak middleware eklemek için kullanılır.  
app.useGlobalFilters(HttpException): Global olarak Exception eklemek için kullanılır  
app.useGlobalPipes(PipeTransform): Global olarak Pipe eklemek için kullanılır  
app.useGlobalGuards(CanActivate):Global olarak Guards eklemek için kullanılır.

Lifecycle Events:
![lifecyle-hooks](https://docs.nestjs.com/assets/lifecycle-events.png)
onModuleInit ve onModuleDestroy listenerların çalışma sırası Controller >Service>Module şeklindedir.
Her listener memory kaynağını tükettiği için(consume),default olarak onModuleDestroy,beforeApplicationShutdown,onApplicationShutdown sadece app.close()
fonksiyonu için çalışır.Yani system sinyallerinde çalışmaz.Sistem sinyallerinde çalışmasını sağlamak için

```ts
//main.ts
app.enableShutdownHooks();
```

Controller ve Module classlarımızda tüm listenerları eklediğimizi düşünelim.Aşağıda Module örneği bulunmaktadır,Controllerda da aynı şekilde kullanabiliriz.

```ts
@Module({
  providers: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule
  implements
    OnModuleInit,
    OnModuleDestroy,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown
{
  onModuleInit() {
    console.log("module:onModuleInit");
  }
  onApplicationBootstrap() {
    console.log("module:onApplicationBootstrap");
  }
  onModuleDestroy() {
    console.log("module:OnModuleDestroy");
  }
  beforeApplicationShutdown() {
    console.log("module:beforeApplicationShutdown");
  }
  onApplicationShutdown() {
    console.log("module:onApplicationShutdown");
  }
}
```

app.close() veya ctrl+c ile uygulamayı kapatırsak aşağıdaki sıralamayı görürüz:

```bash
[Nest] 23327  - 01/21/2024, 7:49:00 AM     LOG [RoutesResolver] InvoiceController {/invoice}: +1ms
controller:onModuleInit
module:onModuleInit
controller:onApplicationBootstrap
module:onApplicationBootstrap
[Nest] 23327  - 01/21/2024, 7:49:00 AM     LOG [NestApplication] Nest application successfully started +0ms
application inited
^Ccontroller:OnModuleDestroy
module:OnModuleDestroy
controller:beforeApplicationShutdown
module:beforeApplicationShutdown
controller:onApplicationShutdown
module:onApplicationShutdown
```

Authorization:

0Auth(Open Authorization) bir clientin kendisine verilmiş bir cryptographic token ile kaynak sahibinin adına işlem yapabilmesi için yetkilendirilmesini sağlayan açık kaynaklı bir frameworktur.
![auth-image](https://assets.digitalocean.com/articles/oauth/auth_code_flow.png)

Note:Kullanılacak tüm parametre ve değerleri case sensitive yapıda olmalıdır.

Bearer token göndermenin 3 temel yolu vardır:

1. As a value of "Authorization" parameter in request header: Authorization: Bearer mF_9.B5f-4.1JqM
2. As a value of "access_token" parameter in request body:Bu seçenekte Headers bölümündeki Content-Type:"application/x-www-form-urlencoded" olarak verilmelidir.
3. As a value of 'access_token' parameter in request query:

İlk yol önerilen ve en güvenli yoldur.

Authorization işlemlerini yapmanın 2 temel yolu vardır.

1. jsonwebtoken: OAuth yaklaşımını benimseyen ve tokenları herhangi bir yere kaydetmeden yetkilendirme işlemlerini sağlar.Bu sayede memory veya ekstra adımlara gerek kalmaz.
2. Redis veya db ye kaydedilen tokenlar ile:Redis veya db ye tokenlar kaydedilip yetkilendirme işlemleri yapar.
   1

jsonwebtoken:
Yetkilendirme için jwt tokeni oluşturma,doğrulama ve decode etmek için kullanılır.jsonwebtoken bir encryption işlemleri değil,encode-decode işlemleridir yani oluşturulan token ve içerikleri herkes tarafından görülebilir.Bu yüzden güvenlik açığı oluşturabilecek verilerin payloadta bulunmaması gerekir.

Bir jwt token 3 parçadan oluşur.

1. Header: "alg"(algorithm) ve "typ"(type) gibi temel token meta datalarını içerir.
2. Payload: Decode edilecek bilgilerin girildiği kısımdır.Eğer verilen payload obje ise default olarak içerisinde `iat`(issued at) eklenir.
3. Signature: A decoded version of combination Header and Payload with a secret key.

```bsh
npm i @nestjs/jwt
```

```ts
@Module({
  imports: [
    JwtModule.register({
      secret: "my secret key",
      global: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
```

Böylece tüm modüllerimizde kullanabileceğimiz bir JwtService classı tanımlanır.JwtService verify,decode ve sign işlemlerini yapar.

Öncelikle bir login servisi oluşturalım ve eğer kullanıcı var ise jwt token oluşturup cliente döndürelim.

```ts
  login({ password, ...data }: LoginUserDto) {
    const user = this.users.find((user) => user.email === data.email);
    if (!user)
      throw new BadRequestException('User not found with entered email');
    if (user.password !== password)
      throw new BadRequestException(
        'Entered password does not match with the user password',
      );
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return token;
  }
```

Aşağıdaki isteği atarsak:

```bash
POST  http://localhost:3000/user/login HTTP/1.1
Content-Type: application/json

{
    "email":"cibilex@cibilex.com",
    "password":"12345678"

}
```

aşağıdaki örnek responsu alırız:

```bash
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjaWJpbGV4QGNpYmlsZXguY29tIiwiaWF0IjoxNzA1ODI5NTk1fQ.O5YII0UzPTE0SVdgJ9B6u1ZzkkI3ip5MD2O7WKqz7n0
```

Gelen access_tokenı [jsonwebtoken](https://jwt.io) sayfasında bulunan encoded inputuna yapıştırdığımızda
payloadı görürüz!!!.

Daha önce oluşturduğumuz Reflector yardımı ile oluşturduğumuz Auth Decoratorunu kullanarak giriş gerektiren routerlarımıza ekleyelim.

```ts
  @Auth(true)
  @Get('profile')
  profile() {
    console.log('hi');
    return 'hi';
  }
```

Son olarak bir AuthGuard oluşturarak authorization işlemlerini içerisinde yapalım.Guardımız false dönerse ForbiddenException hatası döner.

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const auth = this.reflector.getAllAndOverride(Auth, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!auth) return true;
    const request = ctx.switchToHttp().getRequest<FastifyRequest>();

    const token = this.getBearerToken(request);
    const payload = await this.verify(token);
    request.user = payload;

    return false;
  }

  private async verify(token: string) {
    try {
      const payload = (await this.jwtService.verifyAsync(token)) as UserT;
      return payload;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException();
    }
  }

  private getBearerToken(req: FastifyRequest) {
    const [bearer, token] = req.headers.authorization?.split(" ") || [];
    if (bearer !== "Bearer") throw new ForbiddenException();
    return token;
  }
}
```

getBearerToken: Request headerında bulunan Authorization parametresindeki token kontrolunu yapar.
.jwtService.verifyAsync: jwt tokenını doğrulama işlemi yapar.Hata durumunda ForbiddenException döner.

Aşağıdaki istek:

```bash
GET http://localhost:8000/user/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjaWJpbGV4QGNpYmlsZXguY29tIiwiaWF0IjoxNzA1ODI5NTk1fQ.O5YII0UzPTE0SVdgJ9B6u1ZzkkI3ip5MD2O7WKqz7n0
```

Aşağıdaki yanıtı verir.

```ts
{
  "id": 1,
  "firstName": "cibilex",
  "lastName": "tarkan",
  "email": "cibilex@cibilex.com"
}
```

Böylece authorization işlemini kolaylıkla yaptık ve isteğin kimden geldiğini öğrendik.Biraz daha derine inip seçenekler.
Ayrıca seçenekleri her .sign veya .verify fonksiyonunda kullanmak yerine global olarak tanımlayabiliriz.

```ts
    JwtModule.register({
      secret: 'my secret key', // secret key
      global: true,  // it will be accessed by all modules
      signOptions: {
        expiresIn: '10m', // 10 minutes. Number of minutes or valid strings like 10s,2d,1y,60s
        noTimestamp: true, // as default iat(issued time) added while payload is a object.To prevent this use noTimestamp.
      },
      verifyOptions: {
        complete: true, // instead of return just payload,return structure will be header,
        algorithms: ['HS256'],  // supported algorithms
        ignoreExpiration: true,   // verify the token even if the token has expired
        subject: 'hi', // to verify sub in payload.sub must be equals with this value.
        maxAge: '1s', // can be used instead of expiresIn
      },
    }),
```

JWT 2 temel algoritma sunar:

1. HS256: HMAC signature with sha-256 algorithm:Authorization made with a symmetric algorithm which use secret key.Both verify and sign fonksions use the same key.
2. RS256 : RSA signature with sha-256 algorihm:Authorization made with an asymmetric algorithm which use private-public key.Private key used to create a jwt token and public key used to verify it.

RS256 is much more secure but a bit slower than HS256.

| topic                               | jwt                                                   | Server side sessions  |
| ----------------------------------- | ----------------------------------------------------- | --------------------- |
| Storing Token                       | No need                                               | Tokens must be stored |
| Revoking tokens                     | It's hard to do, must store them in a store           | Easy to do            |
| secret, private, public keys        | They must be protected                                | No need               |
| Token contains user data            | Yes,At least user id or email must be added to claims | No need               |
| Indepented create-verify operations | Yes,with RS256 signature.                             | No                    |

Rose-based authorization: I read the documentation of NestJS but both RBAC ad CASL not that good to use.There is a efficient way to do with Bitwise operators.
We just use one bitwise operator to do authorizations which is `&`.Click here to read all the bitwise operators.

Role based authentication

---

**helmet**:
helmet http headerları uygun şekilde düzenleyerek pek çok güvenlik açığını kapatır.

```bash
npm i @fastify/helmet
```

**cors**
Under the hood NestJS uses suitable cors package,not need to installation.There two ways to add cors:

1. app.enableCors(options)
2. ```ts
   const app = await NestFactory.create<NestFastifyApplication>(
     AppModule,
     new FastifyAdapter(),
     { cors: true }
   );
   ```

Both cors and helmet must be registered top of middlewares to work correctly.

###Configurations

`@nest/config` paketi internal olarak dotenv kullanır.Default olarak import edildiği paketlerde env dosyaları kullanılabilirken,isGlobal:true diyerek global olarak eklenebilir.

Default olarak projenin ana dizinindeki .env dosyasına bakılır.Farklı bir dosyayı tanımlamak için envFilePath kullanılır.
Environmentları key-value şeklinde string olarak kullanmak yerine bir js dosyasında formatlama ve default değer atama işlemlerini yapabiliriz.

```ts
//src/configurations/index.ts
export default () => {
  const { PORT, URL, DB_VENDOR } = process.env;

  return {
    PORT: parseInt(PORT!) || 7000,
    DB: {
      URL,
      VENDOR: DB_VENDOR || "mysql2",
    },
  };
};

// app.module.ts
@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurations],
      ignoreEnvFile: true,
    }),
  ],
  controllers: [],
})
export class AppModule {}
```

Bu yöntem kullanılığında hem environment dosyasındaki veriler hemde configuration dosyasındaki veriler global halde kullanılabilir olur.Sadece configuration dosyasını aktif halde tutmak için ignoreEnvFile kullanılır.

Belirtilen environment değerlerine erişmek için .get<T>(keyName,opts) kullanılılır.TypeScript desteğini daha iyi almak için infer:true eklenebilir.

```ts
// user.service.ts
@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService<
      ReturnType<typeof configurations>, // type of configuration object
      true // to get rid of undefined value
    >
  ) {
    const port = this.configService.get("PORT", { infer: true });
    console.log(port);
  }
}
```

Bunun yerine validasyon,format,transform işlemlerini tek bir fonksiyonda yapabiliriz.

```ts
// src/configurations/env.validati
import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

enum DB_VENDORS {
  mysql = 'mysql',
  mysql2 = 'mysql2',
}

enum Modes {
  DEV = 'development',
  PROD = 'production',
}
class Environments {
  @IsString()
  @IsEnum(Modes)
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  @MinLength(10)
  DB_URL: string;

  @IsString()
  @IsEnum(DB_VENDORS)
  DB_VENDOR: string;
}

export default function validate(config: Record<string, unknown>) {
  const validadeConfig = plainToInstance(Environments, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validadeConfig);
  if (errors.length) throw new Error(errors.toString());

  const { DB_URL, DB_VENDOR, NODE_ENV } = validadeConfig;

  return {
    MODE: NODE_ENV,
    DB: {
      DB_URL,
      DB_VENDOR,
    },
  };
}


// app.module.ts
@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
  ],
  controllers: [],
})
```

Also we can access the environments in the main.ts file like below:

```ts
const environments = app.get(ConfigService<Environments, true>);
await app.listen(environments.get("PORT"), "0.0.0.0");
```

## TypeORM

TypeORM is object relational Mapper that workings on Server,Browser,Electron etc..,supports most of both SQL ,NoSQL DBMS(Database Maganement Sypstem) such as MySQL,PostreSQL,Oracle,MongoDB and provides excellent features using TypeScript.

```bash
npm i --save @nestjs/typeorm typeorm mysql2
```
configuration: 

```ts
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvType, true>) => {
        return {
          port: configService.get('DB.DB_PORT', { infer: true }),
          host: configService.get('DB.DB_HOST', { infer: true }),
          database: configService.get('DB.DB_DATABASE', { infer: true }) as string,
          username: configService.get('DB.DB_USERNAME', { infer: true }),
          password: configService.get('DB.DB_PASSWORD', { infer: true }),
          synchronize: configService.get('DB.DB_SYNCHRONIZE', { infer: true }),
          logging: false,
          autoLoadEntities: true,
          type: configService.get('DB.DB_TYPE', { infer: true }) as 'postgres',
          schema: configService.get('DB.DB_SCHEMA', { infer: true })
        }
      },
      inject: [ConfigService]
    })
  ],
})

```

Daha önce mongoose kullandıysanız bazı yerler size tanıdık gelecektir.

Entity is a class that refers to a table.As defult class name will be name of created table ,to declare a table name use @Entity('table_name'). 
PrimaryGeneratedColumn: refers to Serial in mariadb(INT NOT NULL PRIMARY KEY AUTO_INCREMENT).

@Column('type',opts) - @Column({opts}): Tablodaki belirli bir sütunu temsil eder.If type hasn't been specified,TypeORM will try to look at its TS type,For example if type is number,column type will be INT.If type is string,column type will be VARCHAR(255) and so forth.

top options:

| Name     | Default Value      | Description                                                                 |
| -------- | ------------------ | --------------------------------------------------------------------------- |
| type     | depends to TS type | refers to type of column like 'varchar','int','tinyint','text','boolean'... |
| width    | 11                 | refers to display width of an integer value.                                |
| length   | 255                | refers to length of a string value                                          |
| default  | null               | refers to default value                                                     |
| select   | true               | to hide the column by default when making queries                           |
| nullable | false              | makes column null or not null                                               |
| unique   | false              | marks as unique column                                                      |
| comment  |                    | column comment                                                              |
| zerofill |                    | ZEROFILL in MySQL                                                           |
| unsigned |                    | UNSIGNED in MYSQL                                                           |
| charset  | depends db version | character set of column                                                    |
| enum     |                    | valid values for current column                                             |

```ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

enum Roles {
  WRITE = "write",
  READ = "read",
  UPDATE = "update",
}
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 50,
  })
  email: string;

  @Column({ type: "varchar", length: 40 })
  password: string;

  @Column("smallint")
  birth_year: number;
  constructor(user: Partial<Users>) {
    Object.assign(this, user);
  }
}
```

Uygulama genelinde `entityManager` erişimi olabilirken,repository erişimi için repository kullanılacak modulde import edilerek `TypeOrmModule.forFeature([Entities])` şeklinde kullanılmalıdır.

```ts
//user.service.ts
@Injectable()
export class UserService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) {}

  async create({ birthYear, password, email }: CreateUserDto) {
    const newUser = await this.entityManager.save(
      new Users({
        birth_year: birthYear,
        email,
        password,
        id: 1,
      })
    );
    return newUser;
  }

  profile(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  getAll() {
    return this.usersRepository.find();
  }

  async update(id: number, { birthYear, email }: UpdateUserDto) {
    const res = await this.usersRepository.update(id, {
      email,
      birth_year: birthYear,
    });
    return res.affected;
  }
}
```

private readonly entityManager: EntityManager : TypeORM manager classını temsil eder.  
 private readonly usersRepository: Repository<Users>: Users repositorysini temsil eder.

Çoğu tabloda id,created_at,updated at sütunları bulunur.Her Entity de ayrı ayrı yazmak yerine inheritence yöntemi kullanılabilir.

```ts
// base-table.entity.ts
export abstract class BaseTable {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'int',
    nullable: false,
    name: 'created_at',
  })
  createdAt: number;

  @Column({
    type: 'int',
    nullable: false,
    name: 'updated_at',
  })
  updatedAt: number;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = toUnixTime();
    this.updatedAt = toUnixTime();
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = toUnixTime();
  }
}

//user.entity.ts

@Entity()
export class Users extends BaseTable {
  @Column({
    type: "varchar",
    length: 50,
  })
  email: string;

  @Column({ type: "varchar", length: 40 })
  password: string;

  @Column({ select: false, type: "set", default: [Roles.READ], enum: Roles })
  roles: Roles[];

  @Column("smallint")
  birth_year: number;

  constructor(user: Partial<Users>) {
    super();
    Object.assign(this, user);
  }
}
```

Aynı sorun embedded yöntemi ilede çözülebilir ancak bazı can sıkıcı durumlar vardır.

1. default olarak propertyName.EmbeddedName şeklinde sütun adı açılır,bunu düzeltmek için `prefix: false` kullanmalıyız.
2. Sorgularda propertyName.embdeddedQuery şeklinde yapmamız gerekir.Bu can sıkıcı olabilir.

mesela base-table.ts dosyasındaki BaseTabloyu normal classa çevirelim ve aşağıdaki örneğe bakalım:

```ts
@Entity()
export class Users {
  @Column({
    type: 'varchar',
    length: 50,
  })
  email: string;

  @Column({ type: 'varchar', length: 40 })
  password: string;

  @Column(() => BaseTable, { prefix: false })
  base: Partial<BaseTable>;
  @Column({ select: false, type: 'set', default: [Roles.READ], enum: Roles })
  roles: Roles[];

  @Column('smallint')
  birth_year: number;

  constructor(user: Partial<Users>) {
    Object.assign(this, user);
  }
}

//user.service.ts

  async create({ birthYear, password, email }: CreateUserDto) {
    const currentTime = Math.floor(Date.now() / 1000);
    const newUser = await this.entityManager.save(
      new Users({
        birth_year: birthYear,
        email,
        password,
        base: {
          created_at: currentTime,
          updated_at: currentTime,
        },
      }),
    );
    return newUser;
  }
```

TypeORM Entity oluşturmak için aşağıdaki gibi Schema yöntemi ile beraber alternatif bir seçenekte sunar.

```ts
//base-table.entity.ts
export interface BaseTable {
  id: number;
  created_at: number;
  updated_at: number;
}
export const BaseTablePart = {
  id: {
    primary: true,
    generated: true,
    type: Number,
  } as EntitySchemaColumnOptions,
  created_at: { type: Number, nullable: false } as EntitySchemaColumnOptions,
  updated_at: { type: Number, nullable: false } as EntitySchemaColumnOptions,
};

//user.entity.ts
export interface UsersEntity extends BaseTable {
  email: string;
  password: string;
  birth_year: number;
}
export const UsersEntitySchema = new EntitySchema<UsersEntity>({
  name: "users",
  columns: {
    ...BaseTablePart,
    email: {
      type: String,
      length: 50,
    },
    password: {
      type: String,
      length: 40,
    },
    birth_year: {
      type: "smallint",
    },
  },
});

//user.service.ts
@Injectable()
export class UserService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(UsersEntitySchema)
    private readonly usersRepository: Repository<UsersEntity>
  ) {}

  async update(id: number, { birthYear, email }: UpdateUserDto) {
    const res = await this.usersRepository.update(id, {
      email,
      birth_year: birthYear,
    });
    return res.affected;
  }
}
```

Gördüğünüz gibi pek kullanışlı değil :).

Note: enum not null olan bir sütun için veri girilmezse,değeri enumun birinci indexi olur.
Relations:

Entityleri birbiri ile ilişkilendirerek karmaşık queryleri basitleştirebiliriz.Ayrıca FOREIGN KEY gibi özellikleride beraberinde kullanabiliriz.4 farklı relation tipi vardır:

one-to-one
one-to-many
many-to-many
many-to-one

Entity tanımlarken önce relatin tipi için uygun decorator,ardından @JoinColumn() kullanılır.JoinColumn sadece bir tarafta(side) tanımlanması gerekir.

```ts
//settings.entity.ts
export enum Themas {
  dark = 1,
  light,
}
export enum Languages {
  tr = 1,
  en,
}
@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: Themas })
  thema: number;

  @Column({ type: "enum", enum: Languages })
  lang: number;

  @OneToOne(() => Users)
  @JoinColumn()
  user: Partial<Users>;

  constructor(setting: Partial<Settings>) {
    Object.assign(this, setting);
  }
}

//user.entity.ts
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  email: string;

  @Column({ length: 40 })
  password: string;

  @Column({ type: "smallint" })
  birth_year: number;

  constructor(user: Partial<Users>) {
    Object.assign(this, user);
  }
}
```

Her iki Entitiyide user.module.ts classına import ettikten sonra db de aşağıdaki işlemler gerçekleşir.

1. settings tablosunda userId isminde bir sütun oluşur.
2. settings tablosunda userId sütunu için unique index ve primary key oluşur.

```ts
  UNIQUE KEY `REL_9175e059b0a720536f7726a88c` (`userId`),
  CONSTRAINT `FK_9175e059b0a720536f7726a88c7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
```

Create işlemleri aşağıdaki gibi olabilir

```ts

  async create({ email, password, birthYear, thema, lang }: CreateUserDto) {
    const user = await this.usersRepository.save(
      new Users({
        email,
        birth_year: birthYear,
        password,
      }),
    );
    const setting = await this.settingsRepository.save(
      new Settings({
        lang,
        thema,
        user,
      }),
    );
    return { ...user, setting };
  }
  // settings-example
```

ayrıca settings işleminde `user:{id:user.id}` şeklinde de tanımlanabilir.

Yukarıdaki kodta 2 önemli hata bulunmaktadır.

1. userId sütunu nullable olabilir,bunu engellemek gerekir.Çözmek için

```ts
// settings.entity.ts
  @Column({ nullable: false })
  userId: number;

  @OneToOne(() => Users)
  @JoinColumn()
  user: Partial<Users>;
```

veya
```ts
  @OneToOne(() => User, {
    nullable: false,
  })
  user: Partial<Users>;

```

2. save işlemleri transaction içine alınmalıdır.Yoksa settings tablosuna eklerken hata verirse bile users tablosu insert edilmiş olur.Transaction entityManager tarafından oluşturulabilir.

```ts
const result = await this.entityManager.transaction(async (trx) => {
  const user = await trx.save(
    new Users({
      email,
      birth_year: birthYear,
      password,
    })
  );
  const setting = await trx.save(
    new Settings({
      thema,
      lang,
      user,
    })
  );

  return { ...user, setting };
});
```

Settingsleri user ile beraber getirmek için:

```ts
//user.service.ts
this.settingsRepository.find({
  relations: {
    user: true,
  },
});
```

veya

```ts
//user.service.ts
this.settingsRepository
  .createQueryBuilder("settings")
  .leftJoinAndSelect("settings.user", "user")
  .getMany();
```

kullanılabilir.Ayrıca hep manual seçmek yerine her zaman gelmesini sağlamak için eager seçeneği kullanılır.

```ts
//settings.entity.ts
  @OneToOne(() => Users, { eager: true })
  @JoinColumn()
```

Böylece aşağıdaki gibi tüm get querylerinde user ile beraber gelir.

```ts
this.settingsRepository.find();
```

Bu örnekte uni-directional relation yapıldı,bi-directional bağlantıda yapabiliriz.Bunun için tek gereken şey users Entitysine aşağıdaki kodu eklemektir.

```ts
  @OneToOne(() => Settings, (settings) => settings.user, { eager: true })
  setting: Settings;
```

Böylece users ilede settingse karmaşık queryler yapmadan erişebiliriz.Users tablosunda settingId veya FOREIGN KEY oluşmayacaktır!!!

@ManyToOne() and @OneToMany()
Users ve products tablolarının olduğunu düşünelim.Bir kullanıcının çok sayıda productı olabilir ancak bir productın bir kullanıcısı olabilir.Bu durumda products tablosunda @ManyToOne(),users tablosunda @OneToMany() kullanılır.

@ManyToOne() tek başına kullanılabilirken,@OneToMany için @ManyToOne() da eklenmesi zorunludur.
@ManyToOne() underlying olarak @JoinColumn() decoratorunu çalıştırır yani manual yazmaay gerek yoktur.

```ts
//products.entity.ts
@Entity()
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Users, (users) => users.product, {
    nullable: false,
  })
  user: Partial<Users>;
  constructor(product: Partial<Products>) {
    Object.assign(this, product);
  }
}

//user.entity.ts
  @OneToMany(() => Products, (products) => products.user, { eager: true })
  product: Products;

```

products tablosuna aşağıdaki durumlar oluşur.

1. `userId` int(11) DEFAULT NULL
2. ```bash
    KEY `FK_99d90c2a483d79f3b627fb1d5e9` (`userId`),
      CONSTRAINT `FK_99d90c2a483d79f3b627fb1d5e9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
   ```

Ürün oluşturmak için:

```ts
  async create(id: number, { title, description }: CreateProductDto) {
    try {
      const user = await this.usersRepository.findOneByOrFail({ id });

      const newProduct = await this.productsRepository.save(
        new Products({
          title,
          description,
          user: {
            id: user.id,
          },
        }),
      );
      console.log(newProduct);
      return newProduct;
    } catch (err) {
      console.log(err, 'err');
      throw new BadRequestException(err);
    }
  }
```

Mesela kullanıcı tablosuna istek attığımızda

```ts
[
    {
      "id": 1,
      "email": "cibilex@cibilex.com",
      "password": "12345678",
      "birth_year": 1960,
      "product": [
        {
          "id": 1,
          "title": "product 1",
          "description": "product description 1"
        },....
        ]}]
```

gibi bir yanıt döner.

Mesela products isteği ise aşağıdaki gibi döner

```ts
{
  "id": 1,
  "title": "product 1",
  "description": "product description 1"
}
```

```ts
  @Column({ nullable: false })
  userId: number;
    @ManyToOne(() => Users, (users) => users.product, {
    nullable: false,
  })
  user: Partial<Users>;
```

Spesifik olarak belirtilmedi sürece relation bilgileri değil relatinId bulunması daha sağlıklıdır.Yukarıdaki kod ile beraber aşağıdaki veri döner:

```ts
{
  "id": 1,
  "title": "product 1",
  "description": "product description 1",
  "userId": 1
}

```

gördüğünüz gibi userId sütunu getirilmiyor.userId sütunu için join atmak yerine sadece userId bilgisinide getirmek için products Entitysine sütunu açıkça belirtmeliyiz.

**Self refencing**: Bazen bir satır bulunduğu tablodaki diğer satırlar ile bağlantılıdır.Mesela categories tablosu oluşturduğumuzu düşünelim her kategorinin alt kategori ve üst kategorileri olabilir.Böyle bir ilişkiyi tanımlamak için

```ts
@Entity()
export class Categories {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Categories, (categories) => categories.childCategories)
  parentCategory: Categories;

  @OneToMany(() => Categories, (categories) => categories.parentCategory)
  childCategories: Categories[];
}
```

Relation kullanırken default olarak @JoinColumn() bulunduğu tabloda propertyId şeklinde bir sütun oluşturulur.Bu ismi değiştirmek için `@JoinColumn({name:'name'})` kullanabiliriz.

createForeignKeyConstraints:To prevent creation of foreign key in table which @JoinColumn used in.use createForeignKeyConstraints:false option.
```ts
  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
```

Also `onDelete` and `onUpdate` options can be determined.

Find\*  
It is used to create queries handy Instead of making queries with QueryBuilder.  
opts:  
relations:used to describe whether relations,sub-relations will be load.  
select: used to describe whether properties will be load.  
**where**: used to describe simple conditions.To create query with OR all conditions can be an array object.  
**order**: used to order the rows.  
**withDeleted**: used to get also entities which are softDeleted or softRemoved.  
For this query

```ts
this.usersRepository.find({
  where: {
    id,
  },
  relations: {
    product: true,
  },
  select: {
    id: true,
    email: true,
    product: {
      title: true,
      id: false,
    },
  },
});
```

There options are available for methods which parameter type is FindOneOptions.  
Also there are extra options for methods which parameter type is FindManyOptions like find,findAndCount.  
**skip**: offset  
**take**: limit  
Skip and take should be used together and first offset option must be declare.

**cache** enables cath.

Also TypeORM has a lot of built-in operators such as Less,LessThanOrEqual,MoreThan,MoreThanOrEqual,Not,Like,ILike,Between,In,Any,IsNull,ArrayContains,Raw,Or,And.  
Note:Raw operatorünü kullanırken parametreler sorguya değil,sorgudan sonraki 2. parametrede verilmeli.

Here is some examples:

```ts
this.usersRepository.find({
      where: {
        email: ILike('%cibil%'),
        birth_year: Raw((alias: string) => `${alias} in (:...years)`, {
          years: [1960, 1829],
        }),
      },
      skip: 0,
      take: 2,
    });

// query will be:
SELECT `Users`.`id` AS `Users_id`, `Users`.`email` AS `Users_email`, `Users`.`password` AS `Users_password`, `Users`.`birth_year` AS `Users_birth_year` FROM `users` `Users` WHERE (UPPER(`Users`.`email`) LIKE UPPER(?) AND `Users`.`birth_year` in (?, ?)) LIMIT 2 -- PARAMETERS: ["%cibil%",1960,1829]
```

response will be

```ts
[
  {
    "id": 1,
    "email": "cibilex@cibilex.com",
    "product": [
      {
        "title": "product 1"
      },
      {
        "title": "product 1"
      }...

```

or

```ts
this.usersRepository.find({
  where: {
    id: And(Not(Equal(1)), LessThan(4)),
    email: Raw((alias: string) => `${alias} LIKE :email`, {
      email: "%cibil%",
    }),
  },
});
```

will be

```ts
SELECT `Products`.`id` AS `Products_id`, `Products`.`title` AS `Products_title`, `Products`.`description` AS `Products_description`, `Products`.`userId` AS `Products_userId` FROM `products` `Products` WHERE (`Products`.`id` = ?) LIMIT 1 -- PARAMETERS: [1]

```

https://typeorm.io/relations-faq#how-to-load-relations-in-entities

Repository: Bir Entity üzerinden yapılabilecek işlemleri sağlayan classtır.  
EntityManager: Tüm entitylerin toplandığı bir collectiondur.Üzerinden başka repositorylere erişilebilir veya kendisi ile db işlemleri yapılabilir.  
Pek çok method sunar  
**transaction**: İçeriğindeki trx ile yapılmış işlemleri tek transaction processinde çalıştırır.  
**query**: to create raw query. `.query('select * from users order by id desc limit 2,5',)`  
**createQueryBuilder**: querybuilder oluşturulmasını sağlar.  
**hasId**: verilen entityde id kontrolu yapar.  
**create(entity,opts)**: new User(opts) ile aynı işlemi yapar.  
**save(entity)** : restrictionları çalıştırdıktan sonra id kontrolu yapar,entity veritabanında varsa update yoksa insert yapar. Ayrıca .save([entity1,entity2]) şeklinde de kullanılabilir böylece eğer transaction içerisinde değilse,kendisi bir transaction oluşturur.
Çoklu save veya remove ederken bazı özellikleri seçebiliriz.  
**chunk**: Default olarak tüm veriler aynı anda kayıt edilir,bunun yerine kaçlı gruplar halinde olması gerektipğini söyleyebiliriz.  
**transaction**: default olarak transaction içerisinde insert edilirler,birbirinden bağımsız olmaları için false yapabiliriz.

**insert(entity,opts)**: entitye insert yapar.herhangi bir id kontrolu yapmaz.opts kısmı array olabilir.Dönüş değeri insert edilen değer deli bir meta data döner.

```ts

{
  "identifiers": [
    {
      "id": 5
    }
  ],
  "generatedMaps": [
    {
      "id": 5
    }
  ],
  "raw": {
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 5,
    "info": "",
    "serverStatus": 2,
    "warningStatus": 0,
    "changedRows": 0
  }
}
// insert-resim
```

**remove**: verilen entity db de varsa siler..save gibi array olarak çoklu entity alabilir.Dönüş değeri entity olur.  
**delete(entity,id | conditions)**: verilen conditionlar ile bir entityi siler. `this.entityManager.delete(Settings, id);`
example result

```ts
{
  "raw": [],
  "affected": 0
}
```

**descrement,increment(entity,conditions,incrementBy)**:Not id can not added direclty like `this.entityManager.decrement(Settings, id, 'lang', 1)`,must used like `this.entityManager.decrement(Settings, {id}, 'lang', 1)`;  
**exists,existsBy** a boolean value that indicates whether value exists.`this.entityManager.exists(Settings, { where: { id } })` ,`this.entityManager.existsBy(Settings, { id })`  
**count-countBy**: koşullara uyan satır sayısını döndürür.

```ts
this.entityManager.count(Users, {
  where: {
    email: Like("%cibil%"),
  },
});

//or
this.entityManager.countBy(Users, {
  email: Like("%cibil%"),
});
```

**findAndCount,findAndCountBy**: hem liste hemde countu döndürür.

```ts
const [list, count] = await this.entityManager.findAndCountBy(Users, {
  email: Like("%cibil%"),
});
return [list, count];
```

**clear(entity)** :truncate table entity;  
**getRepository(entity)**: istenilen repositoryi getirir.

**update(entity,contidions,updateData) - update(entity,id,updateData)**:dönüş değeri

```ts
{
  "generatedMaps": [],
  "raw": [],
  "affected": 1
}
```

Ayrıca findOneOrFail,findOneByOrFail,find,findOneBy,findOne gibi pek çok daha method bulunur.Daha fazla okumak için [tıklayınız](https://typeorm.io/entity-manager-api).

Repository API:  
**target**: temsil ettiği Entity classını döner.  
**manager**: entityManagerı döner.  
**createQueryBuilder** : queryBuilder oluşturur.  
**getId,hasId** :primary column kontrolu,primary column döndürme:`usersRepository.getId(user)`

Pek çok özellik,entityManager API de zaten belirttik.Burdaki temel fark açıkça (implicit) entity belirlemeye gerek yoktur çünkü zaten entity üzerinden işlem yapıyoruz.  
.insert,.create,.remove,.query,.clear,.delete,increment,decrement,exists,existsBy,countBy,findOneOrFail,findOneOrFail...
Ayrıca aşağıdaki aggreate fonksiyonlarınıda sağlar

| method          | typorm                                       | mariadb                                                                                           |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| maximum-minimum | maximum('id', { lang: Languages.en })        | SELECT MAX(`id`) AS `MAX` FROM `settings` `Settings` WHERE (`Settings`.`lang` = 2)                |
| sum             | sum('id', { id: MoreThan(1) })               | SELECT SUM(`id`) AS `SUM` FROM `settings` `Settings` WHERE (`Settings`.`id` > ?)                  |
| average         | average('userId', { userId: Not(IsNull()) }) | SELECT AVG(`userId`) AS `AVG` FROM `settings` `Settings` WHERE (NOT(`Settings`.`userId` IS NULL)) |

**QueryBuilder**
TypeORM provide a queryBuilder to create complex queries easily like Knex.
Knex gibi callback methodlar ile query oluşturmamızı sağlar ancak knex kadar esnek ve kullanışlı değildir :(
Note: Bir sorguda aynı isimde birden fazla parametre olmamalı.En sondaki parametre öncekileri ezer!!

Çok fazla method olduğu için ve zaten mantık olarak yukarıdaki gibi oldukları için tek tek yazmayacağız.Bunu yerine örnekler üzerinden gideceğiz.

**createQueryBuilder('alias')** alias of current table like `from users as alias`.Aliases are handy when querying multiple tables.

**getOne,getOneOrFail,getMany,getCount**:

```ts
this.usersRepository
  .createQueryBuilder("user")
  .where("user.id = :id", { id })
  .getRawOne();
```

**getRawOne,getRawMany**: entity olarak getirmek yerine js objesi olarak dönerler.

**where,orWhere,andWhere,andWhereExists,andWhereInIds,whereExists,whereInIds**
order of the queries are important,for example the last where clause will override the previous one :

```ts
      .createQueryBuilder('user')
      .where(new Brackets((builder) => builder.where('user.id = :id', { id })))
      .where(
        new Brackets((builder) =>
          builder.where('user.email like :email', { email: 'cibil' }),
        ),
      )
      .getCount();
      // SQL will be
    SELECT COUNT(1) AS `cnt` FROM `users` `user` WHERE (`user`.`email` like ?) -- PARAMETERS: ["cibil"]
```

instead of using where cluase again,.andWhere clause must be used.  
**NotBrackets**:To create a new not brackets

**having,orHaving,andHaving**  
**orderBy,addOrderBy**  
**groupBy,addGroupBy**  
**limit,offset,skip,take**  
limit kullanıldığında TypeORM sadece queryle eklerken,take methodu hem isteğe hemde istek sonucunda kontrol edilir.Bu yüzden daha güvenli olduğu için take ve skip kullanmak daha mantıklıdır.

Relations with queryBuiler:

**leftJoinAndSelect,innerJoinAndSelect,leftJoin,innerJoin**  
leftJoin ve innerJoin joinlenen tablo verilerini getirmez.

```ts
     this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.product',
        'product',
        'product.title like :title',
        { title: '%test title%' },
      )
      .where('user.id = :id', { id })
      .getMany();

     //opt 2

     this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.product', 'product')
      .where('user.id = :id', { id })
      .andWhere('product.title like :title', { title: '%test title%' })
      .getMany();

      Note: there are not equals. The farmer title condition will be in join clause while the latter will be in where clause


      
```

Ayrıca Entity kısımlarında relation olarak belirtilmemiş tablolarada join atılabilir.

```ts
return await this.usersRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect(Products, "product", "product.userId = user.id")
  .where("user.id = :id", { id })
  .getRawMany();
```

**getSql,printSql**:
**maxExecutionTime(time in miliseconds)**

**select([selections]),addSelect(selection)**:@Column() ile sütun belirlerken select:false yapılan sütunlar açıkca selecte yazılmalıdır.

```ts
const q = await this.usersRepository
  .createQueryBuilder("u")
  .where("u.id = :id", { id })
  .select(["u.password", "u.email"])
  .getOne();
```

**aggregate functions**

```ts
this.usersRepository
  .createQueryBuilder("u")
  .addSelect("SUM(u.id)", "sum")
  .addSelect("AVG(u.birth_year)", "averageYear")
  .addSelect("COUNT(*)", "total")
  .getRawOne();
```

example result:

```ts
{
  "u_id": 1,
  "u_password": "12345678",
  "u_birth_year": 1960,
  "sum": "6375",
  "averageYear": "1962.0000",
  "total": "112"
}
```

Insert: values kısmı array olabilir ve return değerinde insert edilen entity yerine meta bilgileri içeren bilgi döner.

```ts
      const insertResult = await trx
        .createQueryBuilder()
        .insert()
        .into(Users)
        .values({
          email,
          password,
          birth_year: birthYear,
        })
        .execute();
      const newId = insertResult.identifiers[0].id as number;

      const newSettings = await trx
        .createQueryBuilder()
        .insert()
        .into(Settings)
        .values({
          lang,
          thema,
          userId: newId,
        })
        .execute();
      return newId;
    });
```

insert,update yaparken raw sql gerekirse values kısmındaki değeri fonksiyon olarak kullanabiliriz.

```ts
email: () => "CONCAT('hi', 'world')";
```

```ts
this.entityManager
  .createQueryBuilder()
  .update(Users)
  .set({
    email,
    birth_year: birthYear,
  })
  .where("id = :id", { id })
  .execute();
//return value is the same as previous update operations.
```

```ts
const res = await this.entityManager
  .createQueryBuilder()
  .delete()
  .from(Settings)
  .where("id = :id", { id })
  .execute();

//return value is the same as update query.
```

Indexes
@Index() decoratoru ile oluşturulur.

```ts
@Index() // key index
@Index({unique:true}) // unique key index
@Index('my_index',{unique:true}) // unique key index my_index
```

Ayrıca Entity classın başına toplu şekilde indexler eklenebilir.

```ts
@Index(['username','email'],{unique:true}) // unique index unique_name ('username','email')
```

Listeners,Subscribers
Listeners ve subscriberların çalışması için tüm işlemlerde
this.userRepository.create() veya new Users() gibi instance üretmemiz gerekir.İnsert etmeden önce veya update etmeden önce bazı verileri doldurmak için kullanışlıdır.İçerisinde db işlemi olmamalıdır!!

```ts
@Entity()
export class Users {
  time: number;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, select: false })
  @Index({ unique: true })
  email: string;

  @Column({ length: 40 })
  password: string;

  @Column({ type: "smallint" })
  birth_year: number;

  @OneToOne(() => Settings, (settings) => settings.user)
  setting: Settings;

  constructor(user: Partial<Users>) {
    Object.assign(this, user);
  }

  @BeforeInsert()
  beforeInsert() {
    console.log("before insert");
    // this.created_at = Math.floor(Date.now() / 1000);
    // this.updated_at = Math.floor(Date.now() / 1000);
  }
  @AfterInsert()
  afterInsert() {
    console.log("after insert");
  }

  @AfterLoad()
  afterLoad() {
    this.time = 12321;
    console.log("after load");
  }

  @BeforeUpdate()
  beforeUpdate() {
    console.log("before update");
    // this.updated_at = Math.floor(Date.now() / 1000);
  }

  @BeforeRemove()
  beforeRemove() {
    console.log("before remove");
  }

  @AfterRemove()
  afterRemove() {
    console.log("after remove");
  }
}
```

Subscriberlarda ise db işlemi yapılabilir.Note: async subscriberlarda db işlemi bitmesini beklemeden çalışır.Subscriber herhangi bir providera eklenerek uygulamaya eklenir.

```ts
// db.subscriber.ts
@EventSubscriber()
export class DbSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  beforeQuery() {
    console.log('before query');
  }

  afterQuery(): void | Promise<any> {
    console.log('after query');
  }

  beforeTransactionStart(): void | Promise<any> {
    console.log('a transaction started');
  }
  afterTransactionStart(): void | Promise<any> {
    console.log('a transaction done');
  }
  beforeInsert(): void | Promise<any> {
    console.log('before insert11');
  }
  afterInsert(): void | Promise<any> {
    console.log('after insert11');
  }
}

// app.module.ts
providers: [DbSubscriber],
```

Subscriber default olarak db nin tamamını dinler.Sadece bir Entity dinlemesini istersek listenTo dönüş değerine entity eklemeliyiz.

```ts
  listenTo() {
    return Entity;
  }
```

Listener ve subscriberlarda pek çok farklı listener daha bulunur.Kendi dökümanından okumak için [tıklayınız](https://typeorm.io/listeners-and-subscribers)

**Serializations**
NestJS class-tranformer ile çalışan ve response değerini formatlamak için kullanılabilecek ClassSerializerInterceptor sunar.global-scoped,handler-scoped,veya controller-scoped olabilir.
Global olarak kullanmak için `  app.useGlobalInterceptors()` ile veya app.module.ts dosyasında:

```ts
@Module({
  providers: [
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
```

Response değerinin vanilla js objesi değil,Decoratorların kullanıldığı bir classın instance olması gerekir.

```ts
// user.entity.ts
@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @Index({ unique: true })
  email: string;

  @Exclude()
  @Column({ length: 40 })
  password: string;

  @Transform(({ value }: { value?: Settings }) => ({ thema: value?.thema }))
  @OneToOne(() => Settings, (settings) => settings.user)
  setting: Settings;
```

password kısmında {select:false} yerine @Exclude
settings propertysinde @Transform decoratoru ile formatlama yaptık.

Bunu yaptıktan sonra tek aşağıdaki gibi bir sonuç döner:

```ts
  {
    "id": 19,
    "email": "1232@111.com",
    "setting": {
      "thema": 1
    }
  }
```

**TESTINGS**
NestJS jest ve superjest desteği ile beraber gelirken diğer tüm test kütüphaneleri ilede kullanılabilir.
Jest ile unit test yaparken 2 temel yöntem vardır.Her iki yönteme geçmeden önce projemizi inceleyelim:

```ts
//user.controller.ts
@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() body: CreateUserDto) {
    return await this.userService.create(body);
  }
}

// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) {}
  async create({ email, password }: CreateUserDto) {
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email,
        password,
      })
    );
    return user;
  }
}
```

1. Veritabanına istek atmadan testleri gerçekleştirmek.Bu yöntem tavsiye edilen yöntemdir çünkü testlerimizin db yi etkilememesi gerekir.Ayrıca db işlemlerini yapmak uzun süreceği için testlerin yapılması yavaş olur.

```ts
describe("UserController", () => {
  let controller: UserController;
  let service: UserService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(Users),
          useValue: {
            save: (val: Users) => {
              const { email } = val;
              return {
                email,
                id: 20,
              };
            },
            create: (val: CreateUserDto) => new Users(val),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  test("create", async () => {
    jest.spyOn(service, "create");

    const user = {
      email: "1222132@111.com",
      password: "212",
    };
    await expect(controller.create(user)).resolves.toStrictEqual({
      email: "1222132@111.com",
      id: 20,
    });

    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create).toHaveBeenCalledWith(user);
  });
});
```

Bu yöntemde veritabanına erişmek yerine veritabanı işlemlerini mocklayarak testlerimizi yaparız.`.getRepositoryToken(Entity)`,`@InjectRepository(Entity)`ile dependency işlemini algılamak için kullanılır.useValue propertysi ile beraber mocklama işlemlerimizi yaparız.
`jest.spyOn(service, 'create');` ile service.create fonksiyonunu izleriz böylece `toHaveBeenCalledTimes` ve `toHaveBeenCalledWith` fonksiyonlarını kullanabiliriz.

testimizi başlatmak için `npm run test ` veya [vscode-jest](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) eklentisi ile yapabiliriz.

2. Veritabanına bağlanarak testlerimizi yapmak.Bu yöntem ile çalışırken veritabanı bağlantımızı test dosyamızda tanımlamamız gerekir.Jest default olarak NODE_ENV=test şeklinde test dosyalarını çalıştırır.Bu yüzden .env.test dosyasını oluşturarak environmentlerı ekleyebiliriz.

```ts
describe("UserController", () => {
  let controller: UserController;
  let service: UserService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DbModule, TypeOrmModule.forFeature([Users])],
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  test("create", async () => {
    jest.spyOn(service, "create");

    const user = {
      email: "1222132@111.com",
      password: "212",
    };
    try {
      const result = await controller.create(user);
      expect(result).toStrictEqual({ email: "1222132@111.com", id: 20 });
    } catch (error) {
      expect(error.toString()).toBe(
        "QueryFailedError: Duplicate entry '1222132@111.com' for key 'IDX_97672ac88f789774dd47f7c8be'"
      );
    }

    expect(service.create).toHaveBeenCalledTimes(1);
    expect(service.create).toHaveBeenCalledWith(user);
  });
});
```

İlk örnekten farklı olarak `imports: [DbModule, TypeOrmModule.forFeature([Users])]` satırı eklenerek db bağlantısı oluşturuldu.Ve istekler veritabanına giderek db işlemlerini gerçekleştirir.

Interceptors
Interseptorler bir fonksiyon çalışmadan önce,çalıştıktan sonra process çalıştırmak,fonksiyonu override etmek veya fonksiyonun dönüş değerini dönüştürmek için kullanılırlar.
Yaptığımız uygulamalarda tüm responseların aynı formatta döndürülmesi gerekir.Hatalarda message değerinde hata mesajı olurken başarılı isteklerde data değerinde dönüş değeri bulunur.Bu formatlama işlemini yapmak için interceptorlardan faydalanabiliriz.
Interceptorlardaki handle() fonksiyonu ile handlerı çalıştırırız ve pipe ile rxjs özelliklerini bağlayabiliriz.

```ts
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { Observable, catchError, map, throwError } from "rxjs";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse();
    // request received

    return next.handle().pipe(
      map((data: Record<string, any>) => {
        return this.responseHandler(data, res);
      }),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, res))
      )
    );
  }

  errorHandler(err: any, res: FastifyReply) {
    const error =
      err instanceof HttpException ? err : new InternalServerErrorException();

    res.send({
      message: error.message,
      status: error.getStatus(),
      success: false,
    });
  }

  responseHandler(data: unknown, res: FastifyReply) {
    return {
      data,
      status: res.statusCode,
      success: true,
    };
  }
}
```

Bunu bağlamak için:

1. `@UseInterceptors(ResponseInterceptor)`: handler-scoped veya controller-scoped olabilir.
2. `app.useGlobalInterceptors(new ResponseInterceptor());` : global olarak bağlanabilir
3. ````ts
       @Module({
       imports: [AuthModule, EnvModule],
       providers: [
         {
           provide: APP_INTERCEPTOR,
           useClass: ResponseInterceptor,
         },
       ],
   })```
      dependency injection desteği ile bağlanabilir.
   ````

## Swagger

`npm i @nestjs/swagger @fastify/static`

```ts
export const addSwagger = (app: NestFastifyApplication<RawServerDefault>) => {
  const options = new DocumentBuilder()
    .setTitle("Test")
    .setDescription("The test API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup("api", app, document);
};
```

projeyi çalıştırdıktan sonra '/api' yolunu açarsak swaggerın çalıştığını görürüz.Ayrıca api-json,api-yaml ilede doc olarak alabiliriz.
`createDocument(app,DocumentBuilder,options)`:
`options`: Bazı kullanışlı seçenekler sunar mesela.

- `extraModels`: extra classları belirtmemizi sağlar.`extraModels:[BaseTable]`.Bu özellik daha sonraki modelde `@ApiExtraModels(BaseTable)` şeklinde de kullanılabilir

Default olarak @Param ve @Query parametreleri belirtilken.@Body özellikleri gösterilmez.
Aşağıdaki gibi bir body scheması olduğunu varsayalım:

```ts
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;
}
```

Bu scheması göstermek için

1.  @ApiProperty():

```ts
export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;
}
```

Default olarak swaggerda sadece tipi gösterilir.TypeScript ile yazılan tipi ezmek için veya ekstra özellikler eklemek için

```ts
  @ApiProperty({
    type: Number,
    minimum: 12,
    maximum: 50,
    required: false
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string

  @ApiProperty({
    enum: [1, 2, 3, 45]
  })

  // or

    @ApiProperty({
    name:'numbers',enum:Numbers
  })
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  lastName: string
```

array tipleri tam çalışmayabilir.Bu durumlarda tuple tipi ile belirtmeliyiz.`@ApiBody({ type: [CreateUserDto] })`

1. [dynamic-modules](https://docs.nestjs.com/fundamentals/dynamic-modules#configurable-module-builder)
2. [inquirer-provider](https://docs.nestjs.com/fundamentals/injection-scopes#inquirer-provider)
3. [Circular dependency](https://docs.nestjs.com/fundamentals/circular-dependency)
4. [Lazy loading modules](https://docs.nestjs.com/fundamentals/lazy-loading-modules)
5. [Role based authentication](https://docs.nestjs.com/security/authorization)
6. [RS256 authorization signature](https://docs.nestjs.com/security/authentication)
7. [hashing-encryphtion]
8. [throttler](https://docs.nestjs.com/security/rate-limiting)
9. [csrf](https://docs.nestjs.com/security/csrf)
10. tree entities typeorm>entities
11. view entities
12. cascades>relating types
13. many-to-many type
14. lazy relations
15. custom repositories
16. QueryRunner,typeorm
17. isolation levels on transactions
18. softDelete,restore soft delete
19. mariadb locking ,typeorm lock
20. SUBQUERIES typeorm
21. upsert operation
22. Working with Relations typeorm
23. typeorm cache
24. [typorm migrations](https://typeorm.io/listeners-and-subscribers)
25. typeorm testing https://typeorm.io/listeners-and-subscribers
