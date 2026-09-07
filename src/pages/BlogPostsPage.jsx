import React from 'react';
import DataTable from '../components/DataTable';
import blogPosts from '../config/tables/blogPosts';

export default function BlogPostsPage() {
  return <DataTable table={blogPosts} />;
}
