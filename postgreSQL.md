1. postgres schema
2. postgres view
3. postgres functions
4. postgres partioning
5. postgres data types
6. connection pool(knex,typeorm,tarn)
7. postgres administration(priviligies,row level security)
8. postgres copy
9. postgres docker environments
10. How to resave a table to change columns order and columns type without lost the data.
11. MVCSS in postgresql
12. [raodmap](https://roadmap.sh/postgresql-dba)
13. vacuum launcher
14. Sorunnn: Docker compose dosyasını başlattıktan sonra kullanıcı şifresini değiştirip tekrar yazmama rağmen güncellenmiyor.Eski veriler ile girmeye devam etmem gerekiyor.Mesela postgres(süperuser) envsini unuttuğumda superadmin olarak bağlanamıyorum.Volume silmem gerekiyor çok saçma.
15. sorunn: normalde linuxta `su - postgres` çalışırken bitnami containerında çalışmıyor.Her komutta -U postgres eklemek gerekiyor yada db ye girip öyle oluşturmak gerekiyor.
16. non-root containers => COPY,import export files,\o
- postgreSQL is a relational object-orianted database management system.
- PostgreSQL uses client-server model and the default port is 5432.
-  Michael Stonebraker created postgres in 1986.In 1996,Postgres was renamed to postgresql and was added a lot of features.
-  PostgreSQL is highly extensible.It allow to add custom indexes,data types,functions and views.
-  Three databases come with postgresql by default.
-  We can do all the operations on pgadmin istead of dealing with the terminal.
    - In pgadmin query tool,It can be written multiple query at once,selected query will be executed.
- Shell commands are preceded by the prompt $.SQL commands are preceded by the prompt =>  or =#.The farmer is  for user and the latter is for superuser.
- version control: `select version();`
- `psql` parameters:
     - `-d` database
     - `-U` username
     - `-p` port number
     - `-W` enforce password 
- \! helpts to use non-SQL commands in postgresql . `\! ls`
- To see connection info `\conninfo`.Result will be like this `You are connected to database "postgres" as user "postgres" via socket in "/tmp" at port "5432".` 
- `\g` is used to execute the last successfull command
- `\h` for list of psql command and `\?` for bash commands
- `\timing` will show the execution time for the commands.To disable it,write it again.
- To import a file to the posgresql docker container
     1. pgadmin (couldn't) do
     2. copy files to docker container `docker cp ./users.sql pod-pos:./`  => import file `psql -U postgres -d postgres -f ./users.sql` => remove file(couldn't do)   
- all commands end with semicolon ;  
- `as` is used as determine alias. 
    - `SELECT b.name,u.name,u.admin FROM books AS b JOIN users as u ON u.id=b.user_id ORDER BY b.name;` 
    - `as` is an optinal identifier.So adding a space also can be enough for aliasing. `SELECT b.name,u.name,u.admin FROM books AS b JOIN users as u ON u.id=b.user_id ORDER BY b.name;`
- **POSTMASTER**: The Postmaster process in PostgreSQL acts as a listener for incoming connections. When a connection request is received, it manages authentication, authorization, and other checks to validate the connection. Once validated, the Postmaster spawns a new backend process, called Postgres, to handle the client's requests. Additionally, Postmaster functions as a supervisor to keep the database resilient; for example, if a critical process like autovacuum stops unexpectedly, the Postmaster restarts it automatically to maintain database performance.
     - **shared area**: All operations such as read, write, update, and delete in PostgreSQL are performed in the shared buffer area. When data is modified but not yet written to the data files on disk, it is referred to as dirty data. This data remains in memory until it is eventually flushed to the disk through a process known as checkpointing, ensuring that changes are persisted and the database is consistent.
     - **wall buffer**: The WAL (Write-Ahead Log) buffer contains records of all changes made to the database
     - **wall files**: WAL (Write-Ahead Log) files in PostgreSQL are used to ensure data integrity, durability, and crash recovery. These files store a sequential log of all changes made to the database, including insertions, updates, and deletions.
     - **log files**: Log files in PostgreSQL are used for recording various events, actions, and errors that occur during database operation


## AUTOCOMMIT
- When Auto-Commit is off: Each SQL command you execute does not get automatically committed. Instead, it enters a transaction that remains open.This means that you are in a transaction block after each SQL command, and changes are only visible to other sessions once you explicitly commit or rollback the transaction.We can change the mode witj `\set AUTOCOMMIT  on | off`
```sql
-- Start the transaction (automatically done when AUTOCOMMIT is off)
-- Run some queries
INSERT INTO users (name) VALUES ('John Doe');  -- This is not yet committed

-- Check the changes
SELECT * FROM users;

-- Commit the transaction to make changes permanent
COMMIT;

-- Or if you want to discard changes:
ROLLBACK;
```

### PG CATALOG TABLES
- In PostgreSQL, the pg_catalog schema contains several system tables and views that store metadata about the database, its objects (such as tables, views, and indexes), users, permissions, and more. These tables are regular tables in the sense that they can be queried like any other table, manual updates or changes to these system tables can break the database, so they should be treated with care.
- `select * from pg_tables ` see all pg  tables
- `select * from pg_user` see pg catalog user table. Also `pg_shadow` can be used.It shows passwords also.
- `select * from pg_indexes where tablename='users';` get all indexes which belongs to users table
- `select * from pg_available_extensions`: all the extensions
- `select * from pg_timezone_names;`
- `select * from pg_locks` : locked columns,tables
- ` select * from pg_settings where name='port';` show port parameter row. Also `select current_setting('port');` can be used to see port `SHOW PORT`, `select current_setting('max_connections')` can be used to see conf. `select current_setting('parameter')`
- `select now()` show current time
- `SHOW timezone;` or `select current_setting('timezone');` show timezone

### shut down
1. **Smart**: Prevents new connections but allows current ones to finish. Shuts down when no connections are left. 
2. **Fast (default)**: Prevents new connections and immediately terminates existing ones, shutting down quickly.
3. **Immediate**: Prevents new connections and terminates existing ones immediately, skipping cleanup, with recovery deferred until the next startup.
### RESTART VS RELOAD
- reload applies the configuration changes without affecting ongoing services, while restart fully resets the service to apply changes and clear any active states.  `

- `pg_ctl` :make operations on server(these commands are for bitnami) connect psql server to run the commands(docker exec)
     - All the commands run at `posgresql/data` file. 
     - `pg_ctl -D bitnami/postgresql/data/  status`    : server status
     - `pg_ctl -D bitnami/postgresql/data/  reload`    : reload server 
     - `pg_ctl -D bitnami/postgresql/data/  restart`    : restart server 
     - `ps -ef | grep postgres` : show postgres live operations
     - If we kill some processes with `kill index`,postmaster will restart it.
     - `pg_ctl -D bitnami/postgresql/data/ stop` : stops the server.
     - `pg_controldata -D bitnami/postgresql/data` : show the informations about server
- To change a option like `work_mem`(specifies the amount of memory used for internal sort operations and hash tables before writing to temporary disk files) We should set the variable then reload or restart the server.Server options can be set just by superuser.
     1. `SHOW work_mem;`  => 4MB
     2. `ALTER SYSTEM SET work_mem='20MB';` => alter system
     3. `SHOW work_mem;`  => 4MB still 
     4. Let's quit the database and reload the server with `pg_ctl -D bitnami/postgresql/data/ reload`
     5. Then when we connect the database and rerun the command `SHOW work_mem;`  => 20MB still 
- **structure**:
     - tokens
          1. **key words**: key words have fixed meaning in the SQL language.
          2. **identifiders-names**: Table,column,schema ....
          - Both key words and names are have same lexical structure.Both are case-insensitive.But A canvention is to write key words  in capitalize and names in lowercase. `SELECT * FROM users;`
          - Quoting identifier always make it case-sensitive.
          - Unquoted key words always act as kzey word whereas quoted key words can be act both identifier and key word.
          - ```sql
                  test=> select  select  from users;
              ERROR:  syntax error at or near "select"
              LINE 1: select  select  from users;
                              ^
              test=> select  "select"  from users;
              ERROR:  column "select" does not exist
              LINE 1: select  "select"  from users; 
             ```
     - Strings are defined with single quotes, and PostgreSQL automatically concatenates them if they are split across multiple lines.
         - ```sql
              INSERT INTO users (name,age,admin) values(
              'user'
              'hihi',23,false);
            ```
         - `INSERT INTO users (name,age,admin) values('user2' 'asd',21,false);` throws error
     - To write a single quote within a string constant , use two single quotes. For example: `'Cibilex''s home'`.
     - To enhance readability, dollar-quoting can be used instead of single quotes. Dollar-quoting allows for an optional tag as an identifier.Tags are case-sensitive. For example, $Cibilex$Cibilex's home$Cibilex$, $TEST$Cibilex's home$TEST$, and `'Cibilex''s home'` are equivalent.If tag identifider is not defined,double dollar must be used.
   - **COLLATE**
     - Collation is an algorithm that orders and compares strings.
     - Each database has a default collation (e.g., en_US.UTF-8). `SELECT * FROM users WHERE username >'mehmet'`
     - COLLATE overrides the default collation for specific queries. `SELECT * FROM users WHERE username COLLATE "C" > 'mehmet'`
   - **SCALAR SUBQUERY**: scalar subquery  is a subquery that returns single result from a different table.For example.
     - `SELECT *,(SELECT max(user_id) FROM books WHERE books.user_id=users.id) FROM users` 
## Functions
- `\df` is used to see all the functions
- There are 2 type of calling functions: 
    - **Positional notation**: Parameters are passed in a specific order. `my_function(true, 'hi world');`
    - **Named notation**: Parameters are passed by name, in any order. `:=` operator is also supported for backward compatibility. `my_function(a => 'hi world', b => true);`
    - Both notations can be used together.Positional notation must come first, followed by named notation.
  #### Mathematical Functions
- `greatest` `least` `random` `ceil` `sqrt` `mod`
- `select greatest(1,2,10,-10,2200,21)`
  ### String Functions
- **char_length,character_length,length**: returns length of the given string. `select char_length('Hi world');`
- **concat, ||**:returns  concatenated given strings. `select concat('hi world',' from',' postgreSQL');` `select 'hi world' || 'from' || 'postgresql';`
- **left**: returns first n chars in given string. `select left(name,2)  from users;`
- **right**: returns last n chars in given string. `select right(name,2)  from users;`
- **repeat**: repeats the given strings n times. `select repeat('hi world',4);`
- **reverse**: reverses the given string. ` select reverse('hi world');`
- **LOWER**: lowercase string
- **UPPER**: uppercase

 ### Aggregate functions
- `COUNT` `AVG` `SUM` `MIN` `MAX`
- **ARRAY_AGG(any)**: Each given element becomes a cell of array and returns the result array. `SELECT ARRAY_AGG(id) FILTER (WHERE id>20 LIMIT 10) FROM users;`
- **STRING_AGG(text,delimiter)**: Concat all the given text with given delimiter. 
     - `SELECT STRING_AGG(name,'-') FILTER (WHERE id>10 LIMIT 10) FROM users;` is incorrect
     - `select STRING_AGG(name,'-') FROM (SELECT * FROM users WHERE id<10);` is   
- Be aware that aggregate functions do not allow LIMIT.
- count(*) yields the total number of input rows; count(f1) yields the number of input rows in which f1 is non-null, since count ignores nulls; and count(distinct f1) yields the number of distinct non-null values of f1.
- `ORDER BY` always goes after all the aggregate arguments. `SELECT string_agg(a, ',' ORDER BY a) FROM table;` true ,`SELECT string_agg(a ORDER BY a, ',') FROM table;  -- incorrect`
- Sub filters can add specified aggregate functions. `SELECT COUNT(*),COUNT(*) FILTER (WHERE id<50) FROM users;`
- `WHERE` select inputs before aggregate functions computed whereas `HAVING` select inputs after aggregate functions computed.



## Views
- `\dv` is used to see all the views



 # DATABASE COMMANDS
1. **create**: 
     1. with psql  `CREATE DATABASE name` 
     2. with command line  `createdb -U username name`
2. **access**: 
    1. **between databases**: `\c name`
    2. **when sign in to postgres**: `psql -U username -d name` 
3. **list**: `\l` or `\list`
4. **drop**: 
     1. with psql `drop database name`
     2. with command line `dropdb -U username name`
 
**Note**:  an OID (Object Identifier) is a unique identifier assigned to each row in certain system catalogs, such as tables, indexes and databases.
-  To see oid of databases:  `select oid,datname from pg_database;`. So when we go to `cd /bitnami/postgresql/data/base` we should see the same folders with oids.|




## Users
- PostgreSQL database users are distinct from operating system users. While switching to the postgres user is possible on Linux as an OS user, this isn’t available in Docker Bitnami containers or on Windows. Therefore, commands must include the -U username flag in the shell prompt.
- Database users can view object lists, such as user and schema lists, but their ability to perform actions like creating or dropping databases, managing users,accessing database, or selecting data from tables depends on their assigned ROLE.
- superuser can do all the actions.
- `select current_user;` show current user
- In PostgreSQL, ROLE, GROUP, and USER essentially behave the same after version 8.1, as PostgreSQL unified the concepts. Prior to version 8.1, USER and GROUP were separate entities, where a USER was a role with login privileges, and a GROUP was essentially a way to manage a collection of users.
- To view connection information, use \conninfo.  `You are connected to database "postgres" as user "postgres" via socket in "/tmp" at port "5432".`
- `\du` or `SELECT * FROM pg_user;` can be used to list all users in PostgreSQL.
### Roles
1. LOGIN | NOLOGIN: Whether a user can login to the database.
2. CREATEROLE | NOCREATEROLE: Whether a user can create,update or drop roles.A user with the CREATEROLE privilege can create, update, or drop roles that they themselves have created. Additionally, such a user can grant privileges that they possess to other roles, but they cannot modify or drop roles they did not create unless they have the SUPERUSER privilege.
3. PASSWORD 'password': Sets the user's authentication password.
4. CREATEDB | NOCREATEDB: Whether a user can create databases.
5. SUPERUSER | NOSUPERUSER: Whether a user has full control over the database.
6. INHERIT | NOINHERIT : Whether a user can inherit the privileges of roles they are a member of.
7. CONNECTION LIMIT number: control the maximum number of concurrent connections.Default value is -1 which means there is no limit.
```sql
-- Creating a User:
CREATE USER cibilex2 WITH PASSWORD 'cibilex2' NOSUPERUSER; -- In psql:
CREATE USER david WITH PASSWORD 'david' CREATEDB CREATEROLE; -- can create database and roles

createuser -U postgres -S -P cibilex; -- In the shell
createuser -U postgres --interactive  -- With interactive mode in the shell



-- Dropping a User:
DROP USER cibilex2; -- In psql:
dropuser -U postgres cibilex; -- In the shell



CREATE ROLE log WITH PASSWORD 'log';  -- CREATE USER is just a shorthand for CREATE ROLE with LOGIN set by default.

--  the \password command can be used to set or update a user's password without needing to explicitly type the password in the command line
\password cibilex

COMMENT ON ROLE my_user IS 'This role is used for application data processing'; --To see comments also write `\du+`


--Altering a role
ALTER ROLE world WITH  CREATEROLE CONNECTION LIMIT 1;
ALTER ROLE world WITH PASSWORD 'world2';
```
## SCHEMAS
- help organize database objects, manage privileges, and allow for the creation of objects with the same name within the same database. Although schemas enable access to objects (like tables, views, functions, and constraints) across different schemas within the same database (if the necessary privileges exist), objects in different databases are not directly accessible.
- Schema names beginning with `pg_` are reserved for system purposes and cannot be created by users.
- `select current_schema();`
```sql
--Creating a schema:
CREATE SCHEMA test;

CREATE SCHEMA my_user AUTHORIZATION my_user; 
-- is equivalent to 
CREATE SCHEMA AUTHORIZATION my_user;
-- and both are make the owner is my_user

-- Listing schema list
\dn;

--Creating a table within a schema:
CREATE TABLE test.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20)
);
-- Inserting a row into a schema’s table:
INSERT INTO test.users (name) VALUES ('cibilex');

-- To drop a schema only if it’s empty:
DROP SCHEMA test;

-- To forcefully drop a schema along with all dependent objects:
DROP SCHEMA test CASCADE;
```
**search_path**: In PostgreSQL, the search_path specifies the list of schemas to use for resolving unqualified object names in queries, in the order given. By default, the search_path includes the `public` schema, so unqualified commands will operate within public unless otherwise specified.Each user has own search_path.
```sql
-- showing the search_path
SHOW search_path;

-- his sets test as the schema to use for unqualified queries. PostgreSQL will look for objects in test first and ignore other schemas.
SET search_path TO test;

-- In this case, PostgreSQL first looks in the test schema for unqualified objects. If the object isn’t found in test, it searches in public.
SET search_path TO test, public;
```


## Privileges
- All databases in PostgreSQL come with the public privilege by default, meaning that all users can connect to any database. To prevent this, we should revoke the CONNECT privilege from the public role for a specific database. By doing so, only the database owner or superuser will be able to connect to the database.

```sql
REVOKE CONNECT ON DATABASE postgres FROM PUBLIC; -- revoking public privelege from "postgres" database.

psql -U cibilex -d postgres -- when trying to access "postgres" database with a different user
psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL:  permission denied for database "postgres"


GRANt CONNECT ON DATABASE postgres TO PUBLIC; -- adding public privilege again.So anyone can access the database.

-- We can check whether a database connection is public or not by using the following SQL query:
SELECT
  datname AS database,
  pg_catalog.has_database_privilege('public', datname, 'connect') AS public_connect
FROM pg_database;

```

Each object in postgreSQL can have different privileges such as a table has SELECT,UPDATE,TRUNCATE,INSERT,DELETE  while A database has CONNECT or a schema has USAGE.Click [here](https://www.postgresql.org/docs/current/ddl-priv.html) too see all the details. And some privileges need other specific privileges to operate for example UPDATE or DELETE need Select privilege to run.Let's explain with a comprehensive example


There are two users: cibilex with the privileges CREATEDB, LOGIN, and ownership of a database named cibilex; and kevin, who has only LOGIN privileges and no other objects or privileges.

```sql
-- (cibilex in the cibilex database)
CREATE TABLE users(name VARCHAR(20)); -- ✅
INSERT INTO users VALUES('cibilex');  -- ✅

-- (kevin tries to connect to the database)
psql -U kevin -d cibilex -- ❌ 
psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL: permission denied for database "cibilex"

-- (cibilex grants kevin connect privilege on the cibilex database)
GRANT CONNECT ON DATABASE cibilex TO kevin;

-- (kevin tries to connect to the database again)
psql -U kevin -d cibilex  -- ✅

-- (kevin tries to insert data into the users table)
INSERT INTO users VALUES ('hi world'); -- ❌ 
ERROR: permission denied for table users

-- (cibilex grants kevin privileges for the users table)
GRANT SELECT, INSERT ON TABLE users TO kevin; -- ✅

-- (kevin inserts data and selects values from the users table)
INSERT INTO users VALUES ('hi world'); -- ✅
SELECT * FROM users; -- ✅

-- (cibilex creates a new table in a different schema)
CREATE SCHEMA cibilex; -- ✅
CREATE TABLE cibilex.users(age INT NOT NULL); -- ✅

-- (kevin tries to access the table in the new schema)
SELECT * FROM cibilex.users; -- ❌ 

-- (cibilex grants kevin privileges for all tables in the cibilex schema)
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA cibilex TO kevin;

-- (kevin can now access the table)
SELECT * FROM cibilex.users; -- ✅
INSERT INTO cibilex.users VALUES(22); -- ✅

```
Additional Examples:
1. `GRANT ALL PRIVILEGES ON TABLE users TO kevin;`: grants kevin all privileges on the users table.
2. `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cibilex TO PUBLIC;`: grants all users full access to all tables within the cibilex schema.
3. `REVOKE SELECT ON users FROM kevin;`: revokes kevin’s SELECT privilege on the users table.
4. `ALTER TABLE users OWNER TO Kevin;` give the ownership to the kevin
5. `GRANT SELECT (name) ON pruser.users TO pradmin;` grant specific column selection to the pradmin user.


# Table commands
-- **describe**: `\d name`
- **create** : `create table name`
     - Column count in a table is not limitless. 
     -  ```sql
        create table users(
        name varchar(50), -- write comment here
        age  smallint,
        admin boolean);
        /* multiline comment
        * with nesting: /* nested block comment */
        */
         ```
     - In PostgreSQL, the `SERIAL` type is equivalent to  `integer NOT NULL DEFAULT nextval('tablename_colname_seq')`. It does not automatically include `PRIMARY KEY` or `UNIQUE` constraints, so these must be added separately if needed. The `nextval()` function generates a unique integer by incrementing the previous value in the sequence, ensuring that each row gets a unique identifier.
     - **DEFAULT VALUES**: Default values can be expressions such as functions to return a value after sequence of calculation.
    - **Generated columns**  are always calculated from other columns in the same row. They cannot reference subqueries, other tables, other rows, or other generated columns, nor can they be overridden by user input. There are two types of generated columns: `STORED` and `VIRTUAL`.PostgreSQL currently supports only `STORED` generated columns.Generated columns calculations are made after BEFORE trigger.
         - **STORED Columns**: Calculated upon changes and store the actual computed data in the table. This is useful for faster reads, as the value doesn’t need recalculating. `CREATE TABLE items(id SERIAL PRIMARY KEY,tax INT NOT NULL,price INT NOT NULL,total INT NOT NULL  GENERATED ALWAYS AS (tax+price) STORED);`
         - **VIRTUAL Columns**: Calculated dynamically at read time and do not store the data physically in the table, which saves storage space but may incur slight performance costs on read operations.
    - **Constraints**: Constraints are validation expressions that prevent invalid data from being saved. Constraints can be named to make error handling easier. The order of constraints does not matter.`CHECK` constraints can slow down processes, but `NOT NULL`, `PRIMARY KEY`, and `FOREIGN KEY` constraints are game-changers, significantly improving the reliability of our database.
         -  ```sql
            CREATE TABLE orders (
                tax INT NOT NULL CONSTRAINT tax_constraint CHECK (tax > 0 AND tax < 20),
                price INT NOT NULL CHECK (price > 0)
            );  
            ```
         - `The UNIQUE` constraint does not treat `NULL` values as equal, meaning that multiple `NULL` values can be stored in a column with a `UNIQUE` constraint. To prevent this issue, the `NULLS NOT DISTINCT` constraint can be added.
            -  `CREATE TABLE colors(color VARCHAR(40) UNIQUE NULLS NOT DISTINCT);`
         - Both `PRIMARY KEY` and `UNIQUE` constraints automatically create a B-tree index on the column(s) to enforce uniqueness.
         - The `PRIMARY KEY` is equivalent to  `UNIQUE NOT NULL` and  constraints, and it is the default target for `FOREIGN KEY` references.
         - The `FOREIGN KEY` constraint enforces that a column's values match the values in another column, ensuring referential integrity. There are several ways to declare a `FOREIGN KEY` in PostgreSQL. For example, the following declarations are equivalent:
             - `CREATE TABLE settings (user_id INT NOT NULL REFERENCES users);`
             - `CREATE TABLE settings (user_id INT NOT NULL REFERENCES users (id));`
             - `CREATE TABLE settings (user_id INT, FOREIGN KEY (user_id) REFERENCES users (id) NOT NULL);`
         - `Foreign Key` constraints are triggered during two operations: `DELETE` and `UPDATE`. There are five different actions that can be specified for a `FOREIGN KEY` constraint when a referenced row is deleted or updated:
             1. **NO ACTION**: This is the default behavior. It prevents the delete and update operations if there are any dependent rows in the referencing table. The action is enforced immediately without waiting for the end of the transaction.
             2. **RESTRICT**: This is similar to `NO ACTION`, but it differs in that `RESTRICT` checks the constraint immediately, whereas `NO ACTION` waits until the end of the transaction to enforce the constraint.
             3. **CASCADE**: When a row is deleted, it deletes all the referencing rows (i.e., cascading the delete). On update, the referencing rows are updated with the new value of the referenced column.
             4. **SET NULL**: When the referenced row is deleted or updated, the foreign key columns in the referencing rows are set to `NULL`.
             5. **SET DEFAULT**: When the referenced row is deleted or updated, the foreign key columns in the referencing rows are set to their default values.
        - **Modifying Table**: 
             - **add column**: `ALTER TABLE colors ADD COLUMN rgb VARCHAR(6) CONSTRAINT not_blank CHECK (rgb <> '');`
             - **drop column**: `ALTER TABLE colors DROP COLUMN rgb;`  
             - **add constraint**: To delete a constraint, you must know its name. You can use the \d tablename command to view all constraints on a table, which helps you identify the exact name of the constraint you want to delete.
                 - `ALTER TABLE books ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;`
                 -  `ALTER TABLE COLORS ADD CHECK (color <> '');`
                 -  `ALTER TABLE users ALTER COLUMN name SET NOT NULL;` ``exception for null``
             - **DROP constraint**:
                 - `ALTER TABLE colors DROP CONSTRAINT colors_color_check;` 
                 - ~`ALTER TABLE users ALTER COLUMN name DROP NOT NULL;` `exception for null`
             - **SET default value**: `ALTER TABLE users ALTER COLUMN name SET DEFAULT  ' hi world' ;`
             - **drop default value**:   `ALTER TABLE users ALTER COLUMN name DROP DEFAULT;`
             - **Modify type**: `ALTER TABLE colors ALTER COLUMN  color TYPE varchar(200) NOT NULL;`
             - **rename column**: `ALTER TABLE colors RENAME COLUMN color TO name;`
             - **rename table**: `ALTER TABLE colors RENAME TO my_colors;`
         - **Conditions**:
             - 1. **CASE**: The CASE statement in SQL works similarly to an if/else structure in programming. It evaluates conditions sequentially with each WHEN clause. If a condition is met, the corresponding THEN statement is executed. If no conditions are met, the ELSE clause (if present) will run; otherwise, NULL is returned by default.
             -  ```SQL 
                CASE
                    WHEN condition THEN result
                    [WHEN ...]
                    [ELSE result]
                END  
                 ```
            -  ```SQL 
                SELECT age,
                    CASE
                        WHEN age < 12 THEN 'child'
                        WHEN age >= 12 AND age < 18 THEN 'teenager'
                        WHEN age >= 18 THEN 'adult'
                        ELSE 'unknown'
                    END AS category
                FROM users;
                ```
 
- **drop**: `drop table name`
- **list**: `\dt`
     - `\dt test.*;` list all tables within test schema
     - `\dt *.*` list all tables
- **insert**: 
    1.  `insert into users values ('mehmet',21,true);`  variables must be ordered correctly.
    2. `insert into users (age,name,admin) values (FLOOR(RANDOM()*60),'cibilex',RANDOM()<0.5);` column order can be specialized.
    3. to pupulate a table with random data:
         ```sql
         DO $$
        BEGIN
            FOR i IN 1..100 LOOP
                INSERT INTO users (name, age, admin)
                VALUES (
                    'User_' || i,                  -- name as 'User_1', 'User_2', etc.
                    FLOOR(RANDOM() * 60 + 18)::INT, -- random age between 18 and 77
                    (RANDOM() < 0.5)                -- random boolean for admin (true or false)
                );
            END LOOP;
        END $$;
         ```
- **select**:
    - **all data**: `select * from table name`
    - **DISTINCT**: select unique rows. 
        - `SELECT COUNT(age) FROM users;` =>101 rows
        - `SELECT COUNT(DISTINCT age) FROM users;`=>48 rows.It returns sum of unique age.
        - **like**: case-sensitive by default.To make case-insensitive =>`ilike`
             - `%sss%` =>including sss. `%sss` =>starts with sss
        -  **is null**    
        -  **fetch-limit**: Fetch is used to make queries compatible with other databases.Limit is not a sql standart while fetch is.
        -  Using `ORDER BY` with `FETCH` is a good practice.
        -  `OFFSET row_to_skip { ROW | ROWS } FETCH { FIRST | NEXT } [ row_count ] { ROW | ROWS } ONLY`
             - The `ROW` is the synonym for `ROWS` and the `FIRST` is synonym for `NEXT`.  
        -  `SELECT * FROM books ORDER BY user_id DESC OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY`
        -  `SELECT * FROM books ORDER BY user_id DESC FETCH FIRST 2 ROW ONLY`

- **delete**:
     - delete command does not support `limit` but there are some alternatives to overcome.
     - `DELETE FROM books WHERE user_id>70;`
     - return value is `DELETE affectedCount`
- **update**: 
     - update operator also does not support to use limit.
     - `UPDATE books SET name ='Hogwards',user_id=user_id+10;`
     - return value is `UPDATE affectedRows`  


### Indexes
- `di` show indexes or `select * from pg_indexes`