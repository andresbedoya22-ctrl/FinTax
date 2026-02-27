"use client";

import { Activity, CheckCircle2, FileUp, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, Skeleton, Stepper, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import { useCase } from "@/hooks/useCase";
import { useChecklist } from "@/hooks/useChecklist";
import { cn } from "@/lib/cn";
import type { Document } from "@/types/database";

type TabKey = "overview" | "documents" | "authorization" | "activity";

export function CaseDetailView({ caseId }: { caseId: string }) {
  const t = useTranslations("CaseDetail");
  const caseQuery = useCase(caseId);
  const checklistQuery = useChecklist(caseId);
  const caseItem = caseQuery.data;
  const checklist = checklistQuery.data ?? [];
  const [tab, setTab] = React.useState<TabKey>("overview");
  const [machtigingCode, setMachtigingCode] = React.useState("");
  const [docs, setDocs] = React.useState<Document[]>([]);

  if (caseQuery.isLoading || checklistQuery.isLoading) {
    return (
      <Card>
        <CardBody className="space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </CardBody>
      </Card>
    );
  }

  if (!caseItem) {
    return (
      <Card>
        <CardBody className="text-sm text-secondary">
          {caseQuery.isError ? "Unable to load case details." : t("notFound")}
        </CardBody>
      </Card>
    );
  }
  const tabs: TabKey[] = ["overview", "documents", "authorization", "activity"];
  const completed = checklist.filter((x) => x.is_completed).length;
  const currentStep = mapCaseStatusToStep(caseItem.status);

  const onFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const nextDocs = Array.from(files)
      .filter((file) => file.size <= 10 * 1024 * 1024)
      .filter((file) => ["application/pdf", "image/jpeg", "image/png"].includes(file.type))
      .map<Document>((file, index) => ({
        id: `local-${Date.now()}-${index}`,
        case_id: caseId,
        user_id: caseItem.user_id,
        checklist_item_id: null,
        file_name: file.name,
        file_path: `local/${file.name}`,
        file_size: file.size,
        mime_type: file.type,
        status: "uploaded",
        review_notes: null,
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      }));
    setDocs((prev) => [...nextDocs, ...prev]);
  };

  const statusTone =
    caseItem.status === "pending_payment" || caseItem.status === "pending_documents"
      ? "amber"
      : caseItem.status === "completed"
        ? "green"
        : "copper";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="copper">{caseItem.case_type}</Badge>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  statusTone === "amber"
                    ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                    : statusTone === "green"
                      ? "border-green/25 bg-green/10 text-green"
                      : "border-copper/25 bg-copper/10 text-copper",
                )}
              >
                {caseItem.status}
              </span>
            </div>
            <h2 className="font-heading text-2xl font-semibold text-text">{caseItem.display_name ?? caseItem.id}</h2>
            <p className="mt-1 text-sm text-secondary">{t("status")}: {caseItem.status} · {t("deadline")}: {caseItem.deadline ?? "-"}</p>
          </div>
          <div className="w-full max-w-md">
            <Stepper
              steps={CASE_STEPPER_STEPS}
              currentStep={currentStep}
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs value={tab} defaultValue="overview" onValueChange={(value) => setTab(value as TabKey)}>
        <TabsList className="flex w-full flex-wrap justify-start" size="md">
          {tabs.map((tabKey) => (
            <TabsTrigger key={tabKey} value={tabKey}>
              {t(`tabs.${tabKey}`)}
            </TabsTrigger>
          ))}
        </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardBody className="grid gap-4 lg:grid-cols-3">
            <InfoTile label={t("overview.estimatedRefund")} value={caseItem.estimated_refund ? `EUR ${caseItem.estimated_refund}` : "-"} />
            <InfoTile label={t("overview.machtigingStatus")} value={caseItem.machtiging_status} />
            <InfoTile label={t("overview.progress")} value={`${completed}/${checklist.length}`} />
            <div className="lg:col-span-3 rounded-xl border border-border/35 bg-surface2/20 p-4">
              <p className="mb-2 text-sm font-medium text-text">{t("overview.timeline")}</p>
              <ul className="space-y-2 text-sm text-secondary">
                <li>{t("overview.timelineItems.intake")}</li>
                <li>{t("overview.timelineItems.review")}</li>
                <li>{t("overview.timelineItems.submission")}</li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold text-text">{t("documents.title")}</h3>
            <p className="text-sm text-secondary">{t("documents.supported")}</p>
          </CardHeader>
          <CardBody className="space-y-4">
            <label className="block rounded-xl border border-dashed border-border/40 bg-surface2/20 p-6 text-center text-sm text-secondary">
              <FileUp className="mx-auto mb-2 size-5 text-teal" />
              {t("documents.uploadCta")}
              <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => onFilesSelected(event.target.files)} />
            </label>
            {docs.length === 0 ? (
              <div className="space-y-2 rounded-xl border border-border/35 bg-surface2/15 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : null}
            <ul className="space-y-2">
              {docs.map((doc) => (
                <li key={doc.id} className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text">{doc.file_name}</span>
                    <span className="text-xs text-secondary">{doc.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{doc.mime_type ?? "unknown"} · {(((doc.file_size ?? 0) / 1024)).toFixed(0)} KB</p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </TabsContent>

      <TabsContent value="authorization">
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-2 text-text">
              <ShieldCheck className="size-4 text-green" />
              <h3 className="text-base font-semibold">{t("authorization.title")}</h3>
            </div>
            <p className="text-sm text-secondary">{t("authorization.copy")}</p>
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={machtigingCode}
                onChange={(event) => setMachtigingCode(event.target.value)}
                placeholder={t("authorization.placeholder")}
                className="h-11 rounded-xl border border-border/35 bg-surface2/20 px-3 text-sm text-text outline-none focus:border-copper/40"
              />
              <Button type="button">{t("authorization.submit")}</Button>
            </div>
          </CardBody>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center gap-2 text-text">
              <Activity className="size-4 text-teal" />
              <h3 className="text-base font-semibold">{t("activity.title")}</h3>
            </div>
            <ul className="space-y-3 text-sm text-secondary">
              <li className="rounded-xl border border-border/35 bg-surface2/20 p-3">{t("activity.items.created")}</li>
              <li className="rounded-xl border border-border/35 bg-surface2/20 p-3">{t("activity.items.payment")}</li>
              <li className="rounded-xl border border-border/35 bg-surface2/20 p-3">{t("activity.items.review")}</li>
              <li className="rounded-xl border border-border/35 bg-surface2/20 p-3">{t("activity.items.pending")}</li>
            </ul>
          </CardBody>
        </Card>
      </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-text">{t("checklist.title")}</h3>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {checklist.map((item, idx) => (
              <li key={item.id} className="flex items-center gap-3 rounded-xl border border-border/35 bg-surface2/20 px-4 py-3 text-sm">
                {item.is_completed ? <CheckCircle2 className="size-4 text-green" /> : <span className="inline-block h-2.5 w-2.5 rounded-full bg-white/30" />}
                <span className="text-secondary">{item.label}</span>
                <span className="ml-auto text-xs text-muted">{idx + 1}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/35 bg-surface2/20 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-text">{value}</p>
    </div>
  );
}

