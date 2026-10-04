// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Source of truth: data/*.json (see MANIFEST_KEYS in scripts/build_manifest_bundle.mjs)
// Regenerate with: node scripts/hash_files.mjs && node scripts/build_manifest_bundle.mjs
// Generated at: 2026-10-04T06:16:25.229Z
window.JXICH_MANIFESTS = {
  "dataset_manifest": {
    "manifest_version": "2026.10-v1.0",
    "created_at": "2026-07-03",
    "schema": "dataset_manifest.schema.json",
    "datasets": [
      {
        "dataset_id": "JXICH-XB-001",
        "name": "江西夏布织造与夏布绣样本集",
        "category": "非遗织物",
        "source_url": "local://jxich/xiabu/202607-pilot",
        "owner": "江西省非遗采集计划 / 机构授权待补全",
        "volume": "320 images + 42 records",
        "collection_date": "2026-07-01",
        "version": "v0.2-pilot",
        "checksum": "sha256:pilot-placeholder-jxich-xb-001",
        "annotation_schema": "image_id, object_id, event_id, capture_session_id, material, texture, motif, process, rights_id",
        "risk_level": "medium",
        "readiness": 78,
        "status": "expert_review_required",
        "archived": false,
        "tags": [
          "织物",
          "纹样",
          "工艺",
          "江西"
        ],
        "supports": [
          "2D",
          "2.5D",
          "3D-preview"
        ],
        "reuse_layers": [
          "semantic",
          "history",
          "appearance",
          "rights"
        ],
        "analysis": "图像中纹理、纱线密度、绣线走向较清晰，适合作为江西非遗织物外观与工艺语义的核心pilot。需补齐传承人授权和公开展示边界。"
      },
      {
        "dataset_id": "PUB-DTD-001",
        "name": "DTD 纹理属性公开数据集",
        "category": "公开纹理",
        "source_url": "https://www.robots.ox.ac.uk/~vgg/data/dtd/",
        "owner": "Oxford VGG；底层图像权属需按原始来源核验",
        "volume": "5,640 images / 47 texture classes",
        "collection_date": "external-public",
        "version": "official-public-reference",
        "checksum": "sha256:not-downloaded-metadata-connector",
        "annotation_schema": "image_id, texture_class, official_split, source_note, license_note",
        "risk_level": "medium",
        "readiness": 72,
        "status": "research_metadata_connector",
        "archived": false,
        "tags": [
          "texture",
          "pilot",
          "公开",
          "research"
        ],
        "supports": [
          "2D",
          "2.5D"
        ],
        "reuse_layers": [
          "appearance",
          "rights"
        ],
        "analysis": "适合作为面料纹理识别、质感属性分类和模型流程预热数据。原图来自Google/Flickr，对外发布或商业演示前需要逐项核验来源版权。"
      },
      {
        "dataset_id": "PUB-FASHIONPEDIA-002",
        "name": "Fashionpedia 服饰属性与分割数据集",
        "category": "服饰属性",
        "source_url": "https://fashionpedia.github.io/home/index.html",
        "owner": "Fashionpedia annotations and ontology; original images require source review",
        "volume": "48,825 images / 294 attributes",
        "collection_date": "external-public",
        "version": "official-public-reference",
        "checksum": "sha256:not-downloaded-metadata-connector",
        "annotation_schema": "image_id, category, parts, attributes, mask, source_note, license_note",
        "risk_level": "medium",
        "readiness": 80,
        "status": "research_metadata_connector",
        "archived": false,
        "tags": [
          "ontology",
          "segmentation",
          "attribute",
          "apparel"
        ],
        "supports": [
          "2D",
          "2.5D",
          "3D-preview"
        ],
        "reuse_layers": [
          "semantic",
          "appearance",
          "rights"
        ],
        "analysis": "服饰部件、属性、实例分割和ontology较完整，适合测试图像标注到知识图谱字段的映射。原始图像版权需遵守来源网站条款。"
      },
      {
        "dataset_id": "PUB-DEEPFASHION2-004",
        "name": "DeepFashion2 检测与关键点数据集",
        "category": "服饰属性",
        "source_url": "https://github.com/switchablenorms/DeepFashion2",
        "owner": "DeepFashion2 project；下载需申请表与访问密码",
        "volume": "491K images / 801K clothing items",
        "collection_date": "external-controlled",
        "version": "controlled-access-reference",
        "checksum": "sha256:not-downloaded-controlled-access",
        "annotation_schema": "image_id, bbox, landmark, mask, pair_id, access_record, license_note",
        "risk_level": "high",
        "readiness": 64,
        "status": "controlled_access_candidate",
        "archived": false,
        "tags": [
          "detection",
          "landmark",
          "mask",
          "controlled"
        ],
        "supports": [
          "2D",
          "2.5D",
          "3D-preview"
        ],
        "reuse_layers": [
          "appearance",
          "rights"
        ],
        "analysis": "检测、关键点、mask和消费者-商店匹配任务较完整，适合验证服饰局部定位流程。下载需申请和密码，不能作为公开演示包内置资产。"
      },
      {
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "name": "夏布绣 Source-linked 知识图谱示范集（作者本人 P12 论文附录）",
        "category": "非遗知识图谱",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv",
        "owner": "作者本人（唯一作者）未发表原稿 P12（MLIC-CAFD-KG）附录数据 — 无第三方版权问题；作者于 2026-10-03 以 CC BY 4.0 公开发布",
        "volume": "32 released source-linked triples（从37条候选中筛选，26条release-ready + 6条review-flagged）；引用29篇文献语料库，但语料库PDF本身未随附",
        "collection_date": "2026-06-28",
        "version": "v18.37（P12 附录数据包版本）",
        "checksum": "sha256:b433e9d07a193c94377b47dcd62c7b213f9b6da4c486fc05fb7816e21fac9495",
        "annotation_schema": "triple_id, subject, predicate, object, evidence_summary, claim_category, evidence_role, source_priority, score, risk_status, release_status, official_source_id, provenance_status",
        "risk_level": "medium",
        "readiness": 85,
        "status": "source_verified_cc_by",
        "archived": false,
        "tags": [
          "夏布绣",
          "知识图谱",
          "非遗",
          "江西",
          "KG"
        ],
        "supports": [],
        "reuse_layers": [
          "semantic",
          "history",
          "rights"
        ],
        "analysis": "作者本人另一篇投稿论文（P12, MLIC-CAFD-KG）中已通过release gate验证的32条source-linked triple，直接复用真实数据（非占位符）。明确区分夏布刺绣（夏布绣）与夏布织造为两个不同的官方非遗项目，可补充现有JXICH-XB-001 pilot数据集中两者被笼统合并表述的问题。6条review_flagged记录保留但单独标注低置信度，不作为高强度证据使用。"
      },
      {
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "name": "Cooper Hewitt 麻(hemp)型纸与实物织物样本集（日本，CC0公有领域）",
        "category": "公开纹理",
        "source_url": "https://collection.cooperhewitt.org/view/objects/asitem/id/122755",
        "owner": "Smithsonian's Cooper Hewitt, National Design Museum；经 Smithsonian Open Access API 确认 media_usage=CC0",
        "volume": "3 objects / 8 images",
        "collection_date": "2026-07-04",
        "version": "v1.0-real-cc0-verified",
        "checksum": "sha256:20fcb2e427ff5138640a67c140bdef23ccc81752dcbb0c84b5c222b0f51cbf9e",
        "annotation_schema": "image_id, object_id(accession_no), event_id, capture_session_id, material, technique, rights_id",
        "risk_level": "low",
        "readiness": 92,
        "status": "source_verified_real_cc0",
        "archived": false,
        "tags": [
          "texture",
          "麻",
          "hemp",
          "日本",
          "CC0",
          "real-file"
        ],
        "supports": [
          "2D",
          "2.5D"
        ],
        "reuse_layers": [
          "appearance",
          "history",
          "rights"
        ],
        "analysis": "来自 Smithsonian Cooper Hewitt National Design Museum 的3件18-19世纪日本麻(hemp/bast fiber)相关藏品，共8张官方CC0高分辨率图像，本会话中实际下载并重新计算SHA-256（非占位符，非pilot）。包含2件型纸(katagami，防染用镂空纸模：楮纸+柿涩染+丝线)与1件马被麻织物(umakake，478.8×64.8cm)实物共6张照片。重要限制：均为日本藏品，与江西夏布(中国苎麻)、韩国모시同属bast fiber材料系但地域工艺传统不同——应作为\"工艺相邻的独立真实对照数据集\"使用，不可替代或等同于JXICH-XB-001 江西夏布 pilot数据集。"
      }
    ]
  },
  "rights_manifest": {
    "manifest_version": "2026.10-v1.0",
    "rights": [
      {
        "rights_id": "RGT-JXICH-XB-001",
        "dataset_id": "JXICH-XB-001",
        "license": "institutional_permission_pending",
        "license_document_id": "DOC-PENDING-XB-001",
        "consent_form_id": "CONSENT-XB-INHERITOR-PENDING",
        "permission_scope": {
          "research": true,
          "publication": false,
          "public_demo": false,
          "derivative": false,
          "commercial": false
        },
        "portrait_status": "not_applicable_or_pending",
        "personal_data_status": "low_risk",
        "sensitive_culture_status": "review_required",
        "cross_border_transfer_status": "not_allowed_until_review",
        "expiry_date": "2027-07-01",
        "rights_gate": "pending_review"
      },
      {
        "rights_id": "RGT-PUB-DTD-001",
        "dataset_id": "PUB-DTD-001",
        "license": "research_reference_with_original_source_review",
        "license_document_id": "OFFICIAL-WEBPAGE-DTD",
        "consent_form_id": "not_applicable",
        "permission_scope": {
          "research": true,
          "publication": false,
          "public_demo": false,
          "derivative": false,
          "commercial": false
        },
        "portrait_status": "not_applicable",
        "personal_data_status": "not_applicable",
        "sensitive_culture_status": "not_applicable",
        "cross_border_transfer_status": "metadata_only",
        "expiry_date": "source_terms_dependent",
        "rights_gate": "pending_review"
      },
      {
        "rights_id": "RGT-PUB-FASHIONPEDIA-002",
        "dataset_id": "PUB-FASHIONPEDIA-002",
        "license": "annotations_cc_by_4_original_images_separate_review",
        "license_document_id": "OFFICIAL-WEBPAGE-FASHIONPEDIA-TERMS",
        "consent_form_id": "not_applicable",
        "permission_scope": {
          "research": true,
          "publication": false,
          "public_demo": false,
          "derivative": false,
          "commercial": false
        },
        "portrait_status": "source_review_required",
        "personal_data_status": "source_review_required",
        "sensitive_culture_status": "not_applicable",
        "cross_border_transfer_status": "metadata_only",
        "expiry_date": "source_terms_dependent",
        "rights_gate": "pending_review"
      },
      {
        "rights_id": "RGT-PUB-DEEPFASHION2-004",
        "dataset_id": "PUB-DEEPFASHION2-004",
        "license": "controlled_access_application_required",
        "license_document_id": "APPLICATION-PENDING-DEEPFASHION2",
        "consent_form_id": "not_applicable",
        "permission_scope": {
          "research": false,
          "publication": false,
          "public_demo": false,
          "derivative": false,
          "commercial": false
        },
        "portrait_status": "source_review_required",
        "personal_data_status": "source_review_required",
        "sensitive_culture_status": "not_applicable",
        "cross_border_transfer_status": "not_allowed_until_access_approved",
        "expiry_date": "not_approved",
        "rights_gate": "blocked"
      },
      {
        "rights_id": "RGT-JXICH-XBEMB-KG-P12",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "license": "cc_by_4.0_released_by_sole_author",
        "license_document_id": "P12-TRIPLES32-CC-BY-4.0-RELEASE-20261003",
        "consent_form_id": "not_applicable",
        "permission_scope": {
          "research": true,
          "publication": true,
          "public_demo": true,
          "derivative": true,
          "commercial": true
        },
        "portrait_status": "not_applicable",
        "personal_data_status": "not_applicable",
        "sensitive_culture_status": "review_required",
        "cross_border_transfer_status": "unrestricted_public_release",
        "expiry_date": "not_applicable_cc_by_no_expiry",
        "rights_gate": "pending_review"
      },
      {
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "license": "cc0_public_domain_smithsonian_open_access",
        "license_document_id": "SI-OPENACCESS-CHNDM-RECORDS-20261004",
        "consent_form_id": "not_applicable",
        "permission_scope": {
          "research": true,
          "publication": true,
          "public_demo": true,
          "derivative": true,
          "commercial": true
        },
        "portrait_status": "not_applicable",
        "personal_data_status": "not_applicable",
        "sensitive_culture_status": "reviewed_no_restriction",
        "sensitive_culture_review": {
          "reviewed_by": "Yun Kyung Lee (curator)",
          "reviewed_at": "2026-10-04",
          "scope": "the 8 bundled images of Cooper Hewitt objects 1959-150-2, 1976-103-105 (katagami dyeing stencils) and 2001-2-1 (horse wrapping cloth, umakake)",
          "finding": "no sacred, ritual-restricted or community-protected content identified; the CC0 license was not taken as evidence of cultural appropriateness"
        },
        "cross_border_transfer_status": "unrestricted_public_domain",
        "expiry_date": "not_applicable_cc0_no_expiry",
        "rights_gate": "pass"
      }
    ]
  },
  "split_manifest": {
    "manifest_version": "2026.10-v1.0",
    "split_policy": {
      "unit_of_separation": [
        "object_id",
        "event_id",
        "capture_session_id"
      ],
      "train_eval_leakage_rule": "同一对象、同一采集场次或近重复图像不得同时进入训练集与评测集。",
      "eval_lock_required": true
    },
    "assignments": [
      {
        "dataset_id": "JXICH-XB-001",
        "split": "train",
        "locked": false,
        "leakage_risk": "medium",
        "note": "需要补齐机构授权后进入正式训练集。"
      },
      {
        "dataset_id": "PUB-DTD-001",
        "split": "train",
        "locked": false,
        "leakage_risk": "low",
        "note": "仅metadata connector与内部研究预热。"
      },
      {
        "dataset_id": "PUB-FASHIONPEDIA-002",
        "split": "holdout",
        "locked": false,
        "leakage_risk": "medium",
        "note": "用于字段映射和ontology对齐测试。"
      },
      {
        "dataset_id": "PUB-DEEPFASHION2-004",
        "split": "holdout",
        "locked": true,
        "leakage_risk": "high",
        "note": "访问审批前不得进入训练或评测。"
      },
      {
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "split": "train",
        "locked": false,
        "leakage_risk": "low",
        "note": "CC0公有领域实物图像，已通过Rights Gate（pass）与sample leakage检查，作为真实evidence-verified训练集示例。"
      }
    ]
  },
  "kg_claims": {
    "manifest_version": "2026.10-v1.0",
    "claims": [
      {
        "claim_id": "CLM-XB-001",
        "dataset_id": "JXICH-XB-001",
        "subject": "夏布样本集",
        "predicate": "hasMaterialTexture",
        "object": "麻纤维经纬肌理",
        "evidence_id": "EVD-XB-202607-001",
        "source_url": "local://fieldnote/xiabu-texture",
        "confidence": 0.82,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XB-002",
        "dataset_id": "JXICH-XB-001",
        "subject": "夏布绣纹样",
        "predicate": "hasCulturalContext",
        "object": "江西地域工艺语境",
        "evidence_id": "EVD-XB-202607-002",
        "source_url": "local://interview/pending",
        "confidence": 0.58,
        "review_status": "inheritor_review_required"
      },
      {
        "claim_id": "CLM-DTD-001",
        "dataset_id": "PUB-DTD-001",
        "subject": "DTD",
        "predicate": "supportsPretrainingTask",
        "object": "texture_attribute_classification",
        "evidence_id": "EVD-DTD-OFFICIAL",
        "source_url": "https://www.robots.ox.ac.uk/~vgg/data/dtd/",
        "confidence": 0.9,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-FP-001",
        "dataset_id": "PUB-FASHIONPEDIA-002",
        "subject": "Fashionpedia ontology",
        "predicate": "mapsTo",
        "object": "服饰部件与属性字段",
        "evidence_id": "EVD-FP-OFFICIAL",
        "source_url": "https://fashionpedia.github.io/home/index.html",
        "confidence": 0.86,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-DF2-001",
        "dataset_id": "PUB-DEEPFASHION2-004",
        "subject": "DeepFashion2",
        "predicate": "requires",
        "object": "controlled_access_application",
        "evidence_id": "EVD-DF2-GITHUB",
        "source_url": "https://github.com/switchablenorms/DeepFashion2",
        "confidence": 0.82,
        "review_status": "access_pending"
      },
      {
        "claim_id": "CLM-XBEMB-IKU01",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "officialName",
        "object": "MinjianXiuhuo_XiabuXiu",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU01",
        "confidence": 1,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU02",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "listedAs",
        "object": "NationalICHRepresentativeProject",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU02",
        "confidence": 1,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU03",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "hasProjectNo",
        "object": "VII-77",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU03",
        "confidence": 1,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU04",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "category",
        "object": "TraditionalFineArt",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU04",
        "confidence": 1,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU05",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "locatedIn",
        "object": "XinyuCity_Jiangxi",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU05",
        "confidence": 1,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU06",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "protectedBy",
        "object": "JiangxiYuzhouEmbroideryWorkshopCoLtd",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU06",
        "confidence": 0.9,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU07",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "usesSubstrate",
        "object": "XiabuRamieCloth",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU07",
        "confidence": 0.9,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU08",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "embeddedIn",
        "object": "JiangxiRamieRegion",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU08",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU09",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "hasHistoricalClaim",
        "object": "NorthernSongOrigin",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU09",
        "confidence": 0.7,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XBEMB-IKU10",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "associatedWith",
        "object": "WomenCraftCommunity",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU10",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU11",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "requiresProcess",
        "object": "Softening",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU11",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU12",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "requiresProcess",
        "object": "HeatIroning",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU12",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU13",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "requiresProcess",
        "object": "Sketching",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU13",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU14",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "requiresProcess",
        "object": "FrameMounting",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU14",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU15",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "requiresProcess",
        "object": "ThreadMatching",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU15",
        "confidence": 0.7,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU16",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "usesTechnique",
        "object": "StitchTechnique",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU16",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU17",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "usesTechnique",
        "object": "VoidSolidStitch",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU17",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU18",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "usesTechnique",
        "object": "LayeredStitchRepertoire",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU18",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU19",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "emphasizes",
        "object": "LineRhythm",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU19",
        "confidence": 0.7,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU20",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "hasAesthetic",
        "object": "SubduedPalette",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU20",
        "confidence": 0.7,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU21",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "LineRhythm",
        "predicate": "generatesAesthetic",
        "object": "VoidSolidAmbiguity",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU21",
        "confidence": 0.7,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU22",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuTexture",
        "predicate": "supports",
        "object": "InkWashFlavor",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU22",
        "confidence": 0.7,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XBEMB-IKU23",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "transmittedThrough",
        "object": "FamilyAndCommunityMentorship",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU23",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU24",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "ProductiveProtection",
        "predicate": "supports",
        "object": "WomenEmployment",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU24",
        "confidence": 0.6,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XBEMB-IKU25",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "hasInheritor",
        "object": "ZhangXiaohong",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU25",
        "confidence": 0.9,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU26",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "ZhangXiaohong",
        "predicate": "supportsTransmissionThrough",
        "object": "TrainingWorkshop",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU26",
        "confidence": 0.6,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XBEMB-IKU27",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuWeaving",
        "predicate": "supportsMaterialContextOf",
        "object": "XiabuEmbroidery",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU27",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU28",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuRamieCloth",
        "predicate": "affords",
        "object": "Breathability",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU28",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU29",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "RamieFiber",
        "predicate": "processedThrough",
        "object": "XiabuWeavingWorkflow",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU29",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-XBEMB-IKU30",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "hasProtectionContext",
        "object": "ContemporaryProductiveProtection",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU30",
        "confidence": 0.6,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XBEMB-IKU31",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "JiangxiICH",
        "predicate": "framesUseAs",
        "object": "ICHPlusModernLife",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU31",
        "confidence": 0.5,
        "review_status": "expert_review_required"
      },
      {
        "claim_id": "CLM-XBEMB-IKU32",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "subject": "XiabuEmbroidery",
        "predicate": "isNotIdenticalTo",
        "object": "XiabuWeaving",
        "evidence_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "source_url": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv#IKU32",
        "confidence": 0.8,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-CHNDM-001",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "subject": "CHNDMKatagamiStencil",
        "predicate": "usesSubstrate",
        "object": "KozoWashiPaperWithKakishibuTannin",
        "evidence_id": "SRC-CHNDM-1959-150-2-KATAGAMI",
        "source_url": "https://collection.cooperhewitt.org/view/objects/asitem/id/122755",
        "confidence": 0.93,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-CHNDM-002",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "subject": "CHNDMHempTextileJP",
        "predicate": "locatedIn",
        "object": "Japan",
        "evidence_id": "SRC-CHNDM-2001-2-1-UMAKAKE-01",
        "source_url": "https://collection.cooperhewitt.org/view/objects/asitem/id/122755",
        "confidence": 0.97,
        "review_status": "source_verified"
      },
      {
        "claim_id": "CLM-CHNDM-003",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "subject": "CHNDMHempTextileJP",
        "predicate": "isNotIdenticalTo",
        "object": "XiabuWeaving",
        "evidence_id": "SRC-CHNDM-2001-2-1-UMAKAKE-01",
        "source_url": "README.md#known-limitations",
        "confidence": 0.95,
        "review_status": "source_verified"
      }
    ]
  },
  "evidence_manifest": {
    "manifest_version": "2026.10-v1.0",
    "evidence_files": [
      {
        "evidence_file_id": "DOC-XB-INSTITUTION-20260701",
        "dataset_id": "JXICH-XB-001",
        "evidence_type": "institutional_permission",
        "file_name": "江西夏布采集机构授权书_20260701.pdf",
        "sha256": "sha256:7af3d4a66e5f0d9b7a1d8a7c8d20e21c1fb5a31c2eb1d5b395b2117f2c6a7701",
        "verification_status": "verified",
        "verified_by": "project_legal_reviewer",
        "verified_at": "2026-07-03T00:00:00+08:00",
        "permission_scope": [
          "research"
        ],
        "expiry_date": "2027-07-01",
        "source_file_present": false,
        "source_file_note": "placeholder_demo_record — no PDF stored in this repo; sha256 is illustrative, not computed from a real file"
      },
      {
        "evidence_file_id": "CONSENT-XB-INHERITOR-PENDING",
        "dataset_id": "JXICH-XB-001",
        "evidence_type": "inheritor_or_portrait_consent",
        "file_name": "夏布传承人肖像与访谈同意书_PENDING.pdf",
        "sha256": "sha256:pending",
        "verification_status": "pending",
        "verified_by": "not_verified",
        "verified_at": "pending",
        "permission_scope": [],
        "expiry_date": "pending",
        "source_file_present": false,
        "source_file_note": "placeholder_demo_record — real inheritor consent not yet collected"
      },
      {
        "evidence_file_id": "OFFICIAL-DTD-WEBPAGE-20260703",
        "dataset_id": "PUB-DTD-001",
        "evidence_type": "official_dataset_terms_page",
        "file_name": "dtd_official_page_snapshot_20260703.html",
        "sha256": "sha256:2f65d00d7e60e4b7d3b1d471a6e9203a9b1d91fb468768fd92e857d5a86c11db",
        "verification_status": "verified",
        "verified_by": "source_audit",
        "verified_at": "2026-07-03T00:00:00+08:00",
        "permission_scope": [
          "research_metadata"
        ],
        "expiry_date": "source_terms_dependent",
        "source_file_present": false,
        "source_file_note": "placeholder_demo_record — no HTML snapshot stored in this repo; sha256 is illustrative, not computed from a real file"
      },
      {
        "evidence_file_id": "OFFICIAL-FASHIONPEDIA-TERMS-20260703",
        "dataset_id": "PUB-FASHIONPEDIA-002",
        "evidence_type": "official_license_terms_page",
        "file_name": "fashionpedia_terms_snapshot_20260703.html",
        "sha256": "sha256:b77d7a9eb60467e5e7a5b1e03fd0fc5dd8488bc8ce391b11f94e721a0bcedb52",
        "verification_status": "verified",
        "verified_by": "source_audit",
        "verified_at": "2026-07-03T00:00:00+08:00",
        "permission_scope": [
          "research_metadata",
          "annotation_reference"
        ],
        "expiry_date": "source_terms_dependent",
        "source_file_present": false,
        "source_file_note": "placeholder_demo_record — no HTML snapshot stored in this repo; sha256 is illustrative, not computed from a real file"
      },
      {
        "evidence_file_id": "DEEPFASHION2-APPLICATION-PENDING",
        "dataset_id": "PUB-DEEPFASHION2-004",
        "evidence_type": "controlled_access_application",
        "file_name": "deepfashion2_access_application_PENDING.pdf",
        "sha256": "sha256:pending",
        "verification_status": "blocked",
        "verified_by": "not_verified",
        "verified_at": "pending",
        "permission_scope": [],
        "expiry_date": "not_approved",
        "source_file_present": false,
        "source_file_note": "placeholder_demo_record — controlled-access application not yet submitted"
      },
      {
        "evidence_file_id": "P12-TRIPLES32-CC-BY-4.0-RELEASE-20261003",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "evidence_type": "license_declaration_by_rights_holder",
        "evidence_role": "rights",
        "file_name": "LICENSE.md",
        "sha256": "sha256:03b6da366c403f85a8835e8fccfd3e911b1b7d72bc73a9e4f78449acd0072b51",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-10-04T00:00:00+08:00",
        "permission_scope": [
          "research",
          "publication",
          "public_demo",
          "derivative",
          "commercial"
        ],
        "expiry_date": "not_applicable_cc_by",
        "source_file_present": true,
        "source_file_path": "data/kg_sources/LICENSE.md",
        "source_file_note": "real_file — CC BY 4.0 release statement for the 32 triples, written by the sole author of P12, who holds the rights; it grants reuse, not a claim that each triple is verified (1,310 bytes)"
      },
      {
        "evidence_file_id": "SRC-XBEMB-KG-P12-TRIPLES32",
        "dataset_id": "JXICH-XBEMB-KG-P12",
        "evidence_type": "author_own_prior_research_supplementary_data",
        "file_name": "xiabu_embroidery_p12_source_linked_triples_32.csv",
        "sha256": "sha256:b433e9d07a193c94377b47dcd62c7b213f9b6da4c486fc05fb7816e21fac9495",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-03T00:00:00+08:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc_by",
        "source_file_present": true,
        "source_file_path": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv",
        "source_file_note": "real_file — copied verbatim from the supplementary package (v18.37) of the author's own unpublished manuscript P12 (MLIC-CAFD-KG) into data/kg_sources/; released by the sole author under CC BY 4.0 on 2026-10-03; sha256 independently recomputed from the copied file and matches the original file byte-for-byte (16,317 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SI-OPENACCESS-CHNDM-RECORDS-20261004",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "smithsonian_open_access_api_records_cc0",
        "evidence_role": "rights",
        "file_name": "smithsonian_open_access_records_20261004.json",
        "sha256": "sha256:d317408d5f46a0e3ff41dc5bfe6a2441345e07dc121be921255da115c827a026",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-10-04T00:00:00+08:00",
        "permission_scope": [
          "research",
          "publication",
          "public_demo",
          "derivative",
          "commercial"
        ],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/smithsonian_open_access_records_20261004.json",
        "source_file_note": "real_file — the three Smithsonian Open Access API records (edanmdm:chndm_1959-150-2, chndm_1976-103-105, chndm_2001-2-1) retrieved 2026-10-04; each states metadata and media usage access = CC0 (31,109 bytes)"
      },
      {
        "evidence_file_id": "SRC-CHNDM-1959-150-2-KATAGAMI",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_1959-150-2_katagami.jpg",
        "sha256": "sha256:cc0af97a9ba55a43c1cb6fb288cd457480db05c5b27e28477c8cdf23839bacae",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_1959-150-2_katagami.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_1959-150-2, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (443,738 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-1976-103-105-KATAGAMI",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_1976-103-105_katagami.jpg",
        "sha256": "sha256:9d1be7ed2f5630c9de10705f713f38de4fca8b7dfe5508cef303a8aaddcc282c",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_1976-103-105_katagami.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_1976-103-105, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (385,250 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-2001-2-1-UMAKAKE-01",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_2001-2-1_umakake_01.jpg",
        "sha256": "sha256:98aaccb0e1c46a0328ce81e3f7965dc8716271bdc7c310f00e4ee5013e8f1098",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_01.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_2001-2-1, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (194,715 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-2001-2-1-UMAKAKE-02",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_2001-2-1_umakake_02.jpg",
        "sha256": "sha256:f62a0e519f147f1ec354f75173b7fffab40c5842d425363f904b543e7812ea2e",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_02.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_2001-2-1, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (189,635 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-2001-2-1-UMAKAKE-03",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_2001-2-1_umakake_03.jpg",
        "sha256": "sha256:1abee66ea4b87cc85632a7dfebbe1102eab61f5247231c9a34f82924e28f5bb0",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_03.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_2001-2-1, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (554,637 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-2001-2-1-UMAKAKE-04",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_2001-2-1_umakake_04.jpg",
        "sha256": "sha256:e2d57960fe0a6cd9fbab5064e52974e99c876cd9d10448e9580babfbfa28d422",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_04.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_2001-2-1, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (257,886 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-2001-2-1-UMAKAKE-05",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_2001-2-1_umakake_05.jpg",
        "sha256": "sha256:49669fce227546826b6a08913f69ed7b32fa7807e7472c3ac567c9a3b516220a",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_05.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_2001-2-1, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (244,114 bytes)",
        "evidence_role": "content"
      },
      {
        "evidence_file_id": "SRC-CHNDM-2001-2-1-UMAKAKE-06",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "evidence_type": "public_domain_cc0_source_image",
        "file_name": "chndm_2001-2-1_umakake_06.jpg",
        "sha256": "sha256:456e3e9245016e42571e3f9f56052cf3fd8bec6f5915ad5f5b022c2a7e55ee10",
        "verification_status": "verified",
        "verified_by": "direct_sha256_recomputation",
        "verified_at": "2026-07-10T00:00:00+00:00",
        "permission_scope": [],
        "expiry_date": "not_applicable_cc0",
        "source_file_present": true,
        "source_file_path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_06.jpg",
        "source_file_note": "real_file — downloaded from Smithsonian Open Access API (Cooper Hewitt, edanmdm:chndm_2001-2-1, media_usage=CC0) into data/public_dataset_sources/chndm_hemp_textile_jp/; sha256 recomputed from the file on disk (187,708 bytes)",
        "evidence_role": "content"
      }
    ]
  },
  "sample_manifest": {
    "manifest_version": "2026.10-v1.0",
    "sample_policy": {
      "split_unit": [
        "object_id",
        "event_id",
        "capture_session_id"
      ],
      "near_duplicate_keys": [
        "phash",
        "duplicate_group_id"
      ],
      "validated_at": "2026-07-03T00:00:00+08:00"
    },
    "samples": [
      {
        "sample_id": "XB-IMG-0001",
        "dataset_id": "JXICH-XB-001",
        "object_id": "XB-OBJ-01",
        "event_id": "XB-EVT-A",
        "capture_session_id": "XB-CAP-202607-A",
        "split": "train",
        "phash": "p:aa11",
        "duplicate_group_id": "dup-xb-01",
        "rights_id": "RGT-JXICH-XB-001"
      },
      {
        "sample_id": "XB-IMG-0002",
        "dataset_id": "JXICH-XB-001",
        "object_id": "XB-OBJ-02",
        "event_id": "XB-EVT-A",
        "capture_session_id": "XB-CAP-202607-A",
        "split": "train",
        "phash": "p:aa12",
        "duplicate_group_id": "dup-xb-02",
        "rights_id": "RGT-JXICH-XB-001"
      },
      {
        "sample_id": "XB-IMG-0101",
        "dataset_id": "JXICH-XB-001",
        "object_id": "XB-OBJ-10",
        "event_id": "XB-EVT-B",
        "capture_session_id": "XB-CAP-202607-B",
        "split": "eval",
        "phash": "p:bb10",
        "duplicate_group_id": "dup-xb-10",
        "rights_id": "RGT-JXICH-XB-001"
      },
      {
        "sample_id": "XB-IMG-0102",
        "dataset_id": "JXICH-XB-001",
        "object_id": "XB-OBJ-11",
        "event_id": "XB-EVT-B",
        "capture_session_id": "XB-CAP-202607-B",
        "split": "eval",
        "phash": "p:bb11",
        "duplicate_group_id": "dup-xb-11",
        "rights_id": "RGT-JXICH-XB-001"
      },
      {
        "sample_id": "DTD-TRAIN-0001",
        "dataset_id": "PUB-DTD-001",
        "object_id": "DTD-WOVEN-001",
        "event_id": "DTD-OFFICIAL-TRAIN",
        "capture_session_id": "DTD-SPLIT-TRAIN",
        "split": "train",
        "phash": "p:dtd01",
        "duplicate_group_id": "dup-dtd-01",
        "rights_id": "RGT-PUB-DTD-001"
      },
      {
        "sample_id": "DTD-EVAL-0001",
        "dataset_id": "PUB-DTD-001",
        "object_id": "DTD-WOVEN-901",
        "event_id": "DTD-OFFICIAL-EVAL",
        "capture_session_id": "DTD-SPLIT-EVAL",
        "split": "eval",
        "phash": "p:dtd91",
        "duplicate_group_id": "dup-dtd-91",
        "rights_id": "RGT-PUB-DTD-001"
      },
      {
        "sample_id": "FP-HOLD-0001",
        "dataset_id": "PUB-FASHIONPEDIA-002",
        "object_id": "FP-GARMENT-001",
        "event_id": "FP-OFFICIAL",
        "capture_session_id": "FP-HOLDOUT",
        "split": "holdout",
        "phash": "p:fp01",
        "duplicate_group_id": "dup-fp-01",
        "rights_id": "RGT-PUB-FASHIONPEDIA-002"
      },
      {
        "sample_id": "DF2-HOLD-0001",
        "dataset_id": "PUB-DEEPFASHION2-004",
        "object_id": "DF2-GARMENT-001",
        "event_id": "DF2-CONTROLLED",
        "capture_session_id": "DF2-PENDING",
        "split": "holdout",
        "phash": "p:df201",
        "duplicate_group_id": "dup-df2-01",
        "rights_id": "RGT-PUB-DEEPFASHION2-004"
      },
      {
        "sample_id": "CHNDM-IMG-0001",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-1959-150-2",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-1959-150-2",
        "duplicate_group_id": "dup-chndm-1959-150-2",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0002",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-1976-103-105",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-1976-103-105",
        "duplicate_group_id": "dup-chndm-1976-103-105",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0003",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-2001-2-1",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-2001-2-1-01",
        "duplicate_group_id": "dup-chndm-2001-2-1",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0004",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-2001-2-1",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-2001-2-1-02",
        "duplicate_group_id": "dup-chndm-2001-2-1",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0005",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-2001-2-1",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-2001-2-1-03",
        "duplicate_group_id": "dup-chndm-2001-2-1",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0006",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-2001-2-1",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-2001-2-1-04",
        "duplicate_group_id": "dup-chndm-2001-2-1",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0007",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-2001-2-1",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-2001-2-1-05",
        "duplicate_group_id": "dup-chndm-2001-2-1",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      },
      {
        "sample_id": "CHNDM-IMG-0008",
        "dataset_id": "PUB-CHNDM-HEMP-JP-009",
        "object_id": "CHNDM-2001-2-1",
        "event_id": "CHNDM-SI-OPENACCESS-DIGITIZATION",
        "capture_session_id": "CHNDM-SI-OPENACCESS-2026",
        "split": "train",
        "phash": "p:chndm-2001-2-1-06",
        "duplicate_group_id": "dup-chndm-2001-2-1",
        "rights_id": "RGT-PUB-CHNDM-HEMP-JP-009"
      }
    ]
  },
  "checksum_manifest": {
    "manifest_version": "2026.10-v1.0",
    "generated_at": "2026-10-04T06:16:25.098Z",
    "generated_by": "scripts/hash_files.mjs (Node crypto, byte-level SHA-256 of files on disk)",
    "files": [
      {
        "path": "data/dataset_manifest.json",
        "sha256": "sha256:86bfabe5b7c3e7c24b650fcd6bb5a2fda65ae970b7f87cdce2e5aae50ac3eec7",
        "bytes": 8464,
        "role": "core_manifest"
      },
      {
        "path": "data/dataset_manifest.schema.json",
        "sha256": "sha256:ce6105ec20b604c1176058c4374d483c8af3c70fd65e3227fb195f85dd0a248a",
        "bytes": 1605,
        "role": "schema"
      },
      {
        "path": "data/rights_manifest.json",
        "sha256": "sha256:9002eddade9b2565dd61dffbb29946231b6d3305238580bcb2455e72a3e3fece",
        "bytes": 4974,
        "role": "core_manifest"
      },
      {
        "path": "data/evidence_manifest.json",
        "sha256": "sha256:4b9da578a1c802f91b55429305b3332f9046e881dc3b2f8c15bd7b90762e0b23",
        "bytes": 14409,
        "role": "core_manifest"
      },
      {
        "path": "data/split_manifest.json",
        "sha256": "sha256:64d39e2cd2ad9d6135b879824f4ab80ab23fc7d24ccfb02f7fcba62fffa5da02",
        "bytes": 1408,
        "role": "core_manifest"
      },
      {
        "path": "data/sample_manifest.json",
        "sha256": "sha256:d555ef748d5d303d0ab0417477577e0b775df238e6efc903a3c3bad6743523d3",
        "bytes": 6162,
        "role": "core_manifest"
      },
      {
        "path": "data/kg_claims.json",
        "sha256": "sha256:ac461013403dc5696ccc73f9114b93a86f624ed3e65581067e9432c5fc9e0593",
        "bytes": 16407,
        "role": "core_manifest"
      },
      {
        "path": "data/public_dataset_registry.json",
        "sha256": "sha256:ffd5013eb8b5c71b240b9cfd51330042c73091d3c710c48809b5ba48b9a2f893",
        "bytes": 11217,
        "role": "reference_only"
      },
      {
        "path": "data/generation_manifest.schema.json",
        "sha256": "sha256:20459e39254de78a9813a6c83191e9d21f27121a50f3d38be4fecb93c3644002",
        "bytes": 2410,
        "role": "schema"
      },
      {
        "path": "data/kg_sources/xiabu_embroidery_p12_source_linked_triples_32.csv",
        "sha256": "sha256:b433e9d07a193c94377b47dcd62c7b213f9b6da4c486fc05fb7816e21fac9495",
        "bytes": 16317,
        "role": "evidence_source"
      },
      {
        "path": "data/kg_sources/LICENSE.md",
        "sha256": "sha256:03b6da366c403f85a8835e8fccfd3e911b1b7d72bc73a9e4f78449acd0072b51",
        "bytes": 1310,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/smithsonian_open_access_records_20261004.json",
        "sha256": "sha256:d317408d5f46a0e3ff41dc5bfe6a2441345e07dc121be921255da115c827a026",
        "bytes": 31109,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_1959-150-2_katagami.jpg",
        "sha256": "sha256:cc0af97a9ba55a43c1cb6fb288cd457480db05c5b27e28477c8cdf23839bacae",
        "bytes": 443738,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_1976-103-105_katagami.jpg",
        "sha256": "sha256:9d1be7ed2f5630c9de10705f713f38de4fca8b7dfe5508cef303a8aaddcc282c",
        "bytes": 385250,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_01.jpg",
        "sha256": "sha256:98aaccb0e1c46a0328ce81e3f7965dc8716271bdc7c310f00e4ee5013e8f1098",
        "bytes": 194715,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_02.jpg",
        "sha256": "sha256:f62a0e519f147f1ec354f75173b7fffab40c5842d425363f904b543e7812ea2e",
        "bytes": 189635,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_03.jpg",
        "sha256": "sha256:1abee66ea4b87cc85632a7dfebbe1102eab61f5247231c9a34f82924e28f5bb0",
        "bytes": 554637,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_04.jpg",
        "sha256": "sha256:e2d57960fe0a6cd9fbab5064e52974e99c876cd9d10448e9580babfbfa28d422",
        "bytes": 257886,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_05.jpg",
        "sha256": "sha256:49669fce227546826b6a08913f69ed7b32fa7807e7472c3ac567c9a3b516220a",
        "bytes": 244114,
        "role": "evidence_source"
      },
      {
        "path": "data/public_dataset_sources/chndm_hemp_textile_jp/chndm_2001-2-1_umakake_06.jpg",
        "sha256": "sha256:456e3e9245016e42571e3f9f56052cf3fd8bec6f5915ad5f5b022c2a7e55ee10",
        "bytes": 187708,
        "role": "evidence_source"
      }
    ]
  }
};
