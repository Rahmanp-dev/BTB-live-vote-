"use client";

import { useState, useContext } from 'react';
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
import { PitchContext } from '@/context/PitchContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface AddPitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPitchDialog({ isOpen, onClose }: AddPitchDialogProps) {
  const { categories, addPitch } = useContext(PitchContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [presenter, setPresenter] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPresenter('');
    setImageUrl('');
    setCategory('');
    setError('');
  };

  const handleSubmit = () => {
    if (!title || !description || !presenter || !imageUrl || !category) {
      setError('Please fill out all fields.');
      return;
    }

    const newPitch: Omit<Pitch, 'id' | 'rating' | 'visible'> = {
      title,
      description,
      presenter,
      imageUrl,
      category,
    };

    addPitch(newPitch);
    onClose();
    resetForm();
  };

  const handleDialogClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
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
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {error && (
            <p className="col-span-4 text-center text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Pitch</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
