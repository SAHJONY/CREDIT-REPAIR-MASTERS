import { demoDocuments } from './demo-documents';
import { requiredLegalDocuments } from './required-legal-documents';

const requiredSlugs = new Set(requiredLegalDocuments.map((document) => document.slug));

export const documentLibrary = [
  ...demoDocuments.filter((document) => !requiredSlugs.has(document.slug)),
  ...requiredLegalDocuments
];

export function getLibraryDocument(slug: string) {
  return documentLibrary.find((document) => document.slug === slug);
}
