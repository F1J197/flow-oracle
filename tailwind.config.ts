import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// LIQUIDITY² Enhanced Design System
				// Noir Foundation
				'bg-primary': 'hsl(var(--bg-primary))',
				'bg-secondary': 'hsl(var(--bg-secondary))',
				'bg-tile': 'hsl(var(--bg-tile))',
				'bg-elevated': 'hsl(var(--bg-elevated))',
				
				// Glass Effects
				'glass-bg': 'hsl(var(--glass-bg))',
				'glass-border': 'hsl(var(--glass-border))',
				'glass-surface': 'hsl(var(--glass-surface))',
				
				// BTC Orange System
				'btc-primary': 'hsl(var(--btc-primary))',
				'btc-bright': 'hsl(var(--btc-bright))',
				'btc-light': 'hsl(var(--btc-light))',
				'btc-dark': 'hsl(var(--btc-dark))',
				'btc-muted': 'hsl(var(--btc-muted))',
				'btc-glow': 'hsl(var(--btc-glow))',
				
				// Semantic Colors
				'positive': 'hsl(var(--positive))',
				'negative': 'hsl(var(--negative))',
				'warning': 'hsl(var(--warning))',
				'critical': 'hsl(var(--critical))',
				'success': 'hsl(var(--success))',
				'info': 'hsl(var(--info))',
				
				// Typography
				'text-primary': 'hsl(var(--text-primary))',
				'text-secondary': 'hsl(var(--text-secondary))',
				'text-muted': 'hsl(var(--text-muted))',
				'text-accent': 'hsl(var(--text-accent))',
				'text-data': 'hsl(var(--text-data))',
				
				// Legacy Compatibility
				noir: {
					bg: 'hsl(var(--bg-primary))',
					surface: 'hsl(var(--bg-secondary))',
					border: 'hsl(var(--glass-border))'
				},
				btc: {
					orange: 'hsl(var(--btc-primary))',
					'orange-bright': 'hsl(var(--btc-bright))',
					'orange-light': 'hsl(var(--btc-light))',
					'orange-dark': 'hsl(var(--btc-dark))',
					'orange-muted': 'hsl(var(--btc-muted))',
					primary: 'hsl(var(--btc-primary))',
					light: 'hsl(var(--btc-light))',
					dark: 'hsl(var(--btc-dark))',
					glow: 'hsl(var(--btc-glow))',
					muted: 'hsl(var(--btc-muted))'
				}
			},
			borderRadius: {
				lg: '0',
				md: '0', 
				sm: '0',
				none: '0',
				DEFAULT: '0'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			fontFamily: {
				mono: ['JetBrains Mono', 'IBM Plex Mono', 'Roboto Mono', 'monospace'],
				terminal: ['JetBrains Mono', 'monospace']
			},
			// Bloomberg Terminal Extensions  
			backdropBlur: {
				none: 'none'  // Override backdrop blur for terminal mode
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
