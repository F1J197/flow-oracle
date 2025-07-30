/**
 * Chart Settings Modal - Advanced chart customization
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, BarChart3, Clock, Save, RotateCcw } from 'lucide-react';
import { ChartConfig, ChartType } from '@/config/charts.config';
import { useTerminalTheme } from '@/hooks/useTerminalTheme';

interface ChartSettingsModalProps {
  config: ChartConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: Partial<ChartConfig>) => void;
}

interface ChartSettings {
  name: string;
  description: string;
  chartType: ChartType;
  color: string;
  precision: number;
  defaultTimeFrame: string;
  realtime: boolean;
  crosshairSync: boolean;
  zoomable: boolean;
  overlaySupported: boolean;
  displayOptions: {
    showVolume: boolean;
    showMA: boolean;
    showBollingerBands: boolean;
    showRSI: boolean;
  };
  customization: {
    lineWidth: number;
    opacity: number;
    animationSpeed: number;
    showGrid: boolean;
    showLegend: boolean;
  };
}

export const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave
}) => {
  const { theme } = useTerminalTheme();
  const [settings, setSettings] = useState<ChartSettings>({
    name: config.name,
    description: config.description,
    chartType: config.chartType,
    color: config.color,
    precision: config.precision || 2,
    defaultTimeFrame: config.defaultTimeFrame,
    realtime: config.realtime,
    crosshairSync: config.crosshairSync,
    zoomable: config.zoomable,
    overlaySupported: config.overlaySupported,
    displayOptions: {
      showVolume: config.displayOptions?.showVolume || false,
      showMA: config.displayOptions?.showMA || false,
      showBollingerBands: config.displayOptions?.showBollingerBands || false,
      showRSI: config.displayOptions?.showRSI || false
    },
    customization: {
      lineWidth: 2,
      opacity: 100,
      animationSpeed: 300,
      showGrid: true,
      showLegend: true
    }
  });

  const predefinedColors = [
    '#00BFFF', // neon-teal
    '#FF4500', // neon-orange  
    '#32CD32', // neon-lime
    '#FFD700', // neon-gold
    '#FF00FF', // neon-fuchsia
    '#999999', // neutral gray
    '#FFFFFF', // white
    '#FF6B6B', // red
    '#4ECDC4', // cyan
    '#45B7D1'  // blue
  ];

  const chartTypes: { value: ChartType; label: string; description: string }[] = [
    { value: 'line', label: 'Line Chart', description: 'Simple line visualization' },
    { value: 'area', label: 'Area Chart', description: 'Filled area under the line' },
    { value: 'candlestick', label: 'Candlestick', description: 'OHLC price data' },
    { value: 'volume', label: 'Volume Chart', description: 'Trading volume bars' },
    { value: 'histogram', label: 'Histogram', description: 'Frequency distribution' },
    { value: 'scatter', label: 'Scatter Plot', description: 'X/Y data points' },
    { value: 'heatmap', label: 'Heatmap', description: 'Color-coded matrix' }
  ];

  const timeFrames = [
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '1y', label: '1 Year' }
  ];

  const handleSave = () => {
    const newConfig: Partial<ChartConfig> = {
      name: settings.name,
      description: settings.description,
      chartType: settings.chartType,
      color: settings.color,
      precision: settings.precision,
      defaultTimeFrame: settings.defaultTimeFrame as any,
      realtime: settings.realtime,
      crosshairSync: settings.crosshairSync,
      zoomable: settings.zoomable,
      overlaySupported: settings.overlaySupported,
      displayOptions: settings.displayOptions
    };
    
    onSave(newConfig);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      name: config.name,
      description: config.description,
      chartType: config.chartType,
      color: config.color,
      precision: config.precision || 2,
      defaultTimeFrame: config.defaultTimeFrame,
      realtime: config.realtime,
      crosshairSync: config.crosshairSync,
      zoomable: config.zoomable,
      overlaySupported: config.overlaySupported,
      displayOptions: {
        showVolume: config.displayOptions?.showVolume || false,
        showMA: config.displayOptions?.showMA || false,
        showBollingerBands: config.displayOptions?.showBollingerBands || false,
        showRSI: config.displayOptions?.showRSI || false
      },
      customization: {
        lineWidth: 2,
        opacity: 100,
        animationSpeed: 300,
        showGrid: true,
        showLegend: true
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-bg-secondary border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary font-mono flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Chart Settings - {config.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-bg-primary border-glass-border p-4">
              <h3 className="text-text-primary font-mono text-sm font-medium mb-4">
                Chart Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="chart-name" className="text-text-secondary text-xs">
                    Chart Name
                  </Label>
                  <Input
                    id="chart-name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="chart-description" className="text-text-secondary text-xs">
                    Description
                  </Label>
                  <Input
                    id="chart-description"
                    value={settings.description}
                    onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-text-secondary text-xs">Chart Type</Label>
                  <Select
                    value={settings.chartType}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, chartType: value as ChartType }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-text-secondary">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-text-secondary text-xs">Default Time Frame</Label>
                  <Select
                    value={settings.defaultTimeFrame}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, defaultTimeFrame: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFrames.map(tf => (
                        <SelectItem key={tf.value} value={tf.value}>
                          {tf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="precision" className="text-text-secondary text-xs">
                    Decimal Precision: {settings.precision}
                  </Label>
                  <Slider
                    id="precision"
                    min={0}
                    max={6}
                    step={1}
                    value={[settings.precision]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, precision: value[0] }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-bg-primary border-glass-border p-4">
              <h3 className="text-text-primary font-mono text-sm font-medium mb-4 flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Visual Appearance
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-text-secondary text-xs mb-2 block">Primary Color</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          settings.color === color 
                            ? 'border-text-primary scale-110' 
                            : 'border-glass-border hover:border-text-secondary'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSettings(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={settings.color}
                    onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                    className="w-20 h-8"
                  />
                </div>

                <div>
                  <Label className="text-text-secondary text-xs">
                    Line Width: {settings.customization.lineWidth}px
                  </Label>
                  <Slider
                    min={1}
                    max={5}
                    step={0.5}
                    value={[settings.customization.lineWidth]}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      customization: { ...prev.customization, lineWidth: value[0] }
                    }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-text-secondary text-xs">
                    Opacity: {settings.customization.opacity}%
                  </Label>
                  <Slider
                    min={10}
                    max={100}
                    step={10}
                    value={[settings.customization.opacity]}
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      customization: { ...prev.customization, opacity: value[0] }
                    }))}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-text-secondary text-xs">Show Grid</Label>
                    <Switch
                      checked={settings.customization.showGrid}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        customization: { ...prev.customization, showGrid: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-text-secondary text-xs">Show Legend</Label>
                    <Switch
                      checked={settings.customization.showLegend}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        customization: { ...prev.customization, showLegend: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Indicators */}
          <TabsContent value="indicators" className="space-y-6">
            <Card className="bg-bg-primary border-glass-border p-4">
              <h3 className="text-text-primary font-mono text-sm font-medium mb-4 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Technical Indicators
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-secondary text-xs">Volume Bars</Label>
                    <p className="text-xs text-text-secondary opacity-75">Show trading volume</p>
                  </div>
                  <Switch
                    checked={settings.displayOptions.showVolume}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      displayOptions: { ...prev.displayOptions, showVolume: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-secondary text-xs">Moving Average</Label>
                    <p className="text-xs text-text-secondary opacity-75">20-period SMA overlay</p>
                  </div>
                  <Switch
                    checked={settings.displayOptions.showMA}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      displayOptions: { ...prev.displayOptions, showMA: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-secondary text-xs">Bollinger Bands</Label>
                    <p className="text-xs text-text-secondary opacity-75">Volatility bands</p>
                  </div>
                  <Switch
                    checked={settings.displayOptions.showBollingerBands}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      displayOptions: { ...prev.displayOptions, showBollingerBands: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-text-secondary text-xs">RSI Oscillator</Label>
                    <p className="text-xs text-text-secondary opacity-75">Relative strength index</p>
                  </div>
                  <Switch
                    checked={settings.displayOptions.showRSI}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      displayOptions: { ...prev.displayOptions, showRSI: checked }
                    }))}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-bg-primary border-glass-border p-4">
              <h3 className="text-text-primary font-mono text-sm font-medium mb-4 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Behavior Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-secondary text-xs">Real-time Updates</Label>
                      <p className="text-xs text-text-secondary opacity-75">Auto-refresh data</p>
                    </div>
                    <Switch
                      checked={settings.realtime}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, realtime: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-secondary text-xs">Crosshair Sync</Label>
                      <p className="text-xs text-text-secondary opacity-75">Sync with other charts</p>
                    </div>
                    <Switch
                      checked={settings.crosshairSync}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, crosshairSync: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-secondary text-xs">Zoom Controls</Label>
                      <p className="text-xs text-text-secondary opacity-75">Enable zoom/pan</p>
                    </div>
                    <Switch
                      checked={settings.zoomable}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, zoomable: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-text-secondary text-xs">Overlay Support</Label>
                      <p className="text-xs text-text-secondary opacity-75">Allow indicator overlays</p>
                    </div>
                    <Switch
                      checked={settings.overlaySupported}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, overlaySupported: checked }))}
                    />
                  </div>

                  <div>
                    <Label className="text-text-secondary text-xs">
                      Animation Speed: {settings.customization.animationSpeed}ms
                    </Label>
                    <Slider
                      min={0}
                      max={1000}
                      step={100}
                      value={[settings.customization.animationSpeed]}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        customization: { ...prev.customization, animationSpeed: value[0] }
                      }))}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-glass-border">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-text-secondary hover:text-text-primary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-neon-teal text-bg-primary hover:bg-neon-teal/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};