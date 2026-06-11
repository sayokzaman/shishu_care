import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

const MONTHS = [
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const currentYear = new Date().getFullYear();
// Birth years: current year - 14 down to current year - 74
const YEARS = Array.from({ length: 60 }, (_, i) => currentYear - 14 - i).map((y) => ({
  label: y.toString(),
  value: y.toString(),
}));

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const [pendingYear, setPendingYear] = React.useState(
    value ? value.getFullYear().toString() : ''
  );
  const [pendingMonth, setPendingMonth] = React.useState(
    value ? (value.getMonth() + 1).toString() : ''
  );
  const [pendingDay, setPendingDay] = React.useState(
    value ? value.getDate().toString() : ''
  );

  const maxDays =
    pendingYear && pendingMonth
      ? daysInMonth(parseInt(pendingMonth), parseInt(pendingYear))
      : 31;

  const days = Array.from({ length: maxDays }, (_, i) => ({
    label: (i + 1).toString(),
    value: (i + 1).toString(),
  }));

  const displayText = value
    ? value.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  function handleOpen(isOpen: boolean) {
    if (isOpen) {
      // Sync pending state to current value when opening
      setPendingYear(value ? value.getFullYear().toString() : '');
      setPendingMonth(value ? (value.getMonth() + 1).toString() : '');
      setPendingDay(value ? value.getDate().toString() : '');
    }
    setOpen(isOpen);
  }

  function handleConfirm() {
    if (pendingYear && pendingMonth && pendingDay) {
      const y = parseInt(pendingYear);
      const m = parseInt(pendingMonth);
      const maxD = daysInMonth(m, y);
      const d = Math.min(parseInt(pendingDay), maxD);
      onChange(new Date(y, m - 1, d));
    }
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  const canConfirm = !!pendingYear && !!pendingMonth && !!pendingDay;

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Pressable
          className={cn(
            'border-brand-input-border bg-brand-input-bg flex-row h-14 items-center gap-3 rounded-2xl border px-4',
            className
          )}>
          <Icon as={Calendar} size={16} className="text-muted-foreground" />
          <Text
            className={cn(
              'flex-1 text-[15px]',
              displayText ? 'text-foreground' : 'text-muted-foreground/50'
            )}>
            {displayText ?? placeholder}
          </Text>
        </Pressable>
      </DialogTrigger>

      <DialogContent showClose={false}>
        <DialogHeader>
          <DialogTitle>Date of Birth</DialogTitle>
        </DialogHeader>

        <View className="gap-3">
          <View className="gap-1.5">
            <Text className="text-foreground text-[13px] font-semibold">Year</Text>
            <Select
              value={pendingYear ? { value: pendingYear, label: pendingYear } : undefined}
              onValueChange={(opt) => setPendingYear(opt?.value ?? '')}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectGroup>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value} label={y.label}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>

          <View className="gap-1.5">
            <Text className="text-foreground text-[13px] font-semibold">Month</Text>
            <Select
              value={
                pendingMonth
                  ? { value: pendingMonth, label: MONTHS[parseInt(pendingMonth) - 1].label }
                  : undefined
              }
              onValueChange={(opt) => {
                setPendingMonth(opt?.value ?? '');
                setPendingDay('');
              }}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectGroup>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value} label={m.label}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>

          <View className="gap-1.5">
            <Text className="text-foreground text-[13px] font-semibold">Day</Text>
            <Select
              value={pendingDay ? { value: pendingDay, label: pendingDay } : undefined}
              onValueChange={(opt) => setPendingDay(opt?.value ?? '')}>
              <SelectTrigger className="h-12 w-full">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <SelectGroup>
                  {days.map((d) => (
                    <SelectItem key={d.value} value={d.value} label={d.label}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        </View>

        <DialogFooter>
          <Button variant="outline" onPress={handleCancel} className="flex-1">
            <Text>Cancel</Text>
          </Button>
          <Button onPress={handleConfirm} disabled={!canConfirm} className="flex-1">
            <Text>Done</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
