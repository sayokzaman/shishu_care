import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import { Division } from '@/types/district';
import React from 'react';

type Props = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const DivisionSelect = ({ value, onValueChange }: Props) => {
  const [divisions, setDivisions] = React.useState<Division[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    sendRequest('/api/locations/divisions', 'GET')
      .then((res) => setDivisions(res.data))
      .catch(() => setError('Failed to load divisions'));
  }, []);

  if (error) {
    return <Text className="text-[13px] text-destructive">{error}</Text>;
  }

  return (
    <Select value={value ? { value, label: value } : undefined} onValueChange={(opt) => onValueChange?.(opt?.value ?? '')}>
      <SelectTrigger className="w-full h-12 web:h-12 text-muted-foreground">
        <SelectValue placeholder="Select a division" />
      </SelectTrigger>
      <SelectContent className="w-full">
        <SelectGroup>
          <SelectLabel>Divisions</SelectLabel>
          {divisions.map((div) => (
            <SelectItem key={div.id} value={div.id.toString()} label={div.nameEn}>
              {div.nameEn}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default DivisionSelect;
