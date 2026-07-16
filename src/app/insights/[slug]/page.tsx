import AppLayout from "../../components/layout/AppLayout";
import { Suspense } from "react";
import InsightDetails from "../../components/insights/InsightDetails";
import { UniversityDataProvider } from "../../components/data/UniversityDataProvider";
import { ToastProvider } from "../../components/feedback/ToastContext";
import { SidebarProvider } from "../../components/navigation/SidebarContext";
import { INSIGHTS, getInsightBySlug } from "../../data/insights";

export function generateStaticParams() {
  return INSIGHTS.map(({ slug }) => ({ slug }));
}

export default async function InsightDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-400">Loading insight…</div>}>
      <SidebarProvider>
        <ToastProvider>
          <UniversityDataProvider>
            <AppLayout>
              <InsightDetails slug={slug} initialInsight={insight} />
            </AppLayout>
          </UniversityDataProvider>
        </ToastProvider>
      </SidebarProvider>
    </Suspense>
  );
}
