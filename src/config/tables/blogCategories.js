import { FolderTree } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const blogCategories = {
  key: "blog_categories",
  label: "Categorías de blog",
  icon: FolderTree,
  group: "Contenido",
  path: "/contenido/blog-categories",
  orderBy: "sort_order",
  ascending: true,
  list: ["name", "active"],
  columns: [
    { key: "name", label: "Nombre", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "description", label: "Descripción", type: FIELD.TEXTAREA },
    { key: "active", label: "Activo", type: FIELD.BOOL },
    { key: "sort_order", label: "Orden", type: FIELD.NUMBER },
  ],
};

export default blogCategories;
