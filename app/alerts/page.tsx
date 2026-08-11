import Link from 'next/link'
import { getActiveAlerts } from '@/app/actions/alerts'
import { formatDistanceToNow } from 'date-fns'
import AlertViewTracker from '@/components/alert-view-tracker'

export default async function AlertsPage() {
  const alerts = await getActiveAlerts()
  
  // Calculate stats
  const criticalCount = alerts.filter((a: any) => a.severity === 'critical').length
  const warningCount = alerts.filter((a: any) => a.severity === 'warning').length
  const infoCount = alerts.filter((a: any) => a.severity === 'info').length

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-error'
      case 'warning': return 'border-orange-500'
      default: return 'border-primary'
    }
  }
  
  const getBadgeStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-error/10 text-error border-error/20'
      case 'warning': return 'bg-orange-50 text-orange-600 border-orange-200'
      default: return 'bg-primary/10 text-primary border-primary/20'
    }
  }
  
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'gpp_bad'
      case 'warning': return 'warning'
      default: return 'info'
    }
  }

  const getAgencyInfo = (alert: any) => {
    // In a real app, this would be based on the author's civic agency profile.
    // We will use standard icons based on severity for the design.
    if (alert.severity === 'critical') {
      return { icon: 'local_police', name: 'Metro\nPolice', bg: 'bg-blue-100', text: 'text-blue-900' }
    } else if (alert.severity === 'warning') {
      return { icon: 'electric_bolt', name: 'City\nPower', bg: 'bg-orange-100', text: 'text-orange-600' }
    } else {
      return { icon: 'account_balance', name: 'City\nCouncil', bg: 'bg-green-100', text: 'text-green-700' }
    }
  }

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto gap-lg pb-xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-xl">
        <div className="flex flex-col">
          <div className="flex items-center gap-xs text-error text-caption font-bold tracking-widest uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
            LIVE DASHBOARD
          </div>
          <h1 className="text-display font-display text-on-surface mb-xs">Urgent Alerts</h1>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            Critical notifications and safety updates for the LocalCircle district. Maintained by verified civic agencies and emergency responders.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-sm mt-md md:mt-0">
          <div className="flex bg-surface-container-low rounded-xl border border-outline-variant p-sm shadow-sm">
            <div className="flex flex-col items-center px-lg border-r border-outline-variant">
              <span className="text-headline-lg font-display text-error leading-none">{criticalCount}</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1 tracking-wider">Critical</span>
            </div>
            <div className="flex flex-col items-center px-lg border-r border-outline-variant">
              <span className="text-headline-lg font-display text-orange-500 leading-none">{warningCount}</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1 tracking-wider">Warning</span>
            </div>
            <div className="flex flex-col items-center px-lg">
              <span className="text-headline-lg font-display text-primary leading-none">{infoCount}</span>
              <span className="text-[10px] uppercase font-bold text-on-surface-variant mt-1 tracking-wider">Info</span>
            </div>
          </div>
          <Link href="/alerts/new" className="bg-error text-white w-full md:w-auto px-lg py-2.5 rounded-lg text-label-md font-label-md hover:bg-error/90 transition-colors shadow flex items-center justify-center gap-sm">
            <span className="material-symbols-outlined text-[18px]">campaign</span> Report Incident
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-lg">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl">
            <p className="text-headline-md font-headline-md text-on-surface mb-xs">No active alerts</p>
            <p className="font-body-md">Your neighborhood is currently safe and quiet.</p>
          </div>
        ) : (
          alerts.map((alert: any) => {
            const agency = getAgencyInfo(alert)
            return (
              <div key={alert.id} className={`bg-white rounded-xl border-l-[6px] ${getBorderColor(alert.severity)} shadow-sm p-xl flex gap-lg relative`}>
                
                {/* Agency Avatar */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm relative ${agency.bg} ${agency.text}`}>
                    <span className="material-symbols-outlined text-[24px]" style={{fontVariationSettings: "'FILL' 1"}}>{agency.icon}</span>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                      <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant mt-2 text-center uppercase tracking-wider whitespace-pre-line">
                    {agency.name}
                  </span>
                </div>
                
                {/* Alert Content */}
                <div className="flex flex-col w-full">
                  <div className="flex flex-wrap items-center gap-sm mb-md">
                    <span className={`${getBadgeStyle(alert.severity)} px-sm py-[2px] rounded text-[11px] font-bold flex items-center gap-xs uppercase tracking-wider border`}>
                      <span className="material-symbols-outlined text-[14px]">{getIcon(alert.severity)}</span> {alert.severity}
                    </span>
                    <span className="text-caption font-body-md text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">schedule</span> {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                    <span className="text-caption font-body-md text-on-surface-variant">• Author: {alert.author.full_name}</span>
                  </div>
                  
                  <h2 className="text-[24px] font-headline-md text-on-surface mb-sm">{alert.title}</h2>
                  <p className="text-body-md text-on-surface/80 mb-lg whitespace-pre-wrap">{alert.description}</p>

                  <div className="flex items-center justify-between pt-md border-t border-outline-variant/30 text-caption font-label-md text-on-surface-variant flex-wrap gap-sm">
                    <div className="flex items-center gap-xl">
                      <button className="flex items-center gap-xs hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[16px]">share</span> Share with Household
                      </button>
                      <button className="flex items-center gap-xs hover:text-on-surface transition-colors">
                        <span className="material-symbols-outlined text-[16px]">notifications_off</span> Mute Alert
                      </button>
                    </div>
                    {/* Genuine Live View Count */}
                    <AlertViewTracker alertId={alert.id} initialViewCount={alert.view_count || 0} />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
