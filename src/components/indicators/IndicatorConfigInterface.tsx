import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Zap, 
  Clock, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { IndicatorMetadata, IndicatorSource, UpdateFrequency } from '@/types/indicators';
import { cn } from '@/lib/utils';

interface IndicatorConfigInterfaceProps {
  indicator?: IndicatorMetadata;
  onSave: (config: Partial<IndicatorMetadata>) => void;
  onCancel: () => void;
  className?: string;
}

const defaultConfig: Partial<IndicatorMetadata> = {
  priority: 1,
  updateFrequency: '1d',
  unit: '',
  precision: 2,
  tags: []
};

const sourceOptions: { value: IndicatorSource; label: string; description: string }[] = [
  { value: 'FRED', label: 'Federal Reserve (FRED)', description: 'Economic data from Federal Reserve' },
  { value: 'GLASSNODE', label: 'Glassnode', description: 'On-chain cryptocurrency metrics' },
  { value: 'COINBASE', label: 'Coinbase', description: 'Real-time cryptocurrency prices' },
  { value: 'MARKET', label: 'Market Data', description: 'Traditional market indicators' },
  { value: 'ENGINE', label: 'Calculated Engine', description: 'Derived from other indicators' }
];

const frequencyOptions: { value: UpdateFrequency; label: string; icon: React.ReactNode }[] = [
  { value: 'realtime', label: 'Real-time', icon: <Zap className="h-3 w-3" /> },
  { value: '1m', label: '1 Minute', icon: <Clock className="h-3 w-3" /> },
  { value: '5m', label: '5 Minutes', icon: <Clock className="h-3 w-3" /> },
  { value: '15m', label: '15 Minutes', icon: <Clock className="h-3 w-3" /> },
  { value: '1h', label: '1 Hour', icon: <Clock className="h-3 w-3" /> },
  { value: '1d', label: '1 Day', icon: <Clock className="h-3 w-3" /> }
];

const categoryOptions = [
  'Economic Indicators',
  'Monetary Policy',
  'Credit Markets',
  'Equity Markets',
  'Fixed Income',
  'Cryptocurrency',
  'Volatility',
  'Sentiment',
  'Technical'
];

export function IndicatorConfigInterface({ 
  indicator, 
  onSave, 
  onCancel,
  className 
}: IndicatorConfigInterfaceProps) {
  const [config, setConfig] = useState<Partial<IndicatorMetadata>>(() => ({
    ...defaultConfig,
    ...indicator
  }));
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setConfig({ ...defaultConfig, ...indicator });
    setIsDirty(false);
    setErrors({});
  }, [indicator]);

  const updateConfig = (field: keyof IndicatorMetadata, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !config.tags?.includes(tag.trim())) {
      updateConfig('tags', [...(config.tags || []), tag.trim()]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateConfig('tags', config.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const validateConfig = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!config.symbol?.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (!config.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!config.source) {
      newErrors.source = 'Data source is required';
    }

    if (!config.category?.trim()) {
      newErrors.category = 'Category is required';
    }

    if (config.priority !== undefined && (config.priority < 1 || config.priority > 100)) {
      newErrors.priority = 'Priority must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateConfig()) {
      onSave(config);
      setIsDirty(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...defaultConfig, ...indicator });
    setIsDirty(false);
    setErrors({});
  };

  const testConnection = async () => {
    setTestResult(null);
    
    // Simulate API test
    setTimeout(() => {
      const isValid = config.source && config.apiEndpoint;
      setTestResult({
        success: !!isValid,
        message: isValid 
          ? 'Connection successful' 
          : 'Missing required configuration'
      });
    }, 1000);
  };

  return (
    <Card className={cn("glass-card", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              {indicator ? 'Edit Indicator' : 'Create Indicator'}
            </h2>
          </div>
          {isDirty && (
            <Badge variant="secondary" className="text-xs">
              Unsaved Changes
            </Badge>
          )}
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="source">Data Source</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol *</Label>
                <Input
                  id="symbol"
                  value={config.symbol || ''}
                  onChange={(e) => updateConfig('symbol', e.target.value)}
                  placeholder="e.g., WALCL, BTC-USD"
                  className={errors.symbol ? 'border-red-500' : ''}
                />
                {errors.symbol && (
                  <p className="text-xs text-red-500">{errors.symbol}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={config.name || ''}
                  onChange={(e) => updateConfig('name', e.target.value)}
                  placeholder="e.g., Fed Balance Sheet"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="Brief description of the indicator"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={config.category || ''} 
                  onValueChange={(value) => updateConfig('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pillar">Pillar</Label>
                <Select 
                  value={config.pillar?.toString() || ''} 
                  onValueChange={(value) => updateConfig('pillar', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pillar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pillar 1 - Foundation</SelectItem>
                    <SelectItem value="2">Pillar 2 - Core Analysis</SelectItem>
                    <SelectItem value="3">Pillar 3 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="source" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data Source *</Label>
                <div className="grid grid-cols-1 gap-2">
                  {sourceOptions.map(source => (
                    <div
                      key={source.value}
                      className={cn(
                        "p-3 border cursor-pointer transition-colors terminal-panel",
                        config.source === source.value
                          ? "border-primary bg-primary/10"
                          : "border-glass-border hover:border-glass-border-hover"
                      )}
                      onClick={() => updateConfig('source', source.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{source.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {source.description}
                          </div>
                        </div>
                        <Database className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  value={config.apiEndpoint || ''}
                  onChange={(e) => updateConfig('apiEndpoint', e.target.value)}
                  placeholder="/observations?series_id=WALCL"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testConnection}
                  disabled={!config.source}
                >
                  Test Connection
                </Button>
                {testResult && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    testResult.success ? "text-green-400" : "text-red-400"
                  )}>
                    {testResult.success ? 
                      <CheckCircle className="h-3 w-3" /> : 
                      <AlertTriangle className="h-3 w-3" />
                    }
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="updateFrequency">Update Frequency</Label>
                <Select 
                  value={config.updateFrequency || 'daily'} 
                  onValueChange={(value) => updateConfig('updateFrequency', value as UpdateFrequency)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>
                        <div className="flex items-center gap-2">
                          {freq.icon}
                          {freq.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="100"
                  value={config.priority || 1}
                  onChange={(e) => updateConfig('priority', parseInt(e.target.value))}
                  className={errors.priority ? 'border-red-500' : ''}
                />
                {errors.priority && (
                  <p className="text-xs text-red-500">{errors.priority}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={config.unit || ''}
                  onChange={(e) => updateConfig('unit', e.target.value)}
                  placeholder="e.g., %, $T, bps"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precision">Decimal Precision</Label>
                <Input
                  id="precision"
                  type="number"
                  min="0"
                  max="10"
                  value={config.precision || 2}
                  onChange={(e) => updateConfig('precision', parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={true}
                  onCheckedChange={(checked) => updateConfig('priority', checked ? 1 : 0)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {config.tags?.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dependencies">Dependencies</Label>
                <Input
                  id="dependencies"
                  value={config.dependencies?.join(', ') || ''}
                  onChange={(e) => updateConfig('dependencies', 
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )}
                  placeholder="indicator1, indicator2"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-glass-border">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!isDirty}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={!isDirty || Object.keys(errors).length > 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </Card>
  );
}