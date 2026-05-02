import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>This is your application template.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Start building your features here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
