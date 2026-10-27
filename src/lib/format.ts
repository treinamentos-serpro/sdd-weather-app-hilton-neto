export function formatForecastDate(date: string, index: number): { label: string; date: string } {
  const parsedDate = new Date(`${date}T12:00:00`);

  return {
    label:
      index === 0
        ? 'Hoje'
        : new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(parsedDate).replace('.', ''),
    date: new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })
      .format(parsedDate)
      .replace('.', ''),
  };
}

export function formatUpdateTime(time: string): string {
  const clock = time.split('T')[1]?.slice(0, 5);
  return clock ? `Atualizado às ${clock}` : 'Atualização recente';
}