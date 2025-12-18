"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardShell } from "@/src/components/layout/shell";
import { Button } from "@/src/components/ui/button";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

type FormMode = "create" | "edit";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("VIEWER");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formPassword, setFormPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;

    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(lower) ||
        (u.name ?? "").toLowerCase().includes(lower),
    );
  }, [search, users]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "사용자 목록을 불러오지 못했습니다.");
      }
      const data = (await res.json()) as { users: UserRow[] };
      setUsers(
        data.users.map((u) => ({
          ...u,
          createdAt:
            typeof u.createdAt === "string"
              ? u.createdAt
              : new Date(u.createdAt as any).toISOString(),
        })),
      );
    } catch (e: any) {
      setError(e.message ?? "사용자 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchUsers();
  }, []);

  function openCreateModal() {
    setFormMode("create");
    setEditingUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("VIEWER");
    setFormStatus("ACTIVE");
    setFormPassword("");
    setFormError(null);
    setIsModalOpen(true);
  }

  function openEditModal(user: UserRow) {
    setFormMode("edit");
    setEditingUser(user);
    setFormName(user.name ?? "");
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPassword("");
    setFormError(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleDelete(user: UserRow) {
    const confirmed = window.confirm(
      `"${user.email}" 사용자를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "사용자 삭제에 실패했습니다.");
      }
      await fetchUsers();
    } catch (e: any) {
      alert(e.message ?? "사용자 삭제에 실패했습니다.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errors: string[] = [];

    if (!formEmail.trim()) {
      errors.push("이메일을 입력해주세요.");
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formEmail)) {
      errors.push("이메일 형식이 올바르지 않습니다.");
    }

    if (formMode === "create") {
      if (!formPassword.trim()) {
        errors.push("비밀번호를 입력해주세요.");
      } else if (formPassword.length < 8) {
        errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
      }
    } else if (formMode === "edit" && formPassword && formPassword.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
    }

    if (errors.length > 0) {
      setFormError(errors.join(" "));
      return;
    }

    setFormSubmitting(true);
    try {
      const payload: any = {
        name: formName.trim() || null,
        role: formRole,
        status: formStatus,
      };

      if (formPassword.trim()) {
        payload.password = formPassword;
      }

      let url = "/api/users";
      let method: "POST" | "PUT" = "POST";

      if (formMode === "create") {
        payload.email = formEmail.trim();
        method = "POST";
      } else if (formMode === "edit" && editingUser) {
        url = `/api/users/${editingUser.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "저장 중 오류가 발생했습니다.");
      }

      closeModal();
      await fetchUsers();
    } catch (e: any) {
      setFormError(e.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">사용자 관리</h1>
            <p className="text-sm text-muted-foreground">
              관리자/일반 사용자 계정을 조회하고 생성, 수정, 삭제할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="이메일 또는 이름으로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button size="sm" onClick={openCreateModal}>
              새 사용자
            </Button>
          </div>
        </div>

        <div className="mt-2 overflow-hidden rounded-lg border bg-card">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-4 py-2 font-medium">이메일</th>
                <th className="px-4 py-2 font-medium">이름</th>
                <th className="px-4 py-2 font-medium">역할</th>
                <th className="px-4 py-2 font-medium">상태</th>
                <th className="px-4 py-2 font-medium">생성일</th>
                <th className="px-4 py-2 font-medium text-right">액션</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-sm text-muted-foreground"
                    colSpan={6}
                  >
                    사용자 목록을 불러오는 중입니다...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-sm text-destructive"
                    colSpan={6}
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-4 text-center text-sm text-muted-foreground"
                    colSpan={6}
                  >
                    표시할 사용자가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.name ?? "-"}</td>
                    <td className="px-4 py-2">{user.role}</td>
                    <td className="px-4 py-2">{user.status}</td>
                    <td className="px-4 py-2">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(user)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDelete(user)}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
              <h2 className="text-lg font-semibold">
                {formMode === "create" ? "새 사용자 생성" : "사용자 정보 수정"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                역할과 상태를 설정하고, 필요 시 비밀번호를 초기화할 수 있습니다.
              </p>

              <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-medium">이메일</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    disabled={formMode === "edit"}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">이름 (선택)</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="표시 이름"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">역할</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">상태</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    {formMode === "create"
                      ? "비밀번호"
                      : "비밀번호 (선택, 변경 시 입력)"}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder={
                      formMode === "create"
                        ? "최소 8자 이상"
                        : "변경하지 않으려면 비워두세요"
                    }
                  />
                </div>

                {formError && (
                  <p className="text-xs font-medium text-destructive">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={closeModal}
                    disabled={formSubmitting}
                  >
                    취소
                  </Button>
                  <Button type="submit" size="sm" disabled={formSubmitting}>
                    {formSubmitting
                      ? "저장 중..."
                      : formMode === "create"
                      ? "생성"
                      : "저장"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

