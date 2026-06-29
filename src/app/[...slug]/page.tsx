import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getToolContentByPath, getCategoryContentByPath } from '../../data/toolContent';
import { getDecorationSymbols, getDecorationPositions, getToolMetrics } from '../../data/toolDecorations';
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
            {getDecorationSymbols(path, toolContent.category.toLowerCase()).map((sym, i) => {
              const positions = getDecorationPositions();
              return (
                <div
                  key={i}
                  className={`absolute ${positions[i % positions.length]} ${sym.className}`}
                >
                  {sym.text}
                </div>
              );
            })}
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
            {(() => {
              const metrics = getToolMetrics(path, toolContent.category.toLowerCase());
              return (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Method</span>
                    <span className="text-sm font-black text-slate-800 mt-1">{metrics.method}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Visualization</span>
                    <span className="text-sm font-black text-slate-800 mt-1">{metrics.visualization}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Precision</span>
                    <span className="text-sm font-black text-slate-800 mt-1">{metrics.precision}</span>
                  </div>
                </>
              );
            })()}
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


