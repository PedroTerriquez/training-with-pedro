function toLocalDateStr(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return d.toISOString().slice(0, 10)
}
function getToday() { return toLocalDateStr(new Date()) }

const RECOVERY_TIPS = [
  { icon: '💧', title: 'Hidrátate', body: '3-4 L de agua. Bonus: una pizca de sal con el desayuno.' },
  { icon: '😴', title: 'Duerme 7-9 horas', body: 'El crecimiento pasa aquí, no en el gimnasio.' },
  { icon: '🚶', title: 'Caminata suave', body: '30-45 min a ritmo conversacional. Mejora la circulación.' },
  { icon: '🧘', title: 'Movilidad', body: '10 minutos — caderas, columna torácica, hombros. No te la saltes.' },
  { icon: '🍳', title: 'Come suficiente', body: 'Alcanza tu meta de proteína. La recuperación necesita combustible.' },
]

window.RECOVERY_TIPS = RECOVERY_TIPS
