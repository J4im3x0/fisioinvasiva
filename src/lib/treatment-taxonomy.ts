export const treatmentCategories = ['Fisio invasiva', 'Tratamientos kinésicos', 'Casos complejos', 'Dolor crónico']
export const taxonomySlug = (name: string) => name.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
export const taxonomyValues = (value?: string | null) => (value || '').split(',').map(part => part.trim()).filter(Boolean)
