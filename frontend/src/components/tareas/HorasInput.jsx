import { useState } from 'react';

/**
 * Input de horas con soporte para formato standard y cuartiles
 */
export default function HorasInput({ 
  formato = 'standard', 
  value, 
  onChange, 
  label = 'Horas registradas',
  required = true 
}) {
  const [modo, setModo] = useState(formato);

  // Opciones para cuartiles
  const cuartiles = [
    { valor: 0.25, label: '0-15 min', horas: '0.25h' },
    { valor: 0.50, label: '16-30 min', horas: '0.50h' },
    { valor: 0.75, label: '31-45 min', horas: '0.75h' },
    { valor: 1.00, label: '46-60 min', horas: '1.00h' },
  ];

  const handleCuartilChange = (valor) => {
    onChange(valor);
  };

  const handleStandardChange = (minutos) => {
    const horas = minutos / 60;
    onChange(horas);
  };

  if (modo === 'cuartiles') {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
          <span className="text-xs text-slate-500">Formato: Cuartiles</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {cuartiles.map((cuartil) => (
            <label
              key={cuartil.valor}
              className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                value === cuartil.valor
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="cuartil"
                value={cuartil.valor}
                checked={value === cuartil.valor}
                onChange={() => handleCuartilChange(cuartil.valor)}
                className="sr-only"
              />
              <span className="text-2xl mb-1">⏱️</span>
              <span className="text-sm font-medium text-slate-900">
                {cuartil.label}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {cuartil.horas}
              </span>
              {value === cuartil.valor && (
                <div className="absolute top-2 right-2 text-emerald-500">
                  ✓
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Selector de modo */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setModo('standard')}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            Cambiar a formato standard (minutos)
          </button>
        </div>
      </div>
    );
  }

  // Formato Standard (minutos)
  const minutos = value ? Math.round(value * 60) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700">
          {label} {required && '*'}
        </label>
        <span className="text-xs text-slate-500">Formato: Standard</span>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="number"
            min="0"
            max="1440"
            value={minutos}
            onChange={(e) => handleStandardChange(parseInt(e.target.value) || 0)}
            className="input-base"
            placeholder="0"
          />
          <p className="text-xs text-slate-500 mt-1">Minutos trabajados</p>
        </div>

        <div className="w-32">
          <div className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-center">
            <span className="text-lg font-bold text-slate-900 data-number">
              {value.toFixed(2)}h
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 text-center">Total horas</p>
        </div>
      </div>

      {/* Quick select */}
      <div className="mt-3">
        <p className="text-xs text-slate-500 mb-2">Selección rápida:</p>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 45, 60, 90, 120].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleStandardChange(mins)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                minutos === mins
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>

      {/* Selector de modo */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setModo('cuartiles')}
          className="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          Cambiar a formato cuartiles
        </button>
      </div>
    </div>
  );
}
