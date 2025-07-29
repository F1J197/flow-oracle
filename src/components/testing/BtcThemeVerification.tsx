import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BtcThemeVerification = () => {
  return (
    <div className="p-8 space-y-8 bg-bg-primary min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-text-primary">BTC Theme Verification</h1>
        <p className="text-text-secondary">Testing complete BTC orange theme implementation</p>
      </div>

      {/* Color Palette Test */}
      <Card className="bg-glass-bg border-glass-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Color Palette</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="w-full h-16 bg-btc-primary rounded"></div>
            <p className="text-xs text-text-secondary">BTC Primary</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-btc-bright rounded"></div>
            <p className="text-xs text-text-secondary">BTC Bright</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-btc-light rounded"></div>
            <p className="text-xs text-text-secondary">BTC Light</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-btc-dark rounded"></div>
            <p className="text-xs text-text-secondary">BTC Dark</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-btc-muted rounded"></div>
            <p className="text-xs text-text-secondary">BTC Muted</p>
          </div>
        </CardContent>
      </Card>

      {/* Badges Test */}
      <Card className="bg-glass-bg border-glass-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Badge Variants</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Badge variant="btc">BTC</Badge>
          <Badge variant="btc-bright">BTC Bright</Badge>
          <Badge variant="btc-light">BTC Light</Badge>
          <Badge variant="btc-dark">BTC Dark</Badge>
          <Badge variant="btc-muted">BTC Muted</Badge>
          <Badge variant="btc-primary">BTC Primary</Badge>
          <Badge variant="btc-glow">BTC Glow</Badge>
        </CardContent>
      </Card>

      {/* Buttons Test */}
      <Card className="bg-glass-bg border-glass-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Button Variants</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="btc">BTC Button</Button>
          <Button variant="btc-outline">BTC Outline</Button>
          <Button variant="btc-light">BTC Light</Button>
          <Button variant="btc-dark">BTC Dark</Button>
          <Button variant="btc-muted">BTC Muted</Button>
        </CardContent>
      </Card>

      {/* Status Colors Test */}
      <Card className="bg-glass-bg border-glass-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Status Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-positive">Positive Text</div>
              <div className="text-negative">Negative Text</div>
              <div className="text-warning">Warning Text</div>
            </div>
            <div className="space-y-2">
              <div className="text-critical">Critical Text</div>
              <div className="text-success">Success Text</div>
              <div className="text-info">Info Text</div>
            </div>
            <div className="space-y-2">
              <div className="text-text-primary">Primary Text</div>
              <div className="text-text-secondary">Secondary Text</div>
              <div className="text-text-muted">Muted Text</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Colors Test */}
      <Card className="bg-glass-bg border-glass-border">
        <CardHeader>
          <CardTitle className="text-text-primary">Chart Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-text-secondary mb-2">Trend Indicators</h4>
              <div className="space-y-2">
                <div className="text-btc-bright">▲ Positive Trend</div>
                <div className="text-btc-dark">▼ Negative Trend</div>
                <div className="text-text-muted">→ Neutral Trend</div>
              </div>
            </div>
            <div>
              <h4 className="text-text-secondary mb-2">Data Values</h4>
              <div className="space-y-2">
                <div className="text-text-data font-mono">$5.626T</div>
                <div className="text-btc-primary font-mono">89%</div>
                <div className="text-text-accent font-mono">LIVE</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};