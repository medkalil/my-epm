# EPM Backend

## Commands to Run

```bash
# Build the application
mvn clean compile

# Run the application
mvn spring-boot:run
```


### Flyway

flyway is a database migration tool that is used to manage database schema changes.
for this project, flyway will use the default PostgreSQL database connection defined in the application.properties file.
usecases:
1- validate the database schema
```bash
mvn flyway:validate
```
2- migrate the database schema
```bash
mvn flyway:migrate
```
3- clean the database schema
```bash
mvn flyway:clean
```
