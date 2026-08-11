import Link from 'next/link'

export default function GroupsPage() {
  return (
    <div className="flex flex-col gap-lg w-full">
      <div className="flex items-center justify-between mb-md">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Private Groups</h1>
          <p className="text-body-md font-body-md text-on-surface-variant">Connect with neighbors who share your interests.</p>
        </div>
        <Link href="/groups/new" className="bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md font-label-md hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-xs">
          <span className="material-symbols-outlined">add</span> Create Group
        </Link>
      </div>

      <div className="text-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl">
        <p className="text-headline-md font-headline-md text-on-surface mb-xs">No groups joined</p>
        <p className="font-body-md">Discover local groups or start your own to connect with neighbors.</p>
      </div>
    </div>
  )
}
