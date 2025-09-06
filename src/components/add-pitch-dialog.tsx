"use client";

import { useState, useContext, useRef } from 'react';
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
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddPitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPitchDialog({ isOpen, onClose }: AddPitchDialogProps) {
  const { categories, addPitch } = useContext(PitchContext);
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [presenter, setPresenter] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPresenter('');
    setCategory('');
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    setError('');
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !presenter || !category || !imageFile) {
      setError('Please fill out all fields and select an image.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Image upload failed.');
      }

      const newPitch: Omit<Pitch, '_id' | 'rating' | 'visible' | 'ratings'> = {
        title,
        description,
        presenter,
        imageUrl: uploadData.url,
        category,
      };

      await addPitch(newPitch);
      onClose();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred.');
       toast({
        title: "Upload Failed",
        description: err.message || "Could not upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
              disabled={isUploading}
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
              disabled={isUploading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategory} value={category} disabled={isUploading}>
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
            <Label htmlFor="imageFile" className="text-right">
              Image
            </Label>
            <Input
              id="imageFile"
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="col-span-3"
              disabled={isUploading}
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
              disabled={isUploading}
            />
          </div>
          {error && (
            <p className="col-span-4 text-center text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Add Pitch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
