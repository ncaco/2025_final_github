/**
 * 개인정보처리방침 페이지
 */
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
          <p className="text-xl text-gray-600">NCACO의 개인정보 처리 방침</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              <strong>최종 수정일:</strong> 2025년 1월 10일
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보의 수집 및 이용 목적</h2>
              <p className="text-gray-700 mb-4">
                NCACO(이하 "서비스")는 다음과 같은 목적으로 개인정보를 수집하고 이용합니다:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>회원 가입 및 관리</li>
                <li>서비스 제공 및 운영</li>
                <li>고객 문의 응대</li>
                <li>서비스 개선 및 개발</li>
                <li>법적 의무 준수</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 수집하는 개인정보의 항목</h2>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">필수 항목</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>이메일 주소</li>
                  <li>사용자명</li>
                  <li>비밀번호</li>
                </ul>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">선택 항목</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>이름</li>
                  <li>닉네임</li>
                  <li>전화번호</li>
                  <li>프로필 이미지</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">자동 수집 항목</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP 주소</li>
                  <li>쿠키</li>
                  <li>방문 기록</li>
                  <li>기기 정보</li>
                  <li>로그 데이터</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 보유 및 이용 기간</h2>
              <p className="text-gray-700 mb-4">
                수집된 개인정보는 회원 탈퇴 시까지 보유하며, 다음과 같은 경우 예외적으로 일정 기간 보유합니다:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>관계 법령에 따른 보존 기간</li>
                <li>분쟁 해결을 위한 최소한의 기간</li>
                <li>서비스 개선을 위한 통계 데이터</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 mb-4">
                서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우 예외적으로 제공할 수 있습니다:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령에 따른 요구가 있는 경우</li>
                <li>서비스 제공을 위해 필요한 경우 (익명화된 데이터)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 안전성 확보 조치</h2>
              <p className="text-gray-700 mb-4">서비스는 개인정보의 안전성을 확보하기 위해 다음과 같은 조치를 취하고 있습니다:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>암호화된 데이터 저장</li>
                <li>접근 권한 관리</li>
                <li>보안 소프트웨어 사용</li>
                <li>정기적인 보안 점검</li>
                <li>개인정보 처리 시스템의 접근 제한</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 이용자의 권리</h2>
              <p className="text-gray-700 mb-4">이용자는 다음과 같은 권리를 행사할 수 있습니다:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>개인정보 열람 요구</li>
                <li>개인정보 정정 요구</li>
                <li>개인정보 삭제 요구</li>
                <li>처리 정지 요구</li>
                <li>이의 제기</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 쿠키의 사용</h2>
              <p className="text-gray-700 mb-4">
                서비스는 사용자 경험 개선을 위해 쿠키를 사용합니다. 쿠키 설정을 통해 언제든지 쿠키 사용을 거부할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보 보호책임자</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>이름:</strong> NCACO 운영팀<br/>
                  <strong>이메일:</strong> privacy@2026challenge.com<br/>
                  <strong>연락처:</strong> contact@2026challenge.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 개인정보처리방침의 변경</h2>
              <p className="text-gray-700 mb-4">
                본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있습니다.
                변경 시에는 최소 7일 전부터 서비스 내 공지사항을 통해 고지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 문의하기</h2>
              <p className="text-gray-700 mb-4">
                개인정보와 관련된 문의사항이 있으시면 아래 연락처로 문의해 주시기 바랍니다.
              </p>
              <div className="flex space-x-4">
                <a
                  href="mailto:privacy@2026challenge.com"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  개인정보 문의
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  일반 문의
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}