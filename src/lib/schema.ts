
export interface BaseParamSchema {
    id: string;
    label: string;
    type: string;
    showIf?: (params: Record<string, any>) => boolean;
}

export interface RangeParamSchema extends BaseParamSchema {
    type: 'range';
    min?: number;
    max?: number;
    step?: number;
    default: number;
    unit?: string;
}

export interface CheckboxParamSchema extends BaseParamSchema {
    type: 'checkbox';
    default: boolean;
}

export type ParamSchema = RangeParamSchema | CheckboxParamSchema;
