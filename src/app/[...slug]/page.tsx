import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolContentByPath, getCategoryContentByPath } from '../../data/toolContent';
import CategoryView from '../../components/CategoryView';
import ToolContentEnhancer from '../../components/ToolContentEnhancer';
import CalculatorWidget from '../../components/CalculatorWidget';

interface RouteParams {
  slug: string[];
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { slug } = await params;
  const path = '/' + slug.join('/');
  
  const toolContent = getToolContentByPath(path);
  if (toolContent) {
    return {
      title: toolContent.seoTitle,
      description: toolContent.seoDescription,
      keywords: toolContent.seoKeywords,
      alternates: {
        canonical: path,
      },
    };
  }

  const categoryContent = getCategoryContentByPath(path);
  if (categoryContent) {
    return {
      title: `${categoryContent.name} Tools - Free Online Calculators | Tuitility`,
      description: categoryContent.description,
      alternates: {
        canonical: path,
      },
    };
  }

  return {
    title: 'Page Not Found',
  };
}

export default async function Page({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params;
  const path = '/' + slug.join('/');

  // 1. Check if it's a category page (e.g. /math, /finance)
  const categoryContent = getCategoryContentByPath(path);
  if (categoryContent) {
    return <CategoryView categoryData={categoryContent as any} />;
  }

  // 2. Check if it's a calculator tool (e.g. /math/calculators/fraction-calculator)
  const toolContent = getToolContentByPath(path);
  if (toolContent) {
    const categoryLink = toolContent.category.toLowerCase() === 'utility' ? '/utility-tools' : `/${toolContent.category.toLowerCase()}`;
    const fallbackWidget = (
      <div className="w-full max-w-3xl p-10 bg-slate-50 border border-slate-100 rounded-3xl text-center font-bold text-slate-400/80 shadow-sm flex flex-col items-center gap-3">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-350 text-xl border border-slate-200/50">
          <i className={`${toolContent.icon}`}></i>
        </div>
        <p className="text-sm">Widget implementation is in queue for {toolContent.name}</p>
        <p className="text-xs font-medium text-slate-400">Our engineering pair is migrating this component category-by-category.</p>
      </div>
    );

    return (
      <div className="flex flex-col gap-12 text-left">
        {/* Tool Title and Breadcrumbs Card */}
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 animate-fade-in-up">
          
          {/* Floating Category Backdrop Symbols */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.06] text-[#1a1a1a]">
            {path === '/math/calculators/fraction-calculator' || path === '/math/calculators/comparing-fractions-calculator' || path === '/math/calculators/lcd-calculator' || path === '/math/calculators/fraction-to-percent-calculator' || path === '/math/calculators/improper-fraction-to-mixed-calculator' || path === '/math/calculators/percent-to-fraction-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">½</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">¾</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">⅝</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">¼</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">⅓</div>
                <div className="absolute top-8 right-10 text-4xl font-black">a/b</div>
              </>
            ) : path === '/math/calculators/binary-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">0</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">1</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">1010</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">1101</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">0110</div>
                <div className="absolute top-8 right-10 text-4xl font-black">AND</div>
              </>
            ) : path === '/math/calculators/lcm-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">LCM</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">GCD</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">12</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">18</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">20</div>
                <div className="absolute top-8 right-10 text-4xl font-black">max</div>
              </>
            ) : path === '/math/calculators/decimal-to-fraction-calculator' || path === '/math/calculators/decimal-calculator' || path === '/math/calculators/comparing-decimals-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">0.5</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">0.75</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">0.333</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">1.25</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">0.6</div>
                <div className="absolute top-8 right-10 text-4xl font-black">a/b</div>
              </>
            ) : path === '/math/calculators/derivative-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">d/dx</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">f'(x)</div>
                <div className="absolute top-10 right-1/3 text-4xl font-black rotate-45 animate-float">dy/dx</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">lim</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">f''(x)</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Δy/Δx</div>
              </>
            ) : path === '/math/calculators/integral-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-5xl font-black rotate-12 animate-float-delayed">∫</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">dx</div>
                <div className="absolute top-10 right-1/3 text-4xl font-extrabold rotate-45 animate-float">F(x)</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">+ C</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">∫ a to b</div>
                <div className="absolute top-8 right-10 text-4xl font-black">∑</div>
              </>
            ) : path === '/finance/calculators/mortgage-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🏡</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">PMI</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">HOA</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">%</div>
                <div className="absolute top-8 right-10 text-4xl font-black">yr</div>
              </>
            ) : path === '/finance/calculators/loan-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">APR</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">DTI</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">28/36</div>
                <div className="absolute top-8 right-10 text-4xl font-black">mo</div>
              </>
            ) : path === '/finance/calculators/currency-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">\u20AC</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">\u00A3</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">\u00A5</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">FX</div>
                <div className="absolute top-8 right-10 text-4xl font-black">\u2194</div>
              </>
            ) : path === '/finance/calculators/house-affordability-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">\uD83C\uDFE0</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">$</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">%</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">DTI</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">PMI</div>
                <div className="absolute top-8 right-10 text-4xl font-black">HOA</div>
              </>
            ) : path === '/finance/calculators/compound-interest-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">P</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">r</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">n</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">FV</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">$</div>
                <div className="absolute top-8 right-10 text-4xl font-black">%</div>
              </>
            ) : path === '/finance/calculators/roi-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">ROI</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">$</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">🏠</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Cap</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Yield</div>
              </>
            ) : path === '/finance/calculators/business-loan-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">📋</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Fee</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">APR</div>
                <div className="absolute top-8 right-10 text-4xl font-black">💼</div>
              </>
            ) : path === '/finance/calculators/credit-card-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">💳</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">APR</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Pay</div>
                <div className="absolute top-8 right-10 text-4xl font-black">💰</div>
              </>
            ) : path === '/finance/calculators/investment-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">📈</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">$</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">%</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">🏠</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">🚗</div>
                <div className="absolute top-8 right-10 text-4xl font-black">⌚</div>
              </>
            ) : path === '/finance/calculators/tax-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">📊</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">💰</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Tax</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Bracket</div>
              </>
            ) : path === '/finance/calculators/retirement-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🐷</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">FIRE</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Age</div>
                <div className="absolute top-8 right-10 text-4xl font-black">401k</div>
              </>
            ) : path === '/finance/calculators/sales-tax-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🧾</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Receipt</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Tax</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Rate</div>
              </>
            ) : path === '/finance/calculators/debt-payoff-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">💳</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Debt</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Pay</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Off</div>
              </>
            ) : path === '/finance/calculators/insurance-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🛡️</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Insure</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Solve</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Cover</div>
              </>
            ) : path === '/finance/calculators/budget-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">📊</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Budget</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Track</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Plan</div>
              </>
            ) : path === '/finance/calculators/rental-property-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🏠</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Rent</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Prop</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Hold</div>
              </>
            ) : path === '/finance/calculators/debt-income-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">⚖️</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Debt</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Income</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Ratio</div>
              </>
            ) : path === '/finance/calculators/down-payment-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🏠</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Down</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Pay</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Home</div>
              </>
            ) : path === '/finance/calculators/future-value-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">📈</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">FV</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Growth</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Rate</div>
              </>
            ) : path === '/finance/calculators/present-value-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">📉</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">PV</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Discount</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Rate</div>
              </>
            ) : path === '/health/calculators/bmi-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🩺</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">❤️</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">BMI</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">kg</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">lbs</div>
                <div className="absolute top-8 right-10 text-4xl font-black">cm</div>
              </>
            ) : path === '/health/calculators/calorie-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🔥</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🍎</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">kcal</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">BMR</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">TDEE</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Macro</div>
              </>
            ) : path === '/health/calculators/water-intake-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">💧</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🚰</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">L</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">cup</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">🌡</div>
                <div className="absolute top-8 right-10 text-4xl font-black">🏃</div>
              </>
            ) : path === '/health/calculators/weight-loss-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">⚖️</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">📉</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🎯</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">lbs</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">kg</div>
                <div className="absolute top-8 right-10 text-4xl font-black">📆</div>
              </>
            ) : path === '/health/calculators/weight-gain-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">⚖️</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">📈</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">🎯</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">lbs</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">kg</div>
                <div className="absolute top-8 right-10 text-4xl font-black">📆</div>
              </>
            ) : path === '/health/calculators/body-fat-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">%</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">📏</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">💪</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">⚖️</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">cm</div>
                <div className="absolute top-8 right-10 text-4xl font-black">in</div>
              </>
            ) : path === '/health/calculators/calorie-burn-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🏃</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🔥</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">MET</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">kcal</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">💪</div>
                <div className="absolute top-8 right-10 text-4xl font-black">⏱</div>
              </>
            ) : path === '/health/calculators/ideal-body-weight-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">⚖️</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">📏</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">BMI</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">Devine</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Hamwi</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Broca</div>
              </>
            ) : path === '/health/calculators/diabetes-risk-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🩺</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">📊</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">⚠️</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">💉</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">🫀</div>
                <div className="absolute top-8 right-10 text-4xl font-black">🏃</div>
              </>
            ) : path === '/health/calculators/dri-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🥗</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🧬</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">RDA</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">AI</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">mg</div>
                <div className="absolute top-8 right-10 text-4xl font-black">μg</div>
              </>
            ) : path === '/health/calculators/bri-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🔄</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">📏</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">BRI</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">WHR</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">⚖️</div>
                <div className="absolute top-8 right-10 text-4xl font-black">🍎</div>
              </>
            ) : toolContent.category.toLowerCase() === 'math' && (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">+</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">−</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">×</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">÷</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">π</div>
                <div className="absolute top-8 right-10 text-4xl font-black">%</div>
              </>
            )}
            {toolContent.category.toLowerCase() === 'finance' && (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">$</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">%</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">📈</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">💰</div>
              </>
            )}
            {path === '/science/calculators/wave-speed-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">λ</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">f</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">v</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">T</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">ω</div>
                <div className="absolute top-8 right-10 text-4xl font-black">k</div>
              </>
            ) : path === '/science/calculators/work-power-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">W</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">P</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">F</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">d</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">θ</div>
                <div className="absolute top-8 right-10 text-4xl font-black">t</div>
              </>
            ) : path === '/science/calculators/dbm-watts-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">dBm</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">W</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">mW</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">dBW</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Ω</div>
                <div className="absolute top-8 right-10 text-4xl font-black">V</div>
                <div className="absolute bottom-2 right-1/4 text-3xl font-bold">I</div>
              </>
            ) : path === '/science/calculators/average-atomic-mass-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-3xl font-extrabold rotate-12 animate-float-delayed">M_avg</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">m_i</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">A_i</div>
                <div className="absolute bottom-6 right-12 text-5xl font-black -rotate-45 animate-float-delayed">u</div>
                <div className="absolute top-1/2 left-12 text-3xl font-extrabold rotate-12">Da</div>
                <div className="absolute top-8 right-10 text-4xl font-black">%</div>
              </>
            ) : toolContent.category.toLowerCase() === 'science' && (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">⚛</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🧪</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">c</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">λ</div>
              </>
            )}
            {toolContent.category.toLowerCase() === 'utility' && (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">🛠</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">⚙</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">{"<>"}</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">📁</div>
              </>
            )}
            {path === '/knowledge/calculators/gpa-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">A+</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">B</div>
                <div className="absolute top-10 right-1/3 text-4.5xl font-black rotate-45 animate-float">4.0</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">GPA</div>
                <div className="absolute top-1/2 left-12 text-3.5xl font-extrabold rotate-12">🎓</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Credits</div>
              </>
            ) : path === '/knowledge/calculators/career-assessment-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">R</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">I</div>
                <div className="absolute top-10 right-1/3 text-4.5xl font-black rotate-45 animate-float">A</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">💼</div>
                <div className="absolute top-1/2 left-12 text-3.5xl font-extrabold rotate-12">S</div>
                <div className="absolute top-8 right-10 text-4xl font-black">E</div>
                <div className="absolute bottom-2 right-1/4 text-3xl font-bold">C</div>
              </>
            ) : path === '/knowledge/calculators/trauma-assessment-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🧠</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">❤️</div>
                <div className="absolute top-10 right-1/3 text-4.5xl font-black rotate-45 animate-float">IES-R</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">🩺</div>
                <div className="absolute top-1/2 left-12 text-3.5xl font-extrabold rotate-12">⚕️</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Subscore</div>
              </>
            ) : path === '/knowledge/calculators/anxiety-assessment-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">🧠</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">❤️</div>
                <div className="absolute top-10 right-1/3 text-4.5xl font-black rotate-45 animate-float">Anxiety</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">🩺</div>
                <div className="absolute top-1/2 left-12 text-3.5xl font-extrabold rotate-12">⚕️</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Coping</div>
              </>
            ) : path === '/knowledge/calculators/mbti-calculator' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4.5xl font-black rotate-12 animate-float-delayed">👤</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">💡</div>
                <div className="absolute top-10 right-1/3 text-4.5xl font-black rotate-45 animate-float">MBTI</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">🧩</div>
                <div className="absolute top-1/2 left-12 text-3.5xl font-extrabold rotate-12">🧠</div>
                <div className="absolute top-8 right-10 text-4xl font-black">Type</div>
              </>
            ) : toolContent.category.toLowerCase() === 'knowledge' ? (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">📚</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">🧠</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">💡</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">🎓</div>
              </>
            ) : toolContent.category.toLowerCase() === 'health' && (
              <>
                <div className="absolute top-2 left-1/4 text-4xl font-extrabold rotate-12 animate-float-delayed">🩺</div>
                <div className="absolute bottom-4 left-10 text-5xl font-black -rotate-12 animate-float">❤️</div>
                <div className="absolute top-10 right-1/3 text-4xl font-bold rotate-45 animate-float">BMI</div>
                <div className="absolute bottom-6 right-12 text-6xl font-black -rotate-45 animate-float-delayed">kg</div>
              </>
            )}
          </div>

          <div className="space-y-4 max-w-2xl z-10">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
              <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
              <i className="fas fa-chevron-right text-[8px]"></i>
              <Link href={categoryLink} className="hover:text-slate-600 transition-colors">
                {toolContent.category}
              </Link>
              <i className="fas fa-chevron-right text-[8px]"></i>
              <span className="text-slate-600">{toolContent.name}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none font-display">
              {toolContent.name}
            </h1>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
              {toolContent.desc}
            </p>
          </div>

          {/* Side Dashboard Metrics block */}
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-3 shrink-0 lg:w-48 border-t lg:border-t-0 lg:border-l border-slate-150 pt-6 lg:pt-0 lg:pl-8 z-10 text-left">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                {path === '/knowledge/calculators/gpa-calculator' || path === '/knowledge/calculators/career-assessment-calculator' || path === '/knowledge/calculators/trauma-assessment-calculator' || path === '/knowledge/calculators/anxiety-assessment-calculator' || path === '/knowledge/calculators/mbti-calculator' || path === '/science/calculators/average-atomic-mass-calculator' || path === '/science/calculators/dbm-watts-calculator' || path === '/science/calculators/work-power-calculator' || path === '/science/calculators/wave-speed-calculator' || path === '/math/calculators/fraction-calculator' || path === '/math/calculators/comparing-fractions-calculator' || path === '/math/calculators/lcm-calculator' || path === '/math/calculators/decimal-to-fraction-calculator' || path === '/math/calculators/binary-calculator' || path === '/math/calculators/lcd-calculator' || path === '/math/calculators/decimal-calculator' || path === '/math/calculators/comparing-decimals-calculator' || path === '/math/calculators/fraction-to-percent-calculator' || path === '/math/calculators/improper-fraction-to-mixed-calculator' || path === '/math/calculators/percent-to-fraction-calculator' || path === '/math/calculators/sse-calculator' || path === '/math/calculators/derivative-calculator' || path === '/math/calculators/integral-calculator' || path === '/finance/calculators/mortgage-calculator' || path === '/finance/calculators/loan-calculator' || path === '/finance/calculators/currency-calculator' || path === '/finance/calculators/house-affordability-calculator' || path === '/finance/calculators/compound-interest-calculator' || path === '/finance/calculators/roi-calculator' || path === '/finance/calculators/business-loan-calculator' || path === '/finance/calculators/credit-card-calculator' || path === '/finance/calculators/investment-calculator' || path === '/finance/calculators/tax-calculator' || path === '/finance/calculators/retirement-calculator' || path === '/finance/calculators/sales-tax-calculator' || path === '/finance/calculators/debt-payoff-calculator' || path === '/finance/calculators/insurance-calculator' || path === '/finance/calculators/budget-calculator' || path === '/finance/calculators/rental-property-calculator' || path === '/finance/calculators/debt-income-calculator' || path === '/finance/calculators/down-payment-calculator' || path === '/finance/calculators/present-value-calculator' || path === '/finance/calculators/future-value-calculator' || path === '/health/calculators/bmi-calculator' || path === '/health/calculators/calorie-calculator' || path === '/health/calculators/calorie-burn-calculator' || path === '/health/calculators/water-intake-calculator' || path === '/health/calculators/weight-loss-calculator' || path === '/health/calculators/weight-gain-calculator' || path === '/health/calculators/body-fat-calculator' || path === '/health/calculators/ideal-body-weight-calculator' || path === '/health/calculators/diabetes-risk-calculator' || path === '/health/calculators/dri-calculator' || path === '/health/calculators/bri-calculator' ? 'Steps' : 'Processing'}
              </span>
              <span className="text-sm font-black text-slate-800 mt-1">
                {path === '/knowledge/calculators/gpa-calculator' ? 'Weighted Average' : path === '/knowledge/calculators/career-assessment-calculator' ? 'Holland Code Scoring' : path === '/knowledge/calculators/trauma-assessment-calculator' ? 'IES-R Point Summation' : path === '/knowledge/calculators/anxiety-assessment-calculator' ? 'Severity Summation' : path === '/knowledge/calculators/mbti-calculator' ? 'Dimension Aggregation' : path === '/science/calculators/average-atomic-mass-calculator' ? 'Weighted Sum' : path === '/science/calculators/dbm-watts-calculator' ? 'Decibel Math' : path === '/science/calculators/work-power-calculator' ? 'Algebraic' : path === '/science/calculators/wave-speed-calculator' ? 'Algebraic' : path === '/health/calculators/diabetes-risk-calculator' ? 'ADA Risk Test (7 factors)' : path === '/health/calculators/dri-calculator' ? 'Mifflin-St Jeor' : path === '/health/calculators/bri-calculator' ? 'BRI Formula' : path === '/health/calculators/ideal-body-weight-calculator' ? 'Devine, Robinson, Miller, Hamwi, Broca, BMI-Based' : path === '/health/calculators/body-fat-calculator' ? 'US Navy / BMI' : path === '/health/calculators/weight-gain-calculator' ? 'Weight Gain' : path === '/health/calculators/weight-loss-calculator' ? 'Weight Loss' : path === '/health/calculators/water-intake-calculator' ? 'Weight-Based' : path === '/health/calculators/calorie-burn-calculator' ? 'MET-Based' : path === '/health/calculators/calorie-calculator' ? 'Mifflin-St Jeor' : path === '/health/calculators/bmi-calculator' ? 'WHO Ranges' : path === '/finance/calculators/mortgage-calculator' ? 'Amortization' : path === '/finance/calculators/loan-calculator' ? 'Full Schedule' : path === '/finance/calculators/currency-calculator' ? 'Live Rates' : path === '/finance/calculators/house-affordability-calculator' ? 'DTI Analysis' : path === '/finance/calculators/compound-interest-calculator' ? 'Year-by-Year' : path === '/finance/calculators/roi-calculator' ? 'Multi-Method' : path === '/finance/calculators/business-loan-calculator' ? 'Amortization Table' : path === '/finance/calculators/credit-card-calculator' ? 'Payoff Plan' : path === '/finance/calculators/investment-calculator' ? 'Year-by-Year' : path === '/finance/calculators/tax-calculator' ? '3-Way Compare' : path === '/finance/calculators/retirement-calculator' ? 'Age Timeline' : path === '/finance/calculators/sales-tax-calculator' ? 'Dual Mode' : path === '/finance/calculators/debt-payoff-calculator' ? 'Debt Type' : path === '/finance/calculators/insurance-calculator' ? 'Coverage / Needs' : path === '/finance/calculators/budget-calculator' ? 'Expense Categories' : path === '/finance/calculators/rental-property-calculator' ? 'Property Details' : path === '/finance/calculators/debt-income-calculator' ? 'Income + Debt' : path === '/finance/calculators/down-payment-calculator' ? 'Home & Loan' : path === '/finance/calculators/present-value-calculator' ? 'Dual Mode' : path === '/finance/calculators/future-value-calculator' ? 'Dual Mode' : path === '/math/calculators/sse-calculator' ? 'Sum of Squares' : path === '/math/calculators/lcd-calculator' ? 'Multi-Method' : path === '/math/calculators/lcm-calculator' ? 'Prime & Ladder' : path === '/math/calculators/decimal-to-fraction-calculator' || path === '/math/calculators/binary-calculator' || path === '/math/calculators/fraction-to-percent-calculator' || path === '/math/calculators/improper-fraction-to-mixed-calculator' || path === '/math/calculators/percent-to-fraction-calculator' ? 'Algebraic' : path === '/math/calculators/comparing-decimals-calculator' ? 'Digit-by-Digit' : path === '/math/calculators/fraction-calculator' || path === '/math/calculators/comparing-fractions-calculator' || path === '/math/calculators/decimal-calculator' ? 'Line-by-Line' : path === '/math/calculators/derivative-calculator' ? 'Differentiation' : path === '/math/calculators/integral-calculator' ? 'Antiderivative' : '100% Local'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                {path === '/knowledge/calculators/gpa-calculator' || path === '/knowledge/calculators/career-assessment-calculator' || path === '/knowledge/calculators/trauma-assessment-calculator' || path === '/knowledge/calculators/anxiety-assessment-calculator' || path === '/knowledge/calculators/mbti-calculator' || path === '/science/calculators/average-atomic-mass-calculator' || path === '/science/calculators/dbm-watts-calculator' || path === '/science/calculators/work-power-calculator' || path === '/science/calculators/wave-speed-calculator' || path === '/math/calculators/fraction-calculator' || path === '/math/calculators/comparing-fractions-calculator' || path === '/math/calculators/lcm-calculator' || path === '/math/calculators/decimal-to-fraction-calculator' || path === '/math/calculators/binary-calculator' || path === '/math/calculators/lcd-calculator' || path === '/math/calculators/decimal-calculator' || path === '/math/calculators/comparing-decimals-calculator' || path === '/math/calculators/fraction-to-percent-calculator' || path === '/math/calculators/improper-fraction-to-mixed-calculator' || path === '/math/calculators/percent-to-fraction-calculator' || path === '/math/calculators/sse-calculator' || path === '/math/calculators/derivative-calculator' || path === '/math/calculators/integral-calculator' || path === '/finance/calculators/mortgage-calculator' || path === '/finance/calculators/loan-calculator' || path === '/finance/calculators/currency-calculator' || path === '/finance/calculators/house-affordability-calculator' || path === '/finance/calculators/compound-interest-calculator' || path === '/finance/calculators/roi-calculator' || path === '/finance/calculators/business-loan-calculator' || path === '/finance/calculators/credit-card-calculator' || path === '/finance/calculators/investment-calculator' || path === '/finance/calculators/tax-calculator' || path === '/finance/calculators/retirement-calculator' || path === '/finance/calculators/sales-tax-calculator' || path === '/finance/calculators/debt-payoff-calculator' || path === '/finance/calculators/insurance-calculator' || path === '/finance/calculators/budget-calculator' || path === '/finance/calculators/rental-property-calculator' || path === '/finance/calculators/debt-income-calculator' || path === '/finance/calculators/down-payment-calculator' || path === '/finance/calculators/present-value-calculator' || path === '/finance/calculators/future-value-calculator' || path === '/health/calculators/bmi-calculator' || path === '/health/calculators/calorie-calculator' || path === '/health/calculators/calorie-burn-calculator' || path === '/health/calculators/water-intake-calculator' || path === '/health/calculators/weight-loss-calculator' || path === '/health/calculators/weight-gain-calculator' || path === '/health/calculators/body-fat-calculator' || path === '/health/calculators/ideal-body-weight-calculator' || path === '/health/calculators/diabetes-risk-calculator' || path === '/health/calculators/dri-calculator' || path === '/health/calculators/bri-calculator' ? 'Visuals' : 'Security'}
              </span>
              <span className="text-sm font-black text-slate-800 mt-1">
                {path === '/knowledge/calculators/gpa-calculator' ? 'GPA Progress Ring' : path === '/knowledge/calculators/career-assessment-calculator' ? 'RIASEC Radar Chart' : path === '/knowledge/calculators/trauma-assessment-calculator' ? 'Subscale Progress Bars' : path === '/knowledge/calculators/anxiety-assessment-calculator' ? 'Severity Gauge' : path === '/knowledge/calculators/mbti-calculator' ? 'Cognitive Stack Cards' : path === '/science/calculators/average-atomic-mass-calculator' ? 'Isotope Peaks' : path === '/science/calculators/dbm-watts-calculator' ? 'RF Power Ruler' : path === '/science/calculators/work-power-calculator' ? 'Vector Component' : path === '/science/calculators/wave-speed-calculator' ? 'Wave Properties' : path === '/health/calculators/diabetes-risk-calculator' ? 'Factor Breakdown Table' : path === '/health/calculators/dri-calculator' ? 'RDA Table' : path === '/health/calculators/bri-calculator' ? 'Risk Gauge' : path === '/health/calculators/ideal-body-weight-calculator' ? '6-Formula Comparison' : path === '/health/calculators/body-fat-calculator' ? 'Body Comp Grid' : path === '/health/calculators/weight-gain-calculator' ? 'Weekly Timeline' : path === '/health/calculators/weight-loss-calculator' ? 'Weekly Timeline' : path === '/health/calculators/water-intake-calculator' ? '35/40/25 Schedule' : path === '/health/calculators/calorie-burn-calculator' ? 'Food Equivalents' : path === '/health/calculators/calorie-calculator' ? 'Macro Pie & Bars' : path === '/health/calculators/bmi-calculator' ? 'Interactive Gauge' : path === '/finance/calculators/mortgage-calculator' ? 'Doughnut & Plot' : path === '/finance/calculators/loan-calculator' ? 'Doughnut & Table' : path === '/finance/calculators/currency-calculator' ? 'Rate & History' : path === '/finance/calculators/house-affordability-calculator' ? 'Breakdown Table' : path === '/finance/calculators/compound-interest-calculator' ? 'Growth Table' : path === '/finance/calculators/roi-calculator' ? 'Benchmarks Panel' : path === '/finance/calculators/business-loan-calculator' ? 'Breakdown Table' : path === '/finance/calculators/credit-card-calculator' ? 'Payoff Table' : path === '/finance/calculators/investment-calculator' ? 'Growth Table' : path === '/finance/calculators/tax-calculator' ? 'Bracket Table' : path === '/finance/calculators/retirement-calculator' ? 'Growth Table' : path === '/finance/calculators/sales-tax-calculator' ? 'Rate Table' : path === '/finance/calculators/debt-payoff-calculator' ? 'Payoff Table' : path === '/finance/calculators/insurance-calculator' ? 'Risk & Value' : path === '/finance/calculators/budget-calculator' ? 'Category Table' : path === '/finance/calculators/rental-property-calculator' ? 'Projection Table' : path === '/finance/calculators/debt-income-calculator' ? 'Breakdown Table' : path === '/finance/calculators/down-payment-calculator' ? 'Scenario Compare' : path === '/finance/calculators/present-value-calculator' ? 'Discount Schedule' : path === '/finance/calculators/future-value-calculator' ? 'Growth Schedule' : path === '/math/calculators/sse-calculator' ? 'Residual Plot' : path === '/math/calculators/fraction-to-percent-calculator' || path === '/math/calculators/percent-to-fraction-calculator' ? 'Pie & Dial Charts' : path === '/math/calculators/comparing-decimals-calculator' ? 'Aligner & Bars' : path === '/math/calculators/decimal-calculator' ? 'Column Aligner' : path === '/math/calculators/lcd-calculator' ? 'Subdivided Grids' : path === '/math/calculators/binary-calculator' ? '8-Bit Register' : path === '/math/calculators/lcm-calculator' ? 'Factor Grid' : path === '/math/calculators/decimal-to-fraction-calculator' ? 'Number Line' : path === '/math/calculators/fraction-calculator' || path === '/math/calculators/comparing-fractions-calculator' || path === '/math/calculators/improper-fraction-to-mixed-calculator' ? 'Pie & Bar Charts' : path === '/math/calculators/derivative-calculator' ? 'Tangent Line Plot' : path === '/math/calculators/integral-calculator' ? 'Definite Area Plot' : 'No Uploads'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Precision</span>
              <span className="text-sm font-black text-slate-800 mt-1">
                {path === '/knowledge/calculators/gpa-calculator' ? '2-Decimal Float' : path === '/knowledge/calculators/career-assessment-calculator' ? '1-Decimal Float' : path === '/knowledge/calculators/trauma-assessment-calculator' || path === '/knowledge/calculators/anxiety-assessment-calculator' ? 'Exact Integer' : path === '/knowledge/calculators/mbti-calculator' ? 'Percentage Score' : path === '/science/calculators/average-atomic-mass-calculator' ? '5-Decimal Float' : path === '/science/calculators/dbm-watts-calculator' ? '6-Decimal Float' : path === '/health/calculators/weight-loss-calculator' ? '1-Decimal Float' : path === '/health/calculators/water-intake-calculator' ? '2-Decimal Float' : path === '/finance/calculators/mortgage-calculator' || path === '/finance/calculators/loan-calculator' || path === '/finance/calculators/currency-calculator' || path === '/finance/calculators/house-affordability-calculator' || path === '/finance/calculators/compound-interest-calculator' || path === '/finance/calculators/roi-calculator' || path === '/finance/calculators/business-loan-calculator' || path === '/finance/calculators/credit-card-calculator' || path === '/finance/calculators/investment-calculator' || path === '/finance/calculators/tax-calculator' || path === '/finance/calculators/retirement-calculator' || path === '/finance/calculators/sales-tax-calculator' || path === '/finance/calculators/debt-payoff-calculator' || path === '/finance/calculators/insurance-calculator' || path === '/finance/calculators/budget-calculator' || path === '/finance/calculators/rental-property-calculator' || path === '/finance/calculators/debt-income-calculator' || path === '/finance/calculators/down-payment-calculator' || path === '/finance/calculators/present-value-calculator' || path === '/finance/calculators/future-value-calculator' || path === '/health/calculators/bmi-calculator' || path === '/health/calculators/calorie-calculator' || path === '/health/calculators/body-fat-calculator' || path === '/health/calculators/ideal-body-weight-calculator' || path === '/health/calculators/diabetes-risk-calculator' || path === '/health/calculators/dri-calculator' || path === '/health/calculators/bri-calculator' ? '1-Decimal Float' : path === '/health/calculators/weight-gain-calculator' ? '1-Decimal Float' : path === '/health/calculators/calorie-burn-calculator' ? '1-Decimal Float' : path === '/math/calculators/comparing-decimals-calculator' ? 'Exact Decimal' : path === '/math/calculators/decimal-calculator' ? 'Scale Corrected' : path === '/math/calculators/fraction-calculator' || path === '/math/calculators/comparing-fractions-calculator' || path === '/math/calculators/decimal-to-fraction-calculator' || path === '/math/calculators/lcd-calculator' || path === '/math/calculators/improper-fraction-to-mixed-calculator' || path === '/math/calculators/percent-to-fraction-calculator' ? 'Exact Fractions' : path === '/math/calculators/binary-calculator' ? 'Exact Base' : path === '/math/calculators/lcm-calculator' ? 'Exact Integers' : path === '/math/calculators/derivative-calculator' ? 'Symbolic / Float' : path === '/math/calculators/integral-calculator' ? 'Symbolic / Float' : 'Double Float'}
              </span>
            </div>
          </div>
        </div>

        {/* The Calculator Area */}
        <div className="w-full flex justify-center py-6">
          <CalculatorWidget path={path} fallback={fallbackWidget} />
        </div>

        {/* Programmatic SEO Details */}
        <ToolContentEnhancer toolContent={toolContent as any} />
      </div>
    );
  }

  // 3. If neither, return 404 not found
  notFound();
}

