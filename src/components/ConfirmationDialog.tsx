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
  content?: JSX.Element;
  trigger: (props: object) => JSX.Element;
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
      <DialogTrigger as={props.trigger} />
      <DialogContent class="w-80">
        <DialogHeader>
          <h2 class="text-lg font-bold">{props.headingText ?? 'You sure?'}</h2>
        </DialogHeader>

        {props.content}

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
