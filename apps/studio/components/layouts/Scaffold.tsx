import React from 'react'
import { useAppStateSnapshot } from 'state/app-state'
import { cn } from 'ui'

export const MAX_WIDTH_CLASSES = 'mx-auto w-full max-w-[1200px]'
export const PADDING_CLASSES = 'px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28'
export const MAX_WIDTH_CLASSES_COLUMN = 'min-w-[420px]'

const ScaffoldHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        {...props}
        ref={ref}
        className={cn('w-full', 'flex-col gap-3 py-6', className)}
      ></header>
    )
  }
)

const ScaffoldTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return <h1 ref={ref} {...props} className={cn('text-2xl', className)} />
})

const ScaffoldDescription = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return <span ref={ref} {...props} className={cn('text-sm text-foreground-light', className)} />
})

const ScaffoldContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { bottomPadding?: boolean }
>(({ className, bottomPadding, ...props }, ref) => {
  const { aiAssistantPanel } = useAppStateSnapshot()
  const { open } = aiAssistantPanel
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        MAX_WIDTH_CLASSES,
        PADDING_CLASSES,
        bottomPadding && 'pb-16',
        open ? 'xl:px-6' : '',
        className
      )}
    />
  )
})

const ScaffoldDivider = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} {...props} className={cn('w-full h-px bg-border', className)} />
  }
)

interface ScaffoldSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  isFullWidth?: boolean
  topPadding?: boolean
}

const ScaffoldSection = React.forwardRef<HTMLDivElement, ScaffoldSectionProps>(
  ({ className, isFullWidth, topPadding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn(
          'flex flex-col first:pt-12 py-6',
          isFullWidth ? 'w-full' : 'gap-3 lg:grid md:grid-cols-12',
          className
        )}
      />
    )
  }
)

const ScaffoldColumn = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        {...props}
        className={cn('flex flex-col gap-3', MAX_WIDTH_CLASSES_COLUMN, className)}
      />
    )
  }
)

const ScaffoldSectionDetail = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, title, ...props }, ref) => {
  return (
    <div ref={ref} {...props} className={cn('col-span-4 xl:col-span-5 prose text-sm', className)}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  )
})

const ScaffoldSectionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn('col-span-8 xl:col-span-7', 'flex flex-col gap-6', className)}
    />
  )
})

// Table and filters
const ScaffoldFilterAndContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} {...props} className={cn('flex flex-col gap-3 items-center', className)} />
})

// Actions Group
const ScaffoldActionsContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} {...props} className={cn('flex w-full items-center', className)} />
})

// Actions Group
const ScaffoldActionsGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} {...props} className={cn('flex flex-row gap-3', className)} />
  }
)

// For older layouts
const ScaffoldContainerLegacy = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(MAX_WIDTH_CLASSES, PADDING_CLASSES, 'my-8 flex flex-col gap-8', className)}
    />
  )
})

const ScaffoldSectionTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return <h3 ref={ref} {...props} className={cn('text-foreground text-xl', className)} />
})

const ScaffoldSectionDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return <p ref={ref} {...props} className={cn('text-sm text-foreground-light', className)} />
})

ScaffoldHeader.displayName = 'ScaffoldHeader'
ScaffoldTitle.displayName = 'ScaffoldTitle'
ScaffoldDescription.displayName = 'ScaffoldDescription'
ScaffoldContainer.displayName = 'ScaffoldContainer'
ScaffoldDivider.displayName = 'ScaffoldDivider'
ScaffoldSection.displayName = 'ScaffoldSection'
ScaffoldColumn.displayName = 'ScaffoldColumn'
ScaffoldSectionDetail.displayName = 'ScaffoldSectionDetail'
ScaffoldSectionContent.displayName = 'ScaffoldSectionContent'
ScaffoldFilterAndContent.displayName = 'ScaffoldFilterAndContent'
ScaffoldActionsContainer.displayName = 'ScaffoldActionsContainer'
ScaffoldActionsGroup.displayName = 'ScaffoldActionsGroup'
ScaffoldContainerLegacy.displayName = 'ScaffoldContainerLegacy'
ScaffoldSectionTitle.displayName = 'ScaffoldSectionTitle'
ScaffoldSectionDescription.displayName = 'ScaffoldSectionDescription'

export {
  ScaffoldHeader,
  ScaffoldTitle,
  ScaffoldDescription,
  ScaffoldContainer,
  ScaffoldDivider,
  ScaffoldSection,
  ScaffoldColumn,
  ScaffoldSectionDetail,
  ScaffoldSectionContent,
  ScaffoldSectionTitle,
  ScaffoldSectionDescription,
  ScaffoldFilterAndContent,
  ScaffoldActionsContainer,
  ScaffoldActionsGroup,
  ScaffoldContainerLegacy,
}
