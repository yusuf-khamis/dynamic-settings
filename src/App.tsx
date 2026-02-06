import { nanoid } from 'nanoid/non-secure';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCallback } from 'react';

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import SettingField, { type Config } from '@/SettingField.tsx';
import { Button } from '@/components/ui/button.tsx';


const settingsObjects: (Config & {id: string})[] = [
  {
    id: nanoid(5),
    kind: 'string',
    default: 'Welcome to App',
    title: 'Welcome message',
    description: 'Welcome message displayed to users upon sign up',
    required: true,
  },
  {
    id: nanoid(5),
    kind: 'string',
    default: '',
    title: 'Secondary message',
    description: 'Secondary message displayed to users upon sign up',
    required: false,
  },
  {
    id: nanoid(5),
    kind: 'boolean',
    default: false,
    title: 'Compulsory MFA',
    description: 'Make MFA compulsory to all users',
  },
  {
    id: nanoid(5),
    kind: 'array',
    min: 2,
    max: 5,
    title: 'Color themes',
    description: 'Available app color themes',
    element: {
      kind: 'string',
      default: 'blue',
      title: 'Color theme',
      description: 'Color theme',
      required: true,
    },
  },
  {
    id: nanoid(5),
    kind: 'number',
    min: 1,
    max: 2,
    int: true,
    title: 'Allowable phone numbers',
    description: 'Phone numbers allowable per user',
    default: 1,
  },
  {
    id: nanoid(5),
    kind: 'number',
    min: 10,
    max: 60,
    int: false,
    title: 'User age' ,
    description: 'User age with decimal refering to number of months',
    default: 1,
  },
  {
    id: nanoid(5),
    kind: 'object',
    title: 'User settings',
    description: 'Custom user settings for account personalization',
    properties: {
      allow_notification: {
        kind: 'boolean',
        default: false,
        title: 'Allow notification',
        description: 'Whether user should allow notifications for app updates',
      },
      notification_times: {
        kind: 'string',
        default: '',
        title: 'Notification times',
        description: 'Times in day user can receive notifications',
        required: false,
      },
      notifications_count: {
        kind: 'number',
        min: 0,
        max: 5,
        int: true,
        title: 'Notification count',
        description: 'Notification count per day to be received',
        default: 2,
      },
    },
  },
];

export default function App() {
  const {
    handleSubmit,
    control,
  } = useForm({
    values: settingsObjects.reduce((acc, el) => {
      let val = (el as any).default;

      if (el.kind === 'array') {
        val = Array(Math.max(el.min ?? 0, 1)).fill(el.element.default ?? '')
      }

      return {
        ...acc,
        [el.title]: val,
      };
    }, {})
  });

  const submitForm = useCallback((values: any) => {
    console.log(values);
    toast.info('Settings have been successfully updated!');
  }, []);

  return (
    <div className="min-h-screen py-12 flex items-center justify-center bg-slate-200">
      <div className="max-w-full w-xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/vite.svg" alt="logo" className="w-24 mb-4" />

          <h3 className="text-3xl font-weight-700">Settings</h3>
          <p className="">Update platform settings</p>
        </div>

        <Card className="w-full">
          <CardContent>
            <form onSubmit={handleSubmit(submitForm)}>
              <FieldGroup>
                {
                  settingsObjects.map((obj => (
                    <Controller
                      key={obj.id}
                      name={obj.title as never}
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel>{obj.title}</FieldLabel>
                          <SettingField
                            setting={{
                              config: obj,
                              value: field.value,
                              onChange: field.onChange,
                            }}
                            field={field}
                          />
                          {
                            obj.description && (
                              <FieldDescription>{obj.description}</FieldDescription>
                            )
                          }
                        </Field>
                      )}
                    />
                  )))
                }
              </FieldGroup>

              <div className="mt-8">
                <Button className="w-full" type="submit">Submit</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-sm mt-4 text-gray-500 text-center font-light">&copy; 2026 All rights reserved!</p>
      </div>
    </div>
  );
}
