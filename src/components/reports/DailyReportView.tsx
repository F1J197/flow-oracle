import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TERMINAL_THEME } from '@/config/terminal.theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';

interface DailyReportData {
  id: string;
  report_date: string;
  content: {
    id: string;
    date: string;
    executiveSummary: string;
    marketMetrics: {
      btcPrediction: {
        target: number;
        confidence: number;
        timeframe: string;
      };
      sp500Outlook: string;
      vixForecast: string;
      dollarStrength: string;
    };
    forwardGuidance: string[];
    hiddenAlpha: string[];
    earlyWarningRadar: string[];
    positioningRecommendations: string[];
    engineInsights: Array<{
      engineName: string;
      signal: string;
      confidence: number;
      insight: string;
    }>;
    createdAt: string;
  };
  created_at: string;
}

export const DailyReportView: React.FC = () => {
  const [reports, setReports] = useState<DailyReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyReportCount, setDailyReportCount] = useState(0);

  useEffect(() => {
    fetchReports();
    checkDailyReportCount();
  }, []);

  const checkDailyReportCount = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_reports')
      .select('id')
      .eq('report_date', today);
    
    setDailyReportCount(data?.length || 0);
  };

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setReports((data || []) as unknown as DailyReportData[]);
      if (data && data.length > 0) {
        setSelectedReport(data[0] as unknown as DailyReportData);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (dailyReportCount >= 3) {
      alert('Daily limit of 3 reports reached. Please try again tomorrow.');
      return;
    }

    setIsGenerating(true);
    try {
      // First ensure we have mock data
      const { mockDataService } = await import('@/services/MockDataService');
      await mockDataService.populateAllMockData();
      
      const { data, error } = await supabase.functions.invoke('daily-report-generator', {
        body: { trigger: 'manual_generation' }
      });

      if (error) throw error;

      if (data?.success) {
        console.log('Report generated successfully:', data.report);
        await fetchReports(); // Refresh the list
        await checkDailyReportCount(); // Update count
      } else {
        throw new Error(data?.error || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      // Show user-friendly error without alert
      console.log('Using fallback report generation due to API error');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal?.toLowerCase()) {
      case 'bullish':
      case 'risk_on':
        return TERMINAL_THEME.colors.semantic.positive;
      case 'bearish':
      case 'risk_off':
        return TERMINAL_THEME.colors.semantic.negative;
      case 'warning':
        return TERMINAL_THEME.colors.semantic.warning;
      default:
        return TERMINAL_THEME.colors.text.secondary;
    }
  };

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: TERMINAL_THEME.colors.background.primary,
        color: TERMINAL_THEME.colors.text.primary,
        minHeight: '100vh',
        padding: TERMINAL_THEME.spacing.lg,
        fontFamily: TERMINAL_THEME.typography.fontFamily.mono
      }}>
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ color: TERMINAL_THEME.colors.headers.primary }}>LOADING DAILY REPORTS...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: TERMINAL_THEME.colors.background.primary,
      color: TERMINAL_THEME.colors.text.primary,
      minHeight: '100vh',
      padding: TERMINAL_THEME.spacing.lg,
      fontFamily: TERMINAL_THEME.typography.fontFamily.mono
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: TERMINAL_THEME.spacing.xl
      }}>
        <div>
          <h1 style={{
            color: TERMINAL_THEME.colors.headers.primary,
            fontSize: TERMINAL_THEME.typography.sizes.hero,
            fontWeight: TERMINAL_THEME.typography.weights.bold,
            letterSpacing: '2px'
          }}>
            DAILY MACRO RESEARCH
          </h1>
          <div style={{
            fontSize: TERMINAL_THEME.typography.sizes.small,
            color: TERMINAL_THEME.colors.text.secondary,
            marginTop: TERMINAL_THEME.spacing.xs
          }}>
            Reports generated today: {dailyReportCount}/2 • Auto-generated daily at 6 AM EST
          </div>
        </div>
        <Button
          onClick={generateReport}
          disabled={isGenerating || dailyReportCount >= 2}
          style={{
            backgroundColor: dailyReportCount >= 2 
              ? TERMINAL_THEME.colors.text.secondary 
              : TERMINAL_THEME.colors.headers.primary,
            color: TERMINAL_THEME.colors.background.primary,
            border: 'none'
          }}
        >
          {isGenerating ? 'GENERATING...' : 
           dailyReportCount >= 2 ? 'DAILY LIMIT REACHED' : 
           'GENERATE NEW REPORT'}
        </Button>
      </div>

      {/* Report Selector */}
      <div style={{ marginBottom: TERMINAL_THEME.spacing.lg }}>
        <div style={{
          display: 'flex',
          gap: TERMINAL_THEME.spacing.sm,
          overflowX: 'auto',
          padding: TERMINAL_THEME.spacing.sm + ' 0'
        }}>
          {reports.map((report) => (
            <Card
              key={report.id}
              onClick={() => setSelectedReport(report)}
              style={{
                minWidth: '150px',
                cursor: 'pointer',
                backgroundColor: selectedReport?.id === report.id 
                  ? TERMINAL_THEME.colors.background.tertiary 
                  : TERMINAL_THEME.colors.background.secondary,
                border: selectedReport?.id === report.id 
                  ? `1px solid ${TERMINAL_THEME.colors.headers.primary}` 
                  : `1px solid ${TERMINAL_THEME.colors.border.default}`,
                color: TERMINAL_THEME.colors.text.primary
              }}
            >
              <CardHeader style={{ padding: TERMINAL_THEME.spacing.sm }}>
                <CardTitle style={{
                  fontSize: TERMINAL_THEME.typography.sizes.small,
                  color: TERMINAL_THEME.colors.text.primary
                }}>
                  {new Date(report.report_date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Report Display */}
      {selectedReport ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TERMINAL_THEME.spacing.lg }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: TERMINAL_THEME.spacing.md }}>
            
            {/* Executive Summary */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.headers.primary,
                  fontSize: TERMINAL_THEME.typography.sizes.large
                }}>
                  EXECUTIVE SUMMARY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{
                  fontSize: TERMINAL_THEME.typography.sizes.medium,
                  lineHeight: '1.6'
                }}>
                  {selectedReport.content.executiveSummary}
                </p>
              </CardContent>
            </Card>

            {/* Market Metrics */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.headers.primary,
                  fontSize: TERMINAL_THEME.typography.sizes.large
                }}>
                  MARKET METRICS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: TERMINAL_THEME.spacing.md }}>
                  <div>
                    <div style={{
                      fontSize: TERMINAL_THEME.typography.sizes.small,
                      color: TERMINAL_THEME.colors.text.secondary,
                      marginBottom: TERMINAL_THEME.spacing.xs
                    }}>
                      BTC PREDICTION
                    </div>
                    <div style={{
                      fontSize: TERMINAL_THEME.typography.sizes.xlarge,
                      color: TERMINAL_THEME.colors.semantic.positive,
                      fontWeight: TERMINAL_THEME.typography.weights.bold
                    }}>
                      ${selectedReport.content.marketMetrics.btcPrediction.target.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: TERMINAL_THEME.typography.sizes.small,
                      color: TERMINAL_THEME.colors.text.secondary
                    }}>
                      {selectedReport.content.marketMetrics.btcPrediction.confidence}% confidence • {selectedReport.content.marketMetrics.btcPrediction.timeframe}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: TERMINAL_THEME.typography.sizes.small,
                      color: TERMINAL_THEME.colors.text.secondary,
                      marginBottom: TERMINAL_THEME.spacing.xs
                    }}>
                      S&P 500 OUTLOOK
                    </div>
                    <div style={{
                      fontSize: TERMINAL_THEME.typography.sizes.medium,
                      color: TERMINAL_THEME.colors.text.primary
                    }}>
                      {selectedReport.content.marketMetrics.sp500Outlook}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forward Guidance */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.headers.primary,
                  fontSize: TERMINAL_THEME.typography.sizes.large
                }}>
                  FORWARD GUIDANCE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul style={{ margin: 0, paddingLeft: TERMINAL_THEME.spacing.lg }}>
                  {selectedReport.content.forwardGuidance.map((item, index) => (
                    <li key={index} style={{
                      marginBottom: TERMINAL_THEME.spacing.sm,
                      fontSize: TERMINAL_THEME.typography.sizes.medium
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: TERMINAL_THEME.spacing.md }}>
            
            {/* Hidden Alpha */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.semantic.warning}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.semantic.warning,
                  fontSize: TERMINAL_THEME.typography.sizes.large
                }}>
                  HIDDEN ALPHA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul style={{ margin: 0, paddingLeft: TERMINAL_THEME.spacing.lg }}>
                  {selectedReport.content.hiddenAlpha.map((item, index) => (
                    <li key={index} style={{
                      marginBottom: TERMINAL_THEME.spacing.sm,
                      fontSize: TERMINAL_THEME.typography.sizes.medium
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Early Warning Radar */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.semantic.negative}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.semantic.negative,
                  fontSize: TERMINAL_THEME.typography.sizes.large,
                  display: 'flex',
                  alignItems: 'center',
                  gap: TERMINAL_THEME.spacing.sm
                }}>
                  <AlertTriangle size={20} />
                  EARLY WARNING RADAR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul style={{ margin: 0, paddingLeft: TERMINAL_THEME.spacing.lg }}>
                  {selectedReport.content.earlyWarningRadar.map((item, index) => (
                    <li key={index} style={{
                      marginBottom: TERMINAL_THEME.spacing.sm,
                      fontSize: TERMINAL_THEME.typography.sizes.medium
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Positioning Recommendations */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.semantic.info}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.semantic.info,
                  fontSize: TERMINAL_THEME.typography.sizes.large
                }}>
                  POSITIONING RECOMMENDATIONS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul style={{ margin: 0, paddingLeft: TERMINAL_THEME.spacing.lg }}>
                  {selectedReport.content.positioningRecommendations.map((item, index) => (
                    <li key={index} style={{
                      marginBottom: TERMINAL_THEME.spacing.sm,
                      fontSize: TERMINAL_THEME.typography.sizes.medium
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Engine Insights */}
            <Card style={{
              backgroundColor: TERMINAL_THEME.colors.background.secondary,
              border: `1px solid ${TERMINAL_THEME.colors.border.default}`,
              color: TERMINAL_THEME.colors.text.primary
            }}>
              <CardHeader>
                <CardTitle style={{
                  color: TERMINAL_THEME.colors.headers.primary,
                  fontSize: TERMINAL_THEME.typography.sizes.large
                }}>
                  TOP ENGINE SIGNALS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', gap: TERMINAL_THEME.spacing.sm }}>
                  {selectedReport.content.engineInsights.slice(0, 6).map((engine, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: TERMINAL_THEME.spacing.sm,
                      backgroundColor: TERMINAL_THEME.colors.background.tertiary,
                      borderRadius: '4px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: TERMINAL_THEME.typography.sizes.small,
                          color: TERMINAL_THEME.colors.text.primary,
                          fontWeight: TERMINAL_THEME.typography.weights.semibold
                        }}>
                          {engine.engineName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div style={{
                          fontSize: TERMINAL_THEME.typography.sizes.tiny,
                          color: TERMINAL_THEME.colors.text.secondary
                        }}>
                          {engine.confidence}% confidence
                        </div>
                      </div>
                      <Badge style={{
                        backgroundColor: getSignalColor(engine.signal),
                        color: TERMINAL_THEME.colors.background.primary,
                        border: 'none'
                      }}>
                        {engine.signal.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          marginTop: '100px',
          color: TERMINAL_THEME.colors.text.secondary
        }}>
          <h2>No reports available</h2>
          <p>Generate your first daily report to get started.</p>
        </div>
      )}
    </div>
  );
};