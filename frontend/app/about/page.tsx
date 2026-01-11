/**
 * 소개 페이지
 */
export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">NCACO 소개</h1>
          <p className="text-xl text-gray-600">매월 하나의 MVP 서비스를 개발하는 챌린지 프로젝트</p>
        </div>

        {/* 프로젝트 개요 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 개요</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              NCACO는 매월 새로운 MVP(Minimum Viable Product) 서비스를 개발하고 배포하는
              도전적인 프로젝트입니다. 이 프로젝트는 현대적인 웹 개발 기술 스택을 활용하여
              실무에서 사용할 수 있는 완전한 애플리케이션을 구축하는 것을 목표로 합니다.
            </p>
            <p className="text-gray-700 mb-4">
              각 월별 프로젝트는 독립적인 서비스로 개발되며, 사용자 요구사항 분석부터
              디자인, 개발, 테스트, 배포까지 전 과정을 경험할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 기술 스택 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">기술 스택</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">백엔드</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  FastAPI (Python)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  PostgreSQL
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  SQLAlchemy ORM
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  JWT 인증
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">프론트엔드</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Next.js 14 (React)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  TypeScript
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Tailwind CSS
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  shadcn/ui 컴포넌트
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 인프라 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">인프라 및 배포</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">개발 환경</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Docker & Docker Compose
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  nginx 리버스 프록시
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  ngrok 터널링
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">보안 및 인증</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  HTTPS (Let's Encrypt)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  OAuth 2.0
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  역할 기반 접근 제어 (RBAC)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 프로젝트 목표 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 목표</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">빠른 개발</h3>
              <p className="text-gray-600">현대적인 도구와 프레임워크를 활용하여 효율적인 개발 프로세스 구축</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">품질 보장</h3>
              <p className="text-gray-600">테스트 주도 개발과 코드 리뷰를 통한 고품질 소프트웨어 제공</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">지속 학습</h3>
              <p className="text-gray-600">새로운 기술 습득과 모범 사례 적용을 통한 지속적인 성장</p>
            </div>
          </div>
        </div>

        {/* 연락처 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">문의하기</h2>
          <p className="text-gray-700 mb-6">
            프로젝트에 관심이 있으시거나 협업을 희망하신다면 언제든지 연락주세요.
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="mailto:contact@2026challenge.com"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              이메일 문의
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}