# ICH Research DataBoard (한국어)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23121468.svg)](https://doi.org/10.5281/zenodo.23121468)

> 영문 [`README.md`](./README.md)가 기준 문서입니다. 이 한국어판은 내용이 늦게 반영될 수 있습니다.

브라우저 단독 실행(MVP) 연구 데이터 거버넌스 인터랙티브 프로토타입입니다. 빌드 도구나 서버 없이 `src/index.html`을 열면 바로 동작합니다. 江西省 非遗(무형문화유산) 시각 데이터의 수집·권리·훈련/평가 분할·지식그래프(KG)·AI 생성 실험을 하나의 워크플로로 연결하는 것이 목표입니다.

## 실행 방법

```text
src/index.html 을 브라우저로 열기
```

또는 `npm run serve`(src/server.mjs)로 열어도 됩니다. 이 문서의 `data/...` 경로는 모두 `src/` 기준입니다. 외부 의존성·빌드 단계가 없습니다.

## 현재 화면 구성 (5개 탭)

| 탭 | 목적 |
|---|---|
| 总览 (Overview) | 접속 시 첫 화면. KPI 카드로 활성 데이터셋·Rights Gate 차단·연구 보드·평가셋 잠금·생성 실험·Audit Chain 상태를 한눈에 보여주고, 카드 클릭 시 해당 작업 화면으로 이동 |
| 数据集 (Dataset) | manifest 기반 데이터셋 목록, 신규 등록 폼, 아카이브/복원 |
| 数据板 (Board) | 개인 연구 보드, train/eval/holdout split 관리, 2D/2.5D/3D 프리뷰, 복용층(reuse layer) 전환 |
| 生成实验室 (Generation Lab) | Rights Gate·복용층·KG를 반영한 프롬프트 생성, text-to-image/image-to-image 실험 기록(감사 가능한 manifest로 저장) |
| 治理验证 (Governance) | Rights Gate, Validation Evidence, KG Provenance, Ontology, Audit Hash-chain |

**UI 언어**: 기본은 영어이며, 상단의 `中文` / `English` 버튼으로 중국어와 전환합니다. 선택한 언어는 브라우저별로 기억되며(연구 상태·감사 로그·내보내기 패키지에는 포함되지 않음), 화면 문구는 `i18n.js`의 사전에서 관리합니다. 데이터셋 이름·분석·범주 등 `data/*.json`의 연구 데이터는 기록된 원문 그대로 표시됩니다. `test/i18n.test.js`가 사용 중인 모든 키에 영어·중국어 문구가 있는지 검사합니다.

## 데이터 모델

`data/*.json`이 유일한 원천(Single Source of Truth)입니다. 앱이 실제로 로드하는 `data/manifest_bundle.js`는 **더 이상 손으로 수정하지 않습니다** — file:// 환경에서 `fetch()`로 로컬 JSON을 읽을 수 없어(CORS) 같은 내용을 인라인 `<script>`로 넣어야 하기 때문에 존재하는 자동 생성 파일입니다. JSON을 고치면 다음을 실행해 재생성하세요.

```text
npm run rehash        # SHA-256 재계산(checksum_manifest.json) 후 data/manifest_bundle.js 재생성
npm run verify        # 등록된 해시가 실제 파일 바이트와 일치하는지 재확인
npm run check:bundle  # manifest_bundle.js가 data/*.json과 일치하는지 확인(타임스탬프 무시)
npm test              # 단위 테스트 + 위 무결성 검사 전체 실행
```

줄바꿈은 `.gitattributes`로 고정되어 있습니다(텍스트 LF, `data/kg_sources/`·`data/public_dataset_sources/`는 원본 바이트 그대로). 그래서 Windows·macOS·Linux 어디서 checkout해도 등록된 SHA-256이 유지됩니다.

`data/manifest_bundle.js` 파일 첫 줄에 `AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.`가 명시되어 있습니다.

- `dataset_manifest.json` / `.schema.json` — 데이터셋 레코드
- `rights_manifest.json` — Rights Gate 상태(permission_scope, portrait/consent 상태 등)
- `evidence_manifest.json` — 권리 증거 파일 메타데이터
- `split_manifest.json`, `sample_manifest.json` — train/eval/holdout 분할 및 표본 단위 누출(leakage) 검사
- `checksum_manifest.json` — 핵심 manifest/schema/evidence-source 파일 18건의 SHA-256 레지스트리(`scripts/hash_files.mjs`가 실제 파일 바이트에서 재계산해 생성)
- `kg_claims.json` — 지식그래프 claim (40건: pilot 2건 + 공개 데이터셋 3건 + **JXICH-XBEMB-KG-P12 32건** + **PUB-CHNDM-HEMP-JP-009 3건**)
- `public_dataset_registry.json` — 공개 데이터셋(DTD, Fashionpedia, DeepFashion, DeepFashion2) 메타데이터 커넥터 + 한국 복식·직물 비교 사례 4건(의친왕가 복식, 한산모시짜기, 나주의 샛골나이, 명주짜기 — 국가유산청, 인용 전용·이미지 미포함) + **Cooper Hewitt CC0 麻织物/型纸 1건(이미지 실제 반입, 아래 참고)** — 이 파일은 문서/연구 참조용이며 `app.js`에서 실제로 로드하지 않음
- `data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv` — **실제로 검증된 증거 파일** (아래 참고)
- `data/public_dataset_sources/chndm_hemp_textile_jp/*.jpg` (8건) — **실제로 검증된 증거 이미지 파일** (아래 참고)

## 검증·감사 메커니즘

- **Audit hash-chain**: 모든 상태 변경이 `sequence`/`previous_hash`/`entry_hash`를 가진 append-only 로그로 기록됩니다. 해시는 표준 **SHA-256**(순수 JS 구현, `app.js`의 `sha256Hex`)이며, `test/validation.test.js`에서 Node 내장 `crypto` 모듈과 대조 검증합니다.
- **Rights Gate**: `permission_scope`(research/publication/public_demo/derivative/commercial)와 verified evidence file hash가 모두 있어야 통과. 없으면 훈련/평가/공개 전시로 진입 차단.
- **Split Governance**: `object_id`/`event_id`/`capture_session_id`로 train/eval 누출을 검사하고, 평가셋은 잠글 수 있습니다.
- **자동화 테스트**: `test/validation.test.js` — `rightsGate`, `verifyAuditChain`(변조 탐지 포함), `validateSampleLeakage`, `validateSchema`, `validateChecksumRegistry`, `authenticEvidenceFor` 등 핵심 검증 로직을 실제 `app.js` 코드에 대해 실행합니다. `test/integrity.test.js`는 해시 레지스트리·번들 동기화·온톨로지 어휘 검사 스크립트를 실행해 실패 시 테스트를 실패시킵니다. 실행: `npm test` (Node 22 이상). GitHub Actions(`.github/workflows/ci.yml`)가 Ubuntu·Windows × Node 22·24에서 같은 테스트를 실행합니다.
- **온톨로지 레이어 (`data/ontology/`)**: `predicate_vocabulary.json`(30개 predicate의 class/domain/range 통제 어휘)와 `competency_questions.json`(8개 competency question)로 `kg_claims.json`을 검증합니다. `node scripts/validate_ontology.mjs`로 실행하며, predicate/역할/신뢰도 범위 위반을 탐지하고 각 claim의 `evidence_id`가 실제 `evidence_manifest.json` 항목으로 연결되는지(현재 40건 중 35건 연결, 5건은 비공식 label) 정직하게 보고합니다. **이것은 OWL/SHACL 추론기가 아니라 경량 어휘·제약 검사기입니다** — 파일 자체의 `note` 필드에도 이 범위 제한이 명시되어 있습니다.
- **Checksum 검증은 두 층으로 분리되어 있습니다.** `app.js`의 `validateChecksumRegistry()`는 UI에서 즉시 도는 **레지스트리 형식 검사**일 뿐입니다(모든 항목이 `sha256:<64 hex>` 형태이고 `pending`이 아닌지만 확인 — 파일 바이트를 다시 읽지 않습니다). 실제 바이트 무결성 검증은 `scripts/hash_files.mjs --verify`(Node `crypto`로 파일을 다시 읽어 재계산)가 담당하는 **감사 레이어**입니다. 두 층을 같은 것으로 서술하지 마세요.

## ✅ 새로 추가된 실데이터: JXICH-XBEMB-KG-P12 (夏布绣 지식그래프)

`data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv`는 **placeholder가 아닌 실제 파일**입니다. 저자 본인의 별도 원고 P12(MLIC-CAFD-KG)의 부속 데이터 패키지(v18.37)에서 release gate를 통과한 32건의 source-linked triple을 그대로 복사해왔습니다.

- 제3자 저작권 문제 없음(저자 본인 단독 원고 자료). 2026-10-03 단독 저자가 이 CSV를 **CC BY 4.0**으로 공개하기로 결정했으며, 이에 따라 `permission_scope`의 모든 항목이 `true`, `rights_gate: "pass"`입니다. 라이선스 고지는 [`data/kg_sources/LICENSE.md`](./src/data/kg_sources/LICENSE.md) 참고.
- `evidence_manifest.json`의 `SRC-XBEMB-KG-P12-TRIPLES32` 항목은 이 플랫폼에서 **처음으로 `source_file_present: true`이고 실제로 재계산해 검증한 sha256을 가진 evidence**입니다.
- 32건 중 26건은 원본 논문 기준 `release_ready`(→ `source_verified`)이고, 6건은 `review_flagged`(→ `expert_review_required`)로 구분되어 그대로 반영됩니다.
- 夏布刺绣(夏布绣)와 夏布织造를 별개의 공식 非遗 항목으로 명확히 구분하고 있어, 기존 `JXICH-XB-001` pilot 데이터셋이 둘을 뭉뚱그려 표현하던 부분을 보완합니다.

## ✅ 새로 추가된 실데이터 2: PUB-CHNDM-HEMP-JP-009 (Cooper Hewitt CC0 麻织物/型纸)

`data/public_dataset_sources/chndm_hemp_textile_jp/*.jpg`(8건)는 Smithsonian's Cooper Hewitt, National Design Museum 소장품 3건(1959-150-2, 1976-103-105 型紙 카타가미 2건 + 2001-2-1 말덮개용 麻織物 umakake 6장)에서 Smithsonian Open Access API로 `media_usage=CC0`를 직접 확인한 뒤 실제로 다운로드한 **placeholder가 아닌 실제 파일**입니다.

- 이 플랫폼에서 P12에 이어 **두 번째로 `source_file_present: true`이고 실제로 재계산해 검증한 sha256을 가진 evidence**입니다(evidence_manifest.json의 `SRC-CHNDM-*` 8건).
- CC0(공유 저작권 완전 포기)이므로 `permission_scope`(research/publication/public_demo/derivative/commercial) 전체를 `true`로 설정했고, Rights Gate가 실제로 **`pass`(증거 통과)** 를 반환하는 이 플랫폼 최초의 사례입니다 — placeholder가 아닌 진짜 "그린라이트" 데모.
- **중요한 한계**: 3건 모두 **일본** 소장품입니다. 江西夏布(중국 苎麻)·한산모시(한국)와 재료(麻/bast fiber)는 같은 계열이지만 지역·공예 전통은 다릅니다. `JXICH-XB-001`을 대체하지 않으며, "공정 인접(process-adjacent) 독립 비교 데이터셋"으로만 사용해야 합니다(`kg_claims.json`의 `CLM-CHNDM-003`이 `isNotIdenticalTo`로 이 구분을 명시적으로 기록).
- 실제 중국/한국 苎麻·모시 CC0 이미지는 이번 조사에서(Smithsonian API 169개 레코드, 18개 검색어 확인) 디지털화된 것을 찾지 못했습니다 — 억지로 대체하지 않고 정직하게 "없다"고 기록했습니다.

## ⚠️ 데이터 진위성에 대한 알림 (Known Limitations)

학술 자료로 인용하기 전에 반드시 확인하세요:

1. **`data/dataset_manifest.json`의 江西夏布 데이터셋(JXICH-XB-001)은 pilot/placeholder 데이터입니다.** checksum이 `sha256:pilot-placeholder-...` 형태로 명시되어 있으며 실제 이미지 해시가 아닙니다.
2. **`evidence_manifest.json`의 14건 중 5건은 `source_file_present: false`입니다.** 기관 승인서·전승인 동의서 PDF 등 실제 증거 파일은 이 저장소에 존재하지 않으며, sha256 값은 예시일 뿐 재계산으로 검증할 수 없습니다. Rights Gate 로직 자체(권한 없으면 차단)는 정상 동작하지만, 이 5건에 대해서는 "검증된 증거"라는 표현을 실제 문서가 첨부되기 전까지 사용하면 안 됩니다. 나머지 9건(`SRC-XBEMB-KG-P12-TRIPLES32` 1건 + `SRC-CHNDM-*` 8건)만 `source_file_present: true`이고 실제 파일에서 재계산한 sha256을 갖습니다.
3. **`sample_manifest.json`에는 이 데이터셋의 예시 표본 4건만 있습니다(파일 전체 16건 중 8건은 Cooper Hewitt 이미지).** `dataset_manifest.json`이 주장하는 "320 images + 42 records" 전체를 대표하지 않으며, leakage 검증은 이 예시 표본 범위에서만 의미가 있습니다.
4. **传承人(전승인) 동의는 `pending` 상태입니다.** `JXICH-XB-001`은 실제 증거 파일이 없어 Rights Gate가 연구 목적 이용까지 차단(`blocked`)하고 있으나, 논문·발표 자료에 해당 데이터를 포함하면 안 됩니다.
5. **2D/2.5D/3D 프리뷰는 실제 3D 재구성(photogrammetry/NeRF/mesh)이 아니라 CSS 목업입니다.** "3D 데이터화 구현됨"이라고 서술하지 말고 "schematic visualization preview"로 표기하세요.
6. **Generation Lab 결과물은 AI 생성 이미지이며 실물 유산 표본이 아닙니다.** UI에 "AI-GENERATED — NOT AN AUTHENTIC ARTIFACT" 배지를 항상 표시하고, 내보낸 manifest에도 `content_class: "ai_generated_not_authentic"` 필드가 포함됩니다.
7. **`server.mjs` 없이 열면 상태는 브라우저 `localStorage`에만 저장됩니다.** 캐시를 지우면 사라지므로 `Export package`(导出研究包)로 백업하세요. 선택 사항인 `npm run serve`(`src/server.mjs`)(http://127.0.0.1:8787)는 상태를 디스크에 저장하지만, 인증 없는 단일 사용자용 로컬 도구입니다(`docs/persistence-design.md` 참고).

## 다음 단계로 고려할 것 (실물 데이터/외부 계정이 필요한 항목)

- 실제 기관 승인서·전승인 동의서를 받아 `evidence_manifest.json`/`manifest_bundle.js`에 `source_file_present: true`로 갱신하고 실제 파일을 별도 비공개 저장소에 연결
- 320장 전체 표본의 `sample_manifest.json` 완성 (현재는 4건 예시)
- ~~GitHub/Zenodo에 코드·데이터를 아카이브해 DOI 확보~~ 완료: v1.0.0 DOI [10.5281/zenodo.23121469](https://doi.org/10.5281/zenodo.23121469)

## 라이선스 (License)

**코드와 데이터의 라이선스는 서로 다릅니다 — 저장소 전체에 단일 라이선스를 적용하지 않습니다.**

- **코드** (`src/` 안의 `index.html`, `app.js`, `i18n.js`, `styles.css`, `server.mjs`와 `scripts/`, `test/`): **MIT License**. 자세한 내용은 저장소 루트의 [`LICENSE.txt`](./LICENSE.txt) 파일을 참고하세요(저작권자: Yun Kyung Lee).
- **데이터** (`src/data/` 디렉터리 전체): MIT 라이선스가 **적용되지 않습니다.** 레코드별로 권리 상태가 다르므로 재사용/재배포 전 반드시 아래를 확인하세요.
  - 레코드 단위 권리 상태의 단일 원천은 [`data/rights_manifest.json`](./src/data/rights_manifest.json)(`permission_scope`, `rights_gate` 등)과 [`data/evidence_manifest.json`](./src/data/evidence_manifest.json)(증거 파일별 `source_file_present`, `verification_status`)입니다.
  - 이 저장소에서 **재배포가 실제로 허용된 데이터**는 두 가지입니다. 둘 다 `rights_manifest.json`에서 `rights_gate: "pass"`이고 `permission_scope`의 모든 항목이 `true`입니다.
    - `PUB-CHNDM-HEMP-JP-009`(Cooper Hewitt 麻織物/型紙 이미지, `data/public_dataset_sources/chndm_hemp_textile_jp/*.jpg`): **CC0**. 위 "✅ 새로 추가된 실데이터 2" 섹션 참고.
    - `JXICH-XBEMB-KG-P12`(夏布绣 지식그래프 32건, `data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv`): 저자 본인 단독 원고 P12의 부속 데이터, **CC BY 4.0**. [`data/kg_sources/LICENSE.md`](./src/data/kg_sources/LICENSE.md)와 위 "✅ 새로 추가된 실데이터" 섹션 참고.
  - `JXICH-XB-001`(江西夏布 pilot 데이터셋)을 포함한 나머지 대부분의 `data/`는 **placeholder/pilot 데이터**이며 실제 유산 표본을 대표하지 않습니다. 위 "⚠️ 데이터 진위성에 대한 알림 (Known Limitations)" 섹션, 특히 1번(placeholder checksum)과 2번(`evidence_manifest.json` 14건 중 5건이 `source_file_present: false`) 항목을 반드시 먼저 읽으세요.
  - **요약**: 실제 증거 문서가 첨부되고 `source_file_present: true`로 갱신되기 전까지, `data/`의 대부분은 "공개/재배포 가능한 오픈 데이터"가 아닙니다. Zenodo 아카이빙 등 공개 배포 전 체크리스트는 [`ARCHIVING.md`](./ARCHIVING.md)를 참고하세요.

## 히스토리

2026-07-01~03에 걸쳐 3열 대시보드 → manifest 기반 거버넌스(Rights Gate/Split/Audit) → 5탭 분리 화면 → Generation Lab → 다크 테마 리디자인 → 개요(Overview) 대시보드 → SHA-256 해시체인/증거 진위성 표시 순으로 반복 개발되었습니다. 이전 버전들의 상세 변경 로그는 `git log`(2026-07-03부터 로컬 저장소 추적 시작)로 확인하세요.
