// API Client for Node.js Backend
// Use different base URL based on environment (client-side vs server-side)
const getApiBaseUrl = () => {
  // Check if we're running on the server (Node.js) or client (browser)
  if (typeof window === "undefined") {
    // Server-side: use full URL to connect to API
    return process.env.API_URL || "http://localhost:3001";
  } else {
    // Client-side: use proxy path
    return "";
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    role_level: number;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
  };
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token");
    }
  }

  // Set authentication token
  setToken(token: string) {
    this.accessToken = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  // Clear authentication token
  clearToken() {
    this.accessToken = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  // Get authentication headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Build URL properly based on context
      let url: string;
      if (typeof window === "undefined") {
        // Server-side: use full URL
        url = `${this.baseURL}/api${endpoint}`;
      } else {
        // Client-side: use proxy path
        url = `/api${endpoint}`;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      // Handle token refresh if needed
      if (!data.success && data.error?.message === "Token expired") {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request
          return this.request(endpoint, options);
        }
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }

  // Refresh access token
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data: ApiResponse<{ access_token: string; refresh_token: string }> =
        await response.json();

      if (data.success && data.data) {
        this.setToken(data.data.access_token);
        if (typeof window !== "undefined") {
          localStorage.setItem("refresh_token", data.data.refresh_token);
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Authentication methods
  async loginAdmin(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.tokens.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "refresh_token",
          response.data.tokens.refresh_token
        );
      }
    }

    return response;
  }

  async loginMember(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/auth/member/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.tokens.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "refresh_token",
          response.data.tokens.refresh_token
        );
      }
    }

    return response;
  }

  async checkMember(email: string): Promise<ApiResponse<any>> {
    return this.request("/auth/member/check", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<any>> {
    return this.request("/auth/member/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.request("/auth/me");
  }

  async logout(): Promise<ApiResponse<any>> {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });
    this.clearToken();
    return response;
  }

  // Districts API
  async getDistricts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return this.request(`/districts${query ? `?${query}` : ""}`);
  }

  async getDistrict(id: string): Promise<ApiResponse<any>> {
    return this.request(`/districts/${id}`);
  }

  async createDistrict(data: any): Promise<ApiResponse<any>> {
    return this.request("/districts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDistrict(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/districts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDistrict(id: string): Promise<ApiResponse<any>> {
    return this.request(`/districts/${id}`, {
      method: "DELETE",
    });
  }

  // Members API
  async getMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    district_id?: string;
    cell_group_id?: string;
    no_cell_group?: boolean;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.district_id)
      queryParams.append("district_id", params.district_id);
    if (params?.cell_group_id)
      queryParams.append("cell_group_id", params.cell_group_id);
    if (params?.no_cell_group) queryParams.append("no_cell_group", "true");

    const query = queryParams.toString();
    return this.request(`/members${query ? `?${query}` : ""}`);
  }

  async getMember(id: string): Promise<ApiResponse<any>> {
    return this.request(`/members/${id}`);
  }

  async createMember(data: any): Promise<ApiResponse<any>> {
    return this.request("/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMember(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateMemberProfile(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/members/${id}/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMember(id: string): Promise<ApiResponse<any>> {
    return this.request(`/members/${id}`, {
      method: "DELETE",
    });
  }

  // Cell Groups API
  async getCellGroups(params?: {
    page?: number;
    limit?: number;
    district_id?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.district_id)
      queryParams.append("district_id", params.district_id);

    const query = queryParams.toString();
    return this.request(`/cell-groups${query ? `?${query}` : ""}`);
  }

  async getCellGroup(id: string): Promise<ApiResponse<any>> {
    return this.request(`/cell-groups/${id}`);
  }

  async createCellGroup(data: any): Promise<ApiResponse<any>> {
    return this.request("/cell-groups", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCellGroup(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/cell-groups/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCellGroup(id: string): Promise<ApiResponse<any>> {
    return this.request(`/cell-groups/${id}`, {
      method: "DELETE",
    });
  }

  async getCellGroupMembers(id: string): Promise<ApiResponse<any[]>> {
    return this.request(`/cell-groups/${id}/members`);
  }

  async addMembersToCellGroup(
    id: string,
    memberIds: string[]
  ): Promise<ApiResponse<any>> {
    return this.request(`/cell-groups/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ member_ids: memberIds }),
    });
  }

  async removeMemberFromCellGroup(
    cellGroupId: string,
    memberId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/cell-groups/${cellGroupId}/members/${memberId}`, {
      method: "DELETE",
    });
  }

  // Ministry API
  async getMinistries(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/ministries${query ? `?${query}` : ""}`);
  }

  async getMinistry(id: string): Promise<ApiResponse<any>> {
    return this.request(`/ministries/${id}`);
  }

  async createMinistry(data: any): Promise<ApiResponse<any>> {
    return this.request("/ministries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMinistry(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/ministries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteMinistry(id: string): Promise<ApiResponse<any>> {
    return this.request(`/ministries/${id}`, {
      method: "DELETE",
    });
  }

  async addMemberToMinistry(
    ministryId: string,
    data: { member_ids: string[]; role?: string }
  ): Promise<ApiResponse<any>> {
    return this.request(`/ministries/${ministryId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeMemberFromMinistry(
    ministryId: string,
    memberId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/ministries/${ministryId}/members/${memberId}`, {
      method: "DELETE",
    });
  }

  async getMinistryMeetings(
    ministryId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return this.request(
      `/ministries/${ministryId}/meetings${query ? `?${query}` : ""}`
    );
  }

  // Ministry Roles API
  async getMinistryRoles(params?: {
    ministry_type?: string;
    is_leadership?: boolean;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.ministry_type)
      queryParams.append("ministry_type", params.ministry_type);
    if (params?.is_leadership !== undefined)
      queryParams.append("is_leadership", params.is_leadership.toString());

    const query = queryParams.toString();
    return this.request(`/ministry-roles${query ? `?${query}` : ""}`);
  }

  async createMinistryRole(data: any): Promise<ApiResponse<any>> {
    return this.request("/ministry-roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Attendance API
  async getAttendanceMeetings(params?: {
    page?: number;
    limit?: number;
    cell_group_id?: string;
    date_from?: string;
    date_to?: string;
    event_category?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.cell_group_id)
      queryParams.append("cell_group_id", params.cell_group_id);
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.event_category)
      queryParams.append("event_category", params.event_category);

    const query = queryParams.toString();
    return this.request(`/attendance/meetings${query ? `?${query}` : ""}`);
  }

  async getAttendanceMeeting(id: string): Promise<ApiResponse<any>> {
    return this.request(`/attendance/meetings/${id}`);
  }

  async createAttendanceMeeting(data: any): Promise<ApiResponse<any>> {
    console.log("API client sending data:", data);
    return this.request("/attendance/meetings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAttendanceMeeting(
    id: string,
    data: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/attendance/meetings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAttendanceMeeting(id: string): Promise<ApiResponse<any>> {
    return this.request(`/attendance/meetings/${id}`, {
      method: "DELETE",
    });
  }

  async getMemberAttendance(
    memberId: string,
    params?: {
      page?: number;
      limit?: number;
      event_category?: string;
      start_date?: string;
      end_date?: string;
      timeFilter?: string;
    }
  ): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.event_category)
      queryParams.append("event_category", params.event_category);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.timeFilter) queryParams.append("timeFilter", params.timeFilter);

    const query = queryParams.toString();
    return this.request(
      `/attendance/members/${memberId}/attendance${query ? `?${query}` : ""}`
    );
  }

  // Convert visitor to member
  async convertVisitorToMember(
    visitorId: string,
    data: {
      cell_group_id?: string;
      district_id?: string;
      baptism_date?: string;
      join_date?: string;
      additional_info?: string;
    }
  ): Promise<ApiResponse<{ message: string; member: any }>> {
    console.log("API Client: Converting visitor", {
      visitorId,
      data,
      hasToken: !!this.accessToken,
    });
    return this.request(`/attendance/visitors/${visitorId}/convert-to-member`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Live Attendance API
  async toggleLiveAttendance(
    meetingId: string,
    data: {
      active: boolean;
      expires_at?: string;
    }
  ): Promise<ApiResponse<any>> {
    return this.request(`/attendance/meetings/${meetingId}/live-attendance`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getLiveAttendanceStatus(meetingId: string): Promise<ApiResponse<any>> {
    return this.request(`/attendance/meetings/${meetingId}/live-status`);
  }

  async liveCheckin(
    meetingId: string,
    memberId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/attendance/meetings/${meetingId}/live-checkin`, {
      method: "POST",
      body: JSON.stringify({ member_id: memberId }),
    });
  }

  // Projects API
  async getProjects(params?: {
    page?: number;
    limit?: number;
    status?: string;
    is_published?: boolean;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.is_published !== undefined)
      queryParams.append("is_published", params.is_published.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/projects${query ? `?${query}` : ""}`);
  }

  async getPublishedProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/projects/published${query ? `?${query}` : ""}`);
  }

  async getProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: any): Promise<ApiResponse<any>> {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<any>> {
    return this.request(`/projects/${id}`, {
      method: "DELETE",
    });
  }

  // Donations API
  async getDonations(params?: {
    page?: number;
    limit?: number;
    project_id?: string;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.project_id) queryParams.append("project_id", params.project_id);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request(`/donations${query ? `?${query}` : ""}`);
  }

  async getDonationsByProject(
    project_id: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const query = queryParams.toString();
    return this.request(
      `/donations/project/${project_id}${query ? `?${query}` : ""}`
    );
  }

  async createDonation(data: any): Promise<ApiResponse<any>> {
    return this.request("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDonation(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/donations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDonation(id: string): Promise<ApiResponse<any>> {
    return this.request(`/donations/${id}`, {
      method: "DELETE",
    });
  }

  // Articles API
  async getArticles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);

    const query = queryParams.toString();
    return this.request(`/articles${query ? `?${query}` : ""}`);
  }

  async getArticle(id: string): Promise<ApiResponse<any>> {
    return this.request(`/articles/${id}`);
  }

  async createArticle(data: any): Promise<ApiResponse<any>> {
    return this.request("/articles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string): Promise<ApiResponse<any>> {
    return this.request(`/articles/${id}`, {
      method: "DELETE",
    });
  }

  async incrementArticleView(id: string): Promise<ApiResponse<any>> {
    return this.request(`/articles/${id}/view`, {
      method: "POST",
    });
  }

  // Article Categories API
  async getArticleCategories(): Promise<ApiResponse<any[]>> {
    return this.request("/article-categories");
  }

  async createArticleCategory(data: {
    name: string;
    description?: string;
    icon?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/article-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Classes API
  async getClasses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.status) queryParams.append("status", params.status);

    const query = queryParams.toString();
    return this.request(`/classes${query ? `?${query}` : ""}`);
  }

  // For members - only get active classes available for enrollment
  async getActiveClasses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);

    // Always filter for active status for members
    queryParams.append("status", "active");

    const query = queryParams.toString();
    return this.request(`/classes${query ? `?${query}` : ""}`);
  }

  async getClass(id: string): Promise<ApiResponse<any>> {
    return this.request(`/classes/${id}`);
  }

  async getClassSessions(
    classId: string,
    levelId?: string
  ): Promise<ApiResponse<any[]>> {
    const url = levelId
      ? `/classes/${classId}/sessions?level_id=${levelId}`
      : `/classes/${classId}/sessions`;
    return this.request(url, { method: "GET" });
  }

  async createClass(data: any): Promise<ApiResponse<any>> {
    return this.request("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClass(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteClass(id: string): Promise<ApiResponse<any>> {
    return this.request(`/classes/${id}`, {
      method: "DELETE",
    });
  }

  // Class Levels API
  async getClassLevels(classId: string): Promise<ApiResponse<any>> {
    return this.request(`/classes/${classId}/levels`);
  }

  async createClassLevel(
    classId: string,
    data: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/classes/${classId}/levels`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClassLevel(
    classId: string,
    levelId: string,
    data: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/classes/${classId}/levels/${levelId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteClassLevel(
    classId: string,
    levelId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/classes/${classId}/levels/${levelId}`, {
      method: "DELETE",
    });
  }

  // Class Enrollments API
  async getClassEnrollments(
    classId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      level_id?: string;
    }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.level_id) queryParams.append("level_id", params.level_id);

    const query = queryParams.toString();
    return this.request(
      `/classes/${classId}/enrollments${query ? `?${query}` : ""}`
    );
  }

  async enrollMember(data: {
    class_id: string;
    member_id: string;
    level_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/classes/enroll", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateEnrollment(
    enrollmentId: string,
    data: any
  ): Promise<ApiResponse<any>> {
    return this.request(`/classes/enrollments/${enrollmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteEnrollment(enrollmentId: string): Promise<ApiResponse<any>> {
    return this.request(`/classes/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
  }

  // Get member's class enrollments
  async getMemberClassEnrollments(
    memberId: string
  ): Promise<ApiResponse<any[]>> {
    return this.request(`/members/${memberId}/class-enrollments`);
  }

  // Self enroll in a class (for member to enroll themselves)
  async enrollInClass(classId: string): Promise<ApiResponse<any>> {
    return this.request(`/classes/${classId}/enroll`, {
      method: "POST",
      body: JSON.stringify({}), // Empty body, member ID comes from token
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
