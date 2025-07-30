/**
 * Chart Export Modal - Advanced export functionality
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image, Calendar, Settings } from 'lucide-react';
import { ChartConfig } from '@/config/charts.config';
import { DataPoint } from '@/types/indicators';
import { format } from 'date-fns';

interface ChartExportModalProps {
  config: ChartConfig;
  data: DataPoint[];
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'png' | 'pdf';
type DateRange = '1d' | '1w' | '1m' | '3m' | '1y' | 'all';

export const ChartExportModal: React.FC<ChartExportModalProps> = ({
  config,
  data,
  isOpen,
  onClose
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [dateRange, setDateRange] = useState<DateRange>('1m');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      type: 'csv' as ExportFormat,
      name: 'CSV Spreadsheet',
      description: 'Comma-separated values for Excel/Sheets',
      icon: FileText,
      size: 'Small'
    },
    {
      type: 'json' as ExportFormat,
      name: 'JSON Data',
      description: 'Structured data format for developers',
      icon: FileText,
      size: 'Medium'
    },
    {
      type: 'png' as ExportFormat,
      name: 'PNG Image',
      description: 'High-resolution chart image',
      icon: Image,
      size: 'Large'
    },
    {
      type: 'pdf' as ExportFormat,
      name: 'PDF Report',
      description: 'Complete chart with analysis',
      icon: FileText,
      size: 'Large'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let exportData: any;
      let filename: string;
      
      // Filter data by date range
      const now = new Date();
      const filteredData = data.filter(point => {
        if (dateRange === 'all') return true;
        
        const daysBack = {
          '1d': 1,
          '1w': 7,
          '1m': 30,
          '3m': 90,
          '1y': 365
        }[dateRange];
        
        const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
        return point.timestamp >= cutoff;
      });

      switch (selectedFormat) {
        case 'csv':
          exportData = generateCSV(filteredData, config, includeMetadata);
          filename = `${config.id}_${dateRange}.csv`;
          downloadFile(exportData, filename, 'text/csv');
          break;
          
        case 'json':
          exportData = generateJSON(filteredData, config, includeMetadata);
          filename = `${config.id}_${dateRange}.json`;
          downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
          break;
          
        case 'png':
          await exportChartAsImage(config, filename = `${config.id}_${dateRange}.png`);
          break;
          
        case 'pdf':
          await exportChartAsPDF(config, filteredData, filename = `${config.id}_${dateRange}.pdf`);
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (data: DataPoint[], config: ChartConfig, includeMetadata: boolean): string => {
    const headers = ['timestamp', 'date', 'value'];
    if (data[0]?.volume !== undefined) headers.push('volume');
    if (includeMetadata) headers.push('metadata');

    const csvRows = [headers.join(',')];
    
    data.forEach(point => {
      const row = [
        point.timestamp.getTime(),
        `"${format(point.timestamp, 'yyyy-MM-dd HH:mm:ss')}"`,
        point.value
      ];
      
      if (point.volume !== undefined) row.push(point.volume.toString());
      if (includeMetadata) row.push(`"${JSON.stringify(point.metadata || {})}"`);
      
      csvRows.push(row.join(','));
    });

    if (includeMetadata) {
      csvRows.unshift(`# Chart: ${config.name}`);
      csvRows.unshift(`# Description: ${config.description}`);
      csvRows.unshift(`# Unit: ${config.unit || ''}`);
      csvRows.unshift(`# Exported: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
      csvRows.unshift('');
    }

    return csvRows.join('\n');
  };

  const generateJSON = (data: DataPoint[], config: ChartConfig, includeMetadata: boolean) => {
    const result: any = {
      data: data.map(point => ({
        timestamp: point.timestamp.toISOString(),
        value: point.value,
        ...(point.volume !== undefined && { volume: point.volume }),
        ...(point.metadata && { metadata: point.metadata })
      }))
    };

    if (includeMetadata) {
      result.chart = {
        id: config.id,
        name: config.name,
        description: config.description,
        category: config.category,
        pillar: config.pillar,
        unit: config.unit,
        precision: config.precision,
        chartType: config.chartType
      };
      
      result.export = {
        timestamp: new Date().toISOString(),
        dateRange,
        totalDataPoints: data.length
      };
    }

    return result;
  };

  const exportChartAsImage = async (config: ChartConfig, filename: string) => {
    // Implementation would capture the chart canvas/SVG and convert to PNG
    // This is a placeholder for the actual implementation
    console.log('Exporting chart as PNG:', filename);
  };

  const exportChartAsPDF = async (config: ChartConfig, data: DataPoint[], filename: string) => {
    // Implementation would generate a PDF with chart and analysis
    // This is a placeholder for the actual implementation
    console.log('Exporting chart as PDF:', filename);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-bg-secondary border-glass-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary font-mono">
            Export Chart Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chart Info */}
          <Card className="bg-bg-primary border-glass-border p-4">
            <h3 className="text-text-primary font-mono text-sm font-medium mb-2">
              {config.name}
            </h3>
            <p className="text-text-secondary text-xs mb-3">
              {config.description}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {config.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Pillar {config.pillar}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.length} data points
              </Badge>
            </div>
          </Card>

          {/* Export Format Selection */}
          <div>
            <h4 className="text-text-primary font-mono text-sm mb-3">Export Format</h4>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map(format => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.type}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedFormat === format.type
                        ? 'border-neon-teal bg-glass-surface'
                        : 'border-glass-border hover:border-glass-border-active'
                    }`}
                    onClick={() => setSelectedFormat(format.type)}
                  >
                    <div className="flex items-start space-x-2">
                      <Icon className="h-4 w-4 text-text-secondary mt-0.5" />
                      <div className="flex-1">
                        <div className="text-text-primary font-mono text-xs font-medium">
                          {format.name}
                        </div>
                        <p className="text-text-secondary text-xs mt-1">
                          {format.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          {format.size}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h4 className="text-text-primary font-mono text-sm mb-3">Date Range</h4>
            <div className="flex flex-wrap gap-2">
              {(['1d', '1w', '1m', '3m', '1y', 'all'] as DateRange[]).map(range => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className="text-xs"
                >
                  {range === 'all' ? 'All Data' : range.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <h4 className="text-text-primary font-mono text-sm mb-3">Options</h4>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded"
              />
              <span className="text-text-secondary text-xs">
                Include chart metadata and configuration
              </span>
            </label>
          </div>

          {/* Export Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-neon-teal text-bg-primary hover:bg-neon-teal/90"
            >
              {isExporting ? (
                <>
                  <Settings className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};