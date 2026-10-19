type PageHeaderProps = { title: string; subtitle?: string }
export default function PageHeader({ title, subtitle}: PageHeaderProps){
    return(
        <header className="border-b border-border bg-surface px-6 py-5 md:px-10">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </header>
    )
}