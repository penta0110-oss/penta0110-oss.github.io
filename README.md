# 예온이의 판다 매직랜드 🐼

휴대폰 세로 화면용 구구단 학습 + 판다 키우기 PWA입니다. 광고, 결제, 서버 전송이 없습니다.

## GitHub Pages 게시

1. GitHub에서 새 **Public** 저장소(예: `yeon-panda-magicland`)를 만듭니다.
2. 이 ZIP을 **압축 해제**하고 `index.html`, `sw.js`, `manifest.webmanifest`, `assets/`를 저장소 최상위에 업로드합니다. **ZIP 파일 자체를 업로드하면 실행되지 않습니다.**
3. 저장소 **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**를 선택합니다.
4. 잠시 후 `https://사용자명.github.io/yeon-panda-magicland/`에 접속합니다.
5. 안드로이드 Chrome: 메뉴 → 앱 설치 또는 홈 화면에 추가. iPhone Safari: 공유 → 홈 화면에 추가.

## 기술 참고

- 게임 로직과 UI는 `index.html` 한 파일에 포함됩니다. 설치형 PWA 및 오프라인 캐시를 위해 표준상 `manifest.webmanifest`, `sw.js`, 이미지 파일은 별도로 필요합니다.
- 학습 데이터는 각 브라우저의 `localStorage`에만 저장됩니다. 브라우저 데이터 삭제, 기기 변경, 사생활 보호 모드에서는 기록이 유지되지 않을 수 있습니다.
- 최초 실행 및 오프라인 설치를 위해 첫 방문은 인터넷 연결이 필요합니다.
- GitHub Pages 공개 저장소의 소스와 이미지 파일은 공개됩니다. 아동 사진을 바탕으로 제작한 이미지가 포함되므로 공개 범위를 검토하세요.
- 판다 및 캐릭터는 생성된 일러스트 배경 이미지와 이모지로 표현되며, 개별 3D 모델·의상 실시간 렌더링은 구현되어 있지 않습니다.
- 챌린지 제한 시간은 화면이 켜진 상태에서 동작하도록 설계되었습니다.
