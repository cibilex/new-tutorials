Foreign key

Foreign key [name] (column1,column2) references tableName (columnName) on update reference_type on delete reference_type

Aşağıdaki örnekten gidelim:
```bash
CREATE TABLE orders (
    id INT UNSIGNED PRIMARY KEYk
    -- Other columns for the orders table
);

CREATE TABLE order_items (
    id serial,
    order_id int NOT NULL,
    CONSTRAINT order_items_order_id_fk FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE NO ACTION ON DELETE NO ACTION
);
```

name: foreign key constraint    
columnName: column name which associated with specified columns     
reference_type: Farklı tipler bulunmaktadır     
**no action,restrict** : 2 şey sunar     
1. items tablosunda ordersa ait bir satır olduğu sürece,orders tablosundaki satır silinemez.    
2. items tablosundaki order_id sütunu güncellenemez.

```bash
insert into orders values();

insert into order_items values (1);
```

```bash
delete from orders where id =1;
ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (`test`.`order_items`, CONSTRAINT `order_items_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION)
```

Foreign key Constraintini silmek için:
```bash
alter table order_items drop constraint order_items_order_id_fk;
delete from orders where id =1;
Query OK, 1 row affected (0.003 sec)
```
Foreign key kaldırıldıktan sonra silinebilir.

Cascade:
Update veya delete işlemlerinde bağlantılı olduğu satırların tamamını siler.

```bash
ALTER TABLE order_items ADD CONSTRAINT order_constraint FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE CASCADE ON DELETE CASCADE;
Query OK, 0 rows affected (0.017 sec)              
Records: 0  Duplicates: 0  Warnings: 0

MariaDB [test]> insert into orders values();
Query OK, 1 row affected (0.004 sec)

MariaDB [test]> select * from order_items;
Empty set (0.006 sec)

MariaDB [test]> select * from orders;
+----+
| id |
+----+
|  2 |
+----+
1 row in set (0.001 sec)

MariaDB [test]> insert into order_items (order_id) values (2);
Query OK, 1 row affected (0.002 sec)

MariaDB [test]> delete from orders where id=2;
Query OK, 1 row affected (0.004 sec)

MariaDB [test]> select * from order_items;
Empty set (0.001 sec)
```

**set null** : referans sütun update veya delete işleminde null değeri alır.
Devam edebilmemiz için order_id sütununun olabilmesini sağlamalıyız.
```
alter table order_items modify column  order_id int;
ALTER TABLE order_items ADD CONSTRAINT set_null_constraint FOREIGN KEY (order_id) REFERENCES orders(id) ON UPDATE SET NULL ON DELETE SET NULL;
```
