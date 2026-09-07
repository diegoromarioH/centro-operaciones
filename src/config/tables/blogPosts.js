import { Newspaper } from 'lucide-react';
import { FIELD } from '../../lib/fieldTypes';

const blogPosts = {
  key: "blog_posts",
  label: "Blog",
  icon: Newspaper,
  group: "Contenido",
  path: "/contenido/blog-posts",
  orderBy: "created_at",
  ascending: false,
  imageField: "cover_image_url",
  list: ["title", "category_id", "status", "published_at", "featured"],
  columns: [
    { key: "title", label: "Título", type: FIELD.TEXT, required: true },
    { key: "slug", label: "Slug", type: FIELD.TEXT, required: true },
    { key: "excerpt", label: "Resumen", type: FIELD.TEXTAREA },
    { key: "content", label: "Contenido (JSON)", type: FIELD.JSON },
    { key: "content_html", label: "Contenido del artículo", type: FIELD.RICHTEXT, bucket: "blog" },
    { key: "category_id", label: "Categoría", type: FIELD.FK, table: "blog_categories", display: "name" },
    { key: "author_name", label: "Autor", type: FIELD.TEXT },
    { key: "cover_image_url", label: "Imagen de portada", type: FIELD.IMAGE, bucket: "blog" },
    { key: "status", label: "Estado", type: FIELD.SELECT, options: ["draft", "published", "archived"] },
    { key: "published_at", label: "Fecha de publicación", type: FIELD.DATETIME },
    { key: "reading_minutes", label: "Minutos de lectura", type: FIELD.NUMBER },
    { key: "featured", label: "Destacado", type: FIELD.BOOL },
    { key: "metadata", label: "Metadata (JSON)", type: FIELD.JSON },
  ],
};

export default blogPosts;