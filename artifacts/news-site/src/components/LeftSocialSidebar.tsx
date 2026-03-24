import { MessageCircle, Share2, Printer, ZoomIn, Volume2 } from "lucide-react";

export type ViewMode = "zh" | "en" | "bilingual";

function WeChatLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.7 10.3c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm4.2 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zM16.6 5C14.9 3.7 12.7 3 10.3 3 5.2 3 1 6.5 1 10.8c0 2.3 1.1 4.3 2.9 5.7l-.5 2.3 2.5-1.4c.8.3 1.7.5 2.6.6-.2-.5-.3-1-.3-1.5 0-3.8 3.5-6.9 7.9-6.9.3 0 .6 0 .9.1C16.7 7.8 16.8 6.3 16.6 5z"/>
      <path d="M23 15.8c0-3.4-3.2-6.1-7.1-6.1s-7.1 2.7-7.1 6.1S12 21.9 15.9 21.9c.8 0 1.5-.1 2.2-.4l2.1 1.2-.4-2c1.4-1.1 2.2-2.8 2.2-4.9zm-9.2-1c-.4 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.4.8-.8.8zm4.2 0c-.4 0-.8-.4-.8-.8s.4-.8.8-.8.8.4.8.8-.4.8-.8.8z"/>
    </svg>
  );
}

function WeiboLogo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.611-2.759 5.049-6.739 5.443zM11.906 6.57c-.437-.051-.74-.478-.682-.955.056-.476.443-.812.882-.76 4.664.549 7.921 4.434 7.378 9.098-.055.476-.484.812-.96.757-.474-.054-.81-.48-.756-.957.454-3.937-2.255-7.288-5.862-7.183zm-.375 2.55c-.248-.044-.487-.252-.56-.502-.171-.58.26-1.072.818-.965 2.83.546 4.687 3.338 4.171 6.207-.078.435-.508.726-.963.647-.454-.079-.745-.509-.667-.943.368-2.064-.864-4.083-2.799-4.444zm-2.16 5.447c-.178.494-.812.818-1.415.724-.604-.093-.92-.572-.742-1.065.177-.49.807-.815 1.41-.722.602.092.92.572.747 1.063zm1.26-1.394c-.42.118-.908-.121-1.084-.531-.18-.41.024-.842.445-.962.416-.119.903.118 1.082.528.181.41-.026.843-.443.965zm5.32-10.16C14.006 1.634 10.923.897 8.034 1.783c-.437.133-.682.597-.547 1.036.133.437.597.682 1.033.548 2.29-.704 4.742-.1 6.473 1.596C16.74 6.652 17.42 9.07 16.768 11.38c-.12.44.142.895.58 1.017.441.12.896-.143 1.017-.58.778-2.843-.007-5.844-2.414-8.404z"/>
    </svg>
  );
}

interface Props {
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function LeftSocialSidebar({ viewMode = "zh", onViewModeChange, isSaved = false, onToggleSave }: Props) {
  const socialButtons = [
    { logo: <img src="/wechat-logo.png" alt="微信" className="w-6 h-6 object-contain rounded" />, bg: "#07C160", label: "微信" },
    { logo: <img src="/weibo-logo.png" alt="微博" className="w-6 h-6 object-contain" />, bg: "#ffffff", label: "微博" },
    { logo: <span className="text-xs font-bold leading-none">𝕏</span>, bg: "#000", label: "X" },
    { logo: <span className="text-xs font-bold leading-none">f</span>, bg: "#1877F2", label: "Facebook" },
    { logo: <span className="text-[10px] font-bold leading-none">in</span>, bg: "#0A66C2", label: "LinkedIn" },
  ];

  function toggle(mode: ViewMode) {
    if (!onViewModeChange) return;
    onViewModeChange(viewMode === mode ? "zh" : mode);
  }

  const modeBtn = (label: string, mode: ViewMode) => {
    const active = viewMode === mode;
    return (
      <button
        key={label}
        onClick={() => toggle(mode)}
        title={mode === "en" ? "显示英文版" : "中英对照"}
        className={`w-8 h-8 flex items-center justify-center text-[10px] font-medium border rounded-sm transition-colors ${
          active
            ? "border-primary bg-primary text-white"
            : "border-border text-muted-foreground hover:border-primary hover:text-primary"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col items-center gap-2 pt-2 w-10 flex-shrink-0">
      {socialButtons.map((s, i) => (
        <button
          key={i}
          title={s.label}
          className="w-8 h-8 flex items-center justify-center rounded-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: s.bg, color: "white" }}
        >
          {s.logo}
        </button>
      ))}

      <div className="w-full h-px bg-border my-1" />

      {modeBtn("对照", "bilingual")}
      {modeBtn("英文", "en")}
      <button
        onClick={onToggleSave}
        className={`w-8 h-8 flex items-center justify-center text-[10px] font-medium border rounded-sm transition-colors ${
          isSaved
            ? "border-primary bg-primary text-white"
            : "text-muted-foreground border-border hover:border-primary hover:text-primary"
        }`}
      >
        {isSaved ? "已藏" : "收藏"}
      </button>

      <div className="w-full h-px bg-border my-1" />

      {[MessageCircle, Share2, Printer, ZoomIn, Volume2].map((Icon, i) => (
        <button
          key={i}
          className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </aside>
  );
}
