export function getClientIdleSavingsLakhs(client) {
  if (typeof client?.idleSavingsNumeric === 'number') return client.idleSavingsNumeric;
  const match = (client?.idleSavings || '').match(/([\d.]+)\s*Lakhs?/i);
  return match ? Number.parseFloat(match[1]) : 0;
}

export function formatLakhsAsIndianCurrency(lakhs) {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs.toFixed(1)} Lakhs`;
}

export function formatIdleCashFromClients(clients) {
  const totalLakhs = clients.reduce((sum, client) => sum + getClientIdleSavingsLakhs(client), 0);
  return formatLakhsAsIndianCurrency(totalLakhs);
}

export function addGeneratedTasksOnce(existingTasks, newTasks) {
  const existingIds = new Set(existingTasks.map(task => task.id));
  return [...newTasks.filter(task => !existingIds.has(task.id)), ...existingTasks];
}

export async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.top = '-1000px';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
}
