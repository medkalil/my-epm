MY-EPM — Enterprise Project Management Platform

The goal is to demonstrate progression from Full Stack Developer → Backend/Software Engineer → Architecture, with a focus on strong backend engineering, clean architecture, security, testing, and maintainability.

Java 21
Spring Boot 3

Architecture
                         ┌─────────────────────┐
                         │       React         │
                         │   Web Application   │
                         └──────────┬──────────┘
                                    │
                                  REST
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Spring Boot      │
                         │                     │
                         │ Authentication      │
                         │ RBAC                │
                         │ Organizations       │
                         │ Teams               │
                         │ Projects            │
                         │ Tasks               │
                         │ Comments            │
                         │ Notifications       │
                         │ Attachments         │
                         │ Audit Logs          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         │                     │
                         │ Users               │
                         │ Organizations       │
                         │ Teams               │
                         │ Projects            │
                         │ Tasks               │
                         │ Comments            │
                         │ Permissions         │
                         │ Audit Logs          │
                         └─────────────────────┘
Phase 1 — Core Backend
        Authentication
        Multi-tenancy: Organizations is the root level of multi-tenancy. (see the db schema below)*
        Users
        Organizations
        Teams
        Projects
        Tasks
        Task status and priority
        Project membership
        Task assignment
        DTOs
        MapStruct
        Bean Validation
        Global exception handling

Phase 2 — Enterprise Features
        RBAC
        Permission system
        Audit logs
        Pagination
        Filtering
        Sorting
        Global search
        Soft deletion
        Database constraints
        Database indexes
        Optimistic locking
        Transaction management

Phase 3 — Collaboration
        Comments
        Notifications
        File attachments
        Activity timeline
        Task history
        Project activity

Phase 4 — Engineering & Quality
        Structured logging
        JUnit
        Mockito
        Integration tests
        Testcontainers
        API documentation
        Health checks
        Security hardening

Architecture Decision — Modular Monolith
        Avoid microservices initially.
        Start with a well-designed modular monolith:
        com.projectmanagement
        │
        ├── auth
        ├── organization
        ├── team
        ├── project
        ├── task
        ├── comment
        ├── notification
        ├── attachment
        ├── audit
        └── common

Each module should have a clear internal structure:
        controller
        service
        repository
        dto
        entity
        mapper
        exception

The goal is to maintain clear boundaries between business domains while keeping the system simple and maintainable.

Interview Explanation

        “I deliberately started with a modular monolith because the domain didn't justify the operational complexity of microservices. I designed the modules with clear boundaries so individual components could later be extracted if scalability requirements justified it.”

This demonstrates architectural reasoning rather than adding microservices simply because they are popular.

CV Technology Story
        Backend
                Java · Spring Boot · Spring Security · JPA · Hibernate
        Architecture
                Modular Monolith · RBAC · Multi-tenancy · REST APIs · Domain-driven modularization
        Database
                PostgreSQL · Database Relationships · Indexing · Transactions · Optimistic Locking
        Frontend
                React · TypeScript · TanStack Query
        Quality
                JUnit · Mockito · Integration Testing · Testcontainers

Future Evolution
Redis can be introduced later when there is a real performance requirement:

V1
        Modular Monolith
        ↓
        PostgreSQL

V2
        Identify performance bottlenecks
        ↓
        Introduce Redis where justified

V3
        Async processing / messaging
        ↓
Evaluate whether specific modules
should become independent services

The first version should remain focused, realistic, and achievable, while the architecture leaves room for future evolution.


Phase 1 — Core Backend
==================================================================================================================

users
----------------
id
email
password
...

organizations
----------------
id
name
...

organization_members
----------------
id
organization_id
user_id
role
start_date
end_date






###################################################################################################################

future upgrade: 
        - add Redis
        - add Docker
        - add GitHub Actions
                         ┌─────────────────────┐
                         │       React         │
                         │   Web Application    │
                         └──────────┬──────────┘
                                    │ REST
                                    ▼
                         ┌─────────────────────┐
                         │    Spring Boot     │
                         │                     │
                         │ Auth / RBAC         │
                         │ Organizations       │
                         │ Teams               │
                         │ Projects            │
                         │ Tasks               │
                         │ Comments            │
                         │ Notifications       │
                         │ Audit Logs          │
                         └──────┬───────┬──────┘
                                │       │
                       ┌────────┘       └────────┐
                       ▼                         ▼
                ┌──────────────┐          ┌──────────────┐
                │ PostgreSQL   │          │    Redis     │
                │              │          │              │
                │ Main DB      │          │ Cache        │
                │ Users        │          │ Sessions     │
                │ Projects     │          │ Rate limits  │
                │ Tasks        │          │ Notifications│
                └──────────────┘          └──────────────┘

                         ┌─────────────────────┐
                         │       Docker        │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   GitHub Actions    │
                         │                     │
                         │ Build → Test →      │
                         │ Docker → Deploy     │
                         └─────────────────────┘