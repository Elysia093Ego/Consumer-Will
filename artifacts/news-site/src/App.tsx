import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { UserAuthProvider } from "@/context/UserAuthContext";
import { LangProvider } from "@/context/LangContext";
import { EditModeProvider } from "@/context/EditModeContext";
import { EditModePanel } from "@/components/EditModePanel";
import Home from "@/pages/Home";
import UBI from "@/pages/UBI";
import GongKaiXin from "@/pages/GongKaiXin";
import MoniShichang from "@/pages/MoniShichang";
import CategoryPage from "@/pages/CategoryPage";
import ArticlePage from "@/pages/ArticlePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DengjiPage from "@/pages/DengjiPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import YuanliPage from "@/pages/YuanliPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminDashboard from "@/pages/AdminDashboard";
import OpenLetterPage from "@/pages/OpenLetterPage";
import FeedbackPage from "@/pages/FeedbackPage";
import QAPage from "@/pages/QAPage";
import MilestonePage from "@/pages/MilestonePage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/ubi" component={UBI} />
      <Route path="/gongkaixin" component={GongKaiXin} />
      <Route path="/gongkaixin/:id" component={OpenLetterPage} />
      <Route path="/jiuye">
        <CategoryPage slug="jiuye" />
      </Route>
      <Route path="/jiaoyu">
        <CategoryPage slug="jiaoyu" />
      </Route>
      <Route path="/jinrong">
        <CategoryPage slug="jinrong" />
      </Route>
      <Route path="/yanglao">
        <CategoryPage slug="yanglao" />
      </Route>
      <Route path="/shenghuo">
        <CategoryPage slug="shenghuo" />
      </Route>
      <Route path="/keji">
        <CategoryPage slug="keji" />
      </Route>
      <Route path="/chuangxin">
        <CategoryPage slug="chuangxin" />
      </Route>
      <Route path="/huanjing">
        <CategoryPage slug="huanjing" />
      </Route>
      <Route path="/renyuai">
        <CategoryPage slug="renyuai" />
      </Route>
      <Route path="/monishichang" component={MoniShichang} />
      <Route path="/dengji" component={DengjiPage} />
      <Route path="/milestone/:slug" component={MilestonePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/ggwl-chs-528123" component={AdminDashboard} />
      <Route path="/article/:id" component={ArticlePage} />

      {/* 首页文章卡片 — 青年系列 */}
      <Route path="/qingnian/jiuye-nan">
        <PlaceholderPage pageId="qingnian-jiuye-nan" title="【青年】就业难如何解决？" titleEn="[Youth] How Do We Solve Unemployment?" tag="杰夫●贝佐斯" tagEn="Jeff Bezos" description="青年就业困境的深度探讨与出路分析" descriptionEn="In-depth exploration of youth employment challenges and potential solutions" />
      </Route>
      <Route path="/qingnian/xuedai">
        <PlaceholderPage pageId="qingnian-xuedai" title="【青年】上学贷如何解决？" titleEn="[Youth] How Do We Solve Student Debt?" tag="人工智能与就业" tagEn="AI & Employment" description="教育债务问题与未来解决方案" descriptionEn="Education debt problems and future solutions" />
      </Route>
      <Route path="/qingnian/ai-xuexi">
        <PlaceholderPage pageId="qingnian-ai-xuexi" title="【青年】如何在AI时代学习？" titleEn="[Youth] How to Learn in the Age of AI?" tag="中德贸易" tagEn="China-Germany Trade" description="AI时代下青年学习方式的变革与适应" descriptionEn="Transforming and adapting youth learning in the AI era" />
      </Route>

      {/* 首页文章卡片 — 政府系列 */}
      <Route path="/zhengfu/zhaiwu-weiji">
        <PlaceholderPage pageId="zhengfu-zhaiwu-weiji" title="【政府】如何解决债务危机？" titleEn="[Government] How to Solve the Debt Crisis?" tag="华纳兄弟探索" tagEn="Warner Bros. Discovery" description="全球债务困境与政府治理的可能路径" descriptionEn="Global debt crisis and possible paths for governance" />
      </Route>
      <Route path="/zhengfu/yanglao-nan">
        <PlaceholderPage pageId="zhengfu-yanglao-nan" title="【政府】如何解决养老难？" titleEn="[Government] How to Solve the Elder Care Crisis?" tag="医疗科学" tagEn="Medical Science" description="老龄化社会下的养老体系重构" descriptionEn="Restructuring elder care systems in an aging society" />
      </Route>
      <Route path="/zhengfu/jiuye-nan">
        <PlaceholderPage pageId="zhengfu-jiuye-nan" title="【政府】如何解决就业难？" titleEn="[Government] How to Solve Unemployment?" tag="爱泼斯坦案" tagEn="Epstein Case" description="结构性失业与政府政策的有效性分析" descriptionEn="Structural unemployment and effectiveness of government policies" />
      </Route>

      {/* WILLERS 模块 */}
      <Route path="/zhaopian">
        <PlaceholderPage pageId="zhaopian" title="访谈活动 · 照片" titleEn="Interview Events · Photos" description="WILLERS 系列访谈活动的珍贵影像记录" descriptionEn="Precious photo archives from the WILLERS interview series" />
      </Route>
      <Route path="/shehui-kexue" component={YuanliPage} />

      {/* 橙色横幅 */}
      <Route path="/lilun">
        <PlaceholderPage pageId="lilun" title="利润领先是因，还是技术领先是原因？" titleEn="Is Profit the Cause, or Is Technology Leadership?" description="探讨商业驱动力与技术创新之间的因果关系" descriptionEn="Exploring the causal relationship between business drivers and technological innovation" />
      </Route>

      {/* 页脚链接 */}
      <Route path="/guanyu">
        <PlaceholderPage pageId="guanyu" title="关于我们" titleEn="About Us" description="我们的意志——照亮人类前行的脚步" descriptionEn="Our Will — Illuminating humanity's path forward" />
      </Route>
      <Route path="/jiaru">
        <PlaceholderPage pageId="jiaru" title="加入我们" titleEn="Join Us" description="成为 Willers 的一员，共同点亮人类文明前行的道路" descriptionEn="Become a Willer and help illuminate humanity's path forward" />
      </Route>
      <Route path="/fankui">
        <FeedbackPage />
      </Route>
      <Route path="/wenda">
        <QAPage />
      </Route>
      <Route path="/fuwutiaokuan">
        <PlaceholderPage pageId="fuwutiaokuan" title="服务条款" titleEn="Terms of Service" description="使用本平台即表示您同意以下服务条款" descriptionEn="By using this platform, you agree to the following terms" noStandardModules />
      </Route>
      <Route path="/shuxueyuanli" component={YuanliPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LangProvider>
      <EditModeProvider>
        <AdminAuthProvider>
          <UserAuthProvider>
            <QueryClientProvider client={queryClient}>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <EditModePanel />
            </QueryClientProvider>
          </UserAuthProvider>
        </AdminAuthProvider>
      </EditModeProvider>
    </LangProvider>
  );
}

export default App;
