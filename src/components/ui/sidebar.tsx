import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { MessageCircle, Plus, PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// DeepSeek AI Sidebar Styles - Inicio
const sidebarMenuButtonVariants = cva(
  "group/menu-button relative flex w-full min-w-0 items-center gap-2 rounded-md px-2.5 py-2 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        ghost:
          "text-sidebar-foreground hover:bg-transparent hover:underline data-[active=true]:bg-transparent data-[active=true]:text-sidebar-foreground data-[active=true]:underline",
        outline:
          "border border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
      },
      size: {
        sm: "h-8 text-xs",
        default: "h-9 text-sm",
        lg: "h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Componente de barra lateral estilo DeepSeek
const AgentSidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-60 h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="text-xl font-semibold text-gray-300">deepseek</div>
        <Button
          className="w-8 h-8 p-0 rounded-md bg-indigo-600 hover:bg-indigo-700"
          size="icon"
          variant="outline"
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <div className="p-3">
        <Button
          className="w-full justify-start gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-sm font-medium"
        >
          <MessageCircle size={16} />
          <span>New chat</span>
        </Button>
      </div>
      
      <div className="px-3 py-2 text-xs text-gray-500 font-medium">
        Today
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 px-2">
          {children}
        </div>
      </div>
    </div>
  )
}

// Estilo de Item de Conversa
const AgentSidebarChatItem = ({ 
  title, 
  isActive,
  onClick,
}: { 
  title: string
  isActive?: boolean
  onClick?: () => void
}) => {
  return (
    <button
      className={cn(
        "flex w-full items-start rounded-md px-3 py-2 text-sm text-left transition-colors",
        isActive 
          ? "bg-gray-800 text-white" 
          : "text-gray-300 hover:bg-gray-800/50"
      )}
      onClick={onClick}
    >
      <span className="line-clamp-1">{title}</span>
    </button>
  )
}

// Componentes exportados
export {
  SidebarProvider,
  useSidebar,
  AgentSidebar,
  AgentSidebarChatItem,
}
