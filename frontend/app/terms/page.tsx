/**
 * 이용약관 페이지
 */
export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">이용약관</h1>
          <p className="text-xl text-gray-600">NCACO 서비스 이용약관</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              <strong>최종 수정일:</strong> 2025년 1월 10일
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
              <p className="text-gray-700 mb-4">
                본 약관은 NCACO(이하 "서비스")가 제공하는 모든 서비스의 이용 조건 및 절차,
                이용자와 서비스 제공자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제2조 (용어의 정의)</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>"서비스"</strong>라 함은 NCACO가 제공하는 모든 온라인 서비스를 의미합니다.</li>
                <li><strong>"이용자"</strong>라 함은 본 약관에 따라 서비스를 이용하는 모든 사용자를 의미합니다.</li>
                <li><strong>"회원"</strong>라 함은 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스의 정보를 지속적으로 제공받으며, 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</li>
                <li><strong>"콘텐츠"</strong>라 함은 서비스에서 제공하는 모든 정보, 자료, 텍스트, 이미지, 동영상 등을 의미합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</li>
                <li>서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                <li>약관이 변경되는 경우에는 적용일자 및 변경사유를 명시하여 현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</li>
                <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 이용 계약을 해지할 수 있습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제4조 (서비스의 제공)</h2>
              <p className="text-gray-700 mb-4">서비스는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>게시판 서비스</li>
                <li>사용자 커뮤니티 기능</li>
                <li>콘텐츠 공유 및 관리</li>
                <li>사용자 프로필 관리</li>
                <li>관리자 기능 (관리자 계정에 한함)</li>
                <li>기타 서비스가 정하는 서비스</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (서비스 이용 계약의 성립)</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>이용 계약은 이용자가 본 약관에 동의하고 서비스가 정한 가입 양식에 따라 회원정보를 기입한 후 회원가입을 신청하면 승낙함으로써 성립합니다.</li>
                <li>서비스는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용 계약을 해지할 수 있습니다:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li>가입 신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                    <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                    <li>허위의 정보를 기재하거나, 서비스가 제시하는 내용을 기재하지 않은 경우</li>
                    <li>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (회원정보의 변경)</h2>
              <p className="text-gray-700 mb-4">
                회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.
                다만, 서비스 관리를 위해 필요한 실명, 아이디 등은 수정이 불가능합니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (개인정보보호 의무)</h2>
              <p className="text-gray-700 mb-4">
                서비스는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다.
                개인정보의 보호 및 사용에 대해서는 관련 법령 및 서비스의 개인정보처리방침이 적용됩니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (회원의 의무)</h2>
              <p className="text-gray-700 mb-4">회원은 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보도용</li>
                <li>서비스에 게시된 정보의 변경</li>
                <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>서비스 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>서비스 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (서비스의 중단)</h2>
              <p className="text-gray-700 mb-4">
                서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (저작권의 귀속 및 이용제한)</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>서비스가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스에 귀속합니다.</li>
                <li>이용자는 서비스를 이용함으로써 얻은 정보 중 서비스에게 지적재산권이 귀속된 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제11조 (면책조항)</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>서비스는 천재지변, 전쟁 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.</li>
                <li>서비스는 기간통신 사업자가 전기통신 서비스를 중지하거나 정상적으로 제공하지 아니하여 손해가 발생한 경우 책임을 지지 않습니다.</li>
                <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                <li>서비스는 이용자가 서비스와 다른 사업자가 제공하는 서비스의 이용으로 인한 손해, 또는 이용자가 입력한 정보 및 자료의 신뢰성에 대하여는 보증하지 않습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">제12조 (분쟁해결)</h2>
              <p className="text-gray-700 mb-4">
                본 약관에 정하지 아니한 사항과 본 약관의 해석에 관하여는 대한민국 법령에 따르며,
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우 법령에 정한 절차를 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">부칙</h2>
              <p className="text-gray-700">
                본 약관은 2025년 1월 10일부터 적용됩니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}