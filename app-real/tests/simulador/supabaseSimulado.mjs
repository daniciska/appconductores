// Supabase SIMULADO para las pruebas de la app real (Node y recorridos con Playwright). Imita lo que
// responden Auth (GoTrue) y la API de datos (PostgREST) del proyecto dale-contacto para lo que usa la
// v1, con las reglas de la base (supabase/migrations): la cuenta nace al confirmar el código, cada uno ve
// y escribe solo lo suyo, los permisos por columna (sin `id` en consentimientos y experiencia), las
// llaves únicas, los 18 años, los negocios activos y habilitados por la licencia, y "quitar una clase
// quita los negocios que ya no habilita". No reemplaza a las pruebas SQL (supabase/pruebas): sirve para
// probar la app contra respuestas con la forma real, sin red y sin tocar la base de verdad.
// Desde el 24-nov también los documentos (Paso 5): la tabla documentos con las reglas de su trigger
// (archivo propio y del formato pedido, autorización de revisión, fechas), el método de validación
// (por defecto 'aprobar_todo'), los reemplazos, los estados del perfil, y Storage (el espacio privado
// "documentos": subir, listar y borrar, cada uno solo su carpeta).
//
// Uso:
//   const sim = crearSupabaseSimulado({ numerosDePrueba: { '56990000001': '123456' } });
//   createClient(url, clave, { global: { fetch: sim.fetch } })      // en Node
//   const r = sim.manejar({ method, url, headers, body })           // en page.route de Playwright
//   sim.pedidos                                                     // todo lo que llegó (para revisar su forma)
//   sim.fallar((p) => p.method === 'PATCH', 'red')                  // la próxima que calce falla
//   sim.fallar((p) => p.method === 'DELETE', 'red-despues')         // llega a la base, pero se pierde la respuesta
//   crearSupabaseSimulado({ creaCuenta: false })                    // el trigger de la cuenta falla
//   sim.metodoValidacion('equipo')                                  // los documentos quedan en revisión
//   sim.archivos                                                    // lo que hay en Storage (espacio documentos)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'base-inicial.json'), 'utf8'));
const DIA_MS = 24 * 60 * 60 * 1000;

const copia = (x) => JSON.parse(JSON.stringify(x));
/** JSON del cuerpo (o null si no hay o no es JSON, como un archivo). */
const json = (t) => {
  try {
    return t ? JSON.parse(t) : null;
  } catch {
    return null;
  }
};
const b64url = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

/** Columna dueña de cada tabla de personas (la RLS: cada uno ve y escribe solo lo suyo). */
const DUENO = {
  cuentas: 'id',
  conductores: 'id',
  conductor_licencias: 'conductor_id',
  conductor_negocios: 'conductor_id',
  conductor_opciones: 'conductor_id',
  experiencia_conductor: 'conductor_id',
  consentimientos: 'cuenta_id',
  documentos: 'cuenta_id',
};
/** Llaves únicas (para el 23505 y para on_conflict). */
const LLAVES = {
  conductores: [['id']],
  conductor_licencias: [['conductor_id', 'clase_licencia_id', 'origen']],
  conductor_negocios: [['conductor_id', 'negocio_id']],
  conductor_opciones: [['conductor_id', 'opcion_id']],
  experiencia_conductor: [['conductor_id', 'tamano_vehiculo_id']],
};
const NOMBRE_LLAVE = {
  conductores: 'conductores_pkey',
  conductor_licencias: 'conductor_licencias_pkey',
  conductor_negocios: 'conductor_negocios_pkey',
  conductor_opciones: 'conductor_opciones_pkey',
  experiencia_conductor: 'experiencia_conductor_conductor_id_tamano_vehiculo_id_key',
};
/** Valores por defecto de las columnas (como en la base) al insertar. */
const DEFECTOS = {
  conductores: {
    comuna_id: null,
    tiene_estacionamiento: null,
    direccion: null,
    direccion_detalle: null,
    google_place_id: null,
    disponible: true,
    disponibilidad_confirmada_en: null,
    perfil_completo_en: null,
    tramo_garantia_id: null,
    datos_extra: {},
  },
  consentimientos: { revocado_en: null },
};
/** Tablas sin INSERT de `id` (el permiso de INSERT es por columnas). */
const INSERT_SIN_ID = ['consentimientos', 'experiencia_conductor'];
/** documentos: el INSERT es solo por estas columnas (el estado y las fechas del servidor los pone la base). */
const COLUMNAS_INSERT_DOCUMENTOS = ['cuenta_id', 'tipo_documento_id', 'archivo_ruta', 'archivo_tipo', 'archivo_bytes', 'emitido_en', 'vence_en'];
const MIME_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MIME_ESPACIO = [...MIME_FOTO, 'application/pdf'];
const LIMITE_ESPACIO = 10 * 1024 * 1024;
const RUTA_ARCHIVO = /^([0-9a-f-]{36})\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|heic|heif|pdf)$/;

/** 'aaaa-mm-dd' + días / meses (como Postgres). */
function masDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}
function masMeses(iso, n) {
  const [a, m, d] = iso.split('-').map(Number);
  const total = a * 12 + (m - 1) + n;
  const anio = Math.floor(total / 12);
  const mes = (total % 12) + 1;
  const ultimo = new Date(Date.UTC(anio, mes, 0)).getUTCDate();
  return `${anio}-${String(mes).padStart(2, '0')}-${String(Math.min(d, ultimo)).padStart(2, '0')}`;
}

class ErrorPg extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status ?? (code === '23505' || code === '23503' ? 409 : code === '42501' ? 403 : 400);
  }
}

/** Hoy en Chile (como la base: now() at time zone 'America/Santiago'). */
function hoyEnChile(ms) {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' });
  return f.format(new Date(ms)); // aaaa-mm-dd
}

export function crearSupabaseSimulado(opciones = {}) {
  const numerosDePrueba = opciones.numerosDePrueba ?? { '56990000001': '123456' };
  /** false: el trigger que crea la cuenta falla (por ejemplo, un número que ya tiene otra cuenta). */
  const creaCuenta = opciones.creaCuenta ?? true;
  const ahora = opciones.ahora ?? (() => Date.now());
  const cat = copia(BASE);
  const ajustes = cat.ajustes;
  const datos = {
    cuentas: [],
    conductores: [],
    conductor_licencias: [],
    conductor_negocios: [],
    conductor_opciones: [],
    experiencia_conductor: [],
    consentimientos: [],
    documentos: [],
  };
  /** Storage: espacio "documentos" ({ name, owner_id, metadata: { mimetype, size }, created_at }). */
  const archivos = [];
  let metodo = 'aprobar_todo';
  const revisiones = [];
  let idDocumento = 0;
  const usuarios = []; // { id, phone, phone_confirmed_at, created_at }
  const codigosPedidos = {}; // phone → ms del último pedido
  const tokens = {}; // access_token → uid
  const refrescos = {}; // refresh_token → uid
  const pedidos = [];
  const fallas = [];
  let secuencia = 0;
  let sinConexion = false;

  const iso = () => new Date(ahora()).toISOString();
  const nuevoId = () => {
    secuencia += 1;
    return `00000000-0000-4000-8000-${String(secuencia).padStart(12, '0')}`;
  };

  // --------------------------------------------------------------------- Auth
  function sesionPara(usuario) {
    const exp = Math.floor(ahora() / 1000) + 3600;
    const access = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: usuario.id, role: 'authenticated', aud: 'authenticated', exp, phone: usuario.phone })}.${'firma' + nuevoId().slice(-6)}`;
    const refresh = `r-${nuevoId()}`;
    tokens[access] = usuario.id;
    refrescos[refresh] = usuario.id;
    return {
      access_token: access,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: exp,
      refresh_token: refresh,
      user: {
        id: usuario.id,
        aud: 'authenticated',
        role: 'authenticated',
        phone: usuario.phone,
        phone_confirmed_at: usuario.phone_confirmed_at,
        confirmed_at: usuario.phone_confirmed_at,
        app_metadata: { provider: 'phone', providers: ['phone'] },
        user_metadata: {},
        identities: [],
        created_at: usuario.created_at,
        updated_at: iso(),
        is_anonymous: false,
      },
    };
  }

  const errorAuth = (status, code, message) => ({
    status,
    headers: { 'content-type': 'application/json', 'x-supabase-api-version': '2024-01-01' },
    body: JSON.stringify({ code, message }),
  });
  const jsonOk = (obj, status = 200) => ({ status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj) });

  /** Lo que hace el trigger dale_contacto_sincronizar_cuenta al confirmarse el código. */
  function crearCuenta(u) {
    if (datos.cuentas.some((c) => c.id === u.id)) return;
    datos.cuentas.push({
      id: u.id,
      celular: '+' + u.phone,
      celular_verificado_en: u.phone_confirmed_at,
      creado_en: iso(),
      email: null,
      email_confirmado_en: null,
      nombres: null,
      primer_apellido: null,
      segundo_apellido: null,
      estado: 'activa',
      tokens_avisos: null,
    });
  }

  function auth(p, ruta, query, cuerpo) {
    if (p.method === 'POST' && ruta === 'otp') {
      const phone = String(cuerpo.phone ?? '').replace(/\D/g, '');
      if (!/^569\d{8}$/.test(phone)) return errorAuth(400, 'validation_failed', 'Invalid phone number format (E.164 required)');
      const ultimo = codigosPedidos[phone];
      if (ultimo !== undefined && ahora() - ultimo < 60_000) {
        const faltan = Math.ceil((60_000 - (ahora() - ultimo)) / 1000);
        return errorAuth(429, 'over_sms_send_rate_limit', `For security purposes, you can only request this after ${faltan} seconds.`);
      }
      codigosPedidos[phone] = ahora();
      if (!usuarios.some((u) => u.phone === phone)) usuarios.push({ id: nuevoId(), phone, phone_confirmed_at: null, created_at: iso() });
      // Proveedor de relleno: a un número que no está en la lista de prueba no se le puede enviar nada.
      if (!(phone in numerosDePrueba)) return errorAuth(422, 'sms_send_failed', 'Error sending sms OTP: Authenticate');
      return jsonOk({});
    }
    if (p.method === 'POST' && ruta === 'verify') {
      const phone = String(cuerpo.phone ?? '').replace(/\D/g, '');
      const u = usuarios.find((x) => x.phone === phone);
      if (!u || numerosDePrueba[phone] !== String(cuerpo.token ?? '')) return errorAuth(403, 'otp_expired', 'Token has expired or is invalid');
      if (!u.phone_confirmed_at) u.phone_confirmed_at = iso();
      if (creaCuenta) crearCuenta(u);
      return jsonOk(sesionPara(u));
    }
    if (p.method === 'POST' && ruta === 'token' && query.get('grant_type') === 'refresh_token') {
      const uid = refrescos[cuerpo.refresh_token];
      if (!uid) return errorAuth(400, 'refresh_token_not_found', 'Invalid Refresh Token: Refresh Token Not Found');
      delete refrescos[cuerpo.refresh_token];
      return jsonOk(sesionPara(usuarios.find((u) => u.id === uid)));
    }
    if (p.method === 'POST' && ruta === 'logout') {
      const t = (p.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
      delete tokens[t];
      return { status: 204, headers: {}, body: '' };
    }
    if (p.method === 'GET' && ruta === 'user') {
      const uid = tokens[(p.headers.authorization ?? '').replace(/^Bearer\s+/i, '')];
      const u = usuarios.find((x) => x.id === uid);
      return u ? jsonOk(sesionPara(u).user) : errorAuth(401, 'bad_jwt', 'invalid JWT');
    }
    return errorAuth(404, 'not_found', `Ruta de Auth no simulada: ${p.method} ${ruta}`);
  }

  // --------------------------------------------------------------------- PostgREST
  function tablaDeCatalogo(nombre) {
    if (nombre === 'negocio_clases_licencia') return cat.negocios.flatMap((n) => n.negocio_clases_licencia);
    if (nombre === 'negocio_tamanos') return cat.negocios.flatMap((n) => n.negocio_tamanos);
    if (nombre === 'opciones') return cat.listas.flatMap((l) => l.opciones);
    return cat[nombre];
  }

  /** Divide la lista de select en el primer nivel ("a,b,rel(c,d)" → ["a","b","rel(c,d)"]). */
  function partesSelect(sel) {
    const partes = [];
    let nivel = 0;
    let actual = '';
    for (const ch of sel) {
      if (ch === '(') nivel++;
      if (ch === ')') nivel--;
      if (ch === ',' && nivel === 0) {
        partes.push(actual);
        actual = '';
      } else actual += ch;
    }
    if (actual) partes.push(actual);
    return partes.map((x) => x.trim()).filter(Boolean);
  }

  function proyectar(fila, sel) {
    if (!sel || sel === '*') return { ...fila };
    const salida = {};
    for (const parte of partesSelect(sel)) {
      const m = /^([a-z_]+)\((.*)\)$/s.exec(parte);
      if (m) {
        const hijos = Array.isArray(fila[m[1]]) ? fila[m[1]] : [];
        salida[m[1]] = hijos.map((h) => proyectar(h, m[2]));
      } else {
        if (!(parte in fila)) throw new ErrorPg('42703', `column ${parte} does not exist`, 400);
        salida[parte] = fila[parte];
      }
    }
    return salida;
  }

  /** Filtros de la URL (eq, neq, in, not.in, is). */
  function filtros(query) {
    const lista = [];
    for (const [col, val] of query.entries()) {
      if (['select', 'order', 'on_conflict', 'columns', 'limit', 'offset'].includes(col)) continue;
      const m = /^(not\.)?(eq|neq|in|is)\.(.*)$/s.exec(val);
      if (!m || (m[1] && m[2] !== 'in')) throw new ErrorPg('PGRST100', `filtro no simulado: ${col}=${val}`, 400);
      lista.push({ col, op: m[1] ? 'not.in' : m[2], valor: m[3] });
    }
    return (fila) =>
      lista.every(({ col, op, valor }) => {
        const v = fila[col];
        if (op === 'eq') return String(v) === valor;
        if (op === 'neq') return String(v) !== valor;
        if (op === 'is') return valor === 'null' ? v === null || v === undefined : String(v) === valor;
        const valores = valor
          .replace(/^\(|\)$/g, '')
          .split(',')
          .map((x) => x.replace(/^"|"$/g, ''));
        return op === 'not.in' ? !valores.includes(String(v)) : valores.includes(String(v));
      });
  }

  function ordenar(filas, order) {
    if (!order) return filas;
    const [col, dir] = order.split('.');
    return [...filas].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (dir === 'desc' ? -1 : 1));
  }

  // --- Reglas de la base (triggers) ---
  function clasesHabilitan(negocio) {
    const codigos = negocio.negocio_clases_licencia.map((x) => cat.clases_licencia.find((c) => c.id === x.clase_licencia_id).codigo);
    const extra = codigos.includes('B') ? cat.clases_licencia.filter((c) => c.habilita_clase_b).map((c) => c.codigo) : [];
    return new Set([...codigos, ...extra]);
  }
  function licenciaHabilita(uid, negocioId) {
    const negocio = cat.negocios.find((n) => n.id === negocioId);
    if (!negocio) return false;
    const habilitan = clasesHabilitan(negocio);
    return datos.conductor_licencias
      .filter((l) => l.conductor_id === uid && l.origen === 'declarada')
      .some((l) => habilitan.has(cat.clases_licencia.find((c) => c.id === l.clase_licencia_id)?.codigo));
  }
  function validarFecha(fecha) {
    const hoy = hoyEnChile(ahora());
    if (fecha > hoy) throw new ErrorPg('23514', 'La fecha de nacimiento no puede ser futura.');
    const [a, m, d] = hoy.split('-');
    if (fecha > `${Number(a) - 18}-${m}-${d}`) throw new ErrorPg('23514', 'Tienes que tener 18 años o más.');
  }
  function antesDeGuardar(tabla, fila, uid, previa) {
    if (tabla === 'conductores') {
      if (!previa) {
        if (!datos.cuentas.some((c) => c.id === fila.id)) throw new ErrorPg('23503', 'insert or update on table "conductores" violates foreign key constraint "conductores_id_fkey"');
        fila.estado_perfil = 'incompleto';
        fila.estado_verificacion = 'sin_documentos';
        fila.perfil_completo_en = null;
        fila.creado_en = iso();
        fila.actualizado_en = iso();
        if (fila.disponibilidad_confirmada_en != null) fila.disponibilidad_confirmada_en = iso();
      } else {
        const cambiadas = ['id', 'estado_perfil', 'perfil_completo_en', 'estado_verificacion', 'creado_en'].filter((c) => c in fila && fila[c] !== previa[c]);
        if (cambiadas.length) throw new ErrorPg('42501', `No puedes cambiar: ${cambiadas.join(', ')}`);
        if ('disponibilidad_confirmada_en' in fila && fila.disponibilidad_confirmada_en !== previa.disponibilidad_confirmada_en) fila.disponibilidad_confirmada_en = iso();
        fila.actualizado_en = iso();
      }
      if ('fecha_nacimiento' in fila && (!previa || fila.fecha_nacimiento !== previa.fecha_nacimiento)) validarFecha(fila.fecha_nacimiento);
      if (fila.comuna_id != null && !cat.comunas.some((c) => c.id === Number(fila.comuna_id)))
        throw new ErrorPg('23503', 'insert or update on table "conductores" violates foreign key constraint "conductores_comuna_id_fkey"');
    }
    if (tabla === 'cuentas' && previa) {
      const cambiadas = ['id', 'celular', 'celular_verificado_en', 'creado_en', 'email_confirmado_en', 'estado', 'tokens_avisos'].filter(
        (c) => c in fila && fila[c] !== previa[c],
      );
      if (cambiadas.length) throw new ErrorPg('42501', `No puedes cambiar: ${cambiadas.join(', ')}`);
    }
    if (['conductor_licencias', 'conductor_negocios', 'conductor_opciones', 'experiencia_conductor'].includes(tabla)) {
      if (!datos.conductores.some((c) => c.id === fila.conductor_id))
        throw new ErrorPg('23503', `insert or update on table "${tabla}" violates foreign key constraint "${tabla}_conductor_id_fkey"`);
    }
    if (tabla === 'conductor_licencias') {
      if (fila.origen !== 'declarada') throw new ErrorPg('42501', `new row violates row-level security policy for table "${tabla}"`);
      if (!cat.clases_licencia.some((c) => c.id === Number(fila.clase_licencia_id))) throw new ErrorPg('23503', 'violates foreign key constraint "conductor_licencias_clase_licencia_id_fkey"');
    }
    if (tabla === 'conductor_negocios') {
      const n = cat.negocios.find((x) => x.id === Number(fila.negocio_id));
      const i = n && cat.industrias.find((x) => x.id === n.industria_id);
      if (!n || !n.activo || !i?.activo) throw new ErrorPg('23514', 'Ese negocio no está disponible.');
      if (!licenciaHabilita(uid, n.id)) throw new ErrorPg('23514', 'Tu licencia no habilita para ese negocio.');
    }
    if (tabla === 'conductor_opciones') {
      const o = cat.listas.flatMap((l) => l.opciones.map((x) => ({ ...x, lista: l.clave }))).find((x) => x.id === Number(fila.opcion_id));
      if (!o || !o.activa || !['turno', 'dia_semana', 'idioma'].includes(o.lista)) throw new ErrorPg('23514', 'Esa opción no se puede elegir.');
    }
    if (tabla === 'experiencia_conductor') {
      if (!cat.tamanos_vehiculo.some((t) => t.id === Number(fila.tamano_vehiculo_id))) throw new ErrorPg('23503', 'violates foreign key constraint "experiencia_conductor_tamano_vehiculo_id_fkey"');
      if (!(Number(fila.anos) >= 0 && Number(fila.anos) <= 70)) throw new ErrorPg('23514', 'new row violates check constraint "experiencia_conductor_anos_check"');
      fila.actualizado_en = iso();
    }
    if (tabla === 'consentimientos' && !previa) {
      const t = cat.textos_autorizacion.find((x) => x.id === Number(fila.texto_autorizacion_id));
      if (!t || !t.vigente) throw new ErrorPg('42501', 'new row violates row-level security policy for table "consentimientos"');
      if (datos.consentimientos.some((c) => c.cuenta_id === fila.cuenta_id && c.texto_autorizacion_id === Number(fila.texto_autorizacion_id) && !c.revocado_en))
        throw new ErrorPg('23505', 'duplicate key value violates unique constraint "consentimientos_una_activa"');
      fila.aceptado_en = iso();
      fila.revocado_en = null;
      fila.id = datos.consentimientos.length + 1;
    }
  }

  // --- Documentos (trigger documentos_proteger, el método de validación y los estados del perfil) ---
  function validarDocumento(fila, uid) {
    const extra = Object.keys(fila).filter((c) => !COLUMNAS_INSERT_DOCUMENTOS.includes(c));
    if (extra.length) throw new ErrorPg('42501', 'permission denied for table documentos');
    if (fila.cuenta_id !== uid) throw new ErrorPg('42501', 'new row violates row-level security policy for table "documentos"');
    const tipo = cat.tipos_documento.find((t) => t.id === Number(fila.tipo_documento_id));
    if (!tipo || !tipo.activo) throw new ErrorPg('23514', 'Ese documento ya no se pide. Vuelve a abrir la pantalla.');
    if (tipo.para_quien === 'conductor' && !datos.conductores.some((c) => c.id === uid)) throw new ErrorPg('23514', 'Primero guarda tus datos (Paso 1).');
    const texto = cat.textos_autorizacion.find((t) => t.clave === 'revision_documentos' && t.vigente);
    if (!texto) throw new ErrorPg('23514', 'Por ahora no podemos recibir documentos. Inténtalo más tarde.');
    if (!datos.consentimientos.some((c) => c.cuenta_id === uid && c.texto_autorizacion_id === texto.id && !c.revocado_en))
      throw new ErrorPg('23514', 'Primero acepta la revisión de tus documentos.');
    const archivo = archivos.find((a) => a.name === fila.archivo_ruta && a.owner_id === uid);
    if (!fila.archivo_ruta || String(fila.archivo_ruta).split('/')[0] !== uid || !archivo) throw new ErrorPg('23514', 'No encontramos el archivo. Vuelve a subirlo.');
    if (datos.documentos.some((d) => d.archivo_ruta === fila.archivo_ruta))
      throw new ErrorPg('23505', 'duplicate key value violates unique constraint "documentos_archivo_ruta_key"');
    fila.archivo_tipo = archivo.metadata.mimetype;
    fila.archivo_bytes = archivo.metadata.size;
    if (tipo.formato === 'pdf' && fila.archivo_tipo !== 'application/pdf') throw new ErrorPg('23514', 'Sube el documento en PDF.');
    if (tipo.formato === 'foto' && !MIME_FOTO.includes(fila.archivo_tipo)) throw new ErrorPg('23514', 'Sube una foto (JPG o PNG).');
    const hoy = hoyEnChile(ahora());
    if (tipo.fecha_pedida === 'vencimiento') {
      fila.emitido_en = null;
      if (!fila.vence_en) throw new ErrorPg('23514', 'Anota la fecha de vencimiento.');
      if (fila.vence_en < hoy) throw new ErrorPg('23514', 'Ese documento ya venció. Sube uno vigente.');
      if (fila.vence_en > masMeses(hoy, 240)) throw new ErrorPg('23514', 'Revisa la fecha.');
    } else if (tipo.fecha_pedida === 'emision') {
      if (!fila.emitido_en) throw new ErrorPg('23514', 'Anota la fecha de emisión.');
      if (fila.emitido_en > hoy) throw new ErrorPg('23514', 'La fecha de emisión no puede ser futura.');
      if (tipo.antiguedad_maxima_dias != null && fila.emitido_en < masDias(hoy, -tipo.antiguedad_maxima_dias))
        throw new ErrorPg('23514', `Debe tener ${tipo.antiguedad_maxima_dias} días o menos. Saca uno nuevo.`);
      fila.vence_en = tipo.renovar_cada_meses == null ? null : masMeses(fila.emitido_en, tipo.renovar_cada_meses);
    } else {
      fila.emitido_en = null;
      fila.vence_en = null;
    }
    idDocumento += 1;
    Object.assign(fila, {
      id: idDocumento,
      estado: 'en_revision',
      subido_en: new Date(ahora() + idDocumento).toISOString(),
      fechas_anotadas_por: 'persona',
      revisado_en: null,
      aprobado_automaticamente: false,
      motivo_rechazo_id: null,
      aviso_vencimiento_en: null,
    });
  }

  /** Lo que hacen los triggers después de subir: reemplazos, el método de validación y el perfil. */
  function despuesDeSubir(nuevo) {
    for (const d of datos.documentos) {
      if (d.id !== nuevo.id && d.cuenta_id === nuevo.cuenta_id && d.tipo_documento_id === nuevo.tipo_documento_id && ['en_revision', 'no_aprobado', 'vencido'].includes(d.estado)) d.estado = 'reemplazado';
    }
    if (metodo === 'aprobar_todo') {
      revisiones.push({ documento_id: nuevo.id, etapa: 'automatica', resultado: 'aprobar', metodo: 'aprobacion_automatica_provisoria' });
      cambiarEstadoDocumento(nuevo, 'aprobado');
    }
    // Otro valor: como un método futuro (reemplazo de privado.validar_documento) que deja el documento
    // en revisión. En la base de verdad, el ajuste solo acepta métodos que existen.
    recalcular(nuevo.cuenta_id);
  }

  function cambiarEstadoDocumento(doc, estado) {
    doc.estado = estado;
    if (estado === 'aprobado') {
      doc.revisado_en = iso();
      doc.aprobado_automaticamente = metodo === 'aprobar_todo';
      for (const d of datos.documentos) {
        if (d.id !== doc.id && d.cuenta_id === doc.cuenta_id && d.tipo_documento_id === doc.tipo_documento_id && !['reemplazado', 'retirado'].includes(d.estado) && d.id < doc.id) d.estado = 'reemplazado';
      }
    }
    recalcular(doc.cuenta_id);
  }

  /** privado.recalcular_conductor: estado_verificacion y estado_perfil. */
  function recalcular(uid) {
    const c = datos.conductores.find((x) => x.id === uid);
    if (!c) return;
    const cuenta = datos.cuentas.find((x) => x.id === uid);
    const texto = (t) => typeof t === 'string' && t.trim() !== '';
    const datosOk = !!cuenta && texto(cuenta.nombres) && texto(cuenta.primer_apellido) && texto(cuenta.email) && datos.conductor_licencias.some((l) => l.conductor_id === uid && l.origen === 'declarada');
    const direccionOk = c.comuna_id != null && c.tiene_estacionamiento != null;
    const listaDe = (id) => cat.listas.find((l) => l.opciones.some((o) => o.id === Number(id)))?.clave;
    const opciones = datos.conductor_opciones.filter((o) => o.conductor_id === uid).map((o) => listaDe(o.opcion_id));
    const trabajoOk = datos.conductor_negocios.some((n) => n.conductor_id === uid) && opciones.includes('turno') && opciones.includes('dia_semana');
    const hoy = hoyEnChile(ahora());
    const tipos = cat.tipos_documento.filter((t) => t.activo && t.obligatorio && t.para_quien === 'conductor');
    let ok = 0;
    let obs = 0;
    let rev = 0;
    let subidos = 0;
    for (const t of tipos) {
      const propios = datos.documentos.filter((d) => d.cuenta_id === uid && d.tipo_documento_id === t.id);
      const listo = propios.some((d) => d.estado === 'aprobado' && (d.vence_en == null || d.vence_en >= hoy));
      const ultimo = propios.filter((d) => !['reemplazado', 'retirado'].includes(d.estado)).sort((a, b) => b.id - a.id)[0];
      if (listo || ultimo) subidos++;
      if (listo) ok++;
      else if (ultimo && ['no_aprobado', 'vencido', 'aprobado'].includes(ultimo.estado)) obs++;
      else if (ultimo?.estado === 'en_revision') rev++;
    }
    const verif =
      ok === tipos.length ? 'verificado' : obs > 0 ? 'con_observaciones' : rev > 0 ? 'en_revision' : subidos > 0 ? 'faltan_documentos' : 'sin_documentos';
    const perfil = datosOk && direccionOk && trabajoOk && verif === 'verificado' ? 'completo' : 'incompleto';
    c.estado_verificacion = verif;
    c.perfil_completo_en = perfil === 'completo' ? (c.estado_perfil === 'completo' ? c.perfil_completo_en : iso()) : null;
    c.estado_perfil = perfil;
  }

  // --- Storage (espacio "documentos", privado) ---
  const errorStorage = (status, statusCode, error, message) => ({
    status,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ statusCode: String(statusCode), error, message }),
  });

  function storage(p, ruta, uid, bytes, cuerpoTexto) {
    const mSubir = /^\/storage\/v1\/object\/documentos\/(.+)$/.exec(ruta);
    const mListar = ruta === '/storage/v1/object/list/documentos';
    const mBorrar = ruta === '/storage/v1/object/documentos';
    if (!uid) return errorStorage(400, 403, 'Unauthorized', 'new row violates row-level security policy');
    if (p.method === 'POST' && mSubir) {
      const nombre = decodeURIComponent(mSubir[1]);
      const m = RUTA_ARCHIVO.exec(nombre);
      if (!m || m[1] !== uid) return errorStorage(400, 403, 'Unauthorized', 'new row violates row-level security policy');
      const tipo = String(p.headers['content-type'] ?? '').split(';')[0].trim();
      if (!MIME_ESPACIO.includes(tipo)) return errorStorage(415, 415, 'invalid_mime_type', `mime type ${tipo} is not supported`);
      const tamano = bytes ? bytes.length : 0;
      if (tamano > LIMITE_ESPACIO) return errorStorage(413, 413, 'Payload too large', 'The object exceeded the maximum allowed size');
      if (archivos.some((a) => a.name === nombre)) return errorStorage(400, 409, 'Duplicate', 'The resource already exists');
      // Tope de archivos por persona (privado.puede_subir_archivo_documento, ajuste maximo_archivos_documentos).
      const tope = Number(ajustes.find((a) => a.id === 'maximo_archivos_documentos')?.valor ?? 12);
      if (archivos.filter((a) => a.name.split('/')[0] === uid).length >= tope)
        return errorStorage(400, 403, 'Unauthorized', 'new row violates row-level security policy');
      const id = nuevoId();
      archivos.push({ id, name: nombre, owner_id: uid, metadata: { mimetype: tipo, size: tamano }, created_at: new Date(ahora()).toISOString() });
      return jsonOk({ Key: `documentos/${nombre}`, Id: id });
    }
    if (p.method === 'POST' && mListar) {
      const cuerpo = cuerpoTexto ? JSON.parse(cuerpoTexto) : {};
      const prefijo = String(cuerpo.prefix ?? '').replace(/\/+$/, '');
      const lista = archivos
        .filter((a) => a.owner_id === uid && a.name.split('/')[0] === uid && a.name.startsWith(prefijo + '/'))
        .map((a) => ({ name: a.name.slice(prefijo.length + 1), id: a.id, metadata: a.metadata, created_at: a.created_at, updated_at: a.created_at }));
      return jsonOk(lista);
    }
    if (p.method === 'DELETE' && mBorrar) {
      const cuerpo = cuerpoTexto ? JSON.parse(cuerpoTexto) : {};
      const borrados = [];
      for (const nombre of cuerpo.prefixes ?? []) {
        const i = archivos.findIndex((a) => a.name === nombre && a.owner_id === uid && nombre.split('/')[0] === uid);
        if (i < 0) continue;
        if (datos.documentos.some((d) => d.archivo_ruta === nombre && !['reemplazado', 'retirado'].includes(d.estado))) continue;
        borrados.push(archivos.splice(i, 1)[0]);
      }
      return jsonOk(borrados.map((a) => ({ name: a.name, id: a.id, bucket_id: 'documentos', metadata: a.metadata })));
    }
    return errorStorage(404, 404, 'not_found', `Ruta de Storage no simulada: ${p.method} ${ruta}`);
  }

  /** Al quitar una clase declarada se quitan los negocios que ya no habilita ninguna (trigger 6.13). */
  function despuesDeQuitarClase(uid) {
    datos.conductor_negocios = datos.conductor_negocios.filter((n) => n.conductor_id !== uid || licenciaHabilita(uid, n.negocio_id));
  }

  function choca(tabla, a, b) {
    return (LLAVES[tabla] ?? []).some((llave) => llave.every((c) => String(a[c]) === String(b[c])));
  }

  function rest(p, tabla, query, cuerpo, uid) {
    const prefer = p.headers.prefer ?? '';
    const representar = /return=representation/.test(prefer);
    const sel = query.get('select');
    const esPersona = tabla in DUENO;
    if (!esPersona && !tablaDeCatalogo(tabla)) throw new ErrorPg('42P01', `relation "public.${tabla}" does not exist`, 404);

    if (p.method === 'GET') {
      let filas;
      if (esPersona) {
        if (!uid) throw new ErrorPg('42501', `permission denied for table ${tabla}`, 401);
        filas = datos[tabla].filter((f) => f[DUENO[tabla]] === uid);
      } else if (tabla === 'textos_autorizacion') {
        filas = cat.textos_autorizacion.filter((t) => t.vigente);
      } else if (tabla === 'ajustes') {
        filas = ajustes.filter((a) => a.publico);
      } else {
        filas = tablaDeCatalogo(tabla);
      }
      const resultado = ordenar(filas.filter(filtros(query)), query.get('order')).map((f) => proyectar(f, sel));
      return jsonOk(resultado);
    }

    if (!esPersona) throw new ErrorPg('42501', `permission denied for table ${tabla}`, uid ? 403 : 401);
    if (!uid) throw new ErrorPg('42501', `permission denied for table ${tabla}`, 401);
    if (tabla === 'cuentas' && p.method !== 'PATCH' && p.method !== 'GET') throw new ErrorPg('42501', 'permission denied for table cuentas');

    if (tabla === 'documentos' && p.method !== 'POST') throw new ErrorPg('42501', 'permission denied for table documentos');
    if (p.method === 'PATCH') {
      const coincide = filtros(query);
      const cambiadas = [];
      // Todo o nada: se prueba sobre copias y recién después se guarda.
      const nuevas = datos[tabla].map((f) => {
        if (f[DUENO[tabla]] !== uid || !coincide(f)) return f;
        const fila = { ...f, ...cuerpo };
        antesDeGuardar(tabla, fila, uid, f);
        cambiadas.push(fila);
        return fila;
      });
      datos[tabla] = nuevas;
      recalcular(uid);
      if (representar) return jsonOk(cambiadas.map((f) => proyectar(f, sel)));
      return { status: 204, headers: {}, body: '' };
    }

    if (p.method === 'POST') {
      const filas = (Array.isArray(cuerpo) ? cuerpo : [cuerpo]).map((f) => ({ ...f }));
      if (INSERT_SIN_ID.includes(tabla) && filas.some((f) => 'id' in f)) throw new ErrorPg('42501', `permission denied for table ${tabla}`);
      const conflicto = query.get('on_conflict');
      const ignorar = /resolution=ignore-duplicates/.test(prefer);
      const mezclar = /resolution=merge-duplicates/.test(prefer);
      const copiaTabla = datos[tabla].map((f) => ({ ...f }));
      const devueltas = [];
      for (const f of filas) {
        if (f[DUENO[tabla]] !== uid) throw new ErrorPg('42501', `new row violates row-level security policy for table "${tabla}"`);
        const previa = copiaTabla.find((x) => choca(tabla, x, f));
        if (previa) {
          if (conflicto && ignorar) continue;
          if (conflicto && mezclar) {
            const fila = { ...previa, ...f };
            antesDeGuardar(tabla, fila, uid, previa);
            Object.assign(previa, fila);
            devueltas.push(previa);
            continue;
          }
          throw new ErrorPg('23505', `duplicate key value violates unique constraint "${NOMBRE_LLAVE[tabla]}"`);
        }
        const nueva = { ...(DEFECTOS[tabla] ?? {}), ...f };
        if (tabla === 'experiencia_conductor') nueva.id = copiaTabla.length + 1;
        if (tabla === 'documentos') validarDocumento(nueva, uid);
        else antesDeGuardar(tabla, nueva, uid, null);
        copiaTabla.push(nueva);
        devueltas.push(nueva);
      }
      datos[tabla] = copiaTabla;
      // Lo que devuelve RETURNING es la fila antes de los triggers AFTER (como en Postgres).
      const respuesta = devueltas.map((f) => proyectar(f, sel));
      if (tabla === 'documentos') for (const f of devueltas) despuesDeSubir(f);
      else recalcular(uid);
      if (representar) return jsonOk(respuesta, 201);
      return { status: 201, headers: {}, body: '' };
    }

    if (p.method === 'DELETE') {
      if (tabla === 'cuentas' || tabla === 'conductores' || tabla === 'consentimientos') throw new ErrorPg('42501', `permission denied for table ${tabla}`);
      const coincide = filtros(query);
      const antes = datos[tabla].length;
      datos[tabla] = datos[tabla].filter((f) => !(f[DUENO[tabla]] === uid && coincide(f)) || (tabla === 'conductor_licencias' && f.origen !== 'declarada'));
      if (tabla === 'conductor_licencias' && datos[tabla].length !== antes) despuesDeQuitarClase(uid);
      recalcular(uid);
      return { status: 204, headers: {}, body: '' };
    }
    throw new ErrorPg('PGRST000', `método no simulado: ${p.method}`, 405);
  }

  // --------------------------------------------------------------------- Entrada
  /**
   * Atiende un pedido. Devuelve { status, headers, body } o { red: true } (falla de red simulada).
   * p = { method, url, headers (con nombres en minúsculas), body (texto o null) }.
   */
  function manejar(p) {
    const url = new URL(p.url);
    const cuerpo = json(p.body) ?? {};
    const registro = {
      method: p.method,
      ruta: url.pathname,
      query: Object.fromEntries(url.searchParams),
      prefer: p.headers.prefer ?? null,
      body: json(p.body),
      bytes: p.bodyBytes ? p.bodyBytes.length : null,
      tipo: p.headers['content-type'] ?? null,
    };
    pedidos.push(registro);
    const falla = fallas.findIndex((f) => f.cuando(registro));
    if (falla >= 0) {
      const [f] = fallas.splice(falla, 1);
      if (f.respuesta === 'red') return { red: true };
      if (f.respuesta === 'red-despues') {
        // La base hace el cambio, pero la respuesta no llega (se cortó la red o venció el tiempo).
        responder(p, url, cuerpo);
        return { red: true };
      }
      return f.respuesta;
    }
    if (sinConexion) return { red: true };
    return responder(p, url, cuerpo);
  }

  function responder(p, url, cuerpo) {
    const mAuth = /^\/auth\/v1\/([a-z]+)$/.exec(url.pathname);
    if (mAuth) return auth(p, mAuth[1], url.searchParams, cuerpo);
    if (url.pathname.startsWith('/storage/v1/')) {
      const portador = (p.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
      const uid = tokens[portador] ?? null;
      if (!uid && portador.split('.').length === 3) {
        return { status: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ statusCode: '403', error: 'InvalidJWT', message: '"exp" claim timestamp check failed' }) };
      }
      return storage(p, url.pathname, uid, p.bodyBytes ?? (typeof p.body === 'string' && !url.pathname.includes('/list/') && p.method === 'POST' ? Buffer.from(p.body) : null), typeof p.body === 'string' ? p.body : null);
    }
    const mRest = /^\/rest\/v1\/([a-z_]+)$/.exec(url.pathname);
    if (mRest) {
      const portador = (p.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
      const uid = tokens[portador] ?? null;
      // Un token de sesión que el servidor ya no reconoce (venció): PostgREST responde PGRST301.
      const rolDelToken = (() => {
        try {
          return JSON.parse(Buffer.from(portador.split('.')[1], 'base64url').toString('utf8')).role;
        } catch {
          return null;
        }
      })();
      if (!uid && portador.split('.').length === 3 && rolDelToken === 'authenticated') {
        return { status: 401, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: 'PGRST301', details: null, hint: null, message: 'JWT expired' }) };
      }
      try {
        return rest(p, mRest[1], url.searchParams, json(p.body), uid);
      } catch (e) {
        if (!(e instanceof ErrorPg)) throw e;
        return { status: e.status, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: e.code, details: null, hint: null, message: e.message }) };
      }
    }
    return { status: 404, headers: {}, body: '' };
  }

  /** fetch para supabase-js en Node. */
  async function fetchSimulado(entrada, init = {}) {
    const url = typeof entrada === 'string' ? entrada : entrada.url;
    const headers = {};
    new Headers(init.headers ?? {}).forEach((v, k) => (headers[k.toLowerCase()] = v));
    if (init.signal?.aborted) throw new DOMException('This operation was aborted', 'AbortError');
    let body = typeof init.body === 'string' ? init.body : null;
    let bodyBytes = null;
    if (init.body instanceof ArrayBuffer) bodyBytes = Buffer.from(init.body);
    else if (ArrayBuffer.isView(init.body)) bodyBytes = Buffer.from(init.body.buffer, init.body.byteOffset, init.body.byteLength);
    else if (typeof Blob !== 'undefined' && init.body instanceof Blob) bodyBytes = Buffer.from(await init.body.arrayBuffer());
    if (bodyBytes) body = null;
    const r = manejar({ method: (init.method ?? 'GET').toUpperCase(), url, headers, body, bodyBytes });
    if (r.red) throw new TypeError('fetch failed');
    return new Response(r.status === 204 ? null : r.body, { status: r.status, headers: r.headers });
  }

  return {
    manejar,
    fetch: fetchSimulado,
    datos,
    usuarios,
    pedidos,
    archivos,
    revisiones,
    /** El método de validación de la base: 'aprobar_todo' (hoy) u otro (quedan en revisión). */
    metodoValidacion(m) {
      metodo = m;
    },
    /** Como el equipo o el método: cambia el estado de un documento (y lo que eso arrastra). */
    decidirDocumento(id, estado) {
      const d = datos.documentos.find((x) => x.id === id);
      if (d) cambiarEstadoDocumento(d, estado);
    },
    /** Cambia la fecha de vencimiento de un documento (para probar avisos y vencidos). */
    fijarVencimiento(id, venceEn) {
      const d = datos.documentos.find((x) => x.id === id);
      if (d) d.vence_en = venceEn;
      if (d) recalcular(d.cuenta_id);
    },
    catalogos: cat,
    /**
     * La próxima petición que cumpla `cuando` responde `respuesta`: 'red' (no llega), 'red-despues' (la
     * base la procesa, pero la respuesta se pierde) o { status, headers, body }.
     */
    fallar(cuando, respuesta = 'red') {
      fallas.push({ cuando, respuesta });
    },
    /** Sin conexión: todo falla hasta volver a llamarla con false. */
    sinConexion(v) {
      sinConexion = v;
    },
    /** Olvida la espera de 60 s entre códigos (para no esperar en las pruebas). */
    olvidarEsperas() {
      for (const k of Object.keys(codigosPedidos)) delete codigosPedidos[k];
    },
    /** Hace que el token actual venza (la próxima lectura con él da PGRST301). */
    vencerTokens() {
      for (const k of Object.keys(tokens)) delete tokens[k];
    },
    /** Además, los refresh tokens dejan de servir (la sesión ya no se puede renovar: hay que volver a entrar). */
    anularSesiones() {
      for (const k of Object.keys(tokens)) delete tokens[k];
      for (const k of Object.keys(refrescos)) delete refrescos[k];
    },
  };
}

export const DIA = DIA_MS;
