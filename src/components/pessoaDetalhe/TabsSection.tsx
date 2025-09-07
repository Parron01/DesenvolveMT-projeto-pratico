// #region Imports
import { User, MapPin, Image as ImageIcon, Info as InfoIcon } from 'lucide-react'
// #endregion

// #region Tipos/Props
type TabId = 'pessoais' | 'local' | 'fotos' | 'informacoes'

interface Tab {
  id: TabId
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

interface TabsSectionProps {
  tab: TabId
  onTabChange: (tab: TabId) => void
  disabledTabs?: TabId[]
}
// #endregion

// #region Constants
const tabs: Tab[] = [
  { id: 'pessoais', label: 'Pessoais', Icon: User },
  { id: 'local', label: 'Local', Icon: MapPin },
  { id: 'fotos', label: 'Fotos', Icon: ImageIcon },
  { id: 'informacoes', label: 'Informações', Icon: InfoIcon },
]
// #endregion

export function TabsSection({ tab, onTabChange, disabledTabs = [] }: TabsSectionProps) {
  // #region Render
  return (
    <section>
      <div className="flex rounded-md overflow-hidden border border-neutral-200 bg-white">
        {tabs.map(({ id: tid, label, Icon }) => (
          <button
            key={tid}
            onClick={() => onTabChange(tid)}
            className={`flex-1 px-4 py-2 text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer ${
              tab === tid
                ? 'bg-neutral-100 text-neutral-900 border-b-2 border-brand-accent'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
            disabled={disabledTabs.includes(tid)}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </section>
  )
  // #endregion
}
