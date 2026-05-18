import { allTools } from './allTools';
import { SITE_NAME, SITE_URL } from './siteConfig';
import { toolCategories } from './toolCategories';

const CATEGORY_PLAYBOOK = {
  Math: {
    audience: ['students checking homework', 'teachers building examples', 'parents reviewing answers', 'professionals validating quick calculations'],
    reasons: ['reduce arithmetic mistakes', 'understand formulas faster', 'double-check manual work', 'get results quickly on mobile and desktop'],
    useCases: ['classroom practice', 'exam preparation', 'worksheet checking', 'everyday number conversions'],
    searchTerms: ['step by step', 'formula', 'solver', 'examples'],
    pitfalls: ['typing the wrong sign', 'mixing units or formats', 'rounding too early', 'skipping validation of the final result'],
    tips: ['check whether the input expects decimals, fractions, or whole numbers', 'compare two scenarios when you want to study patterns', 'use related tools to cross-check conversions and percentages'],
  },
  Finance: {
    audience: ['borrowers comparing offers', 'home buyers planning costs', 'investors estimating growth', 'households managing budgets'],
    reasons: ['compare scenarios quickly', 'estimate payments and returns', 'plan around realistic assumptions', 'make financial decisions with more clarity'],
    useCases: ['loan planning', 'investment analysis', 'monthly budgeting', 'purchase comparisons'],
    searchTerms: ['payment estimate', 'interest', 'amortization', 'financial planning'],
    pitfalls: ['ignoring fees and taxes', 'using unrealistic rates', 'forgetting contribution frequency', 'treating estimates as advice instead of planning support'],
    tips: ['run a conservative, expected, and aggressive scenario', 'check the effect of changing only one variable at a time', 'use the result as a planning estimate before final decisions'],
  },
  Science: {
    audience: ['students solving assignments', 'teachers preparing lessons', 'lab users checking values', 'curious learners exploring formulas'],
    reasons: ['translate equations into usable answers', 'verify hand calculations', 'save time during study sessions', 'keep units and inputs organized'],
    useCases: ['physics homework', 'lab preparation', 'engineering study', 'concept review'],
    searchTerms: ['equation', 'formula', 'unit conversion', 'physics calculator'],
    pitfalls: ['mixing incompatible units', 'using the wrong symbol meaning', 'forgetting exponents or scientific notation', 'entering values without checking assumptions'],
    tips: ['confirm every unit before calculating', 'use the page to validate manual work line by line', 'compare examples with known textbook values when possible'],
  },
  Health: {
    audience: ['people tracking wellness goals', 'fitness beginners', 'coaches creating estimates', 'users monitoring daily habits'],
    reasons: ['turn health inputs into practical estimates', 'support goal setting', 'compare progress over time', 'get fast guidance before deeper research'],
    useCases: ['weight planning', 'hydration tracking', 'nutrition planning', 'wellness check-ins'],
    searchTerms: ['health calculator', 'body metrics', 'daily intake', 'fitness planning'],
    pitfalls: ['treating estimates as diagnosis', 'using old body measurements', 'ignoring activity level changes', 'making decisions without context from a professional when needed'],
    tips: ['update measurements regularly', 'compare estimates across time instead of relying on one reading', 'use health calculators for planning and awareness, not diagnosis'],
  },
  Utility: {
    audience: ['creators working with files', 'students handling documents', 'teams sharing quick conversions', 'everyday users solving digital tasks'],
    reasons: ['finish common digital tasks in one place', 'avoid installing extra software', 'handle routine conversions quickly', 'keep workflows simple and browser-based'],
    useCases: ['document conversion', 'text cleanup', 'download preparation', 'file organization'],
    searchTerms: ['converter', 'generator', 'browser tool', 'free online utility'],
    pitfalls: ['using the wrong input format', 'expecting unsupported formatting to stay intact', 'forgetting output settings', 'not checking privacy behavior for file workflows'],
    tips: ['review the output before downloading or reusing it', 'use related tools for cleanup after conversion', 'keep a source copy when you are processing documents or media'],
  },
  Knowledge: {
    audience: ['students organizing study plans', 'users exploring self-assessments', 'professionals tracking habits', 'learners improving productivity'],
    reasons: ['make abstract topics easier to measure', 'turn inputs into practical feedback', 'support planning and reflection', 'surface useful next steps quickly'],
    useCases: ['study planning', 'self-assessment', 'habit tracking', 'productivity improvement'],
    searchTerms: ['assessment', 'tracker', 'productivity tool', 'educational calculator'],
    pitfalls: ['answering too quickly', 'using incomplete context', 'treating estimates as definitive outcomes', 'ignoring trends across time'],
    tips: ['revisit the tool when inputs change', 'use results to guide reflection and planning', 'combine this tool with related pages for a fuller workflow'],
  },
};

const FUNCTIONALITY_PLAYBOOK = {
  calculator: {
    schemaType: 'WebApplication',
    featureLead: 'interactive calculation',
    outputLabel: 'results panel',
    workflow: ['enter values', 'choose an option or mode if needed', 'calculate instantly', 'review the result and compare scenarios'],
  },
  converter: {
    schemaType: 'WebApplication',
    featureLead: 'browser-based conversion',
    outputLabel: 'converted output',
    workflow: ['paste or upload the source input', 'set the target format or output preference', 'convert instantly', 'copy, review, or download the output'],
  },
  generator: {
    schemaType: 'WebApplication',
    featureLead: 'instant generation',
    outputLabel: 'generated output',
    workflow: ['define the content or settings', 'adjust generation options', 'generate the output', 'download, copy, or reuse the result'],
  },
  translator: {
    schemaType: 'WebApplication',
    featureLead: 'fast browser translation',
    outputLabel: 'translated output',
    workflow: ['enter the source text', 'choose settings or tone if available', 'translate instantly', 'review and copy the result'],
  },
  downloader: {
    schemaType: 'WebApplication',
    featureLead: 'download preparation',
    outputLabel: 'download result',
    workflow: ['paste the source link', 'validate the format or supported source', 'process the request', 'download or reuse the final file'],
  },
  scanner: {
    schemaType: 'WebApplication',
    featureLead: 'live or uploaded scanning',
    outputLabel: 'decoded result',
    workflow: ['upload an image or enable the camera', 'scan the input', 'read the decoded result', 'copy or open the extracted content'],
  },
  organizer: {
    schemaType: 'WebApplication',
    featureLead: 'file arrangement',
    outputLabel: 'organized file',
    workflow: ['upload the source file', 'set ordering or structure changes', 'apply the changes', 'download the updated file'],
  },
  merger: {
    schemaType: 'WebApplication',
    featureLead: 'file combining',
    outputLabel: 'merged file',
    workflow: ['upload the source files', 'confirm order and settings', 'merge them in the browser', 'download the final file'],
  },
  splitter: {
    schemaType: 'WebApplication',
    featureLead: 'file splitting',
    outputLabel: 'split files',
    workflow: ['upload the source file', 'choose page ranges or split mode', 'split the file', 'download the outputs'],
  },
};

const SEO_PRIORITY_OVERRIDES = {
  '/utility-tools/html-to-markdown-converter': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'Specific developer intent with a clear browser-based workflow and less brand lock-in than generic calculator queries.',
    focusKeywords: ['html to markdown converter', 'convert html to markdown online', 'browser html to markdown'],
  },
  '/utility-tools/english-to-ipa-translator': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'Specific educational search intent with room for richer explanatory content and examples.',
    focusKeywords: ['english to ipa translator', 'ipa converter online', 'phonetic transcription tool'],
  },
  '/utility-tools/converter-tools/qr-code-scanner': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'Users often want an app-free scanner that works in browser, which is a strong content and UX angle.',
    focusKeywords: ['qr code scanner online', 'scan qr code from image', 'free qr scanner browser'],
  },
  '/utility-tools/converter-tools/rgb-to-pantone-converter': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'Commercial design intent is specific and many competing pages are thin or overly gated.',
    focusKeywords: ['rgb to pantone converter', 'pantone color converter online', 'rgb pantone match'],
  },
  '/utility-tools/converter-tools/gold-precious-metal-weight-converter': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'The query is narrower than general weight conversion and can rank on specificity plus utility.',
    focusKeywords: ['gold weight converter', 'precious metal weight converter', 'grams to tola gold converter'],
  },
  '/science/calculators/dbm-watts-calculator': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'Engineering conversion intent is highly specific and rewards pages with formulas, tables, and examples.',
    focusKeywords: ['dbm to watts calculator', 'watts to dbm converter', 'rf power conversion'],
  },
  '/science/calculators/dbm-milliwatts-calculator': {
    tier: 'high',
    outlook: 'strong long-tail opportunity',
    rationale: 'Niche technical intent with a formula-driven query that benefits from better supporting content.',
    focusKeywords: ['dbm to milliwatts calculator', 'mw to dbm converter', 'power conversion dbm mw'],
  },
  '/science/calculators/average-atomic-mass-calculator': {
    tier: 'high',
    outlook: 'good long-tail opportunity',
    rationale: 'Educational chemistry search intent is specific enough to compete with formula explanations and examples.',
    focusKeywords: ['average atomic mass calculator', 'weighted isotopic abundance calculator', 'atomic mass from isotopes'],
  },
  '/health/calculators/calorie-burn-calculator': {
    tier: 'medium',
    outlook: 'balanced opportunity',
    rationale: 'High interest search intent with meaningful competition, but richer activity-based examples can help.',
    focusKeywords: ['calorie burn calculator', 'calories burned calculator', 'exercise calorie calculator'],
  },
  '/knowledge/calculators/language-level-calculator': {
    tier: 'medium',
    outlook: 'good long-tail opportunity',
    rationale: 'More specific than broad language-learning queries and well suited to structured explanatory content.',
    focusKeywords: ['language level calculator', 'language proficiency calculator', 'language skill level tool'],
  },
  '/utility-tools/word-counter': {
    tier: 'medium',
    outlook: 'high volume / high competition',
    rationale: 'Huge demand but crowded SERPs with focused incumbent tools, so differentiation must be feature and content driven.',
    focusKeywords: ['word counter', 'character counter', 'sentence counter online'],
  },
  '/finance/calculators/mortgage-calculator': {
    tier: 'medium',
    outlook: 'high volume / high competition',
    rationale: 'Very strong intent but dominated by established financial publishers and institutions.',
    focusKeywords: ['mortgage calculator', 'monthly mortgage payment calculator', 'home loan calculator'],
  },
  '/health/calculators/bmi-calculator': {
    tier: 'medium',
    outlook: 'high volume / high competition',
    rationale: 'Very popular search with strong institutional competitors, but still worth deep content and schema support.',
    focusKeywords: ['bmi calculator', 'body mass index calculator', 'calculate bmi online'],
  },
  '/knowledge/calculators/age-calculator': {
    tier: 'medium',
    outlook: 'high volume / high competition',
    rationale: 'Demand is strong, but many focused sites already target exact-age queries with broad feature sets.',
    focusKeywords: ['age calculator', 'calculate age online', 'exact age calculator'],
  },
};

const normalizePath = (pathname = '/') => {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
};

const titleCase = (value = '') =>
  value
    .split(/[-/\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const routeWords = (tool) =>
  normalizePath(tool.url)
    .split('/')
    .filter(Boolean)
    .flatMap((part) => part.split('-'))
    .filter((part) => !['calculators', 'calculator', 'tools', 'tool'].includes(part));

const detectToolKind = (tool) => {
  const lowerName = tool.name.toLowerCase();
  if (lowerName.includes('converter')) return 'converter';
  if (lowerName.includes('generator')) return 'generator';
  if (lowerName.includes('translator')) return 'translator';
  if (lowerName.includes('downloader')) return 'downloader';
  if (lowerName.includes('scanner')) return 'scanner';
  if (lowerName.includes('organizer')) return 'organizer';
  if (lowerName.includes('merger')) return 'merger';
  if (lowerName.includes('splitter')) return 'splitter';
  return 'calculator';
};

const getPriorityProfile = (tool) => SEO_PRIORITY_OVERRIDES[normalizePath(tool.url)] || {
  tier: 'baseline',
  outlook: 'standard opportunity',
  rationale: 'This page can still rank for long-tail searches when the content stays specific, useful, and internally connected.',
  focusKeywords: [],
};

const buildToolTitle = (tool) => `${tool.name} - Free Online ${tool.category} Tool | ${SITE_NAME}`;

const buildToolDescription = (tool) => {
  const kind = detectToolKind(tool);
  const base = tool.desc.charAt(0).toLowerCase() + tool.desc.slice(1);
  const priority = getPriorityProfile(tool);
  const focus = priority.focusKeywords[0] ? ` Optimized for searches like "${priority.focusKeywords[0]}".` : '';
  return `Use Tuitility's ${tool.name.toLowerCase()} to ${base}. Fast, free, mobile-friendly ${kind} with practical guidance, clearer results, related examples, and search-friendly support content.${focus}`;
};

const buildToolKeywords = (tool) => {
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  const priority = getPriorityProfile(tool);
  const words = routeWords(tool).map(titleCase);
  const candidates = [
    tool.name,
    `${tool.name} online`,
    `free ${tool.name.toLowerCase()}`,
    `${tool.name.toLowerCase()} free`,
    `${tool.name.toLowerCase()} ${detectToolKind(tool)}`,
    `${tool.category.toLowerCase()} ${detectToolKind(tool)}`,
    `${tool.category.toLowerCase()} tools`,
    ...playbook.searchTerms.map((term) => `${tool.name.toLowerCase()} ${term}`),
    ...words.map((word) => `${word.toLowerCase()} ${detectToolKind(tool)}`),
    ...priority.focusKeywords,
    SITE_NAME,
  ];

  return Array.from(new Set(candidates.map((entry) => entry.trim()).filter(Boolean)));
};

const buildHowToSteps = (tool) => {
  const workflow = FUNCTIONALITY_PLAYBOOK[detectToolKind(tool)]?.workflow || FUNCTIONALITY_PLAYBOOK.calculator.workflow;
  return workflow.map((step, index) => `${index + 1}. ${step.charAt(0).toUpperCase() + step.slice(1)} using the ${tool.name.toLowerCase()}.`);
};

const buildBenefits = (tool) => {
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  const functionality = FUNCTIONALITY_PLAYBOOK[detectToolKind(tool)] || FUNCTIONALITY_PLAYBOOK.calculator;
  return [
    `${tool.name} is designed to ${tool.desc.charAt(0).toLowerCase() + tool.desc.slice(1)} without sending users through a confusing workflow.`,
    `It combines ${functionality.featureLead}, readable output, and internal links so users can move from question to answer faster.`,
    `It helps ${playbook.audience[0]} and ${playbook.audience[1]} move from raw inputs to usable answers quickly.`,
    `Because it sits inside ${SITE_NAME}, the tool connects naturally with adjacent ${tool.category.toLowerCase()} pages and supporting resources.`,
  ];
};

const buildOverview = (tool) => {
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  const kind = detectToolKind(tool);
  const priority = getPriorityProfile(tool);
  return [
    `The ${tool.name} is a free online ${kind} built to ${tool.desc.charAt(0).toLowerCase() + tool.desc.slice(1)}. Instead of making users hunt for scattered formulas, settings, or file steps, this page keeps the core workflow in one place so results are faster to reach and easier to trust.`,
    `${SITE_NAME} positions this tool for practical use, not just one-off calculations. That means the page is useful for ${playbook.useCases.join(', ')}, while also connecting users to related ${tool.category.toLowerCase()} tools when they want to go further.`,
    `From an SEO perspective, this page targets intent around ${priority.focusKeywords.slice(0, 3).join(', ') || `${tool.name.toLowerCase()} online`} with content that explains what the tool does, who it helps, and how to use it correctly.`,
  ];
};

const buildFunctionalitySummary = (tool) => {
  const functionality = FUNCTIONALITY_PLAYBOOK[detectToolKind(tool)] || FUNCTIONALITY_PLAYBOOK.calculator;
  return [
    `This ${detectToolKind(tool)} focuses on ${functionality.featureLead}, which means the page is structured around a clear input area, a focused ${functionality.outputLabel}, and a short path from first interaction to useful output.`,
    `Users searching for ${tool.name.toLowerCase()} usually want a fast answer, but they also need enough surrounding context to trust what they are seeing. That is why this page pairs the live tool with supporting sections, usage guidance, FAQs, and related links.`,
  ];
};

const buildCapabilities = (tool) => {
  const kind = detectToolKind(tool);
  const label = kind === 'calculator' ? 'calculation' : kind;
  return [
    `Handle the core ${label} workflow directly in the browser.`,
    `Support repeat use when users need to compare more than one scenario or input set.`,
    `Expose results in a way that is easy to scan, copy, or continue working from.`,
    `Connect the current task to related ${tool.category.toLowerCase()} pages for deeper follow-up.`,
  ];
};

const buildWhenToUse = (tool) => {
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  return [
    `Use the ${tool.name} when you want to ${tool.desc.charAt(0).toLowerCase() + tool.desc.slice(1)} without leaving the browser.`,
    `It is especially useful during ${playbook.useCases[0]}, ${playbook.useCases[1]}, and any workflow where fast comparison matters.`,
    `This page is also a good fit for users who prefer a lightweight online tool instead of opening a spreadsheet, calculator app, or desktop utility.`,
  ];
};

const buildTips = (tool) => {
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  return [
    ...playbook.tips,
    `Save time by using the ${tool.name.toLowerCase()} together with related ${tool.category.toLowerCase()} tools on ${SITE_NAME}.`,
  ];
};

const buildMistakes = (tool) => {
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  return [
    ...playbook.pitfalls,
    `Using the ${tool.name.toLowerCase()} without checking whether the result matches your actual goal or context.`,
  ];
};

const buildSearchIntent = (tool) => {
  const priority = getPriorityProfile(tool);
  return [
    `This page is optimized for users who already know what they want and are searching with specific intent, such as "${priority.focusKeywords[0] || `${tool.name.toLowerCase()} online`}".`,
    `That matters because search engines tend to reward pages that align tightly with one job to be done, explain the workflow clearly, and satisfy the query without unnecessary friction.`,
    `For broader queries in this space, stronger ranking usually depends on clearer internal linking, better examples, more complete FAQs, and unique support content around the tool itself.`,
  ];
};

const buildFaqs = (tool) => {
  const kind = detectToolKind(tool);
  const playbook = CATEGORY_PLAYBOOK[tool.category] || CATEGORY_PLAYBOOK.Utility;
  return [
    {
      question: `What does the ${tool.name.toLowerCase()} do?`,
      answer: `The ${tool.name} helps users ${tool.desc.charAt(0).toLowerCase() + tool.desc.slice(1)}. It is designed for quick browser-based use so results are easy to access on desktop or mobile.`,
    },
    {
      question: `Who should use this ${kind}?`,
      answer: `This page is useful for ${playbook.audience.slice(0, 3).join(', ')}, and anyone who wants a faster way to work through ${tool.category.toLowerCase()} tasks online.`,
    },
    {
      question: `Is the ${tool.name.toLowerCase()} free to use?`,
      answer: `Yes. Tuitility provides the ${tool.name} as a free online tool so users can run calculations, conversions, or checks without installing extra software.`,
    },
    {
      question: `Can I use this ${tool.name.toLowerCase()} on mobile?`,
      answer: `Yes. The page is designed to work on phones, tablets, and desktop browsers, making it easier to use the tool wherever you need it.`,
    },
    {
      question: `What should I double-check before relying on the result?`,
      answer: `Double-check your inputs, units, formatting, and scenario assumptions. The tool is built to speed up the workflow, but the quality of the result still depends on entering the right information.`,
    },
    {
      question: `What should I do after using the ${tool.name.toLowerCase()}?`,
      answer: `After reviewing your output, compare additional scenarios, validate key assumptions, and explore related ${tool.category.toLowerCase()} tools if you need a more complete workflow.`,
    },
  ];
};

export const getToolContent = (tool) => {
  if (!tool) return null;

  const priority = getPriorityProfile(tool);
  const relatedTools = allTools
    .filter((candidate) => candidate.category === tool.category && candidate.url !== tool.url)
    .slice(0, 6);
  const kind = detectToolKind(tool);
  const functionality = FUNCTIONALITY_PLAYBOOK[kind] || FUNCTIONALITY_PLAYBOOK.calculator;

  return {
    ...tool,
    kind,
    seoTitle: buildToolTitle(tool),
    seoDescription: buildToolDescription(tool),
    seoKeywords: buildToolKeywords(tool),
    overview: buildOverview(tool),
    functionalitySummary: buildFunctionalitySummary(tool),
    capabilities: buildCapabilities(tool),
    howToSteps: buildHowToSteps(tool),
    whenToUse: buildWhenToUse(tool),
    benefits: buildBenefits(tool),
    useCases: CATEGORY_PLAYBOOK[tool.category].useCases,
    audience: CATEGORY_PLAYBOOK[tool.category].audience,
    reasons: CATEGORY_PLAYBOOK[tool.category].reasons,
    tips: buildTips(tool),
    mistakes: buildMistakes(tool),
    searchIntent: buildSearchIntent(tool),
    faqs: buildFaqs(tool),
    relatedTools,
    priority,
    schema: {
      type: functionality.schemaType,
      applicationCategory: `${tool.category}Application`,
      featureList: buildCapabilities(tool),
      keywords: buildToolKeywords(tool),
      audience: CATEGORY_PLAYBOOK[tool.category].audience,
    },
  };
};

export const getToolContentByPath = (pathname) => {
  const normalizedPath = normalizePath(pathname);
  const tool = allTools.find((entry) => normalizePath(entry.url) === normalizedPath);
  return getToolContent(tool);
};

export const getCategoryContentByPath = (pathname) => {
  const normalizedPath = normalizePath(pathname);
  const category = toolCategories.find((entry) => normalizePath(entry.url) === normalizedPath);
  if (!category) return null;

  const tools = allTools.filter((tool) => tool.category === category.name);
  const playbook = CATEGORY_PLAYBOOK[category.name] || CATEGORY_PLAYBOOK.Utility;
  const priorityTools = tools
    .map((tool) => ({ tool, priority: getPriorityProfile(tool) }))
    .filter(({ priority }) => priority.tier !== 'baseline')
    .slice(0, 8);

  return {
    ...category,
    toolCount: tools.length,
    tools,
    intro: `${category.name} tools on ${SITE_NAME} are organized to help users find the right page faster, compare relevant workflows, and move from search intent to useful output without extra clicks.`,
    detail: `This section currently includes ${tools.length} indexable ${category.name.toLowerCase()} tools covering ${tools.slice(0, 5).map((tool) => tool.name).join(', ')}${tools.length > 5 ? ', and more.' : '.'}`,
    reasons: playbook.reasons,
    audience: playbook.audience,
    useCases: playbook.useCases,
    priorityTools,
  };
};

export const getSeoOpportunityList = () =>
  allTools
    .map((tool) => ({
      name: tool.name,
      url: tool.url,
      category: tool.category,
      ...getPriorityProfile(tool),
    }))
    .sort((left, right) => {
      const order = { high: 0, medium: 1, baseline: 2 };
      return (order[left.tier] ?? 3) - (order[right.tier] ?? 3);
    });

export const getSiteSummary = () => {
  const categories = toolCategories.map((category) => ({
    name: category.name,
    url: `${SITE_URL}${category.url}`,
    toolCount: allTools.filter((tool) => tool.category === category.name).length,
  }));

  return {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    totalTools: allTools.length,
    categories,
  };
};

