# EPM Backend

## Commands to Run

```bash
# Build the application
mvn clean compile

# Run the application
mvn spring-boot:run
```

### Flyway

- flyway is a database migration tool that is used to manage database schema changes.
- for this project, flyway will use the default PostgreSQL database connection defined in the application.yml file.
- how is work?
    - it will run the migration scripts in the `src/main/resources/db/migration/` directory in alphabetical order.
    - the migration scripts are named `V<number>__<description>.sql` example
        - V1__init_auth_schema.sql
        - V2__init_user_schema.sql
- after run, it will create a table named `flyway_schema_history` to track the migration scripts that have been run.

### Authentication System

The authentication system uses JWT access tokens and database-backed refresh tokens:

- **Register:** `POST /api/v1/auth/register` (Registers a new user account)
- **Login:** `POST /api/v1/auth/login` (Returns JWT access token & refresh token)
- **Refresh Token:** `POST /api/v1/auth/refreshtoken` (Generates a new access token using a valid refresh token)

#### How It Works:
1. **Registration:** User submits credentials; password is hashed with BCrypt and stored in PostgreSQL.
2. **Authentication:** User logs in; server returns a short-lived JWT access token and saves a long-lived UUID refresh token in the database.
3. **Authorization:** Client sends `Authorization: Bearer <JWT_ACCESS_TOKEN>` in HTTP headers. `AuthTokenFilter` validates the signature and sets authentication context.
4. **Token Refresh:** When the access token expires, client sends the refresh token to `/api/v1/auth/refreshtoken` to receive a new access token.
