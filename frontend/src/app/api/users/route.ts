import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/src/auth";
import { prisma } from "@/lib/prisma";

function requireAdmin(role?: string | null) {
  if (role !== "ADMIN") {
    return NextResponse.json(
      { message: "이 작업을 수행할 권한이 없습니다." },
      { status: 403 },
    );
  }
  return null;
}

const ROLE_VALUES = ["ADMIN", "MANAGER", "VIEWER"] as const;
const STATUS_VALUES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const forbidden = requireAdmin(session.user.role ?? null);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  try {
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("[GET /api/users] error", error);
    return NextResponse.json(
      { message: "사용자 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { message: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const forbidden = requireAdmin(session.user.role ?? null);
  if (forbidden) return forbidden;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "유효한 JSON 형식이 아닙니다." },
      { status: 400 },
    );
  }

  const { email, name, password, role = "VIEWER", status = "ACTIVE" } = body ?? {};

  const errors: string[] = [];

  if (!email || typeof email !== "string") {
    errors.push("이메일을 입력해주세요.");
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.push("이메일 형식이 올바르지 않습니다.");
  }

  if (!password || typeof password !== "string") {
    errors.push("비밀번호를 입력해주세요.");
  } else if (password.length < 8) {
    errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
  }

  if (name && typeof name !== "string") {
    errors.push("이름 형식이 올바르지 않습니다.");
  }

  if (!ROLE_VALUES.includes(role)) {
    errors.push("역할 값이 올바르지 않습니다.");
  }

  if (!STATUS_VALUES.includes(status)) {
    errors.push("상태 값이 올바르지 않습니다.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ message: errors.join(" "), errors }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
        role,
        status,
        hashedPassword,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        status: created.status,
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/users] error", error);
    return NextResponse.json(
      { message: "사용자를 생성하는 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}


