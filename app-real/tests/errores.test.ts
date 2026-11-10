/// <reference types="node" />
// Textos de error (src/datos/errores.ts): cada código de Auth, PostgREST y red.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  TEXTO,
  esErrorDeRed,
  segundosDeEspera,
  textoErrorGuardar,
  textoErrorPedirCodigo,
  textoErrorVerificar,
} from '../src/datos/errores.ts';

describe('errores al pedir el código (A2 y reenviar)', () => {
  it('número fuera de la lista de prueba', () => {
    assert.equal(textoErrorPedirCodigo({ code: 'sms_send_failed', status: 422 }, true), 'Por ahora solo pueden entrar los celulares del equipo.');
    assert.equal(textoErrorPedirCodigo({ code: 'sms_send_failed', status: 422 }, false), 'No pudimos enviar el código. Inténtalo de nuevo.');
  });
  it('espera entre códigos: lee los segundos del mensaje (o 60)', () => {
    const e = { code: 'over_sms_send_rate_limit', status: 429, message: 'For security purposes, you can only request this after 37 seconds.' };
    assert.equal(textoErrorPedirCodigo(e, true), 'Espera 37 segundos para pedir otro código.');
    assert.equal(segundosDeEspera('sin número'), 60);
  });
  it('proveedor apagado, demasiados intentos y número mal escrito', () => {
    assert.equal(textoErrorPedirCodigo({ code: 'phone_provider_disabled' }, true), 'El ingreso con celular no está disponible. Avísale al equipo.');
    assert.equal(textoErrorPedirCodigo({ code: 'over_request_rate_limit', status: 429 }, true), 'Demasiados intentos. Espera unos minutos.');
    assert.equal(textoErrorPedirCodigo({ code: 'validation_failed', status: 400 }, true), TEXTO.numero);
  });
  it('sin conexión o tiempo agotado', () => {
    assert.equal(textoErrorPedirCodigo({ name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' }, true), 'Revisa tu conexión e inténtalo de nuevo.');
    assert.equal(textoErrorPedirCodigo({ name: 'AuthRetryableFetchError', message: 'signal is aborted without reason' }, true), TEXTO.conexion);
  });
});

describe('errores al verificar el código (A3)', () => {
  it('código malo o vencido', () => {
    assert.equal(textoErrorVerificar({ code: 'otp_expired', status: 403 }), 'El código no es correcto o ya venció.');
    assert.equal(textoErrorVerificar({ status: 403 }), TEXTO.codigo);
  });
  it('demasiados intentos y red', () => {
    assert.equal(textoErrorVerificar({ code: 'over_request_rate_limit', status: 429 }), TEXTO.demasiados);
    assert.equal(textoErrorVerificar({ name: 'AuthRetryableFetchError', status: 0 }), TEXTO.conexion);
  });
});

describe('errores al guardar (PostgREST)', () => {
  it('las reglas de la base (23514) se muestran tal cual', () => {
    assert.equal(textoErrorGuardar({ code: '23514', message: 'Tienes que tener 18 años o más.' }), 'Tienes que tener 18 años o más.');
    assert.equal(textoErrorGuardar({ code: '23514', message: 'Tu licencia no habilita para ese negocio.' }), 'Tu licencia no habilita para ese negocio.');
  });
  it('sin permiso (42501 o RLS) y opción que ya no existe (23503)', () => {
    assert.equal(textoErrorGuardar({ code: '42501', message: 'No puedes cambiar: celular' }), 'No tienes permiso para hacer esto.');
    assert.equal(textoErrorGuardar({ code: '', message: 'new row violates row-level security policy for table "x"' }), TEXTO.sinPermiso);
    assert.equal(textoErrorGuardar({ code: '23503', message: 'violates foreign key' }), 'Esa opción ya no está disponible. Vuelve a abrir la pantalla.');
  });
  it('red (status 0, TypeError, AbortError) y token vencido', () => {
    assert.equal(textoErrorGuardar({ code: '', message: 'TypeError: Failed to fetch', status: 0 }), 'No pudimos guardar. Revisa tu conexión e inténtalo de nuevo.');
    assert.equal(textoErrorGuardar({ code: '', message: 'AbortError: The user aborted a request.' }), TEXTO.guardarConexion);
    assert.equal(textoErrorGuardar({ code: 'PGRST301', message: 'JWT expired', status: 401 }), 'Tu sesión venció. Vuelve a entrar.');
    assert.equal(textoErrorGuardar({ code: 'XX000', message: 'algo raro', status: 500 }), 'No pudimos guardar. Inténtalo de nuevo.');
  });
  it('un error de la base no se confunde con uno de red', () => {
    assert.equal(esErrorDeRed({ code: '23514', message: 'La fecha de nacimiento no puede ser futura.', status: 400 }), false);
    assert.equal(esErrorDeRed(null), false);
  });
});
