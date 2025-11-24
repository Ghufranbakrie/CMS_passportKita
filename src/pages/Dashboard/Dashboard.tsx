import { useTours } from '@/hooks/useTours';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { data: toursData, isLoading } = useTours({ limit: 100 });

  const tours = toursData?.tours || [];
  const totalTours = tours.length;
  const upcomingTours = tours.filter(
    (tour) => new Date(tour.startDate) > new Date()
  ).length;
  const totalRevenue = tours.reduce((sum, tour) => sum + tour.price, 0);

  const stats = [
    {
      title: 'Total Tours',
      value: totalTours,
      icon: MapPin,
      description: 'All tours in system',
    },
    {
      title: 'Upcoming Tours',
      value: upcomingTours,
      icon: Calendar,
      description: 'Tours starting soon',
    },
    {
      title: 'Total Revenue',
      value: `Rp ${(totalRevenue / 1_000_000).toFixed(1)}M`,
      icon: DollarSign,
      description: 'Potential revenue',
    },
    {
      title: 'Featured Tours',
      value: tours.filter((t) => t.category === 'FEATURED').length,
      icon: TrendingUp,
      description: 'Featured packages',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your tour management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tours</CardTitle>
        </CardHeader>
        <CardContent>
          {tours.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No tours yet. Create your first tour to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {tours.slice(0, 5).map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{tour.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tour.destinations.map((d) => d.destination).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      Rp {(tour.price / 1_000_000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-muted-foreground">{tour.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

