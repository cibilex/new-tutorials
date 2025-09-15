**Structured data** Önceden belirlenmiş bir yapıya ve veri tiplerine sahip bilgidir. Bu veriler, SQL tablolarında olduğu gibi her kaydın aynı alanlara ve veri tiplerine sahip olduğu sistemlerde kolayca saklanabilir. NoSQL veritabanlarında da, collection içindeki dokümanlar belli bir formatta tutulursa structured veri olarak değerlendirilebilir.
**Semi-Structured data**: Semi-structured veri, kısmen organize edilmiş ancak katı bir şemaya bağlı olmayan verilerdir. Alanlar esnek olabilir, bazı kayıtlarda eksik veya fazladan alanlar bulunabilir. `JSON` veya `XML` dokümanları bu kategoriye girer.
**Unstructured data**:Unstructured veri, önceden tanımlanmış bir şema veya veri tipine bağlı olmayan, esnek veri tipleridir.Örneğin MongoDB’de aynı collection içindeki farklı document’larda aynı key farklı veri tiplerine sahip olabilir veya bazı document’larda o key hiç bulunmayabilir. Bu sayede veritabanı esnek kalır ve farklı veri tiplerini tek bir collection içinde yönetmek mümkün olur.

## SQL

SQL, bir veritabanı yazılımı değil, ilişkisel veritabanları için **Amerikan Ulusal Standartlar Enstitüsü (ANSI)** ve **Uluslararası Standartlar Organizasyonu (ISO)** tarafından tanımlanmış standart bir sorgulama dilidir. Bu dil, veritabanı yapısını ve operasyonlarını tanımlayan evrensel kuralları içerir.

- `CREATE TABLE` komutuyla tablolar oluşturabilir,
- `FOREIGN KEY` gibi kısıtlamalarla veri bütünlüğünü sağlayabilir,
- `SELECT` gibi temel komutlarla veri sorgulayabilirsiniz.

Bu temel komutlar, her ilişkisel veritabanında aynı şekilde çalışır. Ancak, her **İlişkisel Veritabanı Yönetim Sistemi (RDBMS)** (MySQL, PostgreSQL, SQL Server gibi) bu standart dili kendi felsefesine göre genişletir.

- **PostgreSQL**, standart SQL'de olmayan güçlü bir **JSONB veri tipi** ve bu tiplerle çalışan özel fonksiyonlar sunar.
- Her RDBMS’in kendine özgü **sorgu iyileştirme algoritmaları**, **otomatik artan ID mekanizmaları** ve **işlem yönetimi** yaklaşımları vardır.

SQL, bir dil olarak, indeksin oluşturulması için gerekli olan komutu (`CREATE INDEX`) sağlar.  
Ancak, bu komut çalıştırıldığında indeksi fiilen oluşturan, diske yazan, veritabanı performansını artırmak için kullanan program, **RDBMS'nin kendisidir**.

## NoSQL

“NoSQL” açılımı “Not Only SQL” yani “sadece SQL değil” demektir. Amaç, bu veritabanlarının yalnızca SQL’e bağlı kalmadan veri saklayabildiğini vurgulamaktır. Sadece “Not SQL” denseydi, sanki SQL ile hiç ilişkisi yokmuş gibi anlaşılırdı; oysa bazı NoSQL veritabanları SQL benzeri sorguları kısmen destekler.

Bazo NoSQL veritabanları tipleri:

- **Document-based**: MongoDB gibi veritabanları verileri JSON, BSON veya XML benzeri dokümanlarda saklar. Bu sayede veriler ORM olmadan düşük maliyetle alınabilir. MongoDB’de veriler BSON formatında saklanır, sorgu sonucunda genellikle JSON olarak geri döner.

- **Key-value stores**: Veriler unique key-value çiftleri şeklinde saklanır ve çoğu işlem bu key üzerinden yapılır. Redis en popüler örnektir. Bu tip veritabanları çok hızlı olduğundan genellikle cache amacıyla kullanılır.

**Yapı ve Veri** Depolama: SQL veritabanlarında veriler sütun ve satırlardan oluşan tablolarda saklanır ve her tablo önceden tanımlanmış şemaya sahiptir. Verilerin tipi ve kısıtlamaları belirlenmiştir, bu nedenle veriler genellikle structured formdadır. Semi-structured veriler için PostgreSQL’de JSON veya JSONB kullanılabilir. MongoDB gibi NoSQL veritabanlarında ise veriler key-value yapısında collection’larda document olarak tutulur. Her document bağımsızdır; aynı key için farklı veri tipleri veya eksik alanlar olabilir. İstenirse [şema validasyonu](https://www.mongodb.com/docs/manual/core/schema-validation/) eklenebilir, ancak temel amaç esnek veri saklamaktır, bu nedenle validation işlemleri performansı düşürebilir.

SQL’de tabloya yeni bir sütun eklemek için migration gerekir ve her satır için bu sütun eklenir. MongoDB’de yeni bir alan eklemek için mevcut document’ları değiştirmeye gerek yoktur; yeni document’lar yeni alanla gelir, eski document’larda alan eksik olabilir ve sorun yaratmaz. Ayrıca, union tipli verileri SQL’de yönetmek için farklı tablolar gerekebilirken, MongoDB’de tek collection içinde kolayca saklanabilir.
