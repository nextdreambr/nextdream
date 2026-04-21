export function formatRelativeDate(dateInput: string | Date, nowInput = new Date()) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = nowInput instanceof Date ? nowInput : new Date(nowInput);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = now.getTime() - date.getTime();
  if (diffMs <= 0) {
    return 'Agora mesmo';
  }

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return minutes === 1 ? '1 min atrás' : `${minutes} min atrás`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return hours === 1 ? '1 hora atrás' : `${hours} horas atrás`;
  }

  const days = Math.floor(diffMs / day);
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;

  return date.toLocaleDateString('pt-BR');
}
