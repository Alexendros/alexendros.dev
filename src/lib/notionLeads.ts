import { Client, isFullPage } from '@notionhq/client';
import type { CreatePageParameters, PageObjectResponse } from '@notionhq/client';

type NotionProperties = NonNullable<CreatePageParameters['properties']>;

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RICH_TEXT_MAX = 2000;

export const NOTION_PROP = {
  nombre: 'Nombre',
  email: 'Email',
  canal: 'Canal',
  tipo: 'Tipo',
  estado: 'Estado',
  asunto: 'Asunto',
  mensaje: 'Mensaje',
  fuente: 'Fuente',
  fecha: 'Fecha',
  vertical: 'Vertical',
  budget: 'Presupuesto',
  referralCode: 'referral_code',
  consentMarketing: 'consent_marketing'
} as const;

export type Canal = 'Formulario' | 'Otro';
export type Tipo = 'Lead contacto' | 'Proyecto';
export type Estado = 'Nuevo' | 'Contactado' | 'En curso' | 'Cerrado' | 'Descartado';

export type LeadWrite = {
  nombre?: string;
  email?: string;
  canal?: Canal;
  tipo?: Tipo;
  estado?: Estado;
  asunto?: string;
  mensaje?: string;
  fuente?: string;
  fecha?: string;
  vertical?: string;
  budget?: string;
  referralCode?: string;
  consentMarketing?: boolean;
};

export type NotionLeadsStore = {
  create: (write: LeadWrite) => Promise<{ id: string }>;
};

export function clipRichText(value: string, max = RICH_TEXT_MAX): string {
  return value.length <= max ? value : value.slice(0, max);
}

function textItem(content: string) {
  return { type: 'text' as const, text: { content: clipRichText(content) } };
}

export function toNotionProperties(write: LeadWrite): NotionProperties {
  const properties: NotionProperties = {};
  if (write.nombre !== undefined) {
    properties[NOTION_PROP.nombre] = { title: [textItem(write.nombre)] };
  }
  if (write.email !== undefined && SIMPLE_EMAIL.test(write.email)) {
    properties[NOTION_PROP.email] = { email: write.email };
  }
  if (write.canal !== undefined) {
    properties[NOTION_PROP.canal] = { select: { name: write.canal } };
  }
  if (write.tipo !== undefined) {
    properties[NOTION_PROP.tipo] = { select: { name: write.tipo } };
  }
  if (write.estado !== undefined) {
    properties[NOTION_PROP.estado] = { select: { name: write.estado } };
  }
  if (write.asunto !== undefined) {
    properties[NOTION_PROP.asunto] = { rich_text: [textItem(write.asunto)] };
  }
  if (write.mensaje !== undefined) {
    properties[NOTION_PROP.mensaje] = { rich_text: [textItem(write.mensaje)] };
  }
  if (write.fuente !== undefined) {
    properties[NOTION_PROP.fuente] = { select: { name: write.fuente } };
  }
  if (write.fecha !== undefined) {
    properties[NOTION_PROP.fecha] = {
      date: Number.isNaN(Date.parse(write.fecha)) ? null : { start: write.fecha }
    };
  }
  if (write.vertical !== undefined) {
    properties[NOTION_PROP.vertical] = { select: { name: write.vertical } };
  }
  if (write.budget !== undefined) {
    properties[NOTION_PROP.budget] = { rich_text: [textItem(write.budget)] };
  }
  if (write.referralCode !== undefined) {
    properties[NOTION_PROP.referralCode] = { rich_text: [textItem(write.referralCode)] };
  }
  if (write.consentMarketing !== undefined) {
    properties[NOTION_PROP.consentMarketing] = { checkbox: write.consentMarketing };
  }
  return properties;
}

/**
 * Adaptador Notion API 2025-09-03 (@notionhq/client v5).
 * `dataSourceId` debe ser el id de la data source, no el de la página contenedora.
 */
export function createNotionLeadsStore(
  token: string,
  dataSourceId: string
): NotionLeadsStore & { toProperties: typeof toNotionProperties } {
  const notion = new Client({ auth: token, notionVersion: '2025-09-03' });
  return {
    toProperties: toNotionProperties,
    async create(write) {
      const page = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        properties: toNotionProperties(write)
      });
      return { id: page.id };
    }
  };
}

export type NotionPage = PageObjectResponse;
export const isNotionPage = isFullPage;
