"use client";

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Pitch } from '@/lib/types';
import { AdminLayout } from './admin-layout';
import { Button } from './ui/button';
import { AddPitchDialog } from './add-pitch-dialog';
import { Crown, Trash2 } from 'lucide-react';
import { Switch } from './ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface AdminDashboardProps {
  pitches: Pitch[];
}

export function AdminDashboard({ pitches: initialPitches }: AdminDashboardProps) {
  const [pitches, setPitches] = useState<Pitch[]>(initialPitches);
  const [isAddPitchOpen, setIsAddPitchOpen] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState<Pitch | null>(null);

  const handleAddPitch = (newPitch: Omit<Pitch, 'id' | 'rating' | 'visible'>) => {
    setPitches((prevPitches) => [
      ...prevPitches,
      {
        ...newPitch,
        id: (prevPitches[prevPitches.length - 1]?.id ?? 0) + 1,
        rating: 0,
        visible: true,
      },
    ]);
  };

  const handleRemovePitch = (pitchId: number) => {
    setPitches((prevPitches) => prevPitches.filter((p) => p.id !== pitchId));
    setPitchToDelete(null);
  };

  const handleVisibilityChange = (pitchId: number, isVisible: boolean) => {
    setPitches((prevPitches) =>
      prevPitches.map((p) =>
        p.id === pitchId ? { ...p, visible: isVisible } : p
      )
    );
  };

  const sortedPitches = [...pitches].sort((a, b) => b.rating - a.rating);
  const winner = sortedPitches.length > 0 ? sortedPitches[0] : null;

  return (
    <>
      <AdminLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Pitch Results</h2>
            <Button onClick={() => setIsAddPitchOpen(true)}>Add New Pitch</Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Pitch Management</CardTitle>
              <CardDescription>
                An overview of all submitted pitches. Use the controls to manage visibility and remove pitches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pitch Title</TableHead>
                    <TableHead>Presenter</TableHead>
                    <TableHead className="text-center">Visible</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPitches.map((pitch) => (
                    <TableRow
                      key={pitch.id}
                      className={
                        pitch.id === winner?.id ? 'bg-accent/50' : ''
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {pitch.title}
                          {pitch.id === winner?.id && (
                            <Crown className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{pitch.presenter}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={pitch.visible}
                          onCheckedChange={(checked) => handleVisibilityChange(pitch.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-base">
                          {pitch.rating.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPitchToDelete(pitch)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      <AddPitchDialog
        isOpen={isAddPitchOpen}
        onClose={() => setIsAddPitchOpen(false)}
        onSubmit={handleAddPitch}
      />

      <AlertDialog
        open={!!pitchToDelete}
        onOpenChange={() => setPitchToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the pitch for "{pitchToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPitchToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemovePitch(pitchToDelete!.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
