document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const totalCustomersInput = document.getElementById('totalCustomers');
  const arpuInput = document.getElementById('arpu');
  const logoChurnInput = document.getElementById('logoChurn');
  const expansionRateInput = document.getElementById('expansionRate');
  const monthlySalesMarketingInput = document.getElementById('monthlySalesMarketing');
  const newCustomersMonthInput = document.getElementById('newCustomersMonth');
  const grossMarginInput = document.getElementById('grossMargin');
  const newMrrAddedInput = document.getElementById('newMrrAdded');
  const mrrLostChurnInput = document.getElementById('mrrLostChurn');
  const churnSimSlider = document.getElementById('churnSimSlider');
  const simChurnVal = document.getElementById('simChurnVal');

  // Displays
  const mrrDisplay = document.getElementById('mrrDisplay');
  const arrDisplay = document.getElementById('arrDisplay');
  const ltvDisplay = document.getElementById('ltvDisplay');
  const cacDisplay = document.getElementById('cacDisplay');
  const ltvCacRatioDisplay = document.getElementById('ltvCacRatioDisplay');
  const paybackDisplay = document.getElementById('paybackDisplay');
  const ltvBadge = document.getElementById('ltvBadge');
  const paybackBadge = document.getElementById('paybackBadge');
  const netChurnDisplay = document.getElementById('netChurnDisplay');
  const avgLifespanDisplay = document.getElementById('avgLifespanDisplay');
  const quickRatioDisplay = document.getElementById('quickRatioDisplay');
  const simRevenueDisplay = document.getElementById('simRevenueDisplay');

  function calculateSaaSMetrics() {
    const totalCustomers = parseFloat(totalCustomersInput.value) || 0;
    const arpu = parseFloat(arpuInput.value) || 0;
    const logoChurn = (parseFloat(logoChurnInput.value) || 0) / 100;
    const expansionRate = (parseFloat(expansionRateInput.value) || 0) / 100;
    const salesMarketingSpend = parseFloat(monthlySalesMarketingInput.value) || 0;
    const newCustomers = parseFloat(newCustomersMonthInput.value) || 0;
    const grossMargin = (parseFloat(grossMarginInput.value) || 0) / 100;
    const newMrrAdded = parseFloat(newMrrAddedInput.value) || 0;
    const mrrLostChurn = parseFloat(mrrLostChurnInput.value) || 0;

    // 1. MRR & ARR
    const mrr = totalCustomers * arpu;
    const arr = mrr * 12;

    mrrDisplay.textContent = formatCurrency(mrr);
    arrDisplay.textContent = `Annual Recurring Revenue (ARR): ${formatCurrency(arr)}`;

    // 2. Net Churn & Average Lifespan
    const netChurnRate = logoChurn - expansionRate;
    netChurnDisplay.textContent = `${(netChurnRate * 100).toFixed(2)}% / mo`;

    const avgLifespanMonths = logoChurn > 0 ? 1 / logoChurn : 120;
    avgLifespanDisplay.textContent = `${Math.round(avgLifespanMonths)} months`;

    // 3. Customer Lifetime Value (LTV)
    // LTV = (ARPU * Gross Margin) / Logo Churn Rate
    const ltv = logoChurn > 0 ? (arpu * grossMargin) / logoChurn : 0;
    ltvDisplay.textContent = formatCurrency(ltv);

    // 4. Customer Acquisition Cost (CAC)
    const cac = newCustomers > 0 ? salesMarketingSpend / newCustomers : 0;
    cacDisplay.textContent = formatCurrency(cac);

    // 5. LTV : CAC Ratio
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    ltvCacRatioDisplay.textContent = `${ltvCacRatio.toFixed(1)}x`;

    if (ltvCacRatio >= 3.0) {
      setBadge(ltvBadge, 'Excellent (≥3x)', 'good');
    } else if (ltvCacRatio >= 1.5) {
      setBadge(ltvBadge, 'Moderate (1.5x-3x)', 'warn');
    } else {
      setBadge(ltvBadge, 'Unhealthy (<1.5x)', 'danger');
    }

    // 6. CAC Payback Period (Months)
    // Payback = CAC / (ARPU * Gross Margin)
    const monthlyGrossProfitPerUser = arpu * grossMargin;
    const paybackMonths = monthlyGrossProfitPerUser > 0 ? cac / monthlyGrossProfitPerUser : 0;
    paybackDisplay.textContent = `${paybackMonths.toFixed(1)} Mos`;

    if (paybackMonths <= 12) {
      setBadge(paybackBadge, 'Fast Payback (≤12m)', 'good');
    } else if (paybackMonths <= 18) {
      setBadge(paybackBadge, 'Average (12-18m)', 'warn');
    } else {
      setBadge(paybackBadge, 'Slow Payback (>18m)', 'danger');
    }

    // 7. SaaS Quick Ratio = New MRR / Churned MRR
    const quickRatio = mrrLostChurn > 0 ? newMrrAdded / mrrLostChurn : newMrrAdded > 0 ? 99.0 : 0;
    quickRatioDisplay.textContent = `${quickRatio.toFixed(1)} ${quickRatio >= 4 ? '(Strong Growth)' : quickRatio >= 2 ? '(Moderate Growth)' : '(High Churn Risk)'}`;

    // 8. Run Churn Simulator
    runSimulator(mrr, arpu, grossMargin);
  }

  function runSimulator(currentMrr, arpu, grossMargin) {
    const simChurn = parseFloat(churnSimSlider.value) / 100;
    simChurnVal.textContent = `${churnSimSlider.value}%`;

    // 36 months simulation starting with current MRR
    let cumulativeRev = 0;
    let runningMrr = currentMrr;
    for (let month = 1; month <= 36; month++) {
      cumulativeRev += runningMrr;
      runningMrr = runningMrr * (1 - simChurn + 0.01); // 1% growth baseline
    }

    simRevenueDisplay.textContent = formatCurrency(cumulativeRev);
  }

  function setBadge(el, text, type) {
    el.textContent = text;
    el.className = `status-badge ${type}`;
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  }

  const allInputs = [
    totalCustomersInput, arpuInput, logoChurnInput, expansionRateInput,
    monthlySalesMarketingInput, newCustomersMonthInput, grossMarginInput,
    newMrrAddedInput, mrrLostChurnInput, churnSimSlider
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', calculateSaaSMetrics);
    input.addEventListener('change', calculateSaaSMetrics);
  });

  calculateSaaSMetrics();
});
