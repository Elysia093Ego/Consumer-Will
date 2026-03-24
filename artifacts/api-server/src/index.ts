import app from "./app";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

type PresetArticle = {
  id: string;
  title: string;
  titleEn: string;
  imageUrl: string | null;
  category: string;
  date: string;
};

const PRESET_ARTICLES: PresetArticle[] = [
  { id: "preset-gongkaixin-0", category: "gongkaixin", title: "致科技巨头的公开信：请正视消费者数据权益", titleEn: "Open Letter to the Tech Giants: It's Time to Recognize Consumers' Data Rights", imageUrl: null, date: "2026-03-18" },
  { id: "preset-gongkaixin-1", category: "gongkaixin", title: "致全国人大代表：关于建立数字经济普惠机制的建议", titleEn: "An Open Letter to China's National People's Congress: Building an Inclusive Digital Economy", imageUrl: null, date: "2026-03-10" },
  { id: "preset-gongkaixin-2", category: "gongkaixin", title: "消费者联盟宣言：我们的时间，我们的价值", titleEn: "Consumer Alliance Manifesto: Our Time Has Value — and It Belongs to Us", imageUrl: null, date: "2026-03-01" },
  { id: "preset-gongkaixin-3", category: "gongkaixin", title: "致养老金管理机构：将数字资产纳入长期投资组合", titleEn: "Open Letter to Pension Fund Managers: The Case for Digital Assets in Long-Term Portfolios", imageUrl: null, date: "2026-02-22" },

  { id: "preset-jiuye-0", category: "jiuye", title: "AI替代浪潮：哪些职业最先消失，哪些将诞生", titleEn: "The AI Replacement Wave: Which Jobs Will Vanish First — and What New Ones Will Emerge", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80", date: "2026-03-19" },
  { id: "preset-jiuye-1", category: "jiuye", title: "零工经济的悖论：自由背后的不安全感", titleEn: "The Gig Economy Paradox: The Hidden Insecurity Behind the Freedom", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", date: "2026-03-15" },
  { id: "preset-jiuye-2", category: "jiuye", title: "四天工作制试验：企业生产力并未下降", titleEn: "The Four-Day Workweek Experiment: Productivity Held Firm", imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", date: "2026-03-08" },
  { id: "preset-jiuye-3", category: "jiuye", title: "制造业回流：美国工厂的复兴与困局", titleEn: "Manufacturing's Comeback: The Revival and Reality of American Factories", imageUrl: null, date: "2026-03-02" },

  { id: "preset-jiaoyu-0", category: "jiaoyu", title: "AI家教普及后，学校还有什么不可替代的价值？", titleEn: "Once AI Tutors Are Everywhere, What Will Schools Still Have to Offer?", imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80", date: "2026-03-17" },
  { id: "preset-jiaoyu-1", category: "jiaoyu", title: "顶尖大学学位的贬值：高等教育的重新定义", titleEn: "The Declining Value of Elite Degrees: Redefining Higher Education", imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80", date: "2026-03-12" },
  { id: "preset-jiaoyu-2", category: "jiaoyu", title: "中国双减政策两年后：教育焦虑有没有缓解？", titleEn: "Two Years After China's 'Double Reduction' Policy: Has Education Anxiety Actually Eased?", imageUrl: null, date: "2026-03-05" },
  { id: "preset-jiaoyu-3", category: "jiaoyu", title: "STEM教育热潮下，人文学科的困境与出路", titleEn: "Amid the STEM Frenzy, Where Do the Humanities Go From Here?", imageUrl: null, date: "2026-02-28" },

  { id: "preset-jinrong-0", category: "jinrong", title: "美联储按兵不动：通胀粘性与降息预期的拉锯", titleEn: "The Fed Stands Pat: The Tug-of-War Between Sticky Inflation and Rate-Cut Hopes", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80", date: "2026-03-20" },
  { id: "preset-jinrong-1", category: "jinrong", title: "比特币突破12万美元：机构投资者的新共识", titleEn: "Bitcoin Breaks $120,000: Institutional Investors Are All In", imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=600&q=80", date: "2026-03-16" },
  { id: "preset-jinrong-2", category: "jinrong", title: "人民币国际化：沙特原油结算协议的深远影响", titleEn: "The Renminbi Goes Global: What the Saudi Oil Deal Means for the World", imageUrl: null, date: "2026-03-09" },
  { id: "preset-jinrong-3", category: "jinrong", title: "私募信贷的崛起：银行收缩后的权力重组", titleEn: "The Rise of Private Credit: Who Fills the Void as Banks Pull Back", imageUrl: null, date: "2026-03-03" },

  { id: "preset-yanglao-0", category: "yanglao", title: "中国养老危机倒计时：谁来赡养4亿老人？", titleEn: "China's Elder Care Crisis: Who Will Support 400 Million Seniors?", imageUrl: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=600&q=80", date: "2026-03-18" },
  { id: "preset-yanglao-1", category: "yanglao", title: "延迟退休的全球浪潮：欧洲先行，亚洲跟进", titleEn: "Retiring Later: Europe Goes First, Asia Follows", imageUrl: null, date: "2026-03-11" },
  { id: "preset-yanglao-2", category: "yanglao", title: "AI护理机器人：解决养老院人手不足的答案？", titleEn: "AI Caregiving Robots: The Answer to Nursing Home Staffing Shortages?", imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80", date: "2026-03-04" },
  { id: "preset-yanglao-3", category: "yanglao", title: "以房养老的困境：资产丰厚、现金匮乏的老一代", titleEn: "House-Rich, Cash-Poor: The Retirement Trap Facing an Entire Generation", imageUrl: null, date: "2026-02-25" },

  { id: "preset-shenghuo-0", category: "shenghuo", title: "反消费主义崛起：年轻人为何拒绝购物？", titleEn: "The Anti-Consumerism Backlash: Why Young People Are Opting Out of Shopping", imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80", date: "2026-03-19" },
  { id: "preset-shenghuo-1", category: "shenghuo", title: "超级城市的逃离：远程工作催生的迁居潮", titleEn: "Leaving the Megacity Behind: How Remote Work Is Triggering a Migration Wave", imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80", date: "2026-03-13" },
  { id: "preset-shenghuo-2", category: "shenghuo", title: "孤独经济：一个人的市场有多大？", titleEn: "The Loneliness Economy: A Huge and Growing Market for One", imageUrl: null, date: "2026-03-06" },
  { id: "preset-shenghuo-3", category: "shenghuo", title: "正念热潮背后的产业链：冥想真的有用吗？", titleEn: "Inside the Mindfulness Industrial Complex: Does Meditation Actually Deliver?", imageUrl: null, date: "2026-02-27" },

  { id: "preset-keji-0", category: "keji", title: "GPT-5发布：多模态能力的量子跃迁", titleEn: "GPT-5 Is Here: A Quantum Leap in Multimodal AI", imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80", date: "2026-03-20" },
  { id: "preset-keji-1", category: "keji", title: "芯片战争升级：荷兰对华光刻机禁令的后续", titleEn: "The Chip Wars Heat Up: What the Dutch Lithography Machine Ban on China Really Means", imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", date: "2026-03-14" },
  { id: "preset-keji-2", category: "keji", title: "量子计算的商业化：从实验室到企业", titleEn: "Quantum Computing Comes of Age: From Lab Curiosity to Business Tool", imageUrl: null, date: "2026-03-07" },
  { id: "preset-keji-3", category: "keji", title: "脑机接口：马斯克的Neuralink与监管的竞速", titleEn: "Brain-Computer Interfaces: Musk's Neuralink in a Race Against Regulators", imageUrl: null, date: "2026-03-01" },

  { id: "preset-chuangxin-0", category: "chuangxin", title: "中国创业黄金时代已过？下一个机会在哪里", titleEn: "Is China's Startup Golden Age Over? Here's Where the Next Wave Is Building", imageUrl: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80", date: "2026-03-18" },
  { id: "preset-chuangxin-1", category: "chuangxin", title: "开源模型的反攻：Llama如何改写AI竞争格局", titleEn: "The Open-Source Counterattack: How Llama Is Reshaping the AI Race", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80", date: "2026-03-12" },
  { id: "preset-chuangxin-2", category: "chuangxin", title: "深科技的漫长等待：从实验室到市场需要多久", titleEn: "The Long Road From Lab to Market: The Reality of Deep Tech", imageUrl: null, date: "2026-03-05" },
  { id: "preset-chuangxin-3", category: "chuangxin", title: "循环经济：从废弃物到商业机会的价值重塑", titleEn: "The Circular Economy: Turning Waste Into Business Opportunity", imageUrl: null, date: "2026-02-26" },

  { id: "preset-huanjing-0", category: "huanjing", title: "COP31成果盘点：气候承诺与行动的鸿沟", titleEn: "COP31 in Review: The Yawning Gap Between Climate Pledges and Real Action", imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", date: "2026-03-20" },
  { id: "preset-huanjing-1", category: "huanjing", title: "核能复兴：绿色能源的意外盟友？", titleEn: "The Nuclear Revival: Green Energy's Unlikely New Ally", imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=80", date: "2026-03-15" },
  { id: "preset-huanjing-2", category: "huanjing", title: "碳市场的信任危机：自愿碳信用的泡沫破裂", titleEn: "Carbon Markets in Crisis: The Collapse of Voluntary Carbon Credits", imageUrl: null, date: "2026-03-08" },
  { id: "preset-huanjing-3", category: "huanjing", title: "稀土争夺战：绿色转型下的新地缘政治", titleEn: "The Rare Earth Race: Green Energy's New Geopolitical Battlefield", imageUrl: null, date: "2026-03-02" },

  { id: "preset-renyuai-0", category: "renyuai", title: "【深度】人机关系：我们如何与AI共同进化", titleEn: "[In Depth] Living With AI: How Humans and Machines Are Co-Evolving", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80", date: "2026-03-20" },
  { id: "preset-renyuai-1", category: "renyuai", title: "AI创作的版权归属：法律灰色地带的全球混战", titleEn: "Who Owns What AI Creates? The Copyright Battle Playing Out Across the Globe", imageUrl: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80", date: "2026-03-16" },
  { id: "preset-renyuai-2", category: "renyuai", title: "AI情感伴侣：孤独的解药还是人际关系的毒药？", titleEn: "AI Companions: A Cure for Loneliness, or a Threat to Human Relationships?", imageUrl: null, date: "2026-03-10" },
  { id: "preset-renyuai-3", category: "renyuai", title: "超级对齐：如何确保AI永远服务于人类？", titleEn: "Superalignment: Can We Guarantee That AI Will Always Work for Us?", imageUrl: null, date: "2026-03-04" },

  { id: "preset-ubi-0", category: "ubi", title: "全民基本收入：乌托邦还是下一步？", titleEn: "Universal Basic Income: Fantasy, or the Obvious Next Step?", imageUrl: null, date: "2026-03-01" },
  { id: "preset-ubi-1", category: "ubi", title: "芬兰UBI实验：两年后的真实数据", titleEn: "Finland's UBI Experiment: Two Years of Real-World Data", imageUrl: null, date: "2026-02-15" },
  { id: "preset-ubi-2", category: "ubi", title: "UBI的资金来源：谁来买单？", titleEn: "Who Pays for UBI? A Serious Look at the Funding Question", imageUrl: null, date: "2026-02-01" },
];

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      category TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE user_articles ADD COLUMN IF NOT EXISTS is_preset BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE SEQUENCE IF NOT EXISTS site_users_numeric_id_seq START WITH 1
  `);
  await pool.query(`
    ALTER TABLE site_users
      ADD COLUMN IF NOT EXISTS numeric_id BIGINT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS can_edit BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS can_upload BOOLEAN DEFAULT FALSE
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id SERIAL PRIMARY KEY,
      target TEXT NOT NULL,
      type TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
      used BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS site_users_numeric_id_idx ON site_users (numeric_id) WHERE numeric_id IS NOT NULL
  `);
  const usersWithoutNumId = await pool.query("SELECT id FROM site_users WHERE numeric_id IS NULL ORDER BY created_at ASC");
  for (const row of usersWithoutNumId.rows) {
    const nid = await pool.query("SELECT nextval('site_users_numeric_id_seq') as nid");
    await pool.query("UPDATE site_users SET numeric_id = $1 WHERE id = $2", [parseInt(nid.rows[0].nid), row.id]);
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dengji_records (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE dengji_records ADD COLUMN IF NOT EXISTS user_id TEXT
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS dengji_records_user_id_idx
    ON dengji_records (user_id)
    WHERE user_id IS NOT NULL
  `);
  await pool.query(`
    ALTER TABLE dengji_records
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS birth_date TEXT,
      ADD COLUMN IF NOT EXISTS country   TEXT
  `);
  await pool.query(`
    ALTER TABLE user_articles
      ADD COLUMN IF NOT EXISTS title_en   TEXT,
      ADD COLUMN IF NOT EXISTS content_en TEXT
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS article_stats (
      article_id TEXT PRIMARY KEY,
      views INT NOT NULL DEFAULT 0,
      likes INT NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sidebar_links (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      position INT NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT ''
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS sidebar_links_cat_pos_idx
    ON sidebar_links (category, position)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_follows (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS user_follows_uid_tag_idx
    ON user_follows (user_id, tag)
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS open_letter_content (
      letter_id TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE open_letter_content
      ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS subtitle TEXT NOT NULL DEFAULT ''
  `);
  await pool.query(`
    ALTER TABLE open_letter_content
      ADD COLUMN IF NOT EXISTS title_en TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS subtitle_en TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS content_en TEXT NOT NULL DEFAULT ''
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_content (
      page_id TEXT PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      content_en TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE page_content
      ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS title_en TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS description_en TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS tag_en TEXT NOT NULL DEFAULT ''
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      kind TEXT NOT NULL DEFAULT 'article',
      title TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      subtitle TEXT NOT NULL DEFAULT '',
      subtitle_en TEXT NOT NULL DEFAULT '',
      label TEXT NOT NULL DEFAULT '',
      label_en TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      href TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      username TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS qa_items (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL DEFAULT '',
      question_en TEXT NOT NULL DEFAULT '',
      answer TEXT NOT NULL DEFAULT '',
      answer_en TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system',
      title TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      feedback_id INTEGER,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS article_bookmarks (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      article_id TEXT NOT NULL,
      article_title TEXT NOT NULL DEFAULT '',
      article_image TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, article_id)
    )
  `);
  await pool.query(`ALTER TABLE article_bookmarks ADD COLUMN IF NOT EXISTS article_title TEXT NOT NULL DEFAULT ''`);
  await pool.query(`ALTER TABLE article_bookmarks ADD COLUMN IF NOT EXISTS article_image TEXT NOT NULL DEFAULT ''`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS milestone_pages (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      content_en TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ui_translations (
      id SERIAL PRIMARY KEY,
      key TEXT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'ja',
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(key, lang)
    )
  `);
  logger.info("Database migration complete");
}

const SIDEBAR_NEWS: Record<string, { title: string; url: string }[]> = {
  gongkaixin: [
    { title: "欧盟通过《数字市场法案》强制执行条款", url: "https://ec.europa.eu/digital-markets-act" },
    { title: "英国拟立法保护外卖骑手权益", url: "https://www.bbc.com/news/business" },
    { title: "全球公民社会组织联合呼吁AI透明度", url: "https://www.weforum.org/agenda/ai-governance" },
    { title: "G7峰会将数字公平纳入议程", url: "https://www.g7italy.it" },
    { title: "联合国发布数字权利宪章草案", url: "https://www.un.org/en/digital-rights" },
  ],
  jiuye: [
    { title: "中国青年失业率连续第三月下降", url: "https://www.stats.gov.cn" },
    { title: "德国技术移民新政策吸引东南亚工程师", url: "https://www.dw.com/en/germany-immigration" },
    { title: "硅谷再掀裁员潮 中层管理岗受冲击最大", url: "https://www.reuters.com/technology" },
    { title: "远程办公比例稳定在35% 混合模式成主流", url: "https://www.mckinsey.com/future-of-work" },
    { title: "职业培训预算：政府vs企业谁来买单", url: "https://www.ilo.org/skills" },
  ],
  jiaoyu: [
    { title: "ChatGPT在校园的边界：各国政策盘点", url: "https://www.unesco.org/en/digital-education" },
    { title: "全球最贵私立学校年费突破10万英镑", url: "https://www.ft.com/education" },
    { title: "芬兰教育模式再获全球最佳排名", url: "https://www.oecd.org/pisa" },
    { title: "中国高考改革：综合素质评价权重提升", url: "https://www.moe.gov.cn" },
    { title: "MOOC平台用户突破2亿大关", url: "https://www.classcentral.com/report" },
  ],
  jinrong: [
    { title: "欧洲股市连续第五周录得资金流入", url: "https://www.ft.com/markets" },
    { title: "日本央行意外加息25基点 日元大幅升值", url: "https://www.boj.or.jp/en" },
    { title: "黄金现货价格创历史新高", url: "https://www.reuters.com/markets/commodities" },
    { title: "全球最大对冲基金桥水大幅减持美债", url: "https://www.bloomberg.com/markets" },
    { title: "数字人民币试点扩大至全国50个城市", url: "https://www.pbc.gov.cn" },
  ],
  yanglao: [
    { title: "全球养老金缺口预计2030年达400万亿美元", url: "https://www.weforum.org/agenda/retirement" },
    { title: "新加坡推出高龄友好城市5年计划", url: "https://www.moh.gov.sg" },
    { title: "美国长期护理保险公司相继退出市场", url: "https://www.nytimes.com/health" },
    { title: "中国第三支柱养老金参与率不足10%", url: "https://www.gov.cn/pension" },
    { title: "老龄化经济学：银发经济的万亿商机", url: "https://www.mckinsey.com/silver-economy" },
  ],
  shenghuo: [
    { title: "全球旅游业收入首次超越疫情前水平", url: "https://www.unwto.org" },
    { title: "日本\"躺平\"文化：社会压力下的消极抵抗", url: "https://www.bbc.com/news/world-asia" },
    { title: "共享经济2.0：从共享汽车到共享厨房", url: "https://www.pwc.com/sharing-economy" },
    { title: "超加工食品消费与心理健康的关联性研究", url: "https://www.thelancet.com/nutrition" },
    { title: "电子竞技成为亚运会正式项目", url: "https://www.olympic.org/esports" },
  ],
  keji: [
    { title: "苹果Vision Pro 2全球销量破百万", url: "https://www.apple.com/vision-pro" },
    { title: "欧盟AI法案正式生效 企业合规大限倒计时", url: "https://artificialintelligenceact.eu" },
    { title: "中国发布人形机器人国家标准", url: "https://www.miit.gov.cn" },
    { title: "SpaceX星舰第七次试飞成功完成轨道飞行", url: "https://www.spacex.com/vehicles/starship" },
    { title: "特斯拉自动驾驶出租车在旧金山正式运营", url: "https://www.tesla.com/robotaxi" },
  ],
  chuangxin: [
    { title: "YC最新一批创业营中AI项目占比超70%", url: "https://www.ycombinator.com" },
    { title: "独角兽数量首次出现全球性下降", url: "https://www.cbinsights.com/unicorns" },
    { title: "以色列科技生态系统在战时展现韧性", url: "https://www.startupnationcentral.org" },
    { title: "东南亚成下一个创业热土 印尼估值超百亿", url: "https://www.techinasia.com" },
    { title: "企业风险投资CVC超越独立VC成主力", url: "https://www.pitchbook.com/cvc" },
  ],
  huanjing: [
    { title: "撒哈拉沙漠绿化计划进展报告发布", url: "https://www.greatgreenwall.org" },
    { title: "极端天气造成的经济损失2025年创纪录", url: "https://www.ipcc.ch" },
    { title: "欧盟碳边境调节机制正式实施", url: "https://ec.europa.eu/cbam" },
    { title: "海洋塑料污染首次被纳入国际条约", url: "https://www.unep.org/plastic-pollution" },
    { title: "全球可再生能源装机容量首次超过化石燃料", url: "https://www.irena.org" },
  ],
  renyuai: [
    { title: "图灵测试在GPT-5面前已彻底失效", url: "https://www.nature.com/ai" },
    { title: "欧盟发布AI系统情感操控禁令", url: "https://artificialintelligenceact.eu" },
    { title: "中国发布生成式AI服务管理新规", url: "https://www.cac.gov.cn" },
    { title: "科学家首次记录人类与AI协作的脑神经活动", url: "https://www.science.org" },
    { title: "AI辅助药物研发将癌症临床试验周期缩短60%", url: "https://www.nature.com/drug-discovery" },
  ],
};

async function seedSidebarLinks() {
  for (const [category, items] of Object.entries(SIDEBAR_NEWS)) {
    for (let i = 0; i < items.length; i++) {
      await pool.query(
        `INSERT INTO sidebar_links (category, position, title, url)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (category, position) DO UPDATE SET
           url = CASE WHEN sidebar_links.url = '' THEN EXCLUDED.url ELSE sidebar_links.url END`,
        [category, i, items[i].title, items[i].url]
      );
    }
  }
  logger.info("Sidebar links seeded");
}

async function seedPresetArticles() {
  for (const a of PRESET_ARTICLES) {
    await pool.query(
      `INSERT INTO user_articles (id, title, title_en, content, image_url, category, published_at, updated_at, is_preset)
       VALUES ($1, $2, $3, '', $4, $5, $6::date, $6::date, true)
       ON CONFLICT (id) DO UPDATE SET title_en = EXCLUDED.title_en`,
      [a.id, a.title, a.titleEn, a.imageUrl ?? null, a.category, a.date]
    );
  }
  logger.info({ count: PRESET_ARTICLES.length }, "Preset articles seeded");
}

migrate()
  .then(() => seedPresetArticles())
  .then(() => seedSidebarLinks())
  .then(() => {
    app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error(err, "Migration/seed failed");
    process.exit(1);
  });
