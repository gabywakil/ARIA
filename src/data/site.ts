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
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/aliados', label: 'Aliados' },
  { to: '/contacto', label: 'Contacto' },
]

export const BRANDS = ['Vento', 'Forza', 'Aichi', 'HJM', 'Loncin', 'Hisun', 'Lifan', 'ZX Auto', 'Toyota', 'Nissan', 'GAC', 'Hyundai GD Power', 'Cummins', 'Greenenergy', 'Tolsen', 'Nexon', 'ConstruY']

export const STEPS = [
  { title: 'Elige', text: 'Explora el catálogo, compara fichas técnicas y precios.' },
  { title: 'Cotiza', text: 'Agrega al carrito y pide tu cotización sin compromiso.' },
  { title: 'Factura', text: 'Genera tu factura con tus datos en un minuto.' },
  { title: 'Paga', text: 'Zelle, pago móvil, transferencia o efectivo en tienda.' },
  { title: 'Recibe', text: 'Descarga tu recibo y coordinamos la entrega contigo.' },
]

export const SERVICES = [
  { icon: 'card', title: 'Financiación', text: 'Compra tu moto o vehículo en cuotas, con inicial desde 30 %.' },
  { icon: 'shield', title: 'Póliza y garantía', text: 'Las motos Vento salen aseguradas. Todo tiene garantía de fábrica.' },
  { icon: 'truck', title: 'Entrega coordinada', text: 'Despacho a todo el país con seguimiento hasta tu puerta.' },
  { icon: 'wrench', title: 'Servicio técnico', text: 'Mantenimiento, diagnóstico y repuestos originales.' },
  { icon: 'bolt', title: 'Alquiler de plantas', text: 'Por día, semana o mes, con transporte e instalación.' },
  { icon: 'users', title: 'Asesoría', text: 'Un asesor te ayuda a elegir y cotizar sin compromiso.' },
] as const

export const FAQ = [
  { q: '¿Las motos incluyen seguro?', a: 'Todas las motos Vento salen con póliza de seguro. En las demás marcas te cotizamos la póliza junto con la moto.' },
  { q: '¿Por qué algunos productos dicen “precio a consultar”?', a: 'Los precios de motos, vehículos y plantas cambian con frecuencia. Agrégalos a tu cotización y te enviamos el precio del día en menos de 24 horas.' },
  { q: '¿Puedo pedir una cotización sin pagar?', a: 'Sí. Agrega los productos al carrito y elige “Solicitar cotización”. Te llega al correo y la puedes descargar en PDF.' },
  { q: '¿Cómo recibo mi factura?', a: 'Se genera en la página al confirmar el pedido. La descargas en PDF y una copia llega a tu correo.' },
  { q: '¿Los precios de ferretería son en dólares?', a: 'Sí. Son precios de referencia en dólares a la tasa BCV del día, sin IVA. Puedes pagar en bolívares al cambio oficial.' },
  { q: '¿En qué monedas puedo pagar?', a: 'Dólares por Zelle, transferencia o efectivo, y bolívares por pago móvil a la tasa del día.' },
  { q: '¿Dónde están?', a: 'En Lechería, Anzoátegui. Te atendemos con cita para que veas el producto en persona.' },
]

export const NEWS = [
  { slug: 'elegir-primera-moto', tag: 'Guía', date: '12 nov 2026', title: 'Cómo elegir tu primera moto', excerpt: 'Uso diario, presupuesto y cilindrada: las tres preguntas antes de comprar.', body: ['Antes de mirar colores, define para qué la vas a usar. Para ir al trabajo en ciudad, una 150 o 200 cc es suficiente y gasta poco.', 'Fija tu presupuesto total: moto, póliza, casco y la primera revisión. En ARIA te damos la cotización con todo incluido.', 'Revisa frenos, garantía y disponibilidad de repuestos. Una moto barata sin repuestos sale cara. (Texto de ejemplo.)'] },
  { slug: 'planta-o-solar', tag: 'Energía', date: '05 nov 2026', title: 'Planta eléctrica o inversor solar: cuál te conviene', excerpt: 'Potencia inmediata o ahorro a largo plazo. Te ayudamos a decidir.', body: ['La planta eléctrica da potencia inmediata y aguanta cargas grandes, pero consume combustible y requiere mantenimiento.', 'El inversor solar con baterías no hace ruido y reduce tu factura, pero la inversión inicial es mayor.', 'Para muchos negocios la mejor opción es combinar ambos. (Texto de ejemplo.)'] },
  { slug: 'mantenimiento-basico', tag: 'Taller', date: '28 oct 2026', title: 'Mantenimiento básico en cinco pasos', excerpt: 'Aceite, frenos, cadena, cauchos y luces: lo que debes revisar cada mes.', body: ['Cambia el aceite según el manual, normalmente cada 2.000 a 3.000 km en motos pequeñas.', 'Revisa pastillas de freno, tensión de la cadena, presión de los cauchos y que todas las luces funcionen.', 'Una revisión periódica en nuestro taller alarga la vida del vehículo. (Texto de ejemplo.)'] },
]
