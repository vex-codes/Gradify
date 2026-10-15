import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'classic' | 'ocean' | 'sunset' | 'lemon' | 'magenta' | 'custom';

export interface CustomThemeConfig {
    colors: { hue: number; saturation: number; lightness: number }[];
    glow: number; // 0 to 1 intensity
    radius: number; // 0 to 1
}

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    customTheme: CustomThemeConfig;
    setCustomTheme: (config: CustomThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const DEFAULT_CUSTOM_THEME: CustomThemeConfig = {
    colors: [
        { hue: 280, saturation: 85, lightness: 60 },
        { hue: 320, saturation: 85, lightness: 60 }
    ],
    glow: 0.5,
    radius: 0.5
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('gradify_theme') as Theme) || 'classic';
    });

    const [customTheme, setCustomTheme] = useState<CustomThemeConfig>(() => {
        const stored = localStorage.getItem('gradify_custom_theme');
        return stored ? JSON.parse(stored) : DEFAULT_CUSTOM_THEME;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Persist
        localStorage.setItem('gradify_theme', theme);
        localStorage.setItem('gradify_custom_theme', JSON.stringify(customTheme));

        // Apply base theme attribute
        root.setAttribute('data-theme', theme);

        // Handle Custom Theme Injection
        const styleId = 'gradify-custom-theme-styles';
        let styleTag = document.getElementById(styleId);

        if (theme === 'custom') {
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = styleId;
                document.head.appendChild(styleTag);
            }

            const { colors, glow, radius } = customTheme;
            // Fallback to defaults if colors is somehow empty or malformed
            const safeColors = (colors && colors.length > 0) ? colors : DEFAULT_CUSTOM_THEME.colors;

            // Primary Solid Fallback (First Color)
            const primaryHsl = safeColors[0];
            const { hue, saturation, lightness } = primaryHsl;

            const primary = `${hue} ${saturation}% ${lightness}%`;
            const primaryFg = `${hue} ${Math.max(10, saturation - 20)}% 98%`;

            // Gradient String
            const gradientStops = safeColors.map(c => `hsl(${c.hue}, ${c.saturation}%, ${c.lightness}%)`).join(', ');
            const gradient = `linear-gradient(135deg, ${gradientStops})`;

            // Dynamic Grade Colors (Based on first color for now)
            // A = Primary (Bright/Vibrant)
            // B = Hue - 15 (Slightly different)
            // F = Dark/Desaturated
            const css = `
                :root[data-theme="custom"] {
                    --primary: ${primary};
                    --primary-foreground: ${primaryFg};
                    --ring: ${primary};
                    --sidebar-accent: ${hue} ${saturation}% ${98}%;
                    --radius: ${radius}rem;
                    
                    /* Gradient Variable */
                    --primary-gradient: ${gradient};
                    
                    /* Dynamically generated grade colors based on primary hue */
                    --grade-a: ${hue} ${saturation}% ${lightness}%;
                    --grade-a-fg: ${hue} ${Math.max(10, saturation - 20)}% 98%;
                    
                    --grade-b: ${hue - 15} ${saturation}% ${lightness + 5}%;
                    --grade-b-fg: ${hue - 15} ${Math.max(10, saturation - 20)}% 10%;
                    
                    --grade-c: ${hue - 30} ${saturation - 10}% ${lightness + 10}%;
                    --grade-c-fg: ${hue - 30} ${Math.max(10, saturation - 20)}% 10%;
                    
                    --grade-d: ${hue - 45} ${saturation - 20}% ${lightness + 15}%;
                    --grade-d-fg: ${hue - 45} ${Math.max(10, saturation - 20)}% 10%;
                    
                    --grade-f: ${hue} ${saturation - 40}% ${Math.max(20, lightness - 30)}%;
                    --grade-f-fg: ${hue} 10% 95%;
                }
                .dark[data-theme="custom"] {
                    --primary: ${hue} ${saturation}% ${lightness}%;
                    --primary-foreground: ${hue} ${Math.max(10, saturation - 20)}% 10%;
                    --ring: ${hue} ${saturation}% ${lightness}%;

                    /* Dark Mode Grades */
                    --grade-a: ${hue} ${saturation}% ${Math.max(20, lightness - 20)}%;
                    --grade-a-fg: ${hue} ${saturation}% 95%;
                    
                    --grade-b: ${hue - 15} ${saturation}% ${Math.max(20, lightness - 20)}%;
                    --grade-b-fg: ${hue - 15} ${saturation}% 95%;
                    
                    --grade-c: ${hue - 30} ${saturation}% ${Math.max(20, lightness - 20)}%;
                    --grade-c-fg: ${hue - 30} ${saturation}% 95%;
                    
                    --grade-d: ${hue - 45} ${saturation}% ${Math.max(20, lightness - 20)}%;
                    --grade-d-fg: ${hue - 45} ${saturation}% 95%;

                    --grade-f: ${hue} ${saturation - 30}% 15%;
                    --grade-f-fg: ${hue} 20% 90%;
                }
                
                /* Override bg-primary to use gradient */
                :root[data-theme="custom"] .bg-primary,
                :root[data-theme="custom"] .bg-grade-a {
                    background: var(--primary-gradient);
                    border: none;
                }
                
                /* Glow Effect - Enhanced opacity using first color */
                ${glow > 0 ? `
                :root[data-theme="custom"] .bg-primary, 
                :root[data-theme="custom"] .bg-grade-a {
                    box-shadow: 0 0 ${glow * 30}px ${glow * 2}px hsla(${hue}, ${saturation}%, ${lightness}%, 0.6);
                    z-index: 10;
                }
                ` : ''}
            `;
            styleTag.innerHTML = css;

        } else {
            // Cleanup if switching away from custom
            if (styleTag) {
                styleTag.remove();
            }
        }

    }, [theme, customTheme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, customTheme, setCustomTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
