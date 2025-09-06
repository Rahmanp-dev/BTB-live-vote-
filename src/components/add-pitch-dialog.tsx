"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Pitch } from '@/lib/types';

interface AddPitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pitch: Omit<Pitch, 'id' | 'rating'>) => void;
}

export function AddPitchDialog({
  isOpen,
  onClose,
  onSubmit,
}: AddPitchDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [presenter, setPresenter] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = () => {
    if (title && description && presenter && imageUrl) {
      onSubmit({ title, description, presenter, imageUrl });
      onClose();
      // Reset fields
      setTitle('');
      setDescription('');
      setPresenter('');
      setImageUrl('');
    } else {
      // Basic validation feedback
      alert('Please fill out all fields.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Pitch</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new pitch for rating.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="presenter" className="text-right">
              Presenter
            </Label>
            <Input
              id="presenter"
              value={presenter}
              onChange={(e) => setPresenter(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUrl" className="text-right">
              Image URL
            </Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="col-span-3"
              placeholder="https://picsum.photos/600/400"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Pitch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
