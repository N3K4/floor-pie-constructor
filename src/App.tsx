import React, { useState, useCallback, useEffect } from 'react';
import { CoatingType, Pie, PieLayer } from './types';
import { coatingTypes as initialCoatingTypes } from './data';
import { PatternRenderer } from './PatternRenderer';
import { downloadPieImage, downloadAllPies, exportPieAsPNG } from './PieExportImage';

const STORAGE_KEY = 'pie-constructor-data';
const LAYER_HEIGHT = 36; // фиксированная высота слоя в визуализации

function App() {
  const [pies, setPies] = useState<Pie[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Миграция: преобразуем числовые thickness в строки и валидируем данные
      return parsed
        .filter((pie: any) => pie && pie.id && pie.number && Array.isArray(pie.layers))
        .map((pie: Pie) => ({
          ...pie,
          layers: pie.layers
            .filter((layer: any) => layer && layer.id && layer.coatingType)
            .map((layer: PieLayer) => ({
              ...layer,
              coatingType: {
                ...layer.coatingType,
                thickness: String(layer.coatingType.thickness ?? ''),
              },
            })),
        }));
    } catch {
      return [];
    }
  });
  const [coatingTypes, setCoatingTypes] = useState<CoatingType[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '-palette');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
            .filter((c: any) => c && c.id && c.name && c.color && c.pattern)
            .map((c: CoatingType) => ({ ...c, thickness: String(c.thickness ?? '') }));
        }
      }
    } catch {}
    return initialCoatingTypes.map((c) => ({ ...c, thickness: String(c.thickness) }));
  });
  const [selectedPieId, setSelectedPieId] = useState<string | null>(null);
  const [newPieNumber, setNewPieNumber] = useState('');
  const [newPieName, setNewPieName] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [exportTab, setExportTab] = useState<'text' | 'image'>('image');
  const [withGaps, setWithGaps] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pies));
  }, [pies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '-palette', JSON.stringify(coatingTypes));
  }, [coatingTypes]);

  const updateCoatingThickness = useCallback((id: string, thickness: string) => {
    setCoatingTypes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, thickness } : c))
    );
  }, []);

  const selectedPie = pies.find((p) => p.id === selectedPieId) || null;

  const addPie = useCallback(() => {
    if (!newPieNumber.trim()) return;
    const newPie: Pie = {
      id: Date.now().toString(),
      number: newPieNumber.trim(),
      name: newPieName.trim() || `Пирог №${newPieNumber.trim()}`,
      layers: [],
    };
    setPies((prev) => [...prev, newPie]);
    setSelectedPieId(newPie.id);
    setNewPieNumber('');
    setNewPieName('');
  }, [newPieNumber, newPieName]);

  const deletePie = useCallback((id: string) => {
    setPies((prev) => prev.filter((p) => p.id !== id));
    setSelectedPieId((prev) => (prev === id ? null : prev));
  }, []);

  const addLayer = useCallback(
    (coating: CoatingType) => {
      if (!selectedPieId) return;
      const newLayer: PieLayer = {
        id: Date.now().toString() + Math.random().toString(36),
        coatingType: { ...coating },
        order: 0,
      };
      setPies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPieId) return p;
          const updatedLayers = [...p.layers, newLayer].map((l, i) => ({ ...l, order: i }));
          return { ...p, layers: updatedLayers };
        })
      );
    },
    [selectedPieId]
  );

  const removeLayer = useCallback(
    (layerId: string) => {
      if (!selectedPieId) return;
      setPies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPieId) return p;
          const updatedLayers = p.layers
            .filter((l) => l.id !== layerId)
            .map((l, i) => ({ ...l, order: i }));
          return { ...p, layers: updatedLayers };
        })
      );
    },
    [selectedPieId]
  );

  const updateLayerThickness = useCallback(
    (layerId: string, thickness: string) => {
      if (!selectedPieId) return;
      setPies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPieId) return p;
          return {
            ...p,
            layers: p.layers.map((l) =>
              l.id === layerId ? { ...l, coatingType: { ...l.coatingType, thickness } } : l
            ),
          };
        })
      );
    },
    [selectedPieId]
  );

  const moveLayer = useCallback(
    (layerId: string, direction: 'up' | 'down') => {
      if (!selectedPieId) return;
      setPies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPieId) return p;
          const idx = p.layers.findIndex((l) => l.id === layerId);
          if (idx === -1) return p;
          if (direction === 'up' && idx === 0) return p;
          if (direction === 'down' && idx === p.layers.length - 1) return p;

          const newLayers = [...p.layers];
          const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
          [newLayers[idx], newLayers[swapIdx]] = [newLayers[swapIdx], newLayers[idx]];
          return { ...p, layers: newLayers.map((l, i) => ({ ...l, order: i })) };
        })
      );
    },
    [selectedPieId]
  );

  const clearLayers = useCallback(() => {
    if (!selectedPieId) return;
    setPies((prev) =>
      prev.map((p) => (p.id === selectedPieId ? { ...p, layers: [] } : p))
    );
  }, [selectedPieId]);

  const duplicateLayer = useCallback(
    (layer: PieLayer) => {
      if (!selectedPieId) return;
      const newLayer: PieLayer = {
        ...layer,
        id: Date.now().toString() + Math.random().toString(36),
      };
      setPies((prev) =>
        prev.map((p) => {
          if (p.id !== selectedPieId) return p;
          const idx = p.layers.findIndex((l) => l.id === layer.id);
          const updatedLayers = [...p.layers];
          updatedLayers.splice(idx + 1, 0, newLayer);
          return { ...p, layers: updatedLayers.map((l, i) => ({ ...l, order: i })) };
        })
      );
    },
    [selectedPieId]
  );

  const exportText = selectedPie
    ? `ПИРОГ №${selectedPie.number} — ${selectedPie.name}\n${'═'.repeat(50)}\n\n${selectedPie.layers
        .map(
          (l, i) =>
            `${String(i + 1).padStart(2, '0')}. ${l.coatingType.name} — ${l.coatingType.thickness} мм`
        )
        .join('\n')}`
    : '';

  const openExport = useCallback(() => {
    setShowExport(true);
    setExportTab('image');
    setPreviewUrl(null);
  }, []);

  const generatePreview = useCallback(async () => {
    if (!selectedPie) return;
    setIsGenerating(true);
    try {
      const url = await exportPieAsPNG(selectedPie, withGaps);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedPie, withGaps]);

  useEffect(() => {
    if (showExport && exportTab === 'image' && selectedPie) {
      generatePreview();
    }
  }, [showExport, exportTab, withGaps, selectedPie, generatePreview]);

  const handleDownloadImage = useCallback(async () => {
    if (!selectedPie) return;
    await downloadPieImage(selectedPie, withGaps);
  }, [selectedPie, withGaps]);

  // Рендер паттерна для inline SVG в визуализации
  const renderPatternContent = (pattern: string) => {
    switch (pattern) {
      case 'dots':
        return (
          <>
            <circle cx="5" cy="5" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="15" cy="5" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="5" cy="15" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="15" cy="15" r="1.5" fill="rgba(0,0,0,0.2)" />
            <circle cx="10" cy="10" r="1.5" fill="rgba(0,0,0,0.2)" />
          </>
        );
      case 'gravel':
        return (
          <>
            <ellipse cx="5" cy="5" rx="2" ry="1.5" fill="rgba(0,0,0,0.1)" />
            <ellipse cx="15" cy="12" rx="3" ry="2" fill="rgba(255,255,255,0.1)" />
            <ellipse cx="8" cy="16" rx="2" ry="1" fill="rgba(0,0,0,0.08)" />
          </>
        );
      case 'mesh':
        return (
          <>
            <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />
            <line x1="10" y1="0" x2="10" y2="20" stroke="rgba(0,0,0,0.25)" strokeWidth="0.7" />
          </>
        );
      case 'terrazzo':
        return (
          <>
            <polygon points="3,3 7,5 5,8" fill="#8B4513" opacity="0.5" />
            <polygon points="12,10 16,12 14,15" fill="#696969" opacity="0.5" />
            <polygon points="8,14 11,16 9,18" fill="#F5F5DC" opacity="0.5" />
          </>
        );
      case 'wood':
        return (
          <>
            <line x1="0" y1="4" x2="20" y2="4.5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            <line x1="0" y1="9" x2="20" y2="8.5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            <line x1="0" y1="14" x2="20" y2="14.5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            <line x1="0" y1="19" x2="20" y2="18.5" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
          </>
        );
      case 'herringbone':
        return (
          <>
            <rect x="1" y="1" width="8" height="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" transform="rotate(45 5 3)" />
            <rect x="10" y="10" width="8" height="4" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" transform="rotate(-45 14 12)" />
          </>
        );
      case 'planks':
        return (
          <>
            <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
            <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
            <line x1="0" y1="15" x2="20" y2="15" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          </>
        );
      case 'smooth':
        return <rect width="20" height="20" fill="rgba(255,255,255,0.05)" />;
      case 'fibers':
        return (
          <>
            <line x1="2" y1="3" x2="8" y2="7" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            <line x1="12" y1="5" x2="18" y2="9" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            <line x1="5" y1="12" x2="11" y2="16" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
            <line x1="14" y1="14" x2="19" y2="18" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
          </>
        );
      case 'tiles':
        return (
          <>
            <rect x="1" y="1" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" rx="0.5" />
            <rect x="11" y="1" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" rx="0.5" />
            <rect x="1" y="11" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" rx="0.5" />
            <rect x="11" y="11" width="8" height="8" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" rx="0.5" />
          </>
        );
      case 'glue':
        return (
          <>
            <polygon points="0,10 4,2 8,10" fill="rgba(0,0,0,0.12)" />
            <polygon points="8,10 12,2 16,10" fill="rgba(0,0,0,0.12)" />
            <polygon points="4,20 8,12 12,20" fill="rgba(0,0,0,0.12)" />
            <polygon points="12,20 16,12 20,20" fill="rgba(0,0,0,0.12)" />
          </>
        );
      case 'metal':
        return (
          <>
            <rect width="20" height="10" fill="rgba(255,255,255,0.1)" />
            <line x1="0" y1="7" x2="20" y2="7" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <span className="text-2xl">🏗️</span> Конструктор пирога покрытий
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Создавайте и визуализируйте многослойные конструкции покрытий
          </p>
        </div>
        <div className="flex gap-2">
          {pies.some(p => p.layers.length > 0) && (
            <button
              onClick={() => downloadAllPies(pies.filter(p => p.layers.length > 0), withGaps)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              📦 Экспорт всех
            </button>
          )}
          {selectedPie && selectedPie.layers.length > 0 && (
            <button
              onClick={openExport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              📋 Экспорт
            </button>
          )}
        </div>
      </header>

      {/* Export Modal */}
      {showExport && selectedPie && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowExport(false)}
        >
          <div
            className="bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-600 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-gray-200">
                Экспорт — Пирог №{selectedPie.number}
              </h3>
              <button
                onClick={() => setShowExport(false)}
                className="text-gray-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setExportTab('image')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  exportTab === 'image'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                🖼️ Картинка
              </button>
              <button
                onClick={() => setExportTab('text')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  exportTab === 'text'
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                📝 Текст
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {exportTab === 'image' && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={withGaps}
                        onChange={(e) => setWithGaps(e.target.checked)}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">Зазоры между слоями</span>
                    </label>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 overflow-auto">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-48">
                        <div className="text-gray-400 text-sm">Генерация...</div>
                      </div>
                    ) : previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Превью пирога"
                        className="max-w-full h-auto mx-auto rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-48">
                        <div className="text-gray-400 text-sm">Нет превью</div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDownloadImage}
                    disabled={!previewUrl || isGenerating}
                    className="mt-4 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    💾 Скачать PNG
                  </button>
                </div>
              )}

              {exportTab === 'text' && (
                <div>
                  <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-64 border border-gray-700">
                    {exportText}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportText);
                    }}
                    className="mt-4 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    📋 Скопировать в буфер
                  </button>
                </div>
              )}

              {/* Экспорт всех пирогов */}
              {pies.filter(p => p.layers.length > 0).length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-200">Экспорт всех пирогов</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pies.filter(p => p.layers.length > 0).length} пирогов будут скачаны как PNG
                      </p>
                    </div>
                    <button
                      onClick={() => downloadAllPies(pies.filter(p => p.layers.length > 0), withGaps)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      📦 Скачать все
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Pie List */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-1.5">
              📋 Пироги
            </h2>
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Номер пирога *"
                value={newPieNumber}
                onChange={(e) => setNewPieNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPie()}
                className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Название (необязательно)"
                value={newPieName}
                onChange={(e) => setNewPieName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPie()}
                className="w-full px-2.5 py-1.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addPie}
                className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
              >
                + Добавить пирог
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {pies.length === 0 && (
              <p className="text-gray-500 text-xs text-center mt-6">
                Нет пирогов.<br />Добавьте первый!
              </p>
            )}
            {pies.map((pie) => (
              <div
                key={pie.id}
                onClick={() => setSelectedPieId(pie.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all ${
                  selectedPieId === pie.id
                    ? 'bg-blue-600/20 border border-blue-500 shadow-lg shadow-blue-500/10'
                    : 'bg-gray-700/30 border border-transparent hover:border-gray-600 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-xs text-gray-100 truncate">
                      Пирог №{pie.number}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {pie.layers.length} слоёв
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePie(pie.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1 text-xs flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Panel - Coating Palette */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="px-4 py-2.5 border-b border-gray-700 bg-gray-800/50">
            <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
              🎨 Палитра покрытий
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {selectedPieId ? 'Нажмите на покрытие, чтобы добавить в пирог. Толщину можно изменить в списке слоёв.' : 'Сначала выберите или создайте пирог'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
              {coatingTypes.map((coating) => (
                <div
                  key={coating.id}
                  className={`group relative flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                    selectedPieId
                      ? 'bg-gray-800 border-gray-600 hover:border-blue-500 cursor-pointer hover:shadow-lg hover:shadow-blue-500/5'
                      : 'bg-gray-800/50 border-gray-700 opacity-60'
                  }`}
                  onClick={() => selectedPieId && addLayer(coating)}
                >
                  <div className="w-11 h-11 rounded overflow-hidden border border-gray-600 flex-shrink-0 shadow-inner">
                    <PatternRenderer pattern={coating.pattern} color={coating.color} width={44} height={44} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-200 truncate leading-tight">
                      {coating.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={String(coating.thickness)}
                        onChange={(e) => updateCoatingThickness(coating.id, e.target.value)}
                        className="w-14 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] text-gray-100 focus:outline-none focus:border-blue-500 font-mono"
                        title="Толщина (можно редактировать)"
                      />
                      <span className="text-[10px] text-gray-400">мм</span>
                    </div>
                  </div>
                  {selectedPieId && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white font-bold">
                      +
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Pie Visualization */}
        <div className="w-[420px] bg-gray-800 border-l border-gray-700 flex flex-col flex-shrink-0">
          <div className="px-4 py-2.5 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
              📐 Визуализация пирога
            </h2>
            {!selectedPie && (
              <p className="text-[10px] text-gray-400 mt-0.5">Выберите или создайте пирог</p>
            )}
            {selectedPie && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-gray-400">
                  Пирог №{selectedPie.number}
                </p>
                {selectedPie.layers.length > 0 && (
                  <button
                    onClick={clearLayers}
                    className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                  >
                    Очистить
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedPie && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-xs">Выберите пирог для визуализации</p>
                </div>
              </div>
            )}

            {selectedPie && selectedPie.layers.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-3xl mb-2">🧱</div>
                  <p className="text-xs">Добавьте слои из палитры</p>
                </div>
              </div>
            )}

            {selectedPie && selectedPie.layers.length > 0 && (
              <div>
                {/* Pie cross-section visualization */}
                <div className="relative">
                  {/* Dimension line on the left */}
                  <div className="absolute -left-1 top-0 bottom-0 flex flex-col items-center">
                    <div className="w-px flex-1 bg-gray-500" />
                    <div className="text-[9px] text-gray-400 font-mono bg-gray-800 px-0.5 py-0.5 rounded">
                      {selectedPie.layers.length}
                    </div>
                    <div className="w-px flex-1 bg-gray-500" />
                  </div>

                  {/* Layers — одинаковая высота, с зазорами */}
                  <div className="ml-4 space-y-1.5">
                    {[...selectedPie.layers].reverse().map((layer) => (
                      <div key={layer.id} className="group relative flex items-stretch gap-2">
                        {/* Layer bar with pattern */}
                        <div className="flex-1 relative">
                          <div
                            className="w-full rounded-sm overflow-hidden border border-gray-600/50 transition-all group-hover:border-blue-500/50"
                            style={{ height: `${LAYER_HEIGHT}px` }}
                          >
                            <svg width="100%" height="100%" preserveAspectRatio="none">
                              <defs>
                                <pattern
                                  id={`pat-${layer.id}`}
                                  x="0" y="0" width="20" height="20"
                                  patternUnits="userSpaceOnUse"
                                >
                                  <rect width="20" height="20" fill={layer.coatingType.color} />
                                  {renderPatternContent(layer.coatingType.pattern)}
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill={`url(#pat-${layer.id})`} />
                            </svg>
                          </div>
                        </div>

                        {/* Layer name + editable thickness */}
                        <div className="w-40 flex flex-col justify-center flex-shrink-0 gap-0.5">
                          <div className="text-[11px] font-medium text-gray-200 leading-tight">
                            {layer.coatingType.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={String(layer.coatingType.thickness ?? '')}
                              onChange={(e) => updateLayerThickness(layer.id, e.target.value)}
                              className="w-16 px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] text-gray-100 focus:outline-none focus:border-blue-500 font-mono"
                              title="Толщина (можно редактировать)"
                            />
                            <span className="text-[9px] text-gray-500">мм</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => moveLayer(layer.id, 'up')}
                            className="text-[10px] text-gray-400 hover:text-white w-4 h-4 flex items-center justify-center rounded hover:bg-gray-600"
                            title="Вверх"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveLayer(layer.id, 'down')}
                            className="text-[10px] text-gray-400 hover:text-white w-4 h-4 flex items-center justify-center rounded hover:bg-gray-600"
                            title="Вниз"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => duplicateLayer(layer)}
                            className="text-[10px] text-gray-400 hover:text-blue-400 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-600"
                            title="Дублировать"
                          >
                            ⧉
                          </button>
                          <button
                            onClick={() => removeLayer(layer.id)}
                            className="text-[10px] text-red-400 hover:text-red-300 w-4 h-4 flex items-center justify-center rounded hover:bg-gray-600"
                            title="Удалить"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specification table */}
                <div className="mt-5 pt-3 border-t border-gray-700">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Спецификация (снизу вверх)
                  </h3>
                  <div className="space-y-1">
                    {selectedPie.layers.map((layer, idx) => (
                      <div key={layer.id} className="flex items-center gap-2 text-[11px] py-1 px-2 rounded hover:bg-gray-700/30">
                        <span className="w-5 h-5 bg-gray-700 rounded flex items-center justify-center text-gray-300 font-mono text-[9px] flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div
                          className="w-3 h-3 rounded-sm border border-gray-600 flex-shrink-0"
                          style={{ backgroundColor: layer.coatingType.color }}
                        />
                        <span className="text-gray-300 flex-1 truncate">{layer.coatingType.name}</span>
                        <input
                          type="text"
                          value={String(layer.coatingType.thickness ?? '')}
                          onChange={(e) => updateLayerThickness(layer.id, e.target.value)}
                          className="w-16 px-1 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] text-gray-300 focus:outline-none focus:border-blue-500 font-mono text-right"
                        />
                        <span className="text-gray-500 text-[10px] flex-shrink-0">мм</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
