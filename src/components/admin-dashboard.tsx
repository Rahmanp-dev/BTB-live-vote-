"use client";

import { useState, useContext } from 'react';
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
import { PitchContext } from '@/context/PitchContext';
import { CategoryManager } from './category-manager';
import { Separator } from './ui/separator';
import { LiveModePanel } from './live-mode-panel';
import { Skeleton } from './ui/skeleton';

export function AdminDashboard() {
  const {
    pitches,
    removePitch,
    togglePitchVisibility,
    getWinnerForCategory,
    isLiveMode,
    toggleLiveMode,
    loading,
  } = useContext(PitchContext);
  const [isAddPitchOpen, setIsAddPitchOpen] = useState(false);
  const [pitchToDelete, setPitchToDelete] = useState<Pitch | null>(null);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  const pitchesByCategory = pitches.reduce((acc, pitch) => {
    if (!acc[pitch.category]) {
      acc[pitch.category] = [];
    }
    acc[pitch.category].push(pitch);
    return acc;
  }, {} as Record<string, Pitch[]>);

  const sortedCategories = Object.keys(pitchesByCategory).sort();

  return (
    <>
      <AdminLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center space-x-2">
                <Switch
                  id="live-mode"
                  checked={isLiveMode}
                  onCheckedChange={toggleLiveMode}
                />
                <label htmlFor="live-mode" className="font-medium">Live Mode</label>
              </div>
              <Button onClick={() => setIsAddPitchOpen(true)}>Add New Pitch</Button>
            </div>
          </div>

          {isLiveMode && (
            <>
              <LiveModePanel />
              <Separator className="my-8" />
            </>
          )}

          <CategoryManager />

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>Pitch Management</CardTitle>
              <CardDescription>
                An overview of all submitted pitches, grouped by category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedCategories.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No pitches have been added yet. Click "Add New Pitch" to get started.
                </div>
              ) : (
                <div className="space-y-8">
                  {sortedCategories.map((category) => {
                    const winner = getWinnerForCategory(category);
                    const sortedPitches = pitchesByCategory[category].sort(
                      (a, b) => b.rating - a.rating
                    );

                    return (
                      <div key={category}>
                        <h3 className="text-xl font-semibold mb-4">{category}</h3>
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
                                key={pitch._id}
                                className={
                                  pitch._id === winner?._id
                                    ? 'bg-accent/50'
                                    : ''
                                }
                              >
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    {pitch.title}
                                    {pitch._id === winner?._id && (
                                      <Crown className="h-5 w-5 text-yellow-500" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{pitch.presenter}</TableCell>
                                <TableCell className="text-center">
                                  <Switch
                                    checked={pitch.visible}
                                    onCheckedChange={(checked) =>
                                      togglePitchVisibility(pitch._id, checked)
                                    }
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="secondary"
                                    className="text-base"
                                  >
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
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      <AddPitchDialog
        isOpen={isAddPitchOpen}
        onClose={() => setIsAddPitchOpen(false)}
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
              onClick={() => {
                if (pitchToDelete) {
                  removePitch(pitchToDelete._id);
                  setPitchToDelete(null);
                }
              }}
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
