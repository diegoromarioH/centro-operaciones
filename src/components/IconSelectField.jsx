import React from 'react';
import {
  Mountain, Utensils, Compass, Camera, Palmtree, Waves, Footprints, Bike,
  Music, Landmark, Flame, TreePine, Users, Sun, Fish, Tent,
} from 'lucide-react';

// Lista curada de íconos disponibles para representar una experiencia en la
// landing. Guarda el NOMBRE del ícono (texto) en la base de datos — los
// íconos de Lucide son componentes de código, no se pueden guardar como
// dato, así que este selector traduce "elegir un ícono" a "guardar su
// nombre", y la landing hace la traducción inversa al mostrarlo.
export const ICON_OPTIONS = [
  { name: 'Mountain', Icon: Mountain, label: 'Montaña / volcán' },
  { name: 'Flame', Icon: Flame, label: 'Volcán activo' },
  { name: 'Footprints', Icon: Footprints, label: 'Senderismo' },
  { name: 'Waves', Icon: Waves, label: 'Agua / kayak' },
  { name: 'Fish', Icon: Fish, label: 'Pesca' },
  { name: 'Palmtree', Icon: Palmtree, label: 'Playa / relax' },
  { name: 'TreePine', Icon: TreePine, label: 'Naturaleza / bosque' },
  { name: 'Utensils', Icon: Utensils, label: 'Gastronomía' },
  { name: 'Music', Icon: Music, label: 'Danza / música' },
  { name: 'Landmark', Icon: Landmark, label: 'Cultura / museos' },
  { name: 'Bike', Icon: Bike, label: 'Ciclismo' },
  { name: 'Users', Icon: Users, label: 'Comunidad / grupos' },
  { name: 'Camera', Icon: Camera, label: 'Fotografía' },
  { name: 'Sun', Icon: Sun, label: 'Día completo' },
  { name: 'Tent', Icon: Tent, label: 'Camping' },
  { name: 'Compass', Icon: Compass, label: 'General / tour' },
];

export default function IconSelectField({ value, onChange }) {
  return (
    <div className="ro-iconpicker">
      {ICON_OPTIONS.map(({ name, Icon, label }) => (
        <button
          type="button"
          key={name}
          className={'ro-iconpicker-item' + (value === name ? ' active' : '')}
          onClick={() => onChange(name)}
          title={label}
        >
          <Icon size={20} />
          <small>{label}</small>
        </button>
      ))}
    </div>
  );
}