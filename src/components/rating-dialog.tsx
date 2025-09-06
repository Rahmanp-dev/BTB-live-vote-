"use client";

import { useState } from 'react';
import type { Pitch } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';

interface RatingDialogProps {
  pitch: Pitch;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

export function RatingDialog({
  pitch,
  isOpen,
  onClose,
  onSubmit,
}: RatingDialogProps) {
  const [rating, setRating] = useState(3);

  const handleSubmit = () => {
    onSubmit(rating);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate "{pitch.title}"</DialogTitle>
          <DialogDescription>
            Drag the slider to select your rating from 1 to 5.
          </DialogDescription>
        </DialogHeader>
        <div className="py-8">
          <div className="flex items-center gap-4">
            <Slider
              min={1}
              max={5}
              step={0.5}
              value={[rating]}
              onValueChange={(value) => setRating(value[0])}
            />
            <div className="flex items-center gap-2 w-20 shrink-0">
              <Star className="text-primary fill-primary" />
              <span className="font-bold text-lg">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Rating</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
