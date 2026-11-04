// Panel · Resumen
// Ruta: /admin
// Sin maqueta (panel web). Cifras, lo pendiente, la configuración vigente y las últimas acciones del equipo.
import { View } from 'react-native';
import { router, type Href } from 'expo-router';

import { useAhora, useColaDocumentos, useDerivado, useNegociosActivos, useReportesAbiertos, useResumenPanel } from '@/datos/hooks';
import { useDemo } from '@/datos/tienda';
import { haceCuanto, iniciales, plural } from '@/datos/formato';
import { Avatar, Boton, PaginaPanel, Presionable, Separador, Texto, color, radio, type LucideIcon } from '@/ui';
import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  FileCheck,
  Flag,
  ListChecks,
  Settings,
  SlidersHorizontal,
  Smartphone,
  UserRoundX,
} from '@/ui/iconos';

import { Cifra, IconoCuadro, TarjetaPanel, useAnchoPanel } from './piezas';

export default function Resumen() {
  const r = useResumenPanel();
  const cola = useColaDocumentos();
  const reportes = useReportesAbiertos();
  const negocios = useNegociosActivos();
  const umbral = useDemo((s) => s.reglas.umbral);
  const ajustes = useDemo((s) => s.ajustes);
  const acciones = useDemo((s) => s.accionesEquipo);
  const conObservaciones = useDerivado((s) => s.conductores.filter((c) => c.estadoVerificacion === 'con_observaciones').length + (s.conductor.estadoVerificacion === 'con_observaciones' ? 1 : 0));
  const ahora = useAhora(30000);
  const { escritorio } = useAnchoPanel();
  const masAntiguo = cola[0]?.documento.otraRevisionEl ?? cola[0]?.documento.enviadoEl;

  const pendientes: { icono: LucideIcon; titulo: string; detalle: string; href: Href; urgente: boolean }[] = [
    {
      icono: FileCheck,
      titulo: cola.length ? `${plural(cola.length, 'documento espera', 'documentos esperan')} revisión` : 'Sin documentos por revisar',
      detalle: cola.length ? `El más antiguo llegó ${haceCuanto(masAntiguo, ahora)}` : 'La cola está al día',
      href: '/admin/documentos',
      urgente: cola.length > 0,
    },
    {
      icono: Flag,
      titulo: reportes.length ? `${plural(reportes.length, 'reporte abierto', 'reportes abiertos')}` : 'Sin reportes abiertos',
      detalle: reportes.length ? `El más antiguo llegó ${haceCuanto(reportes[0]?.reportadoEl, ahora)}` : 'Nada que resolver',
      href: '/admin/reportes',
      urgente: reportes.length > 0,
    },
    {
      icono: UserRoundX,
      titulo: `${plural(conObservaciones, 'conductor', 'conductores')} con observaciones`,
      detalle: 'Deben subir de nuevo un documento',
      href: '/admin/conductores',
      urgente: false,
    },
  ];

  return (
    <PaginaPanel titulo="Resumen" descripcion="Cómo va Dale Contacto hoy. Todo son datos de ejemplo.">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Cifra
          etiqueta="Documentos en cola"
          valor={r.documentosEnCola}
          detalle={r.documentosEnCola ? `El más antiguo ${haceCuanto(masAntiguo, ahora)}` : 'Todo al día'}
          onPress={() => router.navigate('/admin/documentos')}
        />
        <Cifra etiqueta="Conductores" valor={r.conductores} detalle={`${plural(r.verificados, 'verificado', 'verificados')} · ${plural(r.incompletos, 'incompleto', 'incompletos')}`} onPress={() => router.navigate('/admin/conductores')} />
        <Cifra etiqueta="Matches vigentes" valor={r.matches} detalle={`Umbral ${umbral} %`} onPress={() => router.navigate('/admin/match')} />
        <Cifra etiqueta="Búsquedas activas" valor={r.busquedasActivas} detalle={`${r.ofertasEnBolsa} en la bolsa · ${r.titulares} titulares`} />
      </View>

      <View style={{ flexDirection: escritorio ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: escritorio ? 1.15 : undefined, width: escritorio ? undefined : '100%', gap: 16 }}>
          <TarjetaPanel titulo="Pendiente" separacion={4}>
            {pendientes.map((p, i) => (
              <View key={p.titulo}>
                {i > 0 ? <Separador sangria={48} /> : null}
                <Presionable
                  role="link"
                  aria-label={p.titulo}
                  onPress={() => router.navigate(p.href)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 10 }}>
                  <IconoCuadro icono={p.urgente ? p.icono : p.icono === FileCheck || p.icono === Flag ? CircleCheck : p.icono} tono={p.urgente ? 'acento' : 'neutro'} />
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Texto variante="cuerpo" peso={600}>
                      {p.titulo}
                    </Texto>
                    <Texto variante="ayuda">{p.detalle}</Texto>
                  </View>
                  <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
                </Presionable>
              </View>
            ))}
          </TarjetaPanel>

          <TarjetaPanel titulo="Configuración vigente" descripcion="Lo que hoy usa la app. Cambia en vivo." separacion={4}>
            <FilaConfig icono={SlidersHorizontal} etiqueta="Umbral del match" valor={`${umbral} %`} href="/admin/match" />
            <Separador sangria={48} />
            <FilaConfig icono={ListChecks} etiqueta="Negocios activos" valor={negocios.map((n) => n.nombre).join(', ') || 'Ninguno'} href="/admin/catalogos" />
            <Separador sangria={48} />
            <FilaConfig icono={Settings} etiqueta="Bolsa de trabajo" valor={ajustes.bolsaActiva ? 'Encendida' : 'Apagada'} href="/admin/ajustes" />
            <Separador sangria={48} />
            <FilaConfig icono={Settings} etiqueta="Validar campos obligatorios" valor={ajustes.validarObligatorios ? 'Encendido' : 'Apagado'} href="/admin/ajustes" />
          </TarjetaPanel>
        </View>

        <View style={{ flex: escritorio ? 1 : undefined, width: escritorio ? undefined : '100%', gap: 16 }}>
          <View style={{ backgroundColor: color.oscuro, borderRadius: radio.tarjeta, padding: 20, gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: radio.icono, backgroundColor: color.acento, alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={18} color={color.texto} strokeWidth={2} />
              </View>
              <Texto variante="fuerte" tono="blanco">
                Prueba el ciclo completo
              </Texto>
            </View>
            {[
              'Entra como conductor, completa tu perfil y envía tus documentos.',
              'Aquí, en Documentos, aprueba la Hoja de Vida y los antecedentes.',
              'Vuelve a la app del conductor: ya ves tus matches.',
            ].map((t, i) => (
              <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <Texto variante="pequeno" tono="blanco" peso={700}>
                    {i + 1}
                  </Texto>
                </View>
                <Texto variante="secundario" style={{ flex: 1, color: '#D9D9D9' }}>
                  {t}
                </Texto>
              </View>
            ))}
            <Boton titulo="Abrir la app del conductor" variante="principal" tamano="mediano" iconoDerecha={ArrowRight} onPress={() => router.push('/conductor')} />
          </View>

          <TarjetaPanel titulo="Últimas acciones del equipo" derecha={<Boton titulo="Ver todo" variante="texto" tamano="mediano" onPress={() => router.navigate('/admin/equipo')} />} separacion={4}>
            {acciones.slice(0, 6).map((a, i) => (
              <View key={a.id}>
                {i > 0 ? <Separador sangria={44} /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 }}>
                  <Avatar texto={a.quien.startsWith('Tú') ? 'TÚ' : iniciales(a.quien)} tamano={32} forma="circulo" tono={a.quien.startsWith('Tú') ? 'acento' : 'claro'} />
                  <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                    <Texto variante="secundario" peso={600}>
                      {a.que}
                    </Texto>
                    <Texto variante="pequeno">
                      {a.quien} · {haceCuanto(a.fecha, ahora)}
                    </Texto>
                  </View>
                </View>
              </View>
            ))}
          </TarjetaPanel>
        </View>
      </View>
    </PaginaPanel>
  );
}

function FilaConfig({ icono, etiqueta, valor, href }: { icono: LucideIcon; etiqueta: string; valor: string; href: Href }) {
  return (
    <Presionable
      role="link"
      aria-label={`${etiqueta}: ${valor}`}
      onPress={() => router.navigate(href)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 }}>
      <IconoCuadro icono={icono} />
      <Texto variante="secundario" tono="secundario" style={{ flex: 1 }}>
        {etiqueta}
      </Texto>
      <Texto variante="secundario" peso={700} style={{ textAlign: 'right', flexShrink: 1 }}>
        {valor}
      </Texto>
      <ChevronRight size={18} color={color.textoSecundario} strokeWidth={2} />
    </Presionable>
  );
}
