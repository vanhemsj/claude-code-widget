const THRESHOLDS = { LOW: 50, MEDIUM: 80 };

function getColorClass(value) {
  if (value == null) return '';
  if (value < THRESHOLDS.LOW) return 'green';
  if (value < THRESHOLDS.MEDIUM) return 'yellow';
  return 'red';
}

function formatResetTime(isoString) {
  if (!isoString) return '';

  const diffMs = new Date(isoString) - new Date();
  if (diffMs <= 0) return '0m';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;

  return diffHours > 0 ? `${diffHours}h${remainingMins}m` : `${diffMins}m`;
}

function updateDisplay(data) {
  if (!data) return;

  const errorEl = document.getElementById('error-message');
  const statsEl = document.getElementById('stats-container');

  if (data.error) {
    errorEl.querySelector('.error-text').textContent = data.error;
    errorEl.classList.remove('hidden');
    statsEl.classList.add('hidden');
    return;
  }

  errorEl.classList.add('hidden');
  statsEl.classList.remove('hidden');

  const fiveHour = data.five_hour?.utilization;
  const sevenDay = data.seven_day?.utilization;
  const sevenDaySonnet = data.seven_day_sonnet?.utilization;

  const fiveHourEl = document.getElementById('five-hour');
  fiveHourEl.textContent = fiveHour != null ? `${fiveHour}%` : '--%';
  fiveHourEl.className = 'value ' + getColorClass(fiveHour);
  document.getElementById('five-hour-reset').textContent = formatResetTime(data.five_hour?.resets_at);

  const sevenDayEl = document.getElementById('seven-day');
  sevenDayEl.textContent = sevenDay != null ? `${sevenDay}%` : '--%';
  sevenDayEl.className = 'value ' + getColorClass(sevenDay);
  document.getElementById('seven-day-reset').textContent = formatResetTime(data.seven_day?.resets_at);

  const sevenDaySonnetEl = document.getElementById('seven-day-sonnet');
  sevenDaySonnetEl.textContent = sevenDaySonnet != null ? `${sevenDaySonnet}%` : '--%';
  sevenDaySonnetEl.className = 'value ' + getColorClass(sevenDaySonnet);
}

document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refresh-btn');
  let isRefreshing = false;

  refreshBtn.addEventListener('click', () => {
    if (isRefreshing) return;
    window.api.refreshUsage();
  });

  window.api.onUsageData((data) => {
    updateDisplay(data);
    isRefreshing = false;
    refreshBtn.classList.remove('loading');
  });

  window.api.onRefreshStart(() => {
    isRefreshing = true;
    refreshBtn.classList.add('loading');
  });

  window.api.getUsage()
    .then((data) => {
      if (data) updateDisplay(data);
    })
    .catch((err) => {
      console.error('Failed to get usage:', err);
    });
});
