import React, { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  Building2,
  Flame,
  ShoppingBag,
  Tv,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  Download,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowUpRight,
  Briefcase,
  Layers,
  BarChart3,
  Globe2,
  FileText,
  Clock,
  Sparkles,
  Target,
  Send,
  X,
  ExternalLink,
  ChevronDown,
  Lock
} from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: 'investment' | 'sports' | 'commercial' | 'general';
  capitalBracket?: string;
  message: string;
}

export function AujotenPage({ onBackToPmInvest }: { onBackToPmInvest?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sports' | 'commercial'>('sports');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [investorLoginModal, setInvestorLoginModal] = useState(false);
  const [selectedProspectusCategory, setSelectedProspectusCategory] = useState('Comprehensive Corporate Prospectus 2026/2027');
  
  // Contact Form State
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'investment',
    capitalBracket: '₦5M - ₦25M',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [downloadSubmitted, setDownloadSubmitted] = useState(false);
  const [downloadEmail, setDownloadEmail] = useState('');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      // simulate receipt
    }, 500);
  };

  const handleDownloadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!downloadEmail) return;
    setDownloadSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#071120] text-slate-100 font-sans selection:bg-[#F59E0B] selection:text-slate-950">
      
      {/* ── TOP ANNOUNCEMENT & AFFILIATION BANNER ── */}
      <div className="bg-[#030914] border-b border-slate-800/80 px-4 py-2 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono">
              Official Corporate Portal
            </span>
            <span className="text-slate-400 text-xs hidden md:inline">•</span>
            <span className="text-xs text-slate-300">
              Aujoten Nig. Ltd — Empowering talent, industrial commerce & high-yield strategic ventures.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {onBackToPmInvest && (
              <button
                onClick={onBackToPmInvest}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors text-xs cursor-pointer"
                id="btn_back_to_pminvest"
              >
                <ArrowUpRight className="w-3.5 h-3.5 rotate-225" />
                <span>Return to PM Invest</span>
              </button>
            )}
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setInvestorLoginModal(true)}
              className="text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              id="btn_open_investor_portal"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Investor Portal Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN STICKY NAVBAR ── */}
      <header className="sticky top-0 z-40 bg-[#071120]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 font-extrabold text-[#071120] text-2xl tracking-tighter">
              A
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white uppercase block leading-none font-serif">
                AUJOTEN
              </span>
              <span className="text-[10px] tracking-[0.25em] text-amber-400 uppercase font-mono font-semibold block mt-1">
                VENTURES & HOLDINGS
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-wider font-semibold text-slate-300">
            <button onClick={() => scrollToSection('hero')} className="hover:text-amber-400 transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="hover:text-amber-400 transition-colors cursor-pointer">
              About
            </button>
            <button onClick={() => scrollToSection('investments')} className="hover:text-amber-400 transition-colors cursor-pointer text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Investments
            </button>
            <button onClick={() => scrollToSection('services')} className="hover:text-amber-400 transition-colors cursor-pointer">
              Divisions & Services
            </button>
            <button onClick={() => scrollToSection('sectors')} className="hover:text-amber-400 transition-colors cursor-pointer">
              Sectors
            </button>
            <button onClick={() => scrollToSection('investor-relations')} className="hover:text-amber-400 transition-colors cursor-pointer">
              Investor Relations
            </button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-amber-400 transition-colors cursor-pointer">
              Contact
            </button>
          </nav>

          {/* Header Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedProspectusCategory('Corporate Group Prospectus');
                setDownloadModalOpen(true);
              }}
              className="border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-bold px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              id="btn_nav_prospectus"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Prospectus</span>
            </button>

            <button
              onClick={() => scrollToSection('contact')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              id="btn_nav_partner"
            >
              <span>Partner With Us</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-0.5 bg-amber-400 rounded-full transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`h-0.5 bg-amber-400 rounded-full transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-amber-400 rounded-full transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#071120] border-b border-slate-800 px-6 py-5 space-y-4 animate-fade-in text-sm">
            <button onClick={() => scrollToSection('hero')} className="block w-full text-left font-semibold text-slate-300 hover:text-amber-400 py-1">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="block w-full text-left font-semibold text-slate-300 hover:text-amber-400 py-1">
              About Aujoten
            </button>
            <button onClick={() => scrollToSection('investments')} className="block w-full text-left font-semibold text-amber-400 py-1">
              ★ Strategic Investments
            </button>
            <button onClick={() => scrollToSection('services')} className="block w-full text-left font-semibold text-slate-300 hover:text-amber-400 py-1">
              Divisions & Services
            </button>
            <button onClick={() => scrollToSection('sectors')} className="block w-full text-left font-semibold text-slate-300 hover:text-amber-400 py-1">
              Target Sectors
            </button>
            <button onClick={() => scrollToSection('investor-relations')} className="block w-full text-left font-semibold text-slate-300 hover:text-amber-400 py-1">
              Investor Relations
            </button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left font-semibold text-slate-300 hover:text-amber-400 py-1">
              Contact & Inquiries
            </button>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDownloadModalOpen(true);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Prospectus
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Partner With Us
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          1. HERO SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background Gradients & Geometric Visuals */}
        <div className="absolute inset-0 bg-radial-at-t from-slate-900/60 via-[#071120] to-[#040914] pointer-events-none" />
        <div className="absolute -top-40 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs text-amber-400 font-mono font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>NIGERIAN MULTI-SECTOR CONGLOMERATE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] font-serif">
                Excellence in <span className="text-amber-400">Sports</span>, <span className="text-amber-400">Entertainment</span> & Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Investments</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Empowering grassroots talent, building scalable industrial ventures, creating enduring legacies, and delivering predictable, high-yield ROI across Nigeria and West Africa.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => scrollToSection('investments')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                  id="btn_hero_investments"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Investment Opportunities</span>
                </button>

                <button
                  onClick={() => scrollToSection('services')}
                  className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  id="btn_hero_services"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Explore Our Divisions</span>
                </button>

                <button
                  onClick={() => scrollToSection('contact')}
                  className="border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:text-amber-300 font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  id="btn_hero_partner"
                >
                  <Users className="w-4 h-4" />
                  <span>Partner With Us</span>
                </button>
              </div>

              {/* Key Trust Metrics Strip */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Indigenous Ownership</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">₦2.5B+</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Pipeline</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">24.8%</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Avg. Target Project ROI</div>
                </div>
              </div>
            </div>

            {/* Right Graphic / Interactive Showcase */}
            <div className="lg:col-span-5">
              <div className="relative bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl" />

                {/* Showcase Header */}
                <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Live Portfolio Highlights
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    2026/2027 FISCAL
                  </span>
                </div>

                {/* Vertical Cards */}
                <div className="space-y-3.5">
                  <div className="bg-[#030914]/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            Sports Talent & Club Equity
                          </h4>
                          <p className="text-xs text-slate-400">Grassroots scouting, academy operations & international scouting</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#030914]/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                            Real Estate & Mixed Developments
                          </h4>
                          <p className="text-xs text-slate-400">Commercial plazas, residential estates & recreation infrastructure</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                        Yielding
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#030914]/80 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                          <Flame className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                            Oil, Gas & Energy Commerce
                          </h4>
                          <p className="text-xs text-slate-400">Downstream distribution, mining concessions & industrial logistics</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
                        Expansion
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Summary */}
                <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Structured Profit-Sharing Models</span>
                  <button 
                    onClick={() => scrollToSection('investments')}
                    className="text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View All 6 Verticals <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          2. ABOUT US SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 bg-[#040914] border-y border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Corporate Heritage & Profile
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              Building Wealth and Legacy From Nigerian Roots
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Aujoten is an indigenous powerhouse driven by a singular mandate: unlocking the vast economic and human capital potential of Nigeria across sports, commerce, entertainment, and strategic assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Vision & Mission Cards */}
            <div className="bg-[#071120] border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Our Strategic Mission</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                To build high-performing commercial enterprises and discover grassroots sports talent, converting untapped Nigerian potential into structured, institutional-grade investments that deliver sustainable financial yields.
              </p>
            </div>

            <div className="bg-[#071120] border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">The Pan-African Vision</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                To become West Africa’s most respected diversified investment holding company, recognized globally for bridging local industrial enterprise with international sports management and venture capital standards.
              </p>
            </div>

            <div className="bg-[#071120] border border-slate-800 p-8 rounded-3xl space-y-4 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Governance & Transparency</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Operating with institutional compliance, rigorous fiduciary oversight, clear equity structures, and audited accounts under Nigerian commercial regulations and partner boards.
              </p>
            </div>
          </div>

          {/* Key Statistics Grid */}
          <div className="bg-gradient-to-r from-slate-900 via-[#071120] to-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">10+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Years of Combined Leadership</div>
              </div>
              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">42+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects Completed & Active</div>
              </div>
              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">18+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Strategic Joint Ventures</div>
              </div>
              <div className="space-y-1 pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">₦1.2B+</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cumulative Partner Returns</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          3. STRATEGIC INVESTMENT VERTICALS (NEW DEDICATED SECTION)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="investments" className="py-24 bg-[#071120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs text-amber-400 font-mono font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>HIGH YIELD & PROFIT-SHARING MODELS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
                Strategic Investment Verticals
              </h2>
              <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                Co-invest alongside Aujoten in vetted, asset-backed commercial pipelines engineered for capital preservation and accelerated capital appreciation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedProspectusCategory('Investment Verticals Deck');
                  setDownloadModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-amber-500/15 cursor-pointer font-mono"
                id="btn_download_vert_prospectus"
              >
                <Download className="w-4 h-4" /> Download Prospectus
              </button>
            </div>
          </div>

          {/* 6 Investment Verticals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            
            {/* 1. Sports Franchises */}
            <div className="bg-[#030914] border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Sports Franchises & Club Equity
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct equity participation in professional football academies, local leagues, player development pipelines, and player international transfer rights with high exit valuations.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Talent transfer royalties</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Academy asset equity</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yield Horizon: <strong>12-36 Months</strong></span>
                <span className="text-emerald-400 font-bold font-mono">High Upside</span>
              </div>
            </div>

            {/* 2. Real Estate Development */}
            <div className="bg-[#030914] border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Real Estate Development Projects
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Prime commercial logistics centers, sports arenas, residential multi-family complexes, and high-footfall shopping plazas in Lagos, Abuja, and key growth corridors.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Physical asset backing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Quarterly rental payouts</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yield Horizon: <strong>Ongoing Cashflow</strong></span>
                <span className="text-amber-400 font-bold font-mono">Stable Yield</span>
              </div>
            </div>

            {/* 3. Oil & Gas Ventures */}
            <div className="bg-[#030914] border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Oil & Gas Venture Partnerships
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Downstream petroleum distribution, petroleum product haulage, bulk storage leasing, and solid minerals extraction ventures backed by off-taker contracts.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Short-cycle commodity trades</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Contract-backed margins</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yield Horizon: <strong>6-12 Months</strong></span>
                <span className="text-purple-400 font-bold font-mono">High Velocity</span>
              </div>
            </div>

            {/* 4. FMCG Distribution */}
            <div className="bg-[#030914] border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  FMCG & Wholesale Networks
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Capitalizing large-scale consumer goods distribution, essential commodities importation, inventory financing, and nationwide retail warehousing networks.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Inflation-hedged goods</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Fast inventory turnover</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yield Horizon: <strong>Monthly Turnover</strong></span>
                <span className="text-emerald-400 font-bold font-mono">Recurrent</span>
              </div>
            </div>

            {/* 5. Media & Broadcasting */}
            <div className="bg-[#030914] border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Media Production & Broadcasting
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sports content licensing, multimedia studio infrastructure, digital live-streaming rights, tournament sponsorship syndication, and entertainment intellectual property.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Sponsorship revenues</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Digital streaming royalties</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yield Horizon: <strong>Per-Season Rights</strong></span>
                <span className="text-rose-400 font-bold font-mono">Scalable</span>
              </div>
            </div>

            {/* 6. M&A and Asset Management */}
            <div className="bg-[#030914] border border-slate-800 hover:border-amber-500/50 p-6 rounded-3xl space-y-4 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Mergers, Acquisitions & Buyouts
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Acquisition of undervalued industrial equipment, operational restructuring of mid-sized commercial firms, and joint equity recapitalizations.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Majority/Minority equity stakes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Operational dividend stream</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Yield Horizon: <strong>Strategic 3-5 Years</strong></span>
                <span className="text-amber-400 font-bold font-mono">Enterprise</span>
              </div>
            </div>

          </div>

          {/* Why Invest with Aujoten Pillar Box */}
          <div className="bg-gradient-to-br from-slate-900 to-[#030914] border border-amber-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                  Investor Safeguards & Advantages
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                  Why Institutional & Private Investors Choose Aujoten
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  We blend deep local Nigerian market execution with institutional risk management. Every project is backed by tangible assets, verified supply agreements, or direct ownership equity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Cross-Sector Diversification</h5>
                      <p className="text-[11px] text-slate-400">Spreads risk across non-correlated industries.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Ground-Level Execution</h5>
                      <p className="text-[11px] text-slate-400">Unmatched access to high-barrier Nigerian opportunities.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Audited Profit Sharing</h5>
                      <p className="text-[11px] text-slate-400">Transparent quarterly financial statements.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white">Predictable Milestone Exits</h5>
                      <p className="text-[11px] text-slate-400">Structured liquidity and buyback clauses.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#071120] border border-slate-800 p-6 rounded-2xl space-y-4 text-center">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Request an Investor Briefing</h4>
                <p className="text-xs text-slate-400">
                  Schedule a private 1-on-1 consultation with our corporate investment committee.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                    id="btn_schedule_consultation"
                  >
                    <Calendar className="w-4 h-4" /> Schedule Consultation
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProspectusCategory('Investment Summary Sheet');
                      setDownloadModalOpen(true);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="btn_modal_prospectus"
                  >
                    <Download className="w-4 h-4 text-amber-400" /> Download Prospectus (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          4. OUR SERVICES (TWO-COLUMN DIVISION LAYOUT)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-24 bg-[#040914] border-y border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Operational Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              Our Core Operational Divisions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Structured into two complementary divisions bridging talent development with heavy commercial enterprise.
            </p>
          </div>

          {/* Division Toggle for Mobile/Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-[#071120] p-1 rounded-2xl border border-slate-800 flex gap-2">
              <button
                onClick={() => setActiveTab('sports')}
                className={`px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'sports'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Sports & Entertainment</span>
              </button>
              <button
                onClick={() => setActiveTab('commercial')}
                className={`px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'commercial'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Industrial & Commercial</span>
              </button>
            </div>
          </div>

          {/* Two Columns Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMN 1: Sports & Entertainment Division */}
            <div className={`bg-[#071120] border ${activeTab === 'sports' ? 'border-amber-500/60 shadow-xl shadow-amber-500/10' : 'border-slate-800'} rounded-3xl p-8 space-y-6 transition-all`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif">Sports & Entertainment Division</h3>
                    <p className="text-xs text-amber-400 font-mono">Talent Incubation, Franchising & Media</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Grassroots Sports Development & Talent Management
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    Scouting networks across all 36 Nigerian states. Professional training camps, nutrition programs, contract representation, and trials with top European & North American clubs.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" /> Sports Club Ownership & Equipment Franchising
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    Acquiring and revitalizing domestic football clubs, modernizing stadium operations, training facilities, and manufacturing/importation of certified athletic gear.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" /> Event Hosting, Ticketing & Corporate Branding
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    End-to-end management of marathons, youth tournaments, celebrity exhibition matches, integrated digital ticketing systems, and brand sponsorship rights.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400" /> Sports Media Production (TV/Radio/Streaming)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    High-definition broadcast infrastructure, live sports podcasts, documentary storytelling of rising Nigerian athletic stars, and syndicated content licensing.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, inquiryType: 'sports' }));
                    scrollToSection('contact');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  Inquire About Sports Programs <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: Industrial & Commercial Division */}
            <div className={`bg-[#071120] border ${activeTab === 'commercial' ? 'border-amber-500/60 shadow-xl shadow-amber-500/10' : 'border-slate-800'} rounded-3xl p-8 space-y-6 transition-all`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-serif">Industrial & Commercial Division</h3>
                    <p className="text-xs text-blue-400 font-mono">Commodities, Real Estate & M&A</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-blue-400" /> Oil & Gas, Mining & Real Estate Development
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    Commercial development projects, industrial warehousing parks, licensed mining operations (lithium, tin, marble), and petroleum supply logistics.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-blue-400" /> FMCG Trading & General Merchandise
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    Bulk foodstuff distribution, industrial chemicals, retail franchise management, and nationwide supply chain warehousing for fast-moving consumer products.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" /> Mergers, Acquisitions & Asset Management
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    Corporate restructuring, distressed asset turnarounds, balance sheet recapitalizations, and institutional asset leasing for industrial machinery.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#030914] border border-slate-800/80 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" /> Strategic Partnerships & Profit-Sharing
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">
                    Structuring joint ventures with diaspora investors and domestic corporations with transparent reserve management and defined performance milestones.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, inquiryType: 'commercial' }));
                    scrollToSection('contact');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  Inquire About Commercial Partnerships <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          5. WHY CHOOSE AUJOTEN
      ════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-[#071120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              The Aujoten Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              Why Partner With Aujoten
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We provide the institutional bridges and security frameworks needed to succeed in Nigeria’s fastest-growing sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Local Nigerian Expertise</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deep ground-level connections across regulatory bodies, community leaders, and distribution hubs across all geopolitical zones.
              </p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Diversified Risk Pool</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Balancing volatile high-upside media/sports royalties with stable cashflow from real estate and essential commodity trading.
              </p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Strong ROI Potential</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggressive focus on margin efficiency, direct producer sourcing, and value-add processing to maximize investor payouts.
              </p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Transparent Governance</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Audited statements, reserve fund segregation, clear legal contracts, and quarterly investor briefings.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          6. TARGET SECTORS GRID
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="sectors" className="py-20 bg-[#040914] border-y border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Key Focus Markets
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              Our Active Target Sectors
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Targeted deployment across high-barrier Nigerian growth industries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Sports & Recreation', icon: Trophy, color: 'text-amber-400', desc: 'Clubs & Academies' },
              { name: 'Energy & Mining', icon: Flame, color: 'text-purple-400', desc: 'Solid Minerals & Gas' },
              { name: 'Real Estate', icon: Building2, color: 'text-blue-400', desc: 'Plazas & Residential' },
              { name: 'Media & Entertainment', icon: Tv, color: 'text-rose-400', desc: 'Broadcast & Rights' },
              { name: 'Retail & FMCG', icon: ShoppingBag, color: 'text-emerald-400', desc: 'Wholesale Trade' },
              { name: 'Asset Management', icon: BarChart3, color: 'text-amber-300', desc: 'Equity & Restructuring' }
            ].map((sector, i) => {
              const Icon = sector.icon;
              return (
                <div key={i} className="bg-[#071120] border border-slate-800 hover:border-amber-500/40 p-5 rounded-2xl text-center space-y-2.5 transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-slate-900 mx-auto flex items-center justify-center ${sector.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors leading-tight">
                    {sector.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">{sector.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          7. INVESTOR RELATIONS (NEW DEDICATED SECTION)
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="investor-relations" className="py-24 bg-[#071120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              Investor Relations & Co-Ventures
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
              Partner in Growth With Aujoten
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We structure custom investment vehicles designed to match institutional mandates, diaspora capital pools, and accredited individual investors.
            </p>
          </div>

          {/* Investment Models Table / Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            
            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                Model 01
              </span>
              <h4 className="text-base font-bold text-white">Equity Participation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct shareholding in holding-level special purpose vehicles (SPVs) with voting or non-voting preference shares.
              </p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase bg-blue-500/10 px-2 py-0.5 rounded">
                Model 02
              </span>
              <h4 className="text-base font-bold text-white">Joint Ventures (JV)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project-specific co-funding with shared technical execution, designated reserve, and pre-defined revenue splits.
              </p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded">
                Model 03
              </span>
              <h4 className="text-base font-bold text-white">Profit-Sharing Agreements</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quarterly or annual profit distribution schedules linked to physical commodity trade turnover and real estate lease rents.
              </p>
            </div>

            <div className="bg-[#030914] border border-slate-800 p-6 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                Model 04
              </span>
              <h4 className="text-base font-bold text-white">Asset Leasing & Debt Notes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secured fixed-income instruments backed by physical equipment, industrial machinery, and real estate collateral.
              </p>
            </div>

          </div>

          {/* Testimonial / Partner Quote Showcase */}
          <div className="bg-[#030914] border border-slate-800 rounded-3xl p-8 sm:p-10 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {'★'.repeat(5)}
                </div>
                <blockquote className="text-base sm:text-lg text-slate-200 font-serif italic leading-relaxed">
                  "Aujoten has provided our diaspora syndicate with an unmatched, fully verified gateway to participate in grassroots sports rights and real estate developments in Nigeria. Their reporting rigor and transparent profit distributions have exceeded our expectations."
                </blockquote>
                <div>
                  <div className="text-sm font-bold text-white">Dr. K. Adeyemi, MD</div>
                  <div className="text-xs text-amber-400 font-mono">Chairman, West African Diaspora Capital Syndicate</div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-[#071120] border border-slate-800 p-6 rounded-2xl text-center space-y-3">
                <FileText className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Investor Relations Pack</h4>
                <p className="text-xs text-slate-400">
                  Includes audited performance statements, legal SPV structures, and project pipeline schedules.
                </p>
                <button
                  onClick={() => {
                    setSelectedProspectusCategory('Comprehensive Investor Pack');
                    setDownloadModalOpen(true);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                >
                  <Download className="w-3.5 h-3.5" /> Download Pack
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          8. CALL TO ACTION & CONTACT FORM SECTION
      ════════════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 bg-[#030914] border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: CTA Info */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Get In Touch
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-serif">
                Ready to Build Wealth and Create Legacy With Us?
              </h2>

              <p className="text-sm text-slate-400 leading-relaxed">
                Whether you are an institutional investor, corporate partner, athletic talent, or seeking industrial joint ventures, our executive team is ready to assist you.
              </p>

              {/* Direct Channels */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Corporate Registered Headquarters:</strong>
                    <span>Victoria Island / Lekki Phase 1 Corridor, Lagos, Nigeria</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Official Inquiries:</strong>
                    <span className="font-mono text-amber-400">contact@aujoten.com.ng • relations@aujoten.com.ng</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block">Investor Desk & Partnerships:</strong>
                    <span className="font-mono">+234 (0) 800 AUJOTEN / +234 1 888 2930</span>
                  </div>
                </div>
              </div>

              {/* Action Selector Buttons */}
              <div className="pt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Quick Inquiry Pathways:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, inquiryType: 'investment' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      formData.inquiryType === 'investment'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    Investment Opportunities
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, inquiryType: 'sports' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      formData.inquiryType === 'sports'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    Sports Programs
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, inquiryType: 'commercial' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      formData.inquiryType === 'commercial'
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    Business Partnerships
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#071120] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                
                {formSubmitted ? (
                  <div className="text-center py-12 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-serif">Inquiry Transmitted Successfully</h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-white">{formData.fullName}</strong>. Your inquiry has been routed to our corporate relations desk. An executive representative will reach out to <span className="text-amber-400 font-mono">{formData.email}</span> within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          inquiryType: 'investment',
                          capitalBracket: '₦5M - ₦25M',
                          message: ''
                        });
                      }}
                      className="mt-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Send className="w-4 h-4 text-amber-400" /> Executive Partnership & Investor Inquiry
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Fill out the form below to receive immediate access to our corporate desk.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Full Name / Company Representative *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Chief Emeka Obi"
                          className="w-full bg-[#030914] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Corporate / Personal Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. e.obi@venturecorp.ng"
                          className="w-full bg-[#030914] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Phone Number (WhatsApp Preferred)
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +234 803 000 0000"
                          className="w-full bg-[#030914] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Inquiry Classification *
                        </label>
                        <select
                          value={formData.inquiryType}
                          onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value as any })}
                          className="w-full bg-[#030914] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                        >
                          <option value="investment">Strategic Investment & Equity</option>
                          <option value="sports">Sports Development & Academies</option>
                          <option value="commercial">Industrial / Commodity Commerce</option>
                          <option value="general">General Partnership / Media</option>
                        </select>
                      </div>
                    </div>

                    {formData.inquiryType === 'investment' && (
                      <div className="animate-fade-in">
                        <label className="block text-xs font-semibold text-amber-400 mb-1">
                          Intended Capital Deployment Bracket
                        </label>
                        <select
                          value={formData.capitalBracket}
                          onChange={(e) => setFormData({ ...formData, capitalBracket: e.target.value })}
                          className="w-full bg-[#030914] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        >
                          <option value="₦1M - ₦5M">₦1,000,000 – ₦5,000,000 (Starter Syndicate)</option>
                          <option value="₦5M - ₦25M">₦5,000,000 – ₦25,000,000 (Direct Project Equity)</option>
                          <option value="₦25M - ₦100M">₦25,000,000 – ₦100,000,000 (Major SPV Partner)</option>
                          <option value="₦100M+">₦100,000,000+ (Institutional Mandate)</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Proposal Overview / Message Details *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe your proposal, project interest, or specific requirements..."
                        className="w-full bg-[#030914] border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                      id="btn_submit_inquiry"
                    >
                      <span>Transmit Official Inquiry</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          9. FOOTER & INVESTOR DISCLAIMER
      ════════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#02060D] border-t border-slate-800 text-slate-400 text-xs py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-extrabold text-[#071120] text-xl">
                  A
                </div>
                <span className="text-lg font-extrabold text-white tracking-wider uppercase font-serif">
                  AUJOTEN NIGERIA LTD
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                A diversified Nigerian private company specializing in sports development, entertainment franchising, industrial commerce, and high-yield strategic investment opportunities.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                RC: 1894022 • Registered in the Federal Republic of Nigeria
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToSection('hero')} className="hover:text-amber-400 transition-colors">Corporate Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-amber-400 transition-colors">About Aujoten</button></li>
                <li><button onClick={() => scrollToSection('investments')} className="hover:text-amber-400 transition-colors text-amber-400">Investment Verticals</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-amber-400 transition-colors">Divisions & Services</button></li>
                <li><button onClick={() => scrollToSection('sectors')} className="hover:text-amber-400 transition-colors">Target Sectors</button></li>
                <li><button onClick={() => scrollToSection('investor-relations')} className="hover:text-amber-400 transition-colors">Investor Relations</button></li>
              </ul>
            </div>

            {/* Investment Documents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Documents & Portals</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button 
                    onClick={() => {
                      setSelectedProspectusCategory('Corporate Prospectus 2026');
                      setDownloadModalOpen(true);
                    }} 
                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3 text-amber-400" />
                    <span>2026/2027 Prospectus</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      setSelectedProspectusCategory('Sports Talent Investment Deck');
                      setDownloadModalOpen(true);
                    }} 
                    className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3 text-amber-400" />
                    <span>Sports Deck (PDF)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setInvestorLoginModal(true)} 
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Investor Portal Login</span>
                  </button>
                </li>
                {onBackToPmInvest && (
                  <li>
                    <button 
                      onClick={onBackToPmInvest} 
                      className="text-slate-300 hover:text-white flex items-center gap-1.5"
                    >
                      <ArrowUpRight className="w-3 h-3 rotate-225" />
                      <span>PM Invest Platform</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal & Regulatory */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Contact Desk</h4>
              <div className="text-xs text-slate-400 space-y-1.5">
                <p>Lagos Corporate Office:</p>
                <p className="text-slate-300">Plot 12B, Commercial Boulevard, Lekki Phase 1, Lagos</p>
                <p className="font-mono text-amber-400 pt-1">desk@aujoten.com.ng</p>
              </div>
            </div>

          </div>

          {/* Mandatory Investor Disclaimer */}
          <div className="pt-8 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-2 leading-relaxed">
            <p className="font-bold text-slate-400 uppercase tracking-wider">
              Legal & Statutory Investor Disclaimer:
            </p>
            <p>
              Information presented on this portal is intended strictly for accredited corporate entities, institutional partners, and qualified private co-investors. Aujoten Nig. Ltd operates in strict accordance with the Companies and Allied Matters Act (CAMA) and relevant Nigerian corporate investment statutes. Projections, target ROIs, and expected timelines are based on current market feasibility models and historic performance. All co-investments are governed by tailored Special Purpose Vehicle (SPV) contracts and formal joint-venture documentation.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Aujoten Nigeria Limited. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Investment</span>
              <span>•</span>
              <span className="hover:text-slate-300 cursor-pointer">Anti-Money Laundering (AML) Compliance</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 1: PROSPECTUS DOWNLOAD MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071120] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => {
                setDownloadModalOpen(false);
                setDownloadSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {downloadSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Prospectus Dispatched</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We have transmitted the <strong className="text-white">{selectedProspectusCategory}</strong> directly to <span className="text-amber-400 font-mono">{downloadEmail}</span>.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setDownloadModalOpen(false);
                      setDownloadSubmitted(false);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDownloadSubmit} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Download Prospectus</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{selectedProspectusCategory}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Please enter your work or personal email to receive the full unredacted corporate prospectus, financial models, and project timelines.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={downloadEmail}
                    onChange={(e) => setDownloadEmail(e.target.value)}
                    placeholder="e.g. investor@fund.com"
                    className="w-full bg-[#030914] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-[#030914] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Confidential Briefing
                  </div>
                  <p>Includes complete financial schedules and SPV equity breakdown.</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
                >
                  <Download className="w-4 h-4" /> Download PDF Instantly
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL 2: INVESTOR PORTAL LOGIN MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {investorLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071120] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setInvestorLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Aujoten Investor Portal</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Institutional Co-Ventures & SPV Access</p>
                </div>
              </div>

              <div className="p-4 bg-[#030914] border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300">
                <p>
                  Aujoten institutional investor portal is linked with our secure portfolio management infrastructure.
                </p>
                <p className="text-amber-400 font-mono text-[11px]">
                  • For PM Invest yield participants: You can log in directly using your registered investor credentials.
                </p>
              </div>

              {onBackToPmInvest && (
                <button
                  onClick={() => {
                    setInvestorLoginModal(false);
                    onBackToPmInvest();
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open PM Invest Authentication Panel</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setInvestorLoginModal(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
