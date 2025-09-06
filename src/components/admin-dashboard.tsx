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

interface AdminDashboardProps {
  pitches: Pitch[];
}

export function AdminDashboard({ pitches }: AdminDashboardProps) {
  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <h2 className="text-3xl font-bold mb-6">Pitch Results</h2>
        <Card>
          <CardHeader>
            <CardTitle>Ratings Summary</CardTitle>
            <CardDescription>
              An overview of all submitted pitches and their ratings.
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
                {pitches
                  .sort((a, b) => b.rating - a.rating)
                  .map((pitch) => (
                    <TableRow key={pitch.id}>
                      <TableCell className="font-medium">
                        {pitch.title}
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
  );
}
