-- =====================================================================
-- Dale Contacto · Etapa 1 de la base de datos: datos iniciales
--
-- Catálogos de partida. Todo se puede cambiar después desde el panel.
-- Se puede aplicar dos veces sin duplicar nada (on conflict do nothing).
-- Los nombres se buscan con subconsultas: si uno está mal escrito, la fila
-- queda con un id nulo y la migración falla en vez de saltársela.
--
-- No se cargan textos de autorización: esperan al abogado.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Regiones, zonas y comunas (bloque generado desde el CSV)
-- ---------------------------------------------------------------------
-- >>> INICIO: generado por supabase/scripts/generar_zonas.py (no editar a mano)
-- Fuente: docs/propuesta-zonas.csv (16 regiones, 81 zonas, 346 comunas).
-- Orden de regiones y de zonas dentro de cada región: el de aparición en el CSV.

create temporary table zonas_csv (
  n            integer not null,
  orden_region integer not null,
  region       text not null,
  orden_zona   integer not null,
  zona         text not null,
  comuna       text not null,
  alternativos text[] not null
);

insert into zonas_csv (n, orden_region, region, orden_zona, zona, comuna, alternativos) values
  (1, 1, 'Arica y Parinacota', 1, 'Arica y Camarones', 'Arica', '{}'),
  (2, 1, 'Arica y Parinacota', 1, 'Arica y Camarones', 'Camarones', '{}'),
  (3, 1, 'Arica y Parinacota', 2, 'Altiplano (Parinacota)', 'Putre', '{}'),
  (4, 1, 'Arica y Parinacota', 2, 'Altiplano (Parinacota)', 'General Lagos', '{}'),
  (5, 2, 'Tarapacá', 1, 'Gran Iquique', 'Iquique', '{}'),
  (6, 2, 'Tarapacá', 1, 'Gran Iquique', 'Alto Hospicio', '{}'),
  (7, 2, 'Tarapacá', 2, 'Provincia del Tamarugal', 'Pozo Almonte', '{}'),
  (8, 2, 'Tarapacá', 2, 'Provincia del Tamarugal', 'Pica', '{}'),
  (9, 2, 'Tarapacá', 2, 'Provincia del Tamarugal', 'Huara', '{}'),
  (10, 2, 'Tarapacá', 2, 'Provincia del Tamarugal', 'Camiña', '{}'),
  (11, 2, 'Tarapacá', 2, 'Provincia del Tamarugal', 'Colchane', '{}'),
  (12, 3, 'Antofagasta', 1, 'Antofagasta y alrededores', 'Antofagasta', '{}'),
  (13, 3, 'Antofagasta', 1, 'Antofagasta y alrededores', 'Mejillones', '{}'),
  (14, 3, 'Antofagasta', 1, 'Antofagasta y alrededores', 'Sierra Gorda', '{}'),
  (15, 3, 'Antofagasta', 2, 'Calama y El Loa', 'Calama', '{}'),
  (16, 3, 'Antofagasta', 2, 'Calama y El Loa', 'San Pedro de Atacama', '{}'),
  (17, 3, 'Antofagasta', 2, 'Calama y El Loa', 'Ollagüe', '{}'),
  (18, 3, 'Antofagasta', 3, 'Tocopilla y María Elena', 'Tocopilla', '{}'),
  (19, 3, 'Antofagasta', 3, 'Tocopilla y María Elena', 'María Elena', '{}'),
  (20, 3, 'Antofagasta', 4, 'Taltal', 'Taltal', '{}'),
  (21, 4, 'Atacama', 1, 'Provincia de Copiapó', 'Copiapó', '{}'),
  (22, 4, 'Atacama', 1, 'Provincia de Copiapó', 'Tierra Amarilla', '{}'),
  (23, 4, 'Atacama', 1, 'Provincia de Copiapó', 'Caldera', '{}'),
  (24, 4, 'Atacama', 2, 'Provincia de Chañaral', 'Chañaral', '{}'),
  (25, 4, 'Atacama', 2, 'Provincia de Chañaral', 'Diego de Almagro', '{}'),
  (26, 4, 'Atacama', 3, 'Provincia de Huasco', 'Vallenar', '{}'),
  (27, 4, 'Atacama', 3, 'Provincia de Huasco', 'Freirina', '{}'),
  (28, 4, 'Atacama', 3, 'Provincia de Huasco', 'Huasco', '{}'),
  (29, 4, 'Atacama', 3, 'Provincia de Huasco', 'Alto del Carmen', '{}'),
  (30, 5, 'Coquimbo', 1, 'La Serena y Coquimbo', 'La Serena', '{}'),
  (31, 5, 'Coquimbo', 1, 'La Serena y Coquimbo', 'Coquimbo', '{}'),
  (32, 5, 'Coquimbo', 1, 'La Serena y Coquimbo', 'La Higuera', '{}'),
  (33, 5, 'Coquimbo', 1, 'La Serena y Coquimbo', 'Andacollo', '{}'),
  (34, 5, 'Coquimbo', 2, 'Valle de Elqui', 'Vicuña', '{}'),
  (35, 5, 'Coquimbo', 2, 'Valle de Elqui', 'Paiguano', array['Paihuano']),
  (36, 5, 'Coquimbo', 3, 'Provincia de Limarí', 'Ovalle', '{}'),
  (37, 5, 'Coquimbo', 3, 'Provincia de Limarí', 'Monte Patria', '{}'),
  (38, 5, 'Coquimbo', 3, 'Provincia de Limarí', 'Punitaqui', '{}'),
  (39, 5, 'Coquimbo', 3, 'Provincia de Limarí', 'Río Hurtado', '{}'),
  (40, 5, 'Coquimbo', 3, 'Provincia de Limarí', 'Combarbalá', '{}'),
  (41, 5, 'Coquimbo', 4, 'Provincia de Choapa', 'Illapel', '{}'),
  (42, 5, 'Coquimbo', 4, 'Provincia de Choapa', 'Salamanca', '{}'),
  (43, 5, 'Coquimbo', 4, 'Provincia de Choapa', 'Los Vilos', '{}'),
  (44, 5, 'Coquimbo', 4, 'Provincia de Choapa', 'Canela', '{}'),
  (45, 6, 'Valparaíso', 1, 'Gran Valparaíso', 'Valparaíso', '{}'),
  (46, 6, 'Valparaíso', 1, 'Gran Valparaíso', 'Viña del Mar', '{}'),
  (47, 6, 'Valparaíso', 1, 'Gran Valparaíso', 'Concón', '{}'),
  (48, 6, 'Valparaíso', 1, 'Gran Valparaíso', 'Quilpué', '{}'),
  (49, 6, 'Valparaíso', 1, 'Gran Valparaíso', 'Villa Alemana', '{}'),
  (50, 6, 'Valparaíso', 1, 'Gran Valparaíso', 'Casablanca', '{}'),
  (51, 6, 'Valparaíso', 2, 'Litoral Norte', 'Quintero', '{}'),
  (52, 6, 'Valparaíso', 2, 'Litoral Norte', 'Puchuncaví', '{}'),
  (53, 6, 'Valparaíso', 2, 'Litoral Norte', 'Zapallar', '{}'),
  (54, 6, 'Valparaíso', 2, 'Litoral Norte', 'Papudo', '{}'),
  (55, 6, 'Valparaíso', 3, 'La Ligua y Petorca', 'La Ligua', '{}'),
  (56, 6, 'Valparaíso', 3, 'La Ligua y Petorca', 'Cabildo', '{}'),
  (57, 6, 'Valparaíso', 3, 'La Ligua y Petorca', 'Petorca', '{}'),
  (58, 6, 'Valparaíso', 4, 'Quillota y Limache', 'Quillota', '{}'),
  (59, 6, 'Valparaíso', 4, 'Quillota y Limache', 'Calera', array['La Calera']),
  (60, 6, 'Valparaíso', 4, 'Quillota y Limache', 'La Cruz', '{}'),
  (61, 6, 'Valparaíso', 4, 'Quillota y Limache', 'Hijuelas', '{}'),
  (62, 6, 'Valparaíso', 4, 'Quillota y Limache', 'Nogales', '{}'),
  (63, 6, 'Valparaíso', 4, 'Quillota y Limache', 'Limache', '{}'),
  (64, 6, 'Valparaíso', 4, 'Quillota y Limache', 'Olmué', '{}'),
  (65, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'San Felipe', '{}'),
  (66, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Catemu', '{}'),
  (67, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Llaillay', array['Llay-Llay']),
  (68, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Panquehue', '{}'),
  (69, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Putaendo', '{}'),
  (70, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Santa María', '{}'),
  (71, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Los Andes', '{}'),
  (72, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Calle Larga', '{}'),
  (73, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'Rinconada', '{}'),
  (74, 6, 'Valparaíso', 5, 'Aconcagua (San Felipe y Los Andes)', 'San Esteban', '{}'),
  (75, 6, 'Valparaíso', 6, 'Litoral Central (San Antonio)', 'San Antonio', '{}'),
  (76, 6, 'Valparaíso', 6, 'Litoral Central (San Antonio)', 'Cartagena', '{}'),
  (77, 6, 'Valparaíso', 6, 'Litoral Central (San Antonio)', 'El Tabo', '{}'),
  (78, 6, 'Valparaíso', 6, 'Litoral Central (San Antonio)', 'El Quisco', '{}'),
  (79, 6, 'Valparaíso', 6, 'Litoral Central (San Antonio)', 'Algarrobo', '{}'),
  (80, 6, 'Valparaíso', 6, 'Litoral Central (San Antonio)', 'Santo Domingo', '{}'),
  (81, 6, 'Valparaíso', 7, 'Isla de Pascua', 'Isla de Pascua', '{}'),
  (82, 6, 'Valparaíso', 8, 'Juan Fernández', 'Juan Fernández', '{}'),
  (83, 7, 'Metropolitana de Santiago', 1, 'Zona Centro', 'Santiago', '{}'),
  (84, 7, 'Metropolitana de Santiago', 2, 'Zona Norte', 'Conchalí', '{}'),
  (85, 7, 'Metropolitana de Santiago', 2, 'Zona Norte', 'Huechuraba', '{}'),
  (86, 7, 'Metropolitana de Santiago', 2, 'Zona Norte', 'Independencia', '{}'),
  (87, 7, 'Metropolitana de Santiago', 2, 'Zona Norte', 'Quilicura', '{}'),
  (88, 7, 'Metropolitana de Santiago', 2, 'Zona Norte', 'Recoleta', '{}'),
  (89, 7, 'Metropolitana de Santiago', 2, 'Zona Norte', 'Renca', '{}'),
  (90, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'La Reina', '{}'),
  (91, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Las Condes', '{}'),
  (92, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Lo Barnechea', '{}'),
  (93, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Macul', '{}'),
  (94, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Ñuñoa', '{}'),
  (95, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Peñalolén', '{}'),
  (96, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Providencia', '{}'),
  (97, 7, 'Metropolitana de Santiago', 3, 'Zona Oriente', 'Vitacura', '{}'),
  (98, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Cerrillos', '{}'),
  (99, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Cerro Navia', '{}'),
  (100, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Estación Central', '{}'),
  (101, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Lo Prado', '{}'),
  (102, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Maipú', '{}'),
  (103, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Pudahuel', '{}'),
  (104, 7, 'Metropolitana de Santiago', 4, 'Zona Poniente', 'Quinta Normal', '{}'),
  (105, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'El Bosque', '{}'),
  (106, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'La Cisterna', '{}'),
  (107, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'La Florida', '{}'),
  (108, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'La Granja', '{}'),
  (109, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'La Pintana', '{}'),
  (110, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'Lo Espejo', '{}'),
  (111, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'Pedro Aguirre Cerda', '{}'),
  (112, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'San Joaquín', '{}'),
  (113, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'San Miguel', '{}'),
  (114, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'San Ramón', '{}'),
  (115, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'Puente Alto', '{}'),
  (116, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'San Bernardo', '{}'),
  (117, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'Pirque', '{}'),
  (118, 7, 'Metropolitana de Santiago', 5, 'Zona Sur', 'San José de Maipo', '{}'),
  (119, 7, 'Metropolitana de Santiago', 6, 'Provincia de Chacabuco', 'Colina', '{}'),
  (120, 7, 'Metropolitana de Santiago', 6, 'Provincia de Chacabuco', 'Lampa', '{}'),
  (121, 7, 'Metropolitana de Santiago', 6, 'Provincia de Chacabuco', 'Tiltil', '{}'),
  (122, 7, 'Metropolitana de Santiago', 7, 'Maipo Rural', 'Buin', '{}'),
  (123, 7, 'Metropolitana de Santiago', 7, 'Maipo Rural', 'Paine', '{}'),
  (124, 7, 'Metropolitana de Santiago', 7, 'Maipo Rural', 'Calera de Tango', '{}'),
  (125, 7, 'Metropolitana de Santiago', 8, 'Provincia de Talagante', 'Talagante', '{}'),
  (126, 7, 'Metropolitana de Santiago', 8, 'Provincia de Talagante', 'El Monte', '{}'),
  (127, 7, 'Metropolitana de Santiago', 8, 'Provincia de Talagante', 'Isla de Maipo', '{}'),
  (128, 7, 'Metropolitana de Santiago', 8, 'Provincia de Talagante', 'Padre Hurtado', '{}'),
  (129, 7, 'Metropolitana de Santiago', 8, 'Provincia de Talagante', 'Peñaflor', '{}'),
  (130, 7, 'Metropolitana de Santiago', 9, 'Provincia de Melipilla', 'Melipilla', '{}'),
  (131, 7, 'Metropolitana de Santiago', 9, 'Provincia de Melipilla', 'Alhué', '{}'),
  (132, 7, 'Metropolitana de Santiago', 9, 'Provincia de Melipilla', 'Curacaví', '{}'),
  (133, 7, 'Metropolitana de Santiago', 9, 'Provincia de Melipilla', 'María Pinto', '{}'),
  (134, 7, 'Metropolitana de Santiago', 9, 'Provincia de Melipilla', 'San Pedro', '{}'),
  (135, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Rancagua', '{}'),
  (136, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Machalí', '{}'),
  (137, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Graneros', '{}'),
  (138, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Codegua', '{}'),
  (139, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Mostazal', '{}'),
  (140, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Olivar', '{}'),
  (141, 8, 'Libertador General Bernardo O''Higgins', 1, 'Gran Rancagua', 'Doñihue', '{}'),
  (142, 8, 'Libertador General Bernardo O''Higgins', 2, 'Cachapoal Sur (Rengo)', 'Requínoa', '{}'),
  (143, 8, 'Libertador General Bernardo O''Higgins', 2, 'Cachapoal Sur (Rengo)', 'Rengo', '{}'),
  (144, 8, 'Libertador General Bernardo O''Higgins', 2, 'Cachapoal Sur (Rengo)', 'Malloa', '{}'),
  (145, 8, 'Libertador General Bernardo O''Higgins', 2, 'Cachapoal Sur (Rengo)', 'Quinta de Tilcoco', '{}'),
  (146, 8, 'Libertador General Bernardo O''Higgins', 3, 'Cachapoal Poniente (San Vicente–Peumo)', 'Coinco', '{}'),
  (147, 8, 'Libertador General Bernardo O''Higgins', 3, 'Cachapoal Poniente (San Vicente–Peumo)', 'Coltauco', '{}'),
  (148, 8, 'Libertador General Bernardo O''Higgins', 3, 'Cachapoal Poniente (San Vicente–Peumo)', 'Las Cabras', '{}'),
  (149, 8, 'Libertador General Bernardo O''Higgins', 3, 'Cachapoal Poniente (San Vicente–Peumo)', 'Peumo', '{}'),
  (150, 8, 'Libertador General Bernardo O''Higgins', 3, 'Cachapoal Poniente (San Vicente–Peumo)', 'Pichidegua', '{}'),
  (151, 8, 'Libertador General Bernardo O''Higgins', 3, 'Cachapoal Poniente (San Vicente–Peumo)', 'San Vicente', '{}'),
  (152, 8, 'Libertador General Bernardo O''Higgins', 4, 'San Fernando', 'San Fernando', '{}'),
  (153, 8, 'Libertador General Bernardo O''Higgins', 4, 'San Fernando', 'Chimbarongo', '{}'),
  (154, 8, 'Libertador General Bernardo O''Higgins', 4, 'San Fernando', 'Placilla', '{}'),
  (155, 8, 'Libertador General Bernardo O''Higgins', 4, 'San Fernando', 'Nancagua', '{}'),
  (156, 8, 'Libertador General Bernardo O''Higgins', 5, 'Valle de Colchagua (Santa Cruz)', 'Santa Cruz', '{}'),
  (157, 8, 'Libertador General Bernardo O''Higgins', 5, 'Valle de Colchagua (Santa Cruz)', 'Chépica', '{}'),
  (158, 8, 'Libertador General Bernardo O''Higgins', 5, 'Valle de Colchagua (Santa Cruz)', 'Palmilla', '{}'),
  (159, 8, 'Libertador General Bernardo O''Higgins', 5, 'Valle de Colchagua (Santa Cruz)', 'Peralillo', '{}'),
  (160, 8, 'Libertador General Bernardo O''Higgins', 5, 'Valle de Colchagua (Santa Cruz)', 'Lolol', '{}'),
  (161, 8, 'Libertador General Bernardo O''Higgins', 5, 'Valle de Colchagua (Santa Cruz)', 'Pumanque', '{}'),
  (162, 8, 'Libertador General Bernardo O''Higgins', 6, 'Costa (Cardenal Caro)', 'Pichilemu', '{}'),
  (163, 8, 'Libertador General Bernardo O''Higgins', 6, 'Costa (Cardenal Caro)', 'Marchihue', '{}'),
  (164, 8, 'Libertador General Bernardo O''Higgins', 6, 'Costa (Cardenal Caro)', 'La Estrella', '{}'),
  (165, 8, 'Libertador General Bernardo O''Higgins', 6, 'Costa (Cardenal Caro)', 'Litueche', '{}'),
  (166, 8, 'Libertador General Bernardo O''Higgins', 6, 'Costa (Cardenal Caro)', 'Navidad', '{}'),
  (167, 8, 'Libertador General Bernardo O''Higgins', 6, 'Costa (Cardenal Caro)', 'Paredones', '{}'),
  (168, 9, 'Maule', 1, 'Gran Talca', 'Talca', '{}'),
  (169, 9, 'Maule', 1, 'Gran Talca', 'Maule', '{}'),
  (170, 9, 'Maule', 1, 'Gran Talca', 'San Clemente', '{}'),
  (171, 9, 'Maule', 1, 'Gran Talca', 'Pelarco', '{}'),
  (172, 9, 'Maule', 1, 'Gran Talca', 'Pencahue', '{}'),
  (173, 9, 'Maule', 1, 'Gran Talca', 'San Rafael', '{}'),
  (174, 9, 'Maule', 1, 'Gran Talca', 'Río Claro', '{}'),
  (175, 9, 'Maule', 2, 'Costa de Talca (Constitución)', 'Constitución', '{}'),
  (176, 9, 'Maule', 2, 'Costa de Talca (Constitución)', 'Empedrado', '{}'),
  (177, 9, 'Maule', 2, 'Costa de Talca (Constitución)', 'Curepto', '{}'),
  (178, 9, 'Maule', 3, 'Gran Curicó', 'Curicó', '{}'),
  (179, 9, 'Maule', 3, 'Gran Curicó', 'Molina', '{}'),
  (180, 9, 'Maule', 3, 'Gran Curicó', 'Teno', '{}'),
  (181, 9, 'Maule', 3, 'Gran Curicó', 'Romeral', '{}'),
  (182, 9, 'Maule', 3, 'Gran Curicó', 'Rauco', '{}'),
  (183, 9, 'Maule', 3, 'Gran Curicó', 'Sagrada Familia', '{}'),
  (184, 9, 'Maule', 4, 'Costa de Curicó (Licantén)', 'Hualañé', '{}'),
  (185, 9, 'Maule', 4, 'Costa de Curicó (Licantén)', 'Licantén', '{}'),
  (186, 9, 'Maule', 4, 'Costa de Curicó (Licantén)', 'Vichuquén', '{}'),
  (187, 9, 'Maule', 5, 'Gran Linares', 'Linares', '{}'),
  (188, 9, 'Maule', 5, 'Gran Linares', 'Yerbas Buenas', '{}'),
  (189, 9, 'Maule', 5, 'Gran Linares', 'Colbún', '{}'),
  (190, 9, 'Maule', 5, 'Gran Linares', 'Longaví', '{}'),
  (191, 9, 'Maule', 5, 'Gran Linares', 'Villa Alegre', '{}'),
  (192, 9, 'Maule', 5, 'Gran Linares', 'San Javier', '{}'),
  (193, 9, 'Maule', 6, 'Parral y Retiro', 'Parral', '{}'),
  (194, 9, 'Maule', 6, 'Parral y Retiro', 'Retiro', '{}'),
  (195, 9, 'Maule', 7, 'Provincia de Cauquenes', 'Cauquenes', '{}'),
  (196, 9, 'Maule', 7, 'Provincia de Cauquenes', 'Chanco', '{}'),
  (197, 9, 'Maule', 7, 'Provincia de Cauquenes', 'Pelluhue', '{}'),
  (198, 10, 'Ñuble', 1, 'Gran Chillán', 'Chillán', '{}'),
  (199, 10, 'Ñuble', 1, 'Gran Chillán', 'Chillán Viejo', '{}'),
  (200, 10, 'Ñuble', 1, 'Gran Chillán', 'Pinto', '{}'),
  (201, 10, 'Ñuble', 1, 'Gran Chillán', 'Coihueco', '{}'),
  (202, 10, 'Ñuble', 2, 'Punilla (San Carlos)', 'San Carlos', '{}'),
  (203, 10, 'Ñuble', 2, 'Punilla (San Carlos)', 'San Nicolás', '{}'),
  (204, 10, 'Ñuble', 2, 'Punilla (San Carlos)', 'Ñiquén', '{}'),
  (205, 10, 'Ñuble', 2, 'Punilla (San Carlos)', 'San Fabián', '{}'),
  (206, 10, 'Ñuble', 3, 'Diguillín Sur (Bulnes–Yungay)', 'Bulnes', '{}'),
  (207, 10, 'Ñuble', 3, 'Diguillín Sur (Bulnes–Yungay)', 'Quillón', '{}'),
  (208, 10, 'Ñuble', 3, 'Diguillín Sur (Bulnes–Yungay)', 'San Ignacio', '{}'),
  (209, 10, 'Ñuble', 3, 'Diguillín Sur (Bulnes–Yungay)', 'El Carmen', '{}'),
  (210, 10, 'Ñuble', 3, 'Diguillín Sur (Bulnes–Yungay)', 'Pemuco', '{}'),
  (211, 10, 'Ñuble', 3, 'Diguillín Sur (Bulnes–Yungay)', 'Yungay', '{}'),
  (212, 10, 'Ñuble', 4, 'Valle del Itata', 'Quirihue', '{}'),
  (213, 10, 'Ñuble', 4, 'Valle del Itata', 'Cobquecura', '{}'),
  (214, 10, 'Ñuble', 4, 'Valle del Itata', 'Coelemu', '{}'),
  (215, 10, 'Ñuble', 4, 'Valle del Itata', 'Ninhue', '{}'),
  (216, 10, 'Ñuble', 4, 'Valle del Itata', 'Portezuelo', '{}'),
  (217, 10, 'Ñuble', 4, 'Valle del Itata', 'Ránquil', '{}'),
  (218, 10, 'Ñuble', 4, 'Valle del Itata', 'Treguaco', '{}'),
  (219, 11, 'Biobío', 1, 'Gran Concepción', 'Concepción', '{}'),
  (220, 11, 'Biobío', 1, 'Gran Concepción', 'Talcahuano', '{}'),
  (221, 11, 'Biobío', 1, 'Gran Concepción', 'Hualpén', '{}'),
  (222, 11, 'Biobío', 1, 'Gran Concepción', 'San Pedro de la Paz', '{}'),
  (223, 11, 'Biobío', 1, 'Gran Concepción', 'Chiguayante', '{}'),
  (224, 11, 'Biobío', 1, 'Gran Concepción', 'Penco', '{}'),
  (225, 11, 'Biobío', 1, 'Gran Concepción', 'Tomé', '{}'),
  (226, 11, 'Biobío', 1, 'Gran Concepción', 'Hualqui', '{}'),
  (227, 11, 'Biobío', 1, 'Gran Concepción', 'Coronel', '{}'),
  (228, 11, 'Biobío', 1, 'Gran Concepción', 'Lota', '{}'),
  (229, 11, 'Biobío', 1, 'Gran Concepción', 'Florida', '{}'),
  (230, 11, 'Biobío', 1, 'Gran Concepción', 'Santa Juana', '{}'),
  (231, 11, 'Biobío', 2, 'Arauco Norte', 'Arauco', '{}'),
  (232, 11, 'Biobío', 2, 'Arauco Norte', 'Curanilahue', '{}'),
  (233, 11, 'Biobío', 2, 'Arauco Norte', 'Los Álamos', '{}'),
  (234, 11, 'Biobío', 2, 'Arauco Norte', 'Lebu', '{}'),
  (235, 11, 'Biobío', 3, 'Arauco Sur', 'Cañete', '{}'),
  (236, 11, 'Biobío', 3, 'Arauco Sur', 'Contulmo', '{}'),
  (237, 11, 'Biobío', 3, 'Arauco Sur', 'Tirúa', '{}'),
  (238, 11, 'Biobío', 4, 'Los Ángeles y alrededores', 'Los Ángeles', '{}'),
  (239, 11, 'Biobío', 4, 'Los Ángeles y alrededores', 'Negrete', '{}'),
  (240, 11, 'Biobío', 4, 'Los Ángeles y alrededores', 'Nacimiento', '{}'),
  (241, 11, 'Biobío', 4, 'Los Ángeles y alrededores', 'Mulchén', '{}'),
  (242, 11, 'Biobío', 5, 'Biobío Norte', 'Cabrero', '{}'),
  (243, 11, 'Biobío', 5, 'Biobío Norte', 'Yumbel', '{}'),
  (244, 11, 'Biobío', 5, 'Biobío Norte', 'Laja', '{}'),
  (245, 11, 'Biobío', 5, 'Biobío Norte', 'San Rosendo', '{}'),
  (246, 11, 'Biobío', 6, 'Biobío Cordillera', 'Tucapel', '{}'),
  (247, 11, 'Biobío', 6, 'Biobío Cordillera', 'Antuco', '{}'),
  (248, 11, 'Biobío', 6, 'Biobío Cordillera', 'Quilleco', '{}'),
  (249, 11, 'Biobío', 6, 'Biobío Cordillera', 'Santa Bárbara', '{}'),
  (250, 11, 'Biobío', 6, 'Biobío Cordillera', 'Quilaco', '{}'),
  (251, 11, 'Biobío', 6, 'Biobío Cordillera', 'Alto Biobío', '{}'),
  (252, 12, 'La Araucanía', 1, 'Gran Temuco', 'Temuco', '{}'),
  (253, 12, 'La Araucanía', 1, 'Gran Temuco', 'Padre Las Casas', '{}'),
  (254, 12, 'La Araucanía', 1, 'Gran Temuco', 'Lautaro', '{}'),
  (255, 12, 'La Araucanía', 1, 'Gran Temuco', 'Perquenco', '{}'),
  (256, 12, 'La Araucanía', 1, 'Gran Temuco', 'Cholchol', '{}'),
  (257, 12, 'La Araucanía', 1, 'Gran Temuco', 'Galvarino', '{}'),
  (258, 12, 'La Araucanía', 1, 'Gran Temuco', 'Freire', '{}'),
  (259, 12, 'La Araucanía', 2, 'Costa Araucanía', 'Nueva Imperial', '{}'),
  (260, 12, 'La Araucanía', 2, 'Costa Araucanía', 'Carahue', '{}'),
  (261, 12, 'La Araucanía', 2, 'Costa Araucanía', 'Saavedra', '{}'),
  (262, 12, 'La Araucanía', 2, 'Costa Araucanía', 'Teodoro Schmidt', '{}'),
  (263, 12, 'La Araucanía', 2, 'Costa Araucanía', 'Toltén', '{}'),
  (264, 12, 'La Araucanía', 3, 'Cautín Sur', 'Pitrufquén', '{}'),
  (265, 12, 'La Araucanía', 3, 'Cautín Sur', 'Gorbea', '{}'),
  (266, 12, 'La Araucanía', 3, 'Cautín Sur', 'Loncoche', '{}'),
  (267, 12, 'La Araucanía', 4, 'Zona Lacustre', 'Villarrica', '{}'),
  (268, 12, 'La Araucanía', 4, 'Zona Lacustre', 'Pucón', '{}'),
  (269, 12, 'La Araucanía', 4, 'Zona Lacustre', 'Curarrehue', '{}'),
  (270, 12, 'La Araucanía', 5, 'Precordillera', 'Vilcún', '{}'),
  (271, 12, 'La Araucanía', 5, 'Precordillera', 'Cunco', '{}'),
  (272, 12, 'La Araucanía', 5, 'Precordillera', 'Melipeuco', '{}'),
  (273, 12, 'La Araucanía', 6, 'Malleco Poniente', 'Angol', '{}'),
  (274, 12, 'La Araucanía', 6, 'Malleco Poniente', 'Renaico', '{}'),
  (275, 12, 'La Araucanía', 6, 'Malleco Poniente', 'Los Sauces', '{}'),
  (276, 12, 'La Araucanía', 6, 'Malleco Poniente', 'Purén', '{}'),
  (277, 12, 'La Araucanía', 6, 'Malleco Poniente', 'Lumaco', '{}'),
  (278, 12, 'La Araucanía', 6, 'Malleco Poniente', 'Traiguén', '{}'),
  (279, 12, 'La Araucanía', 7, 'Malleco Oriente', 'Victoria', '{}'),
  (280, 12, 'La Araucanía', 7, 'Malleco Oriente', 'Collipulli', '{}'),
  (281, 12, 'La Araucanía', 7, 'Malleco Oriente', 'Ercilla', '{}'),
  (282, 12, 'La Araucanía', 7, 'Malleco Oriente', 'Curacautín', '{}'),
  (283, 12, 'La Araucanía', 7, 'Malleco Oriente', 'Lonquimay', '{}'),
  (284, 13, 'Los Ríos', 1, 'Gran Valdivia', 'Valdivia', '{}'),
  (285, 13, 'Los Ríos', 1, 'Gran Valdivia', 'Corral', '{}'),
  (286, 13, 'Los Ríos', 2, 'Valdivia Norte', 'Mariquina', '{}'),
  (287, 13, 'Los Ríos', 2, 'Valdivia Norte', 'Lanco', '{}'),
  (288, 13, 'Los Ríos', 2, 'Valdivia Norte', 'Máfil', '{}'),
  (289, 13, 'Los Ríos', 3, 'Panguipulli y Los Lagos', 'Panguipulli', '{}'),
  (290, 13, 'Los Ríos', 3, 'Panguipulli y Los Lagos', 'Los Lagos', '{}'),
  (291, 13, 'Los Ríos', 4, 'Ranco y Paillaco', 'La Unión', '{}'),
  (292, 13, 'Los Ríos', 4, 'Ranco y Paillaco', 'Río Bueno', '{}'),
  (293, 13, 'Los Ríos', 4, 'Ranco y Paillaco', 'Futrono', '{}'),
  (294, 13, 'Los Ríos', 4, 'Ranco y Paillaco', 'Lago Ranco', '{}'),
  (295, 13, 'Los Ríos', 4, 'Ranco y Paillaco', 'Paillaco', '{}'),
  (296, 14, 'Los Lagos', 1, 'Gran Puerto Montt', 'Puerto Montt', '{}'),
  (297, 14, 'Los Lagos', 1, 'Gran Puerto Montt', 'Puerto Varas', '{}'),
  (298, 14, 'Los Lagos', 1, 'Gran Puerto Montt', 'Llanquihue', '{}'),
  (299, 14, 'Los Lagos', 1, 'Gran Puerto Montt', 'Frutillar', '{}'),
  (300, 14, 'Los Lagos', 1, 'Gran Puerto Montt', 'Cochamó', '{}'),
  (301, 14, 'Los Lagos', 2, 'Llanquihue Poniente', 'Calbuco', '{}'),
  (302, 14, 'Los Lagos', 2, 'Llanquihue Poniente', 'Maullín', '{}'),
  (303, 14, 'Los Lagos', 2, 'Llanquihue Poniente', 'Los Muermos', '{}'),
  (304, 14, 'Los Lagos', 2, 'Llanquihue Poniente', 'Fresia', '{}'),
  (305, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'Osorno', '{}'),
  (306, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'San Pablo', '{}'),
  (307, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'San Juan de la Costa', '{}'),
  (308, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'Río Negro', '{}'),
  (309, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'Purranque', '{}'),
  (310, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'Puyehue', '{}'),
  (311, 14, 'Los Lagos', 3, 'Provincia de Osorno', 'Puerto Octay', '{}'),
  (312, 14, 'Los Lagos', 4, 'Chiloé Norte', 'Ancud', '{}'),
  (313, 14, 'Los Lagos', 4, 'Chiloé Norte', 'Quemchi', '{}'),
  (314, 14, 'Los Lagos', 5, 'Chiloé Centro', 'Castro', '{}'),
  (315, 14, 'Los Lagos', 5, 'Chiloé Centro', 'Dalcahue', '{}'),
  (316, 14, 'Los Lagos', 5, 'Chiloé Centro', 'Chonchi', '{}'),
  (317, 14, 'Los Lagos', 5, 'Chiloé Centro', 'Curaco de Vélez', '{}'),
  (318, 14, 'Los Lagos', 5, 'Chiloé Centro', 'Quinchao', '{}'),
  (319, 14, 'Los Lagos', 5, 'Chiloé Centro', 'Puqueldón', '{}'),
  (320, 14, 'Los Lagos', 6, 'Chiloé Sur', 'Quellón', '{}'),
  (321, 14, 'Los Lagos', 6, 'Chiloé Sur', 'Queilén', '{}'),
  (322, 14, 'Los Lagos', 7, 'Provincia de Palena', 'Chaitén', '{}'),
  (323, 14, 'Los Lagos', 7, 'Provincia de Palena', 'Futaleufú', '{}'),
  (324, 14, 'Los Lagos', 7, 'Provincia de Palena', 'Palena', '{}'),
  (325, 14, 'Los Lagos', 7, 'Provincia de Palena', 'Hualaihué', '{}'),
  (326, 15, 'Aysén del General Carlos Ibáñez del Campo', 1, 'Coyhaique y Puerto Aysén', 'Coyhaique', '{}'),
  (327, 15, 'Aysén del General Carlos Ibáñez del Campo', 1, 'Coyhaique y Puerto Aysén', 'Aysén', '{}'),
  (328, 15, 'Aysén del General Carlos Ibáñez del Campo', 2, 'Aysén Norte', 'Cisnes', '{}'),
  (329, 15, 'Aysén del General Carlos Ibáñez del Campo', 2, 'Aysén Norte', 'Lago Verde', '{}'),
  (330, 15, 'Aysén del General Carlos Ibáñez del Campo', 2, 'Aysén Norte', 'Guaitecas', '{}'),
  (331, 15, 'Aysén del General Carlos Ibáñez del Campo', 3, 'General Carrera', 'Chile Chico', '{}'),
  (332, 15, 'Aysén del General Carlos Ibáñez del Campo', 3, 'General Carrera', 'Río Ibáñez', '{}'),
  (333, 15, 'Aysén del General Carlos Ibáñez del Campo', 4, 'Capitán Prat', 'Cochrane', '{}'),
  (334, 15, 'Aysén del General Carlos Ibáñez del Campo', 4, 'Capitán Prat', 'O''Higgins', '{}'),
  (335, 15, 'Aysén del General Carlos Ibáñez del Campo', 4, 'Capitán Prat', 'Tortel', '{}'),
  (336, 16, 'Magallanes y de la Antártica Chilena', 1, 'Punta Arenas', 'Punta Arenas', '{}'),
  (337, 16, 'Magallanes y de la Antártica Chilena', 1, 'Punta Arenas', 'Laguna Blanca', '{}'),
  (338, 16, 'Magallanes y de la Antártica Chilena', 1, 'Punta Arenas', 'Río Verde', '{}'),
  (339, 16, 'Magallanes y de la Antártica Chilena', 1, 'Punta Arenas', 'San Gregorio', '{}'),
  (340, 16, 'Magallanes y de la Antártica Chilena', 2, 'Última Esperanza', 'Natales', '{}'),
  (341, 16, 'Magallanes y de la Antártica Chilena', 2, 'Última Esperanza', 'Torres del Paine', '{}'),
  (342, 16, 'Magallanes y de la Antártica Chilena', 3, 'Tierra del Fuego', 'Porvenir', '{}'),
  (343, 16, 'Magallanes y de la Antártica Chilena', 3, 'Tierra del Fuego', 'Primavera', '{}'),
  (344, 16, 'Magallanes y de la Antártica Chilena', 3, 'Tierra del Fuego', 'Timaukel', '{}'),
  (345, 16, 'Magallanes y de la Antártica Chilena', 4, 'Antártica Chilena', 'Cabo de Hornos', '{}'),
  (346, 16, 'Magallanes y de la Antártica Chilena', 4, 'Antártica Chilena', 'Antártica', '{}');

insert into public.regiones (nombre, orden)
select v.region, v.orden_region
  from (select distinct region, orden_region from zonas_csv) v
 order by v.orden_region
on conflict (nombre) do nothing;

insert into public.zonas (region_id, nombre, orden)
select (select r.id from public.regiones r where r.nombre = v.region),
       v.zona,
       v.orden_zona
  from (select distinct region, orden_region, zona, orden_zona from zonas_csv) v
 order by v.orden_region, v.orden_zona
on conflict (region_id, nombre) do nothing;

insert into public.comunas (nombre, nombres_alternativos, region_id, zona_id)
select v.comuna,
       v.alternativos,
       (select r.id from public.regiones r where r.nombre = v.region),
       (select z.id
          from public.zonas z
          join public.regiones r on r.id = z.region_id
         where r.nombre = v.region and z.nombre = v.zona)
  from zonas_csv v
 order by v.n
on conflict (region_id, nombre) do nothing;

do $$
declare
  v_faltan integer;
begin
  if (select count(distinct region) from zonas_csv) <> 16
     or (select count(distinct (region, zona)) from zonas_csv) <> 81
     or (select count(*) from zonas_csv) <> 346 then
    raise exception 'Los datos generados no tienen 16/81/346 filas';
  end if;

  select count(*) into v_faltan
    from zonas_csv v
   where not exists (
     select 1
       from public.comunas c
       join public.regiones r on r.id = c.region_id
       join public.zonas z on z.id = c.zona_id
      where c.nombre = v.comuna and r.nombre = v.region and z.nombre = v.zona
        and c.nombres_alternativos = v.alternativos
   );
  if v_faltan > 0 then
    raise exception '% comunas del CSV no quedaron en su región y zona', v_faltan;
  end if;
end
$$;

drop table zonas_csv;
-- <<< FIN: generado por supabase/scripts/generar_zonas.py


-- ---------------------------------------------------------------------
-- 2. Clases de licencia
-- Que las clases A y las antiguas habiliten lo de la B: según ChileAtiende
-- y CONASET [verificar art. 12 Ley 18.290].
-- ---------------------------------------------------------------------
insert into public.clases_licencia (codigo, nombre, es_antigua, habilita_clase_b, orden) values
  ('A1',         'Clase A1',                   false, true,   1),
  ('A2',         'Clase A2',                   false, true,   2),
  ('A3',         'Clase A3',                   false, true,   3),
  ('A4',         'Clase A4',                   false, true,   4),
  ('A5',         'Clase A5',                   false, true,   5),
  ('B',          'Clase B',                    false, true,   6),
  ('C',          'Clase C',                    false, false,  7),
  ('D',          'Clase D',                    false, false,  8),
  ('A1 antigua', 'A1 antigua (antes de 1997)', true,  true,   9),
  ('A2 antigua', 'A2 antigua (antes de 1997)', true,  true,  10)
on conflict (codigo) do nothing;


-- ---------------------------------------------------------------------
-- 3. Industrias (en el lanzamiento, carga parte apagada)
-- ---------------------------------------------------------------------
insert into public.industrias (nombre, orden, activo) values
  ('Transporte de pasajeros', 1, true),
  ('Transporte de carga',     2, false)
on conflict (nombre) do nothing;


-- ---------------------------------------------------------------------
-- 4. Tipos de vehículo para la experiencia (Paso 3)
-- ---------------------------------------------------------------------
insert into public.tamanos_vehiculo (nombre, ayuda, orden) values
  ('Moto',              'moto, scooter',                    1),
  ('Vehículo liviano',  'auto, SUV, camioneta',             2),
  ('Van o minibús',     'van, furgón, minibús',             3),
  ('Bus',               'bus o micro',                      4),
  ('Camión',            '3/4, camión simple, grúa de autos', 5),
  ('Camión articulado', 'tracto con rampla',                6),
  ('Maquinaria',        'grúa horquilla, retroexcavadora',  7)
on conflict (nombre) do nothing;


-- ---------------------------------------------------------------------
-- 5. Negocios (en el lanzamiento solo Taxi y Taxi ejecutivo)
-- pregunta_vehiculo: solo donde la licencia depende del vehículo. Sus
-- textos son provisionales hasta la maqueta del titular.
-- ---------------------------------------------------------------------
insert into public.negocios (industria_id, nombre, ejemplo, orden, activo, nota, pregunta_vehiculo)
select (select i.id from public.industrias i where i.nombre = v.industria),
       v.nombre, v.ejemplo, v.orden, v.activo, v.nota, v.pregunta::jsonb
  from (values
    ('Transporte de pasajeros', 'Taxi', null, 1, true,
     'A1 antigua: asignación provisional [verificar].',
     null),
    ('Transporte de pasajeros', 'Taxi colectivo', 'recorrido fijo', 2, false,
     'A1 antigua: asignación provisional [verificar].',
     null),
    ('Transporte de pasajeros', 'Taxi ejecutivo', 'radiotaxi, aeropuerto', 3, true,
     'A1 antigua: asignación provisional [verificar].',
     null),
    ('Transporte de pasajeros', 'Transporte por aplicación', 'apps de pasajeros', 4, false,
     'Hoy basta la B (y las clases que habilitan B). Con la Ley 21.553 se exigirá licencia profesional, con 12 meses de transición [verificar en el Diario Oficial].',
     null),
    ('Transporte de pasajeros', 'Van o bus de turismo', 'tours, traslados, eventos', 5, false,
     'Texto de la pregunta provisional. La licencia depende de los pasajeros. A1 antigua: provisional [verificar]. La A2 no se acepta sobre 17 pasajeros: no se puede comprobar su antigüedad (Ley 21.114).',
     '{"pregunta": "¿Cuántos pasajeros?", "respuestas": [
        {"clave": "hasta_9",    "texto": "Hasta 9",   "clases": ["B"]},
        {"clave": "de_10_a_17", "texto": "10 a 17",   "clases": ["A2", "A3", "A1 antigua"]},
        {"clave": "de_18_a_32", "texto": "18 a 32",   "clases": ["A3", "A1 antigua"]},
        {"clave": "mas_de_32",  "texto": "Más de 32", "clases": ["A3", "A1 antigua"]}]}'),
    ('Transporte de pasajeros', 'Bus interurbano', 'viajes entre ciudades', 6, false,
     'A1 antigua: provisional [verificar].',
     null),
    ('Transporte de carga', 'Camión de carga interurbano', 'entre ciudades', 7, false,
     'Texto de la pregunta provisional. La licencia depende del peso; tracto con rampla: A5. A2 antigua: provisional [verificar].',
     '{"pregunta": "¿Qué vehículo es?", "respuestas": [
        {"clave": "hasta_3500",  "texto": "Hasta 3.500 kg",    "clases": ["B"]},
        {"clave": "mas_de_3500", "texto": "Más de 3.500 kg",   "clases": ["A4", "A5", "A2 antigua"]},
        {"clave": "tracto",      "texto": "Tracto con rampla", "clases": ["A5"]}]}'),
    ('Transporte de carga', 'Camión de carga urbano', 'reparto dentro de la ciudad', 8, false,
     'Texto de la pregunta provisional. La licencia depende del peso; tracto con rampla: A5. A2 antigua: provisional [verificar].',
     '{"pregunta": "¿Qué vehículo es?", "respuestas": [
        {"clave": "hasta_3500",  "texto": "Hasta 3.500 kg",    "clases": ["B"]},
        {"clave": "mas_de_3500", "texto": "Más de 3.500 kg",   "clases": ["A4", "A5", "A2 antigua"]},
        {"clave": "tracto",      "texto": "Tracto con rampla", "clases": ["A5"]}]}'),
    ('Transporte de carga', 'Reparto en furgón', 'última milla, paquetes', 9, false,
     'Texto de la pregunta provisional. La licencia depende del peso. A2 antigua: provisional [verificar].',
     '{"pregunta": "¿Cuánto pesa?", "respuestas": [
        {"clave": "hasta_3500",  "texto": "Hasta 3.500 kg",  "clases": ["B"]},
        {"clave": "mas_de_3500", "texto": "Más de 3.500 kg", "clases": ["A4", "A5", "A2 antigua"]}]}'),
    ('Transporte de carga', 'Grúa de autos', 'rescate y traslado de vehículos', 10, false,
     'Texto de la pregunta provisional. La licencia depende del peso. A2 antigua: provisional [verificar]. No incluye camión pluma ni grúa horquilla.',
     '{"pregunta": "¿Cuánto pesa?", "respuestas": [
        {"clave": "hasta_3500",  "texto": "Hasta 3.500 kg",  "clases": ["B"]},
        {"clave": "mas_de_3500", "texto": "Más de 3.500 kg", "clases": ["A4", "A5", "A2 antigua"]}]}'),
    ('Transporte de carga', 'Moto delivery', 'comercios, farmacias', 11, false,
     null,
     null)
  ) as v (industria, nombre, ejemplo, orden, activo, nota, pregunta)
on conflict (nombre) do nothing;


-- ---------------------------------------------------------------------
-- 6. Clases que habilitan cada negocio (filtro F2)
-- "B" incluye a las clases con habilita_clase_b; no se repiten aquí.
-- ---------------------------------------------------------------------
insert into public.negocio_clases_licencia (negocio_id, clase_licencia_id)
select (select n.id from public.negocios n where n.nombre = v.negocio),
       (select c.id from public.clases_licencia c where c.codigo = u.clase)
  from (values
    ('Taxi',                        array['A1', 'A2', 'A3', 'A1 antigua']),
    ('Taxi colectivo',              array['A1', 'A2', 'A3', 'A1 antigua']),
    ('Taxi ejecutivo',              array['A1', 'A2', 'A3', 'A1 antigua']),
    ('Transporte por aplicación',   array['B']),
    ('Van o bus de turismo',        array['B', 'A2', 'A3', 'A1 antigua']),
    ('Bus interurbano',             array['A3', 'A1 antigua']),
    ('Camión de carga interurbano', array['B', 'A4', 'A5', 'A2 antigua']),
    ('Camión de carga urbano',      array['B', 'A4', 'A5', 'A2 antigua']),
    ('Reparto en furgón',           array['B', 'A4', 'A5', 'A2 antigua']),
    ('Grúa de autos',               array['B', 'A4', 'A5', 'A2 antigua']),
    ('Moto delivery',               array['C'])
  ) as v (negocio, clases)
  cross join lateral unnest(v.clases) as u (clase)
on conflict do nothing;


-- ---------------------------------------------------------------------
-- 7. Categorías de experiencia que cuentan para los años (M4)
-- ---------------------------------------------------------------------
insert into public.negocio_tamanos (negocio_id, tamano_vehiculo_id)
select (select n.id from public.negocios n where n.nombre = v.negocio),
       (select t.id from public.tamanos_vehiculo t where t.nombre = u.tamano)
  from (values
    ('Taxi',                        array['Vehículo liviano']),
    ('Taxi ejecutivo',              array['Vehículo liviano']),
    ('Transporte por aplicación',   array['Vehículo liviano']),
    ('Taxi colectivo',              array['Vehículo liviano', 'Van o minibús']),
    ('Van o bus de turismo',        array['Van o minibús', 'Bus']),
    ('Bus interurbano',             array['Bus']),
    ('Camión de carga interurbano', array['Camión', 'Camión articulado']),
    ('Camión de carga urbano',      array['Camión']),
    ('Reparto en furgón',           array['Van o minibús', 'Vehículo liviano']),
    ('Grúa de autos',               array['Camión']),
    ('Moto delivery',               array['Moto'])
  ) as v (negocio, tamanos)
  cross join lateral unnest(v.tamanos) as u (tamano)
on conflict do nothing;


-- ---------------------------------------------------------------------
-- 8. Listas de opciones
-- modo_contrato queda cargado pero inactivo: es crecimiento futuro (2-nov).
-- idioma: idiomas que habla el conductor (Paso 3, opcional, no cuenta en el
-- match). Las opciones son una PROPUESTA de Claude (2-nov); se cambian desde el panel.
-- ---------------------------------------------------------------------
insert into public.listas (clave, nombre) values
  ('turno',         'Turnos'),
  ('dia_semana',    'Días de la semana'),
  ('idioma',        'Idiomas'),
  ('modo_contrato', 'Modos de contrato')
on conflict (clave) do nothing;

insert into public.opciones (lista_id, clave, nombre, nombre_corto, orden, activa)
select (select l.id from public.listas l where l.clave = v.lista),
       v.clave, v.nombre, v.nombre_corto, v.orden, v.activa
  from (values
    ('turno',         'dia',                   'Día',                null, 1, true),
    ('turno',         'noche',                 'Noche',              null, 2, true),
    ('dia_semana',    'lu',                    'Lunes',              'Lu', 1, true),
    ('dia_semana',    'ma',                    'Martes',             'Ma', 2, true),
    ('dia_semana',    'mi',                    'Miércoles',          'Mi', 3, true),
    ('dia_semana',    'ju',                    'Jueves',             'Ju', 4, true),
    ('dia_semana',    'vi',                    'Viernes',            'Vi', 5, true),
    ('dia_semana',    'sa',                    'Sábado',             'Sá', 6, true),
    ('dia_semana',    'do',                    'Domingo',            'Do', 7, true),
    ('idioma',        'es',                    'Español',            null, 1, true),
    ('idioma',        'en',                    'Inglés',             null, 2, true),
    ('idioma',        'pt',                    'Portugués',          null, 3, true),
    ('idioma',        'fr',                    'Francés',            null, 4, true),
    ('idioma',        'ht',                    'Criollo haitiano',   null, 5, true),
    ('modo_contrato','arriendo_fijo',         'Arriendo fijo',      null, 1, false),
    ('modo_contrato', 'porcentaje_ganancia',   '% de ganancia',      null, 2, false),
    ('modo_contrato', 'porcentaje_produccion', '% sobre producción', null, 3, false)
  ) as v (lista, clave, nombre, nombre_corto, orden, activa)
on conflict (lista_id, clave) do nothing;


-- ---------------------------------------------------------------------
-- 9. Ajustes
-- ---------------------------------------------------------------------
insert into public.ajustes (id, valor, descripcion) values
  ('umbral_match', '66', 'Porcentaje mínimo de coincidencia para que haya match (decidido).')
on conflict (id) do nothing;
