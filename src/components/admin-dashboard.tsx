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
import { Crown } from 'lucide-react';

interface AdminDashboardProps {
  pitches: Pitch[];
}

export function AdminDashboard({ pitches: initialPitches }: AdminDashboardProps) {
  const [pitches, setPitches] = useState<Pitch[]>(initialPitches);
  const [isAddPitchOpen, setIsAddPitchOpen] = useState(false);

  const handleAddPitch = (newPitch: Omit<Pitch, 'id' | 'rating'>) => {
    setPitches((prevPitches) => [
      ...prevPitches,
      {
        ...newPitch,
        id: prevPitches.length + 1,
        rating: 0, // New pitches start with a rating of 0
      },
    ]);
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
              <CardTitle>Ratings Summary</CardTitle>
              <CardDescription>
                An overview of all submitted pitches and their ratings. The pitch
                with the highest rating is the winner.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pitch Title</TableHead>
                    <TableHead>Presenter</TableHead>
                    <TableHead className="text-right">Average Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPitches.map((pitch) => (
                    <TableRow
                      key={pitch.id}
                      className={
                        pitch.id === winner?.id
                          ? 'bg-accent/50'
                          : ''
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
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="text-base">
                          {pitch.rating.toFixed(1)}
                        </Badge>
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
    </>
  );
}