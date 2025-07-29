import { GlassTile } from "@/components/shared/GlassTile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataDisplay } from "@/components/shared/DataDisplay";

export const BtcThemeShowcase = () => {
  return (
    <div className="space-y-8 p-6">
      {/* Color Palette Showcase */}
      <div className="grid grid-cols-5 gap-4">
        <div className="glass-tile p-4 text-center">
          <div className="w-16 h-16 bg-btc-orange rounded-lg mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">BTC Orange</p>
          <p className="text-xs font-mono text-btc-orange">#F7931A</p>
        </div>
        <div className="glass-tile p-4 text-center">
          <div className="w-16 h-16 bg-btc-orange-bright rounded-lg mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">Orange Bright</p>
          <p className="text-xs font-mono text-btc-orange-bright">#FF9F33</p>
        </div>
        <div className="glass-tile p-4 text-center">
          <div className="w-16 h-16 bg-btc-orange-light rounded-lg mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">Orange Light</p>
          <p className="text-xs font-mono text-btc-orange-light">#FFAA55</p>
        </div>
        <div className="glass-tile p-4 text-center">
          <div className="w-16 h-16 bg-btc-orange-dark rounded-lg mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">Orange Dark</p>
          <p className="text-xs font-mono text-btc-orange-dark">#E67E00</p>
        </div>
        <div className="glass-tile p-4 text-center">
          <div className="w-16 h-16 bg-btc-orange-muted rounded-lg mx-auto mb-2"></div>
          <p className="text-xs text-text-secondary">Orange Muted</p>
          <p className="text-xs font-mono text-btc-orange-muted">#B87416</p>
        </div>
      </div>

      {/* Typography Showcase */}
      <GlassTile title="TYPOGRAPHY SYSTEM" size="large">
        <div className="space-y-4">
          <div className="data-value">$5.626T</div>
          <div className="data-label">NET LIQUIDITY</div>
          <div className="terminal-glow">TERMINAL GLOW TEXT</div>
          <div className="text-metric btc-primary">Metric with BTC Primary</div>
          <div className="text-data text-btc-orange-bright">Data Display</div>
        </div>
      </GlassTile>

      {/* Button Variants */}
      <GlassTile title="BUTTON VARIANTS" size="large">
        <div className="flex flex-wrap gap-4">
          <Button variant="btc">BTC Primary</Button>
          <Button variant="btc-outline">BTC Outline</Button>
          <Button variant="btc-light">BTC Light</Button>
          <Button variant="btc-dark">BTC Dark</Button>
          <Button variant="btc-muted">BTC Muted</Button>
        </div>
      </GlassTile>

      {/* Badge Variants */}
      <GlassTile title="BADGE VARIANTS" size="large">
        <div className="flex flex-wrap gap-4">
          <Badge variant="btc">BTC</Badge>
          <Badge variant="btc-bright">BTC Bright</Badge>
          <Badge variant="btc-light">BTC Light</Badge>
          <Badge variant="btc-dark">BTC Dark</Badge>
          <Badge variant="btc-muted">BTC Muted</Badge>
        </div>
      </GlassTile>

      {/* Glass Effects */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-tile p-6">
          <h3 className="text-lg font-semibold text-btc-orange mb-4">Standard Glass Tile</h3>
          <p className="text-text-secondary">Standard glass morphism effect with backdrop blur and subtle borders.</p>
        </div>
        <div className="glass-tile-premium p-6">
          <h3 className="text-lg font-semibold text-btc-orange mb-4">Premium Glass Tile</h3>
          <p className="text-text-secondary">Enhanced premium glass effect with BTC orange accent integration.</p>
        </div>
      </div>

      {/* Data Display Components */}
      <GlassTile title="DATA DISPLAY COMPONENTS" size="large">
        <div className="grid grid-cols-3 gap-6">
          <DataDisplay 
            value="89.7" 
            suffix="%" 
            label="Confidence Level" 
            trend="up" 
            color="btc"
            size="lg"
          />
          <DataDisplay 
            value="$2.4B" 
            label="Daily Volume" 
            trend="down" 
            color="btc-dark"
            size="lg"
          />
          <DataDisplay 
            value="127" 
            label="Active Engines" 
            color="btc-bright"
            size="lg"
          />
        </div>
      </GlassTile>

      {/* Text Effects */}
      <GlassTile title="TEXT EFFECTS & GLOWS" size="large">
        <div className="space-y-4">
          <div className="btc-primary">BTC Primary with Glow</div>
          <div className="btc-light">BTC Light Effect</div>
          <div className="btc-glow">BTC Bright Glow</div>
          <div className="btc-muted">BTC Muted Subtle</div>
          <div className="btc-pulse">BTC Pulse Animation</div>
        </div>
      </GlassTile>
    </div>
  );
};