const CURRENT_USER_KEY = "pinprompt.currentUser";
const USERS_KEY = "pinprompt.users";
const PROMPTS_KEY = "pinprompt.prompts";
const PROJECTS_KEY = "pinprompt.projects";
const WORKFLOWS_KEY = "pinprompt.workflows";
const FRAGMENTS_KEY = "pinprompt.fragments";
const SETTINGS_KEY = "pinprompt.settings";
const MIGRATION_DONE_KEY = "pinprompt.migration.v1.done";
const LEGACY_PROMPTS_KEY = "promptvault_v5";
const LEGACY_PROJECTS_KEY = "promptvault_projects_v1";
const LEGACY_THEME_KEY = "promptvault_theme";

export const PLATFORM_OPTIONS = [
  "通用版",
  "即梦",
  "可灵",
  "Lovart",
  "Liblib",
  "Seedance",
  "Nano Banana",
  "GPT Image",
];

export const FRAGMENT_CATEGORY_OPTIONS = [
  { id: "subject", label: "主体" },
  { id: "scene", label: "场景" },
  { id: "style", label: "风格" },
  { id: "camera", label: "镜头" },
  { id: "lighting", label: "光影" },
  { id: "color", label: "色彩" },
  { id: "texture", label: "材质" },
  { id: "action", label: "动作" },
  { id: "negative", label: "负面词" },
  { id: "parameter", label: "平台参数" },
];

export const TYPE_OPTIONS = [
  { id: "all", label: "全部" },
  { id: "image", label: "图片" },
  { id: "video", label: "视频" },
  { id: "text", label: "文本" },
  { id: "workflow", label: "工作流" },
];

const DEFAULT_USER = {
  id: "user_local_owner",
  name: "Calvin",
  email: "982622401@qq.com",
  role: "owner",
  plan: "free",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const VARIABLE_LABEL_MAP = {
  scene: "场景",
  style: "风格",
  duration: "时长",
  subject: "主体",
  platform: "目标平台",
  theme: "主题",
  camera: "镜头",
  product: "产品",
  topic: "主题",
};

const DEFAULT_PROJECTS = [
  {
    id: "proj_brand_campaign",
    name: "汽车广告片",
    desc: "可灵转场与 Seedance 氛围镜头",
    color: "#ef4444",
    status: "active",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: "proj_portrait_lab",
    name: "人像修图实验",
    desc: "Nano Banana 与 GPT Image 修图流程",
    color: "#22c55e",
    status: "active",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 10,
  },
  {
    id: "proj_storyboard",
    name: "九宫格分镜",
    desc: "文生分镜与工作流模板",
    color: "#8b5cf6",
    status: "active",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 20,
  },
];

const DEFAULT_PROMPTS = [
  {
    id: "prompt_1",
    title: "汽车广告电影感镜头组",
    content:
      "以 {scene} 为主场景，拍摄一支强调速度与质感的汽车广告片。镜头语言包含低机位推进、车身反光细节、转场时的轮廓光和雨后地面反射。整体风格参考 {style}，镜头节奏适合 {duration} 秒短片输出。",
    type: "video",
    platforms: ["可灵", "Seedance"],
    taskTags: ["汽车广告", "电影感"],
    effectTags: ["转场", "速度感"],
    tags: ["汽车广告", "电影感", "转场"],
    projectIds: ["proj_brand_campaign"],
    favorite: true,
    usedCount: 18,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    variables: [
      { key: "scene", label: "场景", placeholder: "例如：雨夜高架桥" },
      { key: "style", label: "风格", placeholder: "例如：保时捷广告感" },
      { key: "duration", label: "时长", placeholder: "例如：15" },
    ],
    variants: [
      {
        platform: "可灵",
        content:
          "可灵视频提示词：主场景 {scene}，突出车身线条、速度感与反射质感，风格参考 {style}。镜头包含贴地推进、车轮飞溅、尾灯拉丝、快速转场，总时长 {duration} 秒。"
      }
    ]
  },
  {
    id: "prompt_2",
    title: "人像去油与真实皮肤修图",
    content:
      "请对输入人像进行真实感修图，保留天然肤质与皮肤微纹理。重点处理 {subject} 的油光、肤色不均与局部高光，同时不要磨皮过度。最终画面保留 {style} 的摄影氛围。",
    type: "image",
    platforms: ["Nano Banana", "GPT Image"],
    taskTags: ["人像修图"],
    effectTags: ["去油", "真实肤质"],
    tags: ["人像修图", "去油", "真实肤质"],
    projectIds: ["proj_portrait_lab"],
    favorite: true,
    usedCount: 26,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
    variables: [
      { key: "subject", label: "主体", placeholder: "例如：女模特半身近景" },
      { key: "style", label: "风格", placeholder: "例如：杂志写真感" },
    ],
    variants: [
      {
        platform: "GPT Image",
        content:
          "GPT Image 提示词：修复并增强 {subject} 的真实皮肤状态，降低油光、均衡色偏，保留毛孔和肤质细节。整体完成后呈现 {style} 的拍摄氛围。"
      }
    ]
  },
  {
    id: "prompt_3",
    title: "九宫格分镜拆解模板",
    content:
      "围绕 {theme} 生成一个 9 格分镜表，每格包含镜头编号、景别、画面动作、镜头运动、情绪目标和转场建议。最终适用于 {platform} 的图生视频前期策划。",
    type: "workflow",
    platforms: ["通用版", "即梦", "可灵"],
    taskTags: ["九宫格分镜"],
    effectTags: ["结构化", "前期策划"],
    tags: ["九宫格分镜", "工作流", "前期策划"],
    projectIds: ["proj_storyboard"],
    favorite: false,
    usedCount: 11,
    updatedAt: Date.now() - 1000 * 60 * 60 * 18,
    variables: [
      { key: "theme", label: "主题", placeholder: "例如：古城夜跑追逐" },
      { key: "platform", label: "目标平台", placeholder: "例如：可灵" },
    ]
  },
  {
    id: "prompt_4",
    title: "Liblib 电商图主视觉",
    content:
      "为 {product} 设计一张具备高质感与高级布光的电商主视觉，场景围绕 {scene} 展开，突出材质、光泽与产品卖点。整体以 {style} 作为参考。",
    type: "image",
    platforms: ["Liblib", "Lovart"],
    taskTags: ["电商图"],
    effectTags: ["主视觉", "高质感"],
    tags: ["电商图", "主视觉", "高质感"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 28,
    variables: [
      { key: "product", label: "产品", placeholder: "例如：香水瓶" },
      { key: "scene", label: "场景", placeholder: "例如：浅金色台面" },
      { key: "style", label: "风格", placeholder: "例如：法式高奢" },
    ]
  },
  {
    id: "prompt_5",
    title: "创作者视频口播开场",
    content:
      "请为 {topic} 输出一段 30 秒以内的创作者口播开场，语言风格为 {style}，要在前 3 秒抓住注意力，并清楚说明本条内容会解决什么问题。",
    type: "text",
    platforms: ["通用版", "即梦"],
    taskTags: ["口播文案"],
    effectTags: ["抓人开场"],
    tags: ["口播文案", "抓人开场"],
    projectIds: [],
    favorite: false,
    usedCount: 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 14,
    variables: [
      { key: "topic", label: "主题", placeholder: "例如：AIGC 广告制作" },
      { key: "style", label: "风格", placeholder: "例如：直接、有冲击力" },
    ]
  },
  {
    id: "prompt_6",
    title: "可灵首尾帧转场提示词",
    content:
      "请根据首帧 {firstFrame} 和尾帧 {lastFrame} 设计一段 {duration} 秒的转场视频，转场方式为 {transition}，镜头运动强调 {camera}，整体风格参考 {style}。",
    type: "video",
    platforms: ["可灵", "Seedance"],
    taskTags: ["视频转场"],
    effectTags: ["首尾帧", "运镜"],
    tags: ["视频转场", "首尾帧", "运镜"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 9,
    variables: [
      { key: "firstFrame", label: "首帧", placeholder: "例如：街头霓虹下回头的女孩" },
      { key: "lastFrame", label: "尾帧", placeholder: "例如：镜头穿出城市俯瞰夜景" },
      { key: "transition", label: "转场", placeholder: "例如：甩镜转场" },
      { key: "camera", label: "镜头", placeholder: "例如：快速推进后上摇" },
      { key: "duration", label: "时长", placeholder: "例如：6" },
      { key: "style", label: "风格", placeholder: "例如：赛博朋克电影感" },
    ],
    variants: [
      {
        platform: "可灵",
        content:
          "可灵视频提示词：首帧 {firstFrame}，尾帧 {lastFrame}，通过 {transition} 实现平滑过渡，镜头运动为 {camera}，总时长 {duration} 秒，风格 {style}。"
      },
    ],
  },
  {
    id: "prompt_7",
    title: "Seedance 高级丝滑广告大片",
    content:
      "为 {product} 生成一条高级广告大片提示词，主场景为 {scene}，强调丝滑镜头运动、流动布光和高端商业氛围，风格参考 {style}。",
    type: "video",
    platforms: ["Seedance"],
    taskTags: ["广告大片"],
    effectTags: ["丝滑", "高级感"],
    tags: ["广告大片", "高级感", "丝滑"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 5,
    variables: [
      { key: "product", label: "产品", placeholder: "例如：护肤精华" },
      { key: "scene", label: "场景", placeholder: "例如：黑金色流动空间" },
      { key: "style", label: "风格", placeholder: "例如：国际奢牌广告感" },
    ],
  },
  {
    id: "prompt_8",
    title: "Lovart 品牌海报 KV",
    content:
      "围绕 {product} 设计一张品牌 KV 海报，主体置于 {scene} 中，构图强调品牌识别和标题留白，整体视觉风格参考 {style}。",
    type: "image",
    platforms: ["Lovart"],
    taskTags: ["品牌海报"],
    effectTags: ["KV", "高级排版"],
    tags: ["品牌海报", "KV", "高级排版"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 6,
    variables: [
      { key: "product", label: "产品", placeholder: "例如：香氛系列" },
      { key: "scene", label: "场景", placeholder: "例如：暖灰极简空间" },
      { key: "style", label: "风格", placeholder: "例如：法式高级设计感" },
    ],
    variants: [
      {
        platform: "Lovart",
        content:
          "Lovart 设计提示词：围绕 {product} 输出一张品牌 KV 海报，场景为 {scene}，整体风格 {style}，需要预留主标题、副标题与 logo 区域。"
      },
    ],
  },
  {
    id: "prompt_9",
    title: "Liblib 写实人像提示词",
    content:
      "请生成一组写实人像提示词，主体为 {subject}，场景设定在 {scene}，整体风格 {style}，突出真实肤质、自然光和镜头氛围。",
    type: "image",
    platforms: ["Liblib"],
    taskTags: ["写实人像"],
    effectTags: ["自然光", "真实肤质"],
    tags: ["写实人像", "自然光", "真实肤质"],
    projectIds: ["proj_portrait_lab"],
    favorite: true,
    usedCount: 12,
    variables: [
      { key: "subject", label: "主体", placeholder: "例如：短发女生半身像" },
      { key: "scene", label: "场景", placeholder: "例如：窗边晨光" },
      { key: "style", label: "风格", placeholder: "例如：纪实电影人像" },
    ],
  },
  {
    id: "prompt_10",
    title: "Nano Banana 图片修复",
    content:
      "请修复这张老照片，保留人物原始神态与时代感，同时增强 {subject} 的细节表现，整体修复方向为 {style}，背景统一到 {scene} 的视觉氛围。",
    type: "image",
    platforms: ["Nano Banana"],
    taskTags: ["图片修复"],
    effectTags: ["老照片", "细节恢复"],
    tags: ["图片修复", "老照片", "细节恢复"],
    projectIds: ["proj_portrait_lab"],
    favorite: false,
    usedCount: 8,
    variables: [
      { key: "subject", label: "主体", placeholder: "例如：母女合照" },
      { key: "style", label: "风格", placeholder: "例如：专业影楼修复" },
      { key: "scene", label: "场景", placeholder: "例如：暖色室内环境" },
    ],
  },
  {
    id: "prompt_11",
    title: "小红书笔记生成",
    content:
      "请围绕主题 {topic} 输出一篇适合小红书发布的笔记，开头需要快速切入痛点，中段给出可执行建议，结尾带轻互动，整体语气为 {style}。",
    type: "text",
    platforms: ["通用版"],
    taskTags: ["小红书笔记"],
    effectTags: ["结构清晰", "互动感"],
    tags: ["小红书笔记", "互动感"],
    projectIds: [],
    favorite: false,
    usedCount: 13,
    variables: [
      { key: "topic", label: "主题", placeholder: "例如：AI 短片制作流程" },
      { key: "style", label: "风格", placeholder: "例如：真实分享感" },
    ],
  },
  {
    id: "prompt_12",
    title: "产品电商图提示词",
    content:
      "为 {product} 生成一张高转化电商图，置于 {scene} 中，突出产品材质、卖点和购买氛围，整体审美为 {style}。",
    type: "image",
    platforms: ["Liblib", "Lovart", "GPT Image"],
    taskTags: ["电商图"],
    effectTags: ["高转化", "卖点清晰"],
    tags: ["电商图", "高转化", "卖点清晰"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 11,
    variables: [
      { key: "product", label: "产品", placeholder: "例如：洁面慕斯" },
      { key: "scene", label: "场景", placeholder: "例如：浴室台面" },
      { key: "style", label: "风格", placeholder: "例如：清透日系商业图" },
    ],
  },
  {
    id: "prompt_13",
    title: "角色一致性提示词",
    content:
      "围绕角色 {subject} 生成一套跨场景保持一致性的提示词，确保发型、服装、脸部特征和镜头气质一致，适配 {platform} 的系列创作。",
    type: "image",
    platforms: ["即梦", "Liblib", "GPT Image"],
    taskTags: ["角色一致性"],
    effectTags: ["系列创作", "统一形象"],
    tags: ["角色一致性", "系列创作"],
    projectIds: ["proj_storyboard"],
    favorite: false,
    usedCount: 10,
    variables: [
      { key: "subject", label: "角色", placeholder: "例如：短发侦探少女" },
      { key: "platform", label: "目标平台", placeholder: "例如：即梦" },
    ],
  },
  {
    id: "prompt_14",
    title: "纪录片旁白提示词",
    content:
      "请为主题 {topic} 输出一段纪录片风格旁白，基调为 {style}，需要兼具信息感和情绪张力，适合 60 秒以内短片。",
    type: "text",
    platforms: ["通用版"],
    taskTags: ["旁白文案"],
    effectTags: ["纪录片感", "情绪张力"],
    tags: ["旁白文案", "纪录片感"],
    projectIds: [],
    favorite: false,
    usedCount: 7,
    variables: [
      { key: "topic", label: "主题", placeholder: "例如：城市夜间物流系统" },
      { key: "style", label: "风格", placeholder: "例如：克制、沉稳" },
    ],
  },
  {
    id: "prompt_15",
    title: "三维渲二维风格提示词",
    content:
      "请将 {subject} 转换为三维渲二维的风格图像，场景基于 {scene}，保留结构准确性，同时呈现 {style} 的笔触与色彩语言。",
    type: "image",
    platforms: ["即梦", "GPT Image"],
    taskTags: ["风格转换"],
    effectTags: ["三维渲二维", "插画感"],
    tags: ["风格转换", "插画感"],
    projectIds: ["proj_storyboard"],
    favorite: false,
    usedCount: 4,
    variables: [
      { key: "subject", label: "主体", placeholder: "例如：机甲少女" },
      { key: "scene", label: "场景", placeholder: "例如：海边黄昏" },
      { key: "style", label: "风格", placeholder: "例如：日漫赛璐璐质感" },
    ],
  },
  {
    id: "prompt_16",
    title: "品牌 slogan 生成",
    content:
      "请为品牌 {product} 生成 10 条 slogan，核心卖点是 {sellingPoint}，语言风格为 {style}，适合年轻化传播。",
    type: "text",
    platforms: ["通用版"],
    taskTags: ["品牌文案"],
    effectTags: ["slogan", "传播感"],
    tags: ["品牌文案", "slogan"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 5,
    variables: [
      { key: "product", label: "品牌/产品", placeholder: "例如：智能纯电 SUV" },
      { key: "sellingPoint", label: "卖点", placeholder: "例如：超长续航" },
      { key: "style", label: "风格", placeholder: "例如：简洁有记忆点" },
    ],
  },
  {
    id: "prompt_17",
    title: "视频封面标题生成",
    content:
      "请围绕主题 {topic} 生成 12 个适合短视频封面的标题，要求突出 {sellingPoint}，整体风格偏 {style}。",
    type: "text",
    platforms: ["通用版"],
    taskTags: ["封面标题"],
    effectTags: ["点击率", "信息明确"],
    tags: ["封面标题", "点击率"],
    projectIds: [],
    favorite: false,
    usedCount: 15,
    variables: [
      { key: "topic", label: "主题", placeholder: "例如：AI 视频转场教程" },
      { key: "sellingPoint", label: "核心点", placeholder: "例如：3 秒学会丝滑转场" },
      { key: "style", label: "风格", placeholder: "例如：直接冲击型" },
    ],
  },
  {
    id: "prompt_18",
    title: "分屏视频提示词",
    content:
      "请为 {topic} 设计一个双屏 / 三屏分屏视频提示词，左侧展示 {scene}，右侧展示对照内容，整体风格参考 {style}。",
    type: "video",
    platforms: ["Seedance", "可灵"],
    taskTags: ["分屏视频"],
    effectTags: ["对比结构", "节奏感"],
    tags: ["分屏视频", "节奏感"],
    projectIds: ["proj_storyboard"],
    favorite: false,
    usedCount: 6,
    variables: [
      { key: "topic", label: "主题", placeholder: "例如：改造前后对比" },
      { key: "scene", label: "场景", placeholder: "例如：城市街角" },
      { key: "style", label: "风格", placeholder: "例如：综艺快节奏" },
    ],
  },
  {
    id: "prompt_19",
    title: "AI 短片分镜提示词",
    content:
      "请围绕 {topic} 设计一组 AI 短片分镜提示词，主角为 {subject}，场景设定在 {scene}，整体情绪和风格参考 {style}。",
    type: "workflow",
    platforms: ["可灵", "即梦", "Seedance"],
    taskTags: ["AI 短片"],
    effectTags: ["分镜", "叙事连贯"],
    tags: ["AI 短片", "分镜"],
    projectIds: ["proj_storyboard"],
    favorite: false,
    usedCount: 9,
    variables: [
      { key: "topic", label: "主题", placeholder: "例如：末日城市中的信使" },
      { key: "subject", label: "主角", placeholder: "例如：戴头盔的女孩" },
      { key: "scene", label: "场景", placeholder: "例如：雾气弥漫的高楼街区" },
      { key: "style", label: "风格", placeholder: "例如：黑金科幻电影感" },
    ],
  },
  {
    id: "prompt_20",
    title: "广告复刻分析提示词",
    content:
      "请拆解广告案例 {subject} 的视觉语言，分析其镜头、布光、色彩、节奏与品牌表达方式，并给出适合 {platform} 复刻的执行建议。",
    type: "text",
    platforms: ["通用版", "Lovart", "可灵"],
    taskTags: ["案例拆解"],
    effectTags: ["复刻分析", "执行建议"],
    tags: ["案例拆解", "复刻分析"],
    projectIds: ["proj_brand_campaign"],
    favorite: false,
    usedCount: 3,
    variables: [
      { key: "subject", label: "案例", placeholder: "例如：苹果新品广告" },
      { key: "platform", label: "目标平台", placeholder: "例如：可灵" },
    ],
  },
];

const DEFAULT_WORKFLOWS = [
  {
    id: "workflow_car_ad",
    title: "汽车广告片工作流",
    description: "从产品卖点到分镜、图片提示词、视频提示词和封面文案。",
    platforms: ["可灵", "即梦", "Seedance"],
    tags: ["汽车广告", "分镜", "商业大片"],
    usedCount: 12,
    favorite: true,
    variables: [
      { key: "product", label: "产品名称", placeholder: "例如：新能源轿跑" },
      { key: "sellingPoint", label: "核心卖点", placeholder: "例如：零百加速 3.8 秒" },
      { key: "scene", label: "主要场景", placeholder: "例如：雨夜高架桥" },
      { key: "style", label: "视觉风格", placeholder: "例如：保时捷广告感" },
      { key: "platform", label: "目标平台", placeholder: "例如：可灵" },
      { key: "duration", label: "视频时长", placeholder: "例如：15" },
    ],
    steps: [
      {
        id: "step_1",
        order: 1,
        title: "产品卖点拆解",
        description: "先把产品亮点翻译成可用于创意表达的语言。",
        promptTemplate:
          "请围绕产品 {product} 的核心卖点 {sellingPoint}，拆解出 5 个适合广告片表达的视觉信息点，并说明每个信息点适合放在什么镜头里。",
      },
      {
        id: "step_2",
        order: 2,
        title: "九宫格分镜",
        description: "把广告片拆成 9 个镜头节点。",
        promptTemplate:
          "请以 {product} 为主角，在 {scene} 中设计一个 9 格广告分镜。整体风格参考 {style}，每格包含画面描述、景别、动作和转场建议。",
      },
      {
        id: "step_3",
        order: 3,
        title: "图片生成提示词",
        description: "先生成关键帧静态画面。",
        promptTemplate:
          "为 {product} 生成一组高质感关键帧图片提示词，主场景是 {scene}，强调 {sellingPoint}，整体风格参考 {style}，适合 {platform} 的首帧设计。",
      },
      {
        id: "step_4",
        order: 4,
        title: "视频生成提示词",
        description: "生成最终视频主提示词。",
        promptTemplate:
          "请输出适用于 {platform} 的视频提示词：主角为 {product}，场景 {scene}，突出 {sellingPoint}，整体风格 {style}，总时长 {duration} 秒，镜头语言强调速度感和高级光影。",
      },
      {
        id: "step_5",
        order: 5,
        title: "封面标题与小红书文案",
        description: "补齐发布物料。",
        promptTemplate:
          "请基于 {product}、{sellingPoint} 和 {style}，输出 3 个封面标题和 1 条适合小红书发布的广告文案，文案需要呼应 {scene} 的氛围。",
      },
    ],
  },
  {
    id: "workflow_portrait_retouch",
    title: "人像修图工作流",
    description: "从基础分析到商业大片输出的人像修图链路。",
    platforms: ["Nano Banana", "GPT Image"],
    tags: ["人像修图", "商业大片", "真实质感"],
    usedCount: 8,
    favorite: false,
    variables: [
      { key: "subject", label: "人物主体", placeholder: "例如：女性半身近景" },
      { key: "skinTexture", label: "皮肤质感", placeholder: "例如：真实毛孔与细腻肤质" },
      { key: "style", label: "修图风格", placeholder: "例如：高级杂志大片" },
      { key: "background", label: "背景", placeholder: "例如：灰白棚拍背景" },
      { key: "platform", label: "目标平台", placeholder: "例如：GPT Image" },
    ],
    steps: [
      {
        id: "step_1",
        order: 1,
        title: "人像基础分析",
        description: "先分析当前素材问题。",
        promptTemplate:
          "请分析 {subject} 当前人像素材中需要优化的部分，重点关注肤色、油光、瑕疵、背景协调度与整体气质，输出结构化建议。",
      },
      {
        id: "step_2",
        order: 2,
        title: "面部去油",
        description: "处理过强油光。",
        promptTemplate:
          "请为 {platform} 生成去油提示词，针对 {subject} 的面部高光进行控制，保留真实皮肤纹理，不做过度磨皮。",
      },
      {
        id: "step_3",
        order: 3,
        title: "真实皮肤质感增强",
        description: "保留真实质感。",
        promptTemplate:
          "请增强 {subject} 的 {skinTexture}，恢复毛孔、微纹理与肤色层次，让人物更接近 {style} 的高级肖像质感。",
      },
      {
        id: "step_4",
        order: 4,
        title: "光影与背景统一",
        description: "统一主体与场景。",
        promptTemplate:
          "请统一 {subject} 与 {background} 的光影方向与色调，使整体照片更自然一致，并保持 {style} 的视觉气质。",
      },
      {
        id: "step_5",
        order: 5,
        title: "商业大片化输出",
        description: "输出最终商业大片版本。",
        promptTemplate:
          "请输出最终商业大片修图提示词：主体 {subject}，皮肤质感 {skinTexture}，背景 {background}，整体风格 {style}，适用于 {platform}。",
      },
    ],
  },
  {
    id: "workflow_storyboard",
    title: "九宫格分镜工作流",
    description: "从创意主题拆解到镜头、运镜和发布文案的一整套模板。",
    platforms: ["即梦", "可灵"],
    tags: ["九宫格分镜", "图生视频", "前期策划"],
    usedCount: 10,
    favorite: true,
    variables: [
      { key: "topic", label: "创作主题", placeholder: "例如：古城夜跑追逐" },
      { key: "character", label: "角色", placeholder: "例如：年轻女特工" },
      { key: "scene", label: "场景", placeholder: "例如：雨后古城街巷" },
      { key: "mood", label: "情绪", placeholder: "例如：紧张、神秘" },
      { key: "platform", label: "目标平台", placeholder: "例如：即梦" },
    ],
    steps: [
      {
        id: "step_1",
        order: 1,
        title: "创意主题拆解",
        promptTemplate:
          "请围绕主题 {topic}、角色 {character}、场景 {scene} 与情绪 {mood}，拆解出适合做短视频分镜的核心叙事结构。",
      },
      {
        id: "step_2",
        order: 2,
        title: "生成 9 个镜头描述",
        promptTemplate:
          "请基于 {topic} 输出 9 个连续镜头描述，每个镜头都要明确角色动作、景别、光线和情绪变化。",
      },
      {
        id: "step_3",
        order: 3,
        title: "每格画面提示词",
        promptTemplate:
          "请为这组 9 格分镜生成图片提示词，突出 {character}、{scene} 和 {mood} 的视觉一致性，适合 {platform}。",
      },
      {
        id: "step_4",
        order: 4,
        title: "视频运镜提示词",
        promptTemplate:
          "请将 9 格分镜进一步转成适用于 {platform} 的视频运镜提示词，要求镜头运动具有节奏和层次。",
      },
      {
        id: "step_5",
        order: 5,
        title: "最终发布文案",
        promptTemplate:
          "请围绕主题 {topic} 与角色 {character}，生成一条短视频发布文案，呼应 {mood} 的情绪氛围。",
      },
    ],
  },
  {
    id: "workflow_transition_video",
    title: "可灵 / Seedance 视频转场工作流",
    description: "围绕首尾帧、转场动作与运镜设计的视频转场模板。",
    platforms: ["可灵", "Seedance"],
    tags: ["视频转场", "首尾帧", "运镜"],
    usedCount: 6,
    favorite: false,
    variables: [
      { key: "firstFrame", label: "首帧", placeholder: "例如：街头抬头望向霓虹灯的女孩" },
      { key: "lastFrame", label: "尾帧", placeholder: "例如：高速俯冲穿过城市的镜头" },
      { key: "transition", label: "转场方式", placeholder: "例如：甩镜转场" },
      { key: "camera", label: "镜头运动", placeholder: "例如：快速推进后上摇" },
      { key: "duration", label: "时长", placeholder: "例如：6" },
      { key: "style", label: "风格", placeholder: "例如：赛博朋克电影感" },
    ],
    steps: [
      {
        id: "step_1",
        order: 1,
        title: "首帧描述",
        promptTemplate:
          "请根据首帧设定 {firstFrame}，输出一条适合做视频起始帧的高质量描述，整体风格为 {style}。",
      },
      {
        id: "step_2",
        order: 2,
        title: "尾帧描述",
        promptTemplate:
          "请根据尾帧设定 {lastFrame}，输出一条适合做视频结束帧的高质量描述，整体风格为 {style}。",
      },
      {
        id: "step_3",
        order: 3,
        title: "转场动作设计",
        promptTemplate:
          "请设计从首帧 {firstFrame} 到尾帧 {lastFrame} 的 {transition} 转场方案，要求动作自然，画面连贯。",
      },
      {
        id: "step_4",
        order: 4,
        title: "运镜提示词",
        promptTemplate:
          "请输出镜头运动提示词：采用 {camera} 的运动方式，转场为 {transition}，整体风格 {style}，时长 {duration} 秒。",
      },
      {
        id: "step_5",
        order: 5,
        title: "最终视频提示词",
        promptTemplate:
          "请组合首帧 {firstFrame}、尾帧 {lastFrame}、转场 {transition}、镜头运动 {camera}、风格 {style} 与时长 {duration} 秒，输出适用于可灵 / Seedance 的完整视频提示词。",
      },
    ],
  },
];

const DEFAULT_FRAGMENTS = [
  {
    id: "fragment_style_1",
    title: "电影级广告感",
    content: "电影级光影，真实摄影质感，浅景深，高级广告片风格",
    category: "style",
    platforms: ["即梦", "可灵", "Seedance", "GPT Image"],
    tags: ["电影感", "广告感"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_style_2",
    title: "三维渲二维",
    content: "三维渲二维质感，写实卡通化风格，电影级光影",
    category: "style",
    platforms: ["即梦", "GPT Image"],
    tags: ["风格化", "插画感"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_camera_1",
    title: "低机位推进",
    content: "低机位推进镜头，主体从画面中央穿过，背景形成速度拖影",
    category: "camera",
    platforms: ["可灵", "Seedance"],
    tags: ["推进", "速度感"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_camera_2",
    title: "缓慢环绕",
    content: "缓慢环绕镜头，保持主体稳定，突出空间层次和光影变化",
    category: "camera",
    platforms: ["可灵", "Seedance"],
    tags: ["环绕", "层次感"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_negative_1",
    title: "常用负面词",
    content: "避免畸形手指、错误面部结构、塑料皮肤、过度磨皮、低清晰度、水印、错误文字",
    category: "negative",
    platforms: ["Liblib", "即梦", "GPT Image"],
    tags: ["负面词", "清晰度"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_subject_1",
    title: "都市女主角",
    content: "短发都市女性，眼神坚定，轻微风吹发丝，真实五官结构",
    category: "subject",
    platforms: ["即梦", "Liblib", "GPT Image"],
    tags: ["女性", "都市"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_scene_1",
    title: "雨夜高架桥",
    content: "雨夜高架桥，地面有反射积水，霓虹灯与车灯交错",
    category: "scene",
    platforms: ["可灵", "Seedance", "即梦"],
    tags: ["夜景", "都市"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "fragment_parameter_1",
    title: "Liblib 建议参数",
    content: "画幅 16:9，风格强度中等，细节层级增强",
    category: "parameter",
    platforms: ["Liblib"],
    tags: ["参数", "Liblib"],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function ensureThemeSeed() {
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme: "light" }));
  }
  if (!localStorage.getItem(LEGACY_THEME_KEY)) {
    localStorage.setItem(LEGACY_THEME_KEY, "light");
  }
}

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeReadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeParseAny(keys, fallback) {
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      continue;
    }
  }
  return fallback;
}

function normalizeType(type, category) {
  const raw = String(type || category || "").toLowerCase();
  if (["image", "img"].includes(raw)) return "image";
  if (["video", "vid"].includes(raw)) return "video";
  if (["text", "txt"].includes(raw)) return "text";
  if (["voice", "music", "workflow"].includes(raw)) return "workflow";
  return "text";
}

function humanizeVariableLabel(key) {
  return VARIABLE_LABEL_MAP[key] || key;
}

function createUserId(seed = "user") {
  return `${seed}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeUser(userLike) {
  if (!userLike || typeof userLike !== "object") return null;
  const name =
    userLike.name ||
    userLike.full_name ||
    userLike.username ||
    userLike.user_metadata?.name ||
    userLike.user_metadata?.full_name ||
    (typeof userLike.email === "string" ? userLike.email.split("@")[0] : "") ||
    "PinPrompt 用户";

  return {
    id: String(userLike.id || userLike.user_id || createUserId("user")),
    name: String(name),
    email: userLike.email ? String(userLike.email) : "",
    avatar:
      userLike.avatar ||
      userLike.avatar_url ||
      userLike.user_metadata?.avatar_url ||
      "",
    role: userLike.role === "member" ? "member" : "owner",
    plan: userLike.plan === "pro" ? "pro" : "free",
    createdAt: new Date(userLike.createdAt || userLike.created_at || Date.now()).toISOString(),
    updatedAt: new Date(userLike.updatedAt || userLike.updated_at || Date.now()).toISOString(),
  };
}

export function extractVariableKeys(content) {
  if (!content) return [];
  const matches = Array.from(String(content).matchAll(/{{\s*([\w.-]+)\s*}}|{\s*([\w.-]+)\s*}/g));
  return Array.from(
    new Set(
      matches
        .map((match) => match[1] || match[2] || "")
        .map((key) => key.trim())
        .filter(Boolean)
    )
  );
}

function normalizePlatforms(platforms) {
  if (!platforms) return [];
  if (Array.isArray(platforms)) {
    return platforms.filter(Boolean).map(String);
  }
  if (typeof platforms === "string") {
    return platforms
      .split(/[，,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeVariables(variables) {
  if (!Array.isArray(variables)) return [];
  return variables
    .map((item, index) => {
      if (typeof item === "string") {
        const clean = item.replace(/[{}]/g, "").trim();
        return {
          key: clean || `var_${index + 1}`,
          label: humanizeVariableLabel(clean) || `变量 ${index + 1}`,
          placeholder: "",
        };
      }
      if (item && typeof item === "object") {
        return {
          key: item.key || item.name || `var_${index + 1}`,
          label:
            item.label ||
            item.name ||
            humanizeVariableLabel(item.key || item.name || "") ||
            `变量 ${index + 1}`,
          defaultValue: item.defaultValue || "",
          placeholder: item.placeholder || "",
        };
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeVariants(variants) {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((variant) => ({
      platform: String(variant?.platform || "").trim(),
      content: String(variant?.content || "").trim(),
    }))
    .filter((variant) => variant.platform && variant.content);
}

export function inferVariableDefinitions(promptLike = {}) {
  const explicit = normalizeVariables(promptLike.variables);
  const explicitMap = new Map(explicit.map((item) => [item.key, item]));
  const extractedKeys = Array.from(
    new Set([
      ...extractVariableKeys(promptLike.content),
      ...(promptLike.variants || []).flatMap((variant) => extractVariableKeys(variant?.content)),
      ...(promptLike.steps || []).flatMap((step) => extractVariableKeys(step?.promptTemplate)),
    ])
  );

  extractedKeys.forEach((key) => {
    if (!explicitMap.has(key)) {
      explicitMap.set(key, {
        key,
        label: humanizeVariableLabel(key),
        defaultValue: "",
        placeholder: "",
      });
    }
  });

  return Array.from(explicitMap.values());
}

export function resolveVariantContent(prompt, platform) {
  if (!prompt) return "";
  const variant = (prompt.variants || []).find((item) => item.platform === platform);
  return variant?.content || prompt.content || "";
}

export function getVariableFieldsForContent(prompt, content) {
  const inferred = inferVariableDefinitions(prompt);
  const extractedKeys = extractVariableKeys(content);

  if (!extractedKeys.length) {
    return inferred;
  }

  const inferredMap = new Map(inferred.map((item) => [item.key, item]));
  return extractedKeys.map((key) => {
    const existing = inferredMap.get(key);
    return (
      existing || {
        key,
        label: humanizeVariableLabel(key),
        defaultValue: "",
        placeholder: "",
      }
    );
  });
}

function normalizeProject(project, index) {
  const fallbackColors = ["#ec4899", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"];
  return {
    id: project?.id || `project_${index + 1}`,
    name: project?.name || `项目 ${index + 1}`,
    desc: project?.desc || project?.description || "",
    color: project?.color || fallbackColors[index % fallbackColors.length],
    status: ["active", "done", "archived"].includes(project?.status) ? project.status : "active",
    promptCount: Number(project?.promptCount || 0),
    workflowCount: Number(project?.workflowCount || 0),
    createdAt: Number(project?.createdAt || Date.now()),
    updatedAt: Number(project?.updatedAt || Date.now()),
  };
}

function normalizePrompt(prompt, index, userId = "") {
  const variants = normalizeVariants(prompt?.variants);
  const platforms = Array.from(
    new Set([
      ...normalizePlatforms(prompt?.platforms),
      ...variants.map((variant) => variant.platform),
    ])
  );
  const type = normalizeType(prompt?.type, prompt?.category);
  const normalizedVariables = inferVariableDefinitions({
    ...prompt,
    variants,
    variables: normalizeVariables(prompt?.variables),
  });
  return {
    id: prompt?.id || `prompt_${index + 1}`,
    title: prompt?.title || "未命名提示词",
    content: prompt?.content || "",
    type,
    platforms: platforms.length ? platforms : ["通用版"],
    taskTags: Array.isArray(prompt?.taskTags) ? prompt.taskTags : Array.isArray(prompt?.tags) ? prompt.tags.slice(0, 2) : [],
    effectTags: Array.isArray(prompt?.effectTags) ? prompt.effectTags : [],
    projectIds: Array.isArray(prompt?.projectIds) ? prompt.projectIds : prompt?.projectId ? [prompt.projectId] : [],
    favorite: Boolean(prompt?.favorite ?? prompt?.starred),
    usedCount: Number(prompt?.usedCount ?? prompt?.usageCount ?? 0),
    lastUsedAt: prompt?.lastUsedAt ? Number(new Date(prompt.lastUsedAt)) : null,
    userId: String(prompt?.userId || userId || ""),
    createdAt: Number(prompt?.createdAt || prompt?.updatedAt || Date.now()),
    updatedAt: Number(prompt?.updatedAt || prompt?.createdAt || Date.now()),
    variants,
    variables: normalizedVariables,
    tags: Array.isArray(prompt?.tags) ? prompt.tags : [],
  };
}

function normalizeWorkflowStep(step, index) {
  return {
    id: step?.id || `workflow_step_${index + 1}`,
    title: step?.title || `步骤 ${index + 1}`,
    description: step?.description || "",
    promptTemplate: String(step?.promptTemplate || step?.content || "").trim(),
    linkedPromptId: step?.linkedPromptId || "",
    platform: step?.platform || "",
    order: Number(step?.order || index + 1),
  };
}

function normalizeWorkflow(workflow, index, userId = "") {
  const steps = Array.isArray(workflow?.steps)
    ? workflow.steps.map((step, stepIndex) => normalizeWorkflowStep(step, stepIndex))
    : [];

  return {
    id: workflow?.id || `workflow_${index + 1}`,
    userId: String(workflow?.userId || userId || ""),
    title: workflow?.title || "未命名工作流",
    description: workflow?.description || "",
    platforms: normalizePlatforms(workflow?.platforms),
    tags: Array.isArray(workflow?.tags) ? workflow.tags.filter(Boolean) : [],
    variables: inferVariableDefinitions({
      content: "",
      variants: [],
      variables: Array.isArray(workflow?.variables) ? workflow.variables : [],
      steps,
    }).map((item) => ({
      ...item,
      label: item.label || humanizeVariableLabel(item.key),
    })),
    steps: steps.sort((a, b) => a.order - b.order),
    usedCount: Number(workflow?.usedCount || 0),
    favorite: Boolean(workflow?.favorite),
    projectId: String(workflow?.projectId || ""),
    lastUsedAt: workflow?.lastUsedAt || null,
    createdAt: workflow?.createdAt || new Date().toISOString(),
    updatedAt: workflow?.updatedAt || new Date().toISOString(),
  };
}

function normalizeFragment(fragment, index, userId = "") {
  return {
    id: fragment?.id || `fragment_${index + 1}`,
    userId: String(fragment?.userId || userId || ""),
    title: String(fragment?.title || `片段 ${index + 1}`).trim(),
    content: String(fragment?.content || "").trim(),
    category: FRAGMENT_CATEGORY_OPTIONS.some((item) => item.id === fragment?.category)
      ? fragment.category
      : "style",
    platforms: normalizePlatforms(fragment?.platforms),
    tags: Array.isArray(fragment?.tags) ? fragment.tags.filter(Boolean) : [],
    createdAt: Number(fragment?.createdAt || Date.now()),
    updatedAt: Number(fragment?.updatedAt || Date.now()),
  };
}

function normalizeProjectWithUser(project, index, userId = "") {
  return {
    ...normalizeProject(project, index),
    userId: String(project?.userId || userId || ""),
    createdAt: new Date(project?.createdAt || Date.now()).toISOString(),
    updatedAt: new Date(project?.updatedAt || Date.now()).toISOString(),
  };
}

function findLegacySessionUser() {
  const candidateKeys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;
    if (
      /supabase/i.test(key) ||
      /auth-token/i.test(key) ||
      /sb-.*auth-token/i.test(key) ||
      key === "auth.user" ||
      key === "currentUser" ||
      key === "user" ||
      key === "pinprompt.user"
    ) {
      candidateKeys.push(key);
    }
  }

  for (const key of candidateKeys) {
    const parsed = safeReadJson(key);
    if (!parsed) continue;
    const nestedUser =
      parsed.user ||
      parsed.currentUser ||
      parsed.session?.user ||
      parsed.data?.user ||
      parsed.profile ||
      null;
    const normalized = normalizeUser(nestedUser || parsed);
    if (normalized) return normalized;
  }

  return null;
}

export function migrateLegacyData() {
  if (localStorage.getItem(MIGRATION_DONE_KEY)) {
    return {
      currentUser: safeReadJson(CURRENT_USER_KEY),
      users: safeParse(USERS_KEY, []),
      migrated: false,
    };
  }

  const legacyUserCandidates = [
    safeReadJson("pinprompt.currentUser"),
    safeReadJson("pinprompt.user"),
    safeReadJson("currentUser"),
    safeReadJson("user"),
    safeReadJson("auth.user"),
    findLegacySessionUser(),
  ].filter(Boolean);

  const currentUser = normalizeUser(legacyUserCandidates[0]);
  const users = currentUser ? [currentUser] : [];

  const legacyProjects = safeParseAny([PROJECTS_KEY, LEGACY_PROJECTS_KEY], DEFAULT_PROJECTS);
  const legacyPrompts = safeParseAny([PROMPTS_KEY, LEGACY_PROMPTS_KEY], DEFAULT_PROMPTS);

  const projects = legacyProjects.map((project, index) =>
    normalizeProjectWithUser(project, index, currentUser?.id || "")
  );
  const prompts = legacyPrompts.map((prompt, index) => normalizePrompt(prompt, index, currentUser?.id || ""));

  if (currentUser) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  localStorage.setItem(LEGACY_PROJECTS_KEY, JSON.stringify(projects));
  localStorage.setItem(LEGACY_PROMPTS_KEY, JSON.stringify(prompts));
  localStorage.setItem(MIGRATION_DONE_KEY, "true");

  return { currentUser, users, migrated: true };
}

export function loadCurrentUser() {
  return normalizeUser(safeReadJson(CURRENT_USER_KEY));
}

export function saveCurrentUser(user) {
  const normalized = normalizeUser(user);
  if (!normalized) return null;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized));
  const users = loadUsers();
  const nextUsers = users.some((item) => item.id === normalized.id)
    ? users.map((item) => (item.id === normalized.id ? normalized : item))
    : [normalized, ...users];
  localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  return normalized;
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function loadUsers() {
  const parsed = safeParse(USERS_KEY, []);
  return parsed.map(normalizeUser).filter(Boolean);
}

export function createLocalUser({ email, name }) {
  const now = new Date().toISOString();
  return {
    id: createUserId("user"),
    name: name || (email ? email.split("@")[0] : "PinPrompt 用户"),
    email: email || "",
    avatar: "",
    role: "owner",
    plan: "free",
    createdAt: now,
    updatedAt: now,
  };
}

export function loadProjects() {
  const parsed = safeParseAny([PROJECTS_KEY, LEGACY_PROJECTS_KEY], DEFAULT_PROJECTS);
  const normalized = parsed.map((project, index) => normalizeProjectWithUser(project, index));
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(normalized));
  localStorage.setItem(LEGACY_PROJECTS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadPrompts() {
  const parsed = safeParseAny([PROMPTS_KEY, LEGACY_PROMPTS_KEY], DEFAULT_PROMPTS);
  const normalized = parsed.map((prompt, index) => normalizePrompt(prompt, index));
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(normalized));
  localStorage.setItem(LEGACY_PROMPTS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadWorkflows() {
  const parsed = safeParse(WORKFLOWS_KEY, DEFAULT_WORKFLOWS);
  const normalized = parsed.map((workflow, index) => normalizeWorkflow(workflow, index));
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function loadFragments() {
  const parsed = safeParse(FRAGMENTS_KEY, DEFAULT_FRAGMENTS);
  const normalized = parsed.map((fragment, index) => normalizeFragment(fragment, index));
  localStorage.setItem(FRAGMENTS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function savePrompts(prompts) {
  localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  localStorage.setItem(LEGACY_PROMPTS_KEY, JSON.stringify(prompts));
}

export function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  localStorage.setItem(LEGACY_PROJECTS_KEY, JSON.stringify(projects));
}

export function saveWorkflows(workflows) {
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows));
}

export function saveFragments(fragments) {
  localStorage.setItem(FRAGMENTS_KEY, JSON.stringify(fragments));
}

export function inferProjectName(projects, prompt) {
  const firstProjectId = prompt.projectIds?.[0];
  return projects.find((project) => project.id === firstProjectId)?.name || "";
}

export function buildPromptPreview(content) {
  return String(content || "").replace(/\s+/g, " ").trim().slice(0, 140);
}

export function platformLink(platform) {
  const links = {
    "即梦": "https://jimeng.jianying.com/",
    "可灵": "https://app.klingai.com/",
    Lovart: "https://lovart.ai/",
    Liblib: "https://www.liblib.art/",
    Seedance: "https://seedance.ai/",
    "Nano Banana": "https://aistudio.google.com/",
    "GPT Image": "https://chatgpt.com/",
  };
  return links[platform] || "";
}

export function createEmptyPrompt() {
  return {
    id: `prompt_${Date.now()}`,
    title: "",
    content: "",
    type: "text",
    platforms: ["通用版"],
    taskTags: [],
    effectTags: [],
    projectIds: [],
    favorite: false,
    usedCount: 0,
    lastUsedAt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    variants: [],
    variables: [],
    tags: [],
  };
}

export function createEmptyProject() {
  return {
    id: `project_${Date.now()}`,
    userId: "",
    name: "",
    desc: "",
    color: "#3b82f6",
    status: "active",
    promptCount: 0,
    workflowCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createEmptyWorkflow() {
  return {
    id: `workflow_${Date.now()}`,
    userId: "",
    title: "",
    description: "",
    platforms: [],
    tags: [],
    projectId: "",
    variables: [],
    steps: [
      {
        id: `workflow_step_${Date.now()}`,
        title: "",
        description: "",
        promptTemplate: "",
        linkedPromptId: "",
        platform: "",
        order: 1,
      },
    ],
    usedCount: 0,
    favorite: false,
    lastUsedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function exportPromptBundle({ user, projects, prompts, workflows }) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user,
    projects,
    prompts,
    workflows,
  };
}

export function importPromptBundle(rawBundle, currentUserId) {
  if (
    !rawBundle ||
    typeof rawBundle !== "object" ||
    (!Array.isArray(rawBundle.prompts) && !Array.isArray(rawBundle.workflows))
  ) {
    throw new Error("invalid_bundle");
  }

  const rawPrompts = Array.isArray(rawBundle.prompts) ? rawBundle.prompts : [];
  const rawWorkflows = Array.isArray(rawBundle.workflows) ? rawBundle.workflows : [];

  const hasInvalidPrompt = rawPrompts.some(
    (prompt) =>
      !prompt ||
      typeof prompt !== "object" ||
      !String(prompt.id || "").trim() ||
      !String(prompt.title || "").trim() ||
      !String(prompt.content || "").trim()
  );

  if (hasInvalidPrompt) {
    throw new Error("invalid_prompt");
  }

  const hasInvalidWorkflow = rawWorkflows.some(
    (workflow) =>
      !workflow ||
      typeof workflow !== "object" ||
      !String(workflow.id || "").trim() ||
      !String(workflow.title || "").trim() ||
      !Array.isArray(workflow.steps)
  );

  if (hasInvalidWorkflow) {
    throw new Error("invalid_workflow");
  }

  const now = Date.now();
  const prompts = rawPrompts.map((prompt, index) =>
    normalizePrompt(
      {
        ...prompt,
        id: prompt?.id || `imported_${now}_${index + 1}`,
        userId: currentUserId,
        createdAt: prompt?.createdAt || now,
        updatedAt: prompt?.updatedAt || now,
      },
      index,
      currentUserId
    )
  );

  const projects = Array.isArray(rawBundle.projects)
    ? rawBundle.projects.map((project, index) =>
        normalizeProjectWithUser(
          {
            ...project,
            userId: currentUserId,
          },
          index,
          currentUserId
        )
      )
    : [];

  const workflows = rawWorkflows.map((workflow, index) =>
    normalizeWorkflow(
      {
        ...workflow,
        id: workflow?.id || `imported_workflow_${now}_${index + 1}`,
        userId: currentUserId,
        createdAt: workflow?.createdAt || new Date().toISOString(),
        updatedAt: workflow?.updatedAt || new Date().toISOString(),
      },
      index,
      currentUserId
    )
  );

  return { prompts, projects, workflows };
}
