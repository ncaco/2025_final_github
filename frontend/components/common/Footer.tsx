/**
 * 푸터 컴포넌트
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* 브랜드 섹션 */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <Image
                src="/logo.svg"
                alt="2026 Challenge Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-foreground">2026 Challenge</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              매월 하나의 MVP 서비스를 개발하는 챌린지 프로젝트입니다.
            </p>
          </div>

          {/* 서비스 섹션 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  홈
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  서비스 목록
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  대시보드
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  소개
                </Link>
              </li>
            </ul>
          </div>

          {/* 리소스 섹션 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">리소스</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  문서
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  문의하기
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 섹션 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">연락처</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:contact@2026challenge.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  contact@2026challenge.com
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
            {/* 소셜 미디어 링크 */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Twitter"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} 2026 Challenge Project. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

