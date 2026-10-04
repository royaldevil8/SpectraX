import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Shield, Lock, Mail, ArrowRight, Fingerprint } from 'lucide-react';

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(onLogin, 600);
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col w-1/2 bg-bg-deep bg-grid relative overflow-hidden p-12 justify-between">
        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/20 rounded">
              <Fingerprint size={12} className="text-accent-cyan" />
              <span className="text-2xs uppercase tracking-wider text-accent-cyan font-medium">
                Multimodal Forensics
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-text-primary leading-tight mb-3">
            The investigation layer for <span className="text-accent-cyan">synthetic media.</span>
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Multimodal AI forensics, provenance and evidence fusion. From real / fake → what is suspicious, where, why, and can we reproduce it.
          </p>

          {/* Differentiator diagram */}
          <div className="bg-bg-surface/60 border border-border rounded-lg p-5">
            <div className="text-2xs uppercase tracking-wider text-text-muted mb-3 font-medium">
              Detection is not enough. Investigation is the product.
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div className="text-text-muted">
                <div className="mb-1 font-mono">Traditional</div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-bg-elevated rounded">MEDIA</span>
                  <span className="text-text-muted">→</span>
                  <span className="px-2 py-0.5 bg-danger/15 text-danger rounded">FAKE / REAL</span>
                </div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-accent-cyan">
                <div className="mb-1 font-mono">SpectraX</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-accent-cyan/15 rounded">MEDIA</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-accent-cyan/15 rounded">CASE</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-accent-cyan/15 rounded">EVIDENCE FUSION</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-text-muted text-xs">
          <Shield size={14} />
          <span>Protected forensic workspace — Enterprise-grade security</span>
        </div>

        {/* Decorative scan line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent animate-scan" />
      </div>

      {/* Right — Login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden mb-8">
            <Logo size="md" />
          </div>

          <h2 className="text-xl font-semibold text-text-primary mb-1">Sign in to your workspace</h2>
          <p className="text-sm text-text-secondary mb-6">Access the SpectraX forensic investigation platform.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary font-medium mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@organization.com"
                  className="w-full h-10 bg-bg-surface border border-border rounded-md pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs uppercase tracking-wider text-text-secondary font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••••••"
                  className="w-full h-10 bg-bg-surface border border-border rounded-md pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-colors"
                />
              </div>
            </div>

            <Button onClick={handleSubmit} size="lg" className="w-full" disabled={loading}
              icon={loading ? undefined : <ArrowRight size={16} />}>
              {loading ? 'Authenticating...' : 'Sign in to SpectraX'}
            </Button>

            <div className="relative flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-2xs text-text-muted uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button onClick={handleSubmit} variant="secondary" size="lg" className="w-full" icon={<Shield size={16} />}>
              Continue with SSO
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-2 text-2xs text-text-muted">
            <Lock size={12} />
            <span>Protected forensic workspace · End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
