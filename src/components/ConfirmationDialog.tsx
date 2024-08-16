import type { Component, JSX } from 'solid-js';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from './ui/dialog';

export interface ConfirmationDialogProps {
  open?: boolean;
  headingText?: string;
  cancelText?: string;
  confirmText: string;
  children?: JSX.Element;
  trigger?: JSX.Element;
  triggerClass?: JSX.HTMLAttributes<HTMLElement>['class'];
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
}

export const ConfirmationDialog: Component<ConfirmationDialogProps> = props => {
  return (
    <Dialog
      open={props.open}
      onOpenChange={open => open === false && props.onClose?.()}
    >
      <DialogTrigger class={props.triggerClass} as="span">
        {props.trigger}
      </DialogTrigger>
      <DialogContent class="w-80">
        <DialogHeader>
          <h2 class="text-lg font-bold">{props.headingText ?? 'You sure?'}</h2>
        </DialogHeader>

        {props.children}

        <DialogFooter>
          <DialogTrigger
            as={(p: object) => (
              <Button variant="secondary" {...p}>
                {props.cancelText ?? 'Cancel'}
              </Button>
            )}
            onClick={props.onCancel}
          />
          <DialogTrigger
            as={(p: object) => (
              <Button variant="destructive" {...p}>
                {props.confirmText}
              </Button>
            )}
            onClick={props.onConfirm}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
