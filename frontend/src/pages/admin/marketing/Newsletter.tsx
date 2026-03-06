import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Plus, Send, RefreshCw, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Newsletter = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Newsletter</h1>
          <p className="text-muted-foreground mt-1">Create and send newsletters</p>
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
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Create Newsletter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Enter newsletter subject" />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea placeholder="Write your newsletter content..." rows={10} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Preview</Button>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Send className="w-4 h-4 mr-2" />
                Send Newsletter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Newsletters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm">No newsletters sent yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Newsletter;