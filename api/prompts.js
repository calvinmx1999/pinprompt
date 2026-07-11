const promptTemplates = [
  {
    id: "api_template_video_ad",
    title: "可灵广告感视频模板",
    type: "video",
    platform: "可灵",
    platforms: ["可灵", "Seedance"],
    content:
      "可灵视频提示词：主体为 {subject}，场景设定在 {scene}，镜头从 {camera} 开始，动作设计为 {action}，整体风格参考 {style}，总时长 {duration} 秒。",
    variables: ["subject", "scene", "camera", "action", "style", "duration"],
    tags: ["广告视频", "转场", "产品片"],
    useCount: 0,
    starred: false,
  },
  {
    id: "api_template_brand_kv",
    title: "品牌海报 KV 模板",
    type: "image",
    platform: "Lovart",
    platforms: ["Lovart", "GPT Image"],
    content:
      "请围绕 {product} 生成一张品牌海报 KV。主场景为 {scene}，整体风格参考 {style}。要求主体突出，视觉层级清晰，预留主标题、副标题和 logo 区域。",
    variables: ["product", "scene", "style"],
    tags: ["KV", "海报", "品牌表达"],
    useCount: 0,
    starred: false,
  },
  {
    id: "api_template_retouch",
    title: "真实肤质修图模板",
    type: "image",
    platform: "GPT Image",
    platforms: ["Nano Banana", "GPT Image"],
    content:
      "请对 {subject} 进行真实感修图，处理油光、肤色不均和局部瑕疵，同时保留毛孔、微纹理和五官结构。背景统一到 {scene} 的视觉氛围，最终风格参考 {style}。",
    variables: ["subject", "scene", "style"],
    tags: ["修图", "真实肤质", "肖像"],
    useCount: 0,
    starred: false,
  },
];

export default function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  response.status(200).json({
    source: "pinprompt-learning-mvp",
    prompts: promptTemplates,
  });
}
