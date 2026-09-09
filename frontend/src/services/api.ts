export type NavKey = 'overview' | 'projects' | 'tasks' | 'team' | 'settings' | 'audit'

export interface ProjectSummary { id: string; name: string; description: string; members: string[]; memberCount: number; progress: number; completed: number; total: number; unit: string }
export interface ActivityEvent { id: string; title: string; detail: string; status: 'IN_PROGRESS' | 'DONE' | 'TODO'; user: string }
export interface MemberSummary { name: string; email: string; initials: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' }
export interface DashboardResponse { projects: ProjectSummary[]; activity: ActivityEvent[]; members: MemberSummary[] }

export interface ListProjectsRequest { organizationId: string; status?: 'active' | 'archived'; page?: number; pageSize?: number; search?: string }
export interface CreateProjectRequest { organizationId: string; name: string; description?: string; businessUnit: string; teamIds: string[] }
export interface UpdateTaskRequest { taskId: string; status?: 'todo' | 'in_progress' | 'done'; assigneeId?: string; dueDate?: string }
export interface ListAuditEventsRequest { organizationId: string; from?: string; to?: string; action?: string; page?: number }

export const dashboardData: DashboardResponse = {
  projects: [
    { id: 'p-001', name: 'OmniChannel Liquidity API', description: 'Zero-downtime integration and gateway delivery', members: ['ER', 'MV', 'KS'], memberCount: 4, progress: 74, completed: 42, total: 57, unit: 'Global Finance' },
    { id: 'p-002', name: 'PSD2 Open Banking', description: 'Banking compliance and API enablement', members: ['KS', 'ST'], memberCount: 2, progress: 91, completed: 29, total: 32, unit: 'Core Banking' },
    { id: 'p-003', name: 'Vault Migration & Hardening', description: 'HSM encryption and secrets rotation', members: ['MV', 'ER'], memberCount: 5, progress: 38, completed: 15, total: 39, unit: 'Operations' },
  ],
  activity: [
    { id: 'a-1', title: 'EPF-842 Strategic Budget Allocation Review', detail: 'Updated 14 mins ago · Milestone #M-44', status: 'IN_PROGRESS', user: 'kalli.s' },
    { id: 'a-2', title: 'EPF-839 Finalize Vendor Compliance Verification', detail: 'Resolved 42 mins ago · Approved by Legal', status: 'DONE', user: 'sarah.t' },
    { id: 'a-3', title: 'EPF-847 Partition audit events table by tenant_id', detail: 'Created 2 hours ago · Backlog queue', status: 'TODO', user: 'elena.r' },
  ],
  members: [
    { name: 'Kalli S.', email: 'kalli@acmefintech.io', initials: 'KS', role: 'OWNER' },
    { name: 'Sarah T.', email: 'sarah.t@acmefintech.io', initials: 'ST', role: 'ADMIN' },
    { name: 'Elena R.', email: 'elena.r@acmefintech.io', initials: 'ER', role: 'MEMBER' },
    { name: 'Marcus V.', email: 'marcus.b@acmefintech.io', initials: 'MV', role: 'MEMBER' },
  ],
}

export async function getDashboard(_organizationId: string): Promise<DashboardResponse> { return dashboardData }
export async function listProjects(_request: ListProjectsRequest): Promise<ProjectSummary[]> { return dashboardData.projects }
export async function createProject(request: CreateProjectRequest): Promise<ProjectSummary> { return { id: `p-${Date.now()}`, name: request.name, description: request.description ?? '', members: [], memberCount: 0, progress: 0, completed: 0, total: 0, unit: request.businessUnit } }
export async function updateTask(_request: UpdateTaskRequest): Promise<{ success: boolean }> { return { success: true } }
export async function listAuditEvents(_request: ListAuditEventsRequest): Promise<ActivityEvent[]> { return dashboardData.activity }
