import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@rn-primitives/label';
import * as React from 'react';

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Text>) {
  return (
    <LabelPrimitive.Text
      className={cn('text-foreground text-[13px] font-semibold leading-none', className)}
      {...props}
    />
  );
}

export { Label };
