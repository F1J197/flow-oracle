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
				},
				neon: {
					teal: 'hsl(var(--positive))',
					orange: 'hsl(var(--negative))',
					lime: 'hsl(var(--success))',
					gold: 'hsl(var(--warning))',
					fuchsia: 'hsl(var(--critical))'
				},
				text: {
					primary: 'hsl(var(--text-primary))',
					secondary: 'hsl(var(--text-secondary))',
					muted: 'hsl(var(--text-muted))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'critical-pulse': {
					'0%, 100%': {
						boxShadow: 'var(--shadow-glass)'
					},
					'50%': {
						boxShadow: 'var(--shadow-glass), 0 0 30px hsl(var(--btc-primary) / 0.4)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'gauge-spin': {
					'0%': {
						transform: 'rotate(-90deg)'
					},
					'100%': {
						transform: 'rotate(0deg)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'critical-pulse': 'critical-pulse 2s infinite',
				'shimmer': 'shimmer 1.5s infinite',
				'gauge-spin': 'gauge-spin 1s ease-out'
			},
			fontFamily: {
				mono: ['Roboto Mono', 'monospace']
			},
			backdropBlur: {
				'glass': '10px',
				'premium': '20px'
			},
			// Enhanced grid system for premium tiles
			spacing: {
				'grid': '1.5rem',
				'grid-lg': '2rem'
			},
			// Premium container sizes
			maxWidth: {
				'8xl': '90rem',
				'9xl': '96rem'
			},
			// Enhanced perspective for 3D effects
			perspective: {
				'1000': '1000px',
				'2000': '2000px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
