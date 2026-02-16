import React, { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import "../assets/css/category-navigation.css";

const CategoryNavigation = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: 1,
      title: "Math Calculators",
      description: "Basic and advanced mathematical calculations",
      icon: "fas fa-calculator",
      color: "#1a1a1a",
      link: "/math",
    },
    {
      id: 2,
      title: "Finance Calculators",
      description: "Financial planning and investment tools",
      icon: "fas fa-dollar-sign",
      color: "#1a1a1a",
      link: "/finance",
    },
    {
      id: 3,
      title: "Science Calculators",
      description: "Scientific and engineering calculations",
      icon: "fas fa-atom",
      color: "#1a1a1a",
      link: "/science",
    },
    {
      id: 4,
      title: "Health Calculators",
      description: "Health and fitness calculations",
      icon: "fas fa-heartbeat",
      color: "#1a1a1a",
      link: "/health",
    },
    {
      id: 5,
      title: "Utility Tools",
      description: "Conversion and utility tools",
      icon: "fas fa-tools",
      color: "#1a1a1a",
      link: "/utility-tools",
    },
    {
      id: 6,
      title: "Knowledge Calculators",
      description: "Educational and knowledge-based tools",
      icon: "fas fa-brain",
      color: "#1a1a1a",
      link: "/knowledge",
    },
  ];

  const filterTabs = [
    {
      id: "all",
      title: "All Tools",
      icon: "fas fa-th-large",
      color: "#1a1a1a",
    },
    { id: "math", title: "Math", icon: "fas fa-calculator", color: "#1a1a1a" },
    {
      id: "finance",
      title: "Finance",
      icon: "fas fa-dollar-sign",
      color: "#1a1a1a",
    },
    { id: "science", title: "Science", icon: "fas fa-atom", color: "#1a1a1a" },
    {
      id: "health",
      title: "Health",
      icon: "fas fa-heartbeat",
      color: "#1a1a1a",
    },
    { id: "utility", title: "Utility", icon: "fas fa-tools", color: "#1a1a1a" },
    { id: "pdf", title: "PDF", icon: "fas fa-file-pdf", color: "#1a1a1a" },
    {
      id: "knowledge",
      title: "Knowledge",
      icon: "fas fa-brain",
      color: "#1a1a1a",
    },
  ];

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
    setSearchQuery(""); // Clear search when switching tabs
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query) {
      setActiveFilter("all"); // Reset to all when searching
    }
  };

  const allTools = [
    {
      name: "Fraction Calculator",
      desc: "Add, subtract, multiply and divide fractions",
      url: "/math/calculators/fraction-calculator",
      category: "Math",
      icon: "fas fa-divide",
    },
    {
      name: "Percentage Calculator",
      desc: "Calculate percentages quickly and easily",
      url: "/math/calculators/percentage-calculator",
      category: "Math",
      icon: "fas fa-percentage",
    },
    {
      name: "Decimal to Fraction",
      desc: "Convert decimals to fractions instantly",
      url: "/math/calculators/decimal-to-fraction-calculator",
      category: "Math",
      icon: "fas fa-arrows-alt-h",
    },
    {
      name: "LCM Calculator",
      desc: "Find least common multiple",
      url: "/math/calculators/lcm-calculator",
      category: "Math",
      icon: "fas fa-sort-numeric-up",
    },
    {
      name: "Binary Calculator",
      desc: "Convert and calculate binary numbers",
      url: "/math/calculators/binary-calculator",
      category: "Math",
      icon: "fas fa-1",
    },
    {
      name: "LCD Calculator",
      desc: "Find lowest common denominator",
      url: "/math/calculators/lcd-calculator",
      category: "Math",
      icon: "fas fa-sort-numeric-down",
    },
    {
      name: "Compare Fractions",
      desc: "Compare multiple fractions",
      url: "/math/calculators/comparing-fractions-calculator",
      category: "Math",
      icon: "fas fa-balance-scale",
    },
    {
      name: "Decimal Calculator",
      desc: "Perform decimal arithmetic operations",
      url: "/math/calculators/decimal-calculator",
      category: "Math",
      icon: "fas fa-calculator",
    },
    {
      name: "Compare Decimals",
      desc: "Compare multiple decimals",
      url: "/math/calculators/comparing-decimals-calculator",
      category: "Math",
      icon: "fas fa-balance-scale",
    },
    {
      name: "Fraction to Percent",
      desc: "Convert fractions to percentages",
      url: "/math/calculators/fraction-to-percent-calculator",
      category: "Math",
      icon: "fas fa-percentage",
    },
    {
      name: "Improper to Mixed",
      desc: "Convert improper fractions to mixed numbers",
      url: "/math/calculators/improper-fraction-to-mixed-calculator",
      category: "Math",
      icon: "fas fa-layer-group",
    },
    {
      name: "Percent to Fraction",
      desc: "Convert percentages to fractions",
      url: "/math/calculators/percent-to-fraction-calculator",
      category: "Math",
      icon: "fas fa-percentage",
    },
    {
      name: "SSE Calculator",
      desc: "Calculate sum of squares of errors",
      url: "/math/calculators/sse-calculator",
      category: "Math",
      icon: "fas fa-calculator",
    },
    {
      name: "Derivative Calculator",
      desc: "Calculate derivatives of functions",
      url: "/math/calculators/derivative-calculator",
      category: "Math",
      icon: "fas fa-calculator",
    },
    {
      name: "Integral Calculator",
      desc: "Calculate definite and indefinite integrals",
      url: "/math/calculators/integral-calculator",
      category: "Math",
      icon: "fas fa-integral",
    },
    {
      name: "Laplace Calculator",
      desc: "Calculate Laplace transform",
      url: "/math/calculators/laplace-calculator",
      category: "Math",
      icon: "fas fa-calculator",
    },

    {
      name: "Mortgage Calculator",
      desc: "Calculate monthly mortgage payments with taxes, insurance, PMI",
      url: "/finance/calculators/mortgage-calculator",
      category: "Finance",
      icon: "fas fa-home",
    },
    {
      name: "Loan Calculator",
      desc: "Calculate loan payments with down payment and fees",
      url: "/finance/calculators/loan-calculator",
      category: "Finance",
      icon: "fas fa-hand-holding-usd",
    },
    {
      name: "Currency Calculator",
      desc: "Convert between 170+ world currencies with real-time rates",
      url: "/finance/calculators/currency-calculator",
      category: "Finance",
      icon: "fas fa-exchange-alt",
    },
    {
      name: "House Affordability Calculator",
      desc: "Calculate how much house you can afford",
      url: "/finance/calculators/house-affordability-calculator",
      category: "Finance",
      icon: "fas fa-home",
    },
    {
      name: "Compound Interest Calculator",
      desc: "Calculate investment growth with compound interest",
      url: "/finance/calculators/compound-interest-calculator",
      category: "Finance",
      icon: "fas fa-chart-area",
    },
    {
      name: "ROI Calculator",
      desc: "Calculate return on investment and annualized returns",
      url: "/finance/calculators/roi-calculator",
      category: "Finance",
      icon: "fas fa-chart-line",
    },
    {
      name: "Business Loan Calculator",
      desc: "Calculate business loan payments",
      url: "/finance/calculators/business-loan-calculator",
      category: "Finance",
      icon: "fas fa-briefcase",
    },
    {
      name: "Credit Card Calculator",
      desc: "Calculate credit card payments, interest, and payoff time",
      url: "/finance/calculators/credit-card-calculator",
      category: "Finance",
      icon: "fas fa-credit-card",
    },
    {
      name: "Investment Calculator",
      desc: "Calculate investment growth, compound returns, and future value",
      url: "/finance/calculators/investment-calculator",
      category: "Finance",
      icon: "fas fa-chart-line",
    },
    {
      name: "Tax Calculator",
      desc: "Calculate federal and state income taxes, deductions, and credits",
      url: "/finance/calculators/tax-calculator",
      category: "Finance",
      icon: "fas fa-file-invoice-dollar",
    },
    {
      name: "Retirement Calculator",
      desc: "Calculate retirement savings goals, monthly contributions, and future income",
      url: "/finance/calculators/retirement-calculator",
      category: "Finance",
      icon: "fas fa-piggy-bank",
    },
    {
      name: "Sales Tax Calculator",
      desc: "Calculate sales tax, subtotal, and total amount for purchases",
      url: "/finance/calculators/sales-tax-calculator",
      category: "Finance",
      icon: "fas fa-receipt",
    },
    {
      name: "Debt Payoff Calculator",
      desc: "Calculate debt payoff time, total interest, and payment strategies",
      url: "/finance/calculators/debt-payoff-calculator",
      category: "Finance",
      icon: "fas fa-credit-card",
    },
    {
      name: "Insurance Calculator",
      desc: "Calculate insurance premiums, coverage costs, and policy comparisons",
      url: "/finance/calculators/insurance-calculator",
      category: "Finance",
      icon: "fas fa-shield-alt",
    },
    {
      name: "Budget Calculator",
      desc: "Create and manage personal budgets with the 50-30-20 rule and custom allocations",
      url: "/finance/calculators/budget-calculator",
      category: "Finance",
      icon: "fas fa-calculator",
    },
    {
      name: "Rental Property Calculator",
      desc: "Calculate rental property ROI, cash flow, and investment returns",
      url: "/finance/calculators/rental-property-calculator",
      category: "Finance",
      icon: "fas fa-home",
    },
    {
      name: "Debt Income Calculator",
      desc: "Calculate your debt-to-income ratio to assess financial health and loan eligibility",
      url: "/finance/calculators/debt-income-calculator",
      category: "Finance",
      icon: "fas fa-balance-scale",
    },
    {
      name: "Down Payment Calculator",
      desc: "Calculate down payment amount, loan amount, and monthly mortgage payments",
      url: "/finance/calculators/down-payment-calculator",
      category: "Finance",
      icon: "fas fa-home",
    },
    {
      name: "Present Value Calculator",
      desc: "Calculate the present value of future cash flows and investments",
      url: "/finance/calculators/present-value-calculator",
      category: "Finance",
      icon: "fas fa-chart-line",
    },
    {
      name: "Future Value Calculator",
      desc: "Calculate the future value of investments and savings with compound interest",
      url: "/finance/calculators/future-value-calculator",
      category: "Finance",
      icon: "fas fa-chart-line",
    },

    {
      name: "Wave Speed Calculator",
      desc: "Calculate wave speed, frequency, and wavelength",
      url: "/science/calculators/wave-speed-calculator",
      category: "Science",
      icon: "fas fa-wave-square",
    },
    {
      name: "Gravity Calculator",
      desc: "Calculate gravitational force and acceleration",
      url: "/science/calculators/gravity-calculator",
      category: "Science",
      icon: "fas fa-globe",
    },
    {
      name: "Work Power Calculator",
      desc: "Calculate work, power, and energy",
      url: "/science/calculators/work-power-calculator",
      category: "Science",
      icon: "fas fa-cogs",
    },
    {
      name: "DBm Watts Calculator",
      desc: "Convert between dBm and watts",
      url: "/science/calculators/dbm-watts-calculator",
      category: "Science",
      icon: "fas fa-bolt",
    },
    {
      name: "DBm Milliwatts Calculator",
      desc: "Convert between dBm and milliwatts",
      url: "/science/calculators/dbm-milliwatts-calculator",
      category: "Science",
      icon: "fas fa-bolt",
    },
    {
      name: "Capacitance Calculator",
      desc: "Calculate electrical capacitance",
      url: "/science/calculators/capacitance-calculator",
      category: "Science",
      icon: "fas fa-microchip",
    },
    {
      name: "Electric Flux Calculator",
      desc: "Calculate electric flux through surfaces",
      url: "/science/calculators/electric-flux-calculator",
      category: "Science",
      icon: "fas fa-lightning",
    },
    {
      name: "Atomic Mass Calculator",
      desc: "Calculate average atomic mass",
      url: "/science/calculators/average-atomic-mass-calculator",
      category: "Science",
      icon: "fas fa-atom",
    },

    {
      name: "BMI Calculator",
      desc: "Calculate your body mass index",
      url: "/health/calculators/bmi-calculator",
      category: "Health",
      icon: "fas fa-weight",
    },
    {
      name: "Calorie Calculator",
      desc: "Calculate daily calorie needs",
      url: "/health/calculators/calorie-calculator",
      category: "Health",
      icon: "fas fa-apple-alt",
    },
    {
      name: "Water Intake Calculator",
      desc: "Calculate daily water requirements",
      url: "/health/calculators/water-intake-calculator",
      category: "Health",
      icon: "fas fa-tint",
    },
    {
      name: "Weight Loss Calculator",
      desc: "Plan your weight loss journey",
      url: "/health/calculators/weight-loss-calculator",
      category: "Health",
      icon: "fas fa-chart-line",
    },
    {
      name: "Weight Gain Calculator",
      desc: "Plan your weight gain journey",
      url: "/health/calculators/weight-gain-calculator",
      category: "Health",
      icon: "fas fa-chart-line",
    },
    {
      name: "Body Fat Calculator",
      desc: "Calculate body fat percentage",
      url: "/health/calculators/body-fat-calculator",
      category: "Health",
      icon: "fas fa-user",
    },
    {
      name: "Ideal Weight Calculator",
      desc: "Find your ideal body weight",
      url: "/health/calculators/ideal-body-weight-calculator",
      category: "Health",
      icon: "fas fa-balance-scale",
    },
    {
      name: "Diabetes Risk Calculator",
      desc: "Assess your diabetes risk",
      url: "/health/calculators/diabetes-risk-calculator",
      category: "Health",
      icon: "fas fa-chart-pie",
    },
    {
      name: "DRICalculator",
      desc: "Calculate your dietary reference intake",
      url: "/health/calculators/dri-calculator",
      category: "Health",
      icon: "fas fa-utensils",
    },
    {
      name: "BRI Calculator",
      desc: "Calculate your body roundness index",
      url: "/health/calculators/bri-calculator",
      category: "Health",
      icon: "fas fa-circle-notch",
    },

    {
      name: "Image to WebP Converter",
      desc: "Convert images to WebP format",
      url: "/utility-tools/image-tools/image-to-webp-converter",
      category: "Utility",
      icon: "fas fa-image",
    },
    {
      name: "Word Counter",
      desc: "Count words, characters, sentences, and paragraphs",
      url: "/utility-tools/word-counter",
      category: "Utility",
      icon: "fas fa-font",
    },
    {
      name: "Password Generator",
      desc: "Create secure passwords",
      url: "/utility-tools/password-generator",
      category: "Utility",
      icon: "fas fa-key",
    },
    {
      name: "QR Code Generator",
      desc: "Create professional QR codes",
      url: "/utility-tools/qr-code-generator",
      category: "Utility",
      icon: "fas fa-qrcode",
    },
    {
      name: "OCR PDF Generator",
      desc: "Extract text from PDF documents",
      url: "/utility-tools/ocr-pdf-generator",
      category: "Utility",
      icon: "fas fa-file-alt",
    },
    {
      name: "Gen Z Translator",
      desc: "Translate modern slang and expressions",
      url: "/utility-tools/genz-translator",
      category: "Utility",
      icon: "fas fa-font",
    },

    {
      name: "RGB to HEX",
      desc: "Convert color formats",
      url: "/utility-tools/converter-tools/rgb-to-hex-converter",
      category: "Utility",
      icon: "fas fa-palette",
    },
    {
      name: "Text Case Converter",
      desc: "Change text case formats",
      url: "/utility-tools/converter-tools/text-case-converter",
      category: "Utility",
      icon: "fas fa-font",
    },

    /* PDF Tools - Pointing to OCR for now or placeholders */
    /*
    {
      name: "PDF Compressor",
      desc: "Reduce PDF file size while maintaining quality",
      url: "/utility-tools/converter-tools/compress-pdf",
      category: "PDF",
      icon: "fas fa-compress-alt",
    },
    ...
    */
    {
      name: "PDF OCR",
      desc: "Extract text from scanned PDF documents",
      url: "/utility-tools/ocr-pdf-generator",
      category: "PDF",
      icon: "fas fa-eye",
    },
    {
      name: "PDF to Image Converter",
      desc: "Convert PDF pages to images (PNG/JPG)",
      url: "/utility-tools/converter-tools/pdf-to-image-converter",
      category: "PDF",
      icon: "fas fa-file-image",
    },
    {
      name: "PDF Merger",
      desc: "Combine multiple PDF files into one",
      url: "/utility-tools/converter-tools/merge-pdf",
      category: "PDF",
      icon: "fas fa-object-group",
    },
    {
      name: "PDF Splitter",
      desc: "Split PDF files into multiple pages",
      url: "/utility-tools/converter-tools/split-pdf",
      category: "PDF",
      icon: "fas fa-object-group",
    },
    {
      name: "Delete PDF Pages",
      desc: "Remove unwanted pages from PDF files",
      url: "/utility-tools/converter-tools/delete-pdf-pages",
      category: "PDF",
      icon: "fas fa-trash-alt",
    },
    {
      name: "Organize PDF Pages",
      desc: "Organize PDF pages in a specific order",
      url: "/utility-tools/converter-tools/organize-pdf-pages",
      category: "PDF",
      icon: "fas fa-trash-alt",
    },


    {
      name: "Morse Code Translator",
      desc: "Convert text to Morse code and decode",
      url: "/utility-tools/morse-code-translator",
      category: "Utility",
      icon: "fas fa-signal",
    },
    {
      name: "HTML to Markdown",
      desc: "Convert HTML markup to Markdown",
      url: "/utility-tools/html-to-markdown-converter",
      category: "Utility",
      icon: "fab fa-html5",
    },
    {
      name: "Gen Z Translator",
      desc: "Translate modern slang and expressions",
      url: "/utility-tools/genz-translator",
      category: "Language",
      icon: "fas fa-language",
    },
    {
      name: "English to IPA",
      desc: "Convert text to phonetic notation",
      url: "/utility-tools/english-to-ipa-translator",
      category: "Utility",
      icon: "fas fa-microphone-alt",
    },

    {
      name: "Audio Bitrate Converter",
      desc: "Convert audio between different bitrates",
      url: "/utility-tools/audio-bitrate-converter",
      category: "Utility",
      icon: "fas fa-music",
    },
    {
      name: "Instagram Reels Downloader",
      desc: "Download Instagram Reels videos",
      url: "/utility-tools/converter-tools/reels-downloader",
      category: "Utility",
      icon: "fab fa-instagram",
    },
    {
      name: "TikTok Downloader",
      desc: "Download TikTok videos",
      url: "/utility-tools/converter-tools/tiktok-downloader",
      category: "Utility",
      icon: "fab fa-tiktok",
    },
    {
      name: "QR Code Scanner",
      desc: "Scan and decode QR codes",
      url: "/utility-tools/converter-tools/qr-code-scanner",
      category: "Utility",
      icon: "fas fa-qrcode",
    },

    {
      name: "Aspect Ratio Converter",
      desc: "Calculate and convert aspect ratios",
      url: "/utility-tools/image-tools/aspect-ratio-converter",
      category: "Utility",
      icon: "fas fa-expand-arrows-alt",
    },
    {
      name: "Color Blindness Simulator",
      desc: "Simulate color vision deficiencies",
      url: "/utility-tools/image-tools/color-blindness-simulator",
      category: "Utility",
      icon: "fas fa-eye",
    },
    {
      name: "RGB to Pantone",
      desc: "Convert RGB to Pantone colors",
      url: "/utility-tools/converter-tools/rgb-to-pantone-converter",
      category: "Utility",
      icon: "fas fa-palette",
    },
    {
      name: "Gold Weight Converter",
      desc: "Convert precious metal weights",
      url: "/utility-tools/converter-tools/gold-precious-metal-weight-converter",
      category: "Utility",
      icon: "fas fa-coins",
    },
    // {
    //   name: "Image to WebP Converter",
    //   desc: "Convert images to WebP format",
    //   url: "/utility-tools/image-tools/image-to-webp-converter",
    //   category: "Utility",
    //   icon: "fas fa-image",
    // },



    {
      name: "GPA Calculator",
      desc: "Calculate your grade point average",
      url: "/knowledge/calculators/gpa-calculator",
      category: "Knowledge",
      icon: "fas fa-graduation-cap",
    },
    {
      name: "Age Calculator",
      desc: "Calculate age in years, months, days",
      url: "/knowledge/calculators/age-calculator",
      category: "Knowledge",
      icon: "fas fa-calendar-alt",
    },
    {
      name: "WPM Calculator",
      desc: "Test your typing speed",
      url: "/knowledge/calculators/word-per-minute",
      category: "Knowledge",
      icon: "fas fa-keyboard",
    },
    {
      name: "Habit Formation Calculator",
      desc: "Calculate your habit formation",
      url: "/knowledge/calculators/habit-formation-calculator",
      category: "Knowledge",
      icon: "fas fa-check-circle",
    },
    {
      name: "Language Level Calculator",
      desc: "Calculate your language level",
      url: "/knowledge/calculators/language-level-calculator",
      category: "Knowledge",
      icon: "fas fa-language",
    },
    {
      name: "Fuel Calculator",
      desc: "Calculate fuel consumption",
      url: "/knowledge/calculators/fuel-calculator",
      category: "Knowledge",
      icon: "fas fa-gas-pump",
    },
    {
      name: "Average Time Calculator",
      desc: "Calculate average time",
      url: "/knowledge/calculators/average-time-calculator",
      category: "Knowledge",
      icon: "fas fa-clock",
    },
    {
      name: "Career Assessment Calculator",
      desc: "Calculate your career assessment",
      url: "/knowledge/calculators/career-assessment-calculator",
      category: "Knowledge",
      icon: "fas fa-briefcase",
    },
    {
      name: "Trauma Assessment Calculator",
      desc: "Calculate your trauma assessment",
      url: "/knowledge/calculators/trauma-assessment-calculator",
      category: "Knowledge",
      icon: "fas fa-brain",
    },
    {
      name: "Anxiety Assessment Calculator",
      desc: "Calculate your anxiety assessment",
      url: "/knowledge/calculators/anxiety-assessment-calculator",
      category: "Knowledge",
      icon: "fas fa-heart",
    },
    {
      name: "MBTI Personality",
      desc: "Discover your personality type",
      url: "/knowledge/calculators/mbti-calculator",
      category: "Knowledge",
      icon: "fas fa-user-friends",
    },
    {
      name: "Carbon Footprint",
      desc: "Calculate your environmental impact",
      url: "/knowledge/calculators/carbon-footprint-calculator",
      category: "Knowledge",
      icon: "fas fa-leaf",
    },
    {
      name: "Zakat Calculator",
      desc: "Calculate Islamic charity amount",
      url: "/knowledge/calculators/zakat-calculator",
      category: "Knowledge",
      icon: "fas fa-hand-holding-heart",
    },
  ];

  // Filter tools based on search query or active filter
  const filteredTools = searchQuery
    ? allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : activeFilter === "all"
      ? allTools
      : allTools.filter((tool) => tool.category.toLowerCase() === activeFilter);

  const getCategoryColor = (category) => {
    const categoryMap = {
      Math: "#3b82f6",
      Finance: "#10b981",
      Science: "#f59e0b",
      Health: "#ec4899",
      Utility: "#8b5cf6",
      PDF: "#ef4444",
      Knowledge: "#f59e0b",
    };
    return categoryMap[category] || "#64748b";
  };

  const getToolColor = (index) => {
    const colors = [
      "#8b5cf6",
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#ef4444",
      "#06b6d4",
      "#84cc16",
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="category-navigation">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Explore Categories</h2>
          <p className="section-description">
            Choose from our comprehensive collection of calculators and tools
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="category-card"
              style={{ "--category-color": category.color }}
            >
              <div
                className="category-icon"
                style={{
                  backgroundColor: `${category.color}15`,
                  border: `1px solid ${category.color}30`,
                }}
              >
                <i
                  className={category.icon}
                  style={{ color: category.color }}
                ></i>
              </div>
              <div className="category-content">
                <h3 className="category-title">{category.title}</h3>
                <p className="category-description">{category.description}</p>
              </div>
              <div className="category-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <SearchBar
          allTools={allTools}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}
          isSearching={!!searchQuery}
        />

        {/* Filter Tabs Section - Hidden when searching */}
        {!searchQuery && (
          <div className="filter-section">
            <div className="filter-tabs">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`filter-tab ${activeFilter === tab.id ? "active" : ""
                    }`}
                  onClick={() => handleFilterClick(tab.id)}
                  style={{ "--tab-color": tab.color }}
                >
                  <div
                    className="filter-tab-icon"
                    style={{
                      backgroundColor:
                        activeFilter === tab.id ? tab.color : `${tab.color}15`,
                      border: `1px solid ${activeFilter === tab.id ? tab.color : `${tab.color}30`
                        }`,
                    }}
                  >
                    <i
                      className={tab.icon}
                      style={{
                        color: activeFilter === tab.id ? "white" : tab.color,
                      }}
                    ></i>
                  </div>
                  <span className="filter-tab-title">{tab.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tools Grid Section */}
        <div className="tools-section">
          <div className="tools-header">
            <h3 className="tools-title">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : activeFilter === "all"
                  ? "All Tools"
                  : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)
                  } Tools`}
            </h3>
            <p className="tools-count">
              {filteredTools.length}{" "}
              {filteredTools.length === 1 ? "tool" : "tools"} available
            </p>
          </div>

          <div className="tools-grid">
            {filteredTools.map((tool, index) => (
              <Link
                key={index}
                to={tool.url}
                className="tool-card"
                style={{ "--tool-color": getToolColor(index) }}
              >
                <div className="tool-icon">
                  <i className={tool.icon}></i>
                </div>
                <div className="tool-content">
                  <h4 className="tool-title">{tool.name}</h4>
                  <p className="tool-description">{tool.desc}</p>
                  <div className="tool-category">
                    <span className="tool-category-badge">{tool.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNavigation;
