import React, { useEffect, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { BannerSlide, LiveFeedItem, Plan, UserPlan } from '../types';
import { formatBDT, formatCountdown, formatNumberEN } from '../utils/format';

interface HomeViewProps {
  banners: BannerSlide[];
  plans: Plan[];
  userPlans?: UserPlan[];
  liveFeed: LiveFeedItem[];
  buyingPlanId: string | null;
  onRecharge: () => void;
  onWithdraw: () => void;
  onSupport: () => void;
  onOpenTraining: () => void;
  onOpenProducts?: () => void;
  onBuyPlan: (plan: Plan) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  banners,
  plans,
  userPlans = [],
  liveFeed,
  buyingPlanId,
  onRecharge,
  onWithdraw,
  onSupport,
  onOpenTraining,
  onOpenProducts,
  onBuyPlan,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());

  const activeUserPlans = userPlans.filter((p) => p.status === 'active');

  useEffect(() => {
    if (activeUserPlans.length === 0) return;
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activeUserPlans.length]);

  const safeBanners = banners.length > 0 ? banners : [];

  useEffect(() => {
    if (safeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % safeBanners.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [safeBanners.length]);

  useEffect(() => {
    if (activeSlide >= safeBanners.length && safeBanners.length > 0) {
      setActiveSlide(0);
    }
  }, [activeSlide, safeBanners.length]);

  const currentBanner = safeBanners[activeSlide];
  const doubledFeed = [...liveFeed, ...liveFeed];

  return (
    <div className="space-y-5 pb-6">
      {/* 10-Slide Promotional Image Banner Carousel */}
      {currentBanner && (
        <section aria-label="প্রচারমূলক ব্যানার" className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-[#121722]">
          <div className="relative aspect-[2/1] max-h-[360px] w-full bg-[#141c29]">
            <img
              key={currentBanner.id}
              src={currentBanner.imageUrl}
              alt={currentBanner.title || `ব্যানার ${activeSlide + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain transition-opacity duration-500"
            />

            {/* Prev / Next Controls */}
            {safeBanners.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="আগের ব্যানার"
                  onClick={() =>
                    setActiveSlide((prev) => (prev - 1 + safeBanners.length) % safeBanners.length)
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="পরের ব্যানার"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % safeBanners.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Slide Dots */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
              {safeBanners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  aria-label={`ব্যানার ${idx + 1}`}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === activeSlide ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3 Quick Action Cards matching original single-row layout */}
      <section className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onRecharge}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-2 rounded-2xl bg-[#161b26] hover:bg-[#1c2331] border border-slate-800/90 transition-all active:scale-[0.98] cursor-pointer min-h-[96px]"
        >
          <div className="w-11 h-11 rounded-xl bg-[#202736] flex items-center justify-center text-emerald-400">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100 whitespace-nowrap">
            রিচার্জ
          </span>
        </button>

        <button
          type="button"
          onClick={onWithdraw}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-2 rounded-2xl bg-[#161b26] hover:bg-[#1c2331] border border-slate-800/90 transition-all active:scale-[0.98] cursor-pointer min-h-[96px]"
        >
          <div className="w-11 h-11 rounded-xl bg-[#202736] flex items-center justify-center text-amber-400">
            <Banknote className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100 whitespace-nowrap">
            উত্তোলন
          </span>
        </button>

        <button
          type="button"
          onClick={onSupport}
          className="flex flex-col items-center justify-center gap-2.5 py-4 px-2 rounded-2xl bg-[#161b26] hover:bg-[#1c2331] border border-slate-800/90 transition-all active:scale-[0.98] cursor-pointer min-h-[96px]"
        >
          <div className="w-11 h-11 rounded-xl bg-[#202736] flex items-center justify-center text-sky-400">
            <Headphones className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-100 whitespace-nowrap">
            কাস্টমার সার্ভিস
          </span>
        </button>
      </section>

      {/* Dedicated Training Guidline Icon Card */}
      <button
        type="button"
        onClick={onOpenTraining}
        className="w-full rounded-2xl bg-[#161b26] hover:bg-[#1c2331] border border-slate-800/90 px-4 py-3 flex items-center justify-between gap-3 transition-all active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#202736] flex items-center justify-center text-violet-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-sm font-num font-bold text-white">Training Guidline</div>
            <div className="text-[11px] text-slate-400 truncate">
              Modern Platform · Secure &amp; Scalable · Built for the Future
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {/* Active 24-Hour Reminder Timer Strip if user owns active plan(s) */}
      {activeUserPlans.length > 0 && (
        <button
          type="button"
          onClick={onOpenProducts}
          className="w-full rounded-2xl bg-gradient-to-r from-[#161e2e] to-[#131b29] border border-amber-500/35 px-4 py-3 flex items-center justify-between gap-3 text-left hover:border-amber-400/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {activeUserPlans[0].planName} · ২৪ ঘণ্টার রিমাইন্ডার টাইম
              </div>
              <div className="text-[11px] text-slate-400">
                পরবর্তী দৈনিক আয় স্বয়ংক্রিয়ভাবে যুক্ত হবে
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm sm:text-base font-mono-num font-extrabold text-amber-400">
              {formatCountdown(activeUserPlans[0].nextPayoutAt, nowMs)}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold">বিস্তারিত দেখুন</div>
          </div>
        </button>
      )}

      {/* VIP Investment Plans Grid (2 cols mobile, 3 cols desktop) */}
      <section aria-label="ভিআইপি ইনভেস্টমেন্ট প্ল্যান">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
          {plans.map((plan) => {
            const isBuying = buyingPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className="rounded-2xl bg-white text-slate-900 p-3.5 sm:p-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="text-center mb-2.5">
                    <h3 className="text-base sm:text-lg font-num font-extrabold text-slate-900">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Square Product Image */}
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3">
                    <img
                      src={plan.imageUrl}
                      alt={plan.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Plan Specs */}
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="text-slate-600">দৈনিক আয়:</span>
                      <span className="font-num font-bold text-rose-600">
                        {formatBDT(plan.dailyIncome)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="text-slate-600">মোট আয়:</span>
                      <span className="font-num font-bold text-rose-600">
                        {formatBDT(plan.totalIncome)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="text-slate-600">মেয়াদ:</span>
                      <span className="font-semibold text-rose-600">
                        <span className="font-num">{formatNumberEN(plan.validityDays)}</span> দিন
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  <div className="text-base sm:text-lg font-num font-extrabold text-slate-900 mb-2.5">
                    {formatBDT(plan.price)}
                  </div>
                  <button
                    type="button"
                    disabled={isBuying}
                    onClick={() => onBuyPlan(plan)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1f242f] hover:bg-[#11151d] text-white text-xs sm:text-sm font-bold transition-colors active:scale-[0.98] disabled:opacity-60 cursor-pointer whitespace-nowrap"
                  >
                    {isBuying ? 'প্রক্রিয়াধীন...' : 'এখনই কিনুন'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Floating Live Feed (Withdrawals, Income, Deposits moving upward) */}
      <section className="rounded-2xl bg-[#141923] border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">লাইভ উত্তোলন, ইনকাম ও ডিপোজিট</h3>
          </div>
          <span className="text-xs text-emerald-400 font-medium">রিয়েল-টাইম</span>
        </div>

        <div className="h-56 overflow-hidden relative px-3 py-2">
          <div className="animate-marquee-up space-y-2">
            {doubledFeed.map((item, idx) => {
              const isWithdraw = item.type === 'withdraw';
              const isDeposit = item.type === 'deposit';
              return (
                <div
                  key={`${item.id}_${idx}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-[#1a202d] border border-slate-800/70"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isWithdraw
                          ? 'bg-amber-500/15 text-amber-400'
                          : isDeposit
                          ? 'bg-sky-500/15 text-sky-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {isWithdraw ? (
                        <ArrowUpCircle className="w-4 h-4" />
                      ) : isDeposit ? (
                        <ArrowDownCircle className="w-4 h-4" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-num font-semibold text-slate-200 truncate">
                        {item.phone}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.label}
                        {item.method ? ` · ${item.method}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs sm:text-sm font-num font-bold ${
                        isWithdraw
                          ? 'text-amber-400'
                          : isDeposit
                          ? 'text-sky-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatBDT(item.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500">{item.timeText}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
