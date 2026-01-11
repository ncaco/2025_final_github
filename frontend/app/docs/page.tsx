/**
 * 문서 페이지
 */
export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API 문서</h1>
          <p className="text-xl text-gray-600">NCACO 프로젝트의 API 명세서</p>
        </div>

        {/* API 문서 링크 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API 엔드포인트</h2>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">백엔드 API 문서</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">활성</span>
              </div>
              <p className="text-gray-600 mb-4">FastAPI 자동 생성 API 문서</p>
              <a
                href="/docs"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                API 문서 보기
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">ReDoc 문서</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">활성</span>
              </div>
              <p className="text-gray-600 mb-4">대안적인 API 문서 인터페이스</p>
              <a
                href="/redoc"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ReDoc 문서 보기
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 개발 중인 문서들 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">개발 문서</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">프로젝트 설정</h3>
              <p className="text-gray-600 mb-4">개발 환경 설정 및 배포 가이드</p>
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">준비 중</span>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터베이스 설계</h3>
              <p className="text-gray-600 mb-4">데이터베이스 스키마 및 설계 문서</p>
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">준비 중</span>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">프론트엔드 가이드</h3>
              <p className="text-gray-600 mb-4">React/Next.js 컴포넌트 및 스타일 가이드</p>
              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">준비 중</span>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">배포 및 운영</h3>
              <p className="text-gray-600 mb-4">프로덕션 배포 및 모니터링 가이드</p>
              <span className="inline-block px-2 py-1 bg-yellow-800 text-yellow-800 text-sm rounded">준비 중</span>
            </div>
          </div>
        </div>

        {/* 프로젝트 정보 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">더 자세한 정보가 필요하신가요?</h2>
          <p className="text-gray-700 mb-6">
            프로젝트의 소스 코드와 자세한 개발 문서는 GitHub에서 확인하실 수 있습니다.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub 저장소
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}