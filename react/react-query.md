When using React Query in suspense mode, this pattern of parallelism does not work, since the first query would throw a promise internally and would suspend the component before the other queries run. To get around this, you'll either need to use the useSuspenseQueries hook (which is suggested) or orchestrate your own parallelism with separate components for each useSuspenseQuery instance.https://tanstack.com/query/latest/docs/framework/react/guides/parallel-queries#manual-parallel-queries

# React Query

`npm i @tanstack/react-query`
`npm i -D @tanstack/eslint-plugin-query`
`npm i @tanstack/react-query-devtools`

- **server-state** (API’den gelen veri) getirme, cache’leme ve güncelleme işlemlerini yönetmeyi kolaylaştıran bir kütüphanedir.

- **Neden TanStack Query**: UI state ile server state’i ayırır; loading, error, retry, cache, refetch gibi problemleri manuel çözme ihtiyacını ortadan kaldırır.Infinity scroll, parallel, dependent query tiplerini destekler.

- **Önceki veriyi gösterme (stale-while-revalidate)**: Yeni veri çekilirken eski veri ekranda kalabilir; bu sayede sayfa geçişlerinde veya refetch sırasında sürekli loading görmekten kaçınılır.

- **Performans**: `useQuery` içinden yalnızca kullandığın alanlar re-renderı tetikler. Aşağıdaki örnekte bileşen sadece `error` değiştiğinde render olur; `data` veya `isLoading` değişimleri etkilemez.

```tsx
function RouteComponent() {
  const { error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data } = await axios.get<Post[]>(
        "https://jsonplaceholder.typicode.com/posts"
      );
      return data;
    },
  });

  return error ? <div>Error: {error.message}</div> : null;
}
```

TanStack Query iki temel query method sunar: **veri okuma** (`useQuery`) ve **veri değiştirme** (`useMutation`). Bu ikisi server-state yönetiminin çekirdeğidir.

- **Query Tipleri**:

  - `useQuery`: Server’dan veri okuma.
  - `useMutation`: Server’daki veriyi değiştirme.

### useQuery

: `useQuery`, verdiğin `queryKey` + `queryFn` kombinasyonuna göre bir veri kaynağı üretir.

- **Önemli Return Değerleri**:

  - `isPending`: Henüz **ne data ne error** vardır (`status === 'pending'`).
  - `isError`: Tüm retry denemeleri başarısız olmuştur, `error` artık mevcuttur (`status === 'error'`). Varsayılan olarak `queryFn` **3 kez** exponential delay ile retry edilir; `retry` ve `retryDelay` ile özelleştirilebilir.
  - `isSuccess`: Query başarıyla tamamlanmıştır ve `data` mevcuttur (`status === 'success'`).
  - `data`, `error`: Sırasıyla başarılı sonuç ve hata objesi.

- **İlk Yükleme vs Refetch Farkı**:

  - `isPending`: İlk çalışmada data yokken `true` olur.
  - `isFetching`: Query **her çalıştığında** `true` olur.
  - Bu ayrım sayesinde ilk yükleme ile arka planda refetch’i ayırabiliriz 😄

```tsx
type Post = {
  id: number;
  title: string;
  body: string;
};

function RouteComponent() {
  const { isPending, isError, error, isFetching, data, refetch } = useQuery<
    Post[]
  >({
    queryKey: ["posts"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 2000));
      const { data } = await axios.get<Post[]>(
        "https://jsonplaceholder.typicode.com/posts"
      );
      return data;
    },
  });

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {isFetching && <div>Fetching...</div>}
      <button onClick={() => refetch()}>Refetch</button>
      {data.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

- **Tip Güvenliği Notu**: `isPending` ve `isError` bloklarından sonra kod buraya geldiyse data kesinlikle vardır; bu yüzden `data.map` için TypeScript hata vermez.
- **Koşullu Query (enabled) Mantığı**: `enabled:false` iken query başlatılmaz; `queryFn` çağrılmaz. Ancak ortada ne `data` ne `error` olduğu için query state’i **pending** kabul edilir ve `isPending` **true** olur.Ancak `isPending===true` olduğu için yükleme durumu olduğu çıkarılamaz, aslında query aktif değil.Yani ekstra bir ui daha devreye girer.Bu da `isEnabled===true` olduğu durumdur.Bu durumda ilk veri yükleme durumu `isFetching===true` ve `isPending===true` olduğunda anlarız.Tanstack query bu durumu `isLoading` (`isPending && isFetching`) olarak verir.Sonuç olarak aşağıdaki örnek bu mantığı kapsar:

```ts
type Post = {
  id: number;
  title: string;
  body: string;
};

function RouteComponent() {
  const [enabled, setEnabled] = useState(false);
  const { isLoading, isError, error, isSuccess, isFetching, data, refetch } =
    useQuery<Post[]>({
      queryKey: ["posts"],
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const { data } = await axios.get<Post[]>(
          "https://jsonplaceholder.typicode.com/posts"
        );
        return data;
      },
      enabled,
    });

  if (isLoading) {
    return <div>Loading... </div>; // first time loading
  } else if (isError) {
    return <div>Error: {error.message}</div>;
  } else if (isSuccess) {
    return (
      <div className="flex gap-2 flex-col">
        {isFetching && <div>Fetching...</div>} // while refetching
        <button onClick={() => refetch()}>Refetch</button>
        {data.map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
      </div>
    );
  }

  // this will be shown only when the query is not enabled
  return (
    <button onClick={() => setEnabled(!enabled)}>
      {enabled ? "Disable" : "Enable"}
    </button>
  );
}
```

- **Handling errors**:
  - Each query key must throw error or return a value. While most of http libraries such as `axios` throw error in case of failure, `fetch` does not do that. So we need to manually handle this circumstance.
  - Error type is `Error` by default since most of users use prefers to make it. But in real life it depends on the queryFn, so we should redefine the error type globally like below in the `main.tsx` file.

```ts
declare module "@tanstack/react-query" {
  interface Register {
    // Use unknown so call sites must narrow explicitly.
    defaultError: unknown;
  }
}
```

and in `isError` sections we should use narrow excplictly like below.Let's say we have a global error component like below

```tsx
function ErrorComponent({ error }: { error: unknown }) {
  // sent error to sentry

  if (axios.isAxiosError(error)) {
    // toast.error(error.response?.data.message);
    return <div>Axios error: {error.response?.data.message}</div>;
  } else if (error instanceof Error) {
    // not recommended to show unhandled errors to the user
    return <div>Error: {error.message}</div>;
  }
  return <div>Unknown error</div>;
}
```

- **Query keys**:
  - Query keyleri bir query için unique değerdir. Bu değer üzerinden veri cachelenir, getirilir, silinir veya güncellenir.Query key değeri nested array şeklindedir ve array itemları `JSON.stringify` edilebilecek tüm değerleri destekler mesela number,string, object etc...
  - Query key arrayi nested array şeklindedir. Mesela `["users"]` , `["users",222]` adında 2 farklı querymiz mevcut diyelim, `["users"]` için invalidate atıldığında otomatik olarak `["users",222]` da invalidate edilir.
  - Önerilen yaklaşım query key factory mantığını kullanmaktır.

```ts
const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  details: () => [...todoKeys.all, "detail"] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};
```

- Bu sayede detay ile ilgil tüm queryleri refetch etmek için tek yapmamız gereken `invalidateQueries({queryKey:todoKeys.details())` olacaktır.
- **Parallel Queries**: Birden fazla query’nin **birbirinden bağımsız** olarak aynı anda çalışır.

  - **Manuel Tanım**: Birden fazla `useQuery` çağrısı yapmak en basit yaklaşımdır; React zaten bunları paralel çalıştırır.
  - **Dinamik Tanım (`useQueries`)**: Query sayısı dinamikse veya map/loop ile üretilecekse kullanılır. `useQueries`, verilen sıraya göre sonuçları **aynı sırayla** döner.

```ts
const [{ data: data1 }, { data: data2 }] = useQueries({
  queries: [
    { queryKey: ["posts", 1], queryFn: fetchPost1 },
    { queryKey: ["posts", 2], queryFn: fetchPost2 },
  ],
});
```

- **Dependent Queries** İkinci query’nin çalışabilmesi için birincinin sonucuna ihtiyaç varsa kullanılır. Buradaki kritik nokta, bağımlı query’nin `enabled` koşuludur.

```ts
const { data: posts } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});

const { data: authors } = useQuery({
  queryKey: ["authors", posts?.map((p) => p.id)],
  queryFn: fetchAuthors,
  enabled: !!posts?.length,
});
```

- Data resiliency: I guess this topic is the most important one.We need to understand this section in detail but let's explain step by step.

  - Tantstack query refetch marks queries whether they are `stale` or not. Default `staleTime` is 0, so all the queries are marked as stale(`isStale===true`). And in every `initial render` , `window focus` or `network reconnection`, queryFn will be triggered.This means
    - If you navigate between pages, the queryFn will be triggered.
    - If you render a component conditionally, in every mount, the queryFn will be triggered.
    - If you close another tab on the browser and come back, the queryFn will be triggered.
  - These features might sound great but, actually they can blight both users and our performance.

- In below example we have two components that use the same query. `Component2` is rendered every 3 seconds. When our queryFn will be triggered ?

- As you'll recognized, our queryFn will be triggered every 3 seconds.This can be frustinating.So we need to set `staleTime`:
  - `number`: stale time in miliseconds. `60*1000` will be 1 minute
  - `Infinity`: our queryFn will be triggered only with manual invalidation.
  - `static`: our queryFn cannot be triggered.
- Don't forget that if stale time exceeds, our queryFn will not be triggered automatically. It will be depends on user activities such as `initial mount`, `window refocus` and `internet reconnection`. We can reduce these affects.
  - `refetchOnMount`:
    - If set to `true`, the query will refetch on mount if the data is stale.
    - If set to `always`, the query will always refetch on mounts regardless of stale status.
    - You know what will be happened if we set `false` :)
  - `refetchOnWindowFocus`: Options are the same with `refetchOnMount`.Only the event is when to use change the window tab and comes back.
- As we mentioned above, our `stale` actually uses listeners to achieve this functionality. If we want to refetch a query independent from `stale` in time intervals we can use `refetchInterval`.For example `refetchInterval:2*60*1000` will refetch the queryFn every 2 minutes.
- The last thing in this topic is `gcTime` (Garbage collector time): Let's say our post queryFn triggered and user navigated to another page. Our `post` data is still in the cache (will be marked as `inactive`) but we don't use it.It's can cause memory leaks.As default inactive data will be removed in 5 minutes. If we want to change this, we can use `gcTime:number`.

- Bu konu TanStack Query’nin en kritik noktasıdır çünkü “neden bu query durmadan refetch oluyor?” sorusunun cevabı tamamen burada yatar. TanStack Query her query sonucu için verinin **stale (isStale)** olup olmadığına bakar. Default olarak `staleTime = 0` olduğu için query resolve olur olmaz veri stale kabul edilir (`isStale === true`). Bu şu anlama gelir: TanStack Query, uygun bir tetikleyici yakaladığında bu query’yi tekrar fetch etmeye **izinlidir**.
- Bu tetikleyiciler şunlardır: `component’in ilk mount edilmesi`, `component’in tekrar mount edilmesi (conditional render)`, `window focus (tab değiştirip geri gelme)` ve `network reconnect`.
- Aşağıdaki örnekte aynı query’yi kullanan iki bileşenimiz var ve `Component2` her 3 saniyede bir mount ediliyor. Peki soru şu: **`queryFn` ne zaman tetiklenir?**

```ts
type Post = {
  id: number;
  title: string;
  body: string;
};

const useGetPosts = () =>
  useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      console.log("fetching posts");
      const { data } = await axios.get<Post[]>(
        "https://jsonplaceholder.typicode.com/posts?userId=1"
      );
      return data;
    },
  });

function Component1() {
  const { data } = useGetPosts();
  return "hi from component 1";
}

function Component2() {
  const { data } = useGetPosts();
  return "hi from component 2";
}

function RouteComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
      {count}
      <Component1 />
      {count % 3 === 0 ? <Component2 /> : null}
    </>
  );
}
```

Cevap: `Component2` her mount olduğunda. Bunun sebebi timer değil, query’nin zaten stale durumda olmasıdır. TanStack Query için mount olayı bir refetch tetikleyicisidir ve data stale olduğu için bu tetikleyici refetch ile sonuçlanır.

- _madem data stale, neden anında refetch olmuyor?_ Çünkü `stale` bir aksiyon değildir, sadece bir durumdur. Refetch ancak bir tetikleyici gerçekleştiğinde olur; bunlar initial mount, yeniden mount, window focus veya network reconnect gibi olaylardır.
- **staleTime**: Query’nin ne kadar süre boyunca _fresh_ kabul edileceğini belirler. `staleTime` dolana kadar query **stale olmaz** ve bu süre içinde mount, window focus veya network reconnect gibi olaylar refetch tetiklemez.
  - `number`: Milisaniye cinsinden süre. Örneğin `60 * 1000` → 1 dakika boyunca data fresh kalır.
  - `Infinity`: Query hiçbir zaman stale olmaz. Bu durumda `queryFn` sadece **manuel invalidation** (`invalidateQueries`) ile tekrar çalışır.
  - `static` hiçbir zaman refetch tetiklenmesin.
- Her tetikleyici durumunda nasıl davranılması gerektiğini de belirtebiliriz.
  - **refetchOnMount**: Bileşen mount olduğunda ne olacağını belirler.
    - `true`: Data stale ise refetch eder.
    - `always`: Data fresh olsa bile her mount’ta refetch eder.
    - `false`: Mount sırasında asla refetch etmez.
  - **refetchOnWindowFocus**: Tarayıcı sekmesi değiştirildiğinde geri dönüldüğünde çalışır ve seçenekleri `refetchOnMount` ile aynıdır.
- Peki _stale kavramından tamamen bağımsız olarak_ belirli aralıklarla refetch yapmak istersek ne olur? Bu durumda `refetchInterval` kullanılır. Örneğin `refetchInterval: 2 * 60 * 1000` ayarı, query’nin stale olup olmadığına bakmadan her 2 dakikada bir `queryFn` çalıştırır.
- Bu konudaki son parça **gcTime**’dır (garbage collection time). Bir query artık hiçbir bileşen tarafından kullanılmıyorsa _inactive_ olur ama cache’te kalmaya devam eder. Varsayılan olarak bu inactive data 5 dakika sonra silinir. Eğer bu süreyi değiştirmek istersek `gcTime: number` kullanırız. Bu ayar performans ve bellek yönetimi açısından kritik öneme sahiptir.
- Bu ayarları query bazında değil global yapmak istersek default seçeneklere eklenebilir.

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 7, // 7 minutes
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});
```
