import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Plus } from "lucide-react";

const letters = [
  {
    id: 1,
    recipient: "致杰弗里.辛顿先生的一封公开信；",
    subtitle: "——与辛顿先生探讨如何使AI产生母性问题。",
  },
  {
    id: 2,
    recipient: "致埃隆.马斯克先生的一封公开信；",
    subtitle: "——与马斯克先生探讨如何解决美国债务危机问题。",
  },
  {
    id: 3,
    recipient: "致戴比斯.哈萨比斯先生的一封公开信；",
    subtitle: "——与哈萨比斯先生探讨产生AGI另外50%的源代码问题。",
  },
  {
    id: 4,
    recipient: "致安东尼奥·古特雷斯先生的一封公开信；",
    subtitle: "——与古特雷斯先生探讨如何通过市场解决气候危机问题。",
  },
  {
    id: 5,
    recipient: "致比尔.盖茨先生的一封公开信；",
    subtitle: "——与盖茨先生探讨如何通过市场福利推动人类的福利事业发展。",
  },
  {
    id: 6,
    recipient: "致谷歌公司的一封公开信；",
    subtitle: "——探讨硅基文明与碳基文明的关系",
  },
  {
    id: 7,
    recipient: "致马云先生的一封公开信；",
    subtitle: "——探讨市场是否能创生比私有制企业效率更高的公有制企业",
  },
  {
    id: 8,
    recipient: "致剑桥大学师生的一封公开信；",
    subtitle: "",
  },
  {
    id: 9,
    recipient: "致牛津大学师生的一封公开信；",
    subtitle: "",
  },
  {
    id: 10,
    recipient: "致曼彻斯特大学师生的一封公开信；",
    subtitle: "",
  },
  {
    id: 11,
    recipient: "致全球消费者的一封公开信；",
    subtitle: "",
  },
  {
    id: 12,
    recipient: "致全球企业家的一封公开信；",
    subtitle: "",
  },
  {
    id: 13,
    recipient: "致全球政治家的一封公开信；",
    subtitle: "",
  },
  {
    id: 14,
    recipient: "致全球科学家的一封公开信；",
    subtitle: "",
  },
  {
    id: 15,
    recipient: "致全球青年的一封公开信；",
    subtitle: "",
  },
];

export default function GongKaiXin() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-background">
      <Header />

      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-6 pt-8 pb-20">
        <div>
          {/* MAIN CONTENT */}
          <div className="min-w-0">

            {/* Category header */}
            <div className="flex items-center gap-3 mb-8 border-b border-border/40 pb-4">
              <h1
                className="text-2xl font-black"
                style={{ color: "#8B1A1A", fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
              >
                公开信
              </h1>
              <button className="flex items-center gap-1 text-xs border border-border/60 text-foreground/50 px-2.5 py-1 hover:border-primary hover:text-primary transition-colors">
                <Plus size={11} />收藏
              </button>
            </div>

            {/* Letters list */}
            <motion.ol
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col"
            >
              {letters.map((letter, i) => (
                <motion.li
                  key={letter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="py-6 border-b border-border/30 last:border-b-0 cursor-pointer group"
                  onClick={() => navigate(`/gongkaixin/${letter.id}`)}
                >
                  <p
                    className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed"
                    style={{ fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif" }}
                  >
                    {letter.id}、{letter.recipient}
                  </p>
                  <p className="text-sm md:text-base text-foreground/60 mt-2 leading-relaxed">
                    {letter.subtitle}
                  </p>
                </motion.li>
              ))}
            </motion.ol>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:flex flex-col gap-5 w-52 flex-shrink-0">
            <div className="border border-border/50 overflow-hidden">
              <div className="bg-secondary px-5 py-3">
                <h2 className="text-sm font-bold text-white tracking-wide">相关报道</h2>
              </div>
              <ul className="flex flex-col divide-y divide-border/30">
                {[
                  "欧盟通过《数字市场法案》强制执行条款",
                  "英国拟立法保护外卖骑手权益",
                  "全球公民社会组织联合呼吁AI透明度",
                  "G7峰会将数字公平纳入议程",
                  "联合国发布数字权利宪章草案",
                ].map((headline, i) => (
                  <li
                    key={i}
                    className="px-4 py-3 text-sm text-foreground/80 hover:text-primary cursor-pointer transition-colors leading-snug"
                  >
                    {headline}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
