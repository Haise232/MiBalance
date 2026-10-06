import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { ES_ANDROID, ES_IOS } from '@/constantes/plataforma';

import { aFechaISO, type SelectorFechaProps } from './SelectorFecha.utils';

export { aFechaISO } from './SelectorFecha.utils';
export type { SelectorFechaProps } from './SelectorFecha.utils';

export default function SelectorFecha({ value, onChange, onCerrar }: SelectorFechaProps) {
  return (
    <DateTimePicker
      value={new Date(value + 'T12:00:00')}
      mode="date"
      display={ES_IOS ? 'inline' : 'default'}
      onChange={(event, fecha) => {
        if (ES_ANDROID) onCerrar?.();
        if (event.type === 'set' && fecha) onChange(aFechaISO(fecha));
      }}
    />
  );
}
