// UI strings for the English / Chinese language toggle. English is the default; the
// chosen language is remembered per browser in localStorage (a viewer preference only —
// it is not part of the research state, the audit log, or exported packages).
//
// Static markup is translated through data attributes in index.html:
//   data-i18n="key"              -> element textContent
//   data-i18n-placeholder="key"  -> placeholder attribute
//   data-i18n-aria="key"         -> aria-label attribute
// app.js calls t(key, params) for everything it renders. Dataset content from data/*.json
// (names, analyses, categories) is research data and is shown as recorded, untranslated.
(function (root) {
  const LANG_KEY = "jxich_ui_lang";
  const SUPPORTED = ["en", "zh"];

  const STRINGS = {
    // Shell
    "app.title": { en: "Jiangxi ICH AI Data Governance Research Platform", zh: "江西省非遗 AI 数据治理研究平台" },
    "brand.aria": { en: "Platform name", zh: "平台名称" },
    "brand.sub": { en: "Governance and KG validation for Jiangxi ICH visual data", zh: "江西省非遗视觉数据治理与KG验证平台" },
    "nav.aria": { en: "Main workflow", zh: "主流程" },
    "tab.overview": { en: "Overview", zh: "总览" },
    "tab.dataset": { en: "Datasets", zh: "数据集" },
    "tab.board": { en: "Board", zh: "数据板" },
    "tab.generation": { en: "Generation Lab", zh: "生成实验室" },
    "tab.governance": { en: "Governance", zh: "治理验证" },
    "btn.import": { en: "Import", zh: "导入" },
    "btn.reset": { en: "Reset", zh: "重置" },
    "btn.export": { en: "Export package", zh: "导出研究包" },
    "lang.toggle": { en: "中文", zh: "English" },
    "lang.toggleAria": { en: "Switch interface language to Chinese", zh: "将界面语言切换为英文" },
    "ribbon.aria": { en: "Research platform validation workflow", zh: "研究平台验证流程" },

    // Overview
    "overview.desc": { en: "One research workbench from manifest intake through the Rights Gate, split governance, KG provenance and AI generation to an exportable audit report. Click a card below to open its module.", zh: "从 manifest 接入到 Rights Gate、Split 治理、KG Provenance、AI 生成与可导出审计报告的一站式研究工作台。点击下方卡片可直接跳转对应模块。" },
    "overview.governance": { en: "Governance at a glance", zh: "治理状态速览" },
    "overview.audit": { en: "Recent audit entries", zh: "最近审计记录" },
    "kpi.datasets": { en: "Datasets (active)", zh: "数据集（活跃）" },
    "kpi.datasetsSub": { en: "{total} total · {archived} archived", zh: "全部 {total} · 归档 {archived}" },
    "kpi.blocked": { en: "Rights Gate blocked", zh: "Rights Gate 阻止" },
    "kpi.blockedSub": { en: "Cleared once permissions / evidence are added", zh: "需补充授权 / 证据后解除" },
    "kpi.board": { en: "Research board", zh: "研究板" },
    "kpi.boardSub": { en: "Drop datasets in for split / reuse", zh: "拖入数据集进行 split / 复用" },
    "kpi.evalLocked": { en: "Eval sets locked", zh: "评测集已锁定" },
    "kpi.evalLockedSub": { en: "Prevents train / eval leakage", zh: "防止 train / eval 泄漏" },
    "kpi.runs": { en: "Generation runs", zh: "生成实验记录" },
    "kpi.runsSub": { en: "Reproducible prompt → manifest", zh: "可复现 prompt → manifest" },
    "summary.blocked": { en: "Rights Gate blocked", zh: "Rights Gate 阻止" },
    "summary.blockedValue": { en: "{n} datasets", zh: "{n} 个数据集" },
    "summary.pendingEvidence": { en: "Evidence files pending verification", zh: "待核验证据文件" },
    "summary.holdout": { en: "Holdout pending review", zh: "Holdout 待复核" },
    "summary.count": { en: "{n}", zh: "{n} 个" },

    // Datasets
    "dataset.title": { en: "Dataset intake", zh: "数据集分析入口" },
    "dataset.desc": { en: "Manifests are the entry point: source, version, checksum, rights status and train/eval governance are read from one place.", zh: "以 manifest 为入口，统一读取来源、版本、checksum、权利状态与训练/评测治理。" },
    "dataset.manifestNote": { en: "dataset / rights / split / KG claims are kept as separate research files; under file:// they are loaded from the bundle.", zh: "dataset / rights / split / KG claims 已拆分为外部研究文件；file:// 环境由 bundle 加载。" },
    "form.name": { en: "Dataset name", zh: "数据集名称" },
    "form.namePh": { en: "e.g. Jiangxi ramie-cloth texture supplement", zh: "例如：江西夏布纹理补充集" },
    "form.type": { en: "Type", zh: "类型" },
    "form.type.textile": { en: "ICH textile", zh: "非遗织物" },
    "form.type.texture": { en: "Public texture", zh: "公开纹理" },
    "form.type.apparel": { en: "Apparel attributes", zh: "服饰属性" },
    "form.type.collection": { en: "Collection record", zh: "馆藏记录" },
    "form.type.inheritor": { en: "Inheritor-authorized sample", zh: "传承人授权样本" },
    "form.volume": { en: "Volume", zh: "规模" },
    "form.source": { en: "Source / URL", zh: "来源 / URL" },
    "form.sourcePh": { en: "Institution, public dataset or collection batch", zh: "机构、公开数据集或采集批次" },
    "form.submit": { en: "Add and record in audit log", zh: "新增并写入审计日志" },
    "dataset.list": { en: "Datasets", zh: "数据集清单" },
    "dataset.showArchived": { en: "Show archived", zh: "显示归档" },
    "dataset.listAria": { en: "Draggable dataset list", zh: "可拖拽数据集列表" },
    "stats.manifest": { en: "Manifest records", zh: "Manifest 记录" },
    "stats.blocked": { en: "Rights blocked", zh: "Rights 阻止" },
    "stats.archived": { en: "Archived", zh: "归档记录" },
    "empty.datasets": { en: "No datasets to show.", zh: "暂无可显示数据集。" },
    "btn.add": { en: "Add", zh: "加入" },
    "btn.archive": { en: "Archive", zh: "归档" },
    "btn.restore": { en: "Restore", zh: "恢复" },
    "ds.volumeTbd": { en: "To be counted", zh: "待统计" },
    "ds.ownerTbd": { en: "Institution or rights holder to be registered", zh: "待登记机构或权利人" },
    "ds.analysisNew": { en: "New dataset: add the collection batch, authorization files, annotation fields, train/eval split and expert-review records.", zh: "新建数据集需要补充采集批次、授权文件、标注字段、训练/评测划分与专家复核记录。" },
    "ds.uncategorized": { en: "Uncategorized", zh: "未分类" },
    "ds.analysisTbd": { en: "Analysis pending.", zh: "待补充分析。" },

    // Board
    "board.title": { en: "My research board", zh: "我的数据板" },
    "board.desc": { en: "Datasets placed on the board go through split, rights, KG and validation checks.", zh: "将候选数据放入研究板后，同步进入 split、rights、KG 与 validation 检查。" },
    "board.modeAria": { en: "Dimension mode", zh: "维度模式" },
    "board.drop": { en: "Drop a dataset", zh: "拖入数据集" },
    "board.dropSub": { en: "Drop dataset here · add it to the current board", zh: "Drop dataset here · 加入当前研究板" },
    "empty.board": { en: "Drag a dataset in from the list; an add_to_board audit entry is recorded.", zh: "从左侧拖入数据集后，系统会记录 add_to_board 审计日志。" },
    "aria.removeFromBoard": { en: "Remove {name} from the board", zh: "从研究板移除 {name}" },
    "btn.remove": { en: "Remove", zh: "移出" },
    "board.removeTitle": { en: "Removes it from the board only; the manifest record is unaffected", zh: "仅从研究板移除，不影响 manifest 记录" },
    "split.empty": { en: "No datasets in {title}", zh: "暂无 {title}" },
    "split.title": { en: "Train / eval / holdout governance", zh: "训练集 / 评测集 / Holdout 治理" },
    "split.desc": { en: "A move that would share an object_id, event_id, capture_session_id or duplicate group between train and eval is refused; the eval set can be locked.", zh: "若移动会使训练集与评测集共享 object_id、event_id、capture_session_id 或重复组，则拒绝移动；评测集可锁定。" },
    "split.lock": { en: "Lock eval set", zh: "锁定评测集" },
    "split.train": { en: "Train", zh: "训练集" },
    "split.trainHint": { en: "Used for model training", zh: "用于模型学习" },
    "split.eval": { en: "Eval", zh: "评测集" },
    "split.evalHint": { en: "Not editable once locked", zh: "锁定后不可随意修改" },
    "split.holdout": { en: "Holdout", zh: "Holdout" },
    "split.holdoutHint": { en: "Pending review / restricted data", zh: "待复核 / 受限数据" },
    "split.newNote": { en: "New datasets go to holdout by default.", zh: "新建数据默认进入 holdout。" },
    "split.newNoteGate": { en: "New datasets go to holdout by default and are assigned after the Rights Gate passes.", zh: "新建数据默认进入 holdout，待 Rights Gate 通过后再分配。" },
    "viewer.aria": { en: "Data preview", zh: "数据实现预览" },
    "gallery.title": { en: "Authentic source evidence images", zh: "真实原始证据图像" },
    "gallery.desc": { en: "Shows only real image files with source_file_present: true (no CSS mockups, no placeholders).", zh: "仅显示 source_file_present: true 且为图片格式的真实文件（非CSS示意图、非占位符）。" },
    "empty.gallery": { en: "This dataset has no real source image files to display (source_file_present: true and an image format).", zh: "此数据集暂无可显示的真实原始图像文件（source_file_present: true 且为图片格式）。" },
    "reuse.title": { en: "Data reuse layers", zh: "数据复用图标" },
    "reuse.desc": { en: "Reuse layers are linked to the Rights Gate and evidence status.", zh: "复用层与 Rights Gate、证据状态联动。" },
    "empty.reuse": { en: "Select at least one reuse layer.", zh: "请选择至少一个复用层。" },
    "empty.selected": { en: "Select or drop a dataset.", zh: "请选择或拖入一个数据集。" },
    "tag.noReuse": { en: "No reuse layer selected", zh: "未选择复用层" },
    "reuse.semantic": { en: "ICH semantics", zh: "非遗语义" },
    "reuse.semanticHint": { en: "Concepts / context", zh: "概念 / 语境" },
    "reuse.semanticPurpose": { en: "Concept explanation, contextual constraints, KG-RAG prompt enhancement", zh: "概念解释、语境约束、KG-RAG提示增强" },
    "reuse.history": { en: "Symbolism & history", zh: "象征及历史" },
    "reuse.historyHint": { en: "Sources / narrative", zh: "来源 / 叙事" },
    "reuse.historyPurpose": { en: "Symbolic origins, regional narrative, historical-context review", zh: "象征来源、地域叙事、历史语境复核" },
    "reuse.appearance": { en: "ICH appearance", zh: "非遗外观" },
    "reuse.appearanceHint": { en: "Texture / pattern / form", zh: "质感 / 纹样 / 形态" },
    "reuse.appearancePurpose": { en: "Texture, material, pattern, form, 2D/2.5D/3D preview", zh: "质感、材质、纹样、形态、2D/2.5D/3D preview" },
    "reuse.inheritor": { en: "ICH inheritors", zh: "非遗传承人" },
    "reuse.inheritorHint": { en: "Subject / consent", zh: "主体 / 授权" },
    "reuse.inheritorPurpose": { en: "Inheritor narratives, portraits, interviews and agency", zh: "传承人叙述、肖像、访谈与主体性说明" },
    "reuse.rights": { en: "Rights compliance", zh: "权利合规" },
    "reuse.rightsHint": { en: "Authorization / risk", zh: "授权 / 风险" },
    "reuse.rightsPurpose": { en: "Permission scope, evidence files, audit log and export constraints", zh: "授权范围、证据文件、审计日志与导出约束" },

    // Alerts and confirmations
    "alert.evalLocked": { en: "The eval set is locked. To change it, first create a new split version in the research record.", zh: "评测集已锁定。若要修改，请先在研究记录中创建新的 split 版本。" },
    "alert.splitLeakage": { en: "This move would put the same object, collection event, capture session or duplicate group in both train and eval ({detail}). The split was not changed.", zh: "此操作会使同一对象、采集事件、拍摄场次或重复组同时出现在训练集和评测集中（{detail}）。分割未更改。" },
    "alert.gateBlocked": { en: "The Rights Gate has not passed, so this dataset cannot enter train or eval. Add research authorization first.", zh: "Rights Gate 未通过，不能进入训练集或评测集。请先补齐研究授权。" },
    "alert.inheritor": { en: "Inheritor-related reuse requires full consent, portrait / personal-data review and public-display permission.", zh: "传承人相关复用需要完整授权、肖像/个人信息复核与公开展示许可。" },
    "alert.genBlocked": { en: "Generation blocked: {reason}", zh: "生成被阻止：{reason}" },
    "alert.importFailed": { en: "Import failed: {message}", zh: "导入失败：{message}" },
    "confirm.reset": { en: "Reset to the initial state? This clears all local changes (added datasets, permission settings, generation runs, audit log, etc.) and cannot be undone.", zh: "确定要重置为初始状态吗？此操作将清除所有本地更改（新增数据集、权限设置、生成实验记录、审计日志等），且无法撤销。" },

    // Rights Gate
    "gate.blocked": { en: "Blocked", zh: "阻止" },
    "gate.conditional": { en: "Conditional", zh: "证据条件通过" },
    "gate.pass": { en: "Evidence passed", zh: "证据通过" },
    "gate.reason.noRecord": { en: "No rights record", zh: "缺少权利记录" },
    "gate.reason.noAuthentic": { en: "No authentic rights evidence file (verified, with the real file present — not a placeholder)", zh: "没有 authentic 权利证据文件（已验证且真实文件存在，非 placeholder）" },
    "gate.reason.markedBlocked": { en: "Rights Gate is marked blocked", zh: "Rights Gate 标记为 blocked" },
    "gate.reason.noResearch": { en: "Research use is not granted in both the record and an authentic rights file", zh: "权利记录与 authentic 权利文件未同时授予 research 使用范围" },
    "gate.reason.expired": { en: "The rights record has expired", zh: "权利记录已过期" },
    "gate.reason.noConsent": { en: "Required consent is not backed by an authentic evidence file", zh: "所需同意书没有 authentic evidence file 支撑" },
    "gate.reason.sensitiveReview": { en: "Cultural-sensitivity review is still required", zh: "仍需文化敏感性审查" },
    "gate.reason.expiryUnresolved": { en: "The rights record has no valid expiry date (expected YYYY-MM-DD or not_applicable)", zh: "权利记录没有有效的到期日期（应为 YYYY-MM-DD 或 not_applicable）" },
    "gate.reason.sensitiveUnknown": { en: "Cultural-sensitivity status is missing or not recognised", zh: "文化敏感性状态缺失或无法识别" },
    "gate.reason.conditional": { en: "Research evidence available; publication / demo evidence insufficient", zh: "研究证据可用；公开发布/演示证据不足" },
    "gate.reason.pass": { en: "Permission scope matches the authentic evidence files", zh: "权利范围与 authentic evidence file 一致" },

    // Governance pane
    "gov.waiting": { en: "Waiting for a dataset", zh: "等待数据集" },
    "gov.ontology": { en: "Ontology fields", zh: "Ontology 字段" },
    "empty.rights": { en: "No rights record.", zh: "暂无权利记录。" },
    "empty.audit": { en: "No audit entries yet.", zh: "暂无审计日志。" },
    "empty.graph": { en: "No graph yet.", zh: "暂无图谱。" },
    "empty.kg": { en: "No KG claims yet.", zh: "暂无 KG claims。" },

    // Generation Lab
    "gen.title": { en: "ICH Generation Lab", zh: "非遗生成实验室" },
    "gen.desc": { en: "Turns the board, reuse layers, ontology / KG and the Rights Gate into auditable text-to-image / image-to-image experiment records.", zh: "将数据板、复用层、Ontology / KG 与 Rights Gate 转换为可审计的 text-to-image / image-to-image 实验记录。" },
    "gen.context": { en: "Current research context", zh: "当前研究上下文" },
    "gen.mode": { en: "Generation mode", zh: "生成模式" },
    "gen.backend": { en: "Image backend", zh: "图像后端" },
    "gen.model": { en: "Model / workflow", zh: "模型 / workflow" },
    "gen.endpoint": { en: "Image generation endpoint", zh: "图像生成端点" },
    "gen.endpointPh": { en: "http://127.0.0.1:8188 or your own Diffusers API", zh: "http://127.0.0.1:8188 或自建 Diffusers API" },
    "gen.llm": { en: "vLLM / VLM prompt-enhancement endpoint", zh: "vLLM / VLM 提示增强端点" },
    "gen.promptPh": { en: "Build a reproducible experiment prompt from the current dataset, reuse layers and KG", zh: "根据当前数据集、复用层与 KG 生成可复现实验 prompt" },
    "gen.seedPh": { en: "Fixed random seed", zh: "固定随机种子" },
    "gen.inputHash": { en: "Input image hash", zh: "输入图像 hash" },
    "gen.inputHashPh": { en: "sha256:... required for image-to-image", zh: "sha256:... image-to-image 时必填" },
    "gen.buildPrompt": { en: "Build prompt from KG", zh: "从 KG 生成 Prompt" },
    "gen.run": { en: "Generate / write manifest", zh: "生成 / 写入 Manifest" },
    "gen.preview": { en: "Output preview", zh: "输出预览" },
    "gen.history": { en: "Generation manifest records", zh: "生成 Manifest 记录" },
    "gen.historyTag": { en: "Reproducible · auditable · exportable", zh: "可复现 · 可审计 · 可导出" },
    "empty.runs": { en: "No generation runs yet. Configure an endpoint or write a dry-run manifest directly.", zh: "尚无生成记录。配置端点或直接写入 dry-run manifest。" },
    "gen.aiBadge": { en: "AI-GENERATED — NOT AN AUTHENTIC ARTIFACT", zh: "AI 生成 · 非真实文物 / AI-GENERATED — NOT AN AUTHENTIC ARTIFACT" },
    "gen.state.noDataset": { en: "No dataset", zh: "无数据集" },
    "gen.state.noDatasetReason": { en: "No dataset selected for generation", zh: "没有选择可生成的数据集" },
    "gen.state.blocked": { en: "Generation blocked", zh: "阻止生成" },
    "gen.state.noDerivativeReason": { en: "Derivative use is not granted; image-to-image modes and reuse layers that copy the source are refused", zh: "未获得 derivative 授权；拒绝 image-to-image 模式及复制源数据的复用层" },
    "gen.state.sensitiveReason": { en: "Cultural-sensitivity review is pending or unrecorded; generation waits for the review", zh: "文化敏感性审查待定或未记录；生成需等待审查" },
    "gen.state.conditional": { en: "Conditional generation", zh: "条件生成" },
    "gen.state.pass": { en: "Generation allowed", zh: "可生成" },
    "gen.state.passReason": { en: "Rights Gate and reuse-layer constraints allow generation experiments", zh: "Rights Gate 与复用层约束允许生成实验" },
    "gen.msg.noBackend": { en: "No image backend configured; a reproducible experiment manifest was written.", zh: "未配置图像后端；已写入可复现实验 manifest。" },
    "gen.msg.ok": { en: "Image backend returned success.", zh: "图像后端返回成功。" },
    "gen.msg.http": { en: "Backend returned HTTP {status}.", zh: "后端返回 HTTP {status}。" },
    "gen.msg.unreachable": { en: "Endpoint unreachable or blocked by CORS; the failed manifest was kept.", zh: "端点不可达或被 CORS 阻止；已保留失败 manifest。" },

    // Prompt template (Generation Lab "Build prompt from KG")
    "prompt.noDataset": { en: "Select a dataset to build a prompt.", zh: "请选择数据集后生成 prompt。" },
    "prompt.noClaim": { en: "No KG claims", zh: "暂无 KG claim" },
    "prompt.layerItem": { en: "{label} ({purpose})", zh: "{label}（{purpose}）" },
    "prompt.sep": { en: "; ", zh: "；" },
    "prompt.task": { en: "Research task: generate traceable image sketches from Jiangxi intangible cultural heritage visual data for design-research validation.", zh: "研究任务：围绕江西省非物质文化遗产视觉数据，生成用于设计研究验证的可追溯图像草图。" },
    "prompt.dataset": { en: "Dataset: {name}; category: {category}; version: {version}; split: {split}.", zh: "数据集：{name}；类别：{category}；版本：{version}；split：{split}。" },
    "prompt.layers": { en: "Reuse layers: {layers}.", zh: "复用层：{layers}。" },
    "prompt.kg": { en: "Ontology / KG constraints: {ontology}; KG claims: {claims}.", zh: "Ontology / KG 约束：{ontology}；KG claims：{claims}。" },
    "prompt.visual": { en: "Visual requirements: emphasize authentic material, texture density, pattern structure, handcraft traces and regional context; avoid decorative rewrites detached from the ICH source.", zh: "视觉要求：强调真实材质、纹理密度、纹样结构、手工痕迹与地域语境；避免脱离非遗来源的装饰化改写。" },
    "prompt.rights": { en: "Compliance boundary: {label}; {reason}; do not generate unauthorized portraits, institutional logos, or images that could be mistaken for real collection objects.", zh: "合规边界：{label}；{reason}；不得生成未授权肖像、机构标志或可误导为真实馆藏的图像。" },
    "prompt.output": { en: "Output: keep the experiment reproducible; record model_id, workflow_hash, prompt_hash, seed, input_image_hash and output_hash.", zh: "输出：保持论文实验可复现，记录 model_id、workflow_hash、prompt_hash、seed、input_image_hash 与 output_hash。" },
  };

  function readSavedLang() {
    try {
      const saved = root.localStorage && root.localStorage.getItem(LANG_KEY);
      return SUPPORTED.includes(saved) ? saved : "en";
    } catch (error) {
      return "en";
    }
  }

  let current = readSavedLang();

  function t(key, params) {
    const entry = STRINGS[key];
    let text = entry ? (entry[current] ?? entry.en) : key;
    if (params) text = text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
    return text;
  }

  function getLang() {
    return current;
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    current = lang;
    try { root.localStorage && root.localStorage.setItem(LANG_KEY, lang); } catch (error) { /* preference is optional */ }
  }

  function applyStatic(doc) {
    if (!doc) return;
    doc.documentElement.lang = current === "zh" ? "zh-CN" : "en";
    doc.title = t("app.title");
    doc.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    doc.querySelectorAll("[data-i18n-placeholder]").forEach((el) => { el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder)); });
    doc.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }

  const api = { t, getLang, setLang, applyStatic, STRINGS, SUPPORTED };
  root.JXICH_I18N = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
