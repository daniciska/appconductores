// Panel · Documentos · Revisión de documentos
// Ruta: /admin/documentos
// Sin maqueta (panel web). Cola de lo que el agente de IA no aprobó solo; la decisión cambia en vivo
// el estado del conductor (y, si es el usuario de la demo, lo que ve en su app).
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';

import { useAhora, useColaDocumentos, useDerivado } from '@/datos/hooks';
import * as sel from '@/datos/selectores';
import type { DocumentoEnCola } from '@/datos/selectores';
import { useDemo } from '@/datos/tienda';
import type { MotivoRechazoId, TipoDocumentoId } from '@/datos/tipos';
import { fechaLarga, haceCuanto, iniciales, plural } from '@/datos/formato';
import {
  Aviso,
  Avatar,
  Boton,
  ControlSegmentado,
  EstadoVacio,
  FilaRadio,
  Insignia,
  PaginaPanel,
  Separador,
  Texto,
  Titulo,
  color,
  radio,
} from '@/ui';
import { Bot, Check, CircleCheck, CircleX, Eye, FileText, Hourglass, Image as IconoImagen, Inbox, Lock, X } from '@/ui/iconos';

import { registrarLectura } from './acciones';
import { NOMBRE_DOC_CON_ARTICULO, clavedoc, decididosRecientes, matchesDeConductor } from './datosPanel';
import { FilaElegible, ListaDetalle, TarjetaPanel, VentanaPanel, useAnchoPanel, useIrA } from './piezas';
import { prerevisar, type LecturaIA, type Prerevision } from './prerevision';
import { motivoSimple, motivosPara, queHacerMotivo } from '../documentos/textos';

type Vista = 'cola' | 'decididos';

interface Resultado {
  tono: 'exito' | 'neutro';
  titulo: string;
  texto: string;
  esUsuario: boolean;
}

export default function Documentos() {
  const cola = useColaDocumentos();
  const conPrerevision = useColaDocumentos(true);
  const enPrerevision = useMemo(() => conPrerevision.filter((d) => d.documento.etapa === 'ia'), [conPrerevision]);
  const decididos = useDerivado((s) => decididosRecientes(s));
  const { dosColumnas } = useAnchoPanel();
  const ahora = useAhora(15000);

  const [vista, setVista] = useState<Vista>('cola');
  const [elegido, setElegido] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const actual = cola.find((d) => clavedoc(d.duenoId, d.tipo) === elegido) ?? null;
  const arriba = useIrA();
  const alDetalle = useIrA();
  // Los documentos del conductor de la demo van primero, para encontrarlos rápido.
  const delUsuario = cola.filter((d) => d.duenoId === sel.ID_USUARIO);
  const deOtros = cola.filter((d) => d.duenoId !== sel.ID_USUARIO);
  const ordenada = [...delUsuario, ...deOtros];
  const elegir = (clave: string) => {
    setElegido(clave);
    setTimeout(() => alDetalle.ir(), 60);
  };

  // En escritorio siempre hay uno abierto: el elegido o el más antiguo de la cola.
  useEffect(() => {
    if (dosColumnas && !actual && ordenada.length > 0) setElegido(clavedoc(ordenada[0].duenoId, ordenada[0].tipo));
  }, [dosColumnas, actual, ordenada]);

  const alDecidir = (item: DocumentoEnCola, aprobado: boolean, motivo?: MotivoRechazoId) => {
    const s0 = useDemo.getState();
    const antes = sel.conductorVista(s0, item.duenoId)?.estadoVerificacion;
    const indice = ordenada.findIndex((d) => d.duenoId === item.duenoId && d.tipo === item.tipo);
    if (aprobado) s0.aprobarDocumento(item.duenoId, item.tipo);
    else if (motivo) s0.rechazarDocumento(item.duenoId, item.tipo, motivo);

    const s1 = useDemo.getState();
    const despues = sel.conductorVista(s1, item.duenoId);
    const nombreDoc = sel.tipoDocumentoPorId(s1, item.tipo).corto;
    const esUsuario = item.duenoId === sel.ID_USUARIO;
    const quien = esUsuario ? (despues?.nombres && despues.nombres !== 'Tú' ? despues.nombre : 'el conductor de la demo') : item.nombre;
    let texto = aprobado ? `Aprobaste ${NOMBRE_DOC_CON_ARTICULO[item.tipo]} de ${quien}.` : `No aprobaste ${NOMBRE_DOC_CON_ARTICULO[item.tipo]} de ${quien}. Verá el motivo en su app.`;
    let titulo = aprobado ? `${nombreDoc} aprobada` : `${nombreDoc}: no aprobado`;
    if (item.tipo === 'antecedentes') titulo = aprobado ? 'Antecedentes aprobados' : 'Antecedentes: no aprobados';
    if (aprobado && antes !== 'verificado' && despues?.estadoVerificacion === 'verificado') {
      const n = esUsuario ? sel.matchesDelUsuario(s1).length : matchesDeConductor(s1, item.duenoId).length;
      titulo = `${esUsuario ? 'El conductor de la demo' : item.nombre.split(' ')[0]} quedó verificado`;
      texto = `${texto} Ya tiene sus 4 documentos aprobados y ${n > 0 ? `entra al match: ${plural(n, 'match', 'matches')}.` : 'entra al match (por ahora sin coincidencias).'}`;
    }
    setResultado({ tono: aprobado ? 'exito' : 'neutro', titulo, texto, esUsuario });

    // Abre el siguiente de la cola (en celular vuelve a la lista).
    const restantes = ordenada.filter((d) => !(d.duenoId === item.duenoId && d.tipo === item.tipo));
    const siguiente = restantes[Math.min(indice, restantes.length - 1)];
    setElegido(dosColumnas && siguiente ? clavedoc(siguiente.duenoId, siguiente.tipo) : null);
    setTimeout(() => arriba.ir(true), 60);
  };

  const lista = (
    <>
      <ControlSegmentado
        etiquetaAccesible="Qué documentos ver"
        opciones={[
          { clave: 'cola', etiqueta: `En cola · ${cola.length}` },
          { clave: 'decididos', etiqueta: 'Decididos' },
        ]}
        valor={vista}
        onCambiar={setVista}
      />
      {vista === 'cola' ? (
        <>
          {enPrerevision.length > 0 ? (
            <View style={{ backgroundColor: color.superficieHundida, borderRadius: radio.campo, padding: 14, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator size="small" color={color.texto} />
                <Texto variante="etiqueta">El agente de IA está revisando</Texto>
              </View>
              {enPrerevision.map((d) => (
                <Texto key={clavedoc(d.duenoId, d.tipo)} variante="ayuda">
                  {NOMBRE_CORTO[d.tipo]} de {d.nombre}
                </Texto>
              ))}
            </View>
          ) : null}
          {cola.length === 0 ? (
            <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde }}>
              <EstadoVacio
                icono={Inbox}
                titulo="No hay documentos en la cola"
                texto="Cuando un conductor envíe su Hoja de Vida o sus antecedentes, aparecerán aquí."
              />
            </View>
          ) : (
            <>
              {delUsuario.length > 0 ? (
                <Texto variante="seccion" style={{ marginTop: 6, paddingHorizontal: 4 }}>
                  Conductor de la demo
                </Texto>
              ) : null}
              {delUsuario.map((d) => (
                <FilaCola key={clavedoc(d.duenoId, d.tipo)} item={d} ahora={ahora} elegida={clavedoc(d.duenoId, d.tipo) === elegido} onPress={() => elegir(clavedoc(d.duenoId, d.tipo))} />
              ))}
              {delUsuario.length > 0 && deOtros.length > 0 ? (
                <Texto variante="seccion" style={{ marginTop: 10, paddingHorizontal: 4 }}>
                  Otros conductores
                </Texto>
              ) : null}
              {deOtros.map((d) => (
                <FilaCola key={clavedoc(d.duenoId, d.tipo)} item={d} ahora={ahora} elegida={clavedoc(d.duenoId, d.tipo) === elegido} onPress={() => elegir(clavedoc(d.duenoId, d.tipo))} />
              ))}
            </>
          )}
        </>
      ) : decididos.length === 0 ? (
        <EstadoVacio icono={CircleCheck} titulo="Aún no hay decisiones" />
      ) : (
        <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde, paddingHorizontal: 16, paddingVertical: 4 }}>
          {decididos.map((d, i) => (
            <View key={d.clave}>
              {i > 0 ? <Separador /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingVertical: 10 }}>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Texto variante="cuerpo" peso={600} numberOfLines={1}>
                    {d.nombre}
                  </Texto>
                  <Texto variante="ayuda">
                    {NOMBRE_CORTO[d.tipo]} · {d.documento.quienDecidio === 'ia' ? 'Agente de IA' : 'Persona del equipo'} · {haceCuanto(d.documento.revisadoEn, ahora)}
                  </Texto>
                </View>
                {d.documento.estado === 'aprobado' ? <Insignia texto="Aprobado" tono="verde" /> : <Insignia texto="No aprobado" tono="roja" icono={null} />}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );

  const detalle =
    vista === 'cola' && actual ? (
      <View ref={alDetalle.ref} style={{ scrollMarginTop: 16 } as object}>
        <DetalleDocumento key={clavedoc(actual.duenoId, actual.tipo)} item={actual} ahora={ahora} onDecidir={alDecidir} />
      </View>
    ) : dosColumnas ? (
      <View style={{ backgroundColor: color.superficie, borderRadius: radio.tarjeta, borderWidth: 1, borderColor: color.borde, minHeight: 320, justifyContent: 'center' }}>
        <EstadoVacio
          icono={vista === 'cola' ? CircleCheck : FileText}
          titulo={vista === 'cola' ? 'Todo al día' : 'Historial de decisiones'}
          texto={vista === 'cola' ? 'No queda nada por revisar.' : 'Las decisiones del agente y del equipo, las más recientes primero.'}
        />
      </View>
    ) : null;

  return (
    <PaginaPanel titulo="Revisión de documentos" descripcion="Lo que el agente de IA no aprobó solo. Los más antiguos primero." anchoMaximo={1180}>
      <View ref={arriba.ref} style={{ position: 'absolute', top: -120, height: 1, width: 1 }} />
      {resultado ? (
        <Aviso
          tono={resultado.tono}
          icono={resultado.tono === 'exito' ? CircleCheck : CircleX}
          titulo={resultado.titulo}
          texto={resultado.texto}
          accion={
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {resultado.esUsuario ? (
                <Boton titulo="Ver como conductor" variante="oscuro" tamano="mediano" onPress={() => router.push('/conductor/inicio')} />
              ) : null}
              <Boton titulo="Cerrar" variante="texto" tamano="mediano" onPress={() => setResultado(null)} />
            </View>
          }
        />
      ) : null}
      {vista === 'decididos' ? (
        <View style={{ gap: 10, maxWidth: 760 }}>{lista}</View>
      ) : (
        <ListaDetalle lista={lista} detalle={detalle} hayElegido={!!actual} onVolver={() => setElegido(null)} textoVolver="Volver a la cola" anchoLista={340} />
      )}
    </PaginaPanel>
  );
}

const NOMBRE_CORTO: Record<TipoDocumentoId, string> = {
  cedula: 'Cédula',
  licencia: 'Licencia',
  hoja_vida: 'Hoja de Vida',
  antecedentes: 'Antecedentes',
};

function FilaCola({ item, elegida, onPress, ahora }: { item: DocumentoEnCola; elegida: boolean; onPress: () => void; ahora: number }) {
  const esUsuario = item.duenoId === sel.ID_USUARIO;
  return (
    <FilaElegible elegida={elegida} onPress={onPress} etiquetaAccesible={`${NOMBRE_CORTO[item.tipo]} de ${item.nombre}`}>
      <Avatar texto={iniciales(item.nombre)} tamano={40} tono={esUsuario ? 'acento' : 'claro'} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Texto variante="cuerpo" peso={700} numberOfLines={1} style={{ flexShrink: 1 }}>
            {NOMBRE_CORTO[item.tipo]}
          </Texto>
          {item.pidioOtraRevision ? <Insignia texto="Otra revisión" tono="amarilla" icono={null} /> : null}
        </View>
        <Texto variante="ayuda" numberOfLines={1}>
          {item.nombre}
          {esUsuario ? ' (demo)' : ''} · {haceCuanto(item.documento.otraRevisionEl ?? item.documento.enviadoEl, ahora)}
        </Texto>
      </View>
    </FilaElegible>
  );
}

// ---------------------------------------------------------------------------
// Detalle de un documento
// ---------------------------------------------------------------------------

function DetalleDocumento({
  item,
  ahora,
  onDecidir,
}: {
  item: DocumentoEnCola;
  ahora: number;
  onDecidir: (item: DocumentoEnCola, aprobado: boolean, motivo?: MotivoRechazoId) => void;
}) {
  const { escritorio } = useAnchoPanel();
  const conductor = useDerivado((s) => sel.conductorVista(s, item.duenoId));
  const nombreDeclarado = useDerivado((s) =>
    item.duenoId === sel.ID_USUARIO ? sel.nombreCompleto(s.cuenta) : (conductor?.nombre ?? ''),
  );
  const fechaDeclarada = useDerivado((s) =>
    item.duenoId === sel.ID_USUARIO ? s.conductor.fechaNacimiento : (sel.conductorFicticioPorId(s, item.duenoId)?.fechaNacimiento ?? ''),
  );
  const tipoDoc = useDerivado((s) => sel.tipoDocumentoPorId(s, item.tipo));
  const todosLosMotivos = useDemo((s) => s.catalogos.motivosRechazo);
  const motivos = useMemo(() => motivosPara(todosLosMotivos, item.tipo), [todosLosMotivos, item.tipo]);
  const diasPdf = useDemo((s) => s.ajustes.diasAntiguedadPdf);
  const [verArchivo, setVerArchivo] = useState(false);
  const [rechazando, setRechazando] = useState(false);

  const pre: Prerevision | null = useMemo(
    () =>
      conductor
        ? prerevisar({ conductor, nombreDeclarado, fechaNacimientoDeclarada: fechaDeclarada, tipo: item.tipo, documento: item.documento, diasAntiguedadPdf: diasPdf })
        : null,
    [conductor, nombreDeclarado, fechaDeclarada, item.tipo, item.documento, diasPdf],
  );
  // La propuesta de la IA, si aplica a este documento; si no, el primer motivo que aplica.
  const motivoInicial = (): MotivoRechazoId =>
    motivos.find((m) => m.id === pre?.propuesta)?.id ?? motivos[0]?.id ?? 'ilegible';
  const [motivo, setMotivo] = useState<MotivoRechazoId>(motivoInicial);

  if (!conductor || !pre) return null;
  const otros = sel.TIPOS_DOC_ORDEN.filter((t) => t !== item.tipo);
  const quedariaVerificado = otros.every((t) => conductor.documentos[t].estado === 'aprobado');
  const motivoElegido = motivos.find((m) => m.id === motivo);
  const tonoIA = pre.resultado === 'no_coincide' ? 'roja' : pre.resultado === 'persona' ? 'gris' : 'amarilla';

  const abrirArchivo = () => {
    registrarLectura(`Abrió el archivo de ${NOMBRE_DOC_CON_ARTICULO[item.tipo]} de ${conductor.nombre}`);
    setVerArchivo(true);
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Cabecera */}
      <TarjetaPanel>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar texto={iniciales(conductor.nombre)} tamano={52} tono={conductor.esUsuario ? 'acento' : 'oscuro'} />
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <Titulo nivel={2}>{tipoDoc.nombre}</Titulo>
            <Texto variante="secundario" tono="secundario">
              {conductor.nombre}
              {conductor.esUsuario ? ' · conductor de la demo' : ''} · enviado {haceCuanto(item.documento.otraRevisionEl ?? item.documento.enviadoEl, ahora)}
            </Texto>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Insignia texto="Espera a una persona" tono="amarilla" icono={Hourglass} />
          {item.pidioOtraRevision ? <Insignia texto="Pidió otra revisión" tono="gris" icono={null} /> : null}
          {quedariaVerificado ? <Insignia texto="Si lo apruebas, queda verificado" tono="verde" /> : null}
        </View>
      </TarjetaPanel>

      {/* Archivo */}
      <TarjetaPanel padding={16}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <MiniDocumento formato={tipoDoc.formato} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Texto variante="secundario" peso={700} numberOfLines={1}>
              {item.documento.nombreArchivo ?? 'archivo'}
            </Texto>
            <Texto variante="pequeno">
              {tipoDoc.formato === 'foto' ? 'Foto' : 'PDF'} · subido el {fechaLarga(item.documento.subidoEl)}
            </Texto>
          </View>
          <Boton titulo="Ver archivo" icono={Eye} variante="contorno" tamano="mediano" onPress={abrirArchivo} />
        </View>
      </TarjetaPanel>

      {/* Pre-revisión */}
      <TarjetaPanel titulo="Pre-revisión del agente de IA" derecha={<Insignia texto={pre.titulo} tono={tonoIA} icono={Bot} />}>
        <Texto variante="secundario" tono="suave">
          {pre.razon}
        </Texto>
        <TablaLecturas lecturas={pre.lecturas} />
        {pre.propuesta ? (
          <Texto variante="ayuda">
            Propone no aprobar:{' '}
            <Texto variante="ayuda" peso={700} tono="normal">
              {todosLosMotivos.find((m) => m.id === pre.propuesta)?.nombre}
            </Texto>
          </Texto>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Lock size={14} color={color.textoSecundario} strokeWidth={2} />
          <Texto variante="pequeno" style={{ flex: 1 }}>
            El agente solo propone y no copia anotaciones ni datos sensibles.
          </Texto>
        </View>
      </TarjetaPanel>

      {/* Conductor */}
      <TarjetaPanel titulo="Conductor">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 14 }}>
          <DatoCorto etiqueta="Comuna" valor={conductor.comuna ? `${conductor.comuna.nombre} · ${conductor.zona?.nombre ?? ''}` : 'Sin dirección'} />
          <DatoCorto etiqueta="Licencia declarada" valor={conductor.clasesDeclaradas.join(', ') || 'Sin dato'} />
          <DatoCorto etiqueta="Registrado" valor={conductor.registradoEl ? haceCuanto(conductor.registradoEl, ahora) : '—'} />
        </View>
        <View style={{ gap: 8 }}>
          <Texto variante="pequeno">Sus documentos</Texto>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {sel.TIPOS_DOC_ORDEN.map((t) => {
              const d = conductor.documentos[t];
              const tono = t === item.tipo ? 'oscura' : d.estado === 'aprobado' ? 'verde' : d.estado === 'rechazado' ? 'roja' : d.estado === 'en_revision' ? 'amarilla' : 'gris';
              return <Insignia key={t} texto={NOMBRE_CORTO[t]} tono={tono} icono={d.estado === 'aprobado' && t !== item.tipo ? 'check' : null} />;
            })}
          </View>
        </View>
      </TarjetaPanel>

      {/* Decisión */}
      <View
        style={{
          flexDirection: escritorio ? 'row' : 'column-reverse',
          gap: 10,
          justifyContent: 'flex-end',
          backgroundColor: color.superficie,
          borderWidth: 1,
          borderColor: color.borde,
          borderRadius: radio.tarjeta,
          padding: 16,
          alignItems: escritorio ? 'center' : 'stretch',
        }}>
        {escritorio ? (
          <Texto variante="ayuda" style={{ flex: 1 }}>
            La decisión queda registrada con tu nombre.
          </Texto>
        ) : null}
        <Boton titulo="No aprobar" icono={X} variante="contorno" tamano="mediano" anchoCompleto={!escritorio} onPress={() => {
          setMotivo(motivoInicial());
          setRechazando(true);
        }} />
        <Boton titulo="Aprobar" icono={Check} variante="oscuro" tamano="mediano" anchoCompleto={!escritorio} onPress={() => onDecidir(item, true)} />
      </View>

      <VentanaPanel
        visible={verArchivo}
        onCerrar={() => setVerArchivo(false)}
        titulo={tipoDoc.nombre}
        descripcion={`${conductor.nombre} · ${item.documento.nombreArchivo ?? ''}`}
        ancho={560}
        pie={<Boton titulo="Cerrar" variante="contorno" onPress={() => setVerArchivo(false)} />}>
        <DocumentoSimulado formato={tipoDoc.formato} nombre={conductor.nombre} />
        <Texto variante="pequeno" centrado>
          Demo: no se sube ningún archivo. Cada apertura queda en el registro del equipo.
        </Texto>
      </VentanaPanel>

      <VentanaPanel
        visible={rechazando}
        onCerrar={() => setRechazando(false)}
        titulo="¿Por qué no se aprueba?"
        descripcion={`${tipoDoc.nombre} de ${conductor.nombre}`}
        pie={
          <>
            <Boton
              titulo="No aprobar"
              variante="peligro"
              onPress={() => {
                setRechazando(false);
                onDecidir(item, false, motivo);
              }}
            />
            <Boton titulo="Cancelar" variante="contorno" onPress={() => setRechazando(false)} />
          </>
        }>
        {motivos.map((m) => (
          <FilaRadio
            key={m.id}
            titulo={m.nombre}
            seleccionada={m.id === motivo}
            onPress={() => setMotivo(m.id)}
            extra={m.id === pre.propuesta ? <Insignia texto="Propuesta IA" tono="gris" icono={Bot} /> : undefined}
          />
        ))}
        {motivoElegido ? (
          <Aviso
            icono="info"
            titulo="El conductor verá"
            texto={`${motivoSimple(motivoElegido.id, item.tipo, diasPdf)} ${queHacerMotivo(motivoElegido, item.tipo, diasPdf) ?? ''}`.trim()}
          />
        ) : null}
      </VentanaPanel>
    </View>
  );
}

function DatoCorto({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={{ gap: 3, minWidth: 140 }}>
      <Texto variante="pequeno">{etiqueta}</Texto>
      <Texto variante="secundario" peso={600}>
        {valor}
      </Texto>
    </View>
  );
}

function TablaLecturas({ lecturas }: { lecturas: LecturaIA[] }) {
  const { escritorio } = useAnchoPanel();
  return (
    <View style={{ borderWidth: 1, borderColor: color.borde, borderRadius: radio.campo, overflow: 'hidden' }}>
      {escritorio ? (
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: color.fondo }}>
          <Texto variante="seccion" style={{ flex: 1 }}>Dato</Texto>
          <Texto variante="seccion" style={{ flex: 1.4 }}>Leyó</Texto>
          <Texto variante="seccion" style={{ flex: 1.4 }}>Declarado</Texto>
          <View style={{ width: 22 }} />
        </View>
      ) : null}
      {lecturas.map((l, i) => {
        const Icono = l.coincide === true ? Check : l.coincide === false ? X : null;
        const tinte = l.coincide === true ? color.exito : color.error;
        const marca = (
          <View
            aria-label={l.coincide === true ? 'Coincide' : l.coincide === false ? 'No coincide' : 'Sin comparar'}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: l.coincide === true ? color.exitoFondo : l.coincide === false ? color.errorFondo : color.fondo,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {Icono ? <Icono size={13} color={tinte} strokeWidth={3} /> : <View style={{ width: 8, height: 2, borderRadius: 1, backgroundColor: color.textoDeshabilitado }} />}
          </View>
        );
        return (
          <View key={l.dato} style={{ borderTopWidth: i === 0 && !escritorio ? 0 : 1, borderTopColor: color.separador }}>
            {escritorio ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, minHeight: 48 }}>
                <Texto variante="secundario" tono="secundario" style={{ flex: 1 }}>
                  {l.dato}
                </Texto>
                <View style={{ flex: 1.4, gap: 1 }}>
                  <Texto variante="secundario" peso={600}>
                    {l.leyo}
                  </Texto>
                  {l.nota ? <Texto variante="pequeno">{l.nota}</Texto> : null}
                </View>
                <Texto variante="secundario" style={{ flex: 1.4 }}>
                  {l.declarado}
                </Texto>
                {marca}
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Texto variante="pequeno">{l.dato}</Texto>
                  <Texto variante="secundario" peso={600}>
                    {l.leyo}
                  </Texto>
                  <Texto variante="pequeno">
                    Declarado: {l.declarado}
                    {l.nota ? ` · ${l.nota}` : ''}
                  </Texto>
                </View>
                {marca}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/** Miniatura del documento (foto o PDF) dibujada con cajas: en la demo no hay archivos. */
function MiniDocumento({ formato }: { formato: 'foto' | 'pdf' }) {
  const Icono = formato === 'foto' ? IconoImagen : FileText;
  return (
    <View
      aria-hidden
      style={{
        width: formato === 'foto' ? 72 : 52,
        height: formato === 'foto' ? 48 : 64,
        borderRadius: radio.icono,
        backgroundColor: color.fondo,
        borderWidth: 1,
        borderColor: color.borde,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Icono size={22} color={color.textoSecundario} strokeWidth={1.8} />
    </View>
  );
}

/** Documento simulado en grande (ventana "Ver archivo"). */
function DocumentoSimulado({ formato, nombre }: { formato: 'foto' | 'pdf'; nombre: string }) {
  const linea = (ancho: `${number}%`, alto = 8, oscuro = false) => (
    <View style={{ width: ancho, height: alto, borderRadius: 4, backgroundColor: oscuro ? '#CFCFCF' : color.segmentado }} />
  );
  if (formato === 'foto') {
    return (
      <View style={{ aspectRatio: 1.58, borderRadius: 16, backgroundColor: '#F1F3F4', borderWidth: 1, borderColor: color.borde, padding: 18, flexDirection: 'row', gap: 16 }}>
        <View style={{ width: '28%', borderRadius: 10, backgroundColor: color.segmentado, alignItems: 'center', justifyContent: 'center' }}>
          <Avatar texto={iniciales(nombre)} tamano={44} tono="claro" forma="circulo" />
        </View>
        <View style={{ flex: 1, gap: 10, justifyContent: 'center' }}>
          {linea('50%', 10, true)}
          <Texto variante="secundario" peso={700}>
            {nombre.toUpperCase()}
          </Texto>
          {linea('80%')}
          {linea('60%')}
          {linea('70%')}
          {linea('40%')}
        </View>
      </View>
    );
  }
  return (
    <View style={{ borderRadius: 12, backgroundColor: color.superficie, borderWidth: 1, borderColor: color.borde, padding: 22, gap: 10 }}>
      {linea('40%', 12, true)}
      {linea('65%', 8, true)}
      <View style={{ height: 6 }} />
      <Texto variante="secundario" peso={700}>
        {nombre.toUpperCase()}
      </Texto>
      {linea('90%')}
      {linea('85%')}
      {linea('70%')}
      <View style={{ height: 6 }} />
      <View style={{ backgroundColor: color.fondo, borderRadius: 8, padding: 12, alignItems: 'center' }}>
        <Texto variante="pequeno">Contenido oculto en la demo</Texto>
      </View>
      {linea('55%')}
      {linea('30%')}
    </View>
  );
}
