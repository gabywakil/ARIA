// Información de la marca. Todo lo marcado como ejemplo se reemplaza con datos reales de ARIA.
export const SITE = {
  name: 'ARIA Inventory & Mobility',
  city: 'Lechería, Anzoátegui',
  address: 'Av. Principal de Lechería, Centro Comercial (dirección de ejemplo)',
  hours: 'Lunes a sábado, 9:00 a 6:00, con cita previa',
  phone: '+58 414 000 0000',
  whatsapp: '584140000000',
  email: 'ventas@aria.com',
  instagram: 'https://www.instagram.com/ariainventory',
}

export const NAV = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/energia', label: 'Energía' },
  { to: '/como-comprar', label: 'Cómo comprar' },
  { to: '/empresas', label: 'Empresas' },
  { to: '/contacto', label: 'Contacto' },
]

/** Enlaces secundarios del menú del celular */
export const NAV_MORE = [
  { to: '/seguimiento', label: 'Seguir mi pedido' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/aliados', label: 'Aliados' },
  { to: '/preguntas', label: 'Preguntas frecuentes' },
  { to: '/noticias', label: 'Noticias' },
]

export const BRANDS = ['Vento', 'Forza', 'Aichi', 'HJM', 'Loncin', 'Hisun', 'Lifan', 'ZX Auto', 'Toyota', 'Nissan', 'GAC', 'Hyundai GD Power', 'Cummins', 'Greenenergy', 'Tolsen', 'Nexon', 'ConstruY']

export const STEPS = [
  { title: 'Elige', text: 'Busca por categoría, marca o código y compara fichas técnicas.' },
  { title: 'Agrega al carrito', text: 'Compra lo que tiene precio o pide cotización de lo que no.' },
  { title: 'Datos y entrega', text: 'Sin crear cuenta. Retiras en tienda o te lo enviamos.' },
  { title: 'Paga seguro', text: 'Zelle, pago móvil, transferencia o efectivo, con instrucciones verificadas.' },
  { title: 'Sigue tu pedido', text: 'Con tu número ves cada paso hasta que lo tienes en tus manos.' },
]

export const SERVICES = [
  { icon: 'card', title: 'Financiación', text: 'Compra tu moto o vehículo en cuotas, con inicial desde 30 %.' },
  { icon: 'shield', title: 'Póliza y garantía', text: 'Las motos Vento salen aseguradas. Todo tiene garantía de fábrica.' },
  { icon: 'truck', title: 'Entrega coordinada', text: 'Despacho a todo el país con seguimiento hasta tu puerta.' },
  { icon: 'wrench', title: 'Servicio técnico', text: 'Mantenimiento, diagnóstico y repuestos originales.' },
  { icon: 'bolt', title: 'Alquiler de plantas', text: 'Por día, semana o mes, con transporte e instalación.' },
  { icon: 'users', title: 'Asesoría', text: 'Un asesor te ayuda a elegir y cotizar sin compromiso.' },
] as const

export const FAQ_CATS = ['Compras', 'Pagos', 'Entregas', 'Garantía', 'Productos'] as const
export const FAQ: { q: string; a: string; cat: (typeof FAQ_CATS)[number] }[] = [
  { cat: 'Compras', q: '¿Necesito crear una cuenta para comprar?', a: 'No. Agregas los productos al carrito, escribes tus datos una sola vez y listo. Si quieres, el navegador recuerda tus datos para la próxima compra.' },
  { cat: 'Compras', q: '¿Puedo pedir una cotización sin pagar?', a: 'Sí. En el carrito eliges “Pedir cotización”. Te llega al correo, la puedes descargar en PDF y no te compromete a nada.' },
  { cat: 'Compras', q: '¿Por qué algunos productos dicen “precio a consultar”?', a: 'Los precios de motos, vehículos y plantas cambian con frecuencia. Agrégalos a tu cotización y te enviamos el precio del día en menos de 24 horas.' },
  { cat: 'Compras', q: '¿Cómo sé en qué va mi pedido?', a: 'En “Seguir mi pedido” escribes tu número de pedido y los últimos 4 dígitos de tu teléfono. Ves cada paso: recibido, pago confirmado, preparando, listo y entregado.' },
  { cat: 'Pagos', q: '¿En qué monedas puedo pagar?', a: 'Dólares por Zelle, transferencia o efectivo en tienda, y bolívares por pago móvil a la tasa BCV del día.' },
  { cat: 'Pagos', q: '¿Pago en la página?', a: 'No cobramos en la web. Al confirmar recibes las instrucciones de pago con tu número de pedido, y un asesor verifica el pago antes de despachar.' },
  { cat: 'Pagos', q: '¿Cuánto tiempo reservan mi pedido?', a: 'Reservamos los productos por 48 horas mientras confirmamos el pago.' },
  { cat: 'Pagos', q: '¿Los precios de ferretería son en dólares?', a: 'Sí. Son precios de referencia en dólares a la tasa BCV del día, sin IVA. Puedes pagar en bolívares al cambio oficial.' },
  { cat: 'Entregas', q: '¿Cómo recibo mi compra?', a: 'Puedes retirar gratis en Lechería, pedir entrega local en Lechería, Barcelona, Puerto La Cruz y Guanta, o envío nacional por encomienda con cobro en destino.' },
  { cat: 'Entregas', q: '¿Y si compro una moto, un vehículo o una planta?', a: 'Un asesor coordina contigo la entrega, el traslado y los papeles. Puedes verlo en persona en la sede antes de llevártelo.' },
  { cat: 'Entregas', q: '¿Dónde están?', a: 'En Lechería, Anzoátegui. Te atendemos con cita para que veas el producto en persona.' },
  { cat: 'Garantía', q: '¿Los productos tienen garantía?', a: 'Sí, todos tienen garantía de fábrica según la marca y el producto. Las condiciones de cada uno vienen en la ficha o te las confirma tu asesor.' },
  { cat: 'Garantía', q: '¿Las motos incluyen seguro?', a: 'Todas las motos Vento salen con póliza de seguro. En las demás marcas te cotizamos la póliza junto con la moto.' },
  { cat: 'Productos', q: '¿Puedo ver el producto antes de comprar?', a: 'Sí. Agenda una visita por WhatsApp y te mostramos el producto en la sala de Lechería.' },
  { cat: 'Productos', q: '¿No encuentro lo que busco?', a: 'En ferretería tenemos más de 1.700 referencias en el buscador. Si no aparece, escríbenos por WhatsApp y lo buscamos por ti.' },
]

export const NEWS = [
  { slug: 'elegir-primera-moto', tag: 'Guía', date: '12 nov 2026', title: 'Cómo elegir tu primera moto', excerpt: 'Uso diario, presupuesto y cilindrada: las tres preguntas antes de comprar.', body: ['Antes de mirar colores, define para qué la vas a usar. Para ir al trabajo en ciudad, una 150 o 200 cc es suficiente y gasta poco.', 'Fija tu presupuesto total: moto, póliza, casco y la primera revisión. En ARIA te damos la cotización con todo incluido.', 'Revisa frenos, garantía y disponibilidad de repuestos. Una moto barata sin repuestos sale cara. (Texto de ejemplo.)'] },
  { slug: 'planta-o-solar', tag: 'Energía', date: '05 nov 2026', title: 'Planta eléctrica o inversor solar: cuál te conviene', excerpt: 'Potencia inmediata o ahorro a largo plazo. Te ayudamos a decidir.', body: ['La planta eléctrica da potencia inmediata y aguanta cargas grandes, pero consume combustible y requiere mantenimiento.', 'El inversor solar con baterías no hace ruido y reduce tu factura, pero la inversión inicial es mayor.', 'Para muchos negocios la mejor opción es combinar ambos. (Texto de ejemplo.)'] },
  { slug: 'mantenimiento-basico', tag: 'Taller', date: '28 oct 2026', title: 'Mantenimiento básico en cinco pasos', excerpt: 'Aceite, frenos, cadena, cauchos y luces: lo que debes revisar cada mes.', body: ['Cambia el aceite según el manual, normalmente cada 2.000 a 3.000 km en motos pequeñas.', 'Revisa pastillas de freno, tensión de la cadena, presión de los cauchos y que todas las luces funcionen.', 'Una revisión periódica en nuestro taller alarga la vida del vehículo. (Texto de ejemplo.)'] },
]

/* ---------- Compra en línea ---------- */
export const DELIVERY = [
  { id: 'Retiro en tienda', short: 'Gratis', detail: 'Retiras en nuestra sede de Lechería. Te avisamos por WhatsApp cuando esté listo.' },
  { id: 'Entrega local', short: 'Según la dirección', detail: 'Lechería, Barcelona, Puerto La Cruz y Guanta. Te confirmamos el costo antes de despachar.' },
  { id: 'Envío nacional', short: 'Cobro en destino', detail: 'A cualquier estado por la agencia de encomiendas que prefieras.' },
] as const

export const PAY_METHODS = [
  { id: 'Zelle', detail: 'Pago en dólares. Te enviamos el correo de destino con el recibo.' },
  { id: 'Pago móvil', detail: 'En bolívares a la tasa BCV del día. Datos bancarios en el recibo.' },
  { id: 'Transferencia', detail: 'Transferencia nacional o internacional en dólares.' },
  { id: 'Efectivo en tienda', detail: 'Pagas al retirar en Lechería, con cita previa.' },
] as const

export const payInfo = (city: string): Record<string, string> => ({
  Zelle: 'Envía el total a pagos@aria.com (dato de ejemplo) y responde el correo con el comprobante.',
  'Pago móvil': 'Banco de Venezuela, 0414 000 0000, RIF J-00000000-0 (datos de ejemplo). Monto en bolívares a la tasa BCV del día.',
  Transferencia: 'Te enviamos los datos bancarios al correo. Indica el número del pedido en la referencia.',
  'Efectivo en tienda': `Paga al retirar en ${city}. Agenda tu cita por WhatsApp.`,
})

export const STATES_VE = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital',
  'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira',
  'Trujillo', 'Yaracuy', 'Zulia',
]
