# API Testing Guide – Projects & Tasks Features

This guide provides end-to-end test paths, including complete `curl` commands, JSON payloads, expected HTTP status codes, and multi-tenant security verification scenarios.

---

## 🛠️ Prerequisites & Environment Setup

Ensure the application is running:
```bash
cd backend
mvn spring-boot:run
```
Base URL: `http://localhost:8080`

### Quick Shell Setup
Export your base URL in your terminal:
```bash
export BASE_URL="http://localhost:8080"
```

---

## 1️⃣ Phase 1: Setup Authentication & Organizations

Before testing Projects and Tasks, set up two users to test multi-tenancy and permissions:
* **User 1 (`alice`)**: Owner of Organization A.
* **User 2 (`bob`)**: Separate user (initially outside Org A, used for cross-tenant 403 checks, then added as a member).

### Step 1.1: Register Users
```bash
# Register Alice
curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'

# Register Bob
curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "password": "password123"}'
```

### Step 1.2: Login and Capture JWT Tokens
```bash
# Login as Alice
export ALICE_TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Login as Bob
export BOB_TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "bob", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Alice Token: $ALICE_TOKEN"
echo "Bob Token: $BOB_TOKEN"
```

### Step 1.3: Create Organization as Alice
```bash
# Create Organization "Acme Corp"
curl -s -X POST "$BASE_URL/api/v1/organizations" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "slug": "acme-corp"
  }'
```
*Take note of the returned `id` (e.g. `1`).*
```bash
export ORG_ID=1
```

---

## 2️⃣ Phase 2: Project Feature Test Paths

### Path 2.1: Create a Project
**Endpoint:** `POST /api/v1/projects`  
**Authorization:** Must be an organization member (`@orgSecurity.isMember`)  
**Expected Status:** `201 Created`

```bash
curl -i -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Revamp the company landing page and customer portal",
    "organizationId": '"$ORG_ID"'
  }'
```
*Expected Response:*
```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Revamp the company landing page and customer portal",
  "organizationId": 1,
  "memberIds": [1]
}
```
```bash
export PROJECT_ID=1
```

---

### Path 2.2: Get Project by ID
**Endpoint:** `GET /api/v1/projects/{id}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X GET "$BASE_URL/api/v1/projects/$PROJECT_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

### Path 2.3: List All Projects for an Organization
**Endpoint:** `GET /api/v1/projects/organization/{orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X GET "$BASE_URL/api/v1/projects/organization/$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

### Path 2.4: Update Project Details
**Endpoint:** `PUT /api/v1/projects/{id}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X PUT "$BASE_URL/api/v1/projects/$PROJECT_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign Phase 2",
    "description": "Updated project description with extended scope"
  }'
```

---

### Path 2.5: Add Member to Project (Many-to-Many)
First, add Bob to Organization A:
```bash
# Add Bob (userId: 2) to Organization 1 as MEMBER
curl -s -X POST "$BASE_URL/api/v1/organizations/$ORG_ID/members" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "role": "MEMBER"
  }'
```

Now add Bob to the Project:  
**Endpoint:** `POST /api/v1/projects/{id}/members/{userId}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X POST "$BASE_URL/api/v1/projects/$PROJECT_ID/members/2?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```
*Expected Response:* `memberIds` will now contain both Alice and Bob `[1, 2]`.

---

### Path 2.6: Remove Member from Project
**Endpoint:** `DELETE /api/v1/projects/{id}/members/{userId}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X DELETE "$BASE_URL/api/v1/projects/$PROJECT_ID/members/2?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

## 3️⃣ Phase 3: Task Feature Test Paths

### Path 3.1: Create a Task
**Endpoint:** `POST /api/v1/tasks`  
**Authorization:** Guarded by `@orgSecurity.isMember(#request.organizationId)`  
**Expected Status:** `201 Created`

```bash
curl -i -X POST "$BASE_URL/api/v1/tasks" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Figma Mockups",
    "description": "Create wireframes and interactive mockups for the homepage",
    "status": "TODO",
    "projectId": '"$PROJECT_ID"',
    "organizationId": '"$ORG_ID"',
    "affectedUserId": 1
  }'
```
*Expected Response:*
```json
{
  "id": 1,
  "title": "Design Figma Mockups",
  "description": "Create wireframes and interactive mockups for the homepage",
  "status": "TODO",
  "projectId": 1,
  "organizationId": 1,
  "affectedUserId": 1,
  "affectedUserName": "alice"
}
```
```bash
export TASK_ID=1
```

---

### Path 3.2: Get Task by ID
**Endpoint:** `GET /api/v1/tasks/{id}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X GET "$BASE_URL/api/v1/tasks/$TASK_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

### Path 3.3: List Tasks by Project
**Endpoint:** `GET /api/v1/tasks/project/{projectId}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X GET "$BASE_URL/api/v1/tasks/project/$PROJECT_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

### Path 3.4: List Tasks by Organization
**Endpoint:** `GET /api/v1/tasks/organization/{orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X GET "$BASE_URL/api/v1/tasks/organization/$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

### Path 3.5: List Tasks Assigned to a User
**Endpoint:** `GET /api/v1/tasks/user/{userId}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X GET "$BASE_URL/api/v1/tasks/user/1?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

### Path 3.6: Update Task (Status & Reassignment)
**Endpoint:** `PUT /api/v1/tasks/{id}?orgId={orgId}`  
**Expected Status:** `200 OK`

```bash
curl -i -X PUT "$BASE_URL/api/v1/tasks/$TASK_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design Figma Mockups - Approved",
    "description": "Mockups approved by stakeholders",
    "status": "IN_PROGRESS",
    "affectedUserId": 1
  }'
```

---

### Path 3.7: Delete Task
**Endpoint:** `DELETE /api/v1/tasks/{id}?orgId={orgId}`  
**Expected Status:** `204 No Content`

```bash
curl -i -X DELETE "$BASE_URL/api/v1/tasks/$TASK_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```

---

## 4️⃣ Phase 4: Delete Project & Cascade Cleanup

### Path 4.1: Delete Project
**Endpoint:** `DELETE /api/v1/projects/{id}?orgId={orgId}`  
**Expected Status:** `204 No Content`

```bash
curl -i -X DELETE "$BASE_URL/api/v1/projects/$PROJECT_ID?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```
*Note: This cascades and automatically removes associated entries in `tasks` and `project_user` join tables.*

---

## 5️⃣ Phase 5: Security & Multi-Tenancy Boundary Tests (Negative Paths)

These test cases ensure SaaS data isolation and business validation are working as expected.

### Test 5.1: Missing Authentication Token
**Expected Status:** `401 Unauthorized` or `403 Forbidden`
```bash
curl -i -X GET "$BASE_URL/api/v1/projects/organization/$ORG_ID"
```

---

### Test 5.2: Multi-Tenant Access Denied (Non-Member Access)
Create a new user `charlie` who is NOT a member of Organization A:
```bash
curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "charlie", "password": "password123"}'

CHARLIE_TOKEN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "charlie", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Charlie attempts to list projects from Alice's Organization (ID: 1)
curl -i -X GET "$BASE_URL/api/v1/projects/organization/$ORG_ID" \
  -H "Authorization: Bearer $CHARLIE_TOKEN"
```
**Expected Status:** `403 Forbidden`  
*Response body:*
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: You do not have permission to access this resource"
}
```

---

### Test 5.3: Charlie Attempts to Create Project in Alice's Organization
```bash
curl -i -X POST "$BASE_URL/api/v1/projects" \
  -H "Authorization: Bearer $CHARLIE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hacked Project",
    "organizationId": '"$ORG_ID"'
  }'
```
**Expected Status:** `403 Forbidden`

---

### Test 5.4: Assign User Who Does Not Belong to the Organization
Attempt to add Charlie (userId `3`) to Alice's Project without adding him to Organization 1 first:
```bash
curl -i -X POST "$BASE_URL/api/v1/projects/1/members/3?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```
**Expected Status:** `400 Bad Request`  
*Response message:* `"User with ID 3 is not a member of organization 1"`

---

### Test 5.5: Non-Existent Project or Task ID
```bash
curl -i -X GET "$BASE_URL/api/v1/projects/99999?orgId=$ORG_ID" \
  -H "Authorization: Bearer $ALICE_TOKEN"
```
**Expected Status:** `404 Not Found`  
*Response message:* `"Project not found with ID: 99999 in organization: 1"`

---

## 📊 Summary of Endpoint Routes

| Feature | HTTP Method | Route | Security SpEL Guard |
| :--- | :--- | :--- | :--- |
| **Project** | `POST` | `/api/v1/projects` | `@orgSecurity.isMember(#request.organizationId)` |
| **Project** | `GET` | `/api/v1/projects/{id}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Project** | `GET` | `/api/v1/projects/organization/{orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Project** | `PUT` | `/api/v1/projects/{id}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Project** | `DELETE` | `/api/v1/projects/{id}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Project** | `POST` | `/api/v1/projects/{id}/members/{userId}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Project** | `DELETE` | `/api/v1/projects/{id}/members/{userId}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Task** | `POST` | `/api/v1/tasks` | `@orgSecurity.isMember(#request.organizationId)` |
| **Task** | `GET` | `/api/v1/tasks/{id}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Task** | `GET` | `/api/v1/tasks/project/{projectId}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Task** | `GET` | `/api/v1/tasks/organization/{orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Task** | `GET` | `/api/v1/tasks/user/{userId}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Task** | `PUT` | `/api/v1/tasks/{id}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
| **Task** | `DELETE` | `/api/v1/tasks/{id}?orgId={orgId}` | `@orgSecurity.isMember(#orgId)` |
