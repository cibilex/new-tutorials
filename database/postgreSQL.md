https://www.hackerrank.com/apply?roles=%5B%22Back-End+Developer%22%2C%22Back-End+Developer+%28Node%29%22%2C%22Back-End+Developer+%28Node.js%29%22%2C%22Backend+Developer%22%2C%22Front-End+Developer%22%2C%22Front-End+Developer+%28Vue%29%22%2C%22Frontend+Developer%22%2C%22Frontend+Developer+%28Vue.js%29%22%2C%22Senior+Frontend+Developer%22%2C%22Senior+Frontend+Developer+%28Vue.js%29%22%2C%22Full-Stack+Engineer+%28Vue%2C+Node%29%22%2C%22Fullstack+Engineer%22%5D&countries=%5B%22Turkey%22%5D


https://jobs.lever.co/oneteam/b105de9d-8c17-4e5a-970c-f105a4dc1798
https://www.hogarth.com/job/freelance-front-end-developer?gh_src=9ea6f5ad4us
with clause,recursive queries
https://www.hackerrank.com/challenges/sql-projects/problem?isFullScreen=true
date_add

1. postgres schema
2. postgres view
3. postgres functions
4. postgres partioning
5. postgres data types
6. connection pool(knex,typeorm,tarn)
7. postgres administration(priviligies,row level security)
8. postgres copy
9. incremental
10. postgres docker environments
11. How to resave a table to change columns order and columns type without lost the data.
12. MVCSS in postgresql
13. [raodmap](https://roadmap.sh/postgresql-dba)
14. vacuum launcher
15. Sorunnn: Docker compose dosyasını başlattıktan sonra kullanıcı şifresini değiştirip tekrar yazmama rağmen güncellenmiyor.Eski veriler ile girmeye devam etmem gerekiyor.Mesela postgres(süperuser) envsini unuttuğumda superadmin olarak bağlanamıyorum.Volume silmem gerekiyor çok saçma.
16. sorunn: normalde linuxta `su - postgres` çalışırken bitnami containerında çalışmıyor.Her komutta -U postgres eklemek gerekiyor yada db ye girip öyle oluşturmak gerekiyor.
17. non-root containers => COPY,import export files,\o
18. When I try to stop the postgresql server with `pg_ctl -D /bitnami/postgresql/data stop` .It throws me out immidiately.
19. docker run --rm -it --volumes-from <container_id_or_name> busybox sh
https://hizlibasvuru.aselsan.com.tr/apply?announcementId=95e7d7df-cc6c-4fb0-8055-cd1eeef4a116
1.  string ordering


- postgreSQL is a relational object-orianted database management system.
- PostgreSQL uses client-server model and the default port is 5432.
-  Michael Stonebraker created postgres in 1986.In 1996,Postgres was renamed to postgresql and was added a lot of features.
-  PostgreSQL is highly extensible.It allow to add custom indexes,data types,functions and views.
-  Three databases come with postgresql by default.
-  SQL requires that every subquery used as a table source (in FROM or as a subquery in SELECT) must have an alias.
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



- PostgreSQL is case sensitive. To do what you want create a function index. So say `CREATE UNIQUE INDEX test_upper_idx ON mytable (UPPER(myfield));`

- **POSTMASTER**: The Postmaster process in PostgreSQL acts as a listener for incoming connections. When a connection request is received, it manages authentication, authorization, and other checks to validate the connection. Once validated, the Postmaster spawns a new backend process, called Postgres, to handle the client's requests. Additionally, Postmaster functions as a supervisor to keep the database resilient; for example, if a critical process like autovacuum stops unexpectedly, the Postmaster restarts it automatically to maintain database performance.
     - **shared area**: All operations such as read, write, update, and delete in PostgreSQL are performed in the shared buffer area. When data is modified but not yet written to the data files on disk, it is referred to as dirty data. This data remains in memory until it is eventually flushed to the disk through a process known as checkpointing, ensuring that changes are persisted and the database is consistent.
     - **wall buffer**: The WAL (Write-Ahead Log) buffer contains records of all changes made to the database
     - **wall files**: WAL (Write-Ahead Log) files in PostgreSQL are used to ensure data integrity, durability, and crash recovery. These files store a sequential log of all changes made to the database, including insertions, updates, and deletions.
     - **log files**: Log files in PostgreSQL are used for recording various events, actions, and errors that occur during database operation


## AUTOCOMMIT
- When Auto-Commit is off: Each SQL command we execute does not get automatically committed. Instead, it enters a transaction that remains open.This means that we are in a transaction block after each SQL command, and changes are only visible to other sessions once we explicitly commit or rollback the transaction.We can change the mode witj `\set AUTOCOMMIT  on | off`
```sql
-- Start the transaction (automatically done when AUTOCOMMIT is off)
-- Run some queries
INSERT INTO users (name) VALUES ('John Doe');  -- This is not yet committed

-- Check the changes
SELECT * FROM users;

-- Commit the transaction to make changes permanent
COMMIT;

-- Or if we want to discard changes:
ROLLBACK;
```

## PostgreSQL files


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


  ### Mathematical Functions
- `greatest` `least` `random` `ceil` `sqrt` `mod`
- `select greatest(1,2,10,-10,2200,21)`

## Utils
- **generate_series**:
   1. `generate_series(start, end)`  This generates a series of numbers from start to end, and the end is included.
   2. `generate_series(start_date, end_date, interval)` This generates a series of timestamps from start_date to end_date with the given interval between them, and the end date is also included.
   - ```sql
        SELECT * FROM generate_series('2024-01-01'::date, '2024-03-02'::date, '1 day'::interval);
        -- Returns each day from '2024-01-01' to '2024-03-02'

        SELECT * FROM generate_series(1, 10); 
        -- Returns numbers from 1 to 10

        SELECT COUNT(*) FROM GENERATE_SERIES(1,100,5); -- returns 
        
        INSERT INTO ORDERS (title, created_at)
        SELECT 'title_' || FLOOR(RANDOM() * 10 + 1), gs.curr_date
        FROM GENERATE_SERIES(
        '2024-01-01'::date, 
        '2024-02-20'::date, 
        '1 day'::interval
        ) AS gs(curr_date);



       ```

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
- To view connection information, use \conninfo.  `we are connected to database "postgres" as user "postgres" via socket in "/tmp" at port "5432".`
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
             1. **NO ACTION**: This is the default behavior. It prevents the delete and update operations if there are any dependent rows in the referencing table.
             2. **RESTRICT**: This is similar to `NO ACTION`, but it differs in that `RESTRICT` checks the constraint immediately, whereas `NO ACTION` waits until the end of the transaction to enforce the constraint.
             3. **CASCADE**: When a row is deleted, it deletes all the referencing rows (i.e., cascading the delete). On update, the referencing rows are updated with the new value of the referenced column.
             4. **SET NULL**: When the referenced row is deleted or updated, the foreign key columns in the referencing rows are set to `NULL`.
             5. **SET DEFAULT**: When the referenced row is deleted or updated, the foreign key columns in the referencing rows are set to their default values.
        - **Modifying Table**: 
             - **add column**: `ALTER TABLE colors ADD COLUMN rgb VARCHAR(6) CONSTRAINT not_blank CHECK (rgb <> '');`
             - **drop column**: `ALTER TABLE colors DROP COLUMN rgb;`  
             - **add constraint**: To delete a constraint, we must know its name. we can use the \d tablename command to view all constraints on a table, which helps we identify the exact name of the constraint we want to delete.
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
             - **change schema**: `ALTER TABLE public.my_table SET SCHEMA test;`
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


## Functions
- `\df` is used to see all the functions
- There are 2 type of calling functions: 
    - **Positional notation**: Parameters are passed in a specific order. `my_function(true, 'hi world');`
    - **Named notation**: Parameters are passed by name, in any order. `:=` operator is also supported for backward compatibility. `my_function(a => 'hi world', b => true);`
    - Both notations can be used together.Positional notation must come first, followed by named notation.

```sql
CREATE OR REPLACE FUNCTION function_name(param_list)
RETURNS return_type
LANGUAGE plpgsql
AS $$
DECLARE
    -- Variable declarations, if necessary
BEGIN
    -- Function logic
    -- Return a result
END;
$$;
```
- `OR REPLACE` is an optional clause. It is used to replace an existing function if it already exists with the same name.We cannot change the names of the input parameters or the return type when using `OR REPLACE`. Only the function body can be modified.
N8LMTF060702
```sql
-- creating function.
CREATE OR REPLACE FUNCTION sumss(ac INT ,bc INT)
RETURNS INTEGER
RETURN ac + bc;
N8LMTF060702
-- calling
select sumss(1,2);
-- or
select sumss(a => 1,b => 2); -- := also can be used.
```

- `LANGUAGE language`
   1.  `sql` :Simple, single-line, cannot use IF or LOOPS, but they are faster.Default language.
   2.  `plpgsql` (Prodecural Language / postgreSQL) : Complex, can be multi-line, supports IF, LOOPS, and other control structures, but slower than SQL functions.Structure is 
        1. **header**: The header section can be used to declare variables , its optinal.
             - ```sql
                DECLARE
                    variable_name type [DEFAULT value];
                    another_variable type;
               ```  
        2. **body**: The body contains the logic of the function. This section must always include at least one statement and is wrapped in BEGIN and END.
             - ```sql
                BEGIN
                    -- write logic here 
                END;
                ```

- `Argument Modes in PostgreSQL Functions`
     1. `IN` : The argument acts as an input parameter.Default mode.
     2. `OUT`: The argument acts as an output parameter.The values assigned to these arguments inside the function are automatically included in the function's result.
     3. `INOUT`: The argument is both an input and output parameter.It is passed to the function as input, and the function modifies and returns it as part of the output.
     - ```sql
        CREATE OR REPLACE FUNCTION g(
            IN l INT, 
            OUT id INT, 
            INOUT user_name VARCHAR(20)
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
        SELECT u.name, u.id INTO user_name, id FROM users u WHERE u.name = user_name AND u.id = l;
        END;
        $$;
       ```
- PostgreSQL supports function overloading, allowing functions with the same name but different parameter lists. However  if the parameters overlap ambiguously, PostgreSQL cannot determine which function to execute and throws error.
```sql
-- function 1
CREATE OR REPLACE FUNCTION get_user_count(n VARCHAR(30))
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE 
   c INT;
BEGIN
  SELECT COUNT(*) into c FROM users u where u.name=n;
  RETURN c;
END;
$$;

-- function 2
CREATE OR REPLACE FUNCTION get_user_count(n VARCHAR(30),a BOOLEAN DEFAULT FALSE)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE 
   c INT;
BEGIN
  SELECT COUNT(*) into c FROM users u where u.name=n AND u.admin=a;
  RETURN c;
END;

$$;

select get_user_count('ilex',true) -- works correctly
select get_user_count('ilex'); -- throws error : function get_user_count(unknown) is not unique
```
- `RETURNS TABLE(columns)` allow to return table
- `SETOF tablename` can be used to return a row or rows from a table.
     - ```sql
        CREATE OR REPLACE FUNCTION get_user(n VARCHAR(20))
        RETURNS SETOF users
        LANGUAGE plpgsql
        AS $$
        BEGIN
        RETURN QUERY SELECT * FROM users u WHERE u.name=n;
        END;
        $$;


        SELECT * FROM get_user('cibilex');
        SELECT id,age FROM get_user('cibilex');
        ```
- `DROP FUNCTION`: if we have multiple functions with the same name (due to function overloading), we must specify the function's parameters in the `DROP FUNCTION` statement to uniquely identify which function to drop.
- `ALTER FUNCTION fill_users RENAME TO populate_users;` rename function
- `ALTER FUNCTION populate_users OWNER TO cibilex;`  change owner
- `ALTER FUNCTION populate_users SET SCHEMA test;` change schema
- `\df test.*`  list all functions which are in test schema
- While postgreSQL does not support transactions in functions,producers are used for this aim.
```SQL
CREATE OR REPLACE FUNCTION get_user(IN i INT)
RETURNS SETOF users
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT * 
    FROM users u 
    WHERE u.id = i;

    IF FOUND THEN
        RAISE NOTICE 'User with ID % exists', i;
    ELSE
        RAISE EXCEPTION 'User with ID % does not exist', i;
    END IF;
END;
$$;


CREATE OR REPLACE FUNCTION insert_users()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE 
  item INT;
  ag INT := 0;
BEGIN
  FOR i IN 0..10 LOOP
    RAISE INFO 'Current index is %', i;
    ag := FLOOR(RANDOM() * 120);  -- Generate random age between 0 and 89
    SELECT id INTO item FROM users u WHERE u.age = ag LIMIT 1;  -- Retrieve user with the random age

    IF item IS NOT NULL THEN
      RAISE NOTICE 'User exists with age %', ag;
    ELSE
      INSERT INTO users (name, age, admin) 
      VALUES ('Age_' || i, ag, RANDOM() < 0.5);  -- Insert a new user with random name, age, and admin flag
    END IF;

    item := NULL;  -- Reset item for the next iteration
  END LOOP;
END;
$$;

```

### LOOPS
1. **For in**:
```sql
for loop_counter in [ reverse ] from.. to [ by step ] loop
    statements
end loop
```

```sql
CREATE OR REPLACE FUNCTION fill_users()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
   inserted_id INT =0;
BEGIN
 FOR i IN 0..10 LOOP
    RAISE INFO 'current value is %',i;
	INSERT INTO users (name,admin,age) VALUES ('x' || i,RANDOM()<0.5,FLOOR(RANDOM()*90+1)) RETURNING id INTO inserted_id;
	RAISE NOTICE 'inserted id is %',inserted_id;
	
 END LOOP;
END;
$$;
```
- `BY step` can be used to declare step.The loop will run three times if we write`FOR i IN 0..10 BY 5 LOOP`. 
- `REVERSE from...to` can be used to reverse loop.The loop will starts with 10 if we write`FOR i IN REVERSE 10..1 LOOP`
### Inheritance
- Inheritance in PostgreSQL is similar to the subclass method in Object-Oriented Programming (OOP), but it is not identical. While some features such as CHECK and NOT NULL are inherited , others such as FOREIGN KEY,INDEXes and UNIQUE are not.
- Inheritance is a good method for creating hierarchical tables. For example, a logs table might contain columns such as ip, response, and code. A specialized error_logs table could include additional columns like error_class.For example 
- As a consequence, inheritance is a useful approach for declaring hierarchical tables. However, it can be somewhat confusing and requires additional effort to ensure a reliable database structure. For most circumstances, partitioning is often a better and more practical solution.
    - ```sql
      --  Create a Parent Table
      CREATE TABLE logs (id SERIAL PRIMARY KEY, code INT NOT NULL, response TEXT);

      -- Create a Child Table with Inheritance
      CREATE TABLE error_logs (err TEXT) INHERITS (logs);

      -- Select All Rows (Including Child Rows)
      SELECT * FROM logs;

      -- SELECT * FROM ONLY logs;
      SELECT * FROM ONLY logs;

      -- Drop a Table (Enforcing Cascade) Use the CASCADE option to remove a parent table along with its child tables.
      DROP TABLE logs CASCADE;

      -- Add a Column to Both Parent and Child Tables.Constraints like PRIMARY KEY and FOREIGN KEY are not inherited  automatically and must be manually defined in child tables.
      ALTER TABLE logs ADD COLUMN user_id INT REFERENCES users;
        ``` 

### Partitioning
- Partitioning helps manage large datasets by splitting them into smaller, more efficient subsets. This can improve query performance, particularly for range queries and data management operations (like deletions).
- These are the three main partitioning methods in PostgreSQL:
     1. **RANGE**: Divides data based on a range of values (e.g., dates, numbers).
     2. **LIST****: Divides data based on discrete values (e.g., categories, specific dates).
     3. **HASH**: Divides data based on a hash function, though it’s not as commonly used for typical range-based queries.
- **Partitioned table**  does not store data but acts as a template for the child partitions. The partitions themselves store the actual data.
- **Partition key**: The partition key is the column on which partitioning is based (e.g., a date column for range partitioning). 
-  A regular table cannot be directly partitioned, and a partitioned table cannot hold data.
-   Indexes and constraints created on the partitioned table automatically inherit to the child partitions. However, we can define additional custom indexes on the child partitions if needed.
-   Primary key or unique constraints cannot be used without partition key.For example `id SERIAL PRIMARY KEY` will throws error.
-   Use `ALTER TABLE ... DETACH` or `DROP TABLE` instead of `DELETE FROM `because of performance.
-   PostgreSQL doesn't support foreign keys across partitions, so this is something to be mindful of when designing partitioned tables.
-   `enable_partition_pruning` make sure that this option is on.This allows to create query planning for faster queries.  

1. **Old way-with inheritance** : It's more flexible from the new way but its not that fast.
- `ALTER TABLE orders_jan NO INHERIT orders;`
```SQL
-- Create the main orders table with common columns
CREATE TABLE orders(
    ID SERIAL PRIMARY KEY,  -- Unique identifier for each order
    title VARCHAR(50),      -- Title of the order
    created_at TIMESTAMP    -- Timestamp of when the order was created
);

-- Create child tables for each month with date-based checks
CREATE TABLE orders_jan(
    CHECK (created_at >= '2024-01-01' AND created_at < '2024-02-01')  -- January orders
) INHERITS (orders);  -- Inherit from orders table

CREATE TABLE orders_feb(
    CHECK (created_at >= '2024-02-01' AND created_at < '2024-03-01')  -- February orders
) INHERITS (orders);  -- Inherit from orders table

-- Create indexes for faster queries on child tables
CREATE INDEX ON orders_jan (created_at);
CREATE INDEX ON orders_feb (created_at);

-- Create the trigger function to insert into appropriate child tables
CREATE OR REPLACE FUNCTION on_order_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into orders_jan if created_at is in January
  IF (NEW.created_at >= '2024-01-01' AND NEW.created_at < '2024-02-01') THEN
     INSERT INTO orders_jan VALUES(NEW.*);
  -- Insert into orders_feb if created_at is in February
  ELSIF (NEW.created_at >= '2024-02-01' AND NEW.created_at < '2024-03-01') THEN
      INSERT INTO orders_feb VALUES(NEW.*);
  ELSE
    -- Raise exception if the date does not match
    RAISE EXCEPTION 'Valid child table not found for %', NEW.created_at;
  END IF;

  -- Prevent insertion in the parent table
  RETURN NULL;
END;
$$;

-- Create the trigger to invoke the function before insert
CREATE TRIGGER insert_check
BEFORE INSERT ON orders  -- Trigger before insert
FOR EACH ROW            -- For each row inserted
EXECUTE PROCEDURE on_order_insert();  -- Call the insert function

-- Test inserts
INSERT INTO orders (title, created_at) VALUES ('amazon order', '2024-01-01');  -- January
INSERT INTO orders (title, created_at) VALUES ('amazon order', '2024-02-01');  -- February
INSERT INTO orders (title, created_at) VALUES ('amazon order', '2024-02-10');  -- February
INSERT INTO orders (title, created_at) VALUES ('amazon order', '2024-03-01');  -- Will raise exception

-- Query results
SELECT * FROM orders;   -- Should be empty (data goes into child tables)
SELECT * FROM orders_jan;  -- Should show January orders
SELECT * FROM orders_feb;  -- Should show February orders

```

2. **New way-declarative partitioning**:

```sql
CREATE TABLE orders (
    id SERIAL,
    created_at TIMESTAMP NOT NULL,
    UNIQUE (id, created_at)  -- Include both id and created_at in the UNIQUE constraint
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_jan PARTITION OF orders FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE orders_feb PARTITION OF orders FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE orders_march PARTITION OF orders FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- CREATE INDEX ON orders (created_at);

INSERT INTO orders (title,created_at) SELECT curr_time,curr_time FROM GENERATE_SERIES('2024-01-01'::date,'2024-03-25'::date,'1 minute'::interval) as gs(curr_time);
INSERT INTO orders (title,created_at) VALUES ('hi','2024-04-01'); --ERROR:  no partition of relation "orders" found for row

```
- Tables with conflicting constraints cannot be part of the same partition.
- `DETACH PARTITION` This command does not drop the table; it merely removes the table from the partition.
     - `ALTER TABLE orders DETACH PARTITION orders_jan;`
- `ATTACH PARTITION`  This command allows we to easily add a table to a partitioned table.
    - `CREATE TABLE orders_april (LIKE orders INCLUDING DEFAULTS INCLUDING CONSTRAINTS);` First, create a table that matches the partition structure:
    - `ALTER TABLE orders_april ADD CHECK (created_at>='2024-04-01' AND created_at<'2024-05-01');` Next, add an appropriate constraint to the table:
    - `INSERT INTO orders_april (title,created_at) VALUES ('hi','2024-04-12');` Insert data into the new table:
    - `ALTER TABLE orders ATTACH PARTITION orders_april FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');` Finally, attach the new table to the partitioned table:


**Old way vs new way**:
1. Structure of columns have to be the same with the parent table in new way.But we can add custom columns to child tables in old way.
2. New way is faster.
3. A child table can have multiple parent table in old way.
### [PARTMAN](https://github.com/pgpartman/pg_partman/blob/development/doc/pg_partman.md)
- Pg_partman is a PostgreSQL extension designed to simplify the creation and management of partitions. As a background worker (BGW), it eliminates the need for an external scheduler by automating partition maintenance tasks.
- pg_partman cannot be used for list partitioning, such as grouping rows by distinct cities.
- The `run_maintenance` function is a scheduled job that automatically creates new partitions or detaches old ones (date aging) based on the defined criteria.The default interval for `run_maintenance` is 3600 seconds (1 hour), but it can be customized.

- These are important options
     1. **shared_preload_libraries** : Must include 'pg_partman_bgw' to activate the extension. Requires restart.
     2. **pg_partman_bgw.dbname**: Specifies the databases where pg_partman will operate. Multiple databases can be listed, separated by commas such as `'ilex,postgres'`.
     3. **pg_partman_bgw.interval**: Sets the interval between run_maintenance executions. The default is 3600 seconds (1 hour).
     4. **pg_partman_bgw.role**: Determines the PostgreSQL role used for pg_partman operations.
     5. **pg_partman_bgw.analyze**: Default is `off`. Controls whether tables are analyzed during maintenance.
     6. **pg_partman_bgw.jobmon**: Default is `on`. This works with the Jobmon extension to monitor and manage partitions.
  
- `create_parent(p_parent_table text, p_control text, p_type text, p_interval text, p_constraint_cols text[] DEFAULT NULL::text[], p_premake integer DEFAULT 4, p_automatic_maintenance text DEFAULT 'on'::text, p_start_partition text DEFAULT NULL::text......)`
     1. `p_parent_table` : partitioned table
     2. `p_control` : partition key
     3. `p_type`:
         - `native` : postgresql native partition feature.Recommended
         - `partman` : partman partition logic.  
     4. `p_interval` : interval always must be string.
     5. `p_premake` : number of next and previous table
     6. `p_start_partition` : starting point
     7. `p_default_table` : Default is true.So if there is no valid table ,partman will insert the data to default table.If we make it false,Partman will throw error.
- to call the function that create and drop old tables `CALL run_maintenance_proc();`
- If we run `\df` we should see the partman functions.
- `SELECT * FROM ONLY orders` : do not include child datas.
- **Installation**: To install pg_partman and nano look at the Dockerfile
     - ```sql
        -- Add the extension
        CREATE EXTENSION pg_partman SCHEMA test;

        -- Create a role and grant permissions
        CREATE ROLE partman LOGIN;
        GRANT ALL ON SCHEMA test TO partman;
        GRANT ALL ON ALL TABLES IN SCHEMA test TO partman;
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA test TO partman;
        GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA test TO partman;
        GRANT TEMPORARY ON DATABASE ilex TO partman;
        ``` 
- **configuration**: 
     1. ```yml
        version: "3"
        services:
        postgresql:
            container_name: pod
            image: my-postgres
            environment:
            - POSTGRESQL_USERNAME=my_user
            - POSTGRESQL_PASSWORD=my_password
            - POSTGRESQL_POSTGRES_PASSWORD=postgres_pass
            - POSTGRESQL_SHARED_PRELOAD_LIBRARIES=pg_partman_bgw
            volumes:
            - pod-p:/bitnami/postgresql
            ports:
            - "5432:5432"

        volumes:
        pod-p: 
         ``` 
     2. Also we need to add some pg_partman options to config file 
         - ```conf
            # Add settings for extensions here nano opt/bitnami/postgresql/conf/postgresql.conf
            pg_partman_bgw.interval = 36000
            pg_partman_bgw.role = 'partman'
            pg_partman_bgw.dbname = 'ilex'
            ``` 
      3. `pg_ctl -D bitnami/postgresql/data/ restart`

- **example with time**: 
     - ```sql
        SET search_path = 'test';

        -- Create the partitioned table
        CREATE TABLE orders (
            id SERIAL,
            created_at TIMESTAMP NOT NULL,
            UNIQUE (id, created_at)
        ) PARTITION BY RANGE (created_at);

        -- Use pg_partman to create partitions automatically
        SELECT create_parent(
            p_parent_table := 'test.orders',
            p_control := 'created_at',
            p_type := 'native',
            p_interval := 'monthly',
            p_start_partition := '2024-05-01'
        );

        -- Alternatively, call the function with positional parameters
        SELECT create_parent('test.orders', 'created_at', 'native', 'monthly', p_start_partition := '2024-05-01');
              
        ``` 
- **example with serial**:
     - ```sql
        -- Create a partitioned table
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) NOT NULL
        ) PARTITION BY RANGE (id);

        -- Use pg_partman to manage partitions
        SELECT create_parent(
            p_parent_table := 'test.tags',
            p_control := 'id',
            p_type := 'native',
            p_interval := '10'
        );
     ```  
- **Mıgration**:
- Note that this is offline way
- `partition_data_proc` IN p_parent_table text, IN p_interval text DEFAULT NULL::text, IN p_batch integer DEFAULT NULL::integer, IN p_wait integer DEFAULT 1, IN p_source_table text DEFAULT NULL::text,
```sql
CREATE TABLE orders(
id SERIAL,
price INT NOT NULL,
created_at TIMESTAMP NOT NULL,
PRIMARY KEY (created_at,id)
) ;
INSERT INTO orders (price,created_at) SELECT  FLOOR(RANDOM()*1000),curr_time FROM GENERATE_SERIES('2024-08-01'::date,'2024-10-25'::date,'1 second'::interval) AS gs(curr_time)  ;

ALTER TABLE orders RENAME TO old_orders;

-- create a new table .Note that we didn't write PRIMARY KEY (created_at,id).We will add it later
CREATE TABLE orders(
id SERIAL,
price INT NOT NULL,
created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

CREATE INDEX ON orders (created_at);

SELECT create_parent('ilex.orders','created_at','native','monthly');

SELECT COUNT(*) FROM old_orders; -- 7344001


CALL partition_data_proc(
p_parent_table => 'ilex.orders',
p_batch => 100,
p_interval => '1000',
p_source_table => 'ilex.old_orders'	
);

SELECT COUNT(*) FROM old_orders; -- 7244001


```
### Managing UNIQUE Constraints in Partitioned Tables with pg_partman
- In PostgreSQL, UNIQUE and PRIMARY KEY constraints cannot be applied to partitioned tables without including the partition key column. For example:
     - ```sql
        CREATE TABLE tags (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) NOT NULL
        ) PARTITION BY RANGE (id);

        ALTER TABLE tags ADD COLUMN color VARCHAR(20) UNIQUE;
        -- ERROR: unique constraint on partitioned table must include all partitioning columns
        ```
- To overcome this restriction and provide additional flexibility, pg_partman introduces a template table. The template table is used as a blueprint for creating new partitions, allowing constraints like UNIQUE to be defined independently of the partition key.
     1. `SELECT * FROM part_config WHERE parent_table = 'test.tags';` This will display the associated template table, e.g., test.template_test_tags
     2. `ALTER TABLE test.template_test_tags ADD COLUMN color VARCHAR(20) UNIQUE;`  we can add columns with UNIQUE constraints to the template table. These constraints will automatically apply to new partitions created by pg_partman:
     3. This change will apply only to new partitions.For existing partitions, we must manually add the column or constraint. For example:
         - ```sql
            ALTER TABLE test.tags ADD COLUMN color VARCHAR(20);
            -- or include the partition key in a UNIQUE constraint:
             ALTER TABLE test.tags ADD CONSTRAINT unique_color_per_partition UNIQUE (id, color);
           ``` 


### COPY TABLE
-  there are three primary methods to replicate a table's structure and/or data.
   1. `CREATE TABLE new_table AS TABLE current_table;` Copy Structure and Data.
   2. `CREATE TABLE new_table AS TABLE current_table WITH NO DATA;` Copy Structure Only (No Data):
   3. `CREATE TABLE new_table AS SELECT * FROM current_table WHERE conditions;` Copy Structure and Conditional Data:
- When copying tables, indexes, constraints (e.g., PRIMARY KEY, NOT NULL), and default values (e.g., SERIAL) are not automatically included in the new table. These must be manually recreated.
```SQL
-- Step 1: Create the orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    price INT NOT NULL,
    created_at TIMESTAMP NOT NULL
);

-- Step 2: Insert sample data into the orders table
INSERT INTO orders (price, created_at)
SELECT FLOOR(RANDOM() * 1000), curr_time
FROM GENERATE_SERIES('2024-08-01'::date, '2024-10-25'::date, '1 week'::interval) AS gs(curr_time);

-- Step 3: Copy the table structure and data to orders_backup
CREATE TABLE orders_backup AS TABLE orders;

-- Step 4: Add a primary key to the id column
ALTER TABLE orders_backup ADD PRIMARY KEY (id);

-- Step 5: Add NOT NULL constraints to other columns
ALTER TABLE orders_backup ALTER COLUMN price SET NOT NULL;
ALTER TABLE orders_backup ALTER COLUMN created_at SET NOT NULL;


-- The last step is that add next_val sequence to id column.
SELECT COALESCE(MAX(id), 0) + 1 AS next_val FROM orders_backup; -- get row count +1 :This will be the next id
CREATE SEQUENCE orders_backup_id_seq START WITH 14  OWNED BY orders_backup.id; -- create sequence with start val
ALTER TABLE orders_backup ALTER COLUMN id SET DEFAULT nextval('orders_backup_id_seq'); --  add orders_backup to this sequence

-- That's it ,We can insert values as we can now.
INSERT INTO orders_backup (price,created_at) VALUES (123,'2024-01-01'); -- id will be 15
```

### TableSpaces
- Tablespaces control where data is stored on disk,They are physical locations. PostgreSQL comes with two default tablespaces:
     - **pg_default**: Stores user-defined objects like tables and indexes. Located in `/bitnami/postgresql/data/base`.
     - **pg_global**: Stores global data like roles and system catalogs. Located in `/bitnami/postgresql/data/global`.
- Steps to Create a Custom Tablespace:
     1. Create a new directory: `mkdir /path/to/tablespace_directory/test`
     2. Create the tablespace in PostgreSQL: `CREATE TABLESPACE test LOCATION '/path/to/tablespace_directory/test';`
     3. Create a table in the custom tablespace:
         - ```sql
            CREATE TABLE users (
            id SERIAL PRIMARY KEY
            ) TABLESPACE test; 
         ```
- `DROP TABLESPACE test;` -- drop tablespace
- `ALTER TABLE users SET TABLESPACE test;` -- move an object
- `\db` show tablespaces







### (Back up)[https://neon.tech/postgresql/postgresql-administration/postgresql-backup-database]
| Feature                       | Physical Backup                             | Logical Backup                              |
|-------------------------------|---------------------------------------------|---------------------------------------------|
| **Backup Scope**               | Entire database system (all databases)      | Specific databases, tables, or schemas     |
| **Speed**                      | Faster (direct file copy)                  | Slower (requires data export)              |
| **Restore Process**            | Restore data directory and apply WAL logs   | Execute SQL dump to recreate schema/data   |
| **Point-in-Time Recovery (PITR)** | Yes (with WAL)                             | No (does not include WAL)                  |
| **Portability**                | Less portable (requires same PostgreSQL version) | Highly portable (SQL or CSV format)        |
| **Data Type**                  | File-based (data files, WAL logs)           | Text-based (Human read) (SQL dump, CSV, JSON)           |

- logical backups are better for partial backups, version upgrades, and portability across systems, while physical backups are more suitable for backing up large databases quickly and efficiently, with the ability to perform Point-in-Time Recovery (PITR).

**pg_dump**:pg_dump is used to back up a PostgreSQL database with various options, allowing we to specify which tables, schemas, or the entire database to back up. 
  1. `pg_dump -U postgres -d ilex -f /opt/ilex.sql`  Backs up the entire ilex database into the file ilex.sql.
  2. `pg_dump -U postgres -d postgres -n user2 -n user1 -f /opt/users-data.sql` Backs up both the user1 and user2 schemas from the postgres database into the file users-data.sql.
  3. `pg_dump -U postgres -d postgres -t user1.users -f /opt/userxs.sql` Backs up the users table in the user1 schema from the postgres database into the file userxs.sql
  4. `-F` flag can be used to choose a file format.Default is `p`(plain text).Also can be `t`(tar),`c`(custom format) or `d`(directory format).
**pg_dumpall**:pg_dumpall is used to back up an entire PostgreSQL cluster, which includes all databases, roles, permissions, schemas, and other cluster-wide objects.
  1. `pg_dumpall -U postgres -f /opt/cluster.sql` Backs up all databases, schemas, tables, roles, permissions, and other objects with data in the PostgreSQL cluster to the file cluster.sql.
  2. `pg_dumpall -U postgres -s -f /opt/cluster.sql` Backs up the entire PostgreSQL cluster, but without data (only schema, roles, permissions, etc.), to the file cluster.sql.
  3. `pg_dumpall -U postgres -r -f /opt/cluster.sql` Backs up only the roles in the PostgreSQL cluster, without databases or schemas, to the file cluster.sql. 
**Compressing Back up**:
1. `pg_dumpall -U postgres | gzip > /opt/cluster.gz` This command pipes the output of pg_dumpall into gzip, compressing the entire backup into a .gz file (cluster.gz).
     - `gunzip -c '/opt/cluster.gz' | psql -U postgres` to restore
2. `pg_dumpall -U postgres | split -b 100k - /opt/a` This command uses split to divide the backup output into multiple smaller files of 100 KB each, named aaa, aab, aac, etc., in the /opt/ directory.
     - `cat cluster* | psql -U postgres` to restore

**Restore logical back up**:
1. **with psql**:
   1. `pg_dump -U postgres -d postgres -n user2 -f /opt/user2-dump.sql`: This command uses pg_dump to back up the user2 schema from the postgres database into a SQL file (user2-dump.sql).
   2. `psql -U postgres -d postgres < '/opt/user2-dump.sql'` :This command uses psql to restore the contents of the user2-dump.sql file into the postgres database.
2. **with pg_restore**: pg_restore is used when we perform backups in tar, directory, or custom formats, which are created using pg_dump with the -F flag
   1. **Basic**
      1. `pg_dump -U postgres -d postgres -n user2 -Ft -f '/opt/user2.tar'` This command creates a backup of the user2 schema in tar format.
      2. `pg_restore -U postgres -d postgres < '/opt/user2.tar'` This command restores the backup from the user2.tar file into the postgres database.
      3. If we want to manually create a schema  and add just a table into it `pg_restore -U postgres -d postgres -n user2 -t items < '/opt/user2.tar`

**Note**: By default, pg_dump does not include the CREATE DATABASE command in its output. This behavior allows the backup to be restored into an existing database or a database with a different name.  For example 
   1. `pg_dump -U postgres -d x -f '/opt/test.sql'` : This command will create a file test.sql, which does not include a CREATE DATABASE x statement.
   2. `pg_dump -U postgres -d x -Ft -C -f '/opt/test.tar'` : This command will create a file test.tar that includes the CREATE DATABASE command.
   3. `pg_restore -U postgres -d ab -C /opt/test.tar` : To restore such a backup, our pg_restore command should look like this.


**Physical Back up and restores**:
1. **offline back ups**: `tar -cvzf /path/on/host/backup/archive.tar.gz /bitnami/postgresql/data`
2. **online back ups**: 
WAL files are stored in the pg_wal/ directory, with a default size of 16MB, and the total directory size is controlled by the `max_wal_size` setting (often several hundred MB by default). These files log all database changes and are critical for recovery. To save space, PostgreSQL recycles WAL files once they are no longer needed.

A checkpoint is a process where all recent changes are written to disk, and the database's consistent state is recorded. After a checkpoint, WAL files are created so that it can be safely recycled or removed, speeding up recovery and saving storage.

In archiving mode, completed WAL files are saved to an external location before being recycled. This enables Point-in-Time Recovery (PITR) by replaying changes logged in the WAL files after restoring a base backup. For example, during a backup, a long transaction might not be fully included in the backup files, but the WAL logs ensure that the transaction is replayed during recovery, keeping the database consistent.
- To enable WAL archiving in PostgreSQL:These changes require a restart. Configuration file  `postgresql.conf`, must be manually edited to enable these settings. We can also use an archive library instead of the cp command.
   1.  `wal_level = replica` or higher.
   2.  `archive_mode = on`
   3.  `archive_command = 'test ! -f /opt/archivedir/%f && cp %p /opt/archivedir/%f'`
         1. `%p` is the full path to the WAL file.   
         2. `%f` is the filename of the WAL file.
         3. The `test ! -f` ensures the file is not overwritten.
         4. Do not forget to restart the server. Be sure that you created the `/opt/archivedir` for wal files.Otherwise `pg_stop_backup` won't work.
   4. We don't need to include the `pg_wal/` directory in your backup because we will rely on the archived WAL files to restore the database and ensure consistency. 
   5. After these steps we should test the archieve mode with `SELECT PG_SWITCH_WAL()` function.This function must create another file in `/opt/archivedir`
**Low level API back up**:
  1. `SELECT pg_backup_start(label text,fast boolean default false)`: this function prepare the server for starting back up.For example it check the correction of archive files and save the starting point of back up.
      1. `label` is a description for the back up  
      2. `fast` : PostgreSQL will wait for finishing the current transaction.So the next checkpoint will be the starter point of the back up.To cancel it and start the back up immidiately use `true`.
  2. Perform the back up process. `tar -cvzf /opt/my_backup.tar /bitnami/postgresql/data/`
  3. `SELECT pg_backup_stop(wait_for_archive BOOLEAN DEFAULT true)`: won't return until the wal logs copied to the archivedir directory and return information about back up.`wait_for_archive` can be false to return the function immediately.But this could be breake the whole system.Also it will create .....backup file and put the information.

**pg_basebackup**: This utility automatically put the database backup mode and throws it out from the mod.
Bitnami automatically creates  the pg_hba.conf file when the PostgreSQL server starts. If we manually configure `/opt/bitnami/postgresql/conf/pg_hba.conf` and restart the server, Bitnami will overwrite our changes. So we need to set specific environment variables in docker compose like below:
   1. `POSTGRESQL_REPLICATION_USER= replicator`
   2. `POSTGRESQL_REPLICATION_PASSWORD=replicator_password`
These variables automatically add the following lines to the pg_hba.conf file upon server start:
```bash
host      replication     all             0.0.0.0/0               md5
host      replication     all             ::/0                    md5
```  
Additionally, ensure `listen_addresses` in the PostgreSQL configuration is set to allow connections from any host (*):
- We still cannot use `pg_basebackup` unless the replication user exists.If we run `\du` we should   see the `replicator` user.Also if we look at the above configuration lines,It says that any user with `REPLICATION` privilege can replicate the cluster.So we should create a user witH `REPLICATION` or we can perform the operation with `postgres` user
    - `CREATE ROLE replicator WITH LOGIN REPLICATION;`
    - `\password replicator`
- Now we can use `pg_basebackup` utility : `pg_basebackup -h localhost -p 5432 -U replicator -Fp -Xs -v -D '/opt/base_backup'`
    - `-h` hostname
    - `-p` portname .Include `-p` and `-h` on command because of `PGPORT` or `PGHOST` might be undefined.So you could get `not entry` error for nothing.
    - `-U` username.User must have `REPLICATION` privilege
    - `-F` backup format: `p` for plain text and `t` for tar.
    - `-z` Compress data (can be used only with tar format).
    - `-X`  WAL log inclusion options:
         1. `none` or `n`: Do not include WAL logs.
         2. `fetch` or `f`: Include WAL logs after backup completion.
         3. `stream` or `s`: Stream WAL logs concurrently during backup (creates a separate connection).
    - `-v` : enable verbose output
    - `-D` Directory to store the backup. The directory must be empty or non-existent, or the operation will fail.
    - `backup_label` : this file in backup data will include backup information.
**Recovery**:
- `restore_command = 'cp /opt/archivedir/%f "%p"'` : It will retrive wal logs into pg_wal/ directory.
- By default,a recovery will execute whole the wal logs.We can set some options to prevent this.
    1. `recovery_target` Only option is `'immediate'`.That means that The recovery should end as soon as consistent state is reached.
    2. `recovery_target_name` : We can create restore points with `SELECT PG_CREATE_RESTORE_POINT('hi');` and use particular restore point for `recovery_target_name`.For example for this command `recover_target_name= 'hi'` can be used.
    3. `recovery_target_time` This parameter specifies the time stamp up to which recovery will proceed.Usually people use this option to recover the database.
    4. `recovery_target_lsn` lsn refers to `log sequence number`.LSN is a unique identifier for a specific point in the WAL and helps track changes within the database.For example to see current lsn `SELECT pg_current_wal_lsn();` can be used.
    5. `recovery_target_xid` Each operation has a transaction id in postgresql.We can specify a particular transaction id with this option.
    6. `recovery_target_inclusive;` is used to specify whether include current target value or not.Default is `on`
Here are the steps:
  1. Stop the server
  2. Copy whole `/data` and tablespaces to temporary a directory (This step can be skipped) . ` cp -r /bitnami/postgresql/data /opt/copy_data`
  3. Empty `/data` directory.Delete all file and fodlers in data directory. `rm -r /bitnami/postgresql/data` `mkdir data`
  4. restore the database files. `tar xvf /opt/tar_basebackup/base.tar -C '/bitnami/postgresql/data/'`
  5. Empty `pg_wal/` directory because It will still include unnecessary logs. `rm -rf /bitnami/postgresql/data/pg_wal/*`
  6. If there are any wal files exist in the copy of our cluster(step 2) and they are not archived!!!.Copy wal files to current `pg_wal/` directory.
  7. Set the recovery configuration settings(recover_command,an recover_target option and ,recover_target_inclusive).Create a `recovery.signal` file in the /data directory.Do not anything with it. `touch recovery.signal`
  8. Set pg_hba.conf file to prevent so that prevent connections until the back up steps done
  9. Start the server. If the server find `recovery.signal` file,It will go into recovery mode and run all the wal logs as need.
  10. The server will remove recovery.signal
  11. Modify pg_hba.conf file to allow user connections
chown -R 1001:1001 /bitnami/postgresql/data/pg_wal
Show linux files with last modify date: `ls -al`

--- Bu not da ki cloumn order olayını bu konu ışığında bir değerlendir.
https://www.cybertec-postgresql.com/en/postgresql-bulk-loading-huge-amounts-of-data/
https://www.cybertec-postgresql.com/en/shrinking-the-storage-footprint-of-data/

-- Optimal Column order verir.Yani sen tablonun nasıl istersen oyle create et. Sonra bunu bu sorgu ile sorgula.
SELECT pns.nspname,a.attname, t.typname, t.typalign, t.typlen
FROM pg_class c
join pg_catalog.pg_namespace pns on (c.relnamespace=pns.oid)
JOIN pg_attribute a ON (a.attrelid = c.oid)
JOIN pg_type t ON (t.oid = a.atttypid)
where c.relname = 'tbl_cities' and
pns.nspname ='app'
AND a.attnum >= 0
ORDER BY t.typlen desc;

SERIAL PRIMARY KEY = integer DEFAULT nextval('table_name_column_seq') PRIMARY KEY

### Non root containers
- In root containers the same user ID and GROUP ID for the root user will be exist in the /etc/passwd file on the container.For example I am different user in operating systetm and try to access docker container.When I access the docker container my user will change to the root user.This creates a huge vulnerability.
- Bitnami uses non-root containers for security, to access them as a root `docker exec -it -u root container-name bash`;
- SELECT PG_CURRENT_WAL_LSN(),PG_WALFILE_NAME(PG_CURRENT_WAL_LSN());



### Vi commands
i : insert mode
esc: cancel insert mode
:wq : save and quit