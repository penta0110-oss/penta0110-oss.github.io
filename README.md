# 예온이의 구구단 모험 V6

스마트폰 세로형 오프라인 학습 게임(PWA). 구구단을 풀어 대나무를 모으고 판다 '뭉치'를 키웁니다.
광고·결제·외부 데이터 전송이 없고, 모든 기록은 이 기기(localStorage `yeon_magicland_v1`)에만 저장됩니다.

## GitHub Pages에 올리는 방법
1. 이 ZIP의 압축을 풉니다.
2. 저장소(penta0110-oss.github.io) 첫 화면 → **Add file → Upload files**
3. 압축 푼 **폴더째**(index.html, manifest.webmanifest, sw.js, README.md, css 폴더, js 폴더, assets 폴더)를 끌어다 놓고 **Commit changes**
   - 같은 이름 파일은 자동으로 덮어써집니다.
   - 예전 assets 안의 village-*.webp, panda-stage-*.gif, hero*.png 등은 V6에서 쓰지 않습니다. 지워도 되고 그대로 둬도 됩니다.
4. 1~2분 뒤 https://penta0110-oss.github.io 접속
5. 휴대폰 크롬 → ⋮ → **앱 설치(홈 화면에 추가)** → 판다 아이콘 생성
   - 이미 설치했다면 앱을 한 번 열었다 닫으면 새 버전으로 바뀝니다.

## 폴더 구성
- index.html : 화면 틀
- css/app.css : 디자인·애니메이션
- js/rig.js : 예온이 캐릭터(얼굴 이미지 + 관절형 몸·옷)
- js/game.js : 게임 전체 로직
- sw.js / manifest.webmanifest : 오프라인 설치(PWA)
- assets/ : 예온이 얼굴·머리결, 판다 4단계, 배경, 아이콘

## 다음에 고칠 때
- 파일을 고치면 sw.js의 `CACHE` 이름과 index.html의 `?v=` 숫자를 함께 올려 주세요(예: 6.0.1). 그래야 설치된 앱이 새 파일을 받습니다.
