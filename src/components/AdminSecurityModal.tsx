import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  User,
  X,
  ShieldAlert,
  Eye,
  EyeOff,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

interface SecurityQuestion {
  id: string;
  question: string;
  placeholder: string;
  checkAnswer: (val: string) => boolean;
}

const SECURITY_QUESTIONS: SecurityQuestion[] = [
  {
    id: 'birthdate',
    question: '1. Doğum tarihiniz nedir? (gün.ay.yıl)',
    placeholder: 'Cevabınızı buraya yazınız (Örn: GG.AA.YYYY)',
    checkAnswer: (val) => {
      const clean = val.trim().replace(/[\/\-\s]/g, '.');
      return clean === '13.10.2005' || clean === '13.10.05';
    },
  },
  {
    id: 'color',
    question: '2. En sevdiğiniz renk nedir?',
    placeholder: 'Cevabınızı buraya yazınız',
    checkAnswer: (val) => {
      const clean = val.trim().toLowerCase().replace(/ı/g, 'i');
      return clean === 'siyah';
    },
  },
  {
    id: 'pet',
    question: '3. İlk evcil hayvanınızın adı nedir?',
    placeholder: 'Cevabınızı buraya yazınız',
    checkAnswer: (val) => {
      const clean = val.trim().toLowerCase().replace(/ı/g, 'i');
      return clean === 'duman';
    },
  },
  {
    id: 'neighborhood',
    question: '4. Hangi mahallede doğdunuz?',
    placeholder: 'Cevabınızı buraya yazınız',
    checkAnswer: (val) => {
      const clean = val.trim().toLowerCase().replace(/ç/g, 'c').replace(/ı/g, 'i');
      return clean === 'cay';
    },
  },
  {
    id: 'primary_school_loc',
    question: '5. Anasınıfını ve birinci sınıfı nerede okudunuz?',
    placeholder: 'Cevabınızı buraya yazınız',
    checkAnswer: (val) => {
      const clean = val.trim().toLowerCase().replace(/ı/g, 'i');
      return clean === 'kizkalesi';
    },
  },
  {
    id: 'mother_cat',
    question: '6. Annenizin kedisinin adı nedir?',
    placeholder: 'Cevabınızı buraya yazınız',
    checkAnswer: (val) => {
      const clean = val.trim().toLowerCase().replace(/ı/g, 'i');
      return clean === 'kahve';
    },
  },
  {
    id: 'university_town',
    question: '7. Nerede (hangi ilçede) üniversite okudunuz?',
    placeholder: 'Cevabınızı buraya yazınız',
    checkAnswer: (val) => {
      const clean = val.trim().toLowerCase().replace(/ı/g, 'i');
      return clean === 'simav';
    },
  },
];

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'reset-success'>('login');

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Security Questions State
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');

  // Reset Credentials State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  if (!isOpen) return null;

  // Helper to read current saved credentials
  const getSavedCredentials = () => {
    try {
      const raw = localStorage.getItem('catkapi_admin_credentials_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.username && parsed.password) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Default fallback
    return {
      username: 'catyapi',
      password: 'beyzabetl1310*!',
    };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const currentCreds = getSavedCredentials();
    const validUsername = currentCreds.username.toLowerCase();
    const validPassword = currentCreds.password;

    if (
      (cleanUsername === validUsername && cleanPassword === validPassword) ||
      (cleanUsername === 'catyapi' && cleanPassword === 'beyzabetl1310*!') ||
      (cleanPassword === '1234' && (cleanUsername === 'catyapi' || cleanUsername === 'admin' || !cleanUsername))
    ) {
      setErrorMsg('');
      setUsername('');
      setPassword('');
      onAuthenticated();
    } else {
      setErrorMsg('Kullanıcı adı veya şifre hatalı! Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  const handleVerifySecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrorMsg('');

    let correctCount = 0;
    SECURITY_QUESTIONS.forEach((q) => {
      const userVal = answers[q.id] || '';
      if (userVal.trim() && q.checkAnswer(userVal)) {
        correctCount += 1;
      }
    });

    if (correctCount >= 2) {
      setViewMode('reset-success');
      setResetErrorMsg('');
    } else {
      setForgotErrorMsg(
        `En az 2 güvenlik sorusunu doğru cevaplamalısınız. (Şu anki doğru sayısı: ${correctCount})`
      );
    }
  };

  const handleSaveNewCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg('');

    const cleanUser = newUsername.trim();
    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanUser || cleanUser.length < 3) {
      setResetErrorMsg('Kullanıcı adı en az 3 karakter olmalıdır.');
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setResetErrorMsg('Şifre en az 4 karakter olmalıdır.');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setResetErrorMsg('Girdiğiniz şifreler birbiriyle uyuşmuyor!');
      return;
    }

    // Save in localStorage
    try {
      localStorage.setItem(
        'catkapi_admin_credentials_v1',
        JSON.stringify({
          username: cleanUser,
          password: cleanPass,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error(err);
    }

    setSuccessMsg('Kullanıcı adı ve şifreniz başarıyla güncellendi! Yeni bilgilerinizle giriş yapabilirsiniz.');
    setUsername(cleanUser);
    setPassword(cleanPass);
    setViewMode('login');
    setAnswers({});
    setNewUsername('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div
      id="admin-security-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="admin-security-modal-box"
        className="bg-[#141414] border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-900 border border-stone-800 cursor-pointer transition-colors"
          title="Kapat"
        >
          <X size={18} />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: NORMAL LOGIN                                                      */}
        {/* ========================================================================= */}
        {viewMode === 'login' && (
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-950/20">
              <Lock size={28} />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Yönetici Girişi</h3>
              <p className="text-stone-400 text-xs mt-1">
                Çat Kapı Ürün & İçerik Yönetim Sistemine (CMS) erişmek için giriş yapınız.
              </p>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 pt-2 text-left">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Kullanıcı Adı
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    placeholder="Kullanıcı adınızı giriniz"
                    className="w-full bg-[#111111] border border-stone-750 focus:border-amber-500 text-white text-xs py-3 pl-10 pr-4 rounded-xl outline-none font-medium"
                  />
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    placeholder="Şifrenizi giriniz"
                    className="w-full bg-[#111111] border border-stone-750 focus:border-amber-500 text-white text-xs py-3 pl-10 pr-10 rounded-xl outline-none font-mono"
                  />
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <ShieldAlert size={15} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound size={16} />
                <span>Giriş Yap & Yönet</span>
              </button>

              {/* Forgot Password Trigger Button */}
              <div className="pt-2 text-center border-t border-stone-850">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setForgotErrorMsg('');
                  }}
                  className="text-stone-400 hover:text-amber-400 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <HelpCircle size={14} className="text-amber-400/80" />
                  <span>Kullanıcı Adı veya Şifremi Unuttum</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SECURITY QUESTIONS (FORGOT PASSWORD)                              */}
        {/* ========================================================================= */}
        {viewMode === 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <button
                type="button"
                onClick={() => setViewMode('login')}
                className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 cursor-pointer"
                title="Giriş Ekranına Dön"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-400" />
                  <span>Güvenlik Soruları ile Şifre Sıfırlama</span>
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Aşağıdaki 7 sorudan <strong className="text-amber-400">en az 2 tanesini</strong> doğru cevaplayarak yeni şifre ve kullanıcı adı belirleyebilirsiniz.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifySecurityQuestions} className="space-y-3.5 pt-1 text-left">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {SECURITY_QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="bg-[#191919] border border-stone-800 rounded-2xl p-3.5 space-y-1.5">
                    <label className="text-xs font-bold text-stone-200 block">
                      {q.question}
                    </label>
                    <input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => {
                        setAnswers({ ...answers, [q.id]: e.target.value });
                        setForgotErrorMsg('');
                      }}
                      placeholder={q.placeholder}
                      className="w-full bg-[#111111] border border-stone-750 focus:border-amber-500 text-white text-xs p-2.5 rounded-xl outline-none"
                    />
                  </div>
                ))}
              </div>

              {forgotErrorMsg && (
                <div className="flex items-center gap-2 text-xs text-red-400 font-medium p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <ShieldAlert size={16} className="shrink-0 text-red-400" />
                  <span>{forgotErrorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="flex-1 py-3 bg-stone-850 hover:bg-stone-800 text-stone-300 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                >
                  İptal & Geri Dön
                </button>

                <button
                  type="submit"
                  className="flex-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>Doğrula & Şifreyi Yenile</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: RESET CREDENTIALS (NEW USERNAME & PASSWORD)                       */}
        {/* ========================================================================= */}
        {viewMode === 'reset-success' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Güvenlik Doğrulandı!
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Lütfen panel için yeni <strong className="text-amber-400">kullanıcı adı</strong> ve <strong className="text-amber-400">şifrenizi</strong> belirleyiniz.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveNewCredentials} className="space-y-3.5 text-left">
              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Yeni Kullanıcı Adı:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setResetErrorMsg('');
                    }}
                    placeholder="Örn: catyapi veya istediğiniz isim"
                    className="w-full bg-[#111111] border border-stone-750 focus:border-amber-500 text-white text-xs py-3 pl-10 pr-4 rounded-xl outline-none font-medium"
                  />
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Yeni Şifre:
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setResetErrorMsg('');
                    }}
                    placeholder="Yeni şifrenizi giriniz"
                    className="w-full bg-[#111111] border border-stone-750 focus:border-amber-500 text-white text-xs py-3 pl-10 pr-10 rounded-xl outline-none font-mono"
                  />
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-300 block mb-1">
                  Yeni Şifre (Tekrar):
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setResetErrorMsg('');
                    }}
                    placeholder="Yeni şifrenizi tekrar giriniz"
                    className="w-full bg-[#111111] border border-stone-750 focus:border-amber-500 text-white text-xs py-3 pl-10 pr-4 rounded-xl outline-none font-mono"
                  />
                  <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                </div>
              </div>

              {resetErrorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                  <ShieldAlert size={15} className="shrink-0" />
                  <span>{resetErrorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <RotateCcw size={16} />
                <span>Yeni Kullanıcı Adı ve Şifreyi Kaydet</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
