import { useState, useEffect } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
// Slider removed as we used native inputs

export function ThemeBuilder() {
    const { customTheme, setCustomTheme } = useTheme();
    // Use first slot by default, ensure safety
    const [activeColorIndex, setActiveColorIndex] = useState(0);

    // Ensure valid index if colors removed
    useEffect(() => {
        if (customTheme.colors && activeColorIndex >= customTheme.colors.length) {
            setActiveColorIndex(Math.max(0, customTheme.colors.length - 1));
        }
    }, [customTheme.colors, activeColorIndex]);

    // Safety fallback
    const colors = customTheme.colors || [{ hue: 280, saturation: 80, lightness: 60 }];
    const activeColor = colors[activeColorIndex] || colors[0];

    const handleColorChange = (key: 'hue' | 'saturation' | 'lightness', value: number) => {
        const newColors = [...colors];
        newColors[activeColorIndex] = { ...newColors[activeColorIndex], [key]: value };
        setCustomTheme({ ...customTheme, colors: newColors });
    };

    const handleGlobalChange = (key: keyof typeof customTheme, value: number | boolean) => {
        setCustomTheme({ ...customTheme, [key]: value });
    };

    const addColor = () => {
        if (colors.length >= 4) return;
        // Duplicate last color or default, shift hue slightly
        const lastColor = colors[colors.length - 1];
        const newColor = { ...lastColor, hue: (lastColor.hue + 30) % 360 };
        setCustomTheme({ ...customTheme, colors: [...colors, newColor] });
        setActiveColorIndex(colors.length);
    };

    const removeColor = (index: number) => {
        if (colors.length <= 1) return;
        const newColors = colors.filter((_, i) => i !== index);
        setCustomTheme({ ...customTheme, colors: newColors });
        // Correct index handled by useEffect
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <Palette className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Custom Theme Studio</h3>
                        <p className="text-sm text-muted-foreground">Craft your gradient masterpiece</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        {/* Color Slots */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <label className="font-medium">Gradient Stops</label>
                                <button
                                    onClick={addColor}
                                    disabled={colors.length >= 4}
                                    className="text-xs text-primary hover:underline disabled:opacity-50"
                                >
                                    + Add Color
                                </button>
                            </div>
                            <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg overflow-x-auto">
                                {colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveColorIndex(idx)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all relative group",
                                            activeColorIndex === idx
                                                ? "bg-background shadow-sm text-foreground ring-1 ring-border"
                                                : "text-muted-foreground hover:bg-background/50"
                                        )}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full border border-black/10"
                                            style={{ backgroundColor: `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)` }}
                                        />
                                        <span>Color {idx + 1}</span>
                                        {colors.length > 1 && (
                                            <span
                                                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                                                onClick={(e) => { e.stopPropagation(); removeColor(idx); }}
                                            >
                                                ×
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hue */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <label className="font-medium">Color {activeColorIndex + 1} Hue</label>
                                <span className="text-muted-foreground">{activeColor.hue}°</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={activeColor.hue}
                                onChange={(e) => handleColorChange('hue', Number(e.target.value))}
                                className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-red-500 [&::-webkit-slider-runnable-track]:via-green-500 [&::-webkit-slider-runnable-track]:to-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-400 [&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:shadow-sm"
                            />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <label className="font-medium">Saturation</label>
                                <span className="text-muted-foreground">{activeColor.saturation}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={activeColor.saturation}
                                onChange={(e) => handleColorChange('saturation', Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Lightness */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <label className="font-medium">Brightness</label>
                                <span className="text-muted-foreground">{activeColor.lightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="90"
                                value={activeColor.lightness}
                                onChange={(e) => handleColorChange('lightness', Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        {/* Radius */}
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <label className="font-medium">Roundness</label>
                                <span className="text-muted-foreground">{customTheme.radius}rem</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={customTheme.radius}
                                onChange={(e) => handleGlobalChange('radius', Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="pt-4 flex gap-6">
                            {/* Glow */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Glow</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={customTheme.glow}
                                    onChange={(e) => handleGlobalChange('glow', Number(e.target.value))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview - Second Column */}
                    <div className="bg-background rounded-xl p-4 border border-border shadow-lg flex flex-col gap-4 relative overflow-hidden group h-fit">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                <Palette className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="h-2 w-24 bg-foreground/20 rounded-full mb-1" />
                                <div className="h-2 w-16 bg-foreground/10 rounded-full" />
                            </div>
                        </div>

                        <div className="h-24 bg-card rounded-lg border border-border p-3 space-y-2 relative z-10">
                            <div className="flex justify-between items-center">
                                <div className="h-2 w-12 bg-primary/20 rounded-full" />
                                <div className="h-4 w-8 bg-primary rounded-md" />
                            </div>
                            <div className="h-full bg-secondary/50 rounded flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">Preview Content</span>
                            </div>
                        </div>

                        <div className="flex gap-2 relative z-10">
                            <button className="flex-1 bg-primary text-primary-foreground h-8 text-xs font-medium rounded-md shadow-lg shadow-primary/20">
                                Button
                            </button>
                            <button className="flex-1 bg-secondary text-secondary-foreground h-8 text-xs font-medium rounded-md border border-border">
                                Secondary
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
