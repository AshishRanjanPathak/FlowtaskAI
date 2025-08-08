import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
            <Calendar
                mode="single"
                className="rounded-md border"
            />
        </CardContent>
      </Card>
    </div>
  );
}
