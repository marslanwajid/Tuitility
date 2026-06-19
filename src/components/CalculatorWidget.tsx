'use client';

import React from 'react';
import { CALCULATOR_REGISTRY } from './CalculatorRegistry';

interface CalculatorWidgetProps {
  path: string;
  fallback?: React.ReactNode;
}

export default function CalculatorWidget({ path, fallback }: CalculatorWidgetProps) {
  const CalculatorComponent = CALCULATOR_REGISTRY[path];
  
  if (!CalculatorComponent) {
    return <>{fallback}</>;
  }

  return <CalculatorComponent />;
}
