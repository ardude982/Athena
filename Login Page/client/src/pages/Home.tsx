import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  School, 
  CheckCircle2, 
  Building2, 
  HelpCircle, 
  Laptop, 
  Award, 
  ChevronRight,
  Sun,
  Moon,
  Globe2,
  AlertCircle,
  FileText,
  BadgeAlert,
  Loader2,
  RefreshCw,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

type UserRole = "student" | "faculty" | "admin" | "alumni";
type AuthMethod = "password" | "sso" | "passkey";

interface RoleConfig {
  id: UserRole;
  label: string;
  badge: string;
  idLabel: string;
  idPlaceholder: string;
  demoId: string;
  defaultPass: string;
  portalName: string;
  accent: string;
  desc: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "student",
    label: "Student",
    badge: "Undergraduate & Graduate",
    idLabel: "Student ID or Campus Email",
    idPlaceholder: "s109482@athena.edu or student ID",
    demoId: "elena.vance@student.athena.edu",
    defaultPass: "AcademicPass2026!",
    portalName: "Student Learning Portal",
    accent: "from-blue-600 to-indigo-600",
    desc: "Access courses, assignments, grades, and academic resources."
  },
  {
    id: "faculty",
    label: "Faculty & Staff",
    badge: "Instructors & Researchers",
    idLabel: "Academic Faculty Email",
    idPlaceholder: "prof.surname@athena.edu",
    demoId: "dr.aravind@faculty.athena.edu",
    defaultPass: "ResearchGrant#88",
    portalName: "Faculty & Staff Workspace",
    accent: "from-amber-600 to-orange-600",
    desc: "Manage courses, gradebooks, research, and academic operations."
  }
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<"en" | "fa">("fa");
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  // State management
  const [activeRole, setActiveRole] = useState<UserRole>("student");
  const [authMethod] = useState<AuthMethod>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
  const [termModalOpen, setTermModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState("Cambridge Main Campus (HQ)");
  const [cursorParticle, setCursorParticle] = useState({ x: -200, y: -200 });

  const currentRoleConfig = ROLES.find((r) => r.id === activeRole) || ROLES[0];

  useEffect(() => {
    document.documentElement.lang = language === "fa" ? "fa" : "en";
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
  }, [language]);

  // Auto update demo credentials when switching role
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    const target = ROLES.find((r) => r.id === role);
    if (target) {
      setIdentifier("");
      setPassword("");
    }
    setIsMfaStep(false);
    setLoginSuccess(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error(language === "fa" ? "لطفاً ایمیل خود را وارد کنید." : "Please enter your email.");
      return;
    }
    if (!password) {
      toast.error(language === "fa" ? "لطفاً رمز عبور خود را وارد کنید." : "Please enter your password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Advance to 2FA / MFA step for realistic campus security
      setIsMfaStep(true);
      toast.info("Security Verification: A 6-digit confirmation code was dispatched to your registered authenticator.");
    }, 1100);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = mfaCode.join("");
    if (fullCode.length < 6) {
      toast.error("Please provide all 6 digits of your authorization token.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      toast.success(`Welcome back! Authenticated into ${currentRoleConfig.portalName}.`);
    }, 1000);
  };

  const handleMfaInput = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newCode = [...mfaCode];
    newCode[index] = val;
    setMfaCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`mfa-box-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !mfaCode[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-box-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSsoClick = (provider: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1400)),
      {
        loading: `Connecting to ${provider} Federated Identity Provider...`,
        success: `Campus SSO verified via ${provider}! Redirecting to portal...`,
        error: "SSO handoff failed."
      }
    );
  };

  const handlePasskeyClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
      toast.success("WebAuthn biometric signature recognized. Welcome back!");
    }, 1200);
  };

  return (
    <div
      className="relative min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200"
      onMouseMove={(event) => setCursorParticle({ x: event.clientX, y: event.clientY })}
    >
      <div
        aria-hidden="true"
        className="cursor-particle pointer-events-none fixed z-0"
        style={{ left: `${cursorParticle.x}px`, top: `${cursorParticle.y}px` }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
      {/* Main Global Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & University Identity */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-900 to-blue-800 flex items-center justify-center text-white shadow-md shadow-indigo-900/20 ring-1 ring-white/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-title font-semibold text-xl tracking-tight text-slate-900 dark:text-white">
                  ATHENA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 font-medium">
                {language === "fa" ? "درگاه یکپارچه آموزشی و پژوهشی" : "Research Federated Portal"}
              </p>
            </div>
          </div>

          {/* Right utility toolbar */}
          <div className="flex items-center gap-3">
            {/* Campus Selector Dropdown */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <select 
                aria-label="Campus Selector"
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-xs"
              >
                <option value="Cambridge Main Campus (HQ)" className="dark:bg-slate-900">{language === "fa" ? "پردیس اصلی کمبریج" : "Cambridge Main Campus"}</option>
                <option value="San Francisco Research Center" className="dark:bg-slate-900">{language === "fa" ? "مرکز پژوهشی سان‌فرانسیسکو" : "San Francisco Research Center"}</option>
                <option value="Oxford International Faculty" className="dark:bg-slate-900">{language === "fa" ? "دانشکده بین‌المللی آکسفورد" : "Oxford International Faculty"}</option>
                <option value="Singapore Global Institute" className="dark:bg-slate-900">{language === "fa" ? "مؤسسه جهانی سنگاپور" : "Singapore Global Institute"}</option>
              </select>
            </div>

            {/* Language switch */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen((open) => !open)}
                className="flex items-center gap-1.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Change Language / تغییر زبان"
                aria-label="Change language"
                aria-expanded={languageMenuOpen}
              >
                <Globe2 className="w-4 h-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{language === "fa" ? "فا" : "EN"}</span>
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 top-11 z-40 min-w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5 shadow-xl shadow-slate-900/10">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("en");
                      setLanguageMenuOpen(false);
                      toast.success("Language changed to English.");
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${language === "en" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage("fa");
                      setLanguageMenuOpen(false);
                      toast.success("زبان به فارسی تغییر کرد.");
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-right text-xs transition-colors ${language === "fa" ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    lang="fa"
                  >
                    فارسی
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Appearance"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

            {/* Student Registration link */}
            <button 
              onClick={() => toast.info("Prospective students: Admissions for Academic Year 2026-2027 are now open. Visit admissions.athena.edu")}
              className="hidden sm:inline-flex text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors px-2 py-1"
            >
              {language === "fa" ? "دانش آموز جدید هستید؟ ثبت نام کنید" : "New Student? Sign Up"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Form Split Section */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 items-center justify-center">
        {/* Right Column: Interactive Login Container */}
        <div className="w-full max-w-[510px] flex flex-col justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-all">
            
            {/* Header: Title and Role Selector */}
            <div className="space-y-4">
              <div>
                <h2 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
                  {language === "fa" ? "ورود به درگاه شما" : "Sign in"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {language === "fa" ? "برای شروع احراز هویت، نقش خود را انتخاب کنید." : "Select your role"}
                </p>
              </div>

              {/* Role Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                {ROLES.map((role) => {
                  const isActive = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`py-2 px-1 text-center rounded-xl font-medium text-xs transition-all duration-300 ease-out relative hover:-translate-y-0.5 ${
                        isActive
                          ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {language === "fa" ? (role.id === "student" ? "دانش‌آموز" : "معلم / مدیر") : role.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Step 1: Standard Password Form */}
            {!isMfaStep && !loginSuccess && authMethod === "password" && (
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                {/* ID Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="identity-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === "fa" ? "ایمیل" : "Email"}
                    </Label>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="identity-input"
                      type="email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={language === "fa" ? "you@example.com" : "you@example.com"}
                      className="pl-10 text-sm h-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === "fa" ? "رمز عبور" : "Password"}
                    </Label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                    >
                      {language === "fa" ? "رمز عبور را فراموش کرده‌اید؟" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-10 pr-10 text-sm h-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Terminal Policy */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>{language === "fa" ? "مرا در این دستگاه به مدت ۳۰ روز به خاطر بسپار" : "Remember on this workstation (30 days)"}</span>
                  </label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-indigo-700 hover:bg-indigo-800 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-700/30 text-white font-semibold text-sm shadow-md shadow-indigo-700/20 flex items-center justify-center gap-2 transition-all duration-200 ease-out active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === "fa" ? "در حال بررسی اطلاعات ورود..." : "Authenticating Credentials..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === "fa" ? "ادامه و تأیید دومرحله‌ای" : "Continue to 2FA Verification"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* Quick Academic Notice */}
                <div className="pt-2">
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === "fa" ? "محافظت‌شده با احراز هویت چندمرحله‌ای Duo Mobile" : "Protected by Duo Mobile Multi-Factor Authentication"}</span>
                  </div>
                </div>
              </form>
            )}

            {/* Step: Passkey / Biometrics */}
            {!isMfaStep && !loginSuccess && authMethod === "passkey" && (
              <div className="mt-6 py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 mx-auto flex items-center justify-center border border-indigo-200 dark:border-indigo-800/80 shadow-inner">
                  <Fingerprint className="w-9 h-9 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                    Hardware Security Key or Touch ID
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Use Windows Hello, Apple Touch ID/Face ID, or a FIDO2 USB Security key registered with Athena IT.
                  </p>
                </div>
                <Button
                  onClick={handlePasskeyClick}
                  disabled={isLoading}
                  className="h-11 px-6 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs flex items-center gap-2 mx-auto"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  Verify Biometric Key
                </Button>
              </div>
            )}

            {/* Step: Enterprise SSO Options */}
            {!isMfaStep && !loginSuccess && authMethod === "sso" && (
              <div className="mt-5 space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Sign in through your affiliated institution identity provider or Google Workspace for Education:
                </p>

                <button
                  type="button"
                  onClick={() => handleSsoClick("Google Workspace for Education")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-slate-200 flex items-center justify-center text-xs font-bold text-red-500">
                      G
                    </div>
                    <div>
                      <div>Google Workspace for Education</div>
                      <div className="text-[11px] text-slate-400 font-normal">@athena.edu and partner schools</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSsoClick("Microsoft Azure Active Directory / Office 365")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      MS
                    </div>
                    <div>
                      <div>Microsoft 365 Campus Directory</div>
                      <div className="text-[11px] text-slate-400 font-normal">Entra ID / SAML 2.0 Identity</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSsoClick("Eduroam / Shibboleth Federated Access")}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                      ED
                    </div>
                    <div>
                      <div>InCommon / eduroam Federation</div>
                      <div className="text-[11px] text-slate-400 font-normal">Inter-university research access</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}

            {/* Step 2: Multi-Factor Authentication (MFA) OTP Screen */}
            {isMfaStep && !loginSuccess && (
              <form onSubmit={handleMfaSubmit} className="mt-5 space-y-5 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                  <BadgeAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      Two-Step Verification Required
                    </span>
                    <p className="text-amber-700 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                      Enter the 6-digit verification code generated by your Authenticator app (Duo, Google, or YubiKey).
                    </p>
                  </div>
                </div>

                {/* 6 Digit Input Group */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block text-center">
                    Enter Verification Code
                  </Label>
                  <div className="flex justify-center gap-2">
                    {mfaCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`mfa-box-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleMfaInput(idx, e.target.value)}
                        onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-xl font-bold font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900 dark:text-white"
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-center text-slate-400">
                    Demo Code hint: enter any 6 digits (e.g. 5 4 8 2 9 1)
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMfaCode(["5", "4", "8", "2", "9", "1"]);
                      toast.info("Filled demo token: 548291");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Auto-Fill Demo Code
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("A push authorization request has been re-sent to your primary phone.")}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Push
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMfaStep(false)}
                    className="flex-1 h-11 rounded-xl text-xs font-medium"
                  >
                    Back to Sign In
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-11 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs shadow-md shadow-indigo-700/20"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Launch"}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen State */}
            {loginSuccess && (
              <div className="mt-6 py-6 text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-serif-title font-semibold text-xl text-slate-900 dark:text-white">
                    Access Granted: {currentRoleConfig.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    You have successfully established a secure session with Athena Federated Enclave.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentRoleConfig.portalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authenticated ID:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{identifier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Session Lease:</span>
                    <span className="text-slate-700 dark:text-slate-300">8 Hours (Auto-Renewing)</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <Button
                    onClick={() => {
                      setLoginSuccess(false);
                      setIsMfaStep(false);
                      toast.info("Session terminated safely.");
                    }}
                    variant="outline"
                    className="h-10 text-xs px-4 rounded-xl"
                  >
                    Sign Out Demo
                  </Button>
                  <Button
                    onClick={() => toast.success(`Redirecting to ${currentRoleConfig.portalName} dashboard...`)}
                    className="h-10 text-xs px-5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-semibold"
                  >
                    Enter Portal Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Security Footer Links */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <button 
                onClick={() => setTermModalOpen(true)}
                className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                {language === "fa" ? "سیاست استفاده مجاز" : "Acceptable Use Policy"}
              </button>
              <span>•</span>
              <button 
                onClick={() => toast.info("Privacy & Data: Complies with GDPR Article 6(1)(b) and Family Educational Rights and Privacy Act (FERPA).")}
                className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                {language === "fa" ? "حریم خصوصی آموزشی" : "FERPA Privacy"}
              </button>
              <span>•</span>
              <button 
                onClick={() => toast.info("Helpdesk ticket opened: Support representative will reach out via registered telephone.")}
                className="hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                {language === "fa" ? "دسترسی اضطراری" : "Emergency Access"}
              </button>
            </div>
          </div>

          {/* Quick Help Card underneath */}
          <div className="mt-4 p-4 rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">{language === "fa" ? "اولین بار است که وارد می‌شوید؟" : "First time User?"}</span>
                <span className="text-[11px] text-slate-500">{language === "fa" ? "اطلاعات ورود دانش‌آموزی خود را دریافت یا حساب آتنا خود را فعال کنید" : "Claim your student credentials or activate AthenaCard"}</span>
              </div>
            </div>
            <button
              onClick={() => toast.info("Claim Identity: Enter your 9-digit applicant reference number to activate campus directory record.")}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:-translate-x-0.5 transition-all duration-200 ease-out shrink-0 ml-2"
            >
              {language === "fa" ? "فعال‌سازی حساب ←" : "Activate Account →"}
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  Reset Campus Password
                </h3>
              </div>
              <button 
                onClick={() => setForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your registered primary university email address or student ID. We will transmit a secure time-limited cryptographic reset token to your registered secondary phone and email.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-xs font-semibold">Institutional Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="student.id@athena.edu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="text-xs h-10"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForgotPasswordOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!forgotEmail) {
                    toast.error("Please enter your academic email.");
                    return;
                  }
                  toast.success("Password reset instructions dispatched to your secondary email!");
                  setForgotPasswordOpen(false);
                  setForgotEmail("");
                }}
                className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold"
              >
                Send Reset Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Acceptable Use Policy Modal */}
      {termModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  Athena Institute Policy on Computing Resources
                </h3>
              </div>
              <button 
                onClick={() => setTermModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
              <p>
                <strong>1. Authorized Academic Use:</strong> Computing systems, research networks, and identity credentials provided by Athena Institute are intended strictly for educational, research, and authorized administrative activities.
              </p>
              <p>
                <strong>2. Credential Security:</strong> Students, faculty, and administrative personnel are prohibited from sharing authentication tokens, Duo passkeys, or passwords with third parties.
              </p>
              <p>
                <strong>3. Audit and Monitoring:</strong> All login sessions, API queries, and computational access are cryptographically logged for auditing, compliance with FERPA, and threat intelligence.
              </p>
              <p>
                <strong>4. Academic Integrity:</strong> Misuse of academic materials or unauthorized alteration of grading repositories is subject to disciplinary review by the Academic Standards Board.
              </p>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                onClick={() => setTermModalOpen(false)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs"
              >
                I Understand & Agree
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Global Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{language === "fa" ? "© ۲۰۲۶ مؤسسه فناوری و پژوهش آتنا. تمامی حقوق محفوظ است." : "© 2026 Athena Institute of Technology & Research. All rights reserved."}</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
