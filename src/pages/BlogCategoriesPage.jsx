import React from 'react';
import DataTable from '../components/DataTable';
import blogCategories from '../config/tables/blogCategories';

export default function BlogCategoriesPage() {
  return <DataTable table={blogCategories} />;
}
