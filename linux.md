PostgreSQL için:
postgresql.conf Dosyasını Düzenleme:
PostgreSQL'in yapılandırma dosyası olan postgresql.conf dosyasını düzenleyin. Bu dosya genellikle /etc/postgresql/<version>/main/ dizininde bulunur.
sudo nano /etc/postgresql/<version>/main/postgresql.conf
Ardından, listen_addresses parametresini doğru IP adresine ayarlayın veya tüm IP adreslerinden gelen bağlantılara izin vermek için '*' olarak ayarlayın:
listen_addresses = '*'
pg_hba.conf Dosyasını Düzenleme:
PostgreSQL'in kimlik doğrulama dosyası olan pg_hba.conf dosyasını düzenleyin. Bu dosya genellikle pg_hba.conf olarak adlandırılır ve data_directory içinde bulunur.
bash
Copy code
sudo nano /etc/postgresql/<version>/main/pg_hba.conf
Dosyayı açtıktan sonra, dışarıdan gelen bağlantılara izin vermek için uygun host satırlarını ekleyin veya mevcut olanları düzenleyin. Örneğin:
css
Copy code
host    all             all             0.0.0.0/0               md5
Yukarıdaki örnek, tüm IP adreslerinden gelen tüm kullanıcılara tüm veritabanlarına MD5 kimlik doğrulaması kullanarak erişim izni verir.
Servisi Yeniden Başlatma:
Yaptığınız değişikliklerin etkili olması için PostgreSQL servisini yeniden başlatın:
bash
Copy code
sudo systemctl restart postgresql
Redis için:
redis.conf Dosyasını Düzenleme:
Redis'in yapılandırma dosyası olan redis.conf dosyasını düzenleyin. Bu dosya genellikle /etc/redis/ dizininde bulunur.
bash
Copy code
sudo nano /etc/redis/redis.conf
Dosyayı açtıktan sonra, bind parametresini yorum satırından çıkarın ve IP adresini 0.0.0.0 olarak ayarlayın:
bash
Copy code
bind 0.0.0.0
Redis Servisini Yeniden Başlatma:
Yaptığınız değişikliklerin etkili olması için Redis servisini yeniden başlatın:
bash
Copy code
sudo systemctl restart redis
Bu adımları takip ettikten sonra, PostgreSQL ve Redis servisleriniz dışarıdan erişilebilir hale gelecektir. Ancak, güvenlik endişeleri nedeniyle, servislere erişim için gerekli güvenlik önlemlerini aldığınızdan emin olun.
