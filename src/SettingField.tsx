import { TrashIcon } from 'lucide-react';

import { Switch } from '@/components/ui/switch.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

type BaseConfig = {
  title: string;
  description?: string;
};

type BooleanConfig = BaseConfig & {
  kind: 'boolean';
  default: boolean;
};

type NumberConfig = BaseConfig & {
  kind: 'number';
  default: number;
  min?: number; // Minimum value
  max?: number; // Maximum value
  int?: boolean; // Strictly integer?
};

type StringConfig = BaseConfig & {
  kind: 'string';
  default: string;
  required: boolean; // Can the value be an empty string
};

type PrimitiveConfig = BooleanConfig | NumberConfig | StringConfig;

type ObjectConfig = BaseConfig & {
  kind: 'object';
  properties: {
    [key: string]: PrimitiveConfig;
  }
};

type ArrayConfig = BaseConfig & {
  kind: 'array';
  element: PrimitiveConfig;
  min?: number;  // Min elements - defaults to 0
  max?: number;  // max elements
};

export type Config = PrimitiveConfig | ObjectConfig | ArrayConfig;

type InferPrimitive<C extends PrimitiveConfig> =
  C extends BooleanConfig ? boolean :
    C extends NumberConfig ? number :
      C extends StringConfig ? string :
        never;

type InferObject<P extends ObjectConfig> = {
  [K in keyof P['properties']]: InferPrimitive<P['properties'][K]>
};

type InferArray<C extends ArrayConfig> = InferPrimitive<C['element']>[];

export type InferConfigType<C extends Config> =
  C extends ObjectConfig ? InferObject<C> :
    C extends ArrayConfig ? InferArray<C> :
      C extends PrimitiveConfig ? InferPrimitive<C> :
        never;

function narrowProps<K extends Config["kind"]>(props: SettingFormProps<Config>, kind: K): props is SettingFormProps<Extract<Config, { kind: K }>> {
  return props.config.kind === kind;
}

type SettingFormProps<C extends Config> = {
  config: C;
  value: InferConfigType<C> | undefined;
  onChange: (newValue: InferConfigType<C>) => void;
};

type SettingFieldProps<C extends Config> = {
  setting: SettingFormProps<C>;
  field: Record<string, unknown>;
}

export default function SettingField<C extends Config>(props: SettingFieldProps<C>) {

  switch (true) {
    case narrowProps(props.setting, 'boolean'): {
      const { value, config, onChange } = props.setting as SettingFormProps<BooleanConfig>;

      return (
        <Switch {...props.field} checked={value ?? config.default} onCheckedChange={onChange} />
      );
    }
    case narrowProps(props.setting, 'string'): {
      const { value, config, onChange } = props.setting as SettingFormProps<StringConfig>;

      return (
        <Input
          {...props.field}
          placeholder={config.title}
          value={value}
          required={config.required}
          onChange={(evt) => onChange(evt.target.value)}
        />
      );
    }
    case narrowProps(props.setting, 'number'): {
      const { value, config, onChange } = props.setting as SettingFormProps<NumberConfig>;

      return (
        <Input
          {...props.field}
          type="number"
          placeholder={config.title}
          value={value}
          min={config.min}
          max={config.max}
          step={config.int ? 1 : 0.1}
          onChange={(evt) => onChange(Number(evt.target.value))}
        />
      );
    }
    case narrowProps(props.setting, 'array'): {
      const { value, config, onChange } = props.setting as SettingFormProps<ArrayConfig>;

      return (
        <div>
          {
            (value ?? [config.element.default ?? '']).map((el, idx, arr) => (
              <div className={`flex items-center${!idx ? '' : ' mt-4'}`}>
                <div className="flex-1">
                  <SettingField
                    setting={{
                      config: config.element,
                      value: el,
                      onChange: (val) => {
                        const clone = [...arr];
                        clone.splice(idx, 1, val);
                        onChange(clone);
                      },
                    }}
                    field={props.field}
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon" className="ml-4"
                  disabled={arr.length <= Math.max(1, config.min ?? 0)}
                  onClick={() => {
                    const clone = [...(value ?? [])];
                    clone.splice(idx, 1);
                    onChange(clone);
                  }}
                >
                  <TrashIcon />
                </Button>
              </div>
            ))
          }
          <Button
            type="button"
            className="mt-4"
            onClick={() => onChange([...(value ?? [config.element.default ?? '']), config.element.default])}
          >
            Add value
          </Button>
        </div>
      );
    }
    case narrowProps(props.setting, 'object'): {
      const { config, onChange, value } = props.setting as SettingFormProps<ObjectConfig>;

      return (
        <div>
          {
            Object.keys(config.properties).map((el, idx) => (
              <div key={el} className={idx > 0 ? 'mt-4' : ''}>
                <div className="text-sm">{el.charAt(0).toUpperCase() + el.substring(1).replaceAll('_', ' ')}</div>

                <SettingField
                  setting={{
                    config: config.properties[el],
                    value: value?.[el] ?? '',
                    onChange: (val) => {
                      onChange({
                        ...(value ?? {}),
                        [el]: val
                      });
                    },
                  }}
                  field={props.field}
                />
              </div>
            ))
          }
        </div>
      );
    }
    default: {
      throw 'Not supported option';
    }
  }
}
