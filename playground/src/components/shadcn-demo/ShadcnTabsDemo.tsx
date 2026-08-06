import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export function ShadcnTabsDemo() {
  return (
    <article className="flex min-w-0 flex-col gap-6 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
      <div>
        <p className="section-label">shadcn component 02</p>
        <h3 className="text-2xl font-semibold tracking-tight">Tabs</h3>
        <p className="mt-3 leading-7 text-muted-foreground">
          Radix supplies the tab relationships, roving focus, and automatic
          keyboard activation behind the generated wrappers.
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-l-primary bg-muted p-4">
        <h4 className="font-semibold">Keyboard review</h4>
        <p className="mt-2 leading-7 text-muted-foreground">
          Use <kbd>Tab</kbd> to enter the tab list, then try
          <kbd>ArrowLeft</kbd>, <kbd>ArrowRight</kbd>, <kbd>Home</kbd>, and
          <kbd>End</kbd>. Press <kbd>Tab</kbd> again to move from the active tab
          into focusable panel content.
        </p>
      </div>

      <Tabs defaultValue="semantics" orientation="horizontal">
        <TabsList aria-label="shadcn accessibility review topics">
          <TabsTrigger value="semantics">Semantics</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="activation">Activation</TabsTrigger>
        </TabsList>

        <TabsContent className="rounded-xl border p-4 leading-7" value="semantics">
          <h4 className="font-semibold">Relationships come from primitives</h4>
          <p className="mt-2 text-muted-foreground">
            Radix connects each trigger with its panel and communicates the
            selected state to assistive technology.
          </p>
          <a
            className="mt-4 inline-block font-medium text-primary underline underline-offset-4"
            href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/"
          >
            Review the WAI-ARIA Tabs Pattern
          </a>
        </TabsContent>

        <TabsContent className="rounded-xl border p-4 leading-7" value="focus">
          <h4 className="font-semibold">One tab stop enters the list</h4>
          <p className="mt-2 text-muted-foreground">
            Arrow keys move within the tab list while the next Tab press moves
            into the active panel’s interactive content.
          </p>
          <button
            className="mt-4 rounded-lg border bg-background px-3 py-2 font-medium"
            type="button"
          >
            Test panel focus
          </button>
        </TabsContent>

        <TabsContent className="rounded-xl border p-4 leading-7" value="activation">
          <h4 className="font-semibold">Selection follows focus</h4>
          <p className="mt-2 text-muted-foreground">
            This tab set uses Radix’s default automatic activation behavior for
            content that is available without noticeable delay.
          </p>
        </TabsContent>
      </Tabs>
    </article>
  )
}
