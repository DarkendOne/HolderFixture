import React from 'react';
import { ParamSchema, RangeParamSchema, CheckboxParamSchema } from '../lib/schema';

interface ParameterControlProps {
  parameter: ParamSchema;
  value: any;
  onChange: (id: string, value: any) => void;
  allParams: Record<string, any>;
}

export const ParameterControl: React.FC<ParameterControlProps> = ({
  parameter,
  value,
  onChange,
  allParams,
}) => {
  // Check conditional visibility
  if (parameter.showIf && !parameter.showIf(allParams)) {
    return null;
  }

  if (parameter.type === 'range') {
    const rangeParam = parameter as RangeParamSchema;
    const min = rangeParam.min ?? 0;
    const max = rangeParam.max ?? 100;
    const step = rangeParam.step ?? 1;
    const decimals = (step && step % 1 !== 0) ? 1 : 0;
    const displayValue = typeof value === 'number'
      ? value.toFixed(decimals) + (rangeParam.unit ? ` ${rangeParam.unit}` : '')
      : String(value ?? rangeParam.default);

    return (
      <div className="input-group" id={`group-${parameter.id}`}>
        <div className="input-header">
          <label htmlFor={`input-${parameter.id}`}>{parameter.label}</label>
          <span className="value-display" id={`val-${parameter.id}`}>
            {displayValue}
          </span>
        </div>
        <input
          type="range"
          id={`input-${parameter.id}`}
          min={min}
          max={max}
          step={step}
          value={value ?? rangeParam.default}
          onChange={(e) => onChange(parameter.id, parseFloat(e.target.value))}
        />
      </div>
    );
  }

  if (parameter.type === 'checkbox') {
    const checkboxParam = parameter as CheckboxParamSchema;
    return (
      <div className="input-group-checkbox" id={`group-${parameter.id}`}>
        <input
          type="checkbox"
          id={`input-${parameter.id}`}
          checked={Boolean(value ?? checkboxParam.default)}
          onChange={(e) => onChange(parameter.id, e.target.checked)}
        />
        <label htmlFor={`input-${parameter.id}`}>{parameter.label}</label>
      </div>
    );
  }

  return null;
};
