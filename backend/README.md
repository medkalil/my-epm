⚙️ How to run it locally

Run:
    mvn spring-boot:run

clean then Run:
    mvn clean spring-boot:run

clean install then Run:
    mvn clean install

## Authentication System with JWT

This Spring Boot application implements a JWT (JSON Web Token) based authentication system using Spring Security. Here's a breakdown of the process:

### 1. User Registration (`/auth/register`)
-   A `POST` request is sent to `/auth/register` with `username`, `password`, and an optional `role` in the request body.
-   The `AuthController` receives this request.
-   It checks if the `username` already exists in the `UserRepository`. If so, it returns a bad request error.
-   If the username is unique, the `password` is encoded using `BCryptPasswordEncoder` (configured in `WebSecurityConfig`).
-   A new `User` entity is created with the provided `username`, encoded `password`, and `role` (defaulting to "ROLE_USER" if not specified).
-   The new `User` is saved to the database via `UserRepository`.
-   A `UserResponse` (containing `id` and `name`) is returned upon successful registration.

### 2. User Login (`/auth/login`)
-   A `POST` request is sent to `/auth/login` with `username` and `password` in the request body.
-   The `AuthController` receives this request.
-   It uses the `AuthenticationManager` (configured in `WebSecurityConfig`) to authenticate the user. The `AuthenticationManager` delegates the actual authentication to an `AuthenticationProvider` (typically `DaoAuthenticationProvider`).
-   The `DaoAuthenticationProvider` first calls `UserDetailsServiceImpl.loadUserByUsername()` to retrieve the user's details (including the **hashed password**) from the database using `UserRepository.findByName()`. Since the `User` entity itself implements `UserDetails`, the `User` object is returned directly.
-   The `DaoAuthenticationProvider` then takes the plain-text password from the `LoginRequest` and uses the configured `PasswordEncoder` (e.g., `BCryptPasswordEncoder`) to **hash the plain-text password**.
-   Finally, it **compares this newly generated hash with the hashed password retrieved from the database**. This ensures that plain-text passwords are never stored or directly compared.
-   If authentication is successful, an `Authentication` object is created and set in the `SecurityContextHolder`.
-   A JWT token is then generated using `JwtUtils.generateJwtToken()`. This token contains the user's username as the subject, along with issuance and expiration dates, and is signed with a secret key.
-   A `JwtResponse` (containing the JWT token, user `id`, `username`, and `role`) is returned to the client.

### 3. Accessing Protected Resources (e.g., `/orders/**`, `/users/**`)
-   After successful login, the client receives a JWT token. This token should be included in the `Authorization` header of subsequent requests to protected endpoints, typically in the format `Bearer <JWT_TOKEN>`.
-   When a request arrives at a protected endpoint, the `AuthTokenFilter` (configured in `WebSecurityConfig`) intercepts it.
-   `AuthTokenFilter` extracts the JWT token from the `Authorization` header.
-   It then uses `JwtUtils.validateJwtToken()` to verify the token's signature and expiration.
-   If the token is valid, `JwtUtils.getUserNameFromJwtToken()` extracts the username from the token.
-   `UserDetailsServiceImpl` is used again to load the `User` details based on the username from the token.
-   A `UsernamePasswordAuthenticationToken` is created using the loaded `UserDetails` and set in the `SecurityContextHolder`. This effectively authenticates the user for the current request.
-   The request then proceeds to the intended controller (e.g., `OrderController`, `UserController`).
-   If the token is invalid or missing, `AuthEntryPointJwt` handles the unauthorized access, returning an `HTTP 401 Unauthorized` response.

### Key Components:
-   **`User` Entity:** Represents a user in the database and implements Spring Security's `UserDetails` interface, providing core user information (username, password, authorities).
-   **`UserRepository`:** A Spring Data JPA repository for `User` entities, extended with `findByName` for retrieving users by their username.
-   **`UserDetailsServiceImpl`:** Implements `UserDetailsService` to load user-specific data during authentication. It fetches `User` entities from the `UserRepository`.
-   **`PasswordEncoder` (`BCryptPasswordEncoder`):** Used to securely hash and verify user passwords.
-   **`JwtUtils`:** A utility class for generating, validating, and parsing JWT tokens. It uses a secret key for signing and verifying tokens.
-   **`AuthEntryPointJwt`:** Handles unauthorized access attempts by sending an `HTTP 401 Unauthorized` response.
-   **`AuthTokenFilter`:** A custom filter that intercepts incoming requests, extracts and validates JWT tokens, and sets the authenticated user in the Spring Security context.
-   **`WebSecurityConfig`:** The main Spring Security configuration class. It defines the security filter chain, configures authentication providers, sets up session management (stateless for JWT), defines authorization rules for endpoints, and integrates the `AuthTokenFilter` and `AuthEntryPointJwt`.
-   **`AuthController`:** Exposes REST endpoints for user registration (`/auth/register`) and login (`/auth/login`).

### Security Flow Summary:
1.  **Register:** Client sends username/password -> `AuthController` -> `PasswordEncoder` hashes password -> `UserRepository` saves `User`.
2.  **Login:** Client sends username/password -> `AuthController` -> `AuthenticationManager` authenticates (using `UserDetailsServiceImpl` and `PasswordEncoder`) -> `JwtUtils` generates JWT -> `AuthController` returns JWT.
3.  **Access Protected:** Client sends JWT in `Authorization` header -> `AuthTokenFilter` intercepts -> `JwtUtils` validates JWT and extracts username -> `UserDetailsServiceImpl` loads `User` -> `AuthTokenFilter` sets authentication in `SecurityContext` -> Request proceeds.

## Refresh Token System

To enhance security and user experience, a refresh token mechanism has been implemented. This system uses short-lived access tokens for resource access and long-lived refresh tokens to obtain new access tokens without requiring the user to re-authenticate with their credentials frequently.

#### How it Works:

1.  **Login (`/auth/login`):**
    *   Upon successful login, in addition to an access token, the server now issues a refresh token.
    *   Both tokens are returned in the `JwtResponse`. The access token is short-lived (e.g., 15 minutes), while the refresh token is long-lived (e.g., 7 days).

2.  **Accessing Protected Resources:**
    *   The client uses the access token to access protected API endpoints.
    *   If the access token expires (resulting in an `HTTP 401 Unauthorized` error), the client can use the refresh token to obtain a new access token.

3.  **Refreshing Access Token (`/auth/refreshtoken`):**
    *   The client sends a `POST` request to `/auth/refreshtoken` with the refresh token in the request body (`TokenRefreshRequest`).
    *   The server validates the refresh token and checks its expiration.
    *   If the refresh token is valid and not expired, a new access token is generated and returned to the client along with the same refresh token (or a new one, depending on the strategy) in a `TokenRefreshResponse`.
    *   If the refresh token is invalid or expired, the client will receive an error, and the user will need to log in again.

#### Key Components:

*   **`RefreshToken` Entity:** Stores the refresh token string, its expiration date, and a link to the associated `User`.
*   **`RefreshTokenRepository`:** A Spring Data JPA repository for managing `RefreshToken` entities.
*   **`RefreshTokenService`:** Handles the business logic for refresh tokens, including creation, validation, expiration checks, and deletion.
*   **`JwtResponse` DTO:** Modified to include the `refreshToken` string.
*   **`TokenRefreshRequest` DTO:** Used by the client to send the refresh token to the `/auth/refreshtoken` endpoint.
*   **`TokenRefreshResponse` DTO:** Used by the server to return a new access token and the refresh token after a successful refresh request.
*   **`AuthController`:**
    *   The `/auth/login` endpoint now generates and returns a refresh token.
    *   A new `/auth/refreshtoken` endpoint handles requests to obtain new access tokens using a valid refresh token.
*   **`JwtUtils`:** Includes a new method `generateTokenFromUsername` to create access tokens from a username, used during the refresh process.
*   **`application.properties`:** Contains `demo.app.jwtRefreshExpirationMs` to configure the refresh token's validity period.