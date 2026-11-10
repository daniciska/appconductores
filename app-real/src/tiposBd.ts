// Tipos de la base de datos de Dale Contacto (Supabase, proyecto dale-contacto, esquema public).
// GENERADO con generate_typescript_types del conector de Supabase (9-nov-2026, después de la Etapa 1,
// los textos 'prueba-1' y la columna ajustes.publico). No se edita a mano: si cambia la base, se
// vuelve a generar y se reemplaza (se omiten los ayudantes de Enums y CompositeTypes: no hay ninguno).
/* eslint-disable */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ajustes: {
        Row: {
          actualizado_en: string | null
          actualizado_por: string | null
          descripcion: string
          id: string
          publico: boolean
          valor: Json
        }
        Insert: {
          actualizado_en?: string | null
          actualizado_por?: string | null
          descripcion: string
          id: string
          publico?: boolean
          valor: Json
        }
        Update: {
          actualizado_en?: string | null
          actualizado_por?: string | null
          descripcion?: string
          id?: string
          publico?: boolean
          valor?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ajustes_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
        ]
      }
      clases_licencia: {
        Row: {
          activa: boolean
          codigo: string
          es_antigua: boolean
          habilita_clase_b: boolean
          id: number
          nombre: string | null
          orden: number
        }
        Insert: {
          activa?: boolean
          codigo: string
          es_antigua?: boolean
          habilita_clase_b?: boolean
          id?: never
          nombre?: string | null
          orden?: number
        }
        Update: {
          activa?: boolean
          codigo?: string
          es_antigua?: boolean
          habilita_clase_b?: boolean
          id?: never
          nombre?: string | null
          orden?: number
        }
        Relationships: []
      }
      comunas: {
        Row: {
          activa: boolean
          codigo_cut: string | null
          id: number
          nombre: string
          nombres_alternativos: string[]
          region_id: number
          zona_id: number
        }
        Insert: {
          activa?: boolean
          codigo_cut?: string | null
          id?: never
          nombre: string
          nombres_alternativos?: string[]
          region_id: number
          zona_id: number
        }
        Update: {
          activa?: boolean
          codigo_cut?: string | null
          id?: never
          nombre?: string
          nombres_alternativos?: string[]
          region_id?: number
          zona_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comunas_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunas_zona_id_region_id_fkey"
            columns: ["zona_id", "region_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id", "region_id"]
          },
        ]
      }
      conductor_licencias: {
        Row: {
          clase_licencia_id: number
          conductor_id: string
          origen: string
        }
        Insert: {
          clase_licencia_id: number
          conductor_id: string
          origen: string
        }
        Update: {
          clase_licencia_id?: number
          conductor_id?: string
          origen?: string
        }
        Relationships: [
          {
            foreignKeyName: "conductor_licencias_clase_licencia_id_fkey"
            columns: ["clase_licencia_id"]
            isOneToOne: false
            referencedRelation: "clases_licencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductor_licencias_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
        ]
      }
      conductor_negocios: {
        Row: {
          conductor_id: string
          negocio_id: number
        }
        Insert: {
          conductor_id: string
          negocio_id: number
        }
        Update: {
          conductor_id?: string
          negocio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conductor_negocios_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductor_negocios_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      conductor_opciones: {
        Row: {
          conductor_id: string
          opcion_id: number
        }
        Insert: {
          conductor_id: string
          opcion_id: number
        }
        Update: {
          conductor_id?: string
          opcion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "conductor_opciones_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductor_opciones_opcion_id_fkey"
            columns: ["opcion_id"]
            isOneToOne: false
            referencedRelation: "opciones"
            referencedColumns: ["id"]
          },
        ]
      }
      conductores: {
        Row: {
          actualizado_en: string
          comuna_id: number | null
          creado_en: string
          datos_extra: Json
          direccion: string | null
          direccion_detalle: string | null
          disponibilidad_confirmada_en: string | null
          disponible: boolean
          estado_perfil: string
          estado_verificacion: string
          fecha_nacimiento: string
          google_place_id: string | null
          id: string
          perfil_completo_en: string | null
          tiene_estacionamiento: boolean | null
          tramo_garantia_id: number | null
        }
        Insert: {
          actualizado_en?: string
          comuna_id?: number | null
          creado_en?: string
          datos_extra?: Json
          direccion?: string | null
          direccion_detalle?: string | null
          disponibilidad_confirmada_en?: string | null
          disponible?: boolean
          estado_perfil?: string
          estado_verificacion?: string
          fecha_nacimiento: string
          google_place_id?: string | null
          id: string
          perfil_completo_en?: string | null
          tiene_estacionamiento?: boolean | null
          tramo_garantia_id?: number | null
        }
        Update: {
          actualizado_en?: string
          comuna_id?: number | null
          creado_en?: string
          datos_extra?: Json
          direccion?: string | null
          direccion_detalle?: string | null
          disponibilidad_confirmada_en?: string | null
          disponible?: boolean
          estado_perfil?: string
          estado_verificacion?: string
          fecha_nacimiento?: string
          google_place_id?: string | null
          id?: string
          perfil_completo_en?: string | null
          tiene_estacionamiento?: boolean | null
          tramo_garantia_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conductores_comuna_id_fkey"
            columns: ["comuna_id"]
            isOneToOne: false
            referencedRelation: "comunas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductores_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conductores_tramo_garantia_id_fkey"
            columns: ["tramo_garantia_id"]
            isOneToOne: false
            referencedRelation: "opciones"
            referencedColumns: ["id"]
          },
        ]
      }
      consentimientos: {
        Row: {
          aceptado_en: string
          cuenta_id: string
          id: number
          revocado_en: string | null
          texto_autorizacion_id: number
        }
        Insert: {
          aceptado_en?: string
          cuenta_id: string
          id?: never
          revocado_en?: string | null
          texto_autorizacion_id: number
        }
        Update: {
          aceptado_en?: string
          cuenta_id?: string
          id?: never
          revocado_en?: string | null
          texto_autorizacion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "consentimientos_cuenta_id_fkey"
            columns: ["cuenta_id"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consentimientos_texto_autorizacion_id_fkey"
            columns: ["texto_autorizacion_id"]
            isOneToOne: false
            referencedRelation: "textos_autorizacion"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas: {
        Row: {
          celular: string | null
          celular_verificado_en: string | null
          creado_en: string
          email: string | null
          email_confirmado_en: string | null
          estado: string
          id: string
          nombres: string | null
          primer_apellido: string | null
          segundo_apellido: string | null
          tokens_avisos: Json | null
        }
        Insert: {
          celular?: string | null
          celular_verificado_en?: string | null
          creado_en?: string
          email?: string | null
          email_confirmado_en?: string | null
          estado?: string
          id: string
          nombres?: string | null
          primer_apellido?: string | null
          segundo_apellido?: string | null
          tokens_avisos?: Json | null
        }
        Update: {
          celular?: string | null
          celular_verificado_en?: string | null
          creado_en?: string
          email?: string | null
          email_confirmado_en?: string | null
          estado?: string
          id?: string
          nombres?: string | null
          primer_apellido?: string | null
          segundo_apellido?: string | null
          tokens_avisos?: Json | null
        }
        Relationships: []
      }
      experiencia_conductor: {
        Row: {
          actualizado_en: string
          anos: number
          conductor_id: string
          id: number
          tamano_vehiculo_id: number
        }
        Insert: {
          actualizado_en?: string
          anos: number
          conductor_id: string
          id?: never
          tamano_vehiculo_id: number
        }
        Update: {
          actualizado_en?: string
          anos?: number
          conductor_id?: string
          id?: never
          tamano_vehiculo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "experiencia_conductor_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiencia_conductor_tamano_vehiculo_id_fkey"
            columns: ["tamano_vehiculo_id"]
            isOneToOne: false
            referencedRelation: "tamanos_vehiculo"
            referencedColumns: ["id"]
          },
        ]
      }
      industrias: {
        Row: {
          activo: boolean
          id: number
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          id?: never
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          id?: never
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      listas: {
        Row: {
          clave: string
          id: number
          nombre: string
        }
        Insert: {
          clave: string
          id?: never
          nombre: string
        }
        Update: {
          clave?: string
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      miembros_equipo: {
        Row: {
          activo: boolean
          creado_en: string
          creado_por: string | null
          id: string
          rol: string
        }
        Insert: {
          activo?: boolean
          creado_en?: string
          creado_por?: string | null
          id: string
          rol: string
        }
        Update: {
          activo?: boolean
          creado_en?: string
          creado_por?: string | null
          id?: string
          rol?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembros_equipo_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "miembros_equipo_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cuentas"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_clases_licencia: {
        Row: {
          clase_licencia_id: number
          negocio_id: number
        }
        Insert: {
          clase_licencia_id: number
          negocio_id: number
        }
        Update: {
          clase_licencia_id?: number
          negocio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "negocio_clases_licencia_clase_licencia_id_fkey"
            columns: ["clase_licencia_id"]
            isOneToOne: false
            referencedRelation: "clases_licencia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocio_clases_licencia_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_tamanos: {
        Row: {
          negocio_id: number
          tamano_vehiculo_id: number
        }
        Insert: {
          negocio_id: number
          tamano_vehiculo_id: number
        }
        Update: {
          negocio_id?: number
          tamano_vehiculo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "negocio_tamanos_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocio_tamanos_tamano_vehiculo_id_fkey"
            columns: ["tamano_vehiculo_id"]
            isOneToOne: false
            referencedRelation: "tamanos_vehiculo"
            referencedColumns: ["id"]
          },
        ]
      }
      negocios: {
        Row: {
          activo: boolean
          ejemplo: string | null
          habilitante_hasta: Json | null
          id: number
          industria_id: number
          nombre: string
          nota: string | null
          orden: number
          pregunta_vehiculo: Json | null
        }
        Insert: {
          activo?: boolean
          ejemplo?: string | null
          habilitante_hasta?: Json | null
          id?: never
          industria_id: number
          nombre: string
          nota?: string | null
          orden?: number
          pregunta_vehiculo?: Json | null
        }
        Update: {
          activo?: boolean
          ejemplo?: string | null
          habilitante_hasta?: Json | null
          id?: never
          industria_id?: number
          nombre?: string
          nota?: string | null
          orden?: number
          pregunta_vehiculo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "negocios_industria_id_fkey"
            columns: ["industria_id"]
            isOneToOne: false
            referencedRelation: "industrias"
            referencedColumns: ["id"]
          },
        ]
      }
      opciones: {
        Row: {
          activa: boolean
          clave: string
          descripcion: string | null
          id: number
          lista_id: number
          nombre: string
          nombre_corto: string | null
          orden: number
          valor: number | null
        }
        Insert: {
          activa?: boolean
          clave: string
          descripcion?: string | null
          id?: never
          lista_id: number
          nombre: string
          nombre_corto?: string | null
          orden?: number
          valor?: number | null
        }
        Update: {
          activa?: boolean
          clave?: string
          descripcion?: string | null
          id?: never
          lista_id?: number
          nombre?: string
          nombre_corto?: string | null
          orden?: number
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opciones_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "listas"
            referencedColumns: ["id"]
          },
        ]
      }
      regiones: {
        Row: {
          codigo_cut: string | null
          id: number
          nombre: string
          orden: number
        }
        Insert: {
          codigo_cut?: string | null
          id?: never
          nombre: string
          orden?: number
        }
        Update: {
          codigo_cut?: string | null
          id?: never
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      tamanos_vehiculo: {
        Row: {
          activo: boolean
          ayuda: string | null
          id: number
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          ayuda?: string | null
          id?: never
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          ayuda?: string | null
          id?: never
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      textos_autorizacion: {
        Row: {
          clave: string
          enlace: string | null
          exige_aceptar_de_nuevo: boolean
          id: number
          nombre: string
          obligatoria: boolean
          orden: number
          para_quien: string
          texto: string
          version: string
          vigente: boolean
          vigente_desde: string | null
        }
        Insert: {
          clave: string
          enlace?: string | null
          exige_aceptar_de_nuevo?: boolean
          id?: never
          nombre: string
          obligatoria: boolean
          orden?: number
          para_quien: string
          texto: string
          version: string
          vigente?: boolean
          vigente_desde?: string | null
        }
        Update: {
          clave?: string
          enlace?: string | null
          exige_aceptar_de_nuevo?: boolean
          id?: never
          nombre?: string
          obligatoria?: boolean
          orden?: number
          para_quien?: string
          texto?: string
          version?: string
          vigente?: boolean
          vigente_desde?: string | null
        }
        Relationships: []
      }
      zonas: {
        Row: {
          activa: boolean
          id: number
          nombre: string
          orden: number
          region_id: number
        }
        Insert: {
          activa?: boolean
          id?: never
          nombre: string
          orden?: number
          region_id: number
        }
        Update: {
          activa?: boolean
          id?: never
          nombre?: string
          orden?: number
          region_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "zonas_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regiones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
