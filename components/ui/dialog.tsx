import { cn } from '@/lib/utils';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { Icon } from '@/components/ui/icon';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn('z-50 flex-1 bg-black/60', className)}
      style={Platform.select({ native: StyleSheet.absoluteFill })}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  portalHost,
  showClose = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  portalHost?: string;
  showClose?: boolean;
}) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <NativeOnlyAnimatedView
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}>
          <DialogPrimitive.Content
            className={cn(
              'bg-background border-border relative w-full rounded-3xl border p-6 shadow-lg shadow-black/10',
              className
            )}
            {...props}>
            {showClose && (
              <DialogClose asChild>
                <Pressable
                  className="absolute right-4 top-4 rounded-full p-1 opacity-60 active:opacity-100"
                  hitSlop={8}>
                  <Icon as={X} size={18} className="text-foreground" />
                </Pressable>
              </DialogClose>
            )}
            {children}
          </DialogPrimitive.Content>
        </NativeOnlyAnimatedView>
      </DialogOverlay>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('mb-5 gap-1', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View className={cn('mt-5 flex-row items-center justify-end gap-3', className)} {...props} />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-foreground pr-6 text-[18px] font-bold leading-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
