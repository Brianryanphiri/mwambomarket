import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, RefreshCw, Download } from 'lucide-react';

const Blog = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Blog</h1>
          <p className="text-muted-foreground mt-1">Manage blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Blog Management</p>
          <p className="text-sm text-muted-foreground">
            Create and manage blog posts and articles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Blog;