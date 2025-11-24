import { useNavigate } from 'react-router-dom';
import { useTours, useDeleteTour, type Tour } from '@/hooks/useTours';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ToursList() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<Tour | null>(null);

  const { data, isLoading, error } = useTours({ limit: 100 });
  const deleteMutation = useDeleteTour();

  const handleDelete = (tour: Tour) => {
    setTourToDelete(tour);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tourToDelete) {
      deleteMutation.mutate(tourToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTourToDelete(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tours...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Error loading tours. Please try again.</div>
      </div>
    );
  }

  const tours = data?.tours || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tours Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tour packages
          </p>
        </div>
        <Button onClick={() => navigate('/tours/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Tour
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tours ({tours.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No tours found.</p>
              <Button onClick={() => navigate('/tours/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Tour
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Destinations</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.title}</TableCell>
                    <TableCell>
                      {tour.destinations.map((d) => d.destination).join(', ')}
                    </TableCell>
                    <TableCell>{tour.duration}</TableCell>
                    <TableCell>
                      Rp {(tour.price / 1_000_000).toFixed(1)}M
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                        {tour.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(tour.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/tours/edit/${tour.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tour)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tour</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{tourToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTourToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

