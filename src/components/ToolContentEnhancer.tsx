'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toolCategories } from '../data/toolCategories';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Tool {
  name: string;
  desc: string;
  url: string;
  category: string;
  icon: string;
}

interface Faq {
  question: string;
  answer: string;
}

interface ToolContent {
  name: string;
  desc: string;
  url: string;
  category: string;
  icon: string;
  kind: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  overview: string[];
  functionalitySummary: string[];
  capabilities: string[];
  howToSteps: string[];
  whenToUse: string[];
  benefits: string[];
  useCases: string[];
  audience: string[];
  reasons: string[];
  tips: string[];
  mistakes: string[];
  searchIntent: string[];
  faqs: Faq[];
  relatedTools: Tool[];
  priority: { tier: string; outlook: string; rationale: string; focusKeywords: string[] };
}

interface ToolContentEnhancerProps {
  toolContent: ToolContent;
}

interface FormulaConfig {
  title: string;
  latex: string;
  explanation: string;
}

const FORMULAS_BY_PATH: Record<string, FormulaConfig[]> = {
  '/math/calculators/fraction-calculator': [
    {
      title: 'Addition of Fractions',
      latex: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}',
      explanation: 'Find a common denominator, scale the numerators based on the denominators, add them, and simplify the resulting fraction to its lowest terms.'
    },
    {
      title: 'Subtraction of Fractions',
      latex: '\\frac{a}{b} - \\frac{c}{d} = \\frac{ad - bc}{bd}',
      explanation: 'Find a common denominator, scale the numerators based on the denominators, subtract them, and simplify the resulting fraction.'
    },
    {
      title: 'Multiplication of Fractions',
      latex: '\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}',
      explanation: 'Multiply the numerators together to find the new numerator, multiply the denominators together to find the new denominator, then simplify.'
    },
    {
      title: 'Division of Fractions',
      latex: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{ad}{bc}',
      explanation: 'Multiply the first fraction by the reciprocal (inverse) of the second fraction.'
    }
  ],
  '/math/calculators/percentage-calculator': [
    {
      title: 'Percentage of a Value',
      latex: 'Y = P\\% \\times X = \\frac{P}{100} \\times X',
      explanation: 'To find P% of X, divide P by 100 and multiply by X.'
    },
    {
      title: 'Percentage Proportion',
      latex: 'P\\% = \\left(\\frac{Y}{X}\\right) \\times 100',
      explanation: 'To find what percentage Y is of X, divide Y by X and multiply by 100.'
    }
  ],
  '/math/calculators/comparing-fractions-calculator': [
    {
      title: 'Comparing Fractions via LCD',
      latex: '\\frac{a}{b} \\text{ vs } \\frac{c}{d} \\implies \\frac{a \\times d}{b \\times d} \\text{ vs } \\frac{c \\times b}{d \\times b} \\implies ad \\text{ vs } bc',
      explanation: 'Convert both fractions to have the same common denominator. Once the denominators are identical, the fraction with the larger numerator is the larger fraction.'
    },
    {
      title: 'Cross-Multiplication Method',
      latex: '\\frac{a}{b} > \\frac{c}{d} \\iff a \\times d > b \\times c',
      explanation: 'Multiply the numerator of the first fraction by the denominator of the second, and the numerator of the second by the denominator of the first. Compare the two products.'
    }
  ],
  '/math/calculators/lcm-calculator': [
    {
      title: 'LCM Formula (Two Numbers)',
      latex: '\\text{LCM}(a, b) = \\frac{|a \\times b|}{\\text{GCD}(a, b)}',
      explanation: 'The Least Common Multiple of two numbers is their product divided by their Greatest Common Divisor.'
    },
    {
      title: 'LCM of Multiple Numbers',
      latex: '\\text{LCM}(a, b, c) = \\text{LCM}(\\text{LCM}(a, b), c)',
      explanation: 'For three or more numbers, find the LCM of the first two numbers, then find the LCM of that result and the next number.'
    }
  ],
  '/math/calculators/decimal-to-fraction-calculator': [
    {
      title: 'Terminating Decimal Formula',
      latex: 'x = 0.a_1a_2...a_k = \\frac{a_1a_2...a_k}{10^k}',
      explanation: 'Convert a terminating decimal by placing the digits over a power of 10 equal to the number of decimal places, then simplify.'
    },
    {
      title: 'Repeating Decimal Formula',
      latex: '10^{dA+dB}x - 10^{dA}x = \\text{Integer Part}',
      explanation: 'Shift the decimal past the repeating cycle, subtract the non-repeating shift equation, and solve algebraically to simplify.'
    }
  ],
  '/math/calculators/binary-calculator': [
    {
      title: 'Binary Place Value Formula',
      latex: '(b_n...b_1b_0)_2 = \\sum_{i=0}^{n} (b_i \\times 2^i)',
      explanation: 'To convert a binary number to decimal, multiply each bit by 2 raised to the power of its position index (starting at 0 from the right).'
    },
    {
      title: 'Binary Arithmetic Addition Rules',
      latex: '0+0=0,\\; 0+1=1,\\; 1+0=1,\\; 1+1=10_2 \\; (0 \\text{ carry } 1)',
      explanation: 'Binary addition follows normal addition rules but carries over when a column sum reaches 2 (written as 10 in binary).'
    }
  ],
  '/math/calculators/lcd-calculator': [
    {
      title: 'Lowest Common Denominator Formula',
      latex: '\\text{LCD}(f_1, f_2, ..., f_n) = \\text{LCM}(d_1, d_2, ..., d_n)',
      explanation: 'The Lowest Common Denominator of a group of fractions is the Least Common Multiple (LCM) of their denominators.'
    },
    {
      title: 'Fraction Scaling Formula',
      latex: '\\frac{a}{d} = \\frac{a \\times m}{d \\times m} = \\frac{a \\times m}{\\text{LCD}} \\quad \\text{where } m = \\frac{\\text{LCD}}{d}',
      explanation: 'Multiply both numerator and denominator by the factor m (LCD divided by the original denominator) to scale the fraction without changing its value.'
    }
  ],
  '/math/calculators/decimal-calculator': [
    {
      title: 'Decimal Arithmetic Alignment Rule',
      latex: '\\begin{array}{rl} 12.34 & \\quad \\text{(Align decimals)} \\\\ + \\; 5.60 & \\quad \\text{(Pad trailing zeros)} \\\\ \\hline 17.94 & \\end{array}',
      explanation: 'To add or subtract decimals, align the decimal points vertically, pad trailing spaces with zeros, and perform standard column arithmetic.'
    },
    {
      title: 'Decimal Multiplication Rule',
      latex: '(a \\times 10^{-m}) \\times (b \\times 10^{-n}) = (a \\times b) \\times 10^{-(m+n)}',
      explanation: 'Multiply numbers as integers, then shift the decimal point to the left by the total count of decimal places in both original values.'
    }
  ],
  '/finance/calculators/mortgage-calculator': [
    {
      title: 'Monthly Mortgage Payment',
      latex: 'M = P \\frac{r(1+r)^n}{(1+r)^n - 1}',
      explanation: 'Where M is the monthly payment, P is the principal loan amount, r is the monthly interest rate (annual interest rate divided by 12), and n is the total number of monthly payments (loan term in years multiplied by 12).'
    }
  ],
  '/finance/calculators/compound-interest-calculator': [
    {
      title: 'Compound Interest Formula',
      latex: 'A = P \\left(1 + \\frac{r}{n}\\right)^{nt}',
      explanation: 'Where A is the future value of the investment, P is the principal starting balance, r is the annual interest rate, n is the number of times interest compounds per year, and t is the time in years.'
    }
  ],
  '/finance/calculators/roi-calculator': [
    {
      title: 'Return on Investment (ROI)',
      latex: '\\text{ROI} = \\left(\\frac{\\text{Current Value} - \\text{Initial Cost}}{\\text{Initial Cost}}\\right) \\times 100',
      explanation: 'Measures the gain or loss generated on an investment relative to the amount of money originally invested.'
    }
  ],
  '/finance/calculators/amortization-calculator': [
    {
      title: 'Monthly Payment Formula',
      latex: 'M = P \\times \\frac{r(1+r)^n}{(1+r)^n - 1}',
      explanation: 'Where M is the monthly payment, P is the loan principal, r is the monthly interest rate, and n is the total number of payments (loan term in months).'
    },
    {
      title: 'Remaining Balance After k Payments',
      latex: 'B_k = P \\times \\frac{(1+r)^n - (1+r)^k}{(1+r)^n - 1}',
      explanation: 'Calculates the outstanding loan balance after k payments have been made, where r is the monthly rate and n is the total number of payments.'
    }
  ],
  '/finance/calculators/loan-calculator': [
    {
      title: 'Standard Loan Payment Formula',
      latex: 'M = P \\times \\frac{r(1+r)^n}{(1+r)^n - 1}',
      explanation: 'Where M is the monthly payment, P is the loan principal net of down payment, r is the periodic interest rate, and n is the total number of payments.'
    },
    {
      title: 'Total Cost of Loan',
      latex: '\\text{Total Cost} = M \\times n + \\text{Fees} + \\text{Down Payment}',
      explanation: 'The total cost includes all monthly payments over the full term, plus any origination or documentation fees, plus the initial down payment.'
    }
  ],
  '/finance/calculators/currency-calculator': [
    {
      title: 'Currency Conversion Formula',
      latex: '\\text{Target Amount} = \\text{Base Amount} \\times \\text{Exchange Rate}',
      explanation: 'Multiply the amount in the base currency by the exchange rate (price of one unit of base currency in target currency) to get the converted amount.'
    },
    {
      title: 'Reverse Exchange Rate',
      latex: '\\text{Reverse Rate} = \\frac{1}{\\text{Exchange Rate}}',
      explanation: 'The reciprocal of the exchange rate gives the amount of base currency needed to buy one unit of the target currency.'
    }
  ],
  '/finance/calculators/house-affordability-calculator': [
    {
      title: 'Front-End DTI (Housing Ratio)',
      latex: '\\text{DTI}_{\\text{front}} = \\frac{\\text{Total Monthly Housing Costs}}{\\text{Gross Monthly Income}} \\times 100\\%',
      explanation: 'Compares total housing costs (principal, interest, taxes, insurance, HOA) to gross monthly income. Lenders typically cap this at 28% for conventional loans.'
    },
    {
      title: 'Maximum Affordable Home Price',
      latex: 'P_{\\text{max}} = \\frac{\\text{Affordable Monthly Payment} \\times \\left((1+r)^n - 1\\right)}{r \\times (1+r)^n} + \\text{Down Payment}',
      explanation: 'Derives the maximum home price by solving the mortgage payment formula for principal, then adding the down payment.'
    }
  ],
  '/finance/calculators/business-loan-calculator': [
    {
      title: 'Business Loan Payment with Fees',
      latex: 'M = (P + F) \\times \\frac{r(1+r)^n}{(1+r)^n - 1}',
      explanation: 'Where P is the base loan amount and F represents all rolled-in fees (origination, documentation, etc.). The total financed amount (P+F) is amortized over n periods at periodic rate r.'
    },
    {
      title: 'Total Cost of Borrowing',
      latex: '\\text{Total Cost} = M \\times n - P',
      explanation: 'Total interest and fees paid over the full loan term, calculated as all payments made minus the original principal borrowed.'
    }
  ],
  '/finance/calculators/credit-card-calculator': [
    {
      title: 'Daily Interest Rate',
      latex: 'r_{\\text{daily}} = \\frac{\\text{APR}}{365}',
      explanation: 'The annual percentage rate divided by 365 gives the daily periodic rate used in credit card interest calculations.'
    },
    {
      title: 'Credit Card Payoff Time',
      latex: 'n = \\frac{\\log\\left(\\frac{M}{M - B \\times r_{\\text{daily}}}\\right)}{\\log(1 + r_{\\text{daily}})}',
      explanation: 'Where B is the current balance, M is the monthly payment, and r\\_daily is the daily interest rate. The formula solves for the number of days to full payoff.'
    }
  ],
  '/finance/calculators/investment-calculator': [
    {
      title: 'Multi-Year Investment Growth',
      latex: 'FV = \\sum_{t=1}^{T} \\left(C_t \\times \\prod_{i=t}^{T} (1 + r_i)\\right)',
      explanation: 'Each year\'s contribution C_t grows at the applicable annual return rate r_i for the remaining years, and the total future value is the sum of all compounded contributions.'
    },
    {
      title: 'Inflation-Adjusted Real Value',
      latex: 'V_{\\text{real}} = \\frac{FV}{(1 + i)^T}',
      explanation: 'Divides the nominal future value by cumulative inflation (i = annual inflation rate, T = total years) to show purchasing power in today\'s dollars.'
    }
  ],
  '/finance/calculators/tax-calculator': [
    {
      title: 'Effective Tax Rate',
      latex: '\\text{Effective Rate} = \\frac{\\text{Total Tax Liability}}{\\text{Taxable Income}} \\times 100\\%',
      explanation: 'The percentage of taxable income actually paid in taxes after all deductions, credits, and progressive bracket calculations.'
    },
    {
      title: 'Marginal Tax Bracket',
      latex: '\\text{Tax} = \\sum_{i=1}^{n} \\left(\\max(0, \\min(\\text{Income}, B_i) - B_{i-1}) \\times r_i\\right)',
      explanation: 'Each portion of income within a bracket\'s range is taxed at that bracket\'s rate r\\_i. Income above a bracket\'s ceiling moves to the next higher bracket.'
    }
  ],
  '/finance/calculators/retirement-calculator': [
    {
      title: 'Retirement Savings Future Value',
      latex: 'FV = P \\times (1+r)^t + C \\times \\frac{(1+r)^t - 1}{r}',
      explanation: 'Where P is current savings, C is the monthly contribution, r is the monthly return rate, and t is the number of months until retirement.'
    },
    {
      title: 'Safe Withdrawal Amount (4% Rule)',
      latex: 'W_{\\text{annual}} = FV \\times 0.04',
      explanation: 'The 4% rule suggests withdrawing 4% of the portfolio value in the first year of retirement, adjusting for inflation annually, to sustain a 30-year retirement.'
    }
  ],
  '/finance/calculators/sales-tax-calculator': [
    {
      title: 'Total Price with Sales Tax',
      latex: 'P_{\\text{total}} = P_{\\text{base}} \\times (1 + r_{\\text{tax}})',
      explanation: 'Multiply the base price by 1 plus the combined sales tax rate (state + local) expressed as a decimal to get the total price including tax.'
    },
    {
      title: 'Reverse Sales Tax (Tax from Total)',
      latex: 'P_{\\text{base}} = \\frac{P_{\\text{total}}}{1 + r_{\\text{tax}}}, \\quad \\text{Tax} = P_{\\text{total}} - P_{\\text{base}}',
      explanation: 'To extract the base price and tax amount from a total that already includes sales tax, divide the total by 1 plus the tax rate.'
    }
  ],
  '/finance/calculators/debt-payoff-calculator': [
    {
      title: 'Debt Payoff Time (Fixed Payment)',
      latex: 'n = \\frac{\\log\\left(\\frac{M}{M - B \\times r}\\right)}{\\log(1 + r)}',
      explanation: 'Where B is the current balance, M is the fixed monthly payment, and r is the monthly interest rate. Solves for the number of months to full payoff.'
    },
    {
      title: 'Total Interest Paid',
      latex: '\\text{Total Interest} = (M \\times n) - B',
      explanation: 'The total interest cost is the sum of all payments minus the original balance borrowed.'
    }
  ],
  '/finance/calculators/budget-calculator': [
    {
      title: '50/30/20 Budget Rule Allocation',
      latex: '\\text{Necds} = I \\times 0.50, \\quad \\text{Wants} = I \\times 0.30, \\quad \\text{Savings} = I \\times 0.20',
      explanation: 'Allocate 50% of after-tax income to needs (housing, food, utilities), 30% to wants (entertainment, dining), and 20% to savings and debt repayment.'
    },
    {
      title: 'Savings Rate',
      latex: '\\text{Savings Rate} = \\frac{\\text{Total Income} - \\text{Total Expenses}}{\\text{Total Income}} \\times 100\\%',
      explanation: 'The percentage of total income that is not spent on expenses — a key indicator of financial health.'
    }
  ],
  '/finance/calculators/rental-property-calculator': [
    {
      title: 'Cap Rate (Capitalization Rate)',
      latex: '\\text{Cap Rate} = \\frac{\\text{NOI}}{\\text{Property Value}} \\times 100\\%',
      explanation: 'Net Operating Income (rental income minus operating expenses) divided by the property purchase price, expressed as a percentage return.'
    },
    {
      title: 'Cash-on-Cash Return',
      latex: '\\text{CoC} = \\frac{\\text{Annual Pre-Tax Cash Flow}}{\\text{Total Cash Invested}} \\times 100\\%',
      explanation: 'Measures the annual return on the actual cash invested (down payment, closing costs, repairs) as a percentage of that invested cash.'
    }
  ],
  '/finance/calculators/debt-income-calculator': [
    {
      title: 'Front-End DTI (Housing Ratio)',
      latex: '\\text{DTI}_{\\text{front}} = \\frac{\\text{Housing Debt Payments}}{\\text{Gross Monthly Income}} \\times 100\\%',
      explanation: 'Housing debt payments (mortgage or rent) divided by gross monthly income. Conventional lenders prefer this below 28%.'
    },
    {
      title: 'Back-End DTI (Total Debt Ratio)',
      latex: '\\text{DTI}_{\\text{back}} = \\frac{\\text{Total Monthly Debt Payments}}{\\text{Gross Monthly Income}} \\times 100\\%',
      explanation: 'All monthly debt obligations divided by gross monthly income. Conventional lenders prefer this below 36%.'
    }
  ],
  '/finance/calculators/down-payment-calculator': [
    {
      title: 'Down Payment Percentage',
      latex: '\\text{Down Payment\\%} = \\frac{\\text{Down Payment Amount}}{\\text{Home Price}} \\times 100\\%',
      explanation: 'The percentage of the home price paid upfront in cash. A down payment of 20% or more eliminates the need for private mortgage insurance (PMI).'
    },
    {
      title: 'Loan-to-Value Ratio (LTV)',
      latex: '\\text{LTV} = \\frac{\\text{Loan Amount}}{\\text{Home Price}} \\times 100\\%',
      explanation: 'The loan amount divided by the home price. Lenders use LTV to assess risk — LTV above 80% typically requires PMI.'
    }
  ],
  '/finance/calculators/present-value-calculator': [
    {
      title: 'Present Value of a Lump Sum',
      latex: 'PV = \\frac{FV}{\\left(1 + \\frac{r}{n}\\right)^{n \\times t}}',
      explanation: 'Where FV is the future value, r is the annual discount rate, n is the number of compounding periods per year, and t is the time in years.'
    },
    {
      title: 'Present Value of an Ordinary Annuity',
      latex: 'PV = PMT \\times \\frac{1 - (1 + r)^{-t}}{r}',
      explanation: 'Where PMT is the periodic payment, r is the periodic discount rate, and t is the total number of payments.'
    }
  ],
  '/finance/calculators/future-value-calculator': [
    {
      title: 'Future Value of a Lump Sum',
      latex: 'FV = PV \\times \\left(1 + \\frac{r}{n}\\right)^{n \\times t}',
      explanation: 'Where PV is the present value, r is the annual growth rate, n is the number of compounding periods per year, and t is the time in years.'
    },
    {
      title: 'Future Value of an Ordinary Annuity',
      latex: 'FV = PMT \\times \\frac{(1 + r)^t - 1}{r}',
      explanation: 'Where PMT is the periodic contribution, r is the periodic rate, and t is the total number of payments made.'
    }
  ],
  '/finance/calculators/insurance-calculator': [
    {
      title: 'Coverage-to-Premium Ratio',
      latex: '\\text{CPR} = \\frac{\\text{Coverage Amount}}{\\text{Annual Premium}}',
      explanation: 'The total coverage amount divided by the annual premium. A higher ratio indicates better value — more protection per dollar spent.'
    },
    {
      title: 'Deductible Percentage of Coverage',
      latex: '\\text{Deductible\\%} = \\frac{\\text{Deductible}}{\\text{Coverage Amount}} \\times 100\\%',
      explanation: 'The deductible expressed as a percentage of the total coverage amount. Lower percentages indicate less out-of-pocket cost before coverage kicks in.'
    }
  ],
  '/finance/calculators/etsy-fee-calculator': [
    {
      title: 'Etsy Net Profit Formula',
      latex: '\\text{Profit} = (P + S) \\times (1 - r_t - r_a) - F_l - F_p - C_i - C_s',
      explanation: 'Where P is the sale price, S is shipping charged, r_t is the 6.5% transaction fee rate, r_a is the offsite ads rate (0/12/15%), F_l is the $0.20 listing fee, F_p is the 3% + $0.25 payment processing fee, C_i is the item cost, and C_s is the shipping cost.'
    },
    {
      title: 'Etsy Profit Margin',
      latex: '\\text{Margin} = \\frac{\\text{Profit}}{P + S} \\times 100\\%',
      explanation: 'The profit expressed as a percentage of total revenue (sale price plus shipping charged). A higher margin means more of each dollar stays with you after fees and costs.'
    }
  ],
  '/science/calculators/dbm-watts-calculator': [
    {
      title: 'dBm to Watts Conversion',
      latex: 'P_{\\text{W}} = 10^{\\frac{P_{\\text{dBm}} - 30}{10}}',
      explanation: 'Converts decibels relative to 1 milliwatt to linear power in Watts.'
    },
    {
      title: 'Watts to dBm Conversion',
      latex: 'P_{\\text{dBm}} = 10 \\log_{10}(P_{\\text{W}}) + 30',
      explanation: 'Converts linear power in Watts to decibels relative to 1 milliwatt.'
    },
    {
      title: 'RMS Voltage from Power and Impedance',
      latex: 'V_{\\text{RMS}} = \\sqrt{P_{\\text{W}} \\times Z}',
      explanation: 'Calculates the Root Mean Square voltage given power and characteristic impedance Z (usually 50 or 75 ohms).'
    }
  ],
  '/science/calculators/dbm-milliwatts-calculator': [
    {
      title: 'dBm to Milliwatts Conversion',
      latex: 'P_{\\text{mW}} = 10^{\\frac{P_{\\text{dBm}}}{10}}',
      explanation: 'Converts logarithmic decibel-milliwatts (dBm) to linear power in milliwatts (mW).'
    },
    {
      title: 'Milliwatts to dBm Conversion',
      latex: 'P_{\\text{dBm}} = 10 \\log_{10}(P_{\\text{mW}})',
      explanation: 'Converts linear power in milliwatts (mW) to logarithmic decibel-milliwatts (dBm).'
    }
  ],
  '/science/calculators/average-atomic-mass-calculator': [
    {
      title: 'Average Atomic Mass',
      latex: 'M_{\\text{avg}} = \\sum_{i=1}^{n} (m_i \\times A_i)',
      explanation: 'Where m_i is the mass of isotope i, and A_i is the fractional abundance (abundance percentage divided by 100) of isotope i.'
    },
    {
      title: 'Isotope Abundances (2-Isotope System)',
      latex: 'A_1 = \\frac{M_{\\text{avg}} - m_2}{m_1 - m_2}, \\quad A_2 = 1.0 - A_1',
      explanation: 'Solves for the abundances A_1 and A_2 given the target average atomic mass and individual isotope masses m_1 and m_2.'
    }
  ],
  '/science/calculators/dilution-calculator': [
    {
      title: 'Dilution Equation (C\u2081V\u2081 = C\u2082V\u2082)',
      latex: 'C_1 V_1 = C_2 V_2',
      explanation: 'The fundamental relationship in solution chemistry: the amount of solute (concentration times volume) remains constant before and after dilution.'
    },
    {
      title: 'Solve for Stock Concentration',
      latex: 'C_1 = \\frac{C_2 \\times V_2}{V_1}',
      explanation: 'Divide the final amount of solute (C\u2082 \u00D7 V\u2082) by the stock volume to find the required stock concentration.'
    },
    {
      title: 'Solve for Stock Volume',
      latex: 'V_1 = \\frac{C_2 \\times V_2}{C_1}',
      explanation: 'Divide the final amount of solute (C\u2082 \u00D7 V\u2082) by the stock concentration to find the required stock volume.'
    },
    {
      title: 'Dilution Factor',
      latex: '\\text{DF} = \\frac{V_2}{V_1} = \\frac{C_1}{C_2}',
      explanation: 'The dilution factor can be calculated as the ratio of final volume to stock volume, or the ratio of stock concentration to final concentration.'
    }
  ],
  '/science/calculators/wave-speed-calculator': [
    {
      title: 'Fundamental Wave Equation',
      latex: 'v = f \\times \\lambda',
      explanation: 'Calculates wave speed as frequency multiplied by wavelength.'
    },
    {
      title: 'Wave Period Formula',
      latex: 'T = \\frac{1}{f}',
      explanation: 'Calculates the duration of a single cycle as the reciprocal of frequency.'
    },
    {
      title: 'Angular Frequency Formula',
      latex: '\\omega = 2\\pi f',
      explanation: 'Calculates angular rotation velocity in radians per second.'
    },
    {
      title: 'Wave Number Formula',
      latex: 'k = \\frac{2\\pi}{\\lambda}',
      explanation: 'Calculates spatial frequency of the wave in radians per meter.'
    }
  ],
  '/science/calculators/gravity-calculator': [
    {
      title: 'Newtonian Gravitational Force',
      latex: 'F = G \\frac{m_1 m_2}{r^2}',
      explanation: 'Where F is the force between the masses, G is the gravitational constant (6.674 \\times 10^{-11} \\text{ N m}^2/\\text{kg}^2), m_1 and m_2 are the masses of the objects, and r is the distance between their centers.'
    }
  ],
  '/science/calculators/capacitance-calculator': [
    {
      title: 'Capacitance from Energy and Voltage',
      latex: 'C = \\frac{2E}{V^2}',
      explanation: 'Calculates capacitance in Farads from stored energy (J) and voltage (V).'
    },
    {
      title: 'Energy Stored in a Capacitor',
      latex: 'E = \\frac{1}{2} C V^2',
      explanation: 'Energy stored in a capacitor is proportional to capacitance and the square of voltage.'
    },
    {
      title: 'Voltage from Energy and Capacitance',
      latex: 'V = \\sqrt{\\frac{2E}{C}}',
      explanation: 'Derives the voltage across a capacitor from its stored energy and capacitance.'
    },
    {
      title: 'Charge on a Capacitor',
      latex: 'Q = C V',
      explanation: 'The charge stored is the product of capacitance and voltage.'
    },
    {
      title: 'RC Time Constant',
      latex: '\\tau = R \\times C',
      explanation: 'The time constant determines how quickly a capacitor charges or discharges through a resistor.'
    },
    {
      title: 'RC Cutoff Frequency',
      latex: 'f_c = \\frac{1}{2\\pi RC}',
      explanation: 'The -3 dB cutoff frequency of a first-order RC low-pass or high-pass filter.'
    }
  ],
  '/science/calculators/electric-flux-calculator': [
    {
      title: 'Electric Flux — Surface Integral',
      latex: '\\Phi_E = \\vec{E} \\cdot \\vec{A} = E \\, A \\, \\cos(\\theta)',
      explanation: 'Electric flux through a surface is the dot product of the electric field and the area vector, where θ is the angle between them.'
    },
    {
      title: "Gauss's Law",
      latex: '\\Phi_E = \\frac{Q}{\\varepsilon_0}',
      explanation: 'The net electric flux through a closed surface equals the enclosed charge divided by the permittivity of free space.'
    },
    {
      title: 'General Integral Form',
      latex: '\\Phi_E = \\oint \\vec{E} \\cdot d\\vec{A}',
      explanation: 'The general definition of electric flux as a surface integral of the electric field over a closed or open surface.'
    },
    {
      title: 'Vacuum Permittivity',
      latex: '\\varepsilon_0 = 8.85418782 \\times 10^{-12} \\text{ F/m}',
      explanation: 'The fundamental constant relating electric field to charge in a vacuum, used in Gauss\'s Law and Coulomb\'s Law.'
    }
  ],
  '/science/calculators/work-power-calculator': [
    {
      title: 'Mechanical Work Formula',
      latex: 'W = F \\times d \\times \\cos(\\theta)',
      explanation: 'Where W is work, F is the force applied, d is the displacement, and \\theta is the angle between force and displacement vectors.'
    },
    {
      title: 'Power Formula',
      latex: 'P = \\frac{W}{t}',
      explanation: 'Where P is power, W is work completed, and t is the time taken.'
    }
  ],

  '/health/calculators/bmi-calculator': [
    {
      title: 'Body Mass Index (Metric)',
      latex: '\\text{BMI} = \\frac{\\text{Weight (kg)}}{\\text{Height (m)}^2}',
      explanation: 'The standard calculation of body fatness based on height and weight.'
    }
  ],
  '/health/calculators/calorie-calculator': [
    {
      title: 'Mifflin-St Jeor BMR Equation (Male)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} + 5',
      explanation: 'Estimates the Basal Metabolic Rate (calories burned at rest) for biological males.'
    },
    {
      title: 'Mifflin-St Jeor BMR Equation (Female)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} - 161',
      explanation: 'Estimates the Basal Metabolic Rate (calories burned at rest) for biological females.'
    }
  ],
  '/health/calculators/weight-loss-calculator': [
    {
      title: 'Mifflin-St Jeor BMR Equation (Male)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} + 5',
      explanation: 'Estimates the Basal Metabolic Rate (calories burned at rest) for biological males.'
    },
    {
      title: 'Mifflin-St Jeor BMR Equation (Female)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} - 161',
      explanation: 'Estimates the Basal Metabolic Rate (calories burned at rest) for biological females.'
    },
    {
      title: 'Daily Calorie Deficit for Weight Loss',
      latex: '\\text{Daily Target} = \\text{TDEE} - \\left( \\frac{\\text{Weekly Loss Rate (kg)} \\times 1100}{7} \\right)',
      explanation: 'Your daily calorie target equals TDEE minus the daily deficit needed to achieve your weekly weight loss rate. One kg of body fat equals approximately 7700 calories, so losing 0.5 kg/week requires a 550 kcal daily deficit.'
    }
  ],
  '/health/calculators/weight-gain-calculator': [
    {
      title: 'Mifflin-St Jeor BMR Equation (Male)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} + 5',
      explanation: 'Estimates the Basal Metabolic Rate (calories burned at rest) for biological males.'
    },
    {
      title: 'Mifflin-St Jeor BMR Equation (Female)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} - 161',
      explanation: 'Estimates the Basal Metabolic Rate (calories burned at rest) for biological females.'
    },
    {
      title: 'Daily Calorie Surplus for Weight Gain',
      latex: '\\text{Daily Target} = \\text{TDEE} + \\left( \\frac{\\text{Weekly Gain Rate (kg)} \\times 1100}{7} \\right)',
      explanation: 'Your daily calorie target equals TDEE plus the daily surplus needed to achieve your weekly weight gain rate. One kg of body mass requires approximately 7700 calories above maintenance, so gaining 0.5 kg/week requires a 550 kcal daily surplus.'
    }
  ],
  '/health/calculators/body-fat-calculator': [
    {
      title: 'US Navy Method — Male Body Fat',
      latex: '\\text{BF\\%} = 86.010 \\times \\log_{10}(\\text{Waist} - \\text{Neck}) - 70.041 \\times \\log_{10}(\\text{Height}) + 36.76',
      explanation: 'Calculates body fat percentage for males using neck and waist circumference measurements. All measurements must be in inches.'
    },
    {
      title: 'US Navy Method — Female Body Fat',
      latex: '\\text{BF\\%} = 163.205 \\times \\log_{10}(\\text{Waist} + \\text{Hip} - \\text{Neck}) - 97.684 \\times \\log_{10}(\\text{Height}) - 78.387',
      explanation: 'Calculates body fat percentage for females using neck, waist, and hip circumference measurements. All measurements must be in inches.'
    },
    {
      title: 'BMI-Based Body Fat Estimation',
      latex: '\\text{BF\\%} = 1.20 \\times \\text{BMI} + 0.23 \\times \\text{Age} - 10.8 \\times \\text{Gender} - 5.4',
      explanation: 'Where Gender = 1 for male, 0 for female. Provides a quick body fat estimate using BMI, age, and gender without circumference measurements.'
    },
    {
      title: 'Fat Mass and Lean Body Mass',
      latex: '\\text{Fat Mass} = \\text{Weight} \\times \\frac{\\text{BF\\%}}{100}, \\quad \\text{Lean Mass} = \\text{Weight} - \\text{Fat Mass}',
      explanation: 'Once body fat percentage is estimated, total fat mass and lean body mass are derived by applying the percentage to total body weight.'
    }
  ],
  '/health/calculators/water-intake-calculator': [
    {
      title: 'Basic Water Intake Formula',
      latex: '\\text{Water Intake (L)} = \\text{Weight (kg)} \\times 0.033 \\times \\text{Activity Factor} \\times \\text{Climate Factor}',
      explanation: 'Multiply body weight in kilograms by the base requirement of 33 ml per kg, then adjust for physical activity level (1.0× sedentary to 1.4× extra active) and climate conditions (0.95× cold to 1.3× hot/humid).'
    },
    {
      title: 'Advanced Water Intake Formula',
      latex: '\\text{Water Intake (L)} = (\\text{Weight} \\times 0.033) + (\\text{Height} \\times 0.0005) - (\\text{Age} \\times 0.005) + 1.5',
      explanation: 'The advanced formula adds height, age, and a constant baseline to the weight-based calculation. Gender adjusts female intake by −5%. Additional adjustments add 0.2–1.0 L for caffeine and alcohol (diuretic effects), 0.3–1.0 L for pregnancy and breastfeeding, and condition-specific multipliers (heart ×0.9, diabetes ×1.1). Kidney issues require medical consultation.'
    }
  ],
  '/health/calculators/diabetes-risk-calculator': [
    {
      title: 'ADA Diabetes Risk Score',
      latex: '\\text{Total Score} = \\text{Age} + \\text{Gender} + \\text{BMI} + \\text{Family History} + \\text{Hypertension} + \\text{Activity} + \\text{Gestational Diabetes}',
      explanation: 'The American Diabetes Association Risk Test assigns points across seven risk factors. Scores range from 0 to 13+. A score of 0–3 indicates low risk (5% probability), 4–6 moderate risk (14%), 7–9 high risk (33%), and 10+ very high risk (50%).'
    },
    {
      title: 'Individual Factor Scoring',
      latex: '\\begin{aligned} &\\text{Age: } <40=0,\\; 40-49=1,\\; 50-59=2,\\; 60+=3 \\\\ &\\text{Gender: } \\text{Female}=0,\\; \\text{Male}=1 \\\\ &\\text{BMI: } <25=0,\\; 25-29.9=1,\\; 30+=2 \\\\ &\\text{Family: } \\text{None}=0,\\; \\text{One}=1,\\; \\text{Both}=2 \\\\ &\\text{Hypertension: } \\text{No}=0,\\; \\text{Yes}=1 \\\\ &\\text{Activity: } \\text{Active}=0,\\; \\text{Not active}=1 \\\\ &\\text{Gestational diabetes: } \\text{No}=0,\\; \\text{Yes}=1 \\end{aligned}',
      explanation: 'Each factor contributes independently to the total risk score. The maximum possible score is 3+1+2+2+1+1+1 = 11 points plus an extra point for gestational diabetes, totaling 12 potential points.'
    }
  ],
  '/health/calculators/ideal-body-weight-calculator': [
    {
      title: 'Devine Formula (1974)',
      latex: '\\text{Male: } 50 + 0.9 \\times (\\text{Height (cm)} - 152.4) \\quad \\text{Female: } 45.5 + 0.9 \\times (\\text{Height (cm)} - 152.4)',
      explanation: 'The most widely referenced ideal body weight formula in clinical settings. Originally developed as a reference for gentamicin dosing, it has since become the default for many medical contexts.'
    },
    {
      title: 'Robinson Formula (1983)',
      latex: '\\text{Male: } 52 + 1.9 \\times (\\text{Height (in)} - 60) \\quad \\text{Female: } 49 + 1.7 \\times (\\text{Height (in)} - 60)',
      explanation: 'A modification of the Devine formula that uses height in inches. It generally produces lower ideal weight estimates than Devine, particularly for taller individuals.'
    },
    {
      title: 'Miller Formula (1983)',
      latex: '\\text{Male: } 56.2 + 1.41 \\times (\\text{Height (in)} - 60) \\quad \\text{Female: } 53.1 + 1.36 \\times (\\text{Height (in)} - 60)',
      explanation: 'Based on actuarial data from the Metropolitan Life Insurance Company height-weight tables. It produces values between Devine and Robinson for most heights.'
    },
    {
      title: 'Hamwi Formula (1964)',
      latex: '\\text{Male: } 48 + 1.1 \\times (\\text{Height (in)} - 60) \\quad \\text{Female: } 45.5 + 1.0 \\times (\\text{Height (in)} - 60)',
      explanation: 'A simple rule-based formula: 100 lbs for the first 5 feet plus 5 lbs per inch for males, or 100 lbs for the first 5 feet plus 5 lbs per inch minus 2.5 kg for females.'
    },
    {
      title: 'Broca Formula (1871)',
      latex: '\\text{IBW} = \\text{Height (cm)} - 100 \\quad (\\pm 10\\%)',
      explanation: 'The original ideal weight formula, proposed by French surgeon Paul Broca. It is the simplest formula but tends to overestimate ideal weight for taller individuals.'
    },
    {
      title: 'BMI-Based Ideal Weight',
      latex: '\\text{IBW} = 21.75 \\times \\text{Height (m)}^2',
      explanation: 'Uses the midpoint of the normal BMI range (18.5–24.9) to calculate an ideal weight. BMI = 21.75 represents the center of the healthy range and has been validated across large populations.'
    }
  ],
  '/health/calculators/calorie-burn-calculator': [
    {
      title: 'Calorie Burn Formula',
      latex: '\\text{Calories Burned} = \\text{MET} \\times \\text{Weight (kg)} \\times \\text{Duration (hr)}',
      explanation: 'The core formula: multiply the Metabolic Equivalent of Task (MET) for the activity by body weight in kilograms and duration in hours.'
    },
    {
      title: 'Mifflin-St Jeor BMR Equation (Male)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} + 5',
      explanation: 'Estimates Basal Metabolic Rate for biological males, used for personalized MET adjustment.'
    },
    {
      title: 'Personalized MET Adjustment',
      latex: '\\text{Adjusted MET} = \\text{Base MET} \\times f_{\\text{fitness}} \\times f_{\\text{age}} \\times \\frac{\\text{BMR}}{\\text{BMR}_{\\text{avg}}} \\times f_{\\text{intensity}} \\times f_{\\text{temp}}',
      explanation: 'The base MET is adjusted for fitness level, age-related metabolic decline, individual BMR ratio, exercise intensity, and ambient temperature.'
    }
  ],
  '/health/calculators/dri-calculator': [
    {
      title: 'Mifflin-St Jeor BMR Equation (Male)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} + 5',
      explanation: 'Estimates Basal Metabolic Rate (calories burned at rest) for biological males. The foundation for calculating Total Daily Energy Expenditure (TDEE).'
    },
    {
      title: 'Mifflin-St Jeor BMR Equation (Female)',
      latex: '\\text{BMR} = 10 \\times \\text{Weight (kg)} + 6.25 \\times \\text{Height (cm)} - 5 \\times \\text{Age (y)} - 161',
      explanation: 'Estimates Basal Metabolic Rate (calories burned at rest) for biological females. The foundation for calculating Total Daily Energy Expenditure (TDEE).'
    },
    {
      title: 'Total Daily Energy Expenditure (TDEE)',
      latex: '\\text{TDEE} = \\text{BMR} \\times \\text{Activity Multiplier}',
      explanation: 'BMR is multiplied by an activity factor (1.2 for sedentary, 1.375 for light, 1.55 for moderate, 1.725 for active, 1.9 for extra active). Additional calories are added for pregnancy (+340 kcal in 2nd trimester, +450 kcal in 3rd) and lactation (+500 kcal exclusive, +300 kcal partial).'
    },
    {
      title: 'Macronutrient Distribution by Diet Type',
      latex: '\\begin{aligned} &\\text{Omnivore: } 15\\%\\; \\text{P}, 55\\%\\; \\text{C}, 30\\%\\; \\text{F} \\\\ &\\text{Vegetarian/Vegan: } 15\\%\\; \\text{P}, 60\\%\\; \\text{C}, 25\\%\\; \\text{F} \\\\ &\\text{Keto: } 20\\%\\; \\text{P}, 5\\%\\; \\text{C}, 75\\%\\; \\text{F} \\\\ &\\text{Mediterranean: } 15\\%\\; \\text{P}, 50\\%\\; \\text{C}, 35\\%\\; \\text{F} \\\\ &\\text{Paleo: } 25\\%\\; \\text{P}, 35\\%\\; \\text{C}, 40\\%\\; \\text{F} \\end{aligned}',
      explanation: 'Macronutrient percentages vary by diet type. Protein and carbs provide 4 kcal/g, fat provides 9 kcal/g. Fiber needs are age and gender specific (38g/30g for males under/over 51, 25g/21g for females under/over 51). Pregnancy and lactation require a minimum of 18% protein.'
    },
    {
      title: 'Daily Water Needs Formula',
      latex: '\\text{Water (mL)} = \\text{Weight (kg)} \\times 35 \\times \\text{Activity Factor}',
      explanation: 'Base water needs are 35 mL per kg of body weight. Activity adjustment ranges from 1.0× (sedentary) to 1.4× (extra active). Pregnancy adds 300 mL, exclusive lactation adds 700 mL, partial lactation adds 400 mL.'
    }
  ],
  '/health/calculators/bri-calculator': [
    {
      title: 'Body Roundness Index (BRI) Formula',
      latex: '\\text{BRI} = 364.2 - 365.5 \\times \\sqrt{1 - \\left(\\frac{\\text{Waist (m)}}{2 \\pi \\times \\text{Height (m)}}\\right)^2}',
      explanation: 'The BRI formula uses waist circumference and height to calculate body roundness based on the geometric concept of eccentricity. Values typically range from 0 to 15. Lower values indicate less health risk.'
    },
    {
      title: 'Body Mass Index (BMI)',
      latex: '\\text{BMI} = \\frac{\\text{Weight (kg)}}{\\text{Height (m)}^2}',
      explanation: 'Standard body mass index calculation used alongside BRI for a more complete body composition assessment.'
    },
    {
      title: 'Waist-to-Height Ratio (WHtR)',
      latex: '\\text{WHtR} = \\frac{\\text{Waist (cm)}}{\\text{Height (cm)}}',
      explanation: 'Simple ratio of waist circumference to height. A WHtR above 0.5 indicates increased health risk; above 0.6 indicates high risk.'
    },
    {
      title: 'Waist-to-Hip Ratio (WHR) and Body Shape',
      latex: '\\text{WHR} = \\frac{\\text{Waist (cm)}}{\\text{Hip (cm)}}, \\quad \\text{Shape} = \\begin{cases} \\text{Pear} & \\text{WHR < threshold} \\\\ \\text{Avocado} & \\text{threshold} \\leq \\text{WHR < upper} \\\\ \\text{Apple} & \\text{WHR \\geq upper} \\end{cases}',
      explanation: 'WHR determines body shape: Pear for lower body fat (lower cardiovascular risk), Avocado for balanced fat distribution, Apple for upper body fat (higher cardiovascular risk). Thresholds are gender-specific (male: 0.85/0.95, female: 0.75/0.85).'
    }
  ],
  '/math/calculators/comparing-decimals-calculator': [
    {
      title: 'Decimal Place Value Alignment',
      latex: '\\begin{array}{rcccl} A & = & 0. & 75 & 0 \\\\ B & = & 0. & 7 & 58 \\end{array}',
      explanation: 'Align decimal points vertically and pad shorter numbers with trailing zeros to compare matching place value digits starting from the tenths column.'
    },
    {
      title: 'Difference Formula',
      latex: '\\text{Diff} = |A - B|, \\quad \\text{PctDiff} = \\frac{|A - B|}{\\max(|A|, |B|)} \\times 100\\%',
      explanation: 'Measure how much two decimal numbers differ in absolute terms and as a percentage relative to their maximum value.'
    }
  ],
  '/math/calculators/fraction-to-percent-calculator': [
    {
      title: 'Fraction to Decimal Division',
      latex: '\\text{Decimal} = \\frac{\\text{Numerator}}{\\text{Denominator}} = \\text{Numerator} \\div \\text{Denominator}',
      explanation: 'Divide the numerator by the denominator to find the decimal quotient.'
    },
    {
      title: 'Decimal to Percent Conversion',
      latex: '\\text{Percentage} = \\text{Decimal} \\times 100\\%',
      explanation: 'Multiply the decimal quotient by 100 to convert it into percentage form.'
    },
    {
      title: 'Mixed Number Conversion Rule',
      latex: 'W\\frac{a}{b} = \\frac{W \\times b + a}{b} \\implies \\text{Percent} = \\left(W + \\frac{a}{b}\\right) \\times 100\\%',
      explanation: 'Find the percentage of mixed numbers by adding the whole number to the decimal representation of the proper fraction, then multiplying by 100.'
    }
  ],
  '/math/calculators/improper-fraction-to-mixed-calculator': [
    {
      title: 'Improper Fraction to Mixed Number Formula',
      latex: '\\frac{a}{b} = q\\frac{r}{b} \\quad \\text{where } a = b \\times q + r',
      explanation: 'Where q is the whole-number quotient and r is the integer remainder when numerator a is divided by denominator b.'
    },
    {
      title: 'Division and Remainder Representation',
      latex: 'q = \\lfloor a \\div b \\rfloor, \\quad r = a \\pmod b',
      explanation: 'Solve for quotient q using integer division, and use the modulo operation to determine the remainder r.'
    }
  ],
  '/math/calculators/percent-to-fraction-calculator': [
    {
      title: 'Percentage to Decimal conversion',
      latex: 'd = \\frac{p}{100}',
      explanation: 'Divide the percentage value p by 100 to convert it into a decimal value.'
    },
    {
      title: 'Decimal to Fraction Conversion',
      latex: '\\text{Fraction} = \\frac{d \\times 10^k}{10^k}',
      explanation: 'Multiply and divide by 10 raised to the power of the number of decimal places k, then find the greatest common divisor (GCD) to simplify the numerator and denominator.'
    }
  ],
  '/math/calculators/sse-calculator': [
    {
      title: 'Sum of Squared Errors (SSE)',
      latex: '\\text{SSE} = \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2',
      explanation: 'Calculate the difference (error or residual) between each actual value y_i and its predicted value \\hat{y}_i, square each error, and sum them together.'
    },
    {
      title: 'Mean Squared Error (MSE)',
      latex: '\\text{MSE} = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2 = \\frac{\\text{SSE}}{n}',
      explanation: 'Compute the average of the squared errors by dividing the Sum of Squared Errors (SSE) by the total number of observations n.'
    }
  ],
  '/math/calculators/derivative-calculator': [
    {
      title: 'Power Rule of Differentiation',
      latex: '\\frac{d}{dx}[x^n] = n x^{n-1}',
      explanation: 'To differentiate a variable raised to a power, multiply the variable by the exponent and decrease the exponent by one.'
    },
    {
      title: 'Product Rule of Differentiation',
      latex: '\\frac{d}{dx}[f(x) \\cdot g(x)] = f\'(x)g(x) + f(x)g\'(x)',
      explanation: 'The derivative of a product of two functions is the derivative of the first times the second, plus the first times the derivative of the second.'
    }
  ],
  '/math/calculators/integral-calculator': [
    {
      title: 'Power Rule of Integration',
      latex: '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)',
      explanation: 'To integrate a variable raised to a power, increase the exponent by one and divide the term by the new exponent, adding a constant of integration C.'
    },
    {
      title: 'Definite Integral Substitution (FTC)',
      latex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)',
      explanation: 'Evaluate a definite integral by subtracting the antiderivative evaluated at the lower limit from the antiderivative evaluated at the upper limit.'
    }
  ],
  '/math/calculators/sig-fig-calculator': [
    {
      title: 'Significant Figure Rules',
      latex: '\\text{Non-zero} > 0,\\; \\text{Captive } 0 > 0,\\; \\text{Leading } 0 = 0,\\; \\text{Trailing decimal } 0 > 0,\\; \\text{Trailing whole } 0 = 0',
      explanation: 'Non-zero digits (1-9) are always significant. Captive zeros between non-zero digits are significant. Leading zeros before the first non-zero digit are never significant. Trailing zeros after a decimal point are significant. Trailing zeros in a whole number without a decimal are ambiguous and treated as not significant by default.'
    },
    {
      title: 'Rounding to N Significant Figures',
      latex: 'x \\to \\text{round}_N(x): \\text{keep } N \\text{ sig figs, check digit } N+1, \\; \\geq 5 \\to \\text{round up}',
      explanation: 'Identify the first N significant digits from the left. If the (N+1)th significant digit is 5 or greater, round the Nth digit up. If it is 4 or less, keep the Nth digit the same. Preserve place value by padding with zeros as needed.'
    },
    {
      title: 'Identifying the First Significant Digit',
      latex: '\\text{First non-zero digit from left} = \\text{most significant digit}',
      explanation: 'Scan the number from left to right. The first non-zero digit (ignoring leading zeros and the decimal point) is the most significant digit. All significant figures are counted starting from this digit.'
    }
  ],
  '/knowledge/calculators/gpa-calculator': [
    {
      title: 'Weighted GPA Formula',
      latex: '\\text{GPA} = \\frac{\\sum (\\text{Grade Points}_i \\times \\text{Credits}_i)}{\\sum \\text{Credits}_i}',
      explanation: 'Multiply each course\'s grade points (based on the chosen scale) by its credit hours to find the quality points. Sum all quality points, and divide by the total number of credit hours.'
    },
    {
      title: 'Target GPA Gap Projection',
      latex: '\\text{GPA}_{\\text{required}} = \\frac{(\\text{GPA}_{\\text{target}} \\times C_{\\text{combined}}) - (\\text{GPA}_{\\text{current}} \\times C_{\\text{prior}})}{C_{\\text{term}}}',
      explanation: 'Calculates the average term GPA required in remaining credit hours to pull the current cumulative GPA up to the target level.'
    }
  ],
  '/knowledge/calculators/career-assessment-calculator': [
    {
      title: 'RIASEC Dimension Point Summation',
      latex: 'S_{\\text{dimension}} = \\sum_{i=1}^{3} R_{i}',
      explanation: 'Calculates the raw score for each RIASEC dimension (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) by adding the individual 1–5 ratings of the three corresponding statements.'
    },
    {
      title: 'Percentage Interest Distribution',
      latex: 'P_{\\text{dimension}} = \\frac{S_{\\text{dimension}}}{15} \\times 100\\%',
      explanation: 'Normalizes the raw score into a percentage from 0% to 100% relative to the maximum possible score of 15 (3 questions multiplied by the maximum rating of 5).'
    },
    {
      title: 'Three-Letter Holland Code Selection',
      latex: 'C_{\\text{holland}} = \\text{Top}_1 \\oplus \\text{Top}_2 \\oplus \\text{Top}_3',
      explanation: 'Identifies the three interest dimensions with the highest scores and combines their single-character abbreviations (R, I, A, S, E, or C) in descending order to form the final occupational profile code.'
    }
  ],
  '/knowledge/calculators/trauma-assessment-calculator': [
    {
      title: 'Anxiety Subscore',
      latex: 'S_{\\text{anxiety}} = \\sum_{i \\in \\text{Anxiety}} R_i',
      explanation: 'Sums the 0–4 ratings of the 4 Hyperarousal & Anxiety questions (items 1, 2, 3, 4) measuring alertness, startle responses, sleep issues, and panic (maximum subscore of 16).'
    },
    {
      title: 'Intrusive Subscore',
      latex: 'S_{\\text{intrusive}} = \\sum_{i \\in \\text{Intrusive}} R_i',
      explanation: 'Sums the 0–4 ratings of the 4 Intrusive Thoughts & Memories questions (items 5, 6, 7, 8) measuring unwanted memories, flashbacks, nightmares, and trigger reactions (maximum subscore of 16).'
    },
    {
      title: 'Avoidance Subscore',
      latex: 'S_{\\text{avoidance}} = \\sum_{i \\in \\text{Avoidance}} R_i',
      explanation: 'Sums the 0–4 ratings of the 4 Avoidance Behaviors questions (items 9, 10, 11, 12) measuring efforts to avoid reminders and emotional disconnection (maximum subscore of 16).'
    },
    {
      title: 'Negative Mood & Cognition Subscore',
      latex: 'S_{\\text{negative}} = \\sum_{i \\in \\text{Negative}} R_i',
      explanation: 'Sums the 0–4 ratings of the 4 Negative Mood & Cognition questions (items 13, 14, 15, 16) measuring negative beliefs, self-blame, and persistent negative emotions (maximum subscore of 16).'
    },
    {
      title: 'Functional Impairment Subscore',
      latex: 'S_{\\text{functional}} = \\sum_{i \\in \\text{Functional}} R_i',
      explanation: 'Sums the 0–4 ratings of the 4 Functional Impairment questions (items 17, 18, 19, 20) measuring impact on work/study, relationships, and concentration (maximum subscore of 16).'
    },
    {
      title: 'Total Trauma Score',
      latex: 'S_{\\text{total}} = S_{\\text{anxiety}} + S_{\\text{intrusive}} + S_{\\text{avoidance}} + S_{\\text{negative}} + S_{\\text{functional}}',
      explanation: 'Aggregates all five category scores to compute the final trauma score (0 to 80). Scores are classified as Minimal (0–20), Mild (21–40), Moderate (41–60), or Significant (61–80).'
    }
  ],
  '/knowledge/calculators/anxiety-assessment-calculator': [
    {
      title: 'Psychological Symptoms Subscore',
      latex: 'S_{\\text{psychological}} = \\sum_{i \\in \\text{Psychological}} R_i',
      explanation: 'Sums the 0–3 ratings of the 5 Psychological questions (items 1, 2, 3, 4, 5) measuring emotional aspects like worry, fear, and nervousness (maximum subscore of 15).'
    },
    {
      title: 'Physical Symptoms Subscore',
      latex: 'S_{\\text{physical}} = \\sum_{i \\in \\text{Physical}} R_i',
      explanation: 'Sums the 0–3 ratings of the 5 Physical questions (items 6, 7, 8, 9, 10) measuring physical tension, racing heart, and breathlessness (maximum subscore of 15).'
    },
    {
      title: 'Behavioral Changes Subscore',
      latex: 'S_{\\text{behavioral}} = \\sum_{i \\in \\text{Behavioral}} R_i',
      explanation: 'Sums the 0–3 ratings of the 5 Behavioral changes questions (items 11, 12, 13, 14, 15) measuring avoidance, restlessness, and coping changes (maximum subscore of 15).'
    },
    {
      title: 'Social Impact Subscore',
      latex: 'S_{\\text{social}} = \\sum_{i \\in \\text{Social}} R_i',
      explanation: 'Sums the 0–3 ratings of the 3 Social Impact questions (items 16, 17, 18) measuring interference in work, studies, and relationships (maximum subscore of 9).'
    },
    {
      title: 'Cognitive Patterns Subscore',
      latex: 'S_{\\text{cognitive}} = \\sum_{i \\in \\text{Cognitive}} R_i',
      explanation: 'Sums the 0–3 ratings of the 3 Cognitive Patterns questions (items 19, 20, 21) measuring concentration trouble, overthinking, and intrusive thoughts (maximum subscore of 9).'
    },
    {
      title: 'Total Anxiety Score',
      latex: 'S_{\\text{total}} = S_{\\text{psychological}} + S_{\\text{physical}} + S_{\\text{behavioral}} + S_{\\text{social}} + S_{\\text{cognitive}}',
      explanation: 'Aggregates all five category scores to compute the final anxiety score (0 to 63). Scores are classified as Minimal (0–15), Mild (16–31), Moderate (32–47), or Severe (48–63).'
    }
  ],
  '/knowledge/calculators/language-level-calculator': [
    {
      title: 'Overall Proficiency Score',
      latex: 'S = \\frac{1}{6} \\sum_{i=1}^{6} s_i',
      explanation: 'Average the self-assessed scores (1–10) across all six language skills: reading, writing, listening, speaking, grammar, and vocabulary. The result is an overall proficiency score out of 10.'
    },
    {
      title: 'CEFR Level Mapping',
      latex: 'L = \\begin{cases} \\text{A1} & 0 \\leq S < 2 \\\\ \\text{A2} & 2 \\leq S < 3.5 \\\\ \\text{B1} & 3.5 \\leq S < 5 \\\\ \\text{B2} & 5 \\leq S < 6.5 \\\\ \\text{C1} & 6.5 \\leq S < 8.5 \\\\ \\text{C2} & 8.5 \\leq S \\leq 10 \\end{cases}',
      explanation: 'Map the average score to the Common European Framework of Reference (CEFR) levels. Each level represents a broader range of proficiency as you advance from A1 (Beginner) to C2 (Proficient).'
    },
    {
      title: 'Proficiency Percentage',
      latex: 'P = S \\times 10',
      explanation: 'Convert the average score to a percentage by multiplying by 10. This gives an intuitive 0–100% scale for overall language proficiency.'
    }
  ],
  '/knowledge/calculators/zakat-calculator': [
    {
      title: 'Nisab Threshold',
      latex: '\\text{Nisab} = \\frac{N_{\\text{method}} \\times P_{\\text{metal}}}{\\text{Exchange Rate}}',
      explanation: 'Where N_method is the Nisab threshold for the selected metal (87.48g gold or 612.36g silver), and P_metal is the market price per gram in USD. The result is the Nisab threshold in the selected currency.'
    },
    {
      title: 'Total Zakatable Assets',
      latex: '\\text{Assets} = \\text{Cash} + \\text{Metals} + \\text{Investments} - \\text{Liabilities}',
      explanation: 'Sum all cash & bank assets, gold & silver values (converted from grams using market rates), and investment & business assets, then subtract total liabilities to get the net Zakatable wealth.'
    },
    {
      title: 'Zakat Due',
      latex: '\\text{Zakat} = \\begin{cases} \\text{Assets} \\times 0.025 & \\text{Assets} \\geq \\text{Nisab} \\\\ 0 & \\text{Assets} < \\text{Nisab} \\end{cases}',
      explanation: 'If total Zakatable assets meet or exceed the Nisab threshold, Zakat is calculated at 2.5% of total assets. Otherwise, no Zakat is due.'
    }
  ],
  '/knowledge/calculators/carbon-footprint-calculator': [
    {
      title: 'Total Carbon Footprint',
      latex: '\\text{Total} = \\text{Transport} + \\text{Energy} + \\text{Food} + \\text{Waste}',
      explanation: 'Sum the annual CO₂e emissions from all four categories — transportation, home energy, food and diet, and waste — to get your total personal carbon footprint in metric tons.'
    },
    {
      title: 'Transportation Emissions',
      latex: '\\text{Transport} = \\frac{\\text{car miles} \\times 52}{\\text{MPG}} \\times 0.404 + \\text{transit} \\times 52 \\times 0.14 + \\frac{\\text{short} \\times 223 + \\text{long} \\times 986}{1000}',
      explanation: 'Calculate annual transport emissions by combining weekly car mileage (adjusted for fuel efficiency), weekly public transit miles, and yearly short and long flights, each multiplied by standard emission factors and converted to metric tons.'
    },
    {
      title: 'Home Energy Emissions (per person)',
      latex: '\\text{Energy} = \\frac{(\\text{electricity} \\times 12 \\times 0.42 \\times (1 - \\text{renewable\\%}) + \\text{gas} \\times 12 \\times 5.3)}{1000 \\times \\text{household size}}',
      explanation: 'Convert monthly electricity and natural gas usage to annual figures, apply emission factors, adjust for renewable energy percentage, and divide by household size to get per-person home energy emissions.'
    }
  ],
  '/knowledge/calculators/average-time-calculator': [
    {
      title: 'Mean (Average) Time',
      latex: '\\mu = \\frac{\\sum_{i=1}^{n} x_i}{n}',
      explanation: 'Sum all time entries (converted to milliseconds) and divide by the total number of entries. The result is the arithmetic mean, expressed in HH:MM:SS format.'
    },
    {
      title: 'Median Time',
      latex: '\\text{Median} = \\begin{cases} x_{k+1} & n = 2k+1 \\\\ \\frac{x_k + x_{k+1}}{2} & n = 2k \\end{cases}',
      explanation: 'Sort all time values and find the middle value. For an odd number of entries it is the center value; for an even number it is the average of the two middle values.'
    },
    {
      title: 'Standard Deviation',
      latex: '\\sigma = \\sqrt{\\frac{\\sum_{i=1}^{n} (x_i - \\mu)^2}{n}}',
      explanation: 'Measure the spread of time values around the mean. A lower standard deviation indicates more consistent timing, while a higher value signals greater variability.'
    }
  ],
  '/knowledge/calculators/fuel-calculator': [
    {
      title: 'Fuel Required',
      latex: '\\text{Fuel} = \\frac{\\text{Total Distance}}{\\text{Fuel Efficiency}}',
      explanation: 'Divide the total distance traveled (adjusted for round trip) by the fuel efficiency of the vehicle. The result is the volume of fuel needed in gallons.'
    },
    {
      title: 'Total Fuel Cost',
      latex: '\\text{Cost} = \\text{Fuel Required} \\times \\text{Fuel Price}',
      explanation: 'Multiply the total fuel required by the price per gallon (or per liter equivalent). This gives the total cost of fuel for the trip.'
    },
    {
      title: 'Cost Per Person',
      latex: '\\text{Cost per Person} = \\frac{\\text{Total Cost}}{\\text{Passengers}}',
      explanation: 'Divide the total fuel cost by the number of passengers to determine the cost contributed by each traveler, useful for trip cost-sharing.'
    }
  ],
  '/knowledge/calculators/habit-formation-calculator': [
    {
      title: 'Habit Formation Time Estimate',
      latex: '\\text{Days} = 66 \\times f_{\\text{motivation}} \\times f_{\\text{complexity}} \\times f_{\\text{previous}} \\times f_{\\text{time}}',
      explanation: 'Start with the research baseline of 66 days (Lally et al., 2010). Multiply by adjustment factors for motivation level (0.8–1.3), habit complexity (0.8–1.4), previous attempts (0.9–1.0), and daily time commitment (0.9–1.2). The final result is the estimated days needed for the habit to become automatic.'
    },
    {
      title: 'Success Probability',
      latex: 'P = 70 + \\Delta_{\\text{motivation}} + \\Delta_{\\text{complexity}} + \\Delta_{\\text{previous}}',
      explanation: 'Start with a base probability of 70%. Adjust by +15 for high motivation, -15 for low, +10 for simple habits, -10 for complex habits, and +5 if the habit has been attempted before. The final probability is clamped between 0% and 100%.'
    }
  ],
  '/knowledge/calculators/wpm-calculator': [
    {
      title: 'Words Per Minute (WPM)',
      latex: '\\text{WPM} = \\frac{\\text{Words Typed}}{\\text{Time (minutes)}}',
      explanation: 'Divide the total number of words typed by the elapsed time in minutes. A word is counted as any space-separated group of characters.'
    },
    {
      title: 'Typing Accuracy',
      latex: '\\text{Accuracy} = \\frac{\\text{Correct Characters}}{\\text{Total Characters}} \\times 100\\%',
      explanation: 'Compare each typed character against the target text. Correct characters are those that match the expected character at the same position. Divide correct by total and multiply by 100 to get the percentage.'
    }
  ],
  '/knowledge/calculators/age-calculator': [
    {
      title: 'Chronological Age (Years, Months, Days)',
      latex: 'A = Y \\text{ years},\\, M \\text{ months},\\, D \\text{ days}',
      explanation: 'Age is determined by iteratively counting full years, then full months, then remaining days between the birth date and the calculation date.'
    },
    {
      title: 'Total Months Lived',
      latex: 'M_{\\text{total}} = (Y_{\\text{end}} - Y_{\\text{birth}}) \\times 12 + (M_{\\text{end}} - M_{\\text{birth}}) + \\delta',
      explanation: 'Where δ = 0 if the calculation day is on or after the birth day, and δ = -1 otherwise. This gives the total complete calendar months elapsed.'
    },
    {
      title: 'Next Birthday Calculation',
      latex: 'B_{\\text{next}} = \\text{birthday in current year} \\quad (\\text{or next year if already passed})',
      explanation: 'The calculator determines the next occurrence of the birth month and day, adding one year if the date has already passed in the current calendar year.'
    },
    {
      title: 'Age Category Classification',
      latex: 'C = f(A_{\\text{years}}) \\in \\{\\text{Infant, Toddler, \\dots, Senior}\\}',
      explanation: 'The age in years maps to a standard life-stage category: Infant (0-1), Toddler (1-3), Preschooler (3-5), Child (5-12), Teenager (12-18), Young Adult (18-30), Adult (30-50), Middle Age (50-65), Senior (65+).'
    }
  ],
  '/knowledge/calculators/zodiac-moon-phase': [
    {
      title: 'Zodiac Sign Determination',
      latex: '\\text{Sign} = f(\\text{Month}, \\text{Day})',
      explanation: 'Each Western zodiac sign occupies a specific date range based on tropical astrology. The calculator maps the birth month and day to one of 12 signs using traditional date boundaries that divide the year into 30-degree ecliptic segments.'
    },
    {
      title: 'Moon Phase Calculation',
      latex: '\\text{Lunar Age} = (JD - \\text{Ref}) \\bmod 29.53058867',
      explanation: 'The lunar age is the number of days since the last new moon, calculated from the Julian Day Number of the target date and a reference new moon (January 6, 2000). The age maps to eight primary phases — New Moon (0\u20131.845 days), Waxing Crescent (1.845\u20135.537), First Quarter (5.537\u20139.23), Waxing Gibbous (9.23\u201312.922), Full Moon (12.922\u201316.615), Waning Gibbous (16.615\u201320.307), Last Quarter (20.307\u201324.0), and Waning Crescent (24.0\u201329.53).'
    },
    {
      title: 'Moon Illumination',
      latex: 'I = \\frac{1 - \\cos(\\theta)}{2}, \\quad \\theta = \\frac{\\text{Lunar Age} \\times 2\\pi}{29.53}',
      explanation: 'The illuminated fraction of the moon visible from Earth ranges from 0% (new moon) to 100% (full moon) and follows a cosine function of the phase angle. The phase angle is the lunar age expressed as a fraction of the 29.53-day synodic cycle.'
    }
  ],
};

export default function ToolContentEnhancer({ toolContent }: ToolContentEnhancerProps) {
  const [activeSection, setActiveSection] = useState('about');
  const [rating, setRating] = useState<'helpful' | 'not-helpful' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const normalizedPath = toolContent.url.replace(/\/$/, '');
  const formulas = FORMULAS_BY_PATH[normalizedPath] || [];

  const renderParagraphWithLinks = (text: string) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const anchorText = match[1];
      const url = match[2];
      const isInternal = url.startsWith('/');
      
      if (isInternal) {
        parts.push(
          <Link 
            key={match.index} 
            href={url} 
            className="font-black text-[#1a1a1a] hover:underline transition-colors decoration-[#1a1a1a] decoration-2"
          >
            {anchorText}
          </Link>
        );
      } else {
        parts.push(
          <a 
            key={match.index} 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-black text-[#1a1a1a] hover:underline transition-colors decoration-[#1a1a1a] decoration-2"
          >
            {anchorText}
          </a>
        );
      }
      
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const sections = [
    { id: 'about', label: 'About the Tool' },
    ...(formulas.length > 0 ? [{ id: 'formulas', label: 'Formulas & Theory' }] : []),
    { id: 'functionality', label: 'What It Does' },
    { id: 'features', label: 'Features & Applications' },
    { id: 'how-to', label: 'How to Use' },
    { id: 'tips', label: 'Tips & Mistakes' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'categories', label: 'Explore Categories' },
    { id: 'feedback', label: 'Feedback' },
    ...(toolContent.relatedTools.length > 0 ? [{ id: 'related', label: 'Related Tools' }] : []),
  ];

  // Active section tracking on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toolContent.url, formulas.length, toolContent.relatedTools.length]);

  // Reset feedback state on URL change to permit submission across tool page loads
  useEffect(() => {
    setSubmitted(false);
    setRating(null);
    setFeedbackText('');
    setEmail('');
  }, [toolContent.url]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const autoName = email ? email.split('@')[0] : `User of ${toolContent.name}`;
    const autoEmail = email.trim() || 'no-email@tuitility.com';
    const ratingLabel = rating === 'helpful' ? 'Helpful (5/5)' : rating === 'not-helpful' ? 'Not Helpful (1/5)' : 'No rating';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : toolContent.url;

    // Dispatch SMTP request in the background
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: autoName,
        email: autoEmail,
        subject: `Tool Feedback: ${toolContent.name}`,
        message: feedbackText,
        formType: 'tool-feedback',
        toolName: toolContent.name,
        rating: ratingLabel,
        pageUrl: currentUrl,
      }),
    }).catch((err) => {
      console.error('Feedback SMTP submission error:', err);
    });

    setSubmitted(true);
  };

  const renderFeedbackForm = (isSidebar: boolean) => {
    if (submitted) {
      return (
        <div className={`bg-white border border-slate-150 ${isSidebar ? 'p-4' : 'p-8'} rounded-3xl text-center shadow-inner space-y-3 py-8 animate-fade-in-up flex flex-col items-center justify-center`}>
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm mx-auto shadow-sm">
            <i className="fas fa-check text-xs"></i>
          </div>
          <h4 className="text-sm font-bold text-slate-800 font-display">Thank you!</h4>
          <p className="text-xs text-slate-450 font-medium">Your suggestion has been logged to improve this tool.</p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setFeedbackText('');
              setRating(null);
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-full font-bold text-[10px] active:scale-95 transition-all cursor-pointer"
          >
            Submit Another Feedback
          </button>
        </div>
      );
    }

    return (
      <div className={`bg-slate-50/50 border border-slate-150 rounded-3xl ${isSidebar ? 'p-4 space-y-3' : 'p-8 md:p-10 space-y-6'}`}>
        <div className="pb-2.5 border-b border-slate-200/60 text-left">
          <h3 className={`font-extrabold text-slate-900 tracking-tight flex items-center font-display ${isSidebar ? 'text-[10px] uppercase tracking-wider' : 'text-xl'}`}>
            <i className="fas fa-comment-alt text-slate-900 mr-2 text-xs"></i>
            Feedback &amp; Suggestions
          </h3>
          {!isSidebar && (
            <p className="text-xs text-slate-450 mt-1 font-medium">Help us improve the {toolContent.name} for everyone.</p>
          )}
        </div>

        <form onSubmit={handleFeedbackSubmit} className={`${isSidebar ? 'space-y-3' : 'space-y-5'} text-left`}>
          <div className="flex flex-col space-y-2">
            <span className={`font-bold text-slate-700 ${isSidebar ? 'text-[10px]' : 'text-xs'}`}>Was this page helpful?</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setRating('helpful')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 border rounded-full font-bold transition-all active:scale-95 cursor-pointer ${
                  isSidebar ? 'text-[9px]' : 'text-xs'
                } ${
                  rating === 'helpful'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-100/40'
                }`}
              >
                <i className="fas fa-thumbs-up text-[10px]"></i>
                <span>Yes</span>
              </button>
              <button
                type="button"
                onClick={() => setRating('not-helpful')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 border rounded-full font-bold transition-all active:scale-95 cursor-pointer ${
                  isSidebar ? 'text-[9px]' : 'text-xs'
                } ${
                  rating === 'not-helpful'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-100/40'
                }`}
              >
                <i className="fas fa-thumbs-down text-[10px]"></i>
                <span>No</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor={`feedback-text-${isSidebar ? 'side' : 'main'}`} className={`font-bold text-slate-700 ${isSidebar ? 'text-[10px]' : 'text-xs'}`}>
              Suggestions or feedback?
            </label>
            <textarea
              id={`feedback-text-${isSidebar ? 'side' : 'main'}`}
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What can we improve?"
              rows={isSidebar ? 2 : 4}
              className={`w-full bg-white border border-slate-200 p-3 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400 transition-colors ${
                isSidebar ? 'text-[10px]' : 'text-xs'
              }`}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label htmlFor={`feedback-email-${isSidebar ? 'side' : 'main'}`} className={`font-bold text-slate-700 ${isSidebar ? 'text-[10px]' : 'text-xs'}`}>
              Email Address (optional)
            </label>
            <input
              id={`feedback-email-${isSidebar ? 'side' : 'main'}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={`w-full bg-white border border-slate-200 p-3 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400 transition-colors ${
                isSidebar ? 'text-[10px]' : 'text-xs'
              }`}
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 bg-slate-900 text-white font-extrabold hover:bg-slate-800 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer ${
              isSidebar ? 'text-[9px]' : 'text-xs'
            }`}
          >
            Submit Feedback
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="w-full pt-12 border-t border-slate-150">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* Table of Contents Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-4 max-h-[calc(100vh-7.5rem)] overflow-y-auto pr-0 pb-4 no-scrollbar">
            <div className="bg-slate-50/60 border border-slate-150 p-6 rounded-3xl">
              <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-4 flex items-center">
                <i className="fas fa-list mr-1.5 text-slate-400"></i>
                Table of Contents
              </h4>
              <nav className="space-y-1">
                {sections.filter((sec) => sec.id !== 'categories').map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className={`block px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeSection === sec.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Desktop Categories Navigation placed inside sidebar below TOC */}
            <div className="bg-slate-50/60 border border-slate-150 p-6 rounded-3xl">
              <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold mb-4 flex items-center">
                <i className="fas fa-th-large mr-1.5 text-slate-400"></i>
                Explore Categories
              </h4>
              <nav className="grid grid-cols-2 gap-2">
                {toolCategories.map((category) => (
                  <Link
                    key={category.url}
                    href={category.url}
                    className={`flex items-center space-x-2.5 p-2.5 bg-white border border-slate-150 hover:border-slate-250 rounded-xl transition-all group shadow-sm hover:shadow-[0_4px_12px_rgb(0,0,0,0.01)] ${
                      category.name === 'Science' || category.name === 'Knowledge'
                        ? 'col-span-2'
                        : ''
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300 shrink-0">
                      <i className={`${category.icon} text-slate-550 text-[10px] group-hover:text-white`}></i>
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-1 lg:col-span-3 space-y-12">
          
          {/* Mobile Collapsible TOC */}
          <div className="block lg:hidden bg-slate-50/60 border border-slate-150 rounded-3xl p-5 shadow-sm">
            <details className="group">
              <summary className="font-bold text-[10px] uppercase tracking-wider text-slate-550 cursor-pointer list-none flex justify-between items-center select-none">
                <span className="flex items-center">
                  <i className="fas fa-list mr-1.5 text-slate-400"></i>
                  Table of Contents
                </span>
                <i className="fas fa-chevron-down text-xs text-slate-400 group-open:rotate-180 transition-transform duration-300"></i>
              </summary>
              <nav className="space-y-1 mt-4 pt-4 border-t border-slate-150">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block px-3 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>
            </details>
          </div>

          {/* 1. Overview */}
          <section id="about" className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm space-y-5 scroll-mt-24 animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                About the {toolContent.name}
              </h2>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-sm">
                {toolContent.priority.outlook}
              </span>
            </div>
            <div className="space-y-4 text-sm text-slate-550 font-medium leading-relaxed">
              {toolContent.overview.map((paragraph, index) => (
                <p key={index}>{renderParagraphWithLinks(paragraph)}</p>
              ))}
            </div>
          </section>

          {/* 2. Formulas & Equations */}
          {formulas.length > 0 && (
            <section id="formulas" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6 scroll-mt-24 animate-fade-in-up">
              <div className="pb-3 border-b border-slate-150">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                  <i className="fas fa-square-root-alt text-slate-900 mr-2.5 text-lg"></i>
                  Formulas & Mathematical Theory
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {formulas.map((formula, idx) => (
                  <div key={idx} className="bg-slate-50/60 border border-slate-150 p-6 rounded-2xl space-y-4">
                    <h4 className="text-sm font-bold text-slate-800">{formula.title}</h4>
                    <div className="py-6 bg-white border border-slate-150 rounded-xl flex items-center justify-center overflow-x-auto px-4 shadow-inner">
                      <BlockMath math={formula.latex} />
                    </div>
                    <p className="text-xs text-slate-550 font-medium leading-relaxed">
                      {renderParagraphWithLinks(formula.explanation)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Functionality Grid */}
          <div id="functionality" className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24">
            {/* What This Tool Does */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-info-circle text-slate-900 mr-2.5 text-base"></i>
                What This Tool Does
              </h3>
              <div className="space-y-3.5 text-xs font-medium text-slate-550 leading-relaxed">
                {toolContent.functionalitySummary.map((paragraph, index) => (
                  <p key={index}>{renderParagraphWithLinks(paragraph)}</p>
                ))}
              </div>
            </section>

            {/* Best For Audience */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-users text-slate-900 mr-2.5 text-base"></i>
                Best For
              </h3>
              <ul className="space-y-3">
                {toolContent.audience.map((item, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(item)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 4. Features, When to Use & Applications */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 scroll-mt-24">
            {/* Key Features */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-star text-slate-900 mr-2.5 text-base"></i>
                Key Features
              </h3>
              <ul className="space-y-3">
                {toolContent.capabilities.map((item, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(item)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* When to Use It */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-clock text-slate-900 mr-2.5 text-base"></i>
                When to Use It
              </h3>
              <ul className="space-y-3">
                {toolContent.whenToUse.map((item, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(item)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Real-World Applications */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-briefcase text-slate-900 mr-2.5 text-base"></i>
                Real-World Applications
              </h3>
              <ul className="space-y-3">
                {toolContent.useCases.map((item, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(item.charAt(0).toUpperCase() + item.slice(1))}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 5. How to Use & Why Choose Tuitility */}
          <div id="how-to" className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24">
            {/* How to Use This Tool */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-list-ol text-slate-900 mr-2.5 text-base"></i>
                How to Use
              </h3>
              <ol className="space-y-3.5">
                {toolContent.howToSteps.map((step, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="flex items-center justify-center w-5 h-5 bg-slate-550/10 text-slate-800 border border-slate-200 rounded-full mr-2.5 shrink-0 text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span>{renderParagraphWithLinks(step)}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Why Choose Tuitility */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-thumbs-up text-slate-900 mr-2.5 text-base"></i>
                Why Choose Tuitility
              </h3>
              <ul className="space-y-3">
                {toolContent.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(benefit)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 6. Tips & Mistakes */}
          <div id="tips" className="grid grid-cols-1 md:grid-cols-2 gap-8 scroll-mt-24">
            {/* Tips for Better Results */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-lightbulb text-slate-900 mr-2.5 text-base"></i>
                Tips for Better Results
              </h3>
              <ul className="space-y-3">
                {toolContent.tips.map((tip, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(tip)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Common Mistakes to Avoid */}
            <section className="bg-white border border-slate-100 rounded-3xl p-7 md:p-8 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
                <i className="fas fa-exclamation-triangle text-slate-900 mr-2.5 text-base"></i>
                Common Mistakes to Avoid
              </h3>
              <ul className="space-y-3">
                {toolContent.mistakes.map((mistake, index) => (
                  <li key={index} className="flex items-start text-xs font-medium text-slate-555 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-950 rounded-full mr-2.5 mt-2 shrink-0"></span>
                    <span>{renderParagraphWithLinks(mistake)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 7. FAQs */}
          <section id="faqs" className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 md:p-10 shadow-sm space-y-6 scroll-mt-24">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
              <i className="fas fa-question-circle text-slate-900 mr-2.5 text-lg"></i>
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {toolContent.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white border border-slate-150 rounded-2xl p-5 shadow-sm transition-all duration-300 open:shadow-md"
                >
                  <summary className="font-bold text-sm text-slate-800 cursor-pointer list-none flex justify-between items-center select-none">
                    <span>{faq.question}</span>
                    <i className="fas fa-chevron-down text-xs text-slate-400 group-open:rotate-180 transition-transform duration-300"></i>
                  </summary>
                  <p className="text-xs font-medium text-slate-550 leading-relaxed mt-4 pt-4 border-t border-slate-50">
                    {renderParagraphWithLinks(faq.answer)}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* 9. Categories Navigation (Mobile View Only - hidden on desktop since it renders in desktop sidebar) */}
          <section id="categories" className="block lg:hidden space-y-6 scroll-mt-24">
            <div className="pb-3 border-b border-slate-150">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display">
                Explore Other Tool Suites
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {toolCategories.map((category) => (
                <Link
                  key={category.url}
                  href={category.url}
                  className="p-5 bg-white border border-slate-150 hover:border-slate-250 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 group"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#1a1a1a] group-hover:text-white transition-all duration-300">
                      <i className={`${category.icon} text-slate-650 text-xs group-hover:text-white`}></i>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1a1a1a] group-hover:underline transition-colors font-display">
                      {category.name} Tools
                    </h4>
                    <p className="text-[11px] text-slate-450 leading-normal mt-1.5 line-clamp-2">
                      {category.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-4 flex items-center group-hover:text-slate-800 transition-colors">
                    Browse category <i className="fas fa-chevron-right ml-1 text-[7px] group-hover:translate-x-0.5 transition-all"></i>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* 10. Feedback Form (Desktop & Mobile) */}
          <section id="feedback" className="scroll-mt-24">
            {renderFeedbackForm(false)}
          </section>

          {/* 10. Related Tools */}
          {toolContent.relatedTools.length > 0 && (
            <section id="related" className="space-y-6 scroll-mt-24">
              <div className="pb-3 border-b border-slate-150">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                  Related {toolContent.category} Tools
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {toolContent.relatedTools.map((relatedTool) => (
                  <Link
                    key={relatedTool.url}
                    href={relatedTool.url}
                    className="p-5 bg-white border border-slate-150 hover:border-slate-250 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300 group"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center mb-3">
                        <i className={`${relatedTool.icon} text-slate-600 text-xs`}></i>
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#1a1a1a] group-hover:underline transition-colors font-display">
                        {relatedTool.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-2 line-clamp-2">
                        {relatedTool.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-4 flex items-center group-hover:text-slate-800 transition-colors">
                      Open tool <i className="fas fa-chevron-right ml-1 text-[7px] group-hover:translate-x-0.5 transition-all"></i>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
