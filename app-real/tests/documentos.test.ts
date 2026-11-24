/// <reference types="node" />
// Documentos (Paso 5), lo puro: catálogo, fechas, estado de cada tipo, avisos de vencimiento, textos,
// archivos y la autorización de revisión (src/datos/documentos.ts) y el Paso 5 en el perfil (perfil.ts).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  archivosSobrantes,
  errorArchivo,
  errorFechaDocumento,
  fechaCorta,
  fechaDeTexto,
  hayTextoRevision,
  hoyEnChile,
  lineaFecha,
  mesesAviso,
  mimeDeArchivo,
  pesoLegible,
  resumenDocumentos,
  rutaArchivo,
  sumarDias,
  sumarMeses,
  textoAviso,
  textoDocumentosPorRenovar,
  textoEstado,
  textoRevisionPendiente,
  textoTrasSubir,
  tituloBotonSubir,
  vistaTipo,
  type DocumentoReal,
} from '../src/datos/documentos.ts';
import { mapearPerfil, type FilasPerfil } from '../src/datos/perfil.ts';
import { avancePerfil } from '../../aplicacion/src/datos/puerto/derivados.ts';

import { BASE, catalogosLeidos } from './base.ts';

const c = catalogosLeidos();
const tipo = (clave: string) => c.tiposDocumento.find((t) => t.clave === clave)!;
const HOY = '2026-11-24';
const UID = 'aaaaaaaa-1111-4000-8000-00000000000a';
let n = 0;
function doc(clave: string, cambios: Partial<DocumentoReal> = {}): DocumentoReal {
  n += 1;
  return {
    id: n,
    tipoId: tipo(clave).id,
    estado: 'aprobado',
    subidoEn: `2026-11-${String(10 + n).padStart(2, '0')}T12:00:00Z`,
    emitidoEn: null,
    venceEn: null,
    revisadoEn: '2026-11-20T12:00:00Z',
    archivoTipo: 'image/jpeg',
    ruta: `${UID}/0000000${n}-0000-4000-8000-000000000000.jpg`,
    ...cambios,
  };
}

describe('catálogo de documentos (de la base)', () => {
  it('los 4 del conductor, en orden, con su fecha y los PDF de 30 días o menos', () => {
    assert.deepEqual(
      c.tiposDocumento.map((t) => [t.clave, t.formato, t.fechaPedida, t.antiguedadMaximaDias]),
      [
        ['cedula', 'foto', 'vencimiento', null],
        ['licencia', 'foto', 'vencimiento', null],
        ['hoja_vida', 'pdf', 'emision', 30],
        ['antecedentes', 'pdf', 'emision', 30],
      ],
    );
    assert.equal(tipo('licencia').etiquetaFecha, 'Fecha del próximo control');
    assert.equal(c.mesesAvisoDocumentos, 3);
  });
  it('lo inactivo o de titulares no aparece; el ajuste de meses mal escrito vale 3', () => {
    const otros = [
      { ...BASE.tipos_documento[0], id: 9, clave: 'apagado', activo: false },
      { ...BASE.tipos_documento[0], id: 10, clave: 'cedula_titular', para_quien: 'titular' },
    ];
    const t = catalogosLeidos();
    assert.equal(t.tiposDocumento.length, 4);
    assert.ok(!otros.some((o) => t.tiposDocumento.some((x) => x.clave === o.clave)));
    assert.deepEqual([mesesAviso('4'), mesesAviso(0), mesesAviso('x'), mesesAviso(null), mesesAviso(36)], [4, 3, 3, 3, 3]);
  });
});

describe('fechas (el día de hoy en Chile, como la base)', () => {
  it('sumar meses y días como Postgres; hoy en Chile', () => {
    assert.equal(sumarMeses('2026-01-31', 1), '2026-02-28');
    assert.equal(sumarMeses('2026-11-24', 3), '2027-02-24');
    assert.equal(sumarDias('2026-03-01', -1), '2026-02-28');
    // 24-nov 02:00 UTC es todavía el 23-nov en Chile.
    assert.equal(hoyEnChile(Date.parse('2026-11-24T02:00:00Z')), '2026-11-23');
    assert.equal(fechaCorta('2027-02-10'), '10/02/2027');
    assert.equal(fechaDeTexto('31/02/2027'), null);
    assert.equal(fechaDeTexto('10/02/2027'), '2027-02-10');
  });
  it('vencimiento: hoy o después, no absurda', () => {
    const ced = tipo('cedula');
    assert.equal(errorFechaDocumento('', ced, HOY), 'Anota la fecha de vencimiento.');
    assert.equal(errorFechaDocumento('10/02', ced, HOY), 'Revisa la fecha.');
    assert.equal(errorFechaDocumento('23/11/2026', ced, HOY), 'Ese documento ya venció. Sube uno vigente.');
    assert.equal(errorFechaDocumento('24/11/2026', ced, HOY), null, 'vence hoy: todavía vale');
    assert.equal(errorFechaDocumento('01/01/2060', ced, HOY), 'Revisa la fecha.');
    assert.equal(errorFechaDocumento('10/02/2030', ced, HOY), null);
  });
  it('emisión: no futura y de 30 días o menos', () => {
    const hv = tipo('hoja_vida');
    assert.equal(errorFechaDocumento('', hv, HOY), 'Anota la fecha de emisión.');
    assert.equal(errorFechaDocumento('25/11/2026', hv, HOY), 'La fecha de emisión no puede ser futura.');
    assert.equal(errorFechaDocumento('25/10/2026', hv, HOY), null, 'justo 30 días');
    assert.equal(errorFechaDocumento('24/10/2026', hv, HOY), 'Debe tener 30 días o menos. Saca uno nuevo.');
  });
});

describe('estado de cada documento', () => {
  const meses = 3;
  it('falta, aprobado, vence pronto y vencido', () => {
    const ced = tipo('cedula');
    assert.equal(vistaTipo(ced, [], HOY, meses).estado, 'falta');
    assert.equal(vistaTipo(ced, [doc('cedula', { venceEn: '2030-01-01' })], HOY, meses).estado, 'aprobado');
    const pronto = vistaTipo(ced, [doc('cedula', { venceEn: '2027-02-24' })], HOY, meses);
    assert.deepEqual([pronto.estado, pronto.listo], ['vence_pronto', true], 'justo 3 meses antes: ya se avisa');
    assert.equal(vistaTipo(ced, [doc('cedula', { venceEn: '2027-02-25' })], HOY, meses).estado, 'aprobado');
    const vencido = vistaTipo(ced, [doc('cedula', { venceEn: '2026-11-23' })], HOY, meses);
    assert.deepEqual([vencido.estado, vencido.listo], ['vencido', false], 'aprobado con la fecha pasada (antes de la tarea diaria)');
    assert.equal(vistaTipo(ced, [doc('cedula', { estado: 'vencido', venceEn: '2026-11-01' })], HOY, meses).estado, 'vencido');
  });
  it('con otro método: en revisión, no aprobado, y una renovación en revisión sigue valiendo', () => {
    const lic = tipo('licencia');
    assert.deepEqual(
      [vistaTipo(lic, [doc('licencia', { estado: 'en_revision' })], HOY, meses).estado, vistaTipo(lic, [doc('licencia', { estado: 'en_revision' })], HOY, meses).listo],
      ['en_revision', false],
    );
    assert.equal(vistaTipo(lic, [doc('licencia', { estado: 'no_aprobado' })], HOY, meses).estado, 'no_aprobado');
    const vieja = doc('licencia', { venceEn: '2027-01-10' });
    const nueva = doc('licencia', { estado: 'en_revision', venceEn: '2031-01-10' });
    const v = vistaTipo(lic, [nueva, vieja], HOY, meses);
    assert.deepEqual([v.estado, v.listo, v.documento?.id], ['renovacion_en_revision', true, vieja.id]);
  });
  it('resumen: listos, completos y avisos ordenados por fecha', () => {
    const docs = [
      doc('cedula', { venceEn: '2027-01-15' }),
      doc('licencia', { venceEn: '2026-12-30' }),
      doc('hoja_vida', { archivoTipo: 'application/pdf', emitidoEn: '2026-11-20' }),
    ];
    let r = resumenDocumentos(c.tiposDocumento, docs, HOY, meses);
    assert.deepEqual([r.listos, r.total, r.subidos, r.completos], [3, 4, 3, false]);
    assert.deepEqual(r.avisos.map((a) => a.tipo.clave), ['licencia', 'cedula']);
    r = resumenDocumentos(c.tiposDocumento, [...docs, doc('antecedentes', { archivoTipo: 'application/pdf', emitidoEn: '2026-11-21' })], HOY, meses);
    assert.equal(r.completos, true);
    assert.equal(resumenDocumentos([], [], HOY, meses).completos, false, 'sin catálogo no se da por listo');
  });
});

describe('textos', () => {
  it('el aviso dentro de la app', () => {
    const v = vistaTipo(tipo('licencia'), [doc('licencia', { venceEn: '2027-02-10' })], HOY, 3);
    assert.equal(textoAviso(v), 'Tu licencia vence el 10/02/2027. Renuévala y súbela de nuevo.');
    const a = vistaTipo(tipo('antecedentes'), [doc('antecedentes', { estado: 'vencido', venceEn: '2026-11-01' })], HOY, 3);
    assert.equal(textoAviso(a), 'Tu certificado de antecedentes venció el 01/11/2026. Súbelo de nuevo.');
  });
  it('estados, fechas y el mensaje tras subir', () => {
    const ced = tipo('cedula');
    assert.equal(textoEstado(vistaTipo(ced, [doc('cedula', { venceEn: '2030-03-01' })], HOY, 3)), 'Aprobada');
    assert.equal(textoEstado(vistaTipo(tipo('antecedentes'), [doc('antecedentes', { emitidoEn: '2026-11-20' })], HOY, 3)), 'Aprobado');
    assert.equal(lineaFecha(vistaTipo(ced, [doc('cedula', { venceEn: '2030-03-01' })], HOY, 3)), 'Vence el 01/03/2030');
    assert.equal(lineaFecha(vistaTipo(tipo('licencia'), [doc('licencia', { venceEn: '2030-03-01' })], HOY, 3)), 'Próximo control el 01/03/2030');
    assert.equal(lineaFecha(vistaTipo(tipo('hoja_vida'), [doc('hoja_vida', { emitidoEn: '2026-11-20' })], HOY, 3)), 'Emitido el 20/11/2026');
    assert.equal(textoTrasSubir(ced, 'aprobado'), 'Cédula: aprobada.');
    assert.equal(textoTrasSubir(tipo('antecedentes'), 'en_revision'), 'Antecedentes: enviado a revisión.');
    assert.equal(textoTrasSubir(ced, null), 'Cédula: enviada a revisión.');
  });
});

describe('pantalla de subir e Inicio', () => {
  it('el peso del archivo nunca dice "0,0 MB" ni "10,0 MB" junto al error de más de 10 MB', () => {
    assert.equal(pesoLegible(20 * 1024), '20 KB');
    assert.equal(pesoLegible(300), '1 KB');
    assert.equal(pesoLegible(1.74 * 1024 * 1024), '1,8 MB');
    assert.equal(pesoLegible(10 * 1024 * 1024 + 10_000), '10,1 MB');
    assert.equal(pesoLegible(10 * 1024 * 1024), '10,0 MB');
  });
  it('el botón de subir respeta los nombres propios', () => {
    assert.deepEqual(
      ['Cédula', 'Licencia', 'Hoja de Vida', 'Antecedentes'].map(tituloBotonSubir),
      ['Subir cédula', 'Subir licencia', 'Subir Hoja de Vida', 'Subir antecedentes'],
    );
  });
  it('Inicio: verificado al que se le venció la licencia (no es alguien que recién se registra)', () => {
    const cuatro = (licencia: Partial<DocumentoReal>) => [
      doc('cedula', { venceEn: '2030-01-01' }),
      doc('licencia', { venceEn: '2030-01-01', ...licencia }),
      doc('hoja_vida', { archivoTipo: 'application/pdf', emitidoEn: '2026-11-20' }),
      doc('antecedentes', { archivoTipo: 'application/pdf', emitidoEn: '2026-11-21' }),
    ];
    const r = (docs: DocumentoReal[]) => textoDocumentosPorRenovar(resumenDocumentos(c.tiposDocumento, docs, HOY, 3));
    const vencida = r(cuatro({ venceEn: '2026-11-23' }));
    assert.equal(vencida?.texto, 'Sube de nuevo tu licencia para volver a aparecer en los matches.');
    assert.equal(vencida?.tipo?.clave, 'licencia');
    assert.equal(r(cuatro({ estado: 'no_aprobado' }))?.texto, 'Sube de nuevo tu licencia para aparecer en los matches.');
    assert.equal(r(cuatro({})), null, 'todo al día');
    assert.equal(r([doc('licencia', { venceEn: '2026-11-23' })]), null, 'si además faltan documentos, sigue el registro');
    const dos = r([...cuatro({ venceEn: '2026-11-23' }).slice(1), doc('cedula', { estado: 'vencido', venceEn: '2026-11-01' })]);
    assert.deepEqual([dos?.tipo, dos?.texto], [null, 'Sube de nuevo los documentos marcados para aparecer en los matches.']);
  });
  it('sin texto vigente de "Revisión de mis documentos" no se ofrece subir', () => {
    assert.equal(hayTextoRevision([{ clave: 'terminos_privacidad' }]), false);
    assert.equal(hayTextoRevision([{ clave: 'revision_documentos' }]), true);
  });
});

describe('archivos', () => {
  it('tipo, formato y tamaño', () => {
    assert.equal(mimeDeArchivo('foto.JPG', ''), 'image/jpeg', 'sin tipo: por la extensión');
    assert.equal(mimeDeArchivo('x.pdf', 'application/pdf'), 'application/pdf');
    assert.equal(mimeDeArchivo('x.gif', 'image/gif'), null);
    assert.equal(errorArchivo('application/pdf', 1000, 'foto'), 'Elige una foto (JPG o PNG).');
    assert.equal(errorArchivo('image/jpeg', 1000, 'pdf'), 'Elige un archivo PDF.');
    assert.equal(errorArchivo('image/heic', 1000, 'foto'), null);
    assert.equal(errorArchivo('image/jpeg', 0, 'foto'), 'El archivo está vacío. Elige otro.');
    assert.equal(errorArchivo('image/jpeg', 10 * 1024 * 1024 + 1, 'foto'), 'El archivo pesa más de 10 MB. Elige otro.');
  });
  it('la ruta en el espacio y los archivos que sobran', () => {
    const uuid = '11111111-2222-4333-8444-555555555555';
    assert.equal(rutaArchivo(UID, uuid, 'application/pdf'), `${UID}/${uuid}.pdf`);
    assert.equal(rutaArchivo(UID, uuid, 'image/jpeg'), `${UID}/${uuid}.jpg`);
    const vigente = doc('cedula');
    const reemplazado = doc('cedula', { estado: 'reemplazado' });
    const nombres = [vigente.ruta, reemplazado.ruta, `${UID}/suelto.jpg`].map((r) => r.split('/')[1]);
    assert.deepEqual(archivosSobrantes(nombres, UID, [vigente, reemplazado]), [reemplazado.ruta, `${UID}/suelto.jpg`]);
  });
  it('"Revisión de mis documentos": se pide solo si hay un texto vigente sin aceptar', () => {
    const textos = c.textos;
    const revision = textos.find((t) => t.clave === 'revision_documentos')!;
    assert.equal(textoRevisionPendiente(textos, [])?.id, revision.id);
    assert.equal(textoRevisionPendiente(textos, [revision.id]), null);
    assert.equal(textoRevisionPendiente(textos.filter((t) => t.clave !== 'revision_documentos'), []), null, 'sin texto vigente no hay nada que aceptar');
    // Con "Antes de empezar" de 2 textos, la versión de documentos queda no obligatoria: se pide igual.
    const soloDos = textos.map((t) => (t.clave === 'revision_documentos' ? { ...t, id: 99, obligatoria: false } : t)).filter((t) => t.clave !== 'normas_mensajes');
    assert.equal(textoRevisionPendiente(soloDos, textos.map((t) => t.id))?.id, 99);
  });
});

describe('el Paso 5 en el perfil', () => {
  const filas = (documentos: FilasPerfil['documentos']): FilasPerfil => ({
    cuenta: { id: UID, celular: '+56990000001', celular_verificado_en: 'x', creado_en: 'x', email: 'a@b.cl', nombres: 'Ana', primer_apellido: 'P', segundo_apellido: null, estado: 'activa' },
    conductor: {
      id: UID,
      fecha_nacimiento: '1990-03-14',
      comuna_id: 94,
      tiene_estacionamiento: true,
      disponible: true,
      disponibilidad_confirmada_en: null,
      estado_perfil: 'completo',
      estado_verificacion: 'verificado',
      creado_en: 'x',
    },
    licencias: [{ clase_licencia_id: c.mapas.claseIdPorCodigo.B, origen: 'declarada' }],
    experiencia: [],
    negocios: [{ negocio_id: 1 }],
    opciones: [{ opcion_id: c.mapas.opcionIdPorClave.turno.dia }, { opcion_id: c.mapas.opcionIdPorClave.dia_semana.lu }],
    consentimientos: [],
    documentos,
  });
  const fila = (tipoId: number, cambios: Record<string, unknown> = {}) => ({
    id: tipoId,
    tipo_documento_id: tipoId,
    estado: 'aprobado',
    subido_en: '2026-11-20T12:00:00Z',
    emitido_en: null,
    vence_en: '2030-01-01',
    revisado_en: '2026-11-20T12:00:00Z',
    archivo_tipo: 'image/jpeg',
    archivo_ruta: `${UID}/x${tipoId}.jpg`,
    ...cambios,
  });
  const contexto = { tipos: c.tiposDocumento, meses: 3, hoy: HOY };
  it('con los 4 aprobados y vigentes: 5 de 5; lo dice también la base (completo)', () => {
    const p = mapearPerfil(filas([1, 2, 3, 4].map((id) => fila(id))), c.mapas, c.textos, '', contexto);
    assert.equal(p.conductor.pasosListos.documentos, true);
    assert.equal(avancePerfil(p).listos, 5);
    assert.equal(p.conductor.estadoPerfil, 'completo');
    assert.equal(p.documentos.length, 4);
  });
  it('con uno vencido o en revisión, el Paso 5 no está listo', () => {
    const vencida = mapearPerfil(filas([fila(1, { vence_en: '2026-11-01' }), fila(2), fila(3), fila(4)]), c.mapas, c.textos, '', contexto);
    assert.equal(vencida.conductor.pasosListos.documentos, false);
    const revision = mapearPerfil(filas([fila(1, { estado: 'en_revision' }), fila(2), fila(3), fila(4)]), c.mapas, c.textos, '', contexto);
    assert.equal(revision.conductor.pasosListos.documentos, false);
    assert.equal(avancePerfil(revision).siguientePaso, 5);
  });
});
