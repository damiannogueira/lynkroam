import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ShadcnDialogDemo() {
  return (
    <article className="flex min-w-0 flex-col gap-6 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div>
        <p className="section-label">shadcn component 01</p>
        <h3 className="text-2xl font-semibold tracking-tight">Dialog</h3>
        <p className="mt-3 leading-7 text-muted-foreground">
          Radix manages the modal interaction while the generated shadcn
          wrappers provide composition and presentation.
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-l-primary bg-muted p-4">
        <h4 className="font-semibold">Keyboard review</h4>
        <p className="mt-2 leading-7 text-muted-foreground">
          Open the dialog and confirm focus moves inside. Use <kbd>Tab</kbd> and
          <kbd>Shift + Tab</kbd> to confirm focus stays contained, then press
          <kbd>Escape</kbd> and verify focus returns to the trigger.
        </p>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="self-start">Open shadcn dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Radix dialog behavior</DialogTitle>
            <DialogDescription>
              Check the generated wrapper’s focus lifecycle and accessible
              labeling without custom dialog event handling.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <a
              className="font-medium text-primary underline underline-offset-4"
              href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/"
            >
              Review the WAI-ARIA Modal Dialog Pattern
            </a>
            <label className="flex items-start gap-3 leading-6">
              <input className="mt-1 size-4" type="checkbox" />
              I verified the dialog’s keyboard focus order
            </label>
            <Button type="button" variant="outline">
              Secondary review action
            </Button>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">Finish review</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}
