/* ===== Charts.js — Chart.js vizualizace pro kalkulačky ===== */
(function () {
  'use strict';

  if (typeof Chart === 'undefined') return;

  // ===== Theme utility =====
  function getChartColors() {
    var isLight = document.body.classList.contains('light');
    return {
      gold: isLight ? '#B8922E' : '#D4A843',
      goldAlpha: isLight ? 'rgba(184,146,46,0.25)' : 'rgba(212,168,67,0.25)',
      emerald: isLight ? '#059669' : '#10B981',
      emeraldAlpha: isLight ? 'rgba(5,150,105,0.25)' : 'rgba(16,185,129,0.25)',
      indigo: '#6366F1',
      indigoAlpha: 'rgba(99,102,241,0.25)',
      muted: isLight ? '#94A3B8' : '#64748B',
      mutedAlpha: isLight ? 'rgba(148,163,184,0.18)' : 'rgba(100,116,139,0.18)',
      grid: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      text: isLight ? '#64748B' : '#94A3B8',
      tooltipBg: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10,22,40,0.95)',
      tooltipText: isLight ? '#1E293B' : '#E2E8F0',
      red: '#EF4444'
    };
  }

  // ===== Doughnut center text plugin =====
  var centerTextPlugin = {
    id: 'centerText',
    afterDraw: function (chart) {
      if (!chart.config.options.plugins.centerText) return;
      var text = chart.config.options.plugins.centerText.text;
      if (!text) return;
      var ctx = chart.ctx;
      var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      var c = getChartColors();
      ctx.save();
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Celkem', centerX, centerY - 12);
      ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = c.gold;
      ctx.fillText(text, centerX, centerY + 12);
      ctx.restore();
    }
  };

  Chart.register(centerTextPlugin);

  // ===== Shared tooltip config =====
  function tooltipConfig() {
    var c = getChartColors();
    return {
      backgroundColor: c.tooltipBg,
      titleColor: c.tooltipText,
      bodyColor: c.tooltipText,
      borderColor: c.grid,
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      titleFont: { weight: '600' },
      callbacks: {
        label: function (ctx) {
          var label = ctx.dataset.label || '';
          var val = window.czk ? window.czk(ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed) : ctx.formattedValue;
          return label ? label + ': ' + val : val;
        }
      }
    };
  }

  // ===== Chart instances storage =====
  var charts = { mortgage: [], invest: [], life: [] };

  function destroyCharts(type) {
    if (charts[type]) {
      charts[type].forEach(function (ch) { ch.destroy(); });
      charts[type] = [];
    }
  }

  // ===== Amortization computation =====
  function computeAmortization(P, annualRate, years) {
    var n = years * 12;
    var r = annualRate / 100 / 12;
    var M = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    var balance = P;
    var cumInterest = 0;
    var labels = [];
    var balanceData = [];
    var interestData = [];

    for (var y = 0; y <= years; y++) {
      labels.push(y + '. rok');
      balanceData.push(Math.round(balance));
      interestData.push(Math.round(cumInterest));
      // Simulate 12 months
      for (var m = 0; m < 12 && balance > 0; m++) {
        var intPart = balance * r;
        var prinPart = M - intPart;
        if (prinPart > balance) prinPart = balance;
        balance -= prinPart;
        cumInterest += intPart;
      }
    }
    return { labels: labels, balance: balanceData, interest: interestData };
  }

  // ===== Investment growth computation =====
  function computeInvestmentGrowth(initial, monthly, rate, fee, years) {
    var netRate = (rate - fee) / 100;
    var r = netRate / 12;
    var labels = [];
    var deposits = [];
    var values = [];

    for (var y = 0; y <= years; y++) {
      labels.push(y + '. rok');
      var n = y * 12;
      var totalDeposited = initial + monthly * n;
      var fv = r === 0
        ? totalDeposited
        : initial * Math.pow(1 + r, n) + (n > 0 ? monthly * (Math.pow(1 + r, n) - 1) / r : 0);
      deposits.push(Math.round(totalDeposited));
      values.push(Math.round(fv));
    }
    return { labels: labels, deposits: deposits, values: values };
  }

  // ===== Hide fallback rows when summary cards render =====
  function hideFallbackRows(container) {
    if (!container) return;
    var rows = container.querySelectorAll('.calc-row-fallback');
    rows.forEach(function (row) { row.style.display = 'none'; });
  }

  function showFallbackRows(container) {
    if (!container) return;
    var rows = container.querySelectorAll('.calc-row-fallback');
    rows.forEach(function (row) { row.style.display = ''; });
  }

  // ===== MORTGAGE CHARTS =====
  function renderMortgageCharts(data) {
    destroyCharts('mortgage');
    var c = getChartColors();
    var czk = window.czk;

    // Hide fallback text rows
    hideFallbackRows(document.getElementById('mortgageResult'));

    // Summary cards
    var cards = document.getElementById('mortgageSummaryCards');
    if (cards) {
      cards.innerHTML =
        '<div class="summary-card summary-card-highlight"><div class="summary-label">M\u011bs\u00ed\u010dn\u00ed spl\u00e1tka</div><div class="summary-value highlight">' + czk(data.monthlyTotal) + '</div></div>' +
        '<div class="summary-card"><div class="summary-label">Celkem zaplaceno</div><div class="summary-value">' + czk(data.totalPaid) + '</div></div>' +
        '<div class="summary-card"><div class="summary-label">Z toho \u00faroky</div><div class="summary-value">' + czk(data.totalInterest) + '</div></div>';
    }

    // Doughnut — principal vs interest
    var doughnutCanvas = document.getElementById('mortgageDoughnut');
    if (doughnutCanvas) {
      var doughnutCtx = doughnutCanvas.getContext('2d');
      charts.mortgage.push(new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Jistina', '\u00daroky'],
          datasets: [{
            data: [data.P, data.totalInterest],
            backgroundColor: [c.gold, c.muted],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '62%',
          animation: { animateRotate: true, animateScale: true, duration: 800 },
          plugins: {
            legend: { position: 'bottom', labels: { color: c.text, padding: 16, usePointStyle: true } },
            tooltip: tooltipConfig(),
            centerText: { text: czk(data.totalPaid) }
          }
        }
      }));
    }

    // Area chart — amortization
    var areaCanvas = document.getElementById('mortgageArea');
    if (areaCanvas) {
      var amort = computeAmortization(data.P, data.annualRate, data.years);
      var areaCtx = areaCanvas.getContext('2d');
      charts.mortgage.push(new Chart(areaCtx, {
        type: 'line',
        data: {
          labels: amort.labels,
          datasets: [
            {
              label: 'Zb\u00fdvaj\u00edc\u00ed dluh',
              data: amort.balance,
              borderColor: c.gold,
              backgroundColor: c.goldAlpha,
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointHitRadius: 10
            },
            {
              label: 'Kumulativn\u00ed \u00faroky',
              data: amort.interest,
              borderColor: c.muted,
              backgroundColor: c.mutedAlpha,
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointHitRadius: 10
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: { grid: { color: c.grid }, ticks: { color: c.text, maxTicksLimit: 8 } },
            y: {
              grid: { color: c.grid },
              ticks: {
                color: c.text,
                callback: function (v) { return window.czk ? window.czk(v) : v; }
              }
            }
          },
          plugins: {
            legend: { labels: { color: c.text, usePointStyle: true, padding: 16 } },
            tooltip: Object.assign({}, tooltipConfig(), { mode: 'index' })
          },
          animation: { duration: 800 }
        }
      }));
    }

    var chartsContainer = document.getElementById('mortgageCharts');
    if (chartsContainer) chartsContainer.style.display = 'block';
  }

  // ===== INVEST CHARTS =====
  function renderInvestCharts(data) {
    destroyCharts('invest');
    var c = getChartColors();
    var czk = window.czk;

    // Hide fallback text rows
    hideFallbackRows(document.getElementById('investResult'));

    // Summary cards
    var cards = document.getElementById('investSummaryCards');
    if (cards) {
      cards.innerHTML =
        '<div class="summary-card summary-card-highlight"><div class="summary-label">Hodnota portfolia</div><div class="summary-value highlight">' + czk(data.fv) + '</div></div>' +
        '<div class="summary-card"><div class="summary-label">Celkem vlo\u017eeno</div><div class="summary-value">' + czk(data.contrib) + '</div></div>' +
        '<div class="summary-card"><div class="summary-label">Zhodnocen\u00ed</div><div class="summary-value">' + czk(data.gain) + '</div></div>';
    }

    // Stacked area — growth over time
    var areaCanvas = document.getElementById('investArea');
    if (areaCanvas) {
      var growth = computeInvestmentGrowth(data.initial, data.monthly, data.rate, data.fee, data.years);
      var gains = growth.values.map(function (v, i) { return Math.max(0, v - growth.deposits[i]); });
      var areaCtx = areaCanvas.getContext('2d');
      charts.invest.push(new Chart(areaCtx, {
        type: 'line',
        data: {
          labels: growth.labels,
          datasets: [
            {
              label: 'Vklady',
              data: growth.deposits,
              borderColor: c.gold,
              backgroundColor: c.goldAlpha,
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointHitRadius: 10,
              order: 2
            },
            {
              label: 'Zhodnocen\u00ed',
              data: gains,
              borderColor: c.emerald,
              backgroundColor: c.emeraldAlpha,
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointHitRadius: 10,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: { grid: { color: c.grid }, ticks: { color: c.text, maxTicksLimit: 8 },
              stacked: true },
            y: {
              stacked: true,
              grid: { color: c.grid },
              ticks: {
                color: c.text,
                callback: function (v) { return window.czk ? window.czk(v) : v; }
              }
            }
          },
          plugins: {
            legend: { labels: { color: c.text, usePointStyle: true, padding: 16 } },
            tooltip: Object.assign({}, tooltipConfig(), { mode: 'index' })
          },
          animation: { duration: 800 }
        }
      }));
    }

    // Doughnut — deposits vs gain
    var doughnutCanvas = document.getElementById('investDoughnut');
    if (doughnutCanvas) {
      var doughnutCtx = doughnutCanvas.getContext('2d');
      charts.invest.push(new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Vklady', 'Zhodnocen\u00ed'],
          datasets: [{
            data: [data.contrib, Math.max(0, data.gain)],
            backgroundColor: [c.gold, c.emerald],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '62%',
          animation: { animateRotate: true, animateScale: true, duration: 800 },
          plugins: {
            legend: { position: 'bottom', labels: { color: c.text, padding: 16, usePointStyle: true } },
            tooltip: tooltipConfig(),
            centerText: { text: czk(data.fv) }
          }
        }
      }));
    }

    var chartsContainer = document.getElementById('investCharts');
    if (chartsContainer) chartsContainer.style.display = 'block';
  }

  // ===== LIFE INSURANCE CHARTS =====
  function renderLifeCharts(data) {
    destroyCharts('life');
    var c = getChartColors();
    var czk = window.czk;

    // Hide fallback text rows
    hideFallbackRows(document.getElementById('lifeResult'));

    // Summary card
    var cards = document.getElementById('lifeSummaryCards');
    if (cards) {
      cards.innerHTML =
        '<div class="summary-card summary-card-highlight full"><div class="summary-label">Doporu\u010den\u00e9 kryt\u00ed</div><div class="summary-value highlight">' + czk(data.recommended) + '</div></div>';
    }

    // Breakdown rows
    var breakdown = document.getElementById('lifeBreakdown');
    if (breakdown) {
      var incomeTotal = data.income * 12 * data.years;
      breakdown.innerHTML =
        '<div class="calc-row"><span>Z\u00e1vazky / dluhy</span><span>' + czk(data.debts) + '</span></div>' +
        '<div class="calc-row"><span>N\u00e1hrada p\u0159\u00edjmu (' + czk(data.income) + ' \u00d7 12 \u00d7 ' + data.years + ')</span><span>' + czk(incomeTotal) + '</span></div>' +
        '<div class="calc-row"><span>C\u00edle (vzd\u011bl\u00e1n\u00ed)</span><span>' + czk(data.goals) + '</span></div>' +
        '<div class="calc-row"><span>N\u00e1klady na poh\u0159eb</span><span>' + czk(data.funeral) + '</span></div>' +
        '<div class="calc-row calc-row-deduct"><span>\u00daspory (ode\u010dteno)</span><span>\u2212 ' + czk(data.savings) + '</span></div>';
      breakdown.style.display = '';
    }

    // Doughnut — coverage composition
    var doughnutCanvas = document.getElementById('lifeDoughnut');
    if (doughnutCanvas) {
      var incomeTotal2 = data.income * 12 * data.years;
      var segments = [data.debts, incomeTotal2, data.goals, data.funeral];
      var doughnutCtx = doughnutCanvas.getContext('2d');
      charts.life.push(new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
          labels: ['Z\u00e1vazky', 'P\u0159\u00edjem', 'C\u00edle', 'Poh\u0159eb'],
          datasets: [{
            data: segments,
            backgroundColor: [c.gold, c.emerald, c.indigo, c.muted],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '62%',
          animation: { animateRotate: true, animateScale: true, duration: 800 },
          plugins: {
            legend: { position: 'bottom', labels: { color: c.text, padding: 16, usePointStyle: true } },
            tooltip: tooltipConfig(),
            centerText: { text: czk(data.recommended) }
          }
        }
      }));
    }

    // Horizontal stacked bar — needs vs savings
    var barCanvas = document.getElementById('lifeBar');
    if (barCanvas) {
      var incomeTotal3 = data.income * 12 * data.years;
      var barCtx = barCanvas.getContext('2d');
      charts.life.push(new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Pot\u0159eby vs. \u00faspory'],
          datasets: [
            { label: 'Z\u00e1vazky', data: [data.debts], backgroundColor: c.gold },
            { label: 'P\u0159\u00edjem', data: [incomeTotal3], backgroundColor: c.emerald },
            { label: 'C\u00edle', data: [data.goals], backgroundColor: c.indigo },
            { label: 'Poh\u0159eb', data: [data.funeral], backgroundColor: c.muted },
            { label: '\u00daspory', data: [-data.savings], backgroundColor: c.red }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          scales: {
            x: {
              stacked: true,
              grid: { color: c.grid },
              ticks: {
                color: c.text,
                callback: function (v) { return window.czk ? window.czk(Math.abs(v)) : v; }
              }
            },
            y: { stacked: true, display: false }
          },
          plugins: {
            legend: { labels: { color: c.text, usePointStyle: true, padding: 12 } },
            tooltip: {
              backgroundColor: getChartColors().tooltipBg,
              titleColor: getChartColors().tooltipText,
              bodyColor: getChartColors().tooltipText,
              borderColor: c.grid,
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (ctx) {
                  var val = Math.abs(ctx.parsed.x);
                  return ctx.dataset.label + ': ' + (window.czk ? window.czk(val) : val);
                }
              }
            }
          },
          animation: { duration: 800 }
        }
      }));
    }

    var chartsContainer = document.getElementById('lifeCharts');
    if (chartsContainer) chartsContainer.style.display = 'block';
  }

  // ===== Event listeners =====
  document.addEventListener('calcResult', function (e) {
    var type = e.detail.type;
    var data = e.detail.data;
    if (type === 'mortgage') renderMortgageCharts(data);
    else if (type === 'invest') renderInvestCharts(data);
    else if (type === 'life') renderLifeCharts(data);
  });

  document.addEventListener('calcReset', function (e) {
    var type = e.detail.type;
    destroyCharts(type);
    var containerId = type === 'mortgage' ? 'mortgageCharts' : type === 'invest' ? 'investCharts' : 'lifeCharts';
    var container = document.getElementById(containerId);
    if (container) container.style.display = 'none';
    // Clear summary cards
    var summaryId = type === 'mortgage' ? 'mortgageSummaryCards' : type === 'invest' ? 'investSummaryCards' : 'lifeSummaryCards';
    var summary = document.getElementById(summaryId);
    if (summary) summary.innerHTML = '';
    // Restore fallback rows
    var resultId = type === 'mortgage' ? 'mortgageResult' : type === 'invest' ? 'investResult' : 'lifeResult';
    showFallbackRows(document.getElementById(resultId));
    // Clear breakdown
    if (type === 'life') {
      var bd = document.getElementById('lifeBreakdown');
      if (bd) { bd.innerHTML = ''; bd.style.display = 'none'; }
    }
  });

  // ===== Dark/Light mode watcher =====
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'class') {
        // Update all active charts
        ['mortgage', 'invest', 'life'].forEach(function (type) {
          if (charts[type].length > 0) {
            var c = getChartColors();
            charts[type].forEach(function (chart) {
              // Update legend colors
              if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                chart.options.plugins.legend.labels.color = c.text;
              }
              // Update scale colors
              if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(function (key) {
                  var scale = chart.options.scales[key];
                  if (scale.grid) scale.grid.color = c.grid;
                  if (scale.ticks) scale.ticks.color = c.text;
                });
              }
              // Update tooltip
              if (chart.options.plugins.tooltip) {
                chart.options.plugins.tooltip.backgroundColor = c.tooltipBg;
                chart.options.plugins.tooltip.titleColor = c.tooltipText;
                chart.options.plugins.tooltip.bodyColor = c.tooltipText;
                chart.options.plugins.tooltip.borderColor = c.grid;
              }
              chart.update('none');
            });
          }
        });
      }
    });
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ===== Range slider sync =====
  document.querySelectorAll('input[type="range"][data-sync]').forEach(function (slider) {
    var targetId = slider.getAttribute('data-sync');
    var target = document.getElementById(targetId);
    if (!target) return;

    function syncFromSlider() {
      var val = parseFloat(slider.value);
      if (target.getAttribute('inputmode') === 'numeric') {
        target.value = new Intl.NumberFormat('cs-CZ').format(val);
      } else {
        target.value = val;
      }
    }

    function syncFromInput() {
      var raw = target.value.replace(/\s/g, '').replace(',', '.');
      var val = parseFloat(raw) || 0;
      slider.value = val;
    }

    slider.addEventListener('input', syncFromSlider);
    target.addEventListener('input', syncFromInput);
    target.addEventListener('change', syncFromInput);

    // Initial sync
    syncFromInput();
  });

})();
