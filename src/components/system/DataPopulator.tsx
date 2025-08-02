import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { mockDataService } from '@/services/MockDataService';
import { PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';

export const DataPopulator = () => {
  const [isPopulating, setIsPopulating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handlePopulateData = async () => {
    setIsPopulating(true);
    setStatus('idle');

    try {
      await mockDataService.populateAllMockData();
      setStatus('success');
      toast({
        title: "Data Population Complete",
        description: "Engine outputs and master signals have been populated successfully.",
      });
    } catch (error) {
      setStatus('error');
      toast({
        title: "Population Failed",
        description: "Failed to populate mock data. Check console for details.",
        variant: "destructive",
      });
      console.error('Data population error:', error);
    } finally {
      setIsPopulating(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-terminal-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-terminal-danger" />;
      default:
        return <PlayCircle className="h-5 w-5 text-terminal-accent" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Data populated successfully';
      case 'error':
        return 'Population failed';
      default:
        return 'Ready to populate';
    }
  };

  return (
    <Card className="bg-terminal-background-subtle border-terminal-border">
      <CardHeader>
        <CardTitle className="text-terminal-foreground flex items-center gap-2">
          {getStatusIcon()}
          System Data Population
        </CardTitle>
        <CardDescription className="text-terminal-muted">
          Populate the system with mock engine outputs and master signals for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-terminal-muted">
          Status: <span className="text-terminal-foreground">{getStatusText()}</span>
        </div>
        
        <Button
          onClick={handlePopulateData}
          disabled={isPopulating}
          className="w-full"
          variant="default"
        >
          {isPopulating ? 'Populating Data...' : 'Populate Mock Data'}
        </Button>

        <div className="text-xs text-terminal-muted space-y-1">
          <p>• Generates 8 engine outputs across all pillars</p>
          <p>• Creates a master signal with consensus data</p>
          <p>• Clears existing mock data before population</p>
        </div>
      </CardContent>
    </Card>
  );
};