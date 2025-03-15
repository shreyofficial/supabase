import SectionContainer from '~/components/Layouts/SectionContainer'
import { ReactNode } from 'react'
import { cn } from 'ui'

export const TicketLayout = ({ children }: { children: ReactNode }) => {
  return <SectionContainer className="font-mono grid gap-12">{children}</SectionContainer>
}

const TicketLayoutCanvasCorner = ({ className }: { className?: string }) => {
  return (
    <div className={cn('w-4 h-4 absolute', className)}>
      <div className="w-4 h-0.5 left-0 top-0 absolute bg-emerald-500 shadow-[0px_0px_4px_0px_rgba(44,244,148,0.25)]" />
      <div className="w-4 h-0.5 left-[16px] top-0 absolute origin-top-left rotate-90 bg-emerald-500 shadow-[0px_0px_4px_0px_rgba(44,244,148,0.25)]" />
    </div>
  )
}

export const TicketLayoutCanvas = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative w-full aspect-[1.5841584158]">
      <TicketLayoutCanvasCorner className="top-0 left-0 -rotate-90"></TicketLayoutCanvasCorner>
      <TicketLayoutCanvasCorner className="top-0 right-0"></TicketLayoutCanvasCorner>
      <TicketLayoutCanvasCorner className="bottom-0 left-0 rotate-180"></TicketLayoutCanvasCorner>
      <TicketLayoutCanvasCorner className="bottom-0 right-0 rotate-90"></TicketLayoutCanvasCorner>
      {children}
    </div>
  )
}
