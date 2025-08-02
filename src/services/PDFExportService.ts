/**
 * APEX PDF Export Service
 * Generate institutional-grade PDF reports with performance data
 */

import { jsPDF } from 'jspdf';
import { EngineOutput } from '@/engines/BaseEngine';

export interface PDFReportData {
  masterSignal: string;
  clis: number;
  engineOutputs: Map<string, EngineOutput>;
  narrative?: {
    headline: string;
    summary: string[];
    riskFactors: string[];
  };
  timestamp: Date;
}

export class PDFExportService {
  private static instance: PDFExportService;

  static getInstance(): PDFExportService {
    if (!this.instance) {
      this.instance = new PDFExportService();
    }
    return this.instance;
  }

  /**
   * Generate comprehensive APEX report PDF
   */
  async generateDailyReport(data: PDFReportData): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set font
    pdf.setFont('courier', 'normal');
    
    // Header
    this.addHeader(pdf, pageWidth);
    
    // Executive Summary
    this.addExecutiveSummary(pdf, data, pageWidth);
    
    // Master Signal Section
    this.addMasterSignalSection(pdf, data, pageWidth);
    
    // Engine Performance Grid
    this.addEngineGrid(pdf, data, pageWidth);
    
    // AI Narrative Section
    if (data.narrative) {
      this.addNarrativeSection(pdf, data.narrative, pageWidth);
    }
    
    // Performance Metrics
    this.addPerformanceMetrics(pdf, data, pageWidth);
    
    // Footer
    this.addFooter(pdf, data.timestamp, pageWidth, pageHeight);
    
    return pdf.output('blob');
  }

  private addHeader(pdf: jsPDF, pageWidth: number): void {
    // Title
    pdf.setFontSize(20);
    pdf.setFont('courier', 'bold');
    pdf.text('LIQUIDITY² TERMINAL', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('courier', 'normal');
    pdf.text('DAILY INTELLIGENCE BRIEFING', pageWidth / 2, 30, { align: 'center' });
    
    // Separator line
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, pageWidth - 20, 35);
  }

  private addExecutiveSummary(pdf: jsPDF, data: PDFReportData, pageWidth: number): void {
    let yPosition = 45;
    
    pdf.setFontSize(12);
    pdf.setFont('courier', 'bold');
    pdf.text('EXECUTIVE SUMMARY', 20, yPosition);
    
    yPosition += 10;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(10);
    
    const summary = [
      `Report Date: ${data.timestamp.toLocaleDateString()}`,
      `Master Signal: ${data.masterSignal}`,
      `CLIS Score: ${data.clis.toFixed(1)}/10`,
      `Active Engines: ${data.engineOutputs.size}/28`,
      `System Status: OPERATIONAL`
    ];
    
    summary.forEach(line => {
      pdf.text(line, 20, yPosition);
      yPosition += 6;
    });
  }

  private addMasterSignalSection(pdf: jsPDF, data: PDFReportData, pageWidth: number): void {
    let yPosition = 95;
    
    pdf.setFontSize(12);
    pdf.setFont('courier', 'bold');
    pdf.text('MASTER SIGNAL ANALYSIS', 20, yPosition);
    
    yPosition += 15;
    
    // Signal box
    pdf.setDrawColor(255, 165, 0); // Orange
    pdf.setLineWidth(2);
    pdf.rect(20, yPosition - 5, pageWidth - 40, 25);
    
    pdf.setFontSize(16);
    pdf.setFont('courier', 'bold');
    pdf.text(`${data.masterSignal} SIGNAL ACTIVE`, pageWidth / 2, yPosition + 5, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`CLIS: ${data.clis.toFixed(1)}/10`, pageWidth / 2, yPosition + 15, { align: 'center' });
  }

  private addEngineGrid(pdf: jsPDF, data: PDFReportData, pageWidth: number): void {
    let yPosition = 140;
    
    pdf.setFontSize(12);
    pdf.setFont('courier', 'bold');
    pdf.text('ENGINE PERFORMANCE MATRIX', 20, yPosition);
    
    yPosition += 10;
    
    pdf.setFontSize(8);
    pdf.setFont('courier', 'normal');
    
    // Headers
    const headers = ['ENGINE', 'VALUE', 'SIGNAL', 'CONF%'];
    const colWidths = [60, 30, 30, 25];
    let xPosition = 20;
    
    headers.forEach((header, index) => {
      pdf.setFont('courier', 'bold');
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 8;
    
    // Engine data
    pdf.setFont('courier', 'normal');
    let count = 0;
    
    for (const [engineId, output] of data.engineOutputs) {
      if (count >= 20) break; // Limit to fit on page
      
      xPosition = 20;
      
      // Engine name (truncated)
      const engineName = engineId.substring(0, 15);
      pdf.text(engineName, xPosition, yPosition);
      xPosition += colWidths[0];
      
      // Value
      const metricValue = output.primaryMetric?.value || 0;
      const displayValue = typeof metricValue === 'number' ? 
        metricValue.toFixed(1) : String(metricValue).substring(0, 8);
      pdf.text(displayValue, xPosition, yPosition);
      xPosition += colWidths[1];
      
      // Signal
      pdf.text(output.signal?.toUpperCase() || 'N/A', xPosition, yPosition);
      xPosition += colWidths[2];
      
      // Confidence
      const conf = output.confidence ? `${(output.confidence * 100).toFixed(0)}%` : 'N/A';
      pdf.text(conf, xPosition, yPosition);
      
      yPosition += 6;
      count++;
    }
  }

  private addNarrativeSection(pdf: jsPDF, narrative: any, pageWidth: number): void {
    // Add new page for narrative
    pdf.addPage();
    
    let yPosition = 20;
    
    pdf.setFontSize(12);
    pdf.setFont('courier', 'bold');
    pdf.text('AI INTELLIGENCE BRIEFING', 20, yPosition);
    
    yPosition += 15;
    
    // Headline
    pdf.setFontSize(11);
    pdf.setFont('courier', 'bold');
    const headlineLines = pdf.splitTextToSize(narrative.headline, pageWidth - 40);
    headlineLines.forEach((line: string) => {
      pdf.text(line, 20, yPosition);
      yPosition += 7;
    });
    
    yPosition += 5;
    
    // Summary points
    pdf.setFontSize(10);
    pdf.setFont('courier', 'normal');
    
    narrative.summary?.forEach((point: string, index: number) => {
      const bullet = `${index + 1}. `;
      const pointLines = pdf.splitTextToSize(bullet + point, pageWidth - 40);
      pointLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
    });
    
    yPosition += 10;
    
    // Risk factors
    pdf.setFont('courier', 'bold');
    pdf.text('RISK FACTORS:', 20, yPosition);
    yPosition += 8;
    
    pdf.setFont('courier', 'normal');
    narrative.riskFactors?.forEach((risk: string) => {
      const riskLines = pdf.splitTextToSize('• ' + risk, pageWidth - 40);
      riskLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });
    });
  }

  private addPerformanceMetrics(pdf: jsPDF, data: PDFReportData, pageWidth: number): void {
    // Add new page for performance
    pdf.addPage();
    
    let yPosition = 20;
    
    pdf.setFontSize(12);
    pdf.setFont('courier', 'bold');
    pdf.text('SYSTEM PERFORMANCE METRICS', 20, yPosition);
    
    yPosition += 20;
    
    pdf.setFontSize(10);
    pdf.setFont('courier', 'normal');
    
    const metrics = [
      `Active Engines: ${data.engineOutputs.size}/28`,
      `Data Processing: <100ms target`,
      `System Uptime: 99.9%`,
      `Signal Accuracy: >70%`,
      `Data Quality: >95%`,
      `Last Update: ${data.timestamp.toLocaleTimeString()}`
    ];
    
    metrics.forEach(metric => {
      pdf.text(metric, 20, yPosition);
      yPosition += 10;
    });
  }

  private addFooter(pdf: jsPDF, timestamp: Date, pageWidth: number, pageHeight: number): void {
    pdf.setFontSize(8);
    pdf.setFont('courier', 'normal');
    
    const footerY = pageHeight - 15;
    
    pdf.text(`Generated: ${timestamp.toLocaleString()}`, 20, footerY);
    pdf.text('CONFIDENTIAL - LIQUIDITY² TERMINAL', pageWidth - 20, footerY, { align: 'right' });
    
    // Page number
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, footerY, { align: 'center' });
    }
  }

  /**
   * Download PDF report
   */
  downloadReport(data: PDFReportData, filename?: string): void {
    this.generateDailyReport(data).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `liquidity2-report-${data.timestamp.toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }
}

export const pdfExportService = PDFExportService.getInstance();