import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "../../../../auth";
import { prisma } from "../../../../../lib/prisma";

const ROLE_VALUES = ["ADMIN", "MANAGER", "VIEWER"] as const;
const STATUS_VALUES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

function requireAdmin(role?: string | null) {
  if (role !== "ADMIN") {
    return NextResponse.json(
      { message: "이 작업을 수행할 권한이 없습니다." },
      { status: 403 },
    );
  }
  return null;
}

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const forbidden = requireAdmin(session.user.role ?? null);
  if (forbidden) return forbidden;

  const { id } = params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "유효한 JSON 형식이 아닙니다." },
      { status: 400 },
    );
  }

  if (body === null || typeof body !== "object") {
    return NextResponse.json(
      { message: "요청 본문 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const { name, role, status, password } = body as {
    name?: unknown;
    role?: unknown;
    status?: unknown;
    password?: unknown;
  };

  const errors: string[] = [];

  if (name !== undefined && name !== null && typeof name !== "string") {
    errors.push("이름 형식이 올바르지 않습니다.");
  }

  if (role !== undefined && !ROLE_VALUES.includes(role as (typeof ROLE_VALUES)[number])) {
    errors.push("역할 값이 올바르지 않습니다.");
  }

  if (
    status !== undefined &&
    !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])
  ) {
    errors.push("상태 값이 올바르지 않습니다.");
  }

  if (password !== undefined) {
    if (typeof password !== "string") {
      errors.push("비밀번호 형식이 올바르지 않습니다.");
    } else if (password && password.length < 8) {
      errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ message: errors.join(" "), errors }, { status: 400 });
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name ?? null;
    if (role !== undefined)
      updateData.role = role as (typeof ROLE_VALUES)[number];
    if (status !== undefined)
      updateData.status = status as (typeof STATUS_VALUES)[number];
    if (password) {
      updateData.hashedPassword = await bcrypt.hash(password as string, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      status: updated.status,
      createdAt: updated.createdAt,
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error) {
      const err = error as { code?: string };
      if (err.code === "P2025") {
        return NextResponse.json(
          { message: "해당 사용자를 찾을 수 없습니다." },
          { status: 404 },
        );
      }
    }

    console.error("[PUT /api/users/:id] error", error);
    return NextResponse.json(
      { message: "사용자를 수정하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const forbidden = requireAdmin(session.user.role ?? null);
  if (forbidden) return forbidden;

  const { id } = params;

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error) {
      const err = error as { code?: string };
      if (err.code === "P2025") {
        return NextResponse.json(
          { message: "해당 사용자를 찾을 수 없습니다." },
          { status: 404 },
        );
      }
    }

    console.error("[DELETE /api/users/:id] error", error);
    return NextResponse.json(
      { message: "사용자를 삭제하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


