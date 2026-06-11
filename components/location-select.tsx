import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { sendRequest } from '@/lib/api';
import type { District, Division, Upazila } from '@/types/district';
import * as React from 'react';
import { View } from 'react-native';

type Props = {
  divisionId: string;
  districtId: string;
  upazillaId: string;
  onDivisionChange: (id: string) => void;
  onDistrictChange: (id: string) => void;
  onUpazillaChange: (id: string) => void;
};

export function LocationSelect({
  divisionId,
  districtId,
  upazillaId,
  onDivisionChange,
  onDistrictChange,
  onUpazillaChange,
}: Props) {
  const [divisions, setDivisions] = React.useState<Division[]>([]);
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [upazilas, setUpazilas] = React.useState<Upazila[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    sendRequest('/api/locations/divisions', 'GET')
      .then((res) => setDivisions(res.data))
      .catch(() => setError('Failed to load divisions'));
  }, []);

  React.useEffect(() => {
    if (!divisionId) {
      setDistricts([]);
      return;
    }
    sendRequest(`/api/locations/districts?divisionId=${divisionId}`, 'GET')
      .then((res) => setDistricts(res.data))
      .catch(() => setError('Failed to load districts'));
  }, [divisionId]);

  React.useEffect(() => {
    if (!districtId) {
      setUpazilas([]);
      return;
    }
    sendRequest(`/api/locations/upazilas?districtId=${districtId}`, 'GET')
      .then((res) => setUpazilas(res.data))
      .catch(() => setError('Failed to load upazilas'));
  }, [districtId]);

  if (error) {
    return <Text className="text-destructive text-[13px]">{error}</Text>;
  }

  const divisionLabel = divisions.find((d) => d.id.toString() === divisionId)?.nameEn;
  const districtLabel = districts.find((d) => d.id.toString() === districtId)?.nameEn;
  const upazillaLabel = upazilas.find((u) => u.id.toString() === upazillaId)?.nameEn;

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <Label>Division</Label>
        <Select
          value={divisionId ? { value: divisionId, label: divisionLabel ?? divisionId } : undefined}
          onValueChange={(opt) => {
            onDivisionChange(opt?.value ?? '');
            onDistrictChange('');
            onUpazillaChange('');
          }}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select division" />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectGroup>
              {divisions.map((div) => (
                <SelectItem key={div.id} value={div.id.toString()} label={div.nameEn}>
                  {div.nameEn}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>

      <View className="gap-1.5">
        <Label>District</Label>
        <Select
          value={districtId ? { value: districtId, label: districtLabel ?? districtId } : undefined}
          onValueChange={(opt) => {
            onDistrictChange(opt?.value ?? '');
            onUpazillaChange('');
          }}>
          <SelectTrigger className="w-full h-12" disabled={!divisionId}>
            <SelectValue
              placeholder={divisionId ? 'Select district' : 'Select division first'}
            />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectGroup>
              {districts.map((dist) => (
                <SelectItem key={dist.id} value={dist.id.toString()} label={dist.nameEn}>
                  {dist.nameEn}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>

      <View className="gap-1.5">
        <Label>Upazila</Label>
        <Select
          value={upazillaId ? { value: upazillaId, label: upazillaLabel ?? upazillaId } : undefined}
          onValueChange={(opt) => onUpazillaChange(opt?.value ?? '')}>
          <SelectTrigger className="w-full h-12" disabled={!districtId}>
            <SelectValue
              placeholder={districtId ? 'Select upazila' : 'Select district first'}
            />
          </SelectTrigger>
          <SelectContent className="w-full">
            <SelectGroup>
              {upazilas.map((upa) => (
                <SelectItem key={upa.id} value={upa.id.toString()} label={upa.nameEn}>
                  {upa.nameEn}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </View>
    </View>
  );
}
