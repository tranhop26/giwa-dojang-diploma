import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Award, Wallet, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const t = useTranslations('Landing');
  const locale = useLocale();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32 text-center relative z-10 flex flex-col items-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary mb-6 animate-fade-in">
            <Zap className="h-3.5 w-3.5 fill-primary" /> {t('badge')}
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-300 to-secondary mb-6">
            {t('title')} <br className="hidden sm:inline" /> {t('subtitle')}
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mb-10 leading-relaxed">
            {t('description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <Link
              href={`/${locale}/issue`}
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg hover:shadow-primary/25 cursor-pointer"
            >
              {t('btnIssue')}
            </Link>
            <Link
              href={`/${locale}/my-diplomas`}
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm text-foreground font-semibold hover:bg-muted/80 transition-all cursor-pointer"
            >
              {t('btnMy')}
            </Link>
            <a
              href="#explainer"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl border border-transparent text-muted-foreground font-semibold hover:text-foreground transition-all cursor-pointer"
            >
              {t('btnHow')}
            </a>
          </div>
        </section>

        {/* 3-Step Explainer Section */}
        <section id="explainer" className="container mx-auto px-4 py-20 border-t border-border/40 relative z-10 scroll-mt-16">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-4">
              {t('explainerTitle')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t('explainerSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm hover:border-primary/45 transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('step1Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('step1Desc')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm hover:border-primary/45 transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('step2Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('step2Desc')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-border/30 bg-card/45 backdrop-blur-sm hover:border-primary/45 transition-all flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{t('step3Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Why GIWA Section */}
        <section className="container mx-auto px-4 py-20 border-t border-border/40 relative z-10">
          <div className="max-w-3xl mx-auto rounded-3xl border border-border/40 bg-gradient-to-b from-card/60 to-card/20 p-8 md:p-12 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {t('giwaTitle')}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('giwaDesc')}
                </p>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                {/* Bullet 1 */}
                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary mt-0.5">
                    <Zap className="w-3.5 h-3.5 fill-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t('giwaBullet1Title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('giwaBullet1Desc')}</p>
                  </div>
                </div>

                {/* Bullet 2 */}
                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t('giwaBullet2Title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('giwaBullet2Desc')}</p>
                  </div>
                </div>

                {/* Bullet 3 */}
                <div className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary mt-0.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{t('giwaBullet3Title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('giwaBullet3Desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
